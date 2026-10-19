require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const firstconService = require('../services/firstconService');

const LOCAL_PORT = parseInt(process.env.FIRSTCON_PC_RELAY_PORT, 10) || 4055;
const REMOTE_BRIDGE_BASE = (process.env.ALPHA_REMOTE_BRIDGE_URL || 'https://alpha-energie.de').replace(/\/+$/, '');
const BRIDGE_SECRET = process.env.FIRSTCON_BRIDGE_SECRET || 'alpha-firstcon-pc-bridge-2026';
const RELAY_NODE_NAME = 'alpha-pc-relay';

const app = express();
app.disable('x-powered-by');
app.use(cors());
// Strict 64kb payload limit to prevent memory exhaustion / DoS
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

let stats = {
    startedAt: new Date().toISOString(),
    node: RELAY_NODE_NAME,
    bindHost: '127.0.0.1',
    localPort: LOCAL_PORT,
    remoteBridgeBase: REMOTE_BRIDGE_BASE,
    bridgeConnected: false,
    lastBridgePollAt: null,
    jobsExecuted: 0,
    lastJobAt: null,
    lastError: null
};

// 1. Local Loopback-Only HTTP Endpoints on this PC (http://127.0.0.1:4055)
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
        res.status(500).json({ success: false, error: 'Fehler bei der Tarifberechnung' });
    }
}

app.all(['/api/external/alpha-tarife', '/api/external/tarife', '/api/tarife/calculate'], handleLocalTariffRequest);

app.get('/api/firstcon/grid', async (req, res) => {
    try {
        const plz = String(req.query.plz || req.query.zip || '44379').replace(/\D/g, '').slice(0, 5) || '44379';
        const branch = String(req.query.branch || 'strom').toLowerCase();
        const gridInfo = await firstconService.findEnergyGrid(plz, branch);
        if (!gridInfo) {
            return res.json({ success: false, found: false, plz });
        }
        let streets = [];
        if (req.query.streets === '1' || req.query.streets === 'true') {
            streets = await firstconService.getStreets(gridInfo.zipCode, gridInfo.city, gridInfo.energyGridNumber, branch);
        }
        stats.jobsExecuted += 1;
        stats.lastJobAt = new Date().toISOString();
        res.json({
            success: true,
            found: true,
            executedByPc: RELAY_NODE_NAME,
            ...gridInfo,
            streets
        });
    } catch (err) {
        res.status(200).json({ success: false, found: false, error: 'Netzgebiet konnte nicht aufgelöst werden' });
    }
});

// 2. Execute strictly whitelisted read-only tariff jobs from the remote bridge
const ALLOWED_ACTIONS = new Set(['calculateExternalTariffs', 'calculateLiveTariffs', 'findEnergyGrid']);

async function processBridgeJob(job) {
    if (!job || !job.jobId) return;
    const { jobId, action, payload = {} } = job;
    try {
        if (!ALLOWED_ACTIONS.has(action)) {
            throw new Error('Unzulässige Bridge-Aktion blockiert');
        }

        let data = null;
        if (action === 'calculateExternalTariffs') {
            data = await firstconService.executeExternalTariffLookup(payload);
        } else if (action === 'calculateLiveTariffs') {
            data = await firstconService.calculateLiveTariffs({
                plz: payload.plz,
                consumption: payload.consumption,
                consumptionHt: payload.consumptionHt,
                consumptionNt: payload.consumptionNt,
                meterType: payload.meterType,
                currentAbschlag: payload.currentAbschlag,
                branch: payload.branch
            });
        } else if (action === 'findEnergyGrid') {
            const gridInfo = await firstconService.findEnergyGrid(payload.plz, payload.branch);
            if (gridInfo) {
                let streets = [];
                if (payload.includeStreets) {
                    streets = await firstconService.getStreets(gridInfo.zipCode, gridInfo.city, gridInfo.energyGridNumber, payload.branch);
                }
                data = { ...gridInfo, streets };
            }
        }

        stats.jobsExecuted += 1;
        stats.lastJobAt = new Date().toISOString();

        await axios.post(
            `${REMOTE_BRIDGE_BASE}/api/firstcon/pc-bridge/result`,
            {
                jobId,
                success: true,
                hostname: RELAY_NODE_NAME,
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
                hostname: RELAY_NODE_NAME,
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

// 3. Outbound-Only Long-Polling Loop to https://alpha-energie.de (Zero open router ports required)
async function startBridgeWorker(workerId) {
    while (true) {
        try {
            stats.lastBridgePollAt = new Date().toISOString();
            const res = await axios.get(`${REMOTE_BRIDGE_BASE}/api/firstcon/pc-bridge/poll`, {
                params: { hostname: RELAY_NODE_NAME, worker: workerId },
                headers: { 'x-bridge-secret': BRIDGE_SECRET },
                timeout: 28000,
                validateStatus: () => true
            });

            if (res.status === 200 && res.data && res.data.success) {
                stats.bridgeConnected = true;
                if (res.data.job) {
                    processBridgeJob(res.data.job);
                    continue;
                }
                continue;
            } else {
                stats.bridgeConnected = false;
                await new Promise(r => setTimeout(r, 4000));
            }
        } catch (err) {
            stats.bridgeConnected = false;
            stats.lastError = err.message;
            await new Promise(r => setTimeout(r, 4000));
        }
    }
}

// Bind strictly to 127.0.0.1 (Loopback only - inaccessible from external network/LAN)
app.listen(LOCAL_PORT, '127.0.0.1', () => {
    console.log(`[Firstcon-PC-Relay] Loopback Server listening strictly on http://127.0.0.1:${LOCAL_PORT}`);
    firstconService.authenticateOrderflow().then(() => {
        console.log('[Firstcon-PC-Relay] Firstcon API v2 token warmed up on this PC.');
    }).catch(e => {
        console.warn('[Firstcon-PC-Relay] Initial Firstcon warmup warning:', e.message);
    });

    startBridgeWorker(1);
    startBridgeWorker(2);
});
