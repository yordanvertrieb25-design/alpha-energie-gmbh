require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const os = require('os');
const firstconService = require('../services/firstconService');

const LOCAL_PORT = parseInt(process.env.FIRSTCON_PC_RELAY_PORT, 10) || 4055;
const REMOTE_BRIDGE_BASE = (process.env.ALPHA_REMOTE_BRIDGE_URL || 'https://alpha-energie.de').replace(/\/+$/, '');
const BRIDGE_SECRET = process.env.FIRSTCON_BRIDGE_SECRET || 'alpha-firstcon-pc-bridge-2026';
const HOSTNAME = os.hostname();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

let stats = {
    startedAt: new Date().toISOString(),
    hostname: HOSTNAME,
    localPort: LOCAL_PORT,
    remoteBridgeBase: REMOTE_BRIDGE_BASE,
    bridgeConnected: false,
    lastBridgePollAt: null,
    jobsExecuted: 0,
    lastJobAt: null,
    lastError: null
};

// 1. Local HTTP Endpoints on this PC (http://127.0.0.1:4055)
app.get(['/health', '/api/external/alpha-tarife/status'], (req, res) => {
    res.json({
        success: true,
        service: 'alpha-firstcon-pc-relay',
        firstconIpProtection: 'ACTIVE (Alle Firstcon-Anfragen laufen über die IP dieses PCs)',
        ...stats
    });
});

async function handleLocalTariffRequest(req, res) {
    try {
        const params = { ...(req.query || {}), ...(req.body || {}) };
        const data = await firstconService.executeExternalTariffLookup(params);
        stats.jobsExecuted += 1;
        stats.lastJobAt = new Date().toISOString();
        res.json(data);
    } catch (err) {
        stats.lastError = err.message;
        res.status(500).json({ success: false, error: err.message });
    }
}

app.all(['/api/external/alpha-tarife', '/api/external/tarife', '/api/tarife/calculate'], handleLocalTariffRequest);

app.post('/api/external/alpha-tarife/push', async (req, res) => {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const targetUrl = params.targetUrl || params.callbackUrl || params.webhookUrl || process.env.EXTERNAL_TARIFF_WEBHOOK_URL;
    if (!targetUrl || !/^https?:\/\//i.test(String(targetUrl))) {
        return res.status(400).json({
            success: false,
            error: 'Bitte targetUrl (z.B. https://externe-seite.de/api/alpha-tarife) angeben.'
        });
    }
    return handleLocalTariffRequest(req, res);
});

app.get('/api/firstcon/grid', async (req, res) => {
    try {
        const plz = req.query.plz || req.query.zip || '44379';
        const branch = req.query.branch || 'strom';
        const token = req.query.token;
        const gridInfo = await firstconService.findEnergyGrid(plz, branch, token);
        if (!gridInfo) {
            return res.json({ success: false, found: false, plz });
        }
        let streets = [];
        if (req.query.streets === '1' || req.query.streets === 'true') {
            streets = await firstconService.getStreets(gridInfo.zipCode, gridInfo.city, gridInfo.energyGridNumber, branch, token);
        }
        stats.jobsExecuted += 1;
        stats.lastJobAt = new Date().toISOString();
        res.json({
            success: true,
            found: true,
            executedByPc: HOSTNAME,
            ...gridInfo,
            streets
        });
    } catch (err) {
        res.status(200).json({ success: false, found: false, error: err.message });
    }
});

// 2. Execute a job received from the remote bridge (https://alpha-energie.de)
async function processBridgeJob(job) {
    if (!job || !job.jobId) return;
    const { jobId, action, payload = {} } = job;
    try {
        let data = null;
        if (action === 'calculateExternalTariffs') {
            data = await firstconService.executeExternalTariffLookup(payload);
        } else if (action === 'calculateLiveTariffs') {
            data = await firstconService.calculateLiveTariffs(payload);
        } else if (action === 'findEnergyGrid') {
            const gridInfo = await firstconService.findEnergyGrid(payload.plz, payload.branch, payload.token);
            if (gridInfo) {
                let streets = [];
                if (payload.includeStreets) {
                    streets = await firstconService.getStreets(gridInfo.zipCode, gridInfo.city, gridInfo.energyGridNumber, payload.branch, payload.token);
                }
                data = { ...gridInfo, streets };
            }
        } else {
            data = await firstconService.executeExternalTariffLookup(payload);
        }

        stats.jobsExecuted += 1;
        stats.lastJobAt = new Date().toISOString();

        await axios.post(
            `${REMOTE_BRIDGE_BASE}/api/firstcon/pc-bridge/result`,
            {
                jobId,
                success: true,
                hostname: HOSTNAME,
                data
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-bridge-secret': BRIDGE_SECRET
                },
                timeout: 10000
            }
        );
    } catch (err) {
        stats.lastError = err.message;
        await axios.post(
            `${REMOTE_BRIDGE_BASE}/api/firstcon/pc-bridge/result`,
            {
                jobId,
                success: false,
                hostname: HOSTNAME,
                error: err.message
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-bridge-secret': BRIDGE_SECRET
                },
                timeout: 10000
            }
        ).catch(() => {});
    }
}

// 3. Long-Polling Loop to https://alpha-energie.de so external sites can query via this PC without port-forwarding
async function startBridgeWorker(workerId) {
    while (true) {
        try {
            stats.lastBridgePollAt = new Date().toISOString();
            const res = await axios.get(`${REMOTE_BRIDGE_BASE}/api/firstcon/pc-bridge/poll`, {
                params: { hostname: HOSTNAME, worker: workerId },
                headers: { 'x-bridge-secret': BRIDGE_SECRET },
                timeout: 28000,
                validateStatus: () => true
            });

            if (res.status === 200 && res.data && res.data.success) {
                stats.bridgeConnected = true;
                if (res.data.job) {
                    // Process job asynchronously and immediately re-poll
                    processBridgeJob(res.data.job);
                    continue;
                }
                // Keepalive cycle completed, immediately re-open poll
                continue;
            } else {
                stats.bridgeConnected = false;
                // Wait 4s if remote server is still deploying or returned 404
                await new Promise(r => setTimeout(r, 4000));
            }
        } catch (err) {
            stats.bridgeConnected = false;
            stats.lastError = err.message;
            await new Promise(r => setTimeout(r, 4000));
        }
    }
}

app.listen(LOCAL_PORT, '0.0.0.0', () => {
    console.log(`[Firstcon-PC-Relay] Local PC Server listening on http://127.0.0.1:${LOCAL_PORT} (Host: ${HOSTNAME})`);
    // Warm up Firstcon auth token on startup
    firstconService.authenticateOrderflow().then(() => {
        console.log('[Firstcon-PC-Relay] Firstcon API v2 token warmed up on this PC.');
    }).catch(e => {
        console.warn('[Firstcon-PC-Relay] Initial Firstcon warmup warning:', e.message);
    });

    // Start 2 parallel long-poll bridge workers to https://alpha-energie.de
    startBridgeWorker(1);
    startBridgeWorker(2);
});
