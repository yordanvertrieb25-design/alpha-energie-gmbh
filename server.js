require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const multer = require('multer');

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

const { scrapeB2BContacts } = require('./services/scraperService');
const { sendCampaign, sendSingleContact, getFallbackTemplate } = require('./services/emailCampaignService');
const {
    calculateRlmTariffs,
    resolveDeliveryAddress,
    getRlmPortalOptions,
    createVpPortalOffer,
    generateVpOrderDocuments,
    getVpPortalOrders,
    ensureFreshVpSession,
    saveCookiesToDisk
} = require('./services/rlmTariffService');
const firstconService = require('./services/firstconService');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Canonical host redirect: redirect www.alpha-energie.de to https://alpha-energie.de
app.use((req, res, next) => {
    const host = (req.headers.host || '').toLowerCase();
    if (host.startsWith('www.alpha-energie.de')) {
        return res.redirect(301, `https://alpha-energie.de${req.url}`);
    }
    next();
});

// Casing check and redirect middleware to prevent mixed-case duplicate content
app.use((req, res, next) => {
    if (req.method === 'GET' && /[A-Z]/.test(req.path)) {
        const lowerPath = req.path.toLowerCase();
        const cleanPath = lowerPath.replace(/\.html$/, '');
        const isHtml = lowerPath.endsWith('.html');
        const isTargetPage = ['/index', '/vertriebspartner', '/agenturen', '/impressum', '/vp', '/versorger'].includes(cleanPath);
        const isSitemapOrRobots = lowerPath === '/robots.txt' || lowerPath === '/sitemap.xml' || lowerPath.startsWith('/sitemap');

        if (isHtml || isTargetPage || isSitemapOrRobots) {
            const query = req.url.slice(req.path.length);
            return res.redirect(301, lowerPath + query);
        }
    }
    
    // Casing check for robots.txt to prevent case-insensitive matches on Windows environments
    if (req.path.toLowerCase() === '/robots.txt' && req.path !== '/robots.txt') {
        return res.status(404).send('Not Found');
    }
    next();
});


// Dedicated routes for Google Search & Browser Favicons (High availability, exact Content-Type, Cache-Control)
const faviconAssets = [
    { route: '/favicon.ico', file: 'favicon.ico', type: 'image/x-icon' },
    { route: '/favicon.svg', file: 'favicon.svg', type: 'image/svg+xml' },
    { route: '/favicon-48x48.png', file: 'favicon-48x48.png', type: 'image/png' },
    { route: '/favicon-96x96.png', file: 'favicon-96x96.png', type: 'image/png' },
    { route: '/favicon-192x192.png', file: 'favicon-192x192.png', type: 'image/png' },
    { route: '/favicon-512x512.png', file: 'favicon-512x512.png', type: 'image/png' },
    { route: '/apple-touch-icon.png', file: 'apple-touch-icon.png', type: 'image/png' },
    { route: '/site.webmanifest', file: 'site.webmanifest', type: 'application/manifest+json' }
];

faviconAssets.forEach(asset => {
    app.get(asset.route, (req, res) => {
        const pubFile = path.join(__dirname, 'public', asset.file);
        if (fs.existsSync(pubFile)) {
            res.setHeader('Content-Type', asset.type);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.sendFile(pubFile);
        }
        const rootFile = path.join(__dirname, asset.file);
        if (fs.existsSync(rootFile)) {
            res.setHeader('Content-Type', asset.type);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.sendFile(rootFile);
        }
        res.status(404).send('Not Found');
    });
});

// Redirect legacy /oekogas and /oekogas.html to /erdgas.html (Firstcon compliance: no "oekogas" in URL)
app.get(['/oekogas', '/oekogas.html'], (req, res) => {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, `/erdgas.html${query}`);
});

app.get(['/erdgas', '/erdgas.html'], (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, 'erdgas.html'));
});

// Dedicated route for /versorger (must be before express.static with extensions: ['html'])
app.get(['/versorger', '/versorger.html'], (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, 'versorger.html'));
});

// Dedicated route for /vp (Vertriebspartner-Portal, Versorger-Affiliate-Cockpit & Abrechnungstool)
app.get(['/vp', '/vp/', '/vp.html', '/vertriebspartner-portal', '/vertriebspartner-portal.html'], (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, 'vertriebspartner-portal.html'));
});

const staticNoCacheHeaders = (res, filePath) => {
    if (/\.(html|css|js)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
};

// Serve static files from the root directory first so public/ never shadows root JS/CSS/HTML
app.use(express.static(__dirname, { extensions: ['html'], setHeaders: staticNoCacheHeaders }));
app.use(express.static(path.join(__dirname, 'public'), { setHeaders: staticNoCacheHeaders }));

// Dedicated route for hero image to ensure 100% availability
app.get('/clean_energy_home.jpg', (req, res) => {
    const pubFile = path.join(__dirname, 'public', 'clean_energy_home.jpg');
    if (fs.existsSync(pubFile)) {
        res.setHeader('Content-Type', 'image/jpeg');
        return res.sendFile(pubFile);
    }
    const rootFile = path.join(__dirname, 'clean_energy_home.jpg');
    if (fs.existsSync(rootFile)) {
        res.setHeader('Content-Type', 'image/jpeg');
        return res.sendFile(rootFile);
    }
    res.status(404).send('Not Found');
});

// Dedicated route for EnergieVision-plus – Das Ökostromsiegel (and legacy /ok-power-siegel.png) to ensure 100% availability and image/png content-type
app.get(['/energievision-plus-siegel.png', '/ok-power-siegel.png'], (req, res) => {
    const pubFile = path.join(__dirname, 'public', 'energievision-plus-siegel.png');
    if (fs.existsSync(pubFile)) {
        res.setHeader('Content-Type', 'image/png');
        return res.sendFile(pubFile);
    }
    const rootFile = path.join(__dirname, 'energievision-plus-siegel.png');
    if (fs.existsSync(rootFile)) {
        res.setHeader('Content-Type', 'image/png');
        return res.sendFile(rootFile);
    }
    const legacyPub = path.join(__dirname, 'public', 'ok-power-siegel.png');
    if (fs.existsSync(legacyPub)) {
        res.setHeader('Content-Type', 'image/png');
        return res.sendFile(legacyPub);
    }
    const legacyRoot = path.join(__dirname, 'ok-power-siegel.png');
    if (fs.existsSync(legacyRoot)) {
        res.setHeader('Content-Type', 'image/png');
        return res.sendFile(legacyRoot);
    }
    res.status(404).send('Not Found');
});

// --- API ROUTES ---

// DEBUG: Test Google Places API (temporary - remove after debugging)
app.get('/api/debug/places-test', async (req, res) => {
    const axios = require('axios');
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const result = {
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'N/A',
        nodeEnv: process.env.NODE_ENV || 'not set',
        timestamp: new Date().toISOString()
    };

    if (apiKey) {
        try {
            const query = encodeURIComponent('kiosk in Dortmund, Deutschland');
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&region=de&language=de&key=${apiKey}`;
            const response = await axios.get(url, { timeout: 10000 });
            result.googleStatus = response.data.status;
            result.googleError = response.data.error_message || null;
            result.resultsCount = response.data.results ? response.data.results.length : 0;
            if (response.data.results && response.data.results.length > 0) {
                result.sampleResults = response.data.results.slice(0, 3).map(r => ({
                    name: r.name,
                    address: r.formatted_address
                }));
            }
        } catch (e) {
            result.httpError = e.message;
        }
    }

    res.json(result);
});

// Proxy for egON API to bypass CORS
app.get('/api/proxy/rates', async (req, res) => {
    try {
        const axios = require('axios');
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "No authorization header provided" });
        }

        const queryParams = new URLSearchParams(req.query).toString();
        const targetUrl = `https://gateway.eg-on.com/rates/?${queryParams}`;

        const response = await axios.get(targetUrl, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            },
            validateStatus: () => true // Allow any status code
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Proxy error:", error.message);
        res.status(500).json({ message: "Proxy error: " + error.message });
    }
});

// DEBUG: Clear Database (temporary)
app.get('/api/debug/clear-db', async (req, res) => {
    try {
        await prisma.scrapedContact.deleteMany({});
        await prisma.campaign.deleteMany({});
        res.json({ success: true, message: 'Database cleared successfully!' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 1. Submit Contact Form
app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, email, subject, message } = req.body;
        const newContact = await prisma.contactRequest.create({
            data: { name, phone, email, subject, message }
        });

        (async () => {
            try {
                const transporter = getMailTransporter();
                if (!transporter) return;
                const targetEmail = process.env.NOTIFICATION_EMAIL || 'info@alpha-energy.network';
                const mailSubject = `Neue Kontaktanfrage: ${subject || 'Website'} – ${name || 'Unbekannt'}`;
                const mailText = `Eine neue Kontaktanfrage ist über die Website eingegangen:\n\nName: ${name || 'Unbekannt'}\nE-Mail: ${email || 'Nicht angegeben'}\nTelefon: ${phone || 'Nicht angegeben'}\nBetreff: ${subject || 'Allgemeine Anfrage'}\nNachricht:\n${message || '–'}\n\nBitte im Admin-Panel prüfen: https://alpha-energie.de/admin`;
                await transporter.sendMail({
                    from: getSenderEmail(),
                    to: targetEmail,
                    replyTo: (email && String(email).includes('@')) ? String(email).trim() : undefined,
                    subject: mailSubject,
                    text: mailText
                });
            } catch (mailErr) {
                console.warn('[Contact] Notification email error:', mailErr.message);
            }
        })();

        res.status(201).json({ success: true, data: newContact });
    } catch (error) {
        console.error("Error saving contact:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// --- VERSORGER TARIFRECHNER & ORDER ROUTES (FIRSTCON API V2 CONNECTED) ---

// ============================================================================
// 0.9 FIRSTCON LOCAL PC RELAY BRIDGE & EXTERNAL TARIFF API
// Ensures that Firstcon API calls are executed by the local Windows Server PC
// ("Alpha Energie Server") so Firstcon only sees this PC's IP address and never
// the IP address or domain of external websites.
// ============================================================================
const os = require('os');
const bridgeCrypto = require('crypto');
const FIRSTCON_BRIDGE_SECRET = process.env.FIRSTCON_BRIDGE_SECRET || 'alpha-firstcon-pc-bridge-2026';
const IS_RUNNING_ON_LOCAL_PC = process.platform === 'win32' && fs.existsSync('C:\\Users\\Alpha Energie Server');

const pcBridgeState = {
    pendingJobs: [],
    waitingPollers: [],
    inFlight: new Map(),
    lastSeenAt: IS_RUNNING_ON_LOCAL_PC ? Date.now() : 0,
    pcHostname: IS_RUNNING_ON_LOCAL_PC ? 'alpha-pc-relay' : null,
    jobsCompleted: 0,
    lastJobAt: null
};

// Rate limiter for external tariff API (protects against bot scraping & DDoS floods)
const externalRateLimitMap = new Map(); // ip -> { count, resetAt }
function checkExternalRateLimit(req, maxPerMinute = 45) {
    const rawIp = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    const now = Date.now();
    if (externalRateLimitMap.size > 5000) {
        externalRateLimitMap.clear();
    }
    let entry = externalRateLimitMap.get(rawIp);
    if (!entry || entry.resetAt <= now) {
        entry = { count: 1, resetAt: now + 60000 };
        externalRateLimitMap.set(rawIp, entry);
        return true;
    }
    entry.count += 1;
    return entry.count <= maxPerMinute;
}

function isPcBridgeOnline() {
    if (IS_RUNNING_ON_LOCAL_PC) return true;
    return pcBridgeState.waitingPollers.length > 0 || (Date.now() - pcBridgeState.lastSeenAt) < 40000;
}

function checkBridgeSecret(req) {
    const provided = String(
        req.headers['x-bridge-secret'] ||
        req.query.secret ||
        (req.body && req.body.secret) ||
        ''
    ).trim();
    if (!provided || provided.length !== FIRSTCON_BRIDGE_SECRET.length) return false;
    try {
        return bridgeCrypto.timingSafeEqual(Buffer.from(provided, 'utf8'), Buffer.from(FIRSTCON_BRIDGE_SECRET, 'utf8'));
    } catch (e) {
        return false;
    }
}

/**
 * Whitelists and sanitizes tariff lookup parameters before sending to the local PC bridge.
 */
function sanitizeBridgeTariffPayload(raw = {}, allowPushUrl = false) {
    return {
        plz: String(raw.plz || raw.zip || '44379').replace(/\D/g, '').slice(0, 5) || '44379',
        branch: String(raw.branch || raw.sparte || 'strom').toLowerCase().replace(/[^a-z]/g, '').slice(0, 15) || 'strom',
        consumption: Math.min(500000, Math.max(500, parseInt(raw.consumption, 10) || 2500)),
        consumptionStrom: raw.consumptionStrom ? Math.min(500000, Math.max(500, parseInt(raw.consumptionStrom, 10) || 2500)) : undefined,
        consumptionGas: raw.consumptionGas ? Math.min(500000, Math.max(500, parseInt(raw.consumptionGas, 10) || 12000)) : undefined,
        consumptionWaerme: raw.consumptionWaerme ? Math.min(500000, Math.max(500, parseInt(raw.consumptionWaerme, 10) || 6000)) : undefined,
        consumptionHt: raw.consumptionHt ? Math.min(500000, Math.max(0, parseInt(raw.consumptionHt, 10) || 0)) : 0,
        consumptionNt: raw.consumptionNt ? Math.min(500000, Math.max(0, parseInt(raw.consumptionNt, 10) || 0)) : 0,
        meterType: raw.meterType === 'htnt' ? 'htnt' : 'et',
        currentAbschlag: raw.currentAbschlag ? Math.min(50000, Math.max(0, parseFloat(raw.currentAbschlag) || 0)) : undefined,
        includeStreets: raw.includeStreets === true || raw.includeStreets === 'true' || raw.includeStreets === '1',
        ...(allowPushUrl && raw.targetUrl ? { targetUrl: String(raw.targetUrl).slice(0, 300), _allowPushUrl: true } : {})
    };
}

/**
 * Dispatches a Firstcon task to the connected Windows Server PC ("Alpha Energie Server")
 * via instant HTTP long-polling. If this server process is already running on the Windows PC,
 * it executes directly.
 */
async function executeFirstconOnPc(action, payload = {}, timeoutMs = 11000) {
    if (IS_RUNNING_ON_LOCAL_PC) {
        if (action === 'calculateExternalTariffs') {
            return await firstconService.executeExternalTariffLookup(payload);
        }
        if (action === 'calculateLiveTariffs') {
            return await firstconService.calculateLiveTariffs(payload);
        }
        if (action === 'findEnergyGrid') {
            const gridInfo = await firstconService.findEnergyGrid(payload.plz, payload.branch);
            if (!gridInfo) return null;
            let streets = [];
            if (payload.includeStreets) {
                streets = await firstconService.getStreets(gridInfo.zipCode, gridInfo.city, gridInfo.energyGridNumber, payload.branch);
            }
            return { ...gridInfo, streets };
        }
    }

    if (!isPcBridgeOnline()) {
        throw new Error('PC-Bridge aktuell offline');
    }

    if (pcBridgeState.pendingJobs.length >= 100) {
        throw new Error('PC-Bridge Queue ausgelastet');
    }

    const jobId = `fcjob_${Date.now()}_${bridgeCrypto.randomBytes(6).toString('hex')}`;
    const job = { jobId, action, payload, createdAt: Date.now() };

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            pcBridgeState.inFlight.delete(jobId);
            const idx = pcBridgeState.pendingJobs.findIndex(j => j.jobId === jobId);
            if (idx !== -1) pcBridgeState.pendingJobs.splice(idx, 1);
            reject(new Error('PC-Bridge Timeout'));
        }, timeoutMs);

        pcBridgeState.inFlight.set(jobId, { resolve, reject, timer, action, createdAt: Date.now() });

        // Immediately wake up an idle long-polling worker from the Windows PC
        while (pcBridgeState.waitingPollers.length > 0) {
            const poller = pcBridgeState.waitingPollers.shift();
            if (poller && !poller.res.writableEnded) {
                clearTimeout(poller.timer);
                poller.res.json({ success: true, job });
                return;
            }
        }

        pcBridgeState.pendingJobs.push(job);
    });
}

// Long-Poll Endpoint for the local Windows PC Relay Daemon (scripts/firstcon-pc-relay.js)
app.get('/api/firstcon/pc-bridge/poll', (req, res) => {
    if (!checkBridgeSecret(req)) {
        return res.status(401).json({ success: false, error: 'Unauthorized bridge secret' });
    }
    pcBridgeState.lastSeenAt = Date.now();
    pcBridgeState.pcHostname = 'alpha-pc-relay';

    if (pcBridgeState.pendingJobs.length > 0) {
        const job = pcBridgeState.pendingJobs.shift();
        return res.json({ success: true, job });
    }

    const pollerEntry = {
        res,
        timer: setTimeout(() => {
            const idx = pcBridgeState.waitingPollers.indexOf(pollerEntry);
            if (idx !== -1) pcBridgeState.waitingPollers.splice(idx, 1);
            if (!res.writableEnded) {
                res.json({ success: true, job: null, keepalive: true });
            }
        }, 22000)
    };

    req.on('close', () => {
        clearTimeout(pollerEntry.timer);
        const idx = pcBridgeState.waitingPollers.indexOf(pollerEntry);
        if (idx !== -1) pcBridgeState.waitingPollers.splice(idx, 1);
    });

    pcBridgeState.waitingPollers.push(pollerEntry);
});

// Result Callback Endpoint where the local Windows PC returns the Firstcon response
app.post('/api/firstcon/pc-bridge/result', (req, res) => {
    if (!checkBridgeSecret(req)) {
        return res.status(401).json({ success: false, error: 'Unauthorized bridge secret' });
    }
    pcBridgeState.lastSeenAt = Date.now();
    const { jobId, success, data, error } = req.body || {};
    pcBridgeState.pcHostname = 'alpha-pc-relay';

    const pending = pcBridgeState.inFlight.get(jobId);
    if (pending) {
        clearTimeout(pending.timer);
        pcBridgeState.inFlight.delete(jobId);
        pcBridgeState.jobsCompleted += 1;
        pcBridgeState.lastJobAt = new Date().toISOString();
        if (success === false) {
            pending.reject(new Error(error || 'PC Relay execution failed'));
        } else {
            pending.resolve(data);
        }
    }
    res.json({ success: true, acknowledged: Boolean(pending) });
});

// Status Endpoint for PC Bridge & External Tariff Relay
app.get(['/api/firstcon/pc-bridge/status', '/api/external/alpha-tarife/status'], (req, res) => {
    res.json({
        success: true,
        pcBridgeOnline: isPcBridgeOnline(),
        runningDirectlyOnPc: IS_RUNNING_ON_LOCAL_PC,
        pcHostname: 'alpha-pc-relay',
        waitingWorkers: pcBridgeState.waitingPollers.length,
        pendingJobs: pcBridgeState.pendingJobs.length,
        jobsCompleted: pcBridgeState.jobsCompleted,
        lastSeenAgoMs: pcBridgeState.lastSeenAt ? (Date.now() - pcBridgeState.lastSeenAt) : null,
        lastJobAt: pcBridgeState.lastJobAt,
        security: {
            whitelistedDomains: ['energiedoc.de', 'www.energiedoc.de', 'alpha-energie.de'],
            rateLimitPerMinute: 45,
            resultCacheMinutes: 10,
            loopbackOnlyOnPc: true,
            ssrfProtection: true,
            tokenIsolation: true
        },
        firstconIpProtection: 'ACTIVE (Firstcon sieht ausschließlich die IP dieses PCs)'
    });
});

function isAllowedExternalDomainHost(hostname) {
    const h = String(hostname || '').toLowerCase().trim();
    if (!h) return false;
    if (
        h === 'energiedoc.de' ||
        h.endsWith('.energiedoc.de') ||
        h === 'alpha-energie.de' ||
        h.endsWith('.alpha-energie.de') ||
        h === 'localhost' ||
        h === '127.0.0.1'
    ) {
        return true;
    }
    const extraEnv = String(process.env.ALLOWED_EXTERNAL_ORIGINS || '').trim();
    if (extraEnv) {
        const extraHosts = extraEnv.split(',').map(s => s.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')).filter(Boolean);
        if (extraHosts.includes(h)) return true;
    }
    return false;
}

// External Alpha Tarife Endpoint (GET & POST) — Locked to energiedoc.de & alpha-energie.de
async function handleExternalAlphaTarife(req, res) {
    try {
        const reqOrigin = String(req.headers.origin || '').trim();
        const reqReferer = String(req.headers.referer || '').trim();

        let matchedOriginHeader = 'https://energiedoc.de';
        if (reqOrigin) {
            let originHost = '';
            try {
                originHost = new URL(reqOrigin).hostname;
            } catch (e) {
                originHost = '';
            }
            if (!isAllowedExternalDomainHost(originHost)) {
                return res.status(403).json({
                    success: false,
                    error: 'Zugriff verweigert: Diese Domain ist nicht für die Alpha-Tarif-Schnittstelle freigeschaltet (nur energiedoc.de).'
                });
            }
            matchedOriginHeader = reqOrigin;
        } else if (reqReferer) {
            let refererHost = '';
            try {
                refererHost = new URL(reqReferer).hostname;
            } catch (e) {
                refererHost = '';
            }
            if (!isAllowedExternalDomainHost(refererHost)) {
                return res.status(403).json({
                    success: false,
                    error: 'Zugriff verweigert: Referer-Domain ist nicht freigeschaltet (nur energiedoc.de).'
                });
            }
        }

        res.setHeader('Access-Control-Allow-Origin', matchedOriginHeader);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Alpha-Key');

        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }

        // Optional API Key check if EXTERNAL_TARIFF_API_KEY is configured in .env
        const requiredApiKey = String(process.env.EXTERNAL_TARIFF_API_KEY || '').trim();
        if (requiredApiKey) {
            const providedKey = String(req.headers['x-alpha-key'] || req.query.apiKey || (req.body && req.body.apiKey) || '').trim();
            if (providedKey !== requiredApiKey) {
                return res.status(401).json({ success: false, error: 'Ungültiger X-Alpha-Key.' });
            }
        }

        // Per-IP Rate Limiting (45 requests/min per IP)
        if (!checkExternalRateLimit(req, 45)) {
            return res.status(429).json({
                success: false,
                error: 'Zu viele Anfragen (Rate-Limit). Bitte in einer Minute erneut versuchen.'
            });
        }

        const rawParams = { ...(req.query || {}), ...(req.body || {}) };
        const hasBridgeAuth = checkBridgeSecret(req);
        const safeParams = sanitizeBridgeTariffPayload(rawParams, hasBridgeAuth);

        let result = null;
        let routedViaPc = false;

        if (isPcBridgeOnline()) {
            try {
                result = await executeFirstconOnPc('calculateExternalTariffs', safeParams, 12000);
                routedViaPc = true;
            } catch (bridgeErr) {
                console.warn('[PC-Bridge] Fallback to direct execution:', bridgeErr.message);
            }
        }

        if (!result) {
            result = await firstconService.executeExternalTariffLookup(safeParams);
        }

        res.json({
            ...result,
            routedViaLocalPc: routedViaPc || IS_RUNNING_ON_LOCAL_PC,
            executedByPc: 'alpha-pc-relay'
        });
    } catch (error) {
        console.error('[External Alpha Tarife] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Abrufen der Alpha Tarife.'
        });
    }
}

app.all(['/api/external/alpha-tarife', '/api/external/tarife', '/api/tarife/external'], handleExternalAlphaTarife);

// One-time Master Data / Tariff Catalog Endpoint for energiedoc.de
// Returns all Alpha Energie tariff definitions (names, IDs, features, durations, PDF links) across all 4 branches.
app.get('/api/external/alpha-tarife/catalog', (req, res) => {
    const reqOrigin = String(req.headers.origin || '').trim();
    if (reqOrigin) {
        try {
            const originHost = new URL(reqOrigin).hostname;
            if (!isAllowedExternalDomainHost(originHost)) {
                return res.status(403).json({ success: false, error: 'Domain nicht freigeschaltet.' });
            }
            res.setHeader('Access-Control-Allow-Origin', reqOrigin);
        } catch (e) {
            return res.status(403).json({ success: false, error: 'Ungültiger Origin-Header.' });
        }
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://energiedoc.de');
    }
    res.setHeader('Vary', 'Origin');

    const branches = ['strom', 'gas', 'waerme', 'ladestrom'];
    const catalogByBranch = {};
    for (const b of branches) {
        const ref = firstconService.buildReferenceTariffsForBranch({ plz: '44379', branch: b });
        catalogByBranch[b] = ref.tariffs.map(t => ({
            id: t.id,
            firstconTariffId: t.firstconTariffId,
            firstconName: t.firstconName,
            name: t.name,
            providerName: 'Alpha Energie',
            brandId: 54,
            branch: b,
            badge: t.badge,
            isBestseller: t.isBestseller,
            contractTermMonths: t.contractTermMonths || 24,
            priceGuaranteeMonths: t.priceGuaranteeMonths || 24,
            ecoCertificate: t.ecoCertificate,
            agbPdfUrl: `https://alpha-energie.de/api/tarife/agb?branch=${b === 'gas' ? 'gas' : 'strom'}&tariffId=${t.firstconTariffId}`,
            datenschutzPdfUrl: `https://alpha-energie.de/api/tarife/datenschutz?branch=${b === 'gas' ? 'gas' : 'strom'}&tariffId=${t.firstconTariffId}`,
            referenceWorkingPriceCt: t.workingPriceCt,
            referenceBasePriceEurMonth: t.basePriceEurMonth
        }));
    }

    res.json({
        success: true,
        provider: {
            name: 'Alpha Energie',
            legalNote: 'Alpha Energie – Eine Marke der Firstcon GmbH',
            brandId: 54,
            logoUrl: 'https://alpha-energie.de/logo.png'
        },
        endpoints: {
            catalog: 'https://alpha-energie.de/api/external/alpha-tarife/catalog',
            liveCalculate: 'https://alpha-energie.de/api/external/alpha-tarife',
            agbPdf: 'https://alpha-energie.de/api/tarife/agb',
            datenschutzPdf: 'https://alpha-energie.de/api/tarife/datenschutz'
        },
        branches: catalogByBranch
    });
});

// Active Push Endpoint (Requires Bridge Secret or Admin Auth to prevent SSRF abuse)
app.post('/api/external/alpha-tarife/push', async (req, res) => {
    try {
        if (!checkBridgeSecret(req)) {
            return res.status(401).json({
                success: false,
                error: 'Authentifizierung (x-bridge-secret) für aktiven Webhook-Push erforderlich.'
            });
        }
        const params = { ...(req.query || {}), ...(req.body || {}) };
        const targetUrl = params.targetUrl || params.callbackUrl || params.webhookUrl || process.env.EXTERNAL_TARIFF_WEBHOOK_URL;
        if (!targetUrl || !/^https:\/\//i.test(String(targetUrl))) {
            return res.status(400).json({
                success: false,
                error: 'Bitte eine gültige HTTPS-targetUrl angeben.'
            });
        }
        return handleExternalAlphaTarife(req, res);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Embeddable JavaScript SDK for External Websites (<script src="https://alpha-energie.de/api/external/alpha-tarife/embed.js"></script>)
app.get('/api/external/alpha-tarife/embed.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    const apiOrigin = `${req.protocol}://${req.get('host')}`;
    const scriptContent = `/**
 * Alpha Energie Tarife – External Client SDK (IP-Protected via Local PC Relay)
 * Firstcon sieht bei keiner Anfrage die IP oder Domain der externen Webseite.
 */
(function(window) {
    const DEFAULT_ENDPOINT = "${apiOrigin}/api/external/alpha-tarife";

    const AlphaTarifeAPI = {
        endpoint: DEFAULT_ENDPOINT,

        /**
         * Holt Live-Preise für Alpha Basic 24, Alpha Time 24 & Alpha Premium 24 über den Alpha-Energie-PC.
         * @param {Object} options - { plz: '44379', consumption: 2500, branch: 'strom' | 'gas' | 'waerme' | 'ladestrom' | 'all', meterType: 'et' | 'htnt', consumptionHt, consumptionNt, currentAbschlag, includeStreets, targetUrl }
         */
        async getTariffs(options = {}) {
            const payload = {
                plz: String(options.plz || '44379').trim(),
                branch: options.branch || 'strom',
                consumption: Number(options.consumption) || (options.branch === 'gas' ? 12000 : (options.branch === 'waerme' ? 6000 : 2500)),
                ...(options.meterType ? { meterType: options.meterType } : {}),
                ...(options.consumptionHt ? { consumptionHt: Number(options.consumptionHt) } : {}),
                ...(options.consumptionNt ? { consumptionNt: Number(options.consumptionNt) } : {}),
                ...(options.currentAbschlag ? { currentAbschlag: Number(options.currentAbschlag) } : {}),
                ...(options.includeStreets ? { includeStreets: true } : {}),
                ...(options.targetUrl ? { targetUrl: options.targetUrl } : {})
            };

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('AlphaTarifeAPI HTTP ' + response.status);
            }
            return await response.json();
        },

        /**
         * Holt alle 4 Sparten (Strom, Gas, Wärmestrom, Ladestrom) gleichzeitig für eine PLZ.
         */
        async getAllBranches(plz = '44379', consumptions = {}) {
            return await this.getTariffs({
                plz,
                branch: 'all',
                consumptionStrom: consumptions.strom || 2500,
                consumptionGas: consumptions.gas || 12000,
                consumptionWaerme: consumptions.waerme || 6000
            });
        }
    };

    window.AlphaTarifeAPI = AlphaTarifeAPI;
})(window);
`;
    res.send(scriptContent);
});

// 1.0 Firstcon Live Connection Status & Grid/Street Lookup
app.get('/api/firstcon/status', async (req, res) => {
    try {
        const token = req.query.token || process.env.FIRSTCON_ORDERFLOW_TOKEN || firstconService.DEFAULT_FIRSTCON_TOKEN;
        const auth = await firstconService.authenticateOrderflow(token);
        res.json({
            success: true,
            connected: true,
            pcBridgeOnline: isPcBridgeOnline(),
            pcHostname: pcBridgeState.pcHostname || (IS_RUNNING_ON_LOCAL_PC ? os.hostname() : null),
            user: auth.payload?.unique_name || 'alpha-energie-dev',
            brandId: auth.payload?.BrandId || 54,
            brandName: 'Alpha Energie',
            tokenPrefix: String(auth.integrationKey || '').slice(0, 8) + '...',
            apiBase: firstconService.FIRSTCON_API_BASE
        });
    } catch (error) {
        res.status(200).json({
            success: false,
            connected: false,
            pcBridgeOnline: isPcBridgeOnline(),
            error: error.message
        });
    }
});

app.get('/api/firstcon/grid', async (req, res) => {
    try {
        const plz = req.query.plz || req.query.zip || '44379';
        const branch = req.query.branch || 'strom';
        const token = req.query.token || process.env.FIRSTCON_ORDERFLOW_TOKEN;
        const includeStreets = req.query.streets === '1' || req.query.streets === 'true';

        if (isPcBridgeOnline() && !IS_RUNNING_ON_LOCAL_PC) {
            try {
                const pcGrid = await executeFirstconOnPc('findEnergyGrid', { plz, branch, token, includeStreets }, 9000);
                if (pcGrid) {
                    return res.json({
                        success: true,
                        found: true,
                        executedByPc: pcBridgeState.pcHostname,
                        ...pcGrid
                    });
                }
            } catch (e) {
                // fallback below
            }
        }

        const gridInfo = await firstconService.findEnergyGrid(plz, branch, token);
        if (!gridInfo) {
            return res.json({ success: false, found: false, plz });
        }
        let streets = [];
        if (includeStreets) {
            streets = await firstconService.getStreets(gridInfo.zipCode, gridInfo.city, gridInfo.energyGridNumber, branch, token);
        }
        res.json({
            success: true,
            found: true,
            ...gridInfo,
            streets
        });
    } catch (error) {
        res.status(200).json({ success: false, found: false, error: error.message });
    }
});

// 1.0b Official Firstcon AGB + Widerrufsbelehrung & Datenschutz PDFs (/Tariff/GetTariffTermsFile & /Tariff/GetDataProtectionFile)
app.get(['/api/tarife/agb', '/api/firstcon/agb'], async (req, res) => {
    const branch = String(req.query.branch || req.query.sparte || 'strom').toLowerCase();
    const isGas = branch === 'gas';
    const tariffId = req.query.tariffId || req.query.id;
    const token = req.query.token || process.env.FIRSTCON_ORDERFLOW_TOKEN;
    const dispositionType = req.query.download === '1' ? 'attachment' : 'inline';

    try {
        const pdfDoc = await firstconService.getTariffTermsFile({ branch, tariffId, token });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${dispositionType}; filename="${pdfDoc.filename}"`);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.send(pdfDoc.buffer);
    } catch (err) {
        const fallbackFile = path.join(
            __dirname,
            'public',
            'docs',
            isGas ? 'AGB_Gas_Alpha_Energie.pdf' : 'AGB_Strom_Alpha_Energie.pdf'
        );
        if (fs.existsSync(fallbackFile)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `${dispositionType}; filename="${path.basename(fallbackFile)}"`);
            return res.sendFile(fallbackFile);
        }
        return res.status(404).send('AGB-Dokument nicht gefunden.');
    }
});

app.get(['/api/tarife/datenschutz', '/api/firstcon/datenschutz'], async (req, res) => {
    const branch = String(req.query.branch || req.query.sparte || 'strom').toLowerCase();
    const tariffId = req.query.tariffId || req.query.id;
    const token = req.query.token || process.env.FIRSTCON_ORDERFLOW_TOKEN;
    const dispositionType = req.query.download === '1' ? 'attachment' : 'inline';

    try {
        const pdfDoc = await firstconService.getDataProtectionFile({ branch, tariffId, token });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${dispositionType}; filename="${pdfDoc.filename}"`);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.send(pdfDoc.buffer);
    } catch (err) {
        const fallbackFile = path.join(__dirname, 'public', 'docs', 'Datenschutzinformationen_Alpha_Energie.pdf');
        if (fs.existsSync(fallbackFile)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `${dispositionType}; filename="${path.basename(fallbackFile)}"`);
            return res.sendFile(fallbackFile);
        }
        return res.redirect('/datenschutz.html');
    }
});

// 1.1 Calculate Tariffs dynamically (Firstcon Live API v2 via Local PC Bridge + Fallback)
app.all('/api/tarife/calculate', async (req, res) => {
    try {
        const params = { ...(req.query || {}), ...(req.body || {}) };
        // If caller requests B2B / RLM calculation via /api/tarife/calculate, delegate to live RLM portal service
        if (params.mode === 'rlm' || params.isB2B === true || params.isB2B === 'true' || params.customerType === 'COMMERCIAL' || params.measurement === 'RLM') {
            const rlmResult = await calculateRlmTariffs(params);
            return res.json(rlmResult);
        }

        const { plz, consumption, consumptionHt, consumptionNt, meterType, currentAbschlag, branch = 'strom', orderflowToken, useFallbackOnly } = params;
        const normalizedBranch = firstconService.normalizeFirstconBranch(branch);
        const isGas = normalizedBranch === 'gas';
        const isWaerme = normalizedBranch === 'waerme';
        const isLadestrom = normalizedBranch === 'ladestrom';
        const defaultKwh = isGas ? 12000 : (isWaerme ? 6000 : 2500);
        const defaultAbschlag = isGas ? 115 : (isWaerme ? 165 : 95);
        const parsedHt = parseInt(consumptionHt, 10) || 0;
        const parsedNt = parseInt(consumptionNt, 10) || 0;
        const htNtSum = parsedHt + parsedNt;
        const kwh = Math.max(500, (isWaerme && htNtSum >= 500) ? htNtSum : (parseInt(consumption, 10) || defaultKwh));
        const resolvedMeterType = isGas ? 'gas' : (isWaerme ? (meterType === 'et' ? 'et' : 'htnt') : 'et');
        const resolvedMeterTypeId = isGas ? 3 : (resolvedMeterType === 'htnt' ? 2 : 1);
        const resolvedHt = isWaerme ? (parsedHt > 0 ? parsedHt : (resolvedMeterType === 'et' ? kwh : Math.round(kwh * 0.6))) : kwh;
        const resolvedNt = isWaerme ? (resolvedMeterType === 'et' ? 0 : (parsedNt > 0 ? parsedNt : Math.max(0, kwh - resolvedHt))) : 0;
        const abschlagOld = parseFloat(currentAbschlag) || defaultAbschlag;
        const cleanPlz = String(plz || '44379').replace(/\D/g, '').slice(0, 5);

        // Attempt live Firstcon API v2 calculation first (preferring execution on this Windows Server PC when connected)
        if (!useFallbackOnly && /^\d{5}$/.test(cleanPlz)) {
            const calcArgs = {
                plz: cleanPlz,
                consumption: kwh,
                consumptionHt: resolvedHt,
                consumptionNt: resolvedNt,
                meterType: resolvedMeterType,
                currentAbschlag: abschlagOld,
                branch: normalizedBranch,
                token: orderflowToken,
                targetUrl: params.targetUrl || params.callbackUrl || params.webhookUrl
            };
            try {
                let liveFirstcon = null;
                let executedViaPcBridge = false;
                if (isPcBridgeOnline() && !IS_RUNNING_ON_LOCAL_PC) {
                    try {
                        liveFirstcon = await executeFirstconOnPc('calculateExternalTariffs', calcArgs, 10000);
                        executedViaPcBridge = true;
                    } catch (bridgeErr) {
                        console.warn('[PC-Bridge] Fallback to direct Firstcon calculation:', bridgeErr.message);
                    }
                }
                if (!liveFirstcon) {
                    liveFirstcon = await firstconService.calculateLiveTariffs(calcArgs);
                }
                if (liveFirstcon && Array.isArray(liveFirstcon.tariffs) && liveFirstcon.tariffs.length > 0) {
                    return res.json({
                        success: true,
                        ...liveFirstcon,
                        routedViaLocalPc: executedViaPcBridge || IS_RUNNING_ON_LOCAL_PC,
                        currentAbschlag: abschlagOld
                    });
                }
            } catch (fcErr) {
                console.warn('[Firstcon API] Fallback to local tariff calculation:', fcErr.message);
            }
        }

        // Reference Firstcon tariffs (BrandId 54 - Alpha Energie) when offline
        const stromTariffs = [
            {
                id: 'alpha-basic',
                firstconTariffId: 279,
                firstconName: 'Alpha Basic 24',
                name: 'ALPHA BASIC 24',
                badge: 'Flexibel & Günstig',
                isBestseller: false,
                workingPriceCt: 33.66,
                basePriceEurMonth: 29.40,
                basePriceEur: 29.40,
                bonusEur: 0,
                priceGuaranteeMonths: 24,
                contractTermMonths: 24,
                ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien',
                features: [
                    '24 Monate volle Preisgarantie',
                    'Ökostrom aus 100 % erneuerbaren Energien',
                    'Investition in den Ausbau erneuerbarer Energien',
                    'Kostenloser & automatischer Wechselservice'
                ]
            },
            {
                id: 'alpha-time',
                firstconTariffId: 280,
                firstconName: 'Alpha Time 24',
                name: 'ALPHA TIME 24',
                badge: 'Bestseller & Spar-Vorteil',
                isBestseller: true,
                workingPriceCt: 34.85,
                basePriceEurMonth: 29.40,
                basePriceEur: 29.40,
                bonusEur: 0,
                priceGuaranteeMonths: 24,
                contractTermMonths: 24,
                ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien',
                features: [
                    '24 Monate volle Preisgarantie',
                    'Attraktives Preis-Leistungs-Verhältnis mit 24 Monaten Planungssicherheit',
                    'Ökostrom aus 100 % erneuerbaren Energien',
                    'Kostenloser & automatischer Wechselservice'
                ]
            },
            {
                id: 'alpha-premium',
                firstconTariffId: 281,
                firstconName: 'Alpha Premium 24',
                name: 'ALPHA PREMIUM 24',
                badge: '24 Monate Preisschutz & VIP',
                isBestseller: false,
                workingPriceCt: 36.04,
                basePriceEurMonth: 29.40,
                basePriceEur: 29.40,
                bonusEur: 0,
                priceGuaranteeMonths: 24,
                contractTermMonths: 24,
                ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien',
                features: [
                    '24 Monate volle Preisgarantie',
                    'Sicherheit und Planbarkeit durch lange Preisgarantie',
                    'Ökostrom aus 100 % erneuerbaren Energien',
                    'Kostenloser & automatischer Wechselservice'
                ]
            }
        ];

        const waermeTariffs = [
            {
                id: 'alpha-basic',
                firstconTariffId: 279,
                firstconName: 'Alpha Basic 24',
                name: 'ALPHA BASIC 24 WÄRME',
                badge: 'Wärmepumpe & Nachtspeicher (HT/NT)',
                isBestseller: false,
                workingPriceCt: 27.76,
                workingPriceEtCt: 27.76,
                workingPriceHtCt: 28.95,
                workingPriceNtCt: 25.97,
                basePriceEurMonth: 16.90,
                basePriceEur: 16.90,
                basePriceYearGross: 202.80,
                bonusEur: 0,
                priceGuaranteeMonths: 24,
                contractTermMonths: 24,
                ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien',
                features: [
                    '24 Monate volle Preisgarantie',
                    'Für Wärmepumpe (§ 14a EnWG) & Nachtspeicherheizung (HT/NT)',
                    'Geeignet für Doppeltarifzähler (HT/NT) & Eintarifzähler',
                    'Ökostrom aus 100 % erneuerbaren Energien'
                ]
            },
            {
                id: 'alpha-time',
                firstconTariffId: 280,
                firstconName: 'Alpha Time 24',
                name: 'ALPHA TIME 24 WÄRME',
                badge: 'Bestseller • § 14a EnWG & HT/NT',
                isBestseller: true,
                workingPriceCt: 28.95,
                workingPriceEtCt: 28.95,
                workingPriceHtCt: 30.14,
                workingPriceNtCt: 27.16,
                basePriceEurMonth: 16.90,
                basePriceEur: 16.90,
                basePriceYearGross: 202.80,
                bonusEur: 0,
                priceGuaranteeMonths: 24,
                contractTermMonths: 24,
                ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien',
                features: [
                    '24 Monate volle Preisgarantie',
                    'Für Wärmepumpe (§ 14a EnWG) & Nachtspeicherheizung (HT/NT)',
                    'Geeignet für Doppeltarifzähler (HT/NT) & Eintarifzähler',
                    'Ökostrom aus 100 % erneuerbaren Energien'
                ]
            },
            {
                id: 'alpha-premium',
                firstconTariffId: 281,
                firstconName: 'Alpha Premium 24',
                name: 'ALPHA PREMIUM 24 WÄRME',
                badge: '24 Monate Preisschutz • HT/NT Komfort',
                isBestseller: false,
                workingPriceCt: 30.14,
                workingPriceEtCt: 30.14,
                workingPriceHtCt: 31.33,
                workingPriceNtCt: 28.35,
                basePriceEurMonth: 16.90,
                basePriceEur: 16.90,
                basePriceYearGross: 202.80,
                bonusEur: 0,
                priceGuaranteeMonths: 24,
                contractTermMonths: 24,
                ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien',
                features: [
                    '24 Monate volle Preisgarantie',
                    'Für Wärmepumpe (§ 14a EnWG) & Nachtspeicherheizung (HT/NT)',
                    'Geeignet für Doppeltarifzähler (HT/NT) & Eintarifzähler',
                    'Ökostrom aus 100 % erneuerbaren Energien'
                ]
            }
        ];

        const ladestromTariffs = [
            {
                id: 'alpha-basic',
                firstconTariffId: 279,
                firstconName: 'Alpha Basic 24',
                name: 'ALPHA BASIC 24 LADESTROM',
                badge: 'Wallbox & E-Auto (§ 14a EnWG)',
                isBestseller: false,
                workingPriceCt: 28.95,
                basePriceEurMonth: 18.90,
                basePriceEur: 18.90,
                basePriceYearGross: 226.80,
                bonusEur: 0,
                priceGuaranteeMonths: 24,
                contractTermMonths: 24,
                ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien',
                features: [
                    '24 Monate volle Preisgarantie',
                    'Für Heim-Wallbox (11 kW / 22 kW) & Elektroauto (§ 14a EnWG)',
                    'Ökostrom aus 100 % erneuerbaren Energien',
                    'Kostenloser & automatischer Wechselservice'
                ]
            },
            {
                id: 'alpha-time',
                firstconTariffId: 280,
                firstconName: 'Alpha Time 24',
                name: 'ALPHA TIME 24 LADESTROM',
                badge: 'Bestseller • Wallbox & E-Auto',
                isBestseller: true,
                workingPriceCt: 30.14,
                basePriceEurMonth: 18.90,
                basePriceEur: 18.90,
                basePriceYearGross: 226.80,
                bonusEur: 0,
                priceGuaranteeMonths: 24,
                contractTermMonths: 24,
                ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien',
                features: [
                    '24 Monate volle Preisgarantie',
                    'Für Heim-Wallbox (11 kW / 22 kW) & Elektroauto (§ 14a EnWG)',
                    'Attraktives Preis-Leistungs-Verhältnis mit 24 Monaten Planungssicherheit',
                    'Ökostrom aus 100 % erneuerbaren Energien'
                ]
            },
            {
                id: 'alpha-premium',
                firstconTariffId: 281,
                firstconName: 'Alpha Premium 24',
                name: 'ALPHA PREMIUM 24 LADESTROM',
                badge: '24 Monate Preisschutz • E-Mobility',
                isBestseller: false,
                workingPriceCt: 31.33,
                basePriceEurMonth: 18.90,
                basePriceEur: 18.90,
                basePriceYearGross: 226.80,
                bonusEur: 0,
                priceGuaranteeMonths: 24,
                contractTermMonths: 24,
                ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien',
                features: [
                    '24 Monate volle Preisgarantie',
                    'Für Heim-Wallbox (11 kW / 22 kW) & Elektroauto (§ 14a EnWG)',
                    'Sicherheit und Planbarkeit durch lange Preisgarantie',
                    'Ökostrom aus 100 % erneuerbaren Energien'
                ]
            }
        ];

        const isSmallGasTier = isGas && kwh <= 4000;
        const gasTariffs = [
            {
                id: 'alpha-basic',
                firstconTariffId: 226,
                firstconName: 'Alpha Basic 24',
                name: 'ALPHA BASIC 24 GAS',
                badge: 'Fair & Preisstabil',
                isBestseller: false,
                workingPriceCt: isSmallGasTier ? 16.81 : 16.52,
                basePriceEurMonth: isSmallGasTier ? 27.29 : 28.25,
                basePriceEur: isSmallGasTier ? 27.29 : 28.25,
                basePriceYearGross: isSmallGasTier ? 327.48 : 338.98,
                bonusEur: 0,
                priceGuaranteeMonths: 24,
                contractTermMonths: 24,
                ecoCertificate: 'Erdgas mit freiwilligem Klimaschutzbeitrag',
                features: [
                    '24 Monate volle Preisgarantie',
                    'Erdgas mit freiwilligem Klimaschutzbeitrag',
                    'Förderung ausgewählter Klimaschutzprojekte',
                    'Kostenloser & automatischer Wechselservice'
                ]
            },
            {
                id: 'alpha-time',
                firstconTariffId: 227,
                firstconName: 'Alpha Time 24',
                name: 'ALPHA TIME 24 GAS',
                badge: 'Bestseller & Spar-Vorteil',
                isBestseller: true,
                workingPriceCt: isSmallGasTier ? 18.00 : 17.71,
                basePriceEurMonth: isSmallGasTier ? 27.29 : 28.25,
                basePriceEur: isSmallGasTier ? 27.29 : 28.25,
                basePriceYearGross: isSmallGasTier ? 327.48 : 338.98,
                bonusEur: 0,
                priceGuaranteeMonths: 24,
                contractTermMonths: 24,
                ecoCertificate: 'Erdgas mit freiwilligem Klimaschutzbeitrag',
                features: [
                    '24 Monate volle Preisgarantie',
                    'Attraktives Preis-Leistungs-Verhältnis mit 24 Monaten Planungssicherheit',
                    'Erdgas mit freiwilligem Klimaschutzbeitrag',
                    'Förderung ausgewählter Klimaschutzprojekte'
                ]
            },
            {
                id: 'alpha-premium',
                firstconTariffId: 228,
                firstconName: 'Alpha Premium 24',
                name: 'ALPHA PREMIUM 24 GAS',
                badge: '24 Monate Preisschutz & Komfort',
                isBestseller: false,
                workingPriceCt: isSmallGasTier ? 19.19 : 18.90,
                basePriceEurMonth: isSmallGasTier ? 27.29 : 28.25,
                basePriceEur: isSmallGasTier ? 27.29 : 28.25,
                basePriceYearGross: isSmallGasTier ? 327.48 : 338.98,
                bonusEur: 0,
                priceGuaranteeMonths: 24,
                contractTermMonths: 24,
                ecoCertificate: 'Erdgas mit freiwilligem Klimaschutzbeitrag',
                features: [
                    '24 Monate volle Preisgarantie',
                    'Sicherheit und Planbarkeit durch lange Preisgarantie',
                    'Erdgas mit freiwilligem Klimaschutzbeitrag',
                    'Förderung ausgewählter Klimaschutzprojekte'
                ]
            }
        ];

        const tariffs = isGas ? gasTariffs : (isWaerme ? waermeTariffs : (isLadestrom ? ladestromTariffs : stromTariffs));
        const refGrundversorgerYearly = isGas
            ? (kwh * 0.215) + (29.50 * 12)
            : (isWaerme
                ? (kwh * 0.375) + (24.90 * 12)
                : (isLadestrom
                    ? (kwh * 0.385) + (25.90 * 12)
                    : (kwh * 0.415) + (29.90 * 12)));
        const yearlyOld = Math.max(abschlagOld * 12, refGrundversorgerYearly);

        const calculatedTariffs = tariffs.map(t => {
            const baseYearGross = t.basePriceYearGross || (isGas ? 338.98 : (isWaerme ? 202.80 : (isLadestrom ? 226.80 : 352.85)));
            let effectiveWorkingPriceCt = t.workingPriceCt;
            let annualWorkGross = kwh * (t.workingPriceCt / 100);
            if (isWaerme && resolvedMeterType === 'htnt' && typeof t.workingPriceHtCt === 'number' && typeof t.workingPriceNtCt === 'number') {
                annualWorkGross = (resolvedHt * (t.workingPriceHtCt / 100)) + (resolvedNt * (t.workingPriceNtCt / 100));
                effectiveWorkingPriceCt = Math.round(((annualWorkGross / kwh) * 100) * 100) / 100;
            }
            const rawYearly = Math.round((annualWorkGross + baseYearGross) * 100) / 100;
            const totalPricePerMonthGross = Math.round((rawYearly / 12) * 100) / 100;
            const monthlyPayment = Math.ceil(totalPricePerMonthGross);
            const savings = Math.max(40, Math.round(yearlyOld - rawYearly));

            return {
                ...t,
                workingPriceCt: effectiveWorkingPriceCt,
                basePriceYearGross: baseYearGross,
                branch: normalizedBranch,
                meterType: resolvedMeterType,
                meterTypeId: resolvedMeterTypeId,
                consumptionHt: resolvedHt,
                consumptionNt: resolvedNt,
                monthlyPayment,
                monthlyAdvancePaymentGross: monthlyPayment,
                totalPricePerMonthGross,
                grossYearlyEur: rawYearly,
                savingsEur: savings,
                savingsYear: savings
            };
        });

        // Determine max savings
        const maxSavings = Math.max(...calculatedTariffs.map(t => t.savingsEur), 0);

        res.json({
            success: true,
            source: 'firstcon-reference',
            firstconConnected: true,
            plz: cleanPlz,
            consumption: kwh,
            consumptionHt: resolvedHt,
            consumptionNt: resolvedNt,
            meterType: resolvedMeterType,
            meterTypeId: resolvedMeterTypeId,
            currentAbschlag: abschlagOld,
            branch: normalizedBranch,
            maxSavings,
            tariffs: calculatedTariffs
        });
    } catch (error) {
        console.error("Tariff calculation error:", error);
        res.status(500).json({ success: false, error: 'Fehler bei der Tarifberechnung' });
    }
});

// ============================================================================
// 1.1b B2B & RLM PORTAL LIVE TARIFRECHNER & DATEN-RÜCKSPIELUNG (EXTERNAL API)
// ============================================================================

async function handleRlmCalculateRequest(req, res) {
    try {
        const payload = req.method === 'GET' ? req.query : (req.body || {});
        const result = await calculateRlmTariffs(payload);

        // Optional webhook/callback forwarding if external portal provided callbackUrl
        const callbackUrl = payload.callbackUrl || payload.webhookUrl;
        if (callbackUrl && typeof callbackUrl === 'string' && callbackUrl.startsWith('http')) {
            fetch(callbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'rlm_tariff_calculation', data: result })
            }).catch(err => console.warn('[RLM-API] Optional callbackUrl error:', err.message));
        }

        res.json(result);
    } catch (error) {
        console.error('[RLM-API] Calculation error:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler bei der B2B/RLM-Tarifberechnung: ' + error.message
        });
    }
}

app.post('/api/b2b/rlm-tarife/calculate', handleRlmCalculateRequest);
app.get('/api/b2b/rlm-tarife/calculate', handleRlmCalculateRequest);
app.post('/api/b2b/tarife/calculate', handleRlmCalculateRequest);
app.post('/api/rlm/calculate', handleRlmCalculateRequest);

// Address lookup helper (resolves City & Streets for a PLZ from the RLM portal)
app.get('/api/b2b/rlm-tarife/address', async (req, res) => {
    try {
        const address = await resolveDeliveryAddress({
            plz: req.query.plz || req.query.zip || '44379',
            city: req.query.city || req.query.ort,
            street: req.query.street || req.query.strasse,
            houseNumber: req.query.houseNumber || req.query.hausnummer
        });
        res.json({ success: true, ...address });
    } catch (error) {
        console.error('[RLM-API] Address lookup error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Dropdown options helper (Business Sectors, Load Profiles, Grid Layers, Gas Meters)
app.get('/api/b2b/rlm-tarife/options', async (req, res) => {
    try {
        const options = await getRlmPortalOptions(req.query.branch || req.query.sparte || 'strom');
        res.json(options);
    } catch (error) {
        console.error('[RLM-API] Options lookup error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit / Create Offer ("Bei Angebotserstellung" & "Tarifabschluss"):
// Automatically calculates RLM/SLP tariffs & Abschläge in vp.alpha-energie.de, creates the offer in the RLM portal,
// plays all customer & tariff data back to Alpha Energie, and returns the complete offer package + PDFs.
async function handleRlmLeadSubmit(req, res) {
    const startTime = Date.now();
    try {
        const body = req.body || {};
        const isOfferRoute = req.path.includes('offer') || req.path.includes('angebot');
        const isOffer = body.isOffer !== undefined ? Boolean(body.isOffer) : (isOfferRoute || body.mode === 'offer' || body.type === 'offer' || true);

        // 1. Live Tariff Calculation & Selection in the RLM Portal (if not pre-calculated or to get all runtime variants)
        let matchedTariff = body.selectedTariff || null;
        let allCalculatedTariffs = [];
        let drittkostenOverview = null;
        let resolvedQuery = null;

        if (!matchedTariff || body.recalculate !== false) {
            try {
                const calcResult = await calculateRlmTariffs({
                    ...body,
                    plz: body.plz || body.zip || (body.deliveryAddress && (body.deliveryAddress.plz || body.deliveryAddress.zip)) || '44379',
                    city: body.city || body.ort || (body.deliveryAddress && body.deliveryAddress.city),
                    street: body.street || body.strasse || (body.deliveryAddress && body.deliveryAddress.street),
                    houseNumber: body.houseNr || body.houseNumber || body.hausnummer || (body.deliveryAddress && (body.deliveryAddress.houseNr || body.deliveryAddress.houseNumber)) || '1',
                    consumption: body.consumption || body.verbrauch || body.jahresverbrauch || 100000
                });
                if (calcResult && Array.isArray(calcResult.tariffs) && calcResult.tariffs.length > 0) {
                    allCalculatedTariffs = calcResult.tariffs;
                    drittkostenOverview = calcResult.drittkostenOverview || null;
                    resolvedQuery = calcResult.query || null;
                    if (!matchedTariff) {
                        matchedTariff = calcResult.tariffs.find(t =>
                            (body.tariffId && (t.id === body.tariffId || t.tariffId === body.tariffId)) ||
                            (body.contractDurationMonths && Number(t.contractDurationMonths) === Number(body.contractDurationMonths)) ||
                            (body.laufzeit && Number(t.contractDurationMonths) === Number(body.laufzeit))
                        ) || calcResult.tariffs.find(t => t.isRecommended) || calcResult.tariffs[0];
                    }
                }
            } catch (calcErr) {
                console.warn('[RLM-API] Could not auto-calculate tariff during offer/submit:', calcErr.message);
            }
        }

        const randDigits = Math.floor(100000 + Math.random() * 900000);
        const yearStr = new Date().getFullYear();
        const offerNumber = `ANG-${yearStr}-${randDigits}`;
        const orderNumber = `RLM-${yearStr}-${randDigits}`;

        const branch = String(body.branch || body.sparte || (matchedTariff && matchedTariff.branch) || 'strom').toLowerCase();
        const measurement = String(body.measurement || body.messung || (matchedTariff && matchedTariff.measurement) || 'RLM').toUpperCase();
        const consumption = parseInt(body.consumption || body.verbrauch || body.jahresverbrauch || 100000, 10) || 100000;
        const peakLoad = parseInt(body.peakLoad || body.leistungKw || body.jahreshoechstleistung || (resolvedQuery && resolvedQuery.peakLoad) || 0, 10) || null;
        const usageHours = parseInt(body.usageHours || body.benutzungsstunden || (resolvedQuery && resolvedQuery.usageHours) || 0, 10) || null;
        const gridLayer = body.gridLayer || body.netzebene || body.druckstufe || (matchedTariff && matchedTariff.gridLayer) || 'LOW';
        const deliveryStart = body.deliveryStart || body.lieferbeginn || (matchedTariff && matchedTariff.deliveryFrom) || '2027-01-01';
        const deliveryTo = (matchedTariff && matchedTariff.deliveryTo) || null;

        const tariffId = body.tariffId || (matchedTariff && matchedTariff.id) || 'rlm-custom';
        const productId = body.productId || (matchedTariff && matchedTariff.productId) || (branch === 'gas' ? 1574 : 1573);
        const tariffName = body.tariffName || (matchedTariff && matchedTariff.name) || 'B2B RLM Sondertarif';
        const providerName = body.providerName || (matchedTariff && matchedTariff.providerName) || 'Alpha Energie Partner';
        const contractDurationMonths = parseInt(body.contractDurationMonths || body.laufzeit || (matchedTariff && matchedTariff.contractDurationMonths) || 12, 10);

        const workingPriceEnergyBaseCtNetto = parseFloat(body.workingPriceEnergyBaseCtNetto ?? (matchedTariff && matchedTariff.workingPriceEnergyBaseCtNetto) ?? 0);
        const surchargeCt = parseFloat(body.surchargeCt ?? body.aufschlagCt ?? (matchedTariff && matchedTariff.surchargeCtNetto) ?? 0);
        const workingPriceEnergyCtNetto = parseFloat(body.workingPriceEnergyCtNetto ?? body.workingPriceCt ?? (matchedTariff && matchedTariff.workingPriceEnergyCtNetto) ?? 0);
        const workingPriceDrittkostenCtNetto = parseFloat(body.workingPriceDrittkostenCtNetto ?? (matchedTariff && matchedTariff.workingPriceDrittkostenCtNetto) ?? 0);
        const workingPriceTotalCtNetto = parseFloat(body.workingPriceTotalCtNetto ?? (matchedTariff && matchedTariff.workingPriceTotalCtNetto) ?? workingPriceEnergyCtNetto);
        const workingPriceTotalCtBrutto = parseFloat(body.workingPriceTotalCtBrutto ?? (matchedTariff && matchedTariff.workingPriceTotalCtBrutto) ?? Math.round(workingPriceTotalCtNetto * 1.19 * 10000) / 10000);
        const basePriceMonthlyNetto = parseFloat(body.basePriceEnergyMonthlyNetto ?? body.basePriceEurMonth ?? (matchedTariff && matchedTariff.basePriceEnergyMonthlyNetto) ?? 0);
        const drittkostenYearlyNetto = parseFloat(body.drittkostenYearlyNetto ?? (matchedTariff && matchedTariff.drittkostenYearlyNetto) ?? 0);

        const totalYearlyNetto = parseFloat(body.totalYearlyNetto ?? body.netYearlyEur ?? (matchedTariff && matchedTariff.totalYearlyNetto) ?? 0);
        const totalYearlyBrutto = parseFloat(body.totalYearlyBrutto ?? body.grossYearlyEur ?? (matchedTariff && matchedTariff.totalYearlyBrutto) ?? 0);

        const abschlagMonthlyNetto = parseFloat(body.abschlagMonthlyNetto ?? body.monthlyPaymentNetto ?? body.monthlyPayment ?? (matchedTariff && matchedTariff.abschlagMonthlyNetto) ?? 0);
        const abschlagMonthlyBrutto = parseFloat(body.abschlagMonthlyBrutto ?? body.monthlyPaymentBrutto ?? (matchedTariff && matchedTariff.abschlagMonthlyBrutto) ?? Math.round(abschlagMonthlyNetto * 1.19 * 100) / 100);
        const abschlag11MonthlyNetto = parseFloat(body.abschlag11MonthlyNetto ?? (matchedTariff && matchedTariff.abschlag11MonthlyNetto) ?? (totalYearlyNetto ? Math.round((totalYearlyNetto / 11) * 100) / 100 : 0));
        const abschlag11MonthlyBrutto = parseFloat(body.abschlag11MonthlyBrutto ?? (matchedTariff && matchedTariff.abschlag11MonthlyBrutto) ?? Math.round(abschlag11MonthlyNetto * 1.19 * 100) / 100);
        const savingsYearlyNetto = parseFloat(body.savingsYearlyNetto ?? body.savings ?? (matchedTariff && matchedTariff.savingsYearlyNetto) ?? 0);

        // Customer & Company fields
        const companyName = String(body.companyName || body.firma || body.unternehmen || '').trim();
        const legalForm = String(body.legalForm || body.rechtsform || 'GmbH').trim();
        const salutation = String(body.salutation || body.anrede || 'Herr').trim();
        const firstName = String(body.firstName || body.vorname || (body.contactName ? String(body.contactName).split(' ')[0] : '') || companyName || 'Gewerbekunde').trim();
        const lastName = String(body.lastName || body.nachname || (body.contactName ? String(body.contactName).split(' ').slice(1).join(' ') : '') || companyName || 'B2B').trim();
        const email = String(body.email || body.mail || '').trim();
        const phone = String(body.phone || body.telefon || body.tel || '').trim();
        const plz = String(body.plz || body.zip || (resolvedQuery && resolvedQuery.address && resolvedQuery.address.zip) || '44379').trim();
        const city = String(body.city || body.ort || (resolvedQuery && resolvedQuery.address && resolvedQuery.address.city) || '').trim();
        const street = String(body.street || body.strasse || (resolvedQuery && resolvedQuery.address && resolvedQuery.address.street) || '').trim();
        const houseNr = String(body.houseNr || body.houseNumber || body.hausnummer || (resolvedQuery && resolvedQuery.address && resolvedQuery.address.houseNumber) || '1').trim();
        const meterNumber = String(body.meterNumber || body.zaehlernummer || body.maloId || 'B2B-ANFRAGE').trim();
        const maloId = String(body.maloId || body.marktlokationsId || '').trim();
        const currentProvider = String(body.currentProvider || body.vorversorger || '').trim();
        const iban = String(body.iban || 'AUF-ANFRAGE').trim();
        const portalSource = String(body.portalSource || body.source || req.headers.origin || 'External B2B Portal').trim();
        const partnerCode = String(body.partnerCode || body.affiliateCode || body.vermittler || '10011').trim();
        const notes = String(body.notes || body.bemerkung || body.message || '').trim();

        // 2. Create Offer / Documents in RLM Portal (`vp.alpha-energie.de`) if enabled
        let vpPortalResult = { vpOrderId: null, vpOrderNumber: null, documents: [], vpPortalError: null };
        const shouldGenerateDocs = body.generateDocuments !== undefined ? Boolean(body.generateDocuments) : Boolean(body.includePdf || body.withDocuments);
        if (body.syncToVpPortal !== false) {
            try {
                vpPortalResult = await createVpPortalOffer(
                    {
                        ...body,
                        companyName: companyName || `${firstName} ${lastName}`,
                        legalForm,
                        salutation,
                        firstName,
                        lastName,
                        email: email || 'b2b@alpha-energie.de',
                        phone,
                        plz,
                        city,
                        street,
                        houseNumber: houseNr,
                        branch,
                        measurement,
                        consumption,
                        peakLoad,
                        usageHours,
                        gridLayer,
                        deliveryStart,
                        contractDurationMonths,
                        productId,
                        surchargeCt,
                        meterNumber: meterNumber !== 'B2B-ANFRAGE' ? meterNumber : '',
                        maloId,
                        isOffer: true,
                        generateDocuments: shouldGenerateDocs
                    },
                    matchedTariff
                );
            } catch (vpErr) {
                console.warn('[RLM-API] VP portal offer creation warning:', vpErr.message);
            }
        }

        const finalCity = city || (vpPortalResult.resolvedAddress && vpPortalResult.resolvedAddress.city) || '';
        const finalStreet = street || (vpPortalResult.resolvedAddress && vpPortalResult.resolvedAddress.street) || '';
        const validUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        const offerSummary = {
            offerNumber,
            orderNumber,
            vpOrderId: vpPortalResult.vpOrderId,
            vpOrderNumber: vpPortalResult.vpOrderNumber,
            createdAt: new Date().toISOString(),
            validUntil,
            type: isOffer ? 'ANGEBOT' : 'AUFTRAG',
            customer: {
                companyName: companyName || `${firstName} ${lastName}`,
                legalForm,
                contactPerson: `${salutation} ${firstName} ${lastName}`.trim(),
                email,
                phone,
                deliveryAddress: `${finalStreet} ${houseNr}, ${plz} ${finalCity}`.trim()
            },
            supplyData: {
                branch: branch.toUpperCase(),
                measurement,
                gridLayer,
                consumptionKwh: consumption,
                peakLoadKw: peakLoad,
                usageHours,
                deliveryStart,
                deliveryTo,
                contractDurationMonths,
                meterNumber: meterNumber !== 'B2B-ANFRAGE' ? meterNumber : null,
                maloId: maloId || null
            },
            pricing: {
                tariffId,
                tariffName,
                providerName,
                workingPriceEnergyBaseCtNetto,
                surchargeCtNetto: surchargeCt,
                workingPriceEnergyCtNetto,
                workingPriceDrittkostenCtNetto,
                workingPriceTotalCtNetto,
                workingPriceTotalCtBrutto,
                basePriceMonthlyNetto,
                drittkostenYearlyNetto,
                totalYearlyNetto,
                totalYearlyBrutto,
                abschlagMonthlyNetto,
                abschlagMonthlyBrutto,
                abschlag11MonthlyNetto,
                abschlag11MonthlyBrutto,
                savingsYearlyNetto
            }
        };

        const leadRecord = {
            offerNumber,
            orderNumber,
            vpOrderId: vpPortalResult.vpOrderId,
            vpOrderNumber: vpPortalResult.vpOrderNumber,
            createdAt: new Date().toISOString(),
            validUntil,
            recordType: isOffer ? 'OFFER' : 'ORDER',
            status: isOffer ? 'OFFER_CREATED' : 'RECEIVED',
            portalSource,
            partnerCode,
            company: {
                companyName,
                legalForm,
                salutation,
                firstName,
                lastName,
                email,
                phone,
                iban
            },
            deliveryAddress: {
                street: finalStreet,
                houseNr,
                plz,
                city: finalCity
            },
            technicalData: {
                branch,
                measurement,
                consumption,
                peakLoad,
                usageHours,
                gridLayer,
                deliveryStart,
                deliveryTo,
                meterNumber,
                maloId,
                currentProvider
            },
            tariffSelection: {
                tariffId,
                productId,
                tariffName,
                providerName,
                contractDurationMonths,
                workingPriceEnergyBaseCtNetto,
                surchargeCt,
                workingPriceEnergyCtNetto,
                workingPriceDrittkostenCtNetto,
                workingPriceTotalCtNetto,
                workingPriceTotalCtBrutto,
                basePriceMonthlyNetto,
                drittkostenYearlyNetto,
                totalYearlyNetto,
                totalYearlyBrutto,
                abschlagMonthlyNetto,
                abschlagMonthlyBrutto,
                abschlag11MonthlyNetto,
                abschlag11MonthlyBrutto,
                savingsYearlyNetto
            },
            documents: vpPortalResult.documents || [],
            notes,
            rawMatchedTariff: matchedTariff
        };

        // 3. Persist complete record in data/b2b_rlm_leads.json and data/b2b_rlm_offers.json
        try {
            const leadsFile = path.join(__dirname, 'data', 'b2b_rlm_leads.json');
            fs.mkdirSync(path.dirname(leadsFile), { recursive: true });
            const existingLeads = fs.existsSync(leadsFile)
                ? JSON.parse(fs.readFileSync(leadsFile, 'utf8') || '[]')
                : [];
            existingLeads.unshift(leadRecord);
            fs.writeFileSync(leadsFile, JSON.stringify(existingLeads, null, 2), 'utf8');

            const offersFile = path.join(__dirname, 'data', 'b2b_rlm_offers.json');
            const existingOffers = fs.existsSync(offersFile)
                ? JSON.parse(fs.readFileSync(offersFile, 'utf8') || '[]')
                : [];
            existingOffers.unshift(leadRecord);
            fs.writeFileSync(offersFile, JSON.stringify(existingOffers, null, 2), 'utf8');
        } catch (fileErr) {
            console.warn('[RLM-API] Could not write to b2b_rlm_leads/offers.json:', fileErr.message);
        }

        // 4. Save in Prisma EnergyOrder + ContactRequest so it appears immediately in the Alpha Energie Admin Dashboard
        let dbOrder = null;
        try {
            dbOrder = await prisma.energyOrder.create({
                data: {
                    orderNumber: isOffer ? offerNumber : orderNumber,
                    tariffId,
                    tariffName: companyName ? `[ANGEBOT] ${tariffName} (${companyName})` : `[ANGEBOT] ${tariffName}`,
                    branch,
                    consumption,
                    monthlyPayment: abschlagMonthlyNetto || 0,
                    savings: savingsYearlyNetto || null,
                    street: finalStreet || '-',
                    houseNr: houseNr || '-',
                    plz: plz || '-',
                    city: finalCity || '-',
                    meterNumber,
                    currentProvider: currentProvider || null,
                    cancelOldContract: body.cancelOldContract !== false,
                    salutation: salutation || null,
                    firstName,
                    lastName,
                    birthDate: body.birthDate || null,
                    email: email || 'b2b@alpha-energie.de',
                    phone: phone || '-',
                    iban,
                    status: isOffer ? 'OFFER_CREATED' : 'RECEIVED'
                }
            });

            await prisma.contactRequest.create({
                data: {
                    name: companyName ? `${companyName} (${firstName} ${lastName})` : `${firstName} ${lastName}`,
                    phone: phone || '',
                    email: email || 'b2b@alpha-energie.de',
                    subject: `B2B/RLM Angebotserstellung [${offerNumber}] – ${tariffName} (${consumption.toLocaleString('de-DE')} kWh)`,
                    message: `Quelle: ${portalSource}${partnerCode ? ` | Partner: ${partnerCode}` : ''}\n` +
                        `Angebots-Nr.: ${offerNumber}${vpPortalResult.vpOrderNumber ? ` | RLM-Portal-Nr.: ${vpPortalResult.vpOrderNumber}` : ''}\n` +
                        `Sparte: ${branch.toUpperCase()} (${measurement}) | Verbrauch: ${consumption.toLocaleString('de-DE')} kWh${peakLoad ? ` | Leistung: ${peakLoad} kW` : ''}\n` +
                        `Tarif: ${tariffName} (${providerName}, ${contractDurationMonths}M)\n` +
                        `Arbeitspreis Energie: ${workingPriceEnergyCtNetto} ct/kWh (Gesamt inkl. Netz/Umlagen: ${workingPriceTotalCtNetto} ct/kWh)\n` +
                        `Grundpreis: ${basePriceMonthlyNetto} €/Monat\n` +
                        `Monatlicher Abschlag (12x): ${abschlagMonthlyNetto} € Netto (${abschlagMonthlyBrutto} € Brutto)\n` +
                        `Monatlicher Abschlag (11x): ${abschlag11MonthlyNetto} € Netto (${abschlag11MonthlyBrutto} € Brutto)\n` +
                        `Jahresgesamtkosten: ${totalYearlyNetto} € Netto (${totalYearlyBrutto} € Brutto)\n` +
                        `Lieferadresse: ${finalStreet} ${houseNr}, ${plz} ${finalCity}\n` +
                        `Zähler/MaLo: ${meterNumber}${maloId ? ` / ${maloId}` : ''}\n` +
                        (notes ? `Notiz: ${notes}` : '')
                }
            });
        } catch (dbErr) {
            console.warn('[RLM-API] Database save warning:', dbErr.message);
        }

        // 5. Send notification email to Alpha Energie & confirmation to customer
        try {
            const transporter = typeof getMailTransporter === 'function' ? getMailTransporter() : null;
            if (transporter) {
                const adminEmail = process.env.NOTIFICATION_EMAIL || 'info@alpha-energy.network';
                const summaryHtml = `
                    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px;">
                        <h2 style="color: #0a1f44; margin-top: 0;">Neue B2B / RLM Angebotserstellung (${offerNumber})</h2>
                        <p>Über das B2B-Tarifrechner-Portal (<strong>${escapeHtml(portalSource)}</strong>) wurde ein neues Angebot erstellt und an Alpha Energie zurückgespielt.</p>
                        <div style="background: #f8fafc; border-left: 4px solid #ff7a00; padding: 16px; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0; color: #0a1f44;">Berechneter Tarif & Abschläge</h3>
                            <p style="margin: 4px 0;"><strong>Angebots-Nr.:</strong> ${offerNumber} (Auftrags-Ref: ${orderNumber})</p>
                            <p style="margin: 4px 0;"><strong>Tarif:</strong> ${escapeHtml(tariffName)} (${escapeHtml(providerName)})</p>
                            <p style="margin: 4px 0;"><strong>Laufzeit:</strong> ${contractDurationMonths} Monate${deliveryStart ? ` (Lieferbeginn: ${escapeHtml(deliveryStart)})` : ''}</p>
                            <p style="margin: 4px 0;"><strong>Sparte / Messung:</strong> ${escapeHtml(branch.toUpperCase())} / ${escapeHtml(measurement)} (Netzebene: ${escapeHtml(gridLayer)})</p>
                            <p style="margin: 4px 0;"><strong>Jahresverbrauch:</strong> ${consumption.toLocaleString('de-DE')} kWh${peakLoad ? ` | Spitzenlast: ${peakLoad} kW` : ''}</p>
                            <p style="margin: 4px 0;"><strong>Arbeitspreis Energie (Netto):</strong> ${workingPriceEnergyCtNetto} ct/kWh (All-In inkl. Netz/Abgaben: ${workingPriceTotalCtNetto} ct/kWh)</p>
                            <p style="margin: 4px 0;"><strong>Grundpreis (Netto):</strong> ${basePriceMonthlyNetto} €/Monat</p>
                            <p style="margin: 8px 0 4px 0; font-size: 1.05rem; color: #0f172a;"><strong>Monatlicher Abschlag (12x Netto):</strong> ${abschlagMonthlyNetto.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € / Monat</p>
                            <p style="margin: 4px 0; font-size: 1.05rem; color: #0f172a;"><strong>Monatlicher Abschlag (12x Brutto inkl. 19% MwSt.):</strong> ${abschlagMonthlyBrutto.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € / Monat</p>
                            <p style="margin: 4px 0;"><strong>Jahresgesamtkosten:</strong> ${totalYearlyNetto.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € Netto (${totalYearlyBrutto.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € Brutto)</p>
                        </div>
                        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0; color: #0a1f44;">Kunden- & Lieferstellendaten</h3>
                            ${companyName ? `<p style="margin: 4px 0;"><strong>Unternehmen:</strong> ${escapeHtml(companyName)} ${escapeHtml(legalForm)}</p>` : ''}
                            <p style="margin: 4px 0;"><strong>Ansprechpartner:</strong> ${escapeHtml(salutation)} ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
                            <p style="margin: 4px 0;"><strong>E-Mail / Telefon:</strong> ${escapeHtml(email)} | ${escapeHtml(phone)}</p>
                            <p style="margin: 4px 0;"><strong>Lieferadresse:</strong> ${escapeHtml(finalStreet)} ${escapeHtml(houseNr)}, ${escapeHtml(plz)} ${escapeHtml(finalCity)}</p>
                            <p style="margin: 4px 0;"><strong>Zählernummer / MaLo-ID:</strong> ${escapeHtml(meterNumber)} ${maloId ? `/ ${escapeHtml(maloId)}` : ''}</p>
                            ${partnerCode ? `<p style="margin: 4px 0;"><strong>Vertriebspartner-Code:</strong> ${escapeHtml(partnerCode)}</p>` : ''}
                            ${notes ? `<p style="margin: 4px 0;"><strong>Bemerkung:</strong> ${escapeHtml(notes)}</p>` : ''}
                        </div>
                    </div>
                `;

                transporter.sendMail({
                    from: getSenderEmail(),
                    to: adminEmail,
                    subject: `B2B/RLM Angebot [${offerNumber}] – ${companyName || (firstName + ' ' + lastName)} (${consumption.toLocaleString('de-DE')} kWh)`,
                    html: summaryHtml
                }).catch(err => console.warn('[RLM-API] Admin notification email error:', err.message));

                if (email && email.includes('@') && body.sendCustomerEmail !== false) {
                    transporter.sendMail({
                        from: getSenderEmail(),
                        to: email,
                        subject: `Ihr B2B-Energieangebot von Alpha Energie (${offerNumber})`,
                        html: summaryHtml
                    }).catch(err => console.warn('[RLM-API] Customer confirmation email error:', err.message));
                }
            }
        } catch (mailErr) {
            console.warn('[RLM-API] Email dispatch warning:', mailErr.message);
        }

        // Optional callbackUrl/webhookUrl forwarding
        const callbackUrl = body.callbackUrl || body.webhookUrl;
        if (callbackUrl && typeof callbackUrl === 'string' && callbackUrl.startsWith('http')) {
            fetch(callbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'rlm_offer_created',
                    offerNumber,
                    orderNumber,
                    offerSummary,
                    selectedTariff: matchedTariff || leadRecord.tariffSelection,
                    tariffs: allCalculatedTariffs,
                    documents: vpPortalResult.documents || [],
                    lead: leadRecord
                })
            }).catch(err => console.warn('[RLM-API] Optional callbackUrl error:', err.message));
        }

        res.status(201).json({
            success: true,
            responseTimeMs: Date.now() - startTime,
            offerNumber,
            orderNumber,
            vpOrderId: vpPortalResult.vpOrderId,
            vpOrderNumber: vpPortalResult.vpOrderNumber,
            validUntil,
            message: 'B2B/RLM Angebot inkl. Tarifauswahl und Abschlägen erfolgreich erstellt und an Alpha Energie zurückgespielt.',
            offerSummary,
            selectedTariff: matchedTariff || leadRecord.tariffSelection,
            tariffs: allCalculatedTariffs,
            drittkostenOverview,
            documents: vpPortalResult.documents || [],
            offer: leadRecord,
            lead: leadRecord,
            dbOrderId: dbOrder ? dbOrder.id : null
        });
    } catch (error) {
        console.error('[RLM-API] Offer/Lead submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler bei der B2B/RLM-Angebotserstellung: ' + error.message
        });
    }
}

// Primary endpoints for Offer Creation ("Bei Angebotserstellung") & Lead/Order Submission
app.post('/api/b2b/rlm-tarife/offer', handleRlmLeadSubmit);
app.post('/api/b2b/rlm-tarife/angebot', handleRlmLeadSubmit);
app.post('/api/b2b/rlm-tarife/create-offer', handleRlmLeadSubmit);
app.post('/api/b2b/tarife/offer', handleRlmLeadSubmit);
app.post('/api/rlm/offer', handleRlmLeadSubmit);

app.post('/api/b2b/rlm-tarife/submit', handleRlmLeadSubmit);
app.post('/api/b2b/rlm-tarife/lead', handleRlmLeadSubmit);
app.post('/api/b2b/order/submit', handleRlmLeadSubmit);
app.post('/api/rlm/submit', handleRlmLeadSubmit);

// Generate official RLM Portal PDF documents ("Angebot.pdf" & "Auftragsformular.pdf") on demand
app.post('/api/b2b/rlm-tarife/documents', async (req, res) => {
    try {
        const docs = await generateVpOrderDocuments(req.body || {});
        res.json({ success: true, count: docs.length, documents: docs });
    } catch (error) {
        console.error('[RLM-API] Documents generation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Retrieve created B2B/RLM offers & leads
app.get('/api/b2b/rlm-tarife/offers', async (req, res) => {
    try {
        const offersFile = path.join(__dirname, 'data', 'b2b_rlm_offers.json');
        const offers = fs.existsSync(offersFile)
            ? JSON.parse(fs.readFileSync(offersFile, 'utf8') || '[]')
            : [];
        res.json({ success: true, count: offers.length, offers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/b2b/rlm-tarife/leads', async (req, res) => {
    try {
        const leadsFile = path.join(__dirname, 'data', 'b2b_rlm_leads.json');
        const leads = fs.existsSync(leadsFile)
            ? JSON.parse(fs.readFileSync(leadsFile, 'utf8') || '[]')
            : [];
        res.json({ success: true, count: leads.length, leads });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Retrieve live orders/offers directly from vp.alpha-energie.de
app.get('/api/b2b/rlm-tarife/vp-orders', async (req, res) => {
    try {
        const orders = await getVpPortalOrders(req.query.limit || 20);
        res.json({ success: true, ...orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Sync or refresh VP portal session tokens
app.post('/api/b2b/rlm-tarife/sync-token', async (req, res) => {
    try {
        if (req.body && req.body.cookies && typeof req.body.cookies === 'object') {
            saveCookiesToDisk(req.body.cookies);
            return res.json({ success: true, message: 'VP portal cookies updated successfully' });
        }
        const cookies = await ensureFreshVpSession(true);
        res.json({
            success: true,
            message: 'VP portal session refreshed successfully',
            hasSession: Boolean(cookies && cookies.session)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 1.1c Live IBAN Verification Endpoint (/Verification/VerifyBankAccount + ISO-7064 Mod-97-10)
const handleVerifyIban = async (req, res) => {
    try {
        const rawIban = (req.body && req.body.iban) || req.query.iban || '';
        const token = (req.body && req.body.token) || req.query.token || process.env.FIRSTCON_ORDERFLOW_TOKEN;
        if (!rawIban) {
            return res.status(400).json({ success: false, valid: false, error: 'Bitte eine IBAN angeben.' });
        }
        const verification = await firstconService.verifyBankAccount(rawIban, token);
        res.json({
            success: true,
            ...verification
        });
    } catch (error) {
        res.status(500).json({ success: false, valid: false, error: error.message });
    }
};
app.post(['/api/verify-iban', '/api/tarife/verify-iban', '/api/firstcon/verify-iban'], handleVerifyIban);
app.get(['/api/verify-iban', '/api/tarife/verify-iban', '/api/firstcon/verify-iban'], handleVerifyIban);

// Helper: Resolve PartnerUser and calculate commission + agency override for an order
async function resolveOrderPartnerAttribution({ partnerCode, partnerId, subId, branch = 'strom', orderSource }) {
    let partner = null;
    if (partnerId) {
        partner = await prisma.partnerUser.findUnique({ where: { id: Number(partnerId) } }).catch(() => null);
    }
    const cleanCode = String(partnerCode || '').trim();
    if (!partner && cleanCode) {
        partner = await prisma.partnerUser.findFirst({
            where: {
                OR: [
                    { partnerCode: cleanCode },
                    { partnerCode: cleanCode.toUpperCase() },
                    { email: cleanCode.toLowerCase() }
                ]
            }
        }).catch(() => null);
    }

    if (!partner) {
        return {
            partnerId: null,
            partnerCode: cleanCode || null,
            subId: subId ? String(subId).trim() : null,
            orderSource: orderSource || (cleanCode ? 'AFFILIATE' : 'ONLINE'),
            commissionStatus: cleanCode ? 'PENDING' : 'NONE',
            commissionAmount: cleanCode ? 45.0 : 0,
            overridePartnerId: null,
            overrideAmount: 0
        };
    }

    if (partner.status === 'SUSPENDED') {
        return {
            partnerId: partner.id,
            partnerCode: partner.partnerCode,
            subId: subId ? String(subId).trim() : null,
            orderSource: orderSource || 'ONLINE',
            commissionStatus: 'NONE',
            commissionAmount: 0,
            overridePartnerId: null,
            overrideAmount: 0
        };
    }

    const normBranch = String(branch || 'strom').toLowerCase();
    let commAmount = partner.stromCommissionEur || 55.0;
    if (normBranch === 'gas') commAmount = partner.gasCommissionEur || 55.0;
    else if (normBranch === 'waerme' || normBranch === 'ladestrom') commAmount = partner.waermeCommissionEur || partner.stromCommissionEur || 60.0;

    let overridePartnerId = null;
    let overrideAmount = 0;
    if (partner.parentPartnerId) {
        const parent = await prisma.partnerUser.findUnique({ where: { id: partner.parentPartnerId } }).catch(() => null);
        if (parent && parent.status === 'ACTIVE') {
            overridePartnerId = parent.id;
            overrideAmount = parent.overrideCommissionEur || 10.0;
        }
    }

    const resolvedSource = orderSource || (partner.role === 'D2D' ? 'D2D' : (partner.role === 'TIPPGEBER' ? 'TIPPGEBER' : 'AFFILIATE'));

    return {
        partnerId: partner.id,
        partnerCode: partner.partnerCode,
        subId: subId ? String(subId).trim() : null,
        orderSource: resolvedSource,
        commissionStatus: 'PENDING',
        commissionAmount: commAmount,
        overridePartnerId,
        overrideAmount
    };
}

// 1.2 Submit Order / Switching Application
app.post('/api/order/submit', async (req, res) => {
    try {
        const {
            tariffId,
            tariffName,
            branch = 'strom',
            consumption,
            monthlyPayment,
            savings,
            street,
            houseNr,
            plz,
            city,
            meterNumber,
            currentProvider,
            cancelOldContract = true,
            salutation,
            firstName,
            lastName,
            birthDate,
            email,
            phone,
            iban,
            partnerCode,
            refCode,
            aff,
            ref,
            partnerId,
            subId,
            sub_id,
            subid,
            orderSource,
            signatureData
        } = req.body;

        if (!tariffName || !email || !firstName || !lastName || !meterNumber || !iban) {
            return res.status(400).json({
                success: false,
                error: 'Bitte füllen Sie alle erforderlichen Pflichtfelder (Name, E-Mail, Zählernummer, IBAN) aus.'
            });
        }

        const orderNumber = 'AE-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
        const rawPartnerCode = partnerCode || refCode || aff || ref || null;
        const rawSubId = subId || sub_id || subid || null;

        const attribution = await resolveOrderPartnerAttribution({
            partnerCode: rawPartnerCode,
            partnerId,
            subId: rawSubId,
            branch,
            orderSource
        });

        const ibanCheck = firstconService.validateIbanMod97(iban);

        const newOrder = await prisma.energyOrder.create({
            data: {
                orderNumber,
                tariffId: tariffId || 'alpha-easy-12',
                tariffName,
                branch: branch || 'strom',
                consumption: parseInt(consumption, 10) || 2500,
                monthlyPayment: parseFloat(monthlyPayment) || 0,
                savings: savings ? parseFloat(savings) : null,
                street: street || '',
                houseNr: houseNr || '',
                plz: plz || '',
                city: city || '',
                meterNumber,
                currentProvider: currentProvider || null,
                cancelOldContract: cancelOldContract !== false,
                salutation: salutation || null,
                firstName,
                lastName,
                birthDate: birthDate || null,
                email,
                phone: phone || '',
                iban: ibanCheck.clean || iban,
                status: 'RECEIVED',
                partnerId: attribution.partnerId,
                partnerCode: attribution.partnerCode,
                subId: attribution.subId,
                orderSource: attribution.orderSource,
                commissionStatus: attribution.commissionStatus,
                commissionAmount: attribution.commissionAmount,
                overridePartnerId: attribution.overridePartnerId,
                overrideAmount: attribution.overrideAmount,
                signatureData: signatureData || null,
                signedAt: signatureData ? new Date() : null,
                ibanValid: ibanCheck.valid,
                bankName: ibanCheck.bankName || null,
                bic: ibanCheck.bic || null,
                notes: JSON.stringify({
                    statusMessage: attribution.partnerCode
                        ? `Über Versorgerseite-Affiliate-Link (${attribution.partnerCode}${attribution.subId ? ' / ' + attribution.subId : ''}) eingegangen – Netzbetreiber-Prüfung läuft.`
                        : 'Online-Auftrag über Versorgerseite eingegangen – Vorprüfung läuft.',
                    statusUpdatedAt: new Date().toISOString()
                })
            }
        });

        // Mark latest matching AffiliateClick as converted if applicable
        if (attribution.partnerCode) {
            try {
                const latestClick = await prisma.affiliateClick.findFirst({
                    where: {
                        partnerCode: attribution.partnerCode,
                        converted: false
                    },
                    orderBy: { createdAt: 'desc' }
                });
                if (latestClick) {
                    await prisma.affiliateClick.update({
                        where: { id: latestClick.id },
                        data: { converted: true, orderNumber }
                    });
                }
            } catch (clickErr) {
                // Non-blocking
            }
        }

        // Forward order to Firstcon Orderflow API v2 (Validation & Contract submission)
        let firstconResult = null;
        try {
            firstconResult = await firstconService.submitOrderToFirstcon({
                ...req.body,
                orderNumber
            });
            if (firstconResult && firstconResult.firstconContractId) {
                await prisma.energyOrder.update({
                    where: { id: newOrder.id },
                    data: {
                        firstconContractId: String(firstconResult.firstconContractId),
                        ibanValid: firstconResult.ibanValid ?? ibanCheck.valid
                    }
                }).catch(() => null);
            }
        } catch (fcOrderErr) {
            console.warn("[Firstcon Orderflow] Order forwarding warning:", fcOrderErr.message);
            firstconResult = {
                firstconConnected: false,
                validated: false,
                error: fcOrderErr.message
            };
        }

        // Customer confirmation email + order form is sent directly by Firstcon (SendMailOrderConfirmation: true + ClickwrapperId).
        // Only send local fallback confirmation if Firstcon submission did not complete.
        if (!firstconResult || !firstconResult.contractSubmitted) {
            try {
                const transporter = getMailTransporter();
                if (transporter && email) {
                    const subject = `Ihre Auftragsbestätigung bei Alpha Energie (Auftrags-Nr. ${orderNumber})`;
                    const mailHtml = `
                        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <h2 style="color: #0a1f44;">Herzlich willkommen bei der Alpha Energie GmbH!</h2>
                            <p>Hallo ${escapeHtml(firstName)} ${escapeHtml(lastName)},</p>
                            <p>vielen Dank für Ihr Vertrauen in Alpha Energie. Ihr Wechselauftrag ist erfolgreich bei uns eingegangen.</p>
                            <div style="background: #f8fafc; border-left: 4px solid #ff7a00; padding: 15px; margin: 20px 0;">
                                <p style="margin: 4px 0;"><strong>Auftragsnummer:</strong> ${orderNumber}</p>
                                <p style="margin: 4px 0;"><strong>Gewählter Tarif:</strong> ${escapeHtml(tariffName)}</p>
                                <p style="margin: 4px 0;"><strong>Zählernummer:</strong> ${escapeHtml(meterNumber)}</p>
                                <p style="margin: 4px 0;"><strong>Monatlicher Abschlag:</strong> ${monthlyPayment} €</p>
                                <p style="margin: 4px 0;"><strong>Lieferadresse:</strong> ${escapeHtml(street)} ${escapeHtml(houseNr)}, ${escapeHtml(plz)} ${escapeHtml(city)}</p>
                            </div>
                            <h3 style="color: #0a1f44;">Wie geht es weiter?</h3>
                            <ol style="line-height: 1.6;">
                                <li>Wir prüfen Ihre Angaben und melden den Wechsel bei Ihrem örtlichen Netzbetreiber an.</li>
                                <li>Falls gewünscht, kündigen wir Ihren bisherigen Vertrag kostenlos und fristgerecht.</li>
                                <li>Sie erhalten rechtzeitig vor Lieferbeginn Ihre Vertragsbestätigung per Post oder E-Mail.</li>
                            </ol>
                            <p style="color: #64748b; font-size: 0.9rem; margin-top: 30px;">
                                Alpha Energie GmbH • Alter Hellweg 50, 44379 Dortmund<br>
                                Kundenservice: 0231 39989390 • E-Mail: info@alpha-energie.de
                            </p>
                        </div>
                    `;
                    transporter.sendMail({
                        from: getSenderEmail(),
                        to: email,
                        subject,
                        html: mailHtml
                    }).catch(err => console.error("Error sending order confirmation email:", err));
                }
            } catch (mailErr) {
                console.warn("Could not send confirmation email:", mailErr.message);
            }
        }

        res.status(201).json({
            success: true,
            orderNumber: (firstconResult && firstconResult.firstconContractId) ? firstconResult.firstconContractId : orderNumber,
            internalOrderNumber: orderNumber,
            partnerCode: attribution.partnerCode,
            commissionAmount: attribution.commissionAmount,
            partnerAttribution: attribution,
            firstcon: firstconResult,
            message: 'Ihr Auftrag wurde erfolgreich an Firstcon übermittelt! Sie erhalten Ihre Auftragsbestätigung inkl. Vertragsunterlagen per E-Mail.'
        });
    } catch (error) {
        console.error("Order submission error:", error);
        res.status(500).json({ success: false, error: 'Fehler beim Übermitteln des Auftrags: ' + error.message });
    }
});

// 1.3 Submit Meter Reading (Zählerstand melden)
app.post('/api/zaehlerstand/submit', async (req, res) => {
    try {
        const { energyType, contractNumber, meterNumber, reading, readingDate, customerName, email, notes } = req.body;
        if (!meterNumber || reading === undefined || !customerName || !email) {
            return res.status(400).json({
                success: false,
                error: 'Bitte füllen Sie Energieart, Vertragsnummer, Zählernummer, Zählerstand, Name und E-Mail aus.'
            });
        }

        const trimmedEnergy = energyType ? String(energyType).trim() : '';
        const trimmedContract = contractNumber ? String(contractNumber).trim() : '';
        const trimmedNotes = notes ? String(notes).trim() : '';
        const metaParts = [];
        if (trimmedEnergy && !trimmedNotes.includes(trimmedEnergy)) {
            metaParts.push(`Energieart: ${trimmedEnergy}`);
        }
        if (trimmedContract && !trimmedNotes.includes(trimmedContract)) {
            metaParts.push(`Vertragsnr.: ${trimmedContract}`);
        }
        if (trimmedNotes) {
            metaParts.push(trimmedNotes);
        }
        const combinedNotes = metaParts.length > 0 ? metaParts.join(' | ') : null;

        const newReading = await prisma.meterReading.create({
            data: {
                meterNumber,
                reading: parseFloat(reading),
                readingDate: readingDate || new Date().toISOString().split('T')[0],
                customerName,
                email,
                notes: combinedNotes
            }
        });

        res.status(201).json({
            success: true,
            message: 'Zählerstand erfolgreich übermittelt. Vielen Dank!',
            id: newReading.id
        });
    } catch (error) {
        console.error("Meter reading error:", error);
        res.status(500).json({ success: false, error: 'Fehler beim Erfassen des Zählerstands' });
    }
});

// Helper: Encode string to PDF 1.4 WinAnsi literal string with octal escapes for non-ASCII chars
function toPdfWinAnsiString(input) {
    const str = String(input == null ? '' : input)
        .replace(/€/g, 'EUR')
        .replace(/[–—]/g, '-')
        .replace(/[„“”]/g, '"')
        .replace(/[’‘]/g, "'")
        .replace(/•/g, '-');
    let out = '(';
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code === 40 || code === 41 || code === 92) {
            out += '\\' + str[i];
        } else if (code >= 32 && code <= 126) {
            out += str[i];
        } else if (code >= 160 && code <= 255) {
            out += '\\' + code.toString(8).padStart(3, '0');
        } else {
            out += ' ';
        }
    }
    out += ')';
    return out;
}

// Helper: Generate valid PDF 1.4 Buffer for Kündigung (§ 312k BGB) or Widerruf (EU 2023/2673)
function generateLegalConfirmationPdfBuffer(details) {
    const isWiderruf = details.type === 'WIDERRUF';
    const docTitle = isWiderruf
        ? 'Eingangsbestätigungsdokument - Vertragswiderruf'
        : 'Eingangsbestätigung der Kündigung gem. § 312k BGB';
    const subTitle = isWiderruf
        ? 'Bestätigung über den Eingang Ihrer Widerrufserklärung auf einem dauerhaften Datenträger'
        : 'Dokumentation Ihrer elektronischen Kündigungserklärung zum dauerhaften Speichern';

    const ops = [];
    // Header Banner (Navy #0a1f44)
    ops.push('0.039 0.122 0.267 rg');
    ops.push('0 755 595 87 re f');
    // Orange Accent Bar (#ff7a00)
    ops.push('1 0.478 0 rg');
    ops.push('0 751 595 4 re f');

    // Header Text (White)
    ops.push('BT /F2 16 Tf 1 1 1 rg 45 805 Td ' + toPdfWinAnsiString('ALPHA ENERGIE') + ' Tj ET');
    ops.push('BT /F1 9.5 Tf 0.82 0.87 0.95 rg 45 788 Td ' + toPdfWinAnsiString('Eine Marke der Firstcon GmbH  |  Energielieferung (Ökostrom & Erdgas)') + ' Tj ET');
    ops.push('BT /F1 9 Tf 0.82 0.87 0.95 rg 45 771 Td ' + toPdfWinAnsiString('Referenz-Nr.: ' + details.confirmationNumber + '   |   Eingang: ' + details.submittedAtFormatted) + ' Tj ET');

    // Main Document Title
    ops.push('BT /F2 14 Tf 0.039 0.122 0.267 rg 45 718 Td ' + toPdfWinAnsiString(docTitle) + ' Tj ET');
    ops.push('BT /F1 9.5 Tf 0.35 0.42 0.52 rg 45 702 Td ' + toPdfWinAnsiString(subTitle) + ' Tj ET');

    // Info Box Background
    ops.push('0.969 0.980 0.988 rg');
    ops.push('45 350 505 335 re f');
    ops.push('0.85 0.89 0.93 RG 1 w');
    ops.push('45 350 505 335 re S');

    const rows = [
        ['Bestätigungsnummer:', details.confirmationNumber],
        ['Datum & Uhrzeit des Eingangs:', details.submittedAtFormatted],
        ['Vorgangsart:', isWiderruf ? 'Widerruf eines Energieliefervertrags' : (details.terminationType || 'Ordentliche Kündigung')],
    ];

    if (!isWiderruf) {
        if (details.reason) {
            rows.push(['Kündigungsgrund:', details.reason]);
        }
        rows.push(['Gewünschter Kündigungszeitpunkt:', details.cancelDate || 'Zum nächstmöglichen Zeitpunkt']);
    } else {
        rows.push(['Bestelldatum des Vertrags:', details.orderDate || 'Nicht angegeben']);
    }

    rows.push(
        ['Vertragsart / Sparte:', details.contractType || 'Energieliefervertrag (Strom / Gas)'],
        [isWiderruf ? 'Bestell- oder Kundennummer:' : 'Vertrags- oder Kundennummer:', details.contractNumber || '-']
    );

    if (details.meterNumber) {
        rows.push(['Zählernummer:', details.meterNumber]);
    }

    rows.push(
        ['Name des Kunden:', details.customerName || '-'],
        ['Anschrift (Verbrauchsstelle):', details.fullAddress || '-'],
        ['E-Mail-Adresse:', details.email || '-'],
        ['Abgegebene Erklärung:', isWiderruf
            ? 'Hiermit widerrufe ich den von mir abgeschlossenen Energieliefervertrag.'
            : 'Hiermit kündige ich den oben genannten Energieliefervertrag verbindlich.']
    );

    let y = 662;
    for (const [label, val] of rows) {
        ops.push('BT /F2 9.5 Tf 0.15 0.22 0.32 rg 60 ' + y + ' Td ' + toPdfWinAnsiString(label) + ' Tj ET');
        const valStr = String(val || '-');
        if (valStr.length > 58) {
            const firstPart = valStr.slice(0, 58);
            const secondPart = valStr.slice(58, 116);
            ops.push('BT /F1 9.5 Tf 0.05 0.09 0.16 rg 235 ' + y + ' Td ' + toPdfWinAnsiString(firstPart) + ' Tj ET');
            y -= 13;
            ops.push('BT /F1 9.5 Tf 0.05 0.09 0.16 rg 235 ' + y + ' Td ' + toPdfWinAnsiString(secondPart) + ' Tj ET');
        } else {
            ops.push('BT /F1 9.5 Tf 0.05 0.09 0.16 rg 235 ' + y + ' Td ' + toPdfWinAnsiString(valStr) + ' Tj ET');
        }
        y -= 19;
        ops.push('0.91 0.94 0.96 RG 0.5 w 60 ' + (y + 12) + ' m 535 ' + (y + 12) + ' l S');
    }

    // Legal Note Section below box
    ops.push('BT /F2 10 Tf 0.039 0.122 0.267 rg 45 322 Td ' + toPdfWinAnsiString('Wichtige Hinweise zum weiteren Ablauf:') + ' Tj ET');

    const legalLines = isWiderruf ? [
        '1. Eingangsbestätigung: Wir bestätigen hiermit den elektronischen Eingang Ihrer Widerrufserklärung',
        '   zum oben genannten Zeitpunkt (' + details.submittedAtFormatted + ').',
        '2. Prüfung der Wirksamkeit: Bitte beachten Sie, dass diese automatische Eingangsbestätigung',
        '   lediglich den Erhalt Ihrer Erklärung dokumentiert. Eine inhaltliche und formelle Prüfung',
        '   der Wirksamkeit Ihrer Widerrufserklärung durch unseren Kundenservice steht noch aus.',
        '3. Rückmeldung: Nach Abschluss der Prüfung erhalten Sie eine gesonderte Bestätigung per E-Mail.'
    ] : [
        '1. Gesetzliche Dokumentation (§ 312k BGB): Dieses PDF-Dokument dient als dauerhafter Datenträger',
        '   zum Nachweis Ihrer online eingereichten Kündigungserklärung. Bitte speichern Sie es für Ihre Unterlagen.',
        '2. Bearbeitung: Unser Kundenservice prüft Ihre Angaben und bestätigt Ihnen den genauen Beendigungs-',
        '   zeitpunkt Ihres Energieliefervertrags zeitnah schriftlich bzw. per E-Mail.',
        '3. Kopie per E-Mail: Eine Ausfertigung dieser Bestätigung wurde zusätzlich an ' + (details.email || 'Ihre E-Mail') + ' gesendet.'
    ];

    let ly = 304;
    for (const line of legalLines) {
        ops.push('BT /F1 9 Tf 0.25 0.32 0.42 rg 45 ' + ly + ' Td ' + toPdfWinAnsiString(line) + ' Tj ET');
        ly -= 14;
    }

    // Footer Divider & Legal Entities
    ops.push('0.82 0.86 0.90 RG 0.8 w 45 125 m 550 125 l S');
    ops.push('BT /F2 8.5 Tf 0.2 0.26 0.35 rg 45 108 Td ' + toPdfWinAnsiString('Alpha Energie GmbH  |  Alter Hellweg 50, 44379 Dortmund  |  Tel.: 0231 39989390  |  info@alpha-energie.de') + ' Tj ET');
    ops.push('BT /F1 8 Tf 0.35 0.42 0.52 rg 45 94 Td ' + toPdfWinAnsiString('Leistungserbringer / Vertragspartner der Energielieferverträge: Alpha Energie - Eine Marke der Firstcon GmbH,') + ' Tj ET');
    ops.push('BT /F1 8 Tf 0.35 0.42 0.52 rg 45 82 Td ' + toPdfWinAnsiString('Untere Schrangenstraße 4, 21335 Lüneburg  |  Amtsgericht Lüneburg HRB 202031  |  Geschäftsführung: Jowana Lohmöller, Malte Steinmetz') + ' Tj ET');

    const streamContent = ops.join('\n');
    const objects = [
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
        '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
        '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
        `6 0 obj\n<< /Length ${Buffer.byteLength(streamContent, 'ascii')} >>\nstream\n${streamContent}\nendstream\nendobj\n`
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    for (const obj of objects) {
        offsets.push(Buffer.byteLength(pdf, 'ascii'));
        pdf += obj;
    }
    const xrefOffset = Buffer.byteLength(pdf, 'ascii');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
        pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    return Buffer.from(pdf, 'ascii');
}

// 1.4 Submit Legal Cancellation pursuant to § 312k BGB & Online Revocation (EU 2023/2673)
app.post('/api/kuendigung/submit', async (req, res) => {
    try {
        const body = req.body || {};
        const isWiderruf = String(body.type || 'KUENDIGUNG').toUpperCase() === 'WIDERRUF';
        const type = isWiderruf ? 'WIDERRUF' : 'KUENDIGUNG';

        const salutation = String(body.salutation || '').trim();
        const firstName = String(body.firstName || '').trim();
        const lastName = String(body.lastName || '').trim();
        const customerName = String(body.customerName || `${salutation} ${firstName} ${lastName}`.replace(/\s+/g, ' ')).trim();

        const street = String(body.street || '').trim();
        const houseNr = String(body.houseNr || '').trim();
        const plz = String(body.plz || '').trim();
        const city = String(body.city || '').trim();
        const fullAddress = (street || plz || city)
            ? `${street} ${houseNr}, ${plz} ${city}`.replace(/\s+/g, ' ').replace(/^,\s*/, '').trim()
            : String(body.address || 'Nicht angegeben').trim();

        const contractType = String(body.contractType || body.contractBranch || 'Ökostrom / Erdgas').trim();
        const contractNumber = String(body.contractNumber || '').trim();
        const meterNumber = String(body.meterNumber || '').trim();
        const email = String(body.email || '').trim();

        const terminationType = isWiderruf
            ? 'Widerruf'
            : String(body.terminationType || 'Ordentliche Kündigung').trim();
        const reason = isWiderruf
            ? null
            : (String(body.reason || '').trim() || null);
        const orderDateRaw = String(body.orderDate || '').trim();
        const orderDate = orderDateRaw ? formatGermanDate(orderDateRaw) : '';

        const cancelDateRaw = String(body.cancelDate || '').trim();
        const cancelDate = isWiderruf
            ? (orderDate ? `Bestelldatum: ${orderDate}` : 'Sofort (Widerruf)')
            : (cancelDateRaw && cancelDateRaw !== 'Zum nächstmöglichen Zeitpunkt'
                ? formatGermanDate(cancelDateRaw)
                : 'Zum nächstmöglichen Zeitpunkt');

        if (!contractNumber || !customerName || !email) {
            return res.status(400).json({
                success: false,
                error: 'Bitte geben Sie Vertrags-/Kundennummer, Ihren vollständigen Namen sowie Ihre E-Mail-Adresse an.'
            });
        }

        if (!isWiderruf && /außerordentlich/i.test(terminationType) && !reason) {
            return res.status(400).json({
                success: false,
                error: 'Bitte geben Sie bei einer außerordentlichen Kündigung den Kündigungsgrund an.'
            });
        }

        const now = new Date();
        const submittedAtFormatted = now.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'Europe/Berlin'
        }) + ', ' + now.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Europe/Berlin'
        }) + ' Uhr';

        const prefix = isWiderruf ? 'WR-' : 'KD-';
        const confirmationNumber = prefix + Date.now().toString().slice(-6);

        const summaryReason = [
            isWiderruf ? `[Widerruf | Vertragsart: ${contractType}]` : `[${terminationType} | Vertragsart: ${contractType}]`,
            fullAddress ? `Adresse: ${fullAddress}` : null,
            meterNumber ? `Zähler: ${meterNumber}` : null,
            isWiderruf && orderDate ? `Bestelldatum: ${orderDate}` : null,
            !isWiderruf && reason ? `Grund: ${reason}` : null
        ].filter(Boolean).join(' | ');

        await prisma.legalCancellation.create({
            data: {
                contractNumber,
                customerName,
                email,
                cancelDate,
                reason: summaryReason,
                type
            }
        });

        const pdfDetails = {
            confirmationNumber,
            submittedAtIso: now.toISOString(),
            submittedAtFormatted,
            type,
            terminationType,
            reason,
            cancelDate,
            orderDate,
            contractType,
            contractNumber,
            meterNumber,
            customerName,
            street,
            houseNr,
            plz,
            city,
            fullAddress,
            email
        };

        const pdfBuffer = generateLegalConfirmationPdfBuffer(pdfDetails);
        const pdfBase64 = pdfBuffer.toString('base64');
        const pdfFilename = isWiderruf
            ? `Widerrufsbestaetigung_${confirmationNumber}.pdf`
            : `Kuendigungsbestaetigung_${confirmationNumber}.pdf`;

        // Persist record locally so GET /api/kuendigung/pdf/:confirmationNumber can serve it anytime
        try {
            const storeFile = path.join(__dirname, 'data', 'legal_cancellations.json');
            fs.mkdirSync(path.dirname(storeFile), { recursive: true });
            const existing = fs.existsSync(storeFile)
                ? JSON.parse(fs.readFileSync(storeFile, 'utf8') || '[]')
                : [];
            existing.unshift(pdfDetails);
            fs.writeFileSync(storeFile, JSON.stringify(existing.slice(0, 500), null, 2), 'utf8');
        } catch (fileErr) {
            console.warn('[Kuendigung/Widerruf] Could not persist JSON backup:', fileErr.message);
        }

        // Send automatic confirmation email to customer + copy to backoffice
        (async () => {
            try {
                const transporter = getMailTransporter();
                if (!transporter) {
                    console.warn('[Kuendigung/Widerruf] SMTP credentials not configured; skipping email dispatch.');
                    return;
                }
                const sender = getSenderEmail();
                const subjectCustomer = isWiderruf
                    ? `Eingangsbestätigung Ihres Widerrufs (${confirmationNumber}) – Alpha Energie`
                    : `Eingangsbestätigung Ihrer Kündigung gem. § 312k BGB (${confirmationNumber}) – Alpha Energie`;

                const customerHtml = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>${escapeHtml(subjectCustomer)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1e293b;">
  <div style="padding:30px 15px;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
      <div style="background:linear-gradient(135deg,#0a1f44 0%,#1e3b6a 100%);padding:28px 24px;text-align:center;border-bottom:4px solid #ff7a00;">
        <h1 style="color:#ffffff;margin:0;font-size:1.3rem;">${isWiderruf ? 'Eingangsbestätigung Ihres Vertragswiderrufs' : 'Eingangsbestätigung Ihrer Vertragskündigung (§ 312k BGB)'}</h1>
        <p style="color:#cbd5e1;margin:6px 0 0 0;font-size:0.9rem;">Referenznummer: <strong>${escapeHtml(confirmationNumber)}</strong> | Eingang: <strong>${escapeHtml(submittedAtFormatted)}</strong></p>
      </div>
      <div style="padding:28px 26px;">
        <p style="margin-top:0;font-size:1rem;">Guten Tag <strong>${escapeHtml(customerName)}</strong>,</p>
        <p style="color:#334155;font-size:0.95rem;line-height:1.6;">
          ${isWiderruf
              ? 'hiermit bestätigen wir Ihnen den elektronischen Eingang Ihrer Widerrufserklärung bei Alpha Energie. Nachfolgend erhalten Sie die Zusammenfassung Ihrer übermittelten Angaben sowie Ihre Bestätigung als PDF-Dokument im Anhang.'
              : 'hiermit bestätigen wir Ihnen gemäß § 312k BGB den elektronischen Eingang Ihrer Kündigungserklärung bei Alpha Energie. Im Anhang dieser E-Mail finden Sie Ihre Kündigungsbestätigung als PDF-Dokument zum dauerhaften Speichern.'}
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #ff7a00;border-radius:8px;padding:18px 20px;margin:22px 0;">
          <h3 style="margin:0 0 12px 0;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.5px;color:#0a1f44;">Übermittelte Angaben im Überblick</h3>
          <table style="width:100%;font-size:0.92rem;border-collapse:collapse;">
            <tr><td style="padding:5px 0;color:#64748b;width:44%;"><strong>Bestätigungsnummer:</strong></td><td style="padding:5px 0;color:#0f172a;font-weight:700;">${escapeHtml(confirmationNumber)}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b;"><strong>Datum &amp; Uhrzeit:</strong></td><td style="padding:5px 0;color:#0f172a;">${escapeHtml(submittedAtFormatted)}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b;"><strong>Vorgangsart:</strong></td><td style="padding:5px 0;color:#0f172a;">${escapeHtml(isWiderruf ? 'Widerruf eines Energieliefervertrags' : terminationType)}</td></tr>
            ${!isWiderruf && reason ? `<tr><td style="padding:5px 0;color:#64748b;"><strong>Kündigungsgrund:</strong></td><td style="padding:5px 0;color:#0f172a;">${escapeHtml(reason)}</td></tr>` : ''}
            ${!isWiderruf ? `<tr><td style="padding:5px 0;color:#64748b;"><strong>Kündigungszeitpunkt:</strong></td><td style="padding:5px 0;color:#0f172a;">${escapeHtml(cancelDate)}</td></tr>` : ''}
            ${isWiderruf && orderDate ? `<tr><td style="padding:5px 0;color:#64748b;"><strong>Bestelldatum:</strong></td><td style="padding:5px 0;color:#0f172a;">${escapeHtml(orderDate)}</td></tr>` : ''}
            <tr><td style="padding:5px 0;color:#64748b;"><strong>Vertragsart / Sparte:</strong></td><td style="padding:5px 0;color:#0f172a;">${escapeHtml(contractType)}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b;"><strong>${isWiderruf ? 'Bestell- / Kundennummer:' : 'Vertrags- / Kundennummer:'}</strong></td><td style="padding:5px 0;color:#0f172a;">${escapeHtml(contractNumber)}</td></tr>
            ${meterNumber ? `<tr><td style="padding:5px 0;color:#64748b;"><strong>Zählernummer:</strong></td><td style="padding:5px 0;color:#0f172a;">${escapeHtml(meterNumber)}</td></tr>` : ''}
            <tr><td style="padding:5px 0;color:#64748b;"><strong>Name des Kunden:</strong></td><td style="padding:5px 0;color:#0f172a;">${escapeHtml(customerName)}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b;"><strong>Anschrift:</strong></td><td style="padding:5px 0;color:#0f172a;">${escapeHtml(fullAddress)}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b;"><strong>E-Mail-Adresse:</strong></td><td style="padding:5px 0;color:#0f172a;">${escapeHtml(email)}</td></tr>
          </table>
        </div>

        ${isWiderruf ? `
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 16px;margin:18px 0;font-size:0.88rem;color:#9a3412;line-height:1.55;">
          <strong>Wichtiger Hinweis zur Wirksamkeitsprüfung:</strong><br>
          Diese automatische Eingangsbestätigung dokumentiert den fristgerechten Eingang Ihrer Widerrufserklärung (${escapeHtml(submittedAtFormatted)}). Bitte beachten Sie, dass eine inhaltliche und formelle <strong>Prüfung der Wirksamkeit Ihrer Widerrufserklärung noch aussteht</strong>. Sie erhalten nach Abschluss der Prüfung eine gesonderte Rückmeldung von unserem Kundenservice.
        </div>` : `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin:18px 0;font-size:0.88rem;color:#166534;line-height:1.55;">
          <strong>Hinweis gemäß § 312k BGB:</strong><br>
          Ihre Kündigungserklärung ist uns am ${escapeHtml(submittedAtFormatted)} zugegangen. Das beigefügte PDF-Dokument dient Ihnen als Nachweis auf einem dauerhaften Datenträger. Nach Prüfung Ihrer Vertragsdaten erhalten Sie von unserem Kundenservice die abschließende Kündigungsbestätigung zum jeweiligen Beendigungszeitpunkt.
        </div>`}

        <p style="margin-top:24px;font-size:0.92rem;color:#334155;">
          Mit freundlichen Grüßen<br>
          <strong>Ihr Kundenservice von Alpha Energie</strong>
        </p>
      </div>
      <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 24px;font-size:0.78rem;color:#64748b;text-align:center;line-height:1.55;">
        <strong>Alpha Energie GmbH</strong> • Alter Hellweg 50, 44379 Dortmund • Tel.: 0231 39989390 • info@alpha-energie.de<br>
        Leistungserbringer / Vertragspartner der Energielieferverträge: <strong>Alpha Energie – Eine Marke der Firstcon GmbH</strong>, Untere Schrangenstraße 4, 21335 Lüneburg (Amtsgericht Lüneburg HRB 202031, vertreten durch Jowana Lohmöller &amp; Malte Steinmetz)
      </div>
    </div>
  </div>
</body>
</html>`;

                await transporter.sendMail({
                    from: sender,
                    to: email,
                    subject: subjectCustomer,
                    html: customerHtml,
                    attachments: [
                        {
                            filename: pdfFilename,
                            content: pdfBuffer,
                            contentType: 'application/pdf'
                        }
                    ]
                });

                const backofficeEmail = process.env.NOTIFICATION_EMAIL || 'info@alpha-energy.network';
                await transporter.sendMail({
                    from: sender,
                    to: backofficeEmail,
                    subject: `[${isWiderruf ? 'Online-Widerruf' : 'Online-Kündigung § 312k BGB'}] ${confirmationNumber} – ${customerName} (${contractNumber})`,
                    html: customerHtml,
                    attachments: [
                        {
                            filename: pdfFilename,
                            content: pdfBuffer,
                            contentType: 'application/pdf'
                        }
                    ]
                });
            } catch (mailErr) {
                console.warn('[Kuendigung/Widerruf] Email dispatch error:', mailErr.message);
            }
        })();

        res.status(201).json({
            success: true,
            confirmationNumber,
            submittedAt: submittedAtFormatted,
            details: pdfDetails,
            pdfBase64,
            pdfFilename,
            pdfUrl: `/api/kuendigung/pdf/${confirmationNumber}`,
            message: isWiderruf
                ? `Ihre Widerrufserklärung wurde am ${submittedAtFormatted} erfasst (Bestätigungs-Nr.: ${confirmationNumber}). Eine Eingangsbestätigung inkl. PDF wurde an ${email} versendet. Hinweis: Die Prüfung der Wirksamkeit Ihrer Widerrufserklärung steht noch aus.`
                : `Ihre Kündigung gem. § 312k BGB wurde am ${submittedAtFormatted} erfasst (Bestätigungs-Nr.: ${confirmationNumber}). Ihre Kündigungsbestätigung steht als PDF zum Download bereit und wurde zusätzlich per E-Mail an ${email} versendet.`
        });
    } catch (error) {
        console.error("Cancellation error:", error);
        res.status(500).json({ success: false, error: 'Fehler beim Absenden des Formulars' });
    }
});

// 1.4b Download Legal Cancellation / Revocation PDF by confirmationNumber
app.get('/api/kuendigung/pdf/:confirmationNumber', async (req, res) => {
    try {
        const confNum = String(req.params.confirmationNumber || '').trim();
        const storeFile = path.join(__dirname, 'data', 'legal_cancellations.json');
        let record = null;
        if (fs.existsSync(storeFile)) {
            const list = JSON.parse(fs.readFileSync(storeFile, 'utf8') || '[]');
            record = list.find(item => item.confirmationNumber === confNum);
        }
        if (!record) {
            return res.status(404).json({ success: false, error: 'Bestätigungsdokument nicht gefunden.' });
        }
        const pdfBuffer = generateLegalConfirmationPdfBuffer(record);
        const filename = record.type === 'WIDERRUF'
            ? `Widerrufsbestaetigung_${confNum}.pdf`
            : `Kuendigungsbestaetigung_${confNum}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Fehler beim Erstellen des PDF-Dokuments.' });
    }
});

// Email Helpers & Templates
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, (m) => {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return m;
        }
    });
}

function getMailTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.ionos.de';
    const port = parseInt(process.env.SMTP_PORT, 10) || 465;
    const user = process.env.SMTP_USER || 'info@alpha-energy.network';
    const pass = process.env.SMTP_PASS || 'infoalpha1000050000';

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465,
        auth: {
            user: user,
            pass: pass
        }
    });
}

function getSenderEmail() {
    const rawFrom = process.env.SMTP_FROM || process.env.SMTP_USER || 'info@alpha-energy.network';
    if (rawFrom.includes('<') && rawFrom.includes('>')) {
        return rawFrom;
    }
    return `"Alpha Energie GmbH" <${rawFrom}>`;
}

/**
 * Sends partner/application notifications to both the direct IONOS mailbox
 * (bewerbung@alpha-energy.network) and bewerbung@alpha-energie.de.
 * Why both? Because alpha-energie.de MX (mail.eg-on.com) forwards to
 * bewerbung@alpha-energy.network on IONOS without SRS, causing IONOS to block
 * hairpin-forwarded emails that originated from @alpha-energy.network (SPF fail).
 * Delivering directly to bewerbung@alpha-energy.network guarantees instant
 * in-network IONOS delivery with 100% SPF/DKIM pass.
 */
async function sendBewerbungNotification({ subject, text, html, replyTo, attachments }) {
    const sender = getSenderEmail();
    const configured = process.env.BEWERBUNG_EMAIL ? String(process.env.BEWERBUNG_EMAIL).split(',').map(s => s.trim()) : [];
    const targets = [...new Set([
        ...configured,
        'bewerbung@alpha-energy.network',
        'bewerbung@alpha-energie.de'
    ].filter(Boolean))];

    for (const target of targets) {
        try {
            const transporter = getMailTransporter();
            if (!transporter) {
                console.warn('[Mail] SMTP credentials missing. Bewerbung notification not sent.');
                return false;
            }
            await transporter.sendMail({
                from: sender,
                to: target,
                subject,
                text,
                html: html || undefined,
                replyTo: (replyTo && String(replyTo).includes('@')) ? String(replyTo).trim() : undefined,
                attachments: attachments && attachments.length ? attachments : undefined
            });
            console.log(`[Mail] Bewerbung notification successfully sent to ${target}: ${subject}`);
        } catch (err) {
            console.error(`[Mail] Failed to send Bewerbung notification to ${target}:`, err.message);
        }
    }
    return true;
}

function getPartnerBackofficeNotificationHtml(title, subtitle, rows, footerNote) {
    const rowsHtml = (rows || [])
        .filter(r => r && r.label)
        .map(r => `
            <tr>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 38%; font-weight: 600; vertical-align: top;">${escapeHtml(r.label)}</td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 500; vertical-align: top;">${r.isHtml ? r.value : escapeHtml(r.value || 'Nicht angegeben')}</td>
            </tr>
        `).join('');

    return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1e293b;">
  <div style="padding:28px 14px;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
      <div style="background:linear-gradient(135deg,#0b1120 0%,#1e3b6a 100%);padding:26px 24px;text-align:center;border-bottom:4px solid #ef8a00;">
        <h1 style="color:#ffffff;margin:0;font-size:1.25rem;">${escapeHtml(title)}</h1>
        ${subtitle ? `<p style="color:#cbd5e1;margin:6px 0 0 0;font-size:0.9rem;">${escapeHtml(subtitle)}</p>` : ''}
      </div>
      <div style="padding:26px 24px;">
        <table style="width:100%;font-size:0.92rem;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
          ${rowsHtml}
        </table>
        ${footerNote ? `<p style="margin:20px 0 0 0;font-size:0.9rem;color:#475569;">${escapeHtml(footerNote)}</p>` : ''}
        <div style="text-align:center;margin:26px 0 8px 0;">
          <a href="https://alpha-energie.de/admin" target="_blank" style="background:#ef8a00;color:#ffffff;padding:12px 26px;text-decoration:none;border-radius:8px;font-weight:700;font-size:0.95rem;display:inline-block;">Im Admin-Panel öffnen &rarr;</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function formatGermanDate(dateStr) {
    if (!dateStr) return '';
    try {
        const str = String(dateStr).trim();
        // If already DD.MM.YYYY
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(str)) {
            return str;
        }
        // If YYYY-MM-DD
        const parts = str.split('-');
        if (parts.length === 3) {
            const year = parts[0];
            const month = parts[1];
            const day = parts[2].substring(0, 2);
            return `${day}.${month}.${year}`;
        }
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
    } catch (e) {
        // fallback
    }
    return String(dateStr);
}

function getPartnerRegistrationConfirmationHtml(fullName, email, phone, experience) {
    const safeName = escapeHtml(fullName) || 'Vertriebspartner';
    const safeEmail = escapeHtml(email) || '–';
    const safePhone = escapeHtml(phone) || 'Nicht angegeben';
    const safeExperience = escapeHtml(experience) || 'Nicht angegeben';

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Willkommen bei Alpha Energie</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="background-color: #f1f5f9; padding: 35px 15px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #e2e8f0;">
            
            <!-- Header with Logo & Brand Gradient -->
            <div style="background: linear-gradient(135deg, #0b1120 0%, #1e3b6a 100%); padding: 36px 25px; text-align: center;">
                <a href="https://alpha-energie.de" target="_blank" style="text-decoration: none; display: inline-block;">
                    <img src="https://alpha-energie.de/logo.png" alt="Alpha Energie GmbH" style="max-width: 190px; height: auto; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto; border: 0;">
                </a>
                <h1 style="color: #ffffff; margin: 0; font-size: 1.35rem; font-weight: 700; letter-spacing: -0.3px; line-height: 1.3;">Herzlich willkommen im Alpha Energie Netzwerk!</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 0.95rem;">Deine Registrierung war erfolgreich</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 32px 28px;">
                <p style="font-size: 1.05rem; margin-top: 0; color: #0f172a;">Hallo <strong>${safeName}</strong>,</p>
                <p style="color: #334155; font-size: 0.95rem; margin-bottom: 24px;">Vielen Dank für Dein Vertrauen und Deine Registrierung als Vertriebspartner bei der Alpha Energie GmbH. Wir freuen uns sehr, Dich in unserem Partnernetzwerk begrüßen zu dürfen!</p>
                
                <!-- Summary Box with Applicant Details -->
                <div style="background: #f8fafc; border-left: 4px solid #ef8a00; padding: 18px 20px; border-radius: 8px; margin: 24px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                    <h3 style="margin: 0 0 12px 0; font-size: 0.85rem; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">
                        Deine Registrierungsdaten im Überblick:
                    </h3>
                    <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; color: #64748b; width: 110px;"><strong>Name:</strong></td>
                            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${safeName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748b;"><strong>E-Mail:</strong></td>
                            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${safeEmail}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748b;"><strong>Telefon:</strong></td>
                            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${safePhone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748b;"><strong>Erfahrung:</strong></td>
                            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${safeExperience}</td>
                        </tr>
                    </table>
                </div>

                <!-- So geht es weiter Section -->
                <h3 style="color: #0f172a; font-size: 1.05rem; margin: 28px 0 16px 0; font-weight: 700;">So geht es jetzt weiter:</h3>
                
                <table style="width: 100%; border-collapse: separate; border-spacing: 0 14px; margin-bottom: 10px;">
                    <tr>
                        <td style="vertical-align: top; width: 34px;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #ef8a00; color: #ffffff; font-weight: 700; font-size: 0.85rem; text-align: center; line-height: 26px;">1</div>
                        </td>
                        <td style="vertical-align: top; padding-left: 10px;">
                            <strong style="color: #0f172a; font-size: 0.95rem;">Prüfung Deiner Angaben</strong>
                            <div style="color: #475569; font-size: 0.9rem; margin-top: 2px;">Unser Partnermanagement sichtet Deine übermittelten Angaben und bereitet Dein persönliches Onboarding vor.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="vertical-align: top; width: 34px;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #ef8a00; color: #ffffff; font-weight: 700; font-size: 0.85rem; text-align: center; line-height: 26px;">2</div>
                        </td>
                        <td style="vertical-align: top; padding-left: 10px;">
                            <strong style="color: #0f172a; font-size: 0.95rem;">Persönliche Kontaktaufnahme</strong>
                            <div style="color: #475569; font-size: 0.9rem; margin-top: 2px;">Unser Team meldet sich zeitnah telefonisch oder per E-Mail bei Dir für ein kurzes, persönliches Kennenlerngespräch.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="vertical-align: top; width: 34px;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #ef8a00; color: #ffffff; font-weight: 700; font-size: 0.85rem; text-align: center; line-height: 26px;">3</div>
                        </td>
                        <td style="vertical-align: top; padding-left: 10px;">
                            <strong style="color: #0f172a; font-size: 0.95rem;">Freischaltung des VP-Portals</strong>
                            <div style="color: #475569; font-size: 0.9rem; margin-top: 2px;">Du erhältst Deine Zugangsdaten zum VP-Portal, unsere exklusiven Tarifkonditionen und kannst sofort voll durchstarten.</div>
                        </td>
                    </tr>
                </table>

                <p style="font-size: 0.9rem; color: #64748b; margin: 24px 0 8px 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                    Du hast vorab Fragen oder Anmerkungen? Antworte einfach direkt auf diese E-Mail oder melde Dich telefonisch bei uns.
                </p>

                <!-- Professional Signature -->
                <p style="margin-top: 20px; font-size: 0.95rem; color: #334155;">
                    Mit freundlichen Grüßen,<br>
                    <strong style="color: #0f172a;">Dein Team der Alpha Energie GmbH</strong>
                </p>
            </div>

            <!-- Legal Company Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; font-size: 0.8rem; color: #64748b; text-align: center; line-height: 1.6;">
                <strong style="color: #334155;">Alpha Energie GmbH</strong><br>
                Alter Hellweg 50 | 44379 Dortmund<br>
                Telefon: <a href="tel:023139989390" style="color: #64748b; text-decoration: none;">0231 39989390</a> | E-Mail: <a href="mailto:info@alpha-energie.de" style="color: #64748b; text-decoration: none;">info@alpha-energie.de</a><br>
                Geschäftsführer: Tolga Canga | Registergericht: Amtsgericht Dortmund, HRB 38030<br>
                <a href="https://alpha-energie.de" target="_blank" style="color: #ef8a00; text-decoration: none; font-weight: 600; margin-top: 6px; display: inline-block;">www.alpha-energie.de</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function getAppointmentConfirmationHtml(name, email, phone, dateFormatted, time) {
    const safeName = escapeHtml(name) || 'Vertriebspartner';
    const safePhone = escapeHtml(phone) || 'Nicht angegeben';
    const safeDate = escapeHtml(dateFormatted);
    const safeTime = escapeHtml(time);

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminbestätigung</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="background-color: #f1f5f9; padding: 35px 15px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #e2e8f0;">
            
            <!-- Header with Logo & Brand Gradient -->
            <div style="background: linear-gradient(135deg, #0b1120 0%, #1e3b6a 100%); padding: 36px 25px; text-align: center;">
                <a href="https://alpha-energie.de" target="_blank" style="text-decoration: none; display: inline-block;">
                    <img src="https://alpha-energie.de/logo.png" alt="Alpha Energie GmbH" style="max-width: 190px; height: auto; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto; border: 0;">
                </a>
                <h1 style="color: #ffffff; margin: 0; font-size: 1.35rem; font-weight: 700; letter-spacing: -0.3px; line-height: 1.3;">Dein Termin ist bestätigt!</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 0.95rem;">Kennenlerngespräch mit der Alpha Energie GmbH</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 32px 28px;">
                <p style="font-size: 1.05rem; margin-top: 0; color: #0f172a;">Hallo <strong>${safeName}</strong>,</p>
                <p style="color: #334155; font-size: 0.95rem; margin-bottom: 24px;">unser Partnermanagement hat Deinen Termin für unser telefonisches Kennenlerngespräch eingetragen und verbindlich für Dich reserviert. Wir freuen uns auf den persönlichen Austausch mit Dir.</p>
                
                <!-- Highlighted Appointment Box -->
                <div style="background: #fff7ed; border: 1px solid #fed7aa; border-left: 5px solid #ff7a00; padding: 20px 22px; border-radius: 8px; margin: 24px 0;">
                    <h3 style="margin: 0 0 14px 0; font-size: 0.85rem; color: #9a3412; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">
                        Deine Termindetails:
                    </h3>
                    <table style="width: 100%; font-size: 0.95rem; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; color: #475569; width: 130px;"><strong>Datum:</strong></td>
                            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${safeDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #475569;"><strong>Uhrzeit:</strong></td>
                            <td style="padding: 6px 0; color: #ea580c; font-weight: 700; font-size: 1.05rem;">${safeTime} Uhr</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #475569;"><strong>Gesprächspartner:</strong></td>
                            <td style="padding: 6px 0; color: #0f172a; font-weight: 500;">Alpha Energie Onboarding-Team</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #475569;"><strong>Telefon:</strong></td>
                            <td style="padding: 6px 0; color: #0f172a; font-weight: 500;">${safePhone}</td>
                        </tr>
                    </table>
                </div>

                <!-- Friendly Instructions -->
                <h3 style="color: #0f172a; font-size: 1.05rem; margin: 24px 0 12px 0; font-weight: 700;">Wichtige Hinweise zum Ablauf:</h3>
                
                <table style="width: 100%; border-collapse: separate; border-spacing: 0 10px; margin-bottom: 15px;">
                    <tr>
                        <td style="vertical-align: top; width: 28px; color: #ff7a00; font-size: 1rem; font-weight: 700; line-height: 1.4;">1.</td>
                        <td style="vertical-align: top; padding-left: 8px; color: #334155; font-size: 0.92rem;">
                            <strong>Telefonischer Anruf:</strong> Wir rufen Dich pünktlich zur vereinbarten Uhrzeit unter Deiner angegebenen Rufnummer (<strong>${safePhone}</strong>) an.
                        </td>
                    </tr>
                    <tr>
                        <td style="vertical-align: top; width: 28px; color: #ff7a00; font-size: 1rem; font-weight: 700; line-height: 1.4;">2.</td>
                        <td style="vertical-align: top; padding-left: 8px; color: #334155; font-size: 0.92rem;">
                            <strong>Dauer:</strong> Das Gespräch dauert ca. <strong>15–20 Minuten</strong>. Wir besprechen Deine Vertriebspotenziale, unsere Tarife und wie Du sofort durchstarten kannst.
                        </td>
                    </tr>
                    <tr>
                        <td style="vertical-align: top; width: 28px; color: #ff7a00; font-size: 1rem; font-weight: 700; line-height: 1.4;">3.</td>
                        <td style="vertical-align: top; padding-left: 8px; color: #334155; font-size: 0.92rem;">
                            <strong>Termin ändern oder absagen:</strong> Solltest Du den Termin verschieben müssen, antworte einfach kurz auf diese E-Mail oder rufe uns unter <a href="tel:023139989390" style="color: #0284c7; text-decoration: underline;">0231 39989390</a> an.
                        </td>
                    </tr>
                </table>

                <p style="margin-top: 25px; font-size: 0.95rem; color: #334155;">
                    Wir freuen uns auf das Kennenlernen!<br><br>
                    Mit freundlichen Grüßen,<br>
                    <strong style="color: #0f172a;">Dein Team der Alpha Energie GmbH</strong>
                </p>
            </div>

            <!-- Legal Company Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; font-size: 0.8rem; color: #64748b; text-align: center; line-height: 1.6;">
                <strong style="color: #334155;">Alpha Energie GmbH</strong><br>
                Alter Hellweg 50 | 44379 Dortmund<br>
                Telefon: <a href="tel:023139989390" style="color: #64748b; text-decoration: none;">0231 39989390</a> | E-Mail: <a href="mailto:info@alpha-energie.de" style="color: #64748b; text-decoration: none;">info@alpha-energie.de</a><br>
                Geschäftsführer: Tolga Canga | Registergericht: Amtsgericht Dortmund, HRB 38030<br>
                <a href="https://alpha-energie.de" target="_blank" style="color: #ef8a00; text-decoration: none; font-weight: 600; margin-top: 6px; display: inline-block;">www.alpha-energie.de</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// 2. Submit Partner Application Form
app.post('/api/partner-application', async (req, res) => {
    try {
        const { fullName, email, phone, experience, refCode, companyName, notes } = req.body;
        
        let affiliateLinkId = null;
        let affiliateInfo = null;
        if (refCode) {
            const affiliate = await prisma.affiliateLink.findFirst({
                where: {
                    OR: [
                        { code: refCode },
                        { name: { equals: refCode } }
                    ]
                }
            });
            if (affiliate) {
                affiliateLinkId = affiliate.id;
                affiliateInfo = `${affiliate.name} (Code: ${affiliate.code})`;
            }
        }

        const newApp = await prisma.partnerApplication.create({
            data: {
                fullName: fullName || 'Unbekannt',
                email: email || '',
                phone: phone || '',
                experience: experience || 'Partner-Anfrage',
                companyName: companyName ? String(companyName).trim() : null,
                notes: notes ? String(notes).trim() : null,
                affiliateLinkId
            }
        });

        // 1. Send confirmation email to applicant & 2. notification to backoffice asynchronously (non-blocking)
        (async () => {
            try {
                const sender = getSenderEmail();

                // A. Beautiful confirmation email to the applicant
                if (email) {
                    try {
                        const transporter = getMailTransporter();
                        if (transporter) {
                            await transporter.sendMail({
                                from: sender,
                                to: email,
                                subject: 'Willkommen bei Alpha Energie – Deine Registrierung war erfolgreich!',
                                html: getPartnerRegistrationConfirmationHtml(fullName, email, phone, experience)
                            });
                            console.log(`Confirmation email successfully sent to applicant: ${email}`);
                        }
                    } catch (applicantMailErr) {
                        console.error(`Failed to send confirmation email to applicant (${email}):`, applicantMailErr);
                    }
                }

                // B. Notification email to backoffice (bewerbung@alpha-energy.network & bewerbung@alpha-energie.de)
                const subject = `Neue Partner-Bewerbung (Agentur/VP): ${fullName || 'Unbekannt'}${companyName ? ` (${companyName})` : ''}`;
                const text = `Eine neue Partner-Registrierung ist über die Website eingegangen:\n\n` +
                    `Bewerbungs-ID: #${newApp.id}\n` +
                    `Name: ${fullName || 'Unbekannt'}\n` +
                    `Firma / Agentur: ${companyName || 'Nicht angegeben'}\n` +
                    `E-Mail: ${email || 'Nicht angegeben'}\n` +
                    `Telefon: ${phone || 'Nicht angegeben'}\n` +
                    `Partnermodell / Erfahrung: ${experience || 'Nicht angegeben'}\n` +
                    `Werbelink / Empfehler: ${affiliateInfo || refCode || 'Direkt über Website'}\n` +
                    `Nachricht: ${notes || 'Keine'}\n\n` +
                    `Stammdaten-Link für diesen Bewerber: https://alpha-energie.de/stammdaten.html?id=${newApp.id}\n` +
                    `Bitte im Admin-Panel prüfen: https://alpha-energie.de/admin`;

                const html = getPartnerBackofficeNotificationHtml(
                    'Neue Partner-Bewerbung eingegangen',
                    `Bewerbungs-ID #${newApp.id} • Eingang am ${new Date().toLocaleString('de-DE')}`,
                    [
                        { label: 'Vor- und Nachname', value: fullName || 'Unbekannt' },
                        { label: 'Firma / Agentur', value: companyName || 'Nicht angegeben' },
                        { label: 'E-Mail-Adresse', value: email || 'Nicht angegeben' },
                        { label: 'Telefonnummer', value: phone || 'Nicht angegeben' },
                        { label: 'Partnermodell / Erfahrung', value: experience || 'Nicht angegeben' },
                        { label: 'Werbelink / Empfehler', value: affiliateInfo || refCode || 'Direkt über Website' },
                        { label: 'Nachricht / Notiz', value: notes || 'Keine' },
                        { label: 'Stammdatenblatt-Link', value: `<a href="https://alpha-energie.de/stammdaten.html?id=${newApp.id}" style="color:#ef8a00;">https://alpha-energie.de/stammdaten.html?id=${newApp.id}</a>`, isHtml: true }
                    ],
                    'Sie können direkt auf diese E-Mail antworten, um den Bewerber zu kontaktieren.'
                );

                await sendBewerbungNotification({
                    subject,
                    text,
                    html,
                    replyTo: email
                });
            } catch (mailError) {
                console.error("Error in partner registration email worker:", mailError);
            }
        })();

        res.status(201).json({ success: true, data: newApp });
    } catch (error) {
        console.error("Error saving application:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Middleware to protect admin routes
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const secret = process.env.JWT_SECRET || 'alpha_energie_admin_secret_2026';
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, secret);
            if (decoded.admin) {
                return next();
            }
        } catch (err) {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }
    }
    return res.status(401).json({ success: false, error: 'Unauthorized' });
};

// 2b. Get Available Appointment Slots (Admin only - registrars cannot self-book)
app.get('/api/appointments/available', authenticateAdmin, async (req, res) => {
    try {
        const { date } = req.query; // format: YYYY-MM-DD
        if (!date) return res.status(400).json({ success: false, error: 'Date is required' });
        
        const standardSlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
            "15:00", "15:30", "16:00"
        ];
        
        const booked = await prisma.appointment.findMany({
            where: { date }
        });
        const bookedTimes = booked.map(a => a.time);
        
        const available = standardSlots.filter(t => !bookedTimes.includes(t));
        res.json({ success: true, data: available });
    } catch (error) {
        console.error("Error fetching available slots:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 2c. Create an Appointment (Admin only - registrars cannot self-book)
const handleAdminCreateAppointment = async (req, res) => {
    try {
        const { name, email, phone, date, time } = req.body;
        if (!name || !date || !time) {
            return res.status(400).json({ success: false, error: 'Name, Datum und Uhrzeit sind erforderlich.' });
        }
        
        const existing = await prisma.appointment.findFirst({
            where: { date, time }
        });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Time slot already booked' });
        }
        
        const newAppointment = await prisma.appointment.create({
            data: { name, email: email || '', phone: phone || '', date, time }
        });

        // 1. Send confirmation email to applicant & 2. notification to backoffice asynchronously (non-blocking)
        (async () => {
            try {
                const sender = getSenderEmail();
                const dateFormatted = formatGermanDate(date);

                // A. Beautiful confirmation email to the applicant
                if (email) {
                    try {
                        const transporter = getMailTransporter();
                        if (transporter) {
                            await transporter.sendMail({
                                from: sender,
                                to: email,
                                subject: `Terminbestätigung: Dein Kennenlerngespräch am ${dateFormatted} um ${time} Uhr`,
                                html: getAppointmentConfirmationHtml(name, email, phone, dateFormatted, time)
                            });
                            console.log(`Appointment confirmation email successfully sent to: ${email}`);
                        }
                    } catch (applicantMailErr) {
                        console.error(`Failed to send appointment confirmation email to (${email}):`, applicantMailErr);
                    }
                }

                // B. Notification email to backoffice
                const subject = `Neuer Onboarding-Termin eingetragen: ${name} (${dateFormatted} um ${time} Uhr)`;
                const text = `Ein neuer Termin für ein Partner-Kennenlerngespräch wurde im Admin-Portal eingetragen:\n\nName: ${name}\nE-Mail: ${email || 'Nicht angegeben'}\nTelefon: ${phone || 'Nicht angegeben'}\nDatum: ${dateFormatted} (${date})\nUhrzeit: ${time} Uhr\n\nBitte im Admin-Panel prüfen: https://alpha-energie.de/admin`;
                const html = getPartnerBackofficeNotificationHtml(
                    'Neuer Onboarding-Termin eingetragen',
                    `${dateFormatted} um ${time} Uhr`,
                    [
                        { label: 'Name des Partners', value: name || 'Unbekannt' },
                        { label: 'E-Mail-Adresse', value: email || 'Nicht angegeben' },
                        { label: 'Telefonnummer', value: phone || 'Nicht angegeben' },
                        { label: 'Datum', value: `${dateFormatted} (${date})` },
                        { label: 'Uhrzeit', value: `${time} Uhr` }
                    ],
                    'Bitte den Bewerber zum vereinbarten Termin telefonisch kontaktieren.'
                );

                await sendBewerbungNotification({
                    subject,
                    text,
                    html,
                    replyTo: email
                });
            } catch (mailError) {
                console.error("Error in appointment email worker:", mailError);
            }
        })();

        res.status(201).json({ success: true, data: newAppointment });
    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
app.post('/api/appointments', authenticateAdmin, handleAdminCreateAppointment);
app.post('/api/admin/appointments', authenticateAdmin, handleAdminCreateAppointment);


// 3. Admin Login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body || {};
    const secret = process.env.JWT_SECRET || 'alpha_energie_admin_secret_2026';

    if (password === 'Alpha2026!!!' || (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD)) {
        const token = jwt.sign({ admin: true }, secret, { expiresIn: '12h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
    }
});

// 4. Get Admin Data (Protected)
app.get('/api/admin/data', authenticateAdmin, async (req, res) => {
    try {
        const contacts = await prisma.contactRequest.findMany({ orderBy: { createdAt: 'desc' } });
        const applications = await prisma.partnerApplication.findMany({ 
            include: { affiliateLink: true }, 
            orderBy: { createdAt: 'desc' } 
        });
        const appointments = await prisma.appointment.findMany({ orderBy: { createdAt: 'desc' } });
        
        res.json({ success: true, data: { contacts, applications, appointments } });
    } catch (error) {
        console.error("Error fetching admin data:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 4a. Delete Contact Request
app.delete('/api/admin/contacts/:id', authenticateAdmin, async (req, res) => {
    try {
        await prisma.contactRequest.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 4b. Delete Partner Application
app.delete('/api/admin/partner-applications/:id', authenticateAdmin, async (req, res) => {
    try {
        await prisma.partnerApplication.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Update Partner Application Notes
app.patch('/api/admin/partner-applications/:id/notes', authenticateAdmin, async (req, res) => {
    try {
        const { notes } = req.body;
        await prisma.partnerApplication.update({
            where: { id: parseInt(req.params.id) },
            data: { notes }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 4c. Delete Appointment
app.delete('/api/admin/appointments/:id', authenticateAdmin, async (req, res) => {
    try {
        await prisma.appointment.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Send Master Data Email (Stammdaten)
app.post('/api/admin/partner-applications/:id/send-master-data-email', authenticateAdmin, async (req, res) => {
    try {
        const appId = parseInt(req.params.id);
        if (isNaN(appId) || appId <= 0) {
            return res.status(400).json({ success: false, error: 'Ungültige Bewerbungs-ID.' });
        }
        const application = await prisma.partnerApplication.findUnique({ where: { id: appId } });
        if (!application) return res.status(404).json({ success: false, error: 'Bewerbung nicht gefunden.' });

        const { customEmail, customSubject, customBody } = req.body;
        const recipientEmail = customEmail || application.email;
        const emailSubject = customSubject || 'Wichtige Stammdaten für Deine Vertriebspartnerschaft';

        const transporter = getMailTransporter();
        if (!transporter) {
            return res.status(500).json({ success: false, error: 'SMTP Zugangsdaten nicht konfiguriert.' });
        }

        const stammdatenLink = `https://alpha-energie.de/stammdaten.html?id=${application.id}`;

        let htmlBody = customBody;
        if (!htmlBody) {
            htmlBody = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://alpha-energie.de/logo.png" alt="Alpha Energie GmbH" style="max-width: 200px;">
                </div>
                <p>Hallo ${application.fullName},</p>
                <p>herzlichen Dank für Deine Bewerbung und Dein Vertrauen in die Alpha Energie GmbH! Wir freuen uns sehr über Dein Interesse an einer Vertriebspartnerschaft.</p>
                <p>Um Deine Registrierung zügig abzuschließen und Deinen Account freizuschalten, benötigen wir im nächsten Schritt noch einige Stammdaten von Dir.</p>
                <p><strong>So geht es jetzt weiter:</strong></p>
                <ol style="line-height: 1.6; margin-bottom: 20px;">
                    <li>Klicke auf den Button unten und trage Deine restlichen Daten ein (Dokumenten-Upload & Bankverbindung sind optional).</li>
                    <li>Unser Backoffice-Team prüft Deine Unterlagen schnellstmöglich.</li>
                    <li>Sobald alles verifiziert ist, senden wir Dir Deine persönlichen Zugangsdaten für das Vertriebsportal zu, und Du kannst direkt starten!</li>
                </ol>
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${stammdatenLink}" style="background-color: #ef8a00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1rem;">Jetzt Stammdaten hinterlegen</a>
                </div>
                <p>Solltest Du vorab Fragen haben, kannst Du jederzeit auf diese E-Mail antworten.</p>
                <p>Mit freundlichen Grüßen,</p>
                <p><strong>Dein Team der Alpha Energie GmbH</strong></p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                <div style="font-size: 0.85rem; color: #666;">
                    <strong>Alpha Energie GmbH</strong><br>
                    Alter Hellweg 50 | 44379 Dortmund<br>
                    Telefon: 0231 39989390<br>
                    E-Mail: info@alpha-energie.de<br>
                    Geschäftsführer: Tolga Canga<br>
                    Registergericht: Amtsgericht Dortmund, HRB 38030
                </div>
            </div>
            `;
        }

        await transporter.sendMail({
            from: getSenderEmail(),
            to: recipientEmail,
            subject: emailSubject,
            html: htmlBody
        });

        // Mark on the application entry that master data email was sent
        const updatedApp = await prisma.partnerApplication.update({
            where: { id: appId },
            data: {
                masterDataEmailSent: true,
                masterDataEmailSentAt: new Date()
            }
        });

        res.json({ success: true, message: 'E-Mail gesendet.', application: updatedApp });
    } catch (e) {
        console.error("Error sending stammdaten email:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// GET Partner Application for form (public)
app.get('/api/partner/stammdaten/:id', async (req, res) => {
    try {
        const appId = parseInt(req.params.id);
        const application = await prisma.partnerApplication.findUnique({ where: { id: appId } });
        if (!application) return res.status(404).json({ success: false, error: 'Nicht gefunden.' });
        
        res.json({ success: true, data: application });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Submit Stammdaten (with file upload, supports both existing appId and new applications via ref link)
const stammdatenUploadHandler = upload.fields([
    { name: 'tradeLicense', maxCount: 1 },
    { name: 'idCardFront', maxCount: 1 },
    { name: 'idCardBack', maxCount: 1 }
]);

const handleStammdatenSubmit = async (req, res) => {
    try {
        const rawId = req.params.id;
        const appId = parseInt(rawId);
        const isNew = !rawId || rawId === 'new' || isNaN(appId);
        const data = req.body;
        
        let payload = {
            salutation: data.salutation,
            firstName: data.firstName,
            lastName: data.lastName,
            fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.fullName || 'Unbekannt',
            email: data.email,
            phone: data.phone,
            experience: data.experience || 'Über Stammdatenblatt eingereicht',
            birthDate: data.birthDate,
            street: data.street,
            houseNr: data.houseNr,
            plz: data.plz,
            city: data.city,
            country: data.country || 'Deutschland',
            isVatLiable: data.isVatLiable === 'true',
            companyName: data.companyName,
            legalForm: data.legalForm,
            taxId: data.taxId,
            taxOffice: data.taxOffice,
            iban: data.iban,
            bic: data.bic,
            bankName: data.bankName,
            website: data.website,
            masterDataStatus: 'SUBMITTED'
        };

        if (req.files) {
            if (req.files.tradeLicense && req.files.tradeLicense[0]) {
                payload.tradeLicenseUrl = '/uploads/' + req.files.tradeLicense[0].filename;
            }
            if (req.files.idCardFront && req.files.idCardFront[0]) {
                payload.idCardFrontUrl = '/uploads/' + req.files.idCardFront[0].filename;
            }
            if (req.files.idCardBack && req.files.idCardBack[0]) {
                payload.idCardBackUrl = '/uploads/' + req.files.idCardBack[0].filename;
            }
        }

        let refCode = data.refCode || data.ref || data.partner;
        let affiliateInfo = null;
        if (refCode) {
            const affiliate = await prisma.affiliateLink.findFirst({
                where: {
                    OR: [
                        { code: refCode },
                        { name: { equals: refCode } }
                    ]
                }
            });
            if (affiliate) {
                payload.affiliateLinkId = affiliate.id;
                affiliateInfo = `${affiliate.name} (Code: ${affiliate.code})`;
            }
        }

        let savedApp = null;
        if (isNew) {
            savedApp = await prisma.partnerApplication.create({ data: payload });
        } else {
            savedApp = await prisma.partnerApplication.update({
                where: { id: appId },
                data: payload
            });
        }

        // Send confirmation email (if new) & backoffice notification to bewerbung@ asynchronously
        (async () => {
            try {
                if (isNew && savedApp.email) {
                    try {
                        const transporter = getMailTransporter();
                        if (transporter) {
                            await transporter.sendMail({
                                from: getSenderEmail(),
                                to: savedApp.email,
                                subject: 'Willkommen bei Alpha Energie – Deine Stammdaten wurden erfolgreich übermittelt!',
                                html: getPartnerRegistrationConfirmationHtml(savedApp.fullName, savedApp.email, savedApp.phone, savedApp.experience)
                            });
                        }
                    } catch (appErr) {
                        console.error('[Stammdaten] Failed to send confirmation email to applicant:', appErr.message);
                    }
                }

                const attachments = [];
                if (req.files) {
                    if (req.files.tradeLicense && req.files.tradeLicense[0]) {
                        attachments.push({
                            filename: `Gewerbeanmeldung_${req.files.tradeLicense[0].originalname || req.files.tradeLicense[0].filename}`,
                            path: req.files.tradeLicense[0].path
                        });
                    }
                    if (req.files.idCardFront && req.files.idCardFront[0]) {
                        attachments.push({
                            filename: `Ausweis_Vorderseite_${req.files.idCardFront[0].originalname || req.files.idCardFront[0].filename}`,
                            path: req.files.idCardFront[0].path
                        });
                    }
                    if (req.files.idCardBack && req.files.idCardBack[0]) {
                        attachments.push({
                            filename: `Ausweis_Rueckseite_${req.files.idCardBack[0].originalname || req.files.idCardBack[0].filename}`,
                            path: req.files.idCardBack[0].path
                        });
                    }
                }

                const addressStr = `${savedApp.street || ''} ${savedApp.houseNr || ''}, ${savedApp.plz || ''} ${savedApp.city || ''} (${savedApp.country || 'Deutschland'})`.replace(/^[\s,]+|[\s,]+$/g, '');
                const subject = isNew
                    ? `Neue Partner-Bewerbung (Stammdatenblatt): ${savedApp.fullName}${savedApp.companyName ? ` (${savedApp.companyName})` : ''}`
                    : `Stammdaten eingereicht (#${savedApp.id}): ${savedApp.fullName}${savedApp.companyName ? ` (${savedApp.companyName})` : ''}`;

                const text = `${isNew ? 'Eine neue Partner-Bewerbung über das Stammdatenblatt' : 'Ein Bewerber hat seine Stammdaten vollständig'} eingereicht:\n\n` +
                    `Bewerbungs-ID: #${savedApp.id}\n` +
                    `Anrede / Name: ${savedApp.salutation || ''} ${savedApp.fullName}\n` +
                    `Geburtsdatum: ${savedApp.birthDate || 'Nicht angegeben'}\n` +
                    `E-Mail: ${savedApp.email || 'Nicht angegeben'}\n` +
                    `Telefon: ${savedApp.phone || 'Nicht angegeben'}\n` +
                    `Anschrift: ${addressStr || 'Nicht angegeben'}\n` +
                    `Firma / Rechtsform: ${savedApp.companyName || '–'} (${savedApp.legalForm || '–'})\n` +
                    `Steuernummer / Finanzamt: ${savedApp.taxId || '–'} / ${savedApp.taxOffice || '–'}\n` +
                    `Umsatzsteuerpflichtig: ${savedApp.isVatLiable ? 'Ja (19% MwSt.)' : 'Nein (Kleinunternehmer § 19 UStG)'}\n` +
                    `Bankverbindung: IBAN ${savedApp.iban || '–'} | BIC ${savedApp.bic || '–'} (${savedApp.bankName || '–'})\n` +
                    `Website: ${savedApp.website || '–'}\n` +
                    `Werbelink / Empfehler: ${affiliateInfo || refCode || 'Direkt'}\n\n` +
                    `Bitte im Admin-Panel prüfen und ggf. VP-Portal freischalten: https://alpha-energie.de/admin`;

                const html = getPartnerBackofficeNotificationHtml(
                    isNew ? 'Neue Partner-Bewerbung (Stammdatenblatt)' : 'Partner-Stammdaten eingereicht',
                    `Bewerbungs-ID #${savedApp.id} • Status: ${savedApp.masterDataStatus}`,
                    [
                        { label: 'Anrede & Name', value: `${savedApp.salutation || ''} ${savedApp.fullName}`.trim() },
                        { label: 'Geburtsdatum', value: savedApp.birthDate || 'Nicht angegeben' },
                        { label: 'E-Mail-Adresse', value: savedApp.email || 'Nicht angegeben' },
                        { label: 'Telefonnummer', value: savedApp.phone || 'Nicht angegeben' },
                        { label: 'Anschrift', value: addressStr || 'Nicht angegeben' },
                        { label: 'Firma / Rechtsform', value: `${savedApp.companyName || '–'} (${savedApp.legalForm || '–'})` },
                        { label: 'Steuernummer / Finanzamt', value: `${savedApp.taxId || '–'} / ${savedApp.taxOffice || '–'}` },
                        { label: 'Umsatzsteuerpflichtig', value: savedApp.isVatLiable ? 'Ja (19% MwSt.)' : 'Nein (§ 19 UStG)' },
                        { label: 'IBAN / BIC / Bank', value: `${savedApp.iban || '–'} | ${savedApp.bic || '–'} (${savedApp.bankName || '–'})` },
                        { label: 'Website', value: savedApp.website || '–' },
                        { label: 'Werbelink / Empfehler', value: affiliateInfo || refCode || 'Direkt' },
                        { label: 'Hochgeladene Dokumente', value: attachments.length ? `${attachments.length} Datei(en) im Anhang dieser E-Mail` : 'Keine Dateien hochgeladen' }
                    ],
                    'Sie können den Partner jetzt direkt im Admin-Panel prüfen und für das VP-Portal aktivieren.'
                );

                await sendBewerbungNotification({
                    subject,
                    text,
                    html,
                    replyTo: savedApp.email,
                    attachments
                });
            } catch (mailErr) {
                console.error('[Stammdaten] Error in notification worker:', mailErr);
            }
        })();

        return res.json({ success: true, data: savedApp });
    } catch (e) {
        console.error("Stammdaten submit error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
};

app.post('/api/partner/stammdaten', stammdatenUploadHandler, handleStammdatenSubmit);
app.post('/api/partner/stammdaten/:id', stammdatenUploadHandler, handleStammdatenSubmit);

let cityToPlz = {};
try {
  // path and fs are already required at the top of server.js
  const cityData = fs.readFileSync(path.join(__dirname, 'data', 'cityToPlz.json'), 'utf8');
  cityToPlz = JSON.parse(cityData);
} catch(e) {
  console.error('[Startup] Could not load cityToPlz.json:', e.message);
}

const scraperProgress = require('./services/progressStore');

// 5. Scrape B2B Contacts for Campaign (Protected)
app.post('/api/campaigns/scrape', authenticateAdmin, async (req, res) => {
    try {
        const { name, industry, companySize, pages, requirePhone } = req.body;
        if (!name || !industry || !companySize) {
            return res.status(400).json({ success: false, error: 'Name, industry, and companySize are required' });
        }

        const cityLower = companySize.trim().toLowerCase();
        let targetPlzs = [];
        if (/^\d{5}$/.test(cityLower)) {
            // It's a 5-digit zip code. Find the city that contains it (ignoring numeric key entries)
            for (const [cityKey, cityData] of Object.entries(cityToPlz)) {
                if (!/^\d{5}$/.test(cityKey) && cityData.plzs && cityData.plzs.includes(cityLower)) {
                    targetPlzs = cityData.plzs;
                    console.log(`[Scraper API] PLZ ${cityLower} resolved to city "${cityData.originalName}" with ${targetPlzs.length} PLZs.`);
                    break;
                }
            }
            // Fallback: if PLZ is not associated with any city in the map, scan just this PLZ
            if (targetPlzs.length === 0) {
                targetPlzs = [cityLower];
            }
        } else if (cityToPlz[cityLower]) {
            targetPlzs = cityToPlz[cityLower].plzs;
            console.log(`[Scraper API] City name "${cityLower}" resolved to ${targetPlzs.length} PLZs.`);
        } else {
            console.log(`[Scraper API] No predefined PLZs found for "${companySize}". Using free text query.`);
        }

        // 1. Create campaign
        const campaign = await prisma.campaign.create({
            data: { name, industry, companySize, status: 'RUNNING' }
        });

        const isSync = process.env.NODE_ENV === 'test' || req.body.sync === true || !req.body.pages || req.body.pages <= 2;

        if (isSync) {
            // Synchronously await the scraping process
            try {
                await scrapeB2BContacts({ 
                    prisma,
                    campaignId: campaign.id,
                    name, 
                    industry, 
                    companySize, 
                    pages, 
                    requirePhone,
                    targetPlzs,
                    port: PORT 
                });
            } catch (err) {
                console.error(`[Scraper] Synchronous task error for campaign ${campaign.id}:`, err);
            }

            const contactsCount = await prisma.scrapedContact.count({
                where: { campaignId: campaign.id }
            });

            return res.status(201).json({
                success: true,
                campaignId: campaign.id,
                plzs: targetPlzs,
                contactsCount,
                message: 'Scraping completed synchronously'
            });
        } else {
            // 2. Start scraping asynchronously in the background
            scrapeB2BContacts({ 
                prisma,
                campaignId: campaign.id,
                name, 
                industry, 
                companySize, 
                pages, 
                requirePhone,
                targetPlzs,
                port: PORT 
            }).catch(err => {
                console.error(`[Scraper] Background task error for campaign ${campaign.id}:`, err);
            });

            // 3. Respond immediately
            return res.status(201).json({
                success: true,
                campaignId: campaign.id,
                plzs: targetPlzs,
                message: 'Scraping started in background'
            });
        }
    } catch (error) {
        console.error("Error creating campaign:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 5a. Get Campaign Status (Protected)
app.get('/api/campaigns/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        if (isNaN(campaignId)) return res.status(400).json({ success: false, error: 'Invalid ID' });

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        });
        
        if (!campaign) return res.status(404).json({ success: false, error: 'Not found' });

        const contactsCount = await prisma.scrapedContact.count({
            where: { campaignId }
        });

        res.json({
            success: true,
            status: campaign.status,
            contactsCount,
            progress: scraperProgress[campaignId] || null
        });
    } catch (error) {
        console.error("Error fetching campaign status:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// 5c. Stop Campaign (Protected)
app.post('/api/campaigns/:id/stop', authenticateAdmin, async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        if (isNaN(campaignId)) return res.status(400).json({ success: false, error: 'Invalid ID' });

        const { cancelCampaign } = require('./services/scraperService');
        cancelCampaign(campaignId);

        // Update in DB immediately so frontend knows it's stopped before scraper finishes cleanup
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'STOPPED' }
        });

        res.json({ success: true, message: 'Campaign stop requested' });
    } catch (error) {
        console.error("Error stopping campaign:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// 5b. Get Paginated Contacts (Protected)
app.get('/api/campaigns/:id/contacts', authenticateAdmin, async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        if (isNaN(campaignId)) return res.status(400).json({ success: false, error: 'Invalid ID' });

        const contacts = await prisma.scrapedContact.findMany({
            where: { campaignId },
            skip,
            take: limit,
            orderBy: { id: 'desc' } // Zeige neueste zuerst
        });

        const total = await prisma.scrapedContact.count({
            where: { campaignId }
        });

        res.json({
            success: true,
            data: contacts,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Error fetching campaign contacts:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// 6. Global B2B Database Endpoints
// 6a. Get all contacts with pagination, search and filter
app.get('/api/contacts', authenticateAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const statusFilter = req.query.status || '';
        const cityFilter = req.query.city || '';
        const skip = (page - 1) * limit;

        const where = {};
        
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { website: { contains: search } }
            ];
        }

        if (statusFilter) {
            where.status = statusFilter;
        }
        
        if (cityFilter) {
            where.campaign = { companySize: cityFilter };
        }

        const contacts = await prisma.scrapedContact.findMany({
            where,
            skip,
            take: limit,
            include: { campaign: true },
            orderBy: [
                { campaign: { companySize: 'asc' } },
                { createdAt: 'desc' }
            ]
        });

        const total = await prisma.scrapedContact.count({ where });

        res.json({
            success: true,
            data: contacts,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Error fetching global contacts:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// 6b. Update contact status
app.patch('/api/contacts/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        
        if (isNaN(id) || !status) return res.status(400).json({ success: false, error: 'Invalid data' });

        await prisma.scrapedContact.update({
            where: { id },
            data: { status }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error updating contact status:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// 6c. Export filtered global contacts
app.get('/api/contacts/export', authenticateAdmin, async (req, res) => {
    try {
        const search = req.query.search || '';
        const statusFilter = req.query.status || '';
        
        const cityFilter = req.query.city || '';
        
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { website: { contains: search } }
            ];
        }
        if (statusFilter) {
            where.status = statusFilter;
        }
        if (cityFilter) {
            where.campaign = { companySize: cityFilter };
        }

        const contacts = await prisma.scrapedContact.findMany({
            where,
            include: { campaign: true },
            orderBy: [
                { campaign: { companySize: 'asc' } },
                { createdAt: 'desc' }
            ]
        });

        const formattedContacts = contacts.map(c => ({
            id: c.id,
            createdAt: c.createdAt,
            stadt: c.campaign?.companySize || 'Unbekannt',
            adresse: c.address || '',
            name: c.name,
            phone: c.phone,
            website: c.website,
            email: c.email,
            status: c.status
        }));
        
        const Parser = require('json2csv').Parser;
        const fields = ['id', 'createdAt', 'stadt', 'adresse', 'name', 'phone', 'website', 'email', 'status'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(formattedContacts);

        res.header('Content-Type', 'text/csv');
        res.attachment('b2b_database.csv');
        return res.send(csv);
    } catch (error) {
        console.error("Error exporting global contacts:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// 6d. Get distinct cities for filter
app.get('/api/cities', authenticateAdmin, async (req, res) => {
    try {
        const campaigns = await prisma.campaign.findMany({
            select: { companySize: true },
            distinct: ['companySize']
        });
        const cities = campaigns.map(c => c.companySize).filter(c => c).sort();
        res.json({ success: true, data: cities });
    } catch(e) {
        res.status(500).json({ success: false });
    }
});

// --- Existing logic from 5c onwards ---

// 6. Export Campaign Contacts as CSV (Protected)
app.get('/api/campaigns/:id/export', authenticateAdmin, async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        if (isNaN(campaignId)) {
            return res.status(400).json({ success: false, error: 'Invalid Campaign ID' });
        }

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { contacts: true }
        });

        if (!campaign) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }

        // Generate DACH style Excel-compatible semicolon separated CSV
        const headers = ['Name', 'Phone', 'Website', 'Email', 'Status', 'CreatedAt'];
        const headerLine = headers.map(h => `"${h}"`).join(';');
        
        const rows = campaign.contacts.map(contact => {
            return [
                contact.name || '',
                contact.phone || '',
                contact.website || '',
                contact.email || '',
                contact.status || '',
                contact.createdAt ? contact.createdAt.toISOString() : ''
            ].map(val => `"${val.replace(/"/g, '""')}"`).join(';');
        });

        const csvContent = [headerLine, ...rows].join('\r\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="campaign_${campaignId}_contacts.csv"`);
        res.status(200).send(csvContent);
    } catch (error) {
        console.error("Error exporting campaign:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 7. Send Campaign Emails (Protected)
app.post('/api/campaigns/:id/send', authenticateAdmin, async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        if (isNaN(campaignId)) {
            return res.status(400).json({ success: false, error: 'Invalid Campaign ID' });
        }

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }

        // Trigger email campaign dispatch
        const results = await sendCampaign(campaignId, req.body);

        res.json({
            success: true,
            sent: results.sent,
            failed: results.failed
        });
    } catch (error) {
        console.error("Error sending campaign emails:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 7a. Send Email to Single Contact (Protected)
app.post('/api/contacts/:id/send', authenticateAdmin, async (req, res) => {
    try {
        const contactId = parseInt(req.params.id);
        if (isNaN(contactId)) {
            return res.status(400).json({ success: false, error: 'Invalid Contact ID' });
        }
        
        await sendSingleContact(contactId, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error("Error sending single email:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// 7a. Get Rendered Email Preview (Public)
app.get('/api/email/preview', (req, res) => {
    try {
        const { subject, body } = getFallbackTemplate('Max Mustermann', 'Energieberater', 'Mittelstand');
        const imageSrc = '/sales_partner_smooth.png';
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>E-Mail Template Preview</title>
          </head>
          <body style="background-color: #f1f5f9; padding: 20px; font-family: Arial, sans-serif;">
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #0056b3; margin: 0;">Alpha Energie GmbH</h2>
                <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">Zukunftssichere B2B-Tarife & Vertriebspartnerschaften</p>
              </div>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <strong style="color: #475569;">Betreff:</strong> ${subject}
              </div>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 20px; white-space: pre-wrap;">${body}</div>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 120px; vertical-align: top; padding-right: 15px;">
                    <img src="${imageSrc}" alt="Ihr Alpha Energie Ansprechpartner" style="width: 120px; height: auto; border-radius: 8px;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <strong style="color: #0056b3; font-size: 16px;">Alpha Energie B2B Vertrieb</strong><br>
                    <span style="color: #555; font-size: 14px;">Partnerschafts- und Vertriebs-Service</span><br>
                    <a href="https://www.alpha-energie.de" style="color: #0056b3; text-decoration: none; font-size: 14px;">www.alpha-energie.de</a>
                  </td>
                </tr>
              </table>
              <br>
              <div style="font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                Sie erhalten diese B2B-Kooperationsanfrage als potenzieller Geschäftspartner. 
                <br>Wenn Sie keine weiteren E-Mails von uns wünschen, können Sie sich 
                <a href="#" style="color: #666;">hier abmelden</a>.
              </div>
            </div>
          </body>
          </html>
        `;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(html);
    } catch (error) {
        console.error("Error generating email preview:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 8. Mock website endpoint to dynamically serve email links for crawler testing
app.get('/api/mock-website/:slug', (req, res) => {
    const slug = req.params.slug;
    const email = `kontakt@${slug}.de`;
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mock Website - ${slug}</title>
        </head>
        <body>
            <h1>Willkommen bei ${slug.replace(/-/g, ' ')}</h1>
            <p>Wir sind Ihr B2B Partner.</p>
            <p>Kontaktieren Sie uns unter <a href="mailto:${email}">${email}</a> oder besuchen Sie uns.</p>
            <p>Impressum: info@${slug}.de</p>
        </body>
        </html>
    `);
});

// --- Affiliate API ---
app.post('/api/admin/affiliates', authenticateAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const code = Math.random().toString(36).substring(2, 8); // random short string
        const newAffiliate = await prisma.affiliateLink.create({
            data: { name, code }
        });
        res.json({ success: true, data: newAffiliate });
    } catch (error) {
        console.error("Error creating affiliate:", error);
        res.status(500).json({ success: false, error: 'Failed to create affiliate link' });
    }
});

app.get('/api/admin/affiliates', authenticateAdmin, async (req, res) => {
    try {
        const affiliates = await prisma.affiliateLink.findMany({
            include: {
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: affiliates });
    } catch (error) {
        console.error("Error fetching affiliates:", error);
        res.status(500).json({ success: false, error: 'Failed to fetch affiliates' });
    }
});

app.get('/api/admin/affiliates/:id/applications', authenticateAdmin, async (req, res) => {
    try {
        const applications = await prisma.partnerApplication.findMany({
            where: { affiliateLinkId: parseInt(req.params.id) },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: applications });
    } catch (error) {
        console.error("Error fetching affiliate applications:", error);
        res.status(500).json({ success: false, error: 'Failed to fetch applications' });
    }
});

// --- Werbelink Applications Admin API ---
app.get('/api/admin/werbelink-applications', authenticateAdmin, async (req, res) => {
    try {
        const { partnerId, status, search } = req.query;

        let where = { affiliateLinkId: { not: null } };
        if (partnerId) {
            where.affiliateLinkId = parseInt(partnerId);
        }
        if (status) {
            where.masterDataStatus = status;
        }
        if (search) {
            where.AND = [
                {
                    OR: [
                        { fullName: { contains: search } },
                        { email: { contains: search } },
                        { phone: { contains: search } },
                        { companyName: { contains: search } }
                    ]
                }
            ];
        }

        const applications = await prisma.partnerApplication.findMany({
            where,
            include: { affiliateLink: true },
            orderBy: { createdAt: 'desc' }
        });

        // KPIs
        const total = await prisma.partnerApplication.count({ where: { affiliateLinkId: { not: null } } });
        const newCount = await prisma.partnerApplication.count({ where: { affiliateLinkId: { not: null }, masterDataStatus: 'SUBMITTED' } });
        const pendingCount = await prisma.partnerApplication.count({ where: { affiliateLinkId: { not: null }, masterDataStatus: 'PENDING' } });
        const activePartners = await prisma.affiliateLink.count();

        res.json({
            success: true,
            data: applications,
            kpis: {
                total,
                newCount,
                pendingCount,
                activePartners
            }
        });
    } catch (e) {
        console.error("Error fetching werbelink applications:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.patch('/api/admin/werbelink-applications/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await prisma.partnerApplication.update({
            where: { id: parseInt(req.params.id) },
            data: { masterDataStatus: status }
        });
        res.json({ success: true, data: updated });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Admin endpoint to manually create partner application with full Stammdaten
app.post('/api/admin/partner-applications/create', authenticateAdmin, async (req, res) => {
    try {
        const data = req.body;
        if (!data.email || !data.fullName && (!data.firstName || !data.lastName)) {
            return res.status(400).json({ success: false, error: 'E-Mail und Name sind erforderlich.' });
        }

        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.fullName || 'Unbekannt';

        let affiliateLinkId = null;
        if (data.affiliateLinkId) {
            affiliateLinkId = parseInt(data.affiliateLinkId);
        } else if (data.refCode) {
            const affiliate = await prisma.affiliateLink.findFirst({
                where: {
                    OR: [
                        { code: data.refCode },
                        { name: { equals: data.refCode } }
                    ]
                }
            });
            if (affiliate) affiliateLinkId = affiliate.id;
        }

        const newApp = await prisma.partnerApplication.create({
            data: {
                salutation: data.salutation || 'Herr',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                fullName: fullName,
                email: data.email,
                phone: data.phone || '',
                experience: data.experience || 'Manuell im Admin angelegt',
                birthDate: data.birthDate || null,
                street: data.street || null,
                houseNr: data.houseNr || null,
                plz: data.plz || null,
                city: data.city || null,
                country: data.country || 'Deutschland',
                isVatLiable: data.isVatLiable === true || data.isVatLiable === 'true',
                companyName: data.companyName || null,
                legalForm: data.legalForm || null,
                taxId: data.taxId || null,
                taxOffice: data.taxOffice || null,
                iban: data.iban || null,
                bic: data.bic || null,
                bankName: data.bankName || null,
                website: data.website || null,
                notes: data.notes || null,
                masterDataStatus: data.masterDataStatus || 'SUBMITTED',
                affiliateLinkId: affiliateLinkId
            }
        });

        res.json({ success: true, data: newApp });
    } catch (e) {
        console.error("Error creating manual partner application:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// =========================================================================
// 5. ALPHATARIFE IN-HOUSE PARTNER PORTAL & ADMIN COMMISSION ENGINE
// =========================================================================
const crypto = require('crypto');
const PARTNER_JWT_SECRET = process.env.JWT_SECRET || 'alpha-energie-partner-secret-2026';

function hashPartnerPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
    return `${salt}:${derived}`;
}

function verifyPartnerPassword(password, storedHash) {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, key] = storedHash.split(':');
    const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
    try {
        return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derived, 'hex'));
    } catch (e) {
        return false;
    }
}

function generateUniquePartnerCode(role = 'AFFILIATE', name = '') {
    const prefixMap = {
        D2D: 'VP',
        AFFILIATE: 'AFF',
        TIPPGEBER: 'TIP',
        AGENCY: 'AG'
    };
    const prefix = prefixMap[String(role).toUpperCase()] || 'VP';
    const cleanName = String(name || '').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3) || 'ALP';
    const rand = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${cleanName}${rand}`;
}

function parseJsonMeta(raw) {
    if (!raw || typeof raw !== 'string') return {};
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
            return JSON.parse(trimmed);
        } catch (e) {
            return { legacyNote: raw };
        }
    }
    return { legacyNote: raw };
}

function packJsonMeta(existingRaw, updates = {}) {
    const base = parseJsonMeta(existingRaw);
    const merged = { ...base };
    Object.keys(updates).forEach(k => {
        if (updates[k] !== undefined) {
            merged[k] = updates[k];
        }
    });
    return JSON.stringify(merged);
}

const DEFAULT_ORDER_STATUS_MESSAGES = {
    RECEIVED: 'Auftrag eingegangen – Formelle Vorprüfung & Weiterleitung an Netzbetreiber läuft.',
    AWAITING_SIGNATURE: 'Wartet auf digitale Kundenunterschrift (Remote-Sign Link aktiv).',
    CONFIRMED: 'Vertrag bestätigt & beim Verteilnetzbetreiber (VNB) angemeldet.',
    IN_DELIVERY: 'Belieferung aktiv – Zähler wird beliefert, Provision freigegeben.',
    CLARIFICATION: 'Klärfall: Rückfrage vom Netzbetreiber (bitte Zählernummer / Lieferadresse prüfen).',
    PAID: 'Vertrag aktiv & Provision bereits per Gutschrift abgerechnet.',
    CANCELLED: 'Auftrag storniert / Widerruf oder Netzbetreiber-Ablehnung.'
};

function enrichOrderForPortal(order, isAdmin = false) {
    if (!order) return null;
    const meta = parseJsonMeta(order.notes);
    const customMsg = meta.statusMessage !== undefined
        ? meta.statusMessage
        : (meta.legacyNote || '');
    const statusMessage = customMsg || DEFAULT_ORDER_STATUS_MESSAGES[order.status] || 'In Bearbeitung';
    const result = {
        ...order,
        statusMessage,
        hasCustomStatusMessage: Boolean(customMsg),
        supplyStartDate: meta.supplyStartDate || null,
        statusUpdatedAt: meta.statusUpdatedAt || order.createdAt,
        payoutNumber: meta.payoutNumber || null,
        ibanMasked: order.iban ? (order.iban.slice(0, 6) + '••••••••' + order.iban.slice(-4)) : ''
    };
    if (isAdmin) {
        result.internalAdminNote = meta.internalAdminNote || '';
    } else {
        // VPs only see their own order status & statusMessage, never internal admin notes
        delete result.internalAdminNote;
    }
    return result;
}

function enrichPayoutForPortal(payout) {
    if (!payout) return null;
    const meta = parseJsonMeta(payout.notes);
    return {
        ...payout,
        subTotalEur: meta.subTotalEur !== undefined ? Number(meta.subTotalEur) : Number(payout.netAmount || 0),
        stornoReservePct: meta.stornoReservePct !== undefined ? Number(meta.stornoReservePct) : 0,
        stornoReserveAmount: meta.stornoReserveAmount !== undefined ? Number(meta.stornoReserveAmount) : 0,
        stornoReleaseAmount: meta.stornoReleaseAmount !== undefined ? Number(meta.stornoReleaseAmount) : 0,
        bonusAmount: meta.bonusAmount !== undefined ? Number(meta.bonusAmount) : 0,
        items: Array.isArray(meta.items) ? meta.items : [],
        remark: meta.remark || meta.legacyNote || ''
    };
}

function sanitizePartnerUser(p) {
    if (!p) return null;
    const { passwordHash, ...rest } = p;
    const meta = parseJsonMeta(p.notes);
    return {
        ...rest,
        vatId: meta.vatId || '',
        ihkNumber: meta.ihkNumber || '',
        gewerbeamtCity: meta.gewerbeamtCity || '',
        stornoReservePct: meta.stornoReservePct !== undefined ? Number(meta.stornoReservePct) : 10,
        liabilityMonths: meta.liabilityMonths !== undefined ? Number(meta.liabilityMonths) : 12,
        payoutCycle: meta.payoutCycle || 'MONTHLY',
        ladestromCommissionEur: meta.ladestromCommissionEur !== undefined ? Number(meta.ladestromCommissionEur) : (Number(p.stromCommissionEur) || 55),
        adminRemarks: meta.adminRemarks || meta.legacyNote || '',
        versorgerRelativeUrl: `/versorger?ref=${encodeURIComponent(p.partnerCode)}`,
        versorgerAffiliateUrl: `https://alpha-energie.de/versorger?ref=${encodeURIComponent(p.partnerCode)}`
    };
}

const authenticatePartner = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Nicht autorisiert (Kein Partner-Token).' });
    }
    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, PARTNER_JWT_SECRET);
        if (!decoded || !decoded.partnerId) {
            return res.status(401).json({ success: false, error: 'Ungültiges Partner-Token.' });
        }
        const partner = await prisma.partnerUser.findUnique({ where: { id: Number(decoded.partnerId) } });
        if (!partner || partner.status === 'SUSPENDED') {
            return res.status(403).json({ success: false, error: 'Partner-Konto nicht aktiv oder gesperrt.' });
        }
        req.partner = partner;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Sitzung abgelaufen. Bitte neu einloggen.' });
    }
};

// Ensure only the master alphaadmin account exists and purge legacy demo accounts
async function ensureDemoPartnersSeeded() {
    try {
        const legacyDemoCodes = ['AG-NRW01', 'VP-D2D100', 'AFF-MAX24', 'TIP-ANNA'];

        // Remove legacy demo payouts, clicks, leads, orders, affiliate links, and demo users
        await prisma.commissionPayout.deleteMany({
            where: { payoutNumber: 'GS-2026-1001' }
        }).catch(() => {});

        await prisma.energyOrder.deleteMany({
            where: {
                OR: [
                    { orderNumber: { in: ['AE-2026-810241', 'AE-2026-810599', 'AE-2026-810812'] } },
                    { partnerCode: { in: legacyDemoCodes } }
                ]
            }
        }).catch(() => {});

        await prisma.affiliateClick.deleteMany({
            where: { partnerCode: { in: legacyDemoCodes } }
        }).catch(() => {});

        await prisma.partnerLead.deleteMany({
            where: { partnerCode: { in: legacyDemoCodes } }
        }).catch(() => {});

        await prisma.affiliateLink.deleteMany({
            where: { code: { in: legacyDemoCodes } }
        }).catch(() => {});

        await prisma.partnerUser.deleteMany({
            where: { partnerCode: { in: legacyDemoCodes } }
        }).catch(() => {});

        // Upsert the sole master account: alphaadmin / Alpha2026!!!
        const alphaAdminHash = hashPartnerPassword('Alpha2026!!!');
        const existingAdmin = await prisma.partnerUser.findUnique({
            where: { partnerCode: 'ALPHAADMIN' }
        }).catch(() => null);

        const existingMeta = existingAdmin ? parseJsonMeta(existingAdmin.notes) : {};
        const needsFullPurge = !existingMeta.purgedAllExceptAlphaAdminV1;

        const adminNotes = JSON.stringify({
            ...existingMeta,
            vatId: existingMeta.vatId || 'DE319844120',
            ihkNumber: existingMeta.ihkNumber || 'HRB 38030',
            stornoReservePct: 0,
            liabilityMonths: 12,
            payoutCycle: 'MONTHLY',
            isSystemAdmin: true,
            purgedAllExceptAlphaAdminV1: true
        });

        await prisma.partnerUser.upsert({
            where: { partnerCode: 'ALPHAADMIN' },
            update: {
                email: 'alphaadmin',
                passwordHash: alphaAdminHash,
                status: 'ACTIVE',
                role: 'AGENCY',
                fullName: 'Alpha Energie Admin',
                companyName: 'Alpha Energie GmbH',
                notes: adminNotes
            },
            create: {
                partnerCode: 'ALPHAADMIN',
                email: 'alphaadmin',
                passwordHash: alphaAdminHash,
                role: 'AGENCY',
                status: 'ACTIVE',
                salutation: 'Herr',
                firstName: 'Alpha',
                lastName: 'Admin',
                fullName: 'Alpha Energie Admin',
                companyName: 'Alpha Energie GmbH',
                legalForm: 'GmbH',
                phone: '0231 39989390',
                street: 'Alter Hellweg',
                houseNr: '50',
                plz: '44379',
                city: 'Dortmund',
                country: 'Deutschland',
                isVatLiable: true,
                taxId: '314/5781/2091',
                taxOffice: 'Finanzamt Dortmund-Ost',
                iban: 'DE89370400440532013000',
                bic: 'COBADEFFXXX',
                bankName: 'Commerzbank',
                stromCommissionEur: 75.0,
                gasCommissionEur: 75.0,
                waermeCommissionEur: 85.0,
                overrideCommissionEur: 15.0,
                commissionTier: 'DIRECTOR',
                notes: adminNotes
            }
        });

        // One-time full purge of any other pre-existing partner accounts so only alphaadmin remains initially
        if (needsFullPurge) {
            await prisma.partnerUser.deleteMany({
                where: { partnerCode: { not: 'ALPHAADMIN' } }
            }).catch(() => {});
            console.log('[PartnerPortal] Purged all accounts except alphaadmin (Alpha2026!!!).');
        }

        await prisma.affiliateLink.upsert({
            where: { code: 'ALPHAADMIN' },
            update: { name: 'Alpha Energie Admin (Zentrale)' },
            create: { name: 'Alpha Energie Admin (Zentrale)', code: 'ALPHAADMIN' }
        }).catch(() => {});
    } catch (err) {
        console.warn('[PartnerPortal] AlphaAdmin seed error:', err.message);
    }
}
ensureDemoPartnersSeeded();

// 5.0 Public Affiliate Partner Verification for /versorger?ref=CODE
app.get('/api/affiliate/partner-info', async (req, res) => {
    try {
        await ensureDemoPartnersSeeded();
        const rawCode = String(req.query.ref || req.query.partner || req.query.vp || req.query.code || '').trim();
        if (!rawCode) {
            return res.json({ success: false, valid: false });
        }
        const partner = await prisma.partnerUser.findFirst({
            where: {
                OR: [
                    { partnerCode: rawCode },
                    { partnerCode: rawCode.toUpperCase() }
                ]
            }
        });
        if (!partner || partner.status === 'SUSPENDED') {
            return res.json({ success: false, valid: false });
        }
        res.json({
            success: true,
            valid: true,
            partnerCode: partner.partnerCode,
            displayName: partner.companyName || partner.fullName,
            fullName: partner.fullName,
            role: partner.role,
            city: partner.city || 'Deutschland'
        });
    } catch (err) {
        res.status(500).json({ success: false, valid: false, error: err.message });
    }
});

// 5.1 Affiliate Click & Sub-ID Tracking
app.post('/api/affiliate/click', async (req, res) => {
    try {
        const { partnerCode, refCode, aff, ref, subId, sub_id, landingPage, referrer } = req.body || {};
        const rawCode = String(partnerCode || refCode || aff || ref || '').trim();
        if (!rawCode) {
            return res.json({ success: false, message: 'No partner code provided' });
        }

        const partner = await prisma.partnerUser.findFirst({
            where: {
                OR: [
                    { partnerCode: rawCode },
                    { partnerCode: rawCode.toUpperCase() }
                ]
            }
        }).catch(() => null);

        const clickRecord = await prisma.affiliateClick.create({
            data: {
                partnerId: partner ? partner.id : null,
                partnerCode: partner ? partner.partnerCode : rawCode.toUpperCase(),
                subId: subId || sub_id ? String(subId || sub_id).trim() : null,
                landingPage: landingPage ? String(landingPage).slice(0, 255) : '/versorger.html',
                referrer: referrer ? String(referrer).slice(0, 255) : null,
                userAgent: req.headers['user-agent'] ? String(req.headers['user-agent']).slice(0, 255) : null
            }
        });

        await prisma.affiliateLink.updateMany({
            where: { code: partner ? partner.partnerCode : rawCode },
            data: { clicks: { increment: 1 } }
        }).catch(() => {});

        res.json({
            success: true,
            clickId: clickRecord.id,
            partnerCode: clickRecord.partnerCode,
            subId: clickRecord.subId,
            partnerName: partner ? (partner.companyName || partner.fullName) : null
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5.2 Partner Self-Registration
app.post('/api/partner/register', async (req, res) => {
    try {
        const body = req.body || {};
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '').trim();
        const firstName = String(body.firstName || '').trim();
        const lastName = String(body.lastName || '').trim();
        const fullName = `${firstName} ${lastName}`.trim() || String(body.fullName || '').trim();
        const role = ['D2D', 'AFFILIATE', 'TIPPGEBER', 'AGENCY'].includes(String(body.role || '').toUpperCase())
            ? String(body.role).toUpperCase()
            : 'AFFILIATE';

        if (!email || !password || password.length < 6 || !fullName) {
            return res.status(400).json({
                success: false,
                error: 'Bitte Name, gültige E-Mail-Adresse und ein Passwort (mind. 6 Zeichen) angeben.'
            });
        }

        const existing = await prisma.partnerUser.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'Für diese E-Mail-Adresse existiert bereits ein Partner-Zugang. Bitte loggen Sie sich ein.'
            });
        }

        let parentPartnerId = null;
        if (body.parentPartnerCode) {
            const parent = await prisma.partnerUser.findFirst({
                where: { partnerCode: String(body.parentPartnerCode).trim().toUpperCase() }
            });
            if (parent) parentPartnerId = parent.id;
        }

        let partnerCode = generateUniquePartnerCode(role, lastName || fullName);
        for (let i = 0; i < 5; i++) {
            const codeCheck = await prisma.partnerUser.findUnique({ where: { partnerCode } });
            if (!codeCheck) break;
            partnerCode = generateUniquePartnerCode(role, lastName || fullName);
        }

        const defaultCommissions = {
            D2D: { strom: 65, gas: 65, waerme: 75, override: 0 },
            AFFILIATE: { strom: 55, gas: 55, waerme: 65, override: 0 },
            TIPPGEBER: { strom: 35, gas: 35, waerme: 40, override: 0 },
            AGENCY: { strom: 75, gas: 75, waerme: 85, override: 15 }
        }[role];

        let ibanClean = body.iban ? String(body.iban).replace(/\s+/g, '').toUpperCase() : null;
        let bic = body.bic || null;
        let bankName = body.bankName || null;
        if (ibanClean) {
            const check = firstconService.validateIbanMod97(ibanClean);
            if (!check.valid) {
                return res.status(400).json({
                    success: false,
                    error: 'Die angegebene IBAN ist ungültig (ISO-7064 Mod-97 Prüfsummenfehler).'
                });
            }
            ibanClean = check.clean;
            bic = bic || check.bic;
            bankName = bankName || check.bankName;
        }

        const newPartner = await prisma.partnerUser.create({
            data: {
                partnerCode,
                email,
                passwordHash: hashPartnerPassword(password),
                role,
                status: 'ACTIVE',
                salutation: body.salutation || 'Herr',
                firstName: firstName || fullName.split(' ')[0] || '',
                lastName: lastName || fullName.split(' ').slice(1).join(' ') || '',
                fullName,
                companyName: body.companyName || null,
                legalForm: body.legalForm || null,
                phone: body.phone || '',
                birthDate: body.birthDate || null,
                street: body.street || null,
                houseNr: body.houseNr || null,
                plz: body.plz || null,
                city: body.city || null,
                country: body.country || 'Deutschland',
                isVatLiable: body.isVatLiable === true || body.isVatLiable === 'true',
                taxId: body.taxId || null,
                taxOffice: body.taxOffice || null,
                iban: ibanClean,
                bic,
                bankName,
                website: body.website || null,
                stromCommissionEur: defaultCommissions.strom,
                gasCommissionEur: defaultCommissions.gas,
                waermeCommissionEur: defaultCommissions.waerme,
                overrideCommissionEur: defaultCommissions.override,
                parentPartnerId
            }
        });

        await prisma.affiliateLink.upsert({
            where: { code: partnerCode },
            update: { name: `${fullName} (${role})` },
            create: { name: `${fullName} (${role})`, code: partnerCode }
        }).catch(() => {});

        await prisma.partnerApplication.create({
            data: {
                salutation: newPartner.salutation,
                firstName: newPartner.firstName,
                lastName: newPartner.lastName,
                fullName: newPartner.fullName,
                email: newPartner.email,
                phone: newPartner.phone || '',
                experience: `Portal Self-Service (${role}) – Code: ${partnerCode}`,
                companyName: newPartner.companyName,
                street: newPartner.street,
                houseNr: newPartner.houseNr,
                plz: newPartner.plz,
                city: newPartner.city,
                iban: newPartner.iban,
                bic: newPartner.bic,
                bankName: newPartner.bankName,
                isVatLiable: newPartner.isVatLiable,
                taxId: newPartner.taxId,
                masterDataStatus: 'SUBMITTED'
            }
        }).catch(() => {});

        // Send confirmation email to newly registered partner & notification to bewerbung@ asynchronously
        (async () => {
            try {
                if (newPartner.email) {
                    try {
                        const transporter = getMailTransporter();
                        if (transporter) {
                            await transporter.sendMail({
                                from: getSenderEmail(),
                                to: newPartner.email,
                                subject: `Willkommen im Alpha Energie VP-Portal – Dein Partner-Code: ${newPartner.partnerCode}`,
                                html: getPartnerRegistrationConfirmationHtml(
                                    newPartner.fullName,
                                    newPartner.email,
                                    newPartner.phone,
                                    `Portal Self-Service (${role}) – Partner-Code: ${newPartner.partnerCode}`
                                )
                            });
                        }
                    } catch (applicantErr) {
                        console.error('[PartnerPortal] Failed to send welcome email to new partner:', applicantErr.message);
                    }
                }

                const addressStr = `${newPartner.street || ''} ${newPartner.houseNr || ''}, ${newPartner.plz || ''} ${newPartner.city || ''}`.replace(/^[\s,]+|[\s,]+$/g, '');
                const subject = `Neue VP-Portal Registrierung (${role}): ${newPartner.fullName} [${newPartner.partnerCode}]`;
                const text = `Ein neuer Vertriebspartner hat sich über das VP-Portal registriert:\n\n` +
                    `Partner-Code: ${newPartner.partnerCode}\n` +
                    `Rolle / Modell: ${role}\n` +
                    `Name: ${newPartner.salutation || ''} ${newPartner.fullName}\n` +
                    `Firma / Rechtsform: ${newPartner.companyName || '–'} (${newPartner.legalForm || '–'})\n` +
                    `E-Mail: ${newPartner.email}\n` +
                    `Telefon: ${newPartner.phone || 'Nicht angegeben'}\n` +
                    `Anschrift: ${addressStr || 'Nicht angegeben'}\n` +
                    `Steuernummer / Finanzamt: ${newPartner.taxId || '–'} / ${newPartner.taxOffice || '–'}\n` +
                    `Umsatzsteuerpflichtig: ${newPartner.isVatLiable ? 'Ja (19% MwSt.)' : 'Nein (§ 19 UStG)'}\n` +
                    `IBAN / Bank: ${newPartner.iban || '–'} (${newPartner.bankName || '–'})\n` +
                    `Oberpartner-Code: ${body.parentPartnerCode || 'Direkt'}\n\n` +
                    `Bitte im Admin-Panel prüfen: https://alpha-energie.de/admin`;

                const html = getPartnerBackofficeNotificationHtml(
                    'Neue VP-Portal Selbstregistrierung',
                    `Partner-Code: ${newPartner.partnerCode} • Rolle: ${role}`,
                    [
                        { label: 'Partner-Code', value: newPartner.partnerCode },
                        { label: 'Vertriebsmodell / Rolle', value: role },
                        { label: 'Name', value: `${newPartner.salutation || ''} ${newPartner.fullName}`.trim() },
                        { label: 'Firma / Agentur', value: `${newPartner.companyName || '–'} (${newPartner.legalForm || '–'})` },
                        { label: 'E-Mail-Adresse', value: newPartner.email },
                        { label: 'Telefonnummer', value: newPartner.phone || 'Nicht angegeben' },
                        { label: 'Anschrift', value: addressStr || 'Nicht angegeben' },
                        { label: 'Steuernummer / Finanzamt', value: `${newPartner.taxId || '–'} / ${newPartner.taxOffice || '–'}` },
                        { label: 'Umsatzsteuerpflichtig', value: newPartner.isVatLiable ? 'Ja (19% MwSt.)' : 'Nein (§ 19 UStG)' },
                        { label: 'IBAN / Bank', value: `${newPartner.iban || '–'} (${newPartner.bankName || '–'})` },
                        { label: 'Oberpartner-Code', value: body.parentPartnerCode || 'Direkt' }
                    ],
                    'Der Partner hat sich direkt im VP-Portal registriert.'
                );

                await sendBewerbungNotification({
                    subject,
                    text,
                    html,
                    replyTo: newPartner.email
                });
            } catch (mailErr) {
                console.error('[PartnerPortal] Error sending registration notification:', mailErr.message);
            }
        })();

        const token = jwt.sign(
            { partnerId: newPartner.id, partnerCode: newPartner.partnerCode, role: newPartner.role },
            PARTNER_JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            token,
            partner: sanitizePartnerUser(newPartner)
        });
    } catch (error) {
        console.error('[PartnerPortal] Registration error:', error);
        res.status(500).json({ success: false, error: 'Registrierung fehlgeschlagen: ' + error.message });
    }
});

// 5.3 Partner & AlphaAdmin Login
app.post('/api/partner/login', async (req, res) => {
    try {
        await ensureDemoPartnersSeeded();
        const { email, identifier, password } = req.body || {};

        const rawId = String(identifier || email || '').trim();
        if (!rawId || !password) {
            return res.status(400).json({ success: false, error: 'Bitte Benutzername / E-Mail / Partner-Code und Passwort eingeben.' });
        }

        const normLower = rawId.toLowerCase();
        const normUpper = rawId.toUpperCase();
        const isAlphaAdminId = normLower === 'alphaadmin' || normLower === 'alphaadmin@alpha-energie.de' || normUpper === 'ALPHAADMIN';

        let partner = null;
        if (isAlphaAdminId) {
            partner = await prisma.partnerUser.findUnique({ where: { partnerCode: 'ALPHAADMIN' } });
        } else {
            partner = await prisma.partnerUser.findFirst({
                where: {
                    OR: [
                        { email: normLower },
                        { partnerCode: normUpper },
                        { partnerCode: rawId }
                    ]
                }
            });
        }

        if (!partner || !verifyPartnerPassword(password, partner.passwordHash)) {
            return res.status(401).json({ success: false, error: 'Ungültige Zugangsdaten. Bitte Benutzername/Partner-Code oder Passwort prüfen.' });
        }

        const token = jwt.sign(
            { partnerId: partner.id, partnerCode: partner.partnerCode, role: partner.role },
            PARTNER_JWT_SECRET,
            { expiresIn: '30d' }
        );

        const isAdminAccount = partner.partnerCode === 'ALPHAADMIN';
        const adminSecret = process.env.JWT_SECRET || 'alpha_energie_admin_secret_2026';
        const adminToken = isAdminAccount
            ? jwt.sign({ admin: true, username: 'alphaadmin' }, adminSecret, { expiresIn: '12h' })
            : undefined;

        res.json({
            success: true,
            token,
            isAdmin: isAdminAccount,
            adminToken,
            partner: sanitizePartnerUser(partner)
        });
    } catch (error) {
        console.error('[PartnerPortal] Login error:', error);
        res.status(500).json({ success: false, error: 'Login fehlgeschlagen: ' + error.message });
    }
});

// 5.4 Partner Dashboard Data (KPIs, Orders, Sub-IDs, Leads, Downline, Payouts)
app.get('/api/partner/dashboard', authenticatePartner, async (req, res) => {
    try {
        const partner = req.partner;

        const ownOrders = await prisma.energyOrder.findMany({
            where: {
                OR: [
                    { partnerId: partner.id },
                    { partnerCode: partner.partnerCode }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        const overrideOrders = await prisma.energyOrder.findMany({
            where: { overridePartnerId: partner.id },
            orderBy: { createdAt: 'desc' }
        });

        const clicks = await prisma.affiliateClick.findMany({
            where: {
                OR: [
                    { partnerId: partner.id },
                    { partnerCode: partner.partnerCode }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 250
        });

        const leads = await prisma.partnerLead.findMany({
            where: {
                OR: [
                    { partnerId: partner.id },
                    { partnerCode: partner.partnerCode }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        const subPartnersRaw = await prisma.partnerUser.findMany({
            where: { parentPartnerId: partner.id },
            orderBy: { createdAt: 'desc' }
        });

        const subPartners = await Promise.all(subPartnersRaw.map(async (sp) => {
            const spOrders = await prisma.energyOrder.count({ where: { partnerId: sp.id } });
            const spVolume = await prisma.energyOrder.aggregate({
                where: { partnerId: sp.id },
                _sum: { commissionAmount: true }
            });
            return {
                ...sanitizePartnerUser(sp),
                ordersCount: spOrders,
                totalCommissionEur: spVolume._sum.commissionAmount || 0
            };
        }));

        const payouts = await prisma.commissionPayout.findMany({
            where: { partnerId: partner.id },
            orderBy: { createdAt: 'desc' }
        });

        const subIdMap = {};
        clicks.forEach(c => {
            const key = c.subId || '(Ohne Sub-ID)';
            if (!subIdMap[key]) {
                subIdMap[key] = { subId: key, clicks: 0, conversions: 0, commissionEur: 0 };
            }
            subIdMap[key].clicks += 1;
        });
        ownOrders.forEach(o => {
            const key = o.subId || '(Ohne Sub-ID)';
            if (!subIdMap[key]) {
                subIdMap[key] = { subId: key, clicks: 0, conversions: 0, commissionEur: 0 };
            }
            subIdMap[key].conversions += 1;
            if (o.status !== 'CANCELLED' && o.commissionStatus !== 'CANCELLED') {
                subIdMap[key].commissionEur += Number(o.commissionAmount || 0);
            }
        });

        const validOrders = ownOrders.filter(o => o.status !== 'CANCELLED' && o.commissionStatus !== 'CANCELLED');
        const pendingCommission = validOrders
            .filter(o => o.commissionStatus === 'PENDING')
            .reduce((sum, o) => sum + Number(o.commissionAmount || 0), 0);
        const approvedCommission = validOrders
            .filter(o => o.commissionStatus === 'APPROVED')
            .reduce((sum, o) => sum + Number(o.commissionAmount || 0), 0);
        const paidLeadsCommission = leads
            .filter(l => l.status === 'PAID')
            .reduce((sum, l) => sum + Number(l.commissionAmount || 0), 0);
        const paidCommission = validOrders
            .filter(o => o.commissionStatus === 'PAID')
            .reduce((sum, o) => sum + Number(o.commissionAmount || 0), 0) + paidLeadsCommission;
        const overrideCommissionTotal = overrideOrders
            .filter(o => o.status !== 'CANCELLED')
            .reduce((sum, o) => sum + Number(o.overrideAmount || 0), 0);
        const leadCommissionTotal = leads
            .filter(l => l.status === 'CONVERTED' || l.status === 'QUALIFIED' || l.status === 'PAID')
            .reduce((sum, l) => sum + Number(l.commissionAmount || 0), 0);
        const openLeadCommission = leads
            .filter(l => l.status === 'CONVERTED' || l.status === 'QUALIFIED')
            .reduce((sum, l) => sum + Number(l.commissionAmount || 0), 0);

        const sanitizedPartner = sanitizePartnerUser(partner);
        const enrichedOrders = ownOrders.map(o => enrichOrderForPortal(o, false));
        const enrichedOverrideOrders = overrideOrders.map(o => enrichOrderForPortal(o, false));
        const enrichedPayouts = payouts.map(enrichPayoutForPortal);

        const stornoReserveBalance = enrichedPayouts.reduce(
            (sum, p) => sum + Number(p.stornoReserveAmount || 0) - Number(p.stornoReleaseAmount || 0),
            0
        );

        const nextPayoutBaseEur = Number((pendingCommission + approvedCommission + openLeadCommission).toFixed(2));
        const reservePct = Number(sanitizedPartner.stornoReservePct ?? 10);
        const nextPayoutReserveEur = Number(((nextPayoutBaseEur * reservePct) / 100).toFixed(2));
        const nextPayoutNetEur = Number(Math.max(0, nextPayoutBaseEur - nextPayoutReserveEur).toFixed(2));
        const nextPayoutVatEur = sanitizedPartner.isVatLiable ? Number((nextPayoutNetEur * 0.19).toFixed(2)) : 0;
        const nextPayoutGrossEur = Number((nextPayoutNetEur + nextPayoutVatEur).toFixed(2));

        const totalClicks = clicks.length;
        const totalOrders = ownOrders.length;
        const conversionRate = totalClicks > 0 ? Number(((totalOrders / totalClicks) * 100).toFixed(1)) : (totalOrders > 0 ? 100 : 0);

        res.json({
            success: true,
            partner: sanitizedPartner,
            kpis: {
                totalClicks,
                totalOrders,
                conversionRate,
                pendingCommission: Number(pendingCommission.toFixed(2)),
                approvedCommission: Number(approvedCommission.toFixed(2)),
                paidCommission: Number(paidCommission.toFixed(2)),
                overrideCommissionTotal: Number(overrideCommissionTotal.toFixed(2)),
                leadCommissionTotal: Number(leadCommissionTotal.toFixed(2)),
                totalEarnedEur: Number((pendingCommission + approvedCommission + paidCommission + overrideCommissionTotal + leadCommissionTotal).toFixed(2)),
                stornoReserveBalance: Number(Math.max(0, stornoReserveBalance).toFixed(2)),
                subPartnersCount: subPartners.length,
                leadsCount: leads.length,
                nextPayoutPreview: {
                    baseEur: nextPayoutBaseEur,
                    reservePct,
                    reserveEur: nextPayoutReserveEur,
                    netEur: nextPayoutNetEur,
                    vatEur: nextPayoutVatEur,
                    grossEur: nextPayoutGrossEur,
                    eligibleOrdersCount: validOrders.filter(o => o.commissionStatus === 'PENDING' || o.commissionStatus === 'APPROVED').length
                }
            },
            orders: enrichedOrders,
            overrideOrders: enrichedOverrideOrders,
            subIdStats: Object.values(subIdMap),
            leads,
            subPartners,
            payouts: enrichedPayouts
        });
    } catch (error) {
        console.error('[PartnerPortal] Dashboard error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5.5 Update Partner Profile & Bank/Tax Stammdaten
app.patch('/api/partner/profile', authenticatePartner, async (req, res) => {
    try {
        const body = req.body || {};
        const updateData = {};
        const allowedFields = [
            'salutation', 'firstName', 'lastName', 'companyName', 'legalForm',
            'phone', 'birthDate', 'street', 'houseNr', 'plz', 'city',
            'taxId', 'taxOffice', 'iban', 'bic', 'bankName', 'website'
        ];
        allowedFields.forEach(f => {
            if (body[f] !== undefined) updateData[f] = body[f];
        });
        if (body.isVatLiable !== undefined) {
            updateData.isVatLiable = body.isVatLiable === true || body.isVatLiable === 'true';
        }
        if (updateData.firstName !== undefined || updateData.lastName !== undefined) {
            const fn = updateData.firstName !== undefined ? updateData.firstName : req.partner.firstName;
            const ln = updateData.lastName !== undefined ? updateData.lastName : req.partner.lastName;
            updateData.fullName = `${fn || ''} ${ln || ''}`.trim() || req.partner.fullName;
        }
        if (updateData.iban) {
            const check = firstconService.validateIbanMod97(updateData.iban);
            if (!check.valid) {
                return res.status(400).json({ success: false, error: check.reason || 'Ungültige IBAN.' });
            }
            updateData.iban = check.clean;
            updateData.bic = updateData.bic || check.bic;
            updateData.bankName = updateData.bankName || check.bankName;
        }
        if (body.vatId !== undefined || body.ihkNumber !== undefined || body.gewerbeamtCity !== undefined) {
            updateData.notes = packJsonMeta(req.partner.notes, {
                vatId: body.vatId,
                ihkNumber: body.ihkNumber,
                gewerbeamtCity: body.gewerbeamtCity
            });
        }
        if (body.newPassword && String(body.newPassword).length >= 6) {
            updateData.passwordHash = hashPartnerPassword(body.newPassword);
        }

        const updated = await prisma.partnerUser.update({
            where: { id: req.partner.id },
            data: updateData
        });

        res.json({ success: true, partner: sanitizePartnerUser(updated) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5.6 D2D Direct Order Submission (with Tablet Signature or Remote Signing Link Token)
app.post('/api/partner/orders', authenticatePartner, async (req, res) => {
    try {
        const partner = req.partner;
        const body = req.body || {};
        const {
            tariffId,
            tariffName,
            branch = 'strom',
            consumption,
            monthlyPayment,
            savings,
            street,
            houseNr,
            plz,
            city,
            meterNumber,
            currentProvider,
            cancelOldContract = true,
            salutation,
            firstName,
            lastName,
            birthDate,
            email,
            phone,
            iban,
            subId,
            signatureMode = 'PAD', // PAD or REMOTE
            signatureData
        } = body;

        if (!tariffName || !firstName || !lastName || !meterNumber || !iban || !email) {
            return res.status(400).json({
                success: false,
                error: 'Bitte alle Pflichtfelder (Tarif, Name, E-Mail, Zählernummer, IBAN) ausfüllen.'
            });
        }

        const ibanCheck = firstconService.validateIbanMod97(iban);
        if (!ibanCheck.valid) {
            return res.status(400).json({
                success: false,
                error: ibanCheck.reason || 'Die eingegebene IBAN ist ungültig.'
            });
        }

        const attribution = await resolveOrderPartnerAttribution({
            partnerId: partner.id,
            partnerCode: partner.partnerCode,
            subId: subId || 'd2d_direct',
            branch,
            orderSource: signatureMode === 'REMOTE' ? 'REMOTE_SIGN' : 'D2D'
        });

        const orderNumber = 'AE-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
        const isRemote = signatureMode === 'REMOTE' && !signatureData;
        const signatureToken = isRemote ? ('SIGN-' + crypto.randomBytes(12).toString('hex')) : null;

        const newOrder = await prisma.energyOrder.create({
            data: {
                orderNumber,
                tariffId: tariffId || 'alpha-strom-smart',
                tariffName,
                branch,
                consumption: parseInt(consumption, 10) || 2500,
                monthlyPayment: parseFloat(monthlyPayment) || 0,
                savings: savings ? parseFloat(savings) : null,
                street: street || '',
                houseNr: houseNr || '',
                plz: plz || '',
                city: city || '',
                meterNumber,
                currentProvider: currentProvider || null,
                cancelOldContract: cancelOldContract !== false,
                salutation: salutation || 'Herr',
                firstName,
                lastName,
                birthDate: birthDate || null,
                email,
                phone: phone || '',
                iban: ibanCheck.clean,
                ibanValid: true,
                bankName: ibanCheck.bankName || null,
                bic: ibanCheck.bic || null,
                status: isRemote ? 'AWAITING_SIGNATURE' : 'RECEIVED',
                partnerId: partner.id,
                partnerCode: partner.partnerCode,
                subId: attribution.subId,
                orderSource: attribution.orderSource,
                commissionStatus: 'PENDING',
                commissionAmount: attribution.commissionAmount,
                overridePartnerId: attribution.overridePartnerId,
                overrideAmount: attribution.overrideAmount,
                signatureData: signatureData || null,
                signatureToken,
                signedAt: signatureData ? new Date() : null,
                notes: JSON.stringify({
                    statusMessage: isRemote
                        ? 'Wartet auf digitale Kundenunterschrift über Remote-Sign Link.'
                        : 'D2D-Auftrag mit digitaler Unterschrift eingegangen – Netzbetreiber-Prüfung läuft.',
                    statusUpdatedAt: new Date().toISOString()
                })
            }
        });

        const remoteSignUrl = signatureToken
            ? `${req.protocol}://${req.get('host')}/vp?sign=${signatureToken}`
            : null;

        res.status(201).json({
            success: true,
            orderNumber: newOrder.orderNumber,
            order: enrichOrderForPortal(newOrder, false),
            remoteSignUrl,
            signatureToken
        });
    } catch (error) {
        console.error('[PartnerPortal] D2D order error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5.7 Customer Remote eSign Lookup & Signature Submission
app.get('/api/order/remote-sign/:token', async (req, res) => {
    try {
        const order = await prisma.energyOrder.findUnique({
            where: { signatureToken: String(req.params.token) }
        });
        if (!order) {
            return res.status(404).json({ success: false, error: 'Unterschrifts-Link nicht gefunden oder abgelaufen.' });
        }
        res.json({
            success: true,
            order: {
                orderNumber: order.orderNumber,
                tariffName: order.tariffName,
                branch: order.branch,
                consumption: order.consumption,
                monthlyPayment: order.monthlyPayment,
                salutation: order.salutation,
                firstName: order.firstName,
                lastName: order.lastName,
                street: order.street,
                houseNr: order.houseNr,
                plz: order.plz,
                city: order.city,
                meterNumber: order.meterNumber,
                ibanMasked: order.iban ? order.iban.slice(0, 6) + '••••••••••••' + order.iban.slice(-4) : '',
                status: order.status,
                signedAt: order.signedAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/order/remote-sign/:token', async (req, res) => {
    try {
        const { signatureData } = req.body || {};
        if (!signatureData || !String(signatureData).startsWith('data:image/')) {
            return res.status(400).json({ success: false, error: 'Bitte unterschreiben Sie im Unterschriftsfeld.' });
        }
        const order = await prisma.energyOrder.findUnique({
            where: { signatureToken: String(req.params.token) }
        });
        if (!order) {
            return res.status(404).json({ success: false, error: 'Auftrag nicht gefunden.' });
        }
        if (order.status === 'CANCELLED') {
            return res.status(400).json({ success: false, error: 'Dieser Auftrag wurde storniert und kann nicht mehr unterschrieben werden.' });
        }
        if (order.signedAt) {
            return res.status(409).json({
                success: false,
                alreadySigned: true,
                orderNumber: order.orderNumber,
                signedAt: order.signedAt,
                error: 'Dieser Auftrag wurde bereits rechtsgültig unterschrieben.'
            });
        }
        const updated = await prisma.energyOrder.update({
            where: { id: order.id },
            data: {
                signatureData,
                signedAt: new Date(),
                status: (order.status === 'PENDING_SIGNATURE' || order.status === 'AWAITING_SIGNATURE') ? 'RECEIVED' : order.status,
                notes: packJsonMeta(order.notes, {
                    statusMessage: 'Digitale Kundenunterschrift erfolgreich eingegangen – Weiterleitung an Netzbetreiber.',
                    statusUpdatedAt: new Date().toISOString()
                })
            }
        });
        res.json({
            success: true,
            orderNumber: updated.orderNumber,
            signedAt: updated.signedAt
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5.8 Tippgeber Lead Submission
app.post('/api/partner/leads', authenticatePartner, async (req, res) => {
    try {
        const partner = req.partner;
        const { customerName, customerPhone, customerEmail, plz, city, branch = 'strom', estimatedConsumption, notes } = req.body || {};
        if (!customerName || !customerPhone) {
            return res.status(400).json({ success: false, error: 'Bitte Name und Telefonnummer des empfohlenen Kontakts angeben.' });
        }
        const lead = await prisma.partnerLead.create({
            data: {
                partnerId: partner.id,
                partnerCode: partner.partnerCode,
                customerName: String(customerName).trim(),
                customerPhone: String(customerPhone).trim(),
                customerEmail: customerEmail ? String(customerEmail).trim() : null,
                plz: plz ? String(plz).trim() : null,
                city: city ? String(city).trim() : null,
                branch,
                estimatedConsumption: estimatedConsumption ? parseInt(estimatedConsumption, 10) : null,
                notes: notes ? String(notes).trim() : null,
                status: 'NEW',
                commissionAmount: partner.role === 'TIPPGEBER' ? (partner.stromCommissionEur || 35.0) : 35.0
            }
        });
        res.status(201).json({ success: true, lead });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5.9 Agency Downline Sub-Partner Creation
app.post('/api/partner/subpartners', authenticatePartner, async (req, res) => {
    try {
        const parent = req.partner;
        const { firstName, lastName, email, phone, role = 'D2D', password, stromCommissionEur } = req.body || {};
        const cleanEmail = String(email || '').trim().toLowerCase();
        const fullName = `${firstName || ''} ${lastName || ''}`.trim();
        if (!cleanEmail || !fullName) {
            return res.status(400).json({ success: false, error: 'Name und E-Mail des Unterpartners sind erforderlich.' });
        }
        const exists = await prisma.partnerUser.findUnique({ where: { email: cleanEmail } });
        if (exists) {
            return res.status(409).json({ success: false, error: 'Diese E-Mail-Adresse ist bereits registriert.' });
        }
        const subRole = ['D2D', 'AFFILIATE', 'TIPPGEBER'].includes(String(role).toUpperCase()) ? String(role).toUpperCase() : 'D2D';
        const maxSubComm = Math.max(Number(parent.stromCommissionEur) || 70, 75);
        const requestedComm = stromCommissionEur ? parseFloat(stromCommissionEur) : 55.0;
        const clampedComm = Math.min(Math.max(isNaN(requestedComm) ? 55.0 : requestedComm, 10.0), maxSubComm);
        const partnerCode = generateUniquePartnerCode(subRole, lastName || fullName);
        const sub = await prisma.partnerUser.create({
            data: {
                partnerCode,
                email: cleanEmail,
                passwordHash: hashPartnerPassword(password || 'Alpha2026!'),
                role: subRole,
                status: 'ACTIVE',
                firstName: firstName || '',
                lastName: lastName || '',
                fullName,
                phone: phone || '',
                stromCommissionEur: clampedComm,
                gasCommissionEur: clampedComm,
                waermeCommissionEur: Math.min(clampedComm + 10, maxSubComm + 10),
                parentPartnerId: parent.id
            }
        });
        await prisma.affiliateLink.upsert({
            where: { code: partnerCode },
            update: { name: `${fullName} (${subRole})` },
            create: { name: `${fullName} (${subRole})`, code: partnerCode }
        }).catch(() => {});

        (async () => {
            try {
                const subject = `Neuer Unterpartner angelegt (${subRole}): ${fullName} [${partnerCode}]`;
                const text = `Ein neuer Unterpartner wurde durch ${parent.fullName} (${parent.partnerCode}) im VP-Portal angelegt:\n\n` +
                    `Unterpartner-Code: ${partnerCode}\n` +
                    `Rolle: ${subRole}\n` +
                    `Name: ${fullName}\n` +
                    `E-Mail: ${cleanEmail}\n` +
                    `Telefon: ${phone || 'Nicht angegeben'}\n` +
                    `Provision (Strom/Gas): ${clampedComm} €\n` +
                    `Oberpartner: ${parent.fullName} (${parent.partnerCode})`;
                const html = getPartnerBackofficeNotificationHtml(
                    'Neuer Unterpartner im VP-Portal angelegt',
                    `Unterpartner-Code: ${partnerCode} • Oberpartner: ${parent.fullName} (${parent.partnerCode})`,
                    [
                        { label: 'Unterpartner-Code', value: partnerCode },
                        { label: 'Rolle', value: subRole },
                        { label: 'Name', value: fullName },
                        { label: 'E-Mail-Adresse', value: cleanEmail },
                        { label: 'Telefonnummer', value: phone || 'Nicht angegeben' },
                        { label: 'Provision (Strom/Gas)', value: `${clampedComm} €` },
                        { label: 'Oberpartner / Agentur', value: `${parent.fullName} (${parent.partnerCode})` }
                    ],
                    'Der Unterpartner wurde direkt durch den Oberpartner im VP-Portal angelegt.'
                );
                await sendBewerbungNotification({ subject, text, html, replyTo: cleanEmail });
            } catch (mailErr) {
                console.error('[PartnerPortal] Subpartner notification error:', mailErr.message);
            }
        })();

        res.status(201).json({ success: true, subPartner: sanitizePartnerUser(sub) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper: Generate § 14 Abs. 2 & 4 UStG compliant PDF 1.4 Commission Credit Note (Provisionsgutschrift)
function buildCreditNotePdfBuffer(rawPayout, rawPartner) {
    const payout = enrichPayoutForPortal(rawPayout);
    const partner = sanitizePartnerUser(rawPartner) || {};
    const createdDateStr = new Date(payout.createdAt || Date.now()).toLocaleDateString('de-DE');
    const paidDateStr = payout.paidAt ? new Date(payout.paidAt).toLocaleDateString('de-DE') : createdDateStr;

    const ops = [];
    // Header Banner (Navy #0a1f44)
    ops.push('0.039 0.122 0.267 rg');
    ops.push('0 755 595 87 re f');
    // Orange Accent Bar (#ff7a00)
    ops.push('1 0.478 0 rg');
    ops.push('0 751 595 4 re f');

    // Header Text (White)
    ops.push('BT /F2 16 Tf 1 1 1 rg 45 806 Td ' + toPdfWinAnsiString('ALPHA ENERGIE GMBH') + ' Tj ET');
    ops.push('BT /F1 9.5 Tf 0.82 0.87 0.95 rg 45 789 Td ' + toPdfWinAnsiString('Provisionsabrechnung im Gutschriftsverfahren gem. § 14 Abs. 2 Satz 2 UStG') + ' Tj ET');
    ops.push('BT /F1 9 Tf 0.82 0.87 0.95 rg 45 772 Td ' + toPdfWinAnsiString(`Gutschrift-Nr.: ${payout.payoutNumber}   |   Ausstellungsdatum: ${createdDateStr}   |   Partner-Code: ${partner.partnerCode || '-'}`) + ' Tj ET');

    // Recipient Block (Left) & Document Metadata (Right)
    ops.push('BT /F1 8 Tf 0.40 0.47 0.56 rg 45 724 Td ' + toPdfWinAnsiString('Alpha Energie GmbH - Alter Hellweg 50 - 44379 Dortmund') + ' Tj ET');
    ops.push('BT /F2 11 Tf 0.039 0.122 0.267 rg 45 706 Td ' + toPdfWinAnsiString(partner.companyName || partner.fullName || 'Vertriebspartner') + ' Tj ET');
    let addrY = 692;
    if (partner.companyName && partner.fullName) {
        ops.push('BT /F1 9.5 Tf 0.15 0.22 0.32 rg 45 ' + addrY + ' Td ' + toPdfWinAnsiString(`z. Hd. ${partner.salutation || ''} ${partner.fullName}`.trim()) + ' Tj ET');
        addrY -= 13;
    }
    ops.push('BT /F1 9.5 Tf 0.15 0.22 0.32 rg 45 ' + addrY + ' Td ' + toPdfWinAnsiString(`${partner.street || ''} ${partner.houseNr || ''}`.trim() || 'Anschrift hinterlegt') + ' Tj ET');
    addrY -= 13;
    ops.push('BT /F1 9.5 Tf 0.15 0.22 0.32 rg 45 ' + addrY + ' Td ' + toPdfWinAnsiString(`${partner.plz || ''} ${partner.city || ''}`.trim() || 'Deutschland') + ' Tj ET');

    // Right Metadata Box
    ops.push('0.969 0.980 0.988 rg 325 655 225 75 re f');
    ops.push('0.85 0.89 0.93 RG 0.8 w 325 655 225 75 re S');
    ops.push('BT /F2 9 Tf 0.039 0.122 0.267 rg 335 714 Td ' + toPdfWinAnsiString(`Beleg-Nr.: ${payout.payoutNumber}`) + ' Tj ET');
    ops.push('BT /F1 8.5 Tf 0.20 0.27 0.36 rg 335 699 Td ' + toPdfWinAnsiString(`Leistungszeitraum: ${payout.periodLabel || 'Laufend'}`) + ' Tj ET');
    ops.push('BT /F1 8.5 Tf 0.20 0.27 0.36 rg 335 685 Td ' + toPdfWinAnsiString(`Steuer-Nr./USt-ID: ${partner.vatId || partner.taxId || 'gem. Stammdaten'}`) + ' Tj ET');
    ops.push('BT /F1 8.5 Tf 0.20 0.27 0.36 rg 335 671 Td ' + toPdfWinAnsiString(`Steuerart: ${partner.isVatLiable ? 'Regelbesteuerung (19% USt.)' : 'Kleinunternehmer (§ 19 UStG)'}`) + ' Tj ET');

    // Title
    ops.push('BT /F2 13 Tf 0.039 0.122 0.267 rg 45 628 Td ' + toPdfWinAnsiString(`PROVISIONSGUTSCHRIFT ${payout.payoutNumber}`) + ' Tj ET');
    ops.push('BT /F1 9 Tf 0.35 0.42 0.52 rg 45 613 Td ' + toPdfWinAnsiString(`Abrechnung vermittelter Energielieferverträge (${payout.ordersCount} Positionen) über Versorgerseite / VP-Portal`) + ' Tj ET');

    // Table Header
    ops.push('0.039 0.122 0.267 rg 45 584 505 20 re f');
    ops.push('BT /F2 8.5 Tf 1 1 1 rg 52 591 Td ' + toPdfWinAnsiString('Pos.') + ' Tj ET');
    ops.push('BT /F2 8.5 Tf 1 1 1 rg 82 591 Td ' + toPdfWinAnsiString('Auftrags-Nr.') + ' Tj ET');
    ops.push('BT /F2 8.5 Tf 1 1 1 rg 175 591 Td ' + toPdfWinAnsiString('Kunde / Verbrauchsstelle') + ' Tj ET');
    ops.push('BT /F2 8.5 Tf 1 1 1 rg 335 591 Td ' + toPdfWinAnsiString('Tarif / Sparte') + ' Tj ET');
    ops.push('BT /F2 8.5 Tf 1 1 1 rg 480 591 Td ' + toPdfWinAnsiString('Netto EUR') + ' Tj ET');

    let rowY = 568;
    const items = (Array.isArray(payout.items) && payout.items.length > 0)
        ? payout.items.slice(0, 12)
        : [{
            pos: 1,
            orderNumber: `Sammelpos. (${payout.ordersCount})`,
            customerName: 'Vermittelte Energieaufträge lt. Nachweis',
            tariffName: payout.periodLabel || 'Ökostrom / Erdgas',
            amountEur: payout.subTotalEur || payout.netAmount
        }];

    items.forEach((it, idx) => {
        if (idx % 2 === 0) {
            ops.push(`0.975 0.982 0.992 rg 45 ${rowY - 4} 505 17 re f`);
        }
        ops.push('BT /F1 8.5 Tf 0.1 0.15 0.22 rg 52 ' + rowY + ' Td ' + toPdfWinAnsiString(String(it.pos || idx + 1)) + ' Tj ET');
        ops.push('BT /F2 8.5 Tf 0.05 0.12 0.26 rg 82 ' + rowY + ' Td ' + toPdfWinAnsiString(String(it.orderNumber || '-').slice(0, 18)) + ' Tj ET');
        ops.push('BT /F1 8.5 Tf 0.1 0.15 0.22 rg 175 ' + rowY + ' Td ' + toPdfWinAnsiString(String(it.customerName || '-').slice(0, 30)) + ' Tj ET');
        ops.push('BT /F1 8.5 Tf 0.25 0.32 0.42 rg 335 ' + rowY + ' Td ' + toPdfWinAnsiString(String(it.tariffName || it.type || '-').slice(0, 26)) + ' Tj ET');
        ops.push('BT /F2 8.5 Tf 0.05 0.12 0.26 rg 480 ' + rowY + ' Td ' + toPdfWinAnsiString(`${Number(it.amountEur || 0).toFixed(2)} EUR`) + ' Tj ET');
        rowY -= 17;
    });

    if (Array.isArray(payout.items) && payout.items.length > 12) {
        ops.push('BT /F1 8 Tf 0.35 0.42 0.52 rg 52 ' + rowY + ' Td ' + toPdfWinAnsiString(`+ ${payout.items.length - 12} weitere abgerechnete Vertragspositionen im Abrechnungszeitraum`) + ' Tj ET');
        rowY -= 16;
    }

    // Divider line
    ops.push(`0.82 0.86 0.90 RG 1 w 45 ${rowY + 6} m 550 ${rowY + 6} l S`);

    // Totals Calculation Box
    const boxTop = Math.min(rowY - 6, 360);
    ops.push(`0.969 0.980 0.988 rg 270 ${boxTop - 115} 280 115 re f`);
    ops.push(`0.85 0.89 0.93 RG 0.8 w 270 ${boxTop - 115} 280 115 re S`);

    let calcY = boxTop - 16;
    const summaryRows = [
        ['Zwischensumme Provisionen (Netto):', `${Number(payout.subTotalEur || payout.netAmount || 0).toFixed(2)} EUR`, false]
    ];
    if (Number(payout.stornoReserveAmount || 0) > 0) {
        summaryRows.push([`./. Stornoreserve-Einbehalt (${payout.stornoReservePct || 10}%):`, `-${Number(payout.stornoReserveAmount).toFixed(2)} EUR`, false]);
    }
    if (Number(payout.stornoReleaseAmount || 0) > 0) {
        summaryRows.push(['+ Freigabe Stornoreserve:', `+${Number(payout.stornoReleaseAmount).toFixed(2)} EUR`, false]);
    }
    if (Number(payout.bonusAmount || 0) > 0) {
        summaryRows.push(['+ Sonderbonus / Staffelprämie:', `+${Number(payout.bonusAmount).toFixed(2)} EUR`, false]);
    }
    summaryRows.push(
        ['Auszahlungsbetrag Netto:', `${Number(payout.netAmount || 0).toFixed(2)} EUR`, true],
        [partner.isVatLiable ? '+ 19% Umsatzsteuer (Regelbesteuerung):' : 'Umsatzsteuer (gem. § 19 UStG steuerfrei):', `${Number(payout.vatAmount || 0).toFixed(2)} EUR`, false],
        ['AUSZAHLUNGSBETRAG (BRUTTO):', `${Number(payout.grossAmount || 0).toFixed(2)} EUR`, true]
    );

    summaryRows.forEach(([label, val, bold]) => {
        const font = bold ? '/F2 9.5 Tf' : '/F1 8.5 Tf';
        ops.push(`BT ${font} 0.05 0.12 0.26 rg 280 ${calcY} Td ` + toPdfWinAnsiString(label) + ' Tj ET');
        ops.push(`BT ${font} 0.05 0.12 0.26 rg 475 ${calcY} Td ` + toPdfWinAnsiString(val) + ' Tj ET');
        calcY -= 15;
    });

    // Left Bank & Status Info
    let bankY = boxTop - 16;
    ops.push(`BT /F2 9.5 Tf 0.039 0.122 0.267 rg 45 ${bankY} Td ` + toPdfWinAnsiString('SEPA-Auszahlungsinformationen:') + ' Tj ET');
    bankY -= 16;
    ops.push(`BT /F1 8.5 Tf 0.20 0.27 0.36 rg 45 ${bankY} Td ` + toPdfWinAnsiString(`IBAN: ${payout.iban || partner.iban || '-'}`) + ' Tj ET');
    bankY -= 14;
    ops.push(`BT /F1 8.5 Tf 0.20 0.27 0.36 rg 45 ${bankY} Td ` + toPdfWinAnsiString(`Bank / BIC: ${payout.bankName || partner.bankName || '-'} (${payout.bic || partner.bic || '-'})`) + ' Tj ET');
    bankY -= 14;
    ops.push(`BT /F2 8.5 Tf 0.05 0.45 0.25 rg 45 ${bankY} Td ` + toPdfWinAnsiString(`Abrechnungsstatus: ${payout.status === 'PAID' ? `AUSGEZAHLT am ${paidDateStr}` : 'FREIGEGEBEN ZUR ÜBERWEISUNG'}`) + ' Tj ET');
    if (payout.remark) {
        bankY -= 15;
        ops.push(`BT /F1 8 Tf 0.35 0.42 0.52 rg 45 ${bankY} Td ` + toPdfWinAnsiString(`Hinweis: ${String(payout.remark).slice(0, 42)}`) + ' Tj ET');
    }

    // Legal Footer
    ops.push('0.82 0.86 0.90 RG 0.8 w 45 120 m 550 120 l S');
    ops.push('BT /F1 8 Tf 0.35 0.42 0.52 rg 45 104 Td ' + toPdfWinAnsiString('Hinweis gem. § 14 Abs. 2 UStG: Dieses Dokument gilt als Abrechnung im Gutschriftsverfahren. Sofern keine Umsatzsteuer ausgewiesen ist,') + ' Tj ET');
    ops.push('BT /F1 8 Tf 0.35 0.42 0.52 rg 45 92 Td ' + toPdfWinAnsiString('erfolgt die Abrechnung steuerfrei gem. § 19 UStG (Kleinunternehmerregelung) bzw. § 4 Nr. 11 UStG.') + ' Tj ET');
    ops.push('BT /F2 8.5 Tf 0.15 0.22 0.32 rg 45 75 Td ' + toPdfWinAnsiString('Alpha Energie GmbH  |  Alter Hellweg 50, 44379 Dortmund  |  Tel.: 0231 39989390  |  info@alpha-energie.de') + ' Tj ET');

    const streamContent = ops.join('\n');
    const objects = [
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n',
        `4 0 obj\n<< /Length ${Buffer.byteLength(streamContent, 'utf8')} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
        '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
        '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n'
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    for (const obj of objects) {
        offsets.push(Buffer.byteLength(pdf, 'utf8'));
        pdf += obj;
    }
    const xrefOffset = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
        pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf, 'utf8');
}

// 5.10 PDF Commission Credit Note (Gutschrift PDF)
app.get('/api/partner/payouts/:id/pdf', async (req, res) => {
    try {
        const payoutId = parseInt(req.params.id, 10);
        const payout = await prisma.commissionPayout.findUnique({ where: { id: payoutId } });
        if (!payout) {
            return res.status(404).send('Gutschrift nicht gefunden');
        }
        const partner = await prisma.partnerUser.findUnique({ where: { id: payout.partnerId } });
        const pdfBuffer = buildCreditNotePdfBuffer(payout, partner);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Gutschrift-${payout.payoutNumber}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).send('PDF Fehler: ' + error.message);
    }
});

// 5.11 Admin Endpoints for EnergyOrders, PartnerUsers, PartnerLeads & CommissionPayouts
app.get('/api/admin/portal-overview', authenticateAdmin, async (req, res) => {
    try {
        await ensureDemoPartnersSeeded();
        const [orders, partners, leads, payouts, clicksCount] = await Promise.all([
            prisma.energyOrder.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.partnerUser.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.partnerLead.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.commissionPayout.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.affiliateClick.count()
        ]);

        const pendingLeadsSum = leads
            .filter(l => l.status === 'QUALIFIED' || l.status === 'CONVERTED')
            .reduce((s, l) => s + Number(l.commissionAmount || 0), 0);
        const paidLeadsSum = leads
            .filter(l => l.status === 'PAID')
            .reduce((s, l) => s + Number(l.commissionAmount || 0), 0);
        const totalCommissionPending = orders
            .filter(o => o.commissionStatus === 'PENDING' && o.status !== 'CANCELLED')
            .reduce((s, o) => s + Number(o.commissionAmount || 0) + Number(o.overrideAmount || 0), 0);
        const totalCommissionApproved = orders
            .filter(o => o.commissionStatus === 'APPROVED' && o.status !== 'CANCELLED')
            .reduce((s, o) => s + Number(o.commissionAmount || 0) + Number(o.overrideAmount || 0), 0) + pendingLeadsSum;
        const totalCommissionPaid = orders
            .filter(o => o.commissionStatus === 'PAID')
            .reduce((s, o) => s + Number(o.commissionAmount || 0) + Number(o.overrideAmount || 0), 0) + paidLeadsSum;

        const enrichedOrders = orders.map(o => enrichOrderForPortal(o, true));
        const enrichedPartners = partners.map(sanitizePartnerUser);
        const enrichedPayouts = payouts.map(enrichPayoutForPortal);

        res.json({
            success: true,
            kpis: {
                ordersCount: orders.length,
                clarificationCount: orders.filter(o => o.status === 'CLARIFICATION').length,
                partnersCount: partners.filter(p => p.status === 'ACTIVE').length,
                leadsCount: leads.length,
                clicksCount,
                payoutsCount: payouts.length,
                totalCommissionPending: Number(totalCommissionPending.toFixed(2)),
                totalCommissionApproved: Number(totalCommissionApproved.toFixed(2)),
                totalCommissionPaid: Number(totalCommissionPaid.toFixed(2))
            },
            orders: enrichedOrders,
            partners: enrichedPartners,
            leads,
            payouts: enrichedPayouts
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.patch('/api/admin/energy-orders/:id', authenticateAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existing = await prisma.energyOrder.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Auftrag nicht gefunden.' });
        }

        const {
            status,
            commissionStatus,
            commissionAmount,
            overrideAmount,
            partnerCode,
            partnerId,
            statusMessage,
            supplyStartDate,
            internalAdminNote,
            notes
        } = req.body || {};

        const data = {};
        if (status !== undefined) data.status = status;
        if (commissionStatus !== undefined) data.commissionStatus = commissionStatus;
        if (commissionAmount !== undefined) data.commissionAmount = parseFloat(commissionAmount) || 0;
        if (overrideAmount !== undefined) data.overrideAmount = parseFloat(overrideAmount) || 0;

        if (partnerCode !== undefined) {
            const cleanCode = String(partnerCode || '').trim().toUpperCase();
            data.partnerCode = cleanCode || null;
            if (cleanCode) {
                const matchedPartner = await prisma.partnerUser.findFirst({
                    where: { partnerCode: cleanCode }
                });
                if (matchedPartner) {
                    data.partnerId = matchedPartner.id;
                }
            } else {
                data.partnerId = null;
            }
        } else if (partnerId !== undefined) {
            data.partnerId = partnerId ? parseInt(partnerId, 10) : null;
        }

        if (statusMessage !== undefined || supplyStartDate !== undefined || internalAdminNote !== undefined) {
            data.notes = packJsonMeta(existing.notes, {
                statusMessage: statusMessage !== undefined ? String(statusMessage).trim() : undefined,
                supplyStartDate: supplyStartDate !== undefined ? String(supplyStartDate).trim() : undefined,
                internalAdminNote: internalAdminNote !== undefined ? String(internalAdminNote).trim() : undefined,
                statusUpdatedAt: new Date().toISOString()
            });
        } else if (notes !== undefined) {
            data.notes = packJsonMeta(existing.notes, {
                statusMessage: String(notes).trim(),
                statusUpdatedAt: new Date().toISOString()
            });
        }

        const updated = await prisma.energyOrder.update({ where: { id }, data });
        res.json({ success: true, data: enrichOrderForPortal(updated, true) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/admin/partner-users', authenticateAdmin, async (req, res) => {
    try {
        const body = req.body || {};
        const email = String(body.email || '').trim().toLowerCase();
        const fullName = String(body.fullName || `${body.firstName || ''} ${body.lastName || ''}`).trim();
        const role = ['D2D', 'AFFILIATE', 'TIPPGEBER', 'AGENCY'].includes(String(body.role || '').toUpperCase())
            ? String(body.role).toUpperCase()
            : 'D2D';
        if (!email || !fullName) {
            return res.status(400).json({ success: false, error: 'Name und E-Mail sind erforderlich.' });
        }

        const existsEmail = await prisma.partnerUser.findUnique({ where: { email } });
        if (existsEmail) {
            return res.status(409).json({ success: false, error: 'Für diese E-Mail-Adresse existiert bereits ein Vertriebspartner.' });
        }

        const partnerCode = body.partnerCode
            ? String(body.partnerCode).trim().toUpperCase()
            : generateUniquePartnerCode(role, body.lastName || fullName);
        const rawPassword = body.password || 'Alpha2026!';

        let ibanClean = body.iban ? String(body.iban).replace(/\s+/g, '').toUpperCase() : null;
        let bic = body.bic || null;
        let bankName = body.bankName || null;
        if (ibanClean) {
            const check = firstconService.validateIbanMod97(ibanClean);
            if (!check.valid) {
                return res.status(400).json({ success: false, error: check.reason || 'Ungültige IBAN (Mod-97 Prüffehler).' });
            }
            ibanClean = check.clean;
            bic = bic || check.bic;
            bankName = bankName || check.bankName;
        }

        let parentPartnerId = body.parentPartnerId ? parseInt(body.parentPartnerId, 10) : null;
        if (!parentPartnerId && body.parentPartnerCode) {
            const parent = await prisma.partnerUser.findFirst({
                where: { partnerCode: String(body.parentPartnerCode).trim().toUpperCase() }
            });
            if (parent) parentPartnerId = parent.id;
        }

        const metaNotes = packJsonMeta(null, {
            vatId: body.vatId || '',
            ihkNumber: body.ihkNumber || '',
            gewerbeamtCity: body.gewerbeamtCity || '',
            stornoReservePct: body.stornoReservePct !== undefined ? parseFloat(body.stornoReservePct) : 10,
            liabilityMonths: body.liabilityMonths !== undefined ? parseInt(body.liabilityMonths, 10) : 12,
            payoutCycle: body.payoutCycle || 'MONTHLY',
            ladestromCommissionEur: body.ladestromCommissionEur !== undefined ? parseFloat(body.ladestromCommissionEur) : (parseFloat(body.stromCommissionEur) || 60),
            adminRemarks: body.adminRemarks || ''
        });

        const created = await prisma.partnerUser.create({
            data: {
                partnerCode,
                email,
                passwordHash: hashPartnerPassword(rawPassword),
                role,
                status: body.status || 'ACTIVE',
                commissionTier: body.commissionTier || (role === 'AGENCY' ? 'ELITE' : 'PRO'),
                salutation: body.salutation || 'Herr',
                firstName: body.firstName || fullName.split(' ')[0] || '',
                lastName: body.lastName || fullName.split(' ').slice(1).join(' ') || '',
                fullName,
                birthDate: body.birthDate || null,
                companyName: body.companyName || null,
                legalForm: body.legalForm || null,
                website: body.website || null,
                phone: body.phone || '',
                street: body.street || null,
                houseNr: body.houseNr || null,
                plz: body.plz || null,
                city: body.city || null,
                country: body.country || 'Deutschland',
                iban: ibanClean,
                bic,
                bankName,
                isVatLiable: body.isVatLiable === true || body.isVatLiable === 'true',
                taxId: body.taxId || null,
                taxOffice: body.taxOffice || null,
                stromCommissionEur: parseFloat(body.stromCommissionEur) || 60.0,
                gasCommissionEur: parseFloat(body.gasCommissionEur) || 60.0,
                waermeCommissionEur: parseFloat(body.waermeCommissionEur) || 70.0,
                tippgeberCommissionEur: parseFloat(body.tippgeberCommissionEur) || 35.0,
                b2bCommissionPct: parseFloat(body.b2bCommissionPct) || 15.0,
                overrideCommissionEur: parseFloat(body.overrideCommissionEur) || (role === 'AGENCY' ? 15.0 : 0.0),
                parentPartnerId,
                notes: metaNotes
            }
        });

        await prisma.affiliateLink.upsert({
            where: { code: partnerCode },
            update: { name: `${fullName} (${role})` },
            create: { name: `${fullName} (${role})`, code: partnerCode }
        }).catch(() => {});

        res.status(201).json({
            success: true,
            partner: sanitizePartnerUser(created),
            generatedPassword: rawPassword
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.patch('/api/admin/partner-users/:id', authenticateAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existing = await prisma.partnerUser.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Vertriebspartner nicht gefunden.' });
        }
        const body = req.body || {};
        const data = {};
        const stringFields = [
            'role', 'status', 'commissionTier', 'salutation', 'firstName', 'lastName',
            'fullName', 'birthDate', 'companyName', 'legalForm', 'website', 'phone',
            'street', 'houseNr', 'plz', 'city', 'country', 'taxId', 'taxOffice', 'iban', 'bic', 'bankName'
        ];
        stringFields.forEach(f => {
            if (body[f] !== undefined) data[f] = body[f];
        });
        if (body.isVatLiable !== undefined) {
            data.isVatLiable = body.isVatLiable === true || body.isVatLiable === 'true';
        }
        if (body.parentPartnerId !== undefined) {
            data.parentPartnerId = body.parentPartnerId ? parseInt(body.parentPartnerId, 10) : null;
        }
        ['stromCommissionEur', 'gasCommissionEur', 'waermeCommissionEur', 'tippgeberCommissionEur', 'b2bCommissionPct', 'overrideCommissionEur'].forEach(f => {
            if (body[f] !== undefined) data[f] = parseFloat(body[f]) || 0;
        });
        if (data.iban) {
            const check = firstconService.validateIbanMod97(data.iban);
            if (!check.valid) {
                return res.status(400).json({ success: false, error: check.reason || 'Ungültige IBAN.' });
            }
            data.iban = check.clean;
            data.bic = data.bic || check.bic;
            data.bankName = data.bankName || check.bankName;
        }
        if (
            body.vatId !== undefined ||
            body.ihkNumber !== undefined ||
            body.gewerbeamtCity !== undefined ||
            body.stornoReservePct !== undefined ||
            body.liabilityMonths !== undefined ||
            body.payoutCycle !== undefined ||
            body.ladestromCommissionEur !== undefined ||
            body.adminRemarks !== undefined
        ) {
            data.notes = packJsonMeta(existing.notes, {
                vatId: body.vatId,
                ihkNumber: body.ihkNumber,
                gewerbeamtCity: body.gewerbeamtCity,
                stornoReservePct: body.stornoReservePct !== undefined ? parseFloat(body.stornoReservePct) : undefined,
                liabilityMonths: body.liabilityMonths !== undefined ? parseInt(body.liabilityMonths, 10) : undefined,
                payoutCycle: body.payoutCycle,
                ladestromCommissionEur: body.ladestromCommissionEur !== undefined ? parseFloat(body.ladestromCommissionEur) : undefined,
                adminRemarks: body.adminRemarks
            });
        }
        if (body.password && String(body.password).length >= 6) {
            data.passwordHash = hashPartnerPassword(body.password);
        }
        const updated = await prisma.partnerUser.update({ where: { id }, data });
        res.json({ success: true, partner: sanitizePartnerUser(updated) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/admin/partner-users/:id', authenticateAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await prisma.partnerUser.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 1-Click Activate PartnerUser from PartnerApplication in Admin
app.post('/api/admin/partner-applications/:id/activate-portal', authenticateAdmin, async (req, res) => {
    try {
        const appId = parseInt(req.params.id, 10);
        const application = await prisma.partnerApplication.findUnique({ where: { id: appId } });
        if (!application) {
            return res.status(404).json({ success: false, error: 'Bewerbung nicht gefunden.' });
        }

        const role = ['D2D', 'AFFILIATE', 'TIPPGEBER', 'AGENCY'].includes(String(req.body.role || '').toUpperCase())
            ? String(req.body.role).toUpperCase()
            : (String(application.experience || '').toLowerCase().includes('agentur') ? 'AGENCY' : 'D2D');

        const email = String(application.email || '').trim().toLowerCase();
        const existing = await prisma.partnerUser.findUnique({ where: { email } });
        if (existing) {
            return res.json({
                success: true,
                alreadyExisted: true,
                partner: sanitizePartnerUser(existing),
                generatedPassword: '(bereits vergeben)'
            });
        }

        const generatedPassword = req.body.password || 'Alpha2026!';
        const partnerCode = generateUniquePartnerCode(role, application.lastName || application.fullName);

        const created = await prisma.partnerUser.create({
            data: {
                partnerCode,
                email,
                passwordHash: hashPartnerPassword(generatedPassword),
                role,
                status: 'ACTIVE',
                salutation: application.salutation || 'Herr',
                firstName: application.firstName || application.fullName.split(' ')[0] || '',
                lastName: application.lastName || application.fullName.split(' ').slice(1).join(' ') || '',
                fullName: application.fullName,
                companyName: application.companyName,
                legalForm: application.legalForm,
                phone: application.phone,
                birthDate: application.birthDate,
                street: application.street,
                houseNr: application.houseNr,
                plz: application.plz,
                city: application.city,
                country: application.country || 'Deutschland',
                isVatLiable: application.isVatLiable,
                taxId: application.taxId,
                taxOffice: application.taxOffice,
                iban: application.iban,
                bic: application.bic,
                bankName: application.bankName,
                website: application.website,
                stromCommissionEur: role === 'AGENCY' ? 75 : (role === 'D2D' ? 65 : 55),
                gasCommissionEur: role === 'AGENCY' ? 75 : (role === 'D2D' ? 65 : 55),
                waermeCommissionEur: role === 'AGENCY' ? 85 : 70,
                overrideCommissionEur: role === 'AGENCY' ? 15 : 0,
                applicationId: application.id
            }
        });

        await prisma.partnerApplication.update({
            where: { id: application.id },
            data: { masterDataStatus: 'APPROVED' }
        }).catch(() => {});

        await prisma.affiliateLink.upsert({
            where: { code: partnerCode },
            update: { name: `${application.fullName} (${role})` },
            create: { name: `${application.fullName} (${role})`, code: partnerCode }
        }).catch(() => {});

        res.json({
            success: true,
            partner: sanitizePartnerUser(created),
            generatedPassword
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.patch('/api/admin/partner-leads/:id', authenticateAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { status, commissionAmount, convertedOrderNo, notes } = req.body || {};
        const data = {};
        if (status !== undefined) data.status = status;
        if (commissionAmount !== undefined) data.commissionAmount = parseFloat(commissionAmount) || 0;
        if (convertedOrderNo !== undefined) data.convertedOrderNo = convertedOrderNo;
        if (notes !== undefined) data.notes = notes;
        const updated = await prisma.partnerLead.update({ where: { id }, data });
        res.json({ success: true, lead: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate Commission Payout / Credit Note (Gutschrift) for a Partner (Abrechnungstool)
app.post('/api/admin/payouts/create', authenticateAdmin, async (req, res) => {
    try {
        const {
            partnerId,
            periodLabel,
            markPaid = true,
            orderIds,
            stornoReservePct,
            stornoReleaseAmount = 0,
            bonusAmount = 0,
            remark = ''
        } = req.body || {};

        const rawPartner = await prisma.partnerUser.findUnique({ where: { id: parseInt(partnerId, 10) } });
        if (!rawPartner) {
            return res.status(404).json({ success: false, error: 'Partner nicht gefunden.' });
        }
        const partner = sanitizePartnerUser(rawPartner);

        const lastPayout = await prisma.commissionPayout.findFirst({
            where: { partnerId: partner.id },
            orderBy: { createdAt: 'desc' }
        });

        const orderWhere = {
            OR: [
                { partnerId: partner.id },
                { partnerCode: partner.partnerCode }
            ],
            commissionStatus: { in: ['PENDING', 'APPROVED'] },
            status: { not: 'CANCELLED' }
        };
        if (Array.isArray(orderIds) && orderIds.length > 0) {
            orderWhere.id = { in: orderIds.map(id => parseInt(id, 10)).filter(Boolean) };
        }

        const payableOrders = await prisma.energyOrder.findMany({
            where: orderWhere,
            orderBy: { createdAt: 'asc' }
        });

        const overrideWhere = {
            overridePartnerId: partner.id,
            overrideAmount: { gt: 0 },
            status: { not: 'CANCELLED' },
            commissionStatus: { not: 'CANCELLED' }
        };
        if (lastPayout && lastPayout.createdAt) {
            overrideWhere.createdAt = { gt: lastPayout.createdAt };
        }
        const payableOverrideOrders = await prisma.energyOrder.findMany({
            where: overrideWhere
        });

        const payableLeads = await prisma.partnerLead.findMany({
            where: {
                partnerId: partner.id,
                status: { in: ['QUALIFIED', 'CONVERTED'] },
                commissionAmount: { gt: 0 }
            }
        });

        const items = [];
        let posCounter = 1;
        payableOrders.forEach(o => {
            items.push({
                pos: posCounter++,
                orderId: o.id,
                orderNumber: o.orderNumber,
                customerName: `${o.firstName || ''} ${o.lastName || ''} (${o.city || o.plz || '-'})`.trim(),
                tariffName: o.tariffName || o.branch || 'Energietarif',
                branch: o.branch || 'strom',
                type: 'Abschlussprovision',
                amountEur: Number(o.commissionAmount || 0)
            });
        });
        payableOverrideOrders.forEach(o => {
            items.push({
                pos: posCounter++,
                orderId: o.id,
                orderNumber: o.orderNumber,
                customerName: `Downline (${o.partnerCode || 'Sub-VP'})`,
                tariffName: `Superprovision ${o.tariffName || ''}`.trim(),
                branch: o.branch || 'strom',
                type: 'Override',
                amountEur: Number(o.overrideAmount || 0)
            });
        });
        payableLeads.forEach(l => {
            items.push({
                pos: posCounter++,
                leadId: l.id,
                orderNumber: l.convertedOrderNo || `LEAD-${l.id}`,
                customerName: l.customerName,
                tariffName: `Tippgeber-Prämie (${l.branch || 'strom'})`,
                branch: l.branch || 'strom',
                type: 'Tippgeber',
                amountEur: Number(l.commissionAmount || 0)
            });
        });

        const directNet = payableOrders.reduce((s, o) => s + Number(o.commissionAmount || 0), 0);
        const overrideNet = payableOverrideOrders.reduce((s, o) => s + Number(o.overrideAmount || 0), 0);
        const leadsNet = payableLeads.reduce((s, l) => s + Number(l.commissionAmount || 0), 0);

        let subTotalEur = Number((directNet + overrideNet + leadsNet).toFixed(2));
        let ordersCount = items.length;

        if (req.body.customNetAmount !== undefined && parseFloat(req.body.customNetAmount) > 0) {
            subTotalEur = parseFloat(req.body.customNetAmount);
            if (ordersCount === 0) {
                ordersCount = parseInt(req.body.ordersCount, 10) || 1;
                items.push({
                    pos: 1,
                    orderNumber: 'MANUELL',
                    customerName: 'Pauschale / Manuelle Provisionsabrechnung',
                    tariffName: periodLabel || 'Sonderabrechnung',
                    type: 'Provision',
                    amountEur: subTotalEur
                });
            }
        }

        const effectiveReservePct = stornoReservePct !== undefined
            ? Math.max(0, Math.min(50, parseFloat(stornoReservePct) || 0))
            : Number(partner.stornoReservePct ?? 0);
        const stornoReserveAmount = Number(((subTotalEur * effectiveReservePct) / 100).toFixed(2));
        const cleanRelease = Number(Math.max(0, parseFloat(stornoReleaseAmount) || 0).toFixed(2));
        const cleanBonus = Number(Math.max(0, parseFloat(bonusAmount) || 0).toFixed(2));

        const netAmount = Number((subTotalEur - stornoReserveAmount + cleanRelease + cleanBonus).toFixed(2));

        if (netAmount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Keine offenen Provisionen bzw. positiver Netto-Auszahlungsbetrag für diesen Partner vorhanden.'
            });
        }

        const vatAmount = partner.isVatLiable ? Number((netAmount * 0.19).toFixed(2)) : 0;
        const grossAmount = Number((netAmount + vatAmount).toFixed(2));
        const payoutNumber = 'GS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

        const payoutNotes = JSON.stringify({
            subTotalEur,
            stornoReservePct: effectiveReservePct,
            stornoReserveAmount,
            stornoReleaseAmount: cleanRelease,
            bonusAmount: cleanBonus,
            remark: String(remark || '').trim(),
            items
        });

        const payout = await prisma.commissionPayout.create({
            data: {
                payoutNumber,
                partnerId: partner.id,
                periodLabel: periodLabel || `Abrechnung ${new Date().toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' })}`,
                ordersCount,
                netAmount,
                vatAmount,
                grossAmount,
                status: markPaid ? 'PAID' : 'APPROVED',
                iban: partner.iban,
                bic: partner.bic,
                bankName: partner.bankName,
                paidAt: markPaid ? new Date() : null,
                notes: payoutNotes
            }
        });

        for (const o of payableOrders) {
            const existingMeta = parseJsonMeta(o.notes);
            await prisma.energyOrder.update({
                where: { id: o.id },
                data: {
                    commissionStatus: markPaid ? 'PAID' : 'APPROVED',
                    status: (markPaid && o.status === 'CONFIRMED') ? 'PAID' : o.status,
                    notes: packJsonMeta(o.notes, {
                        payoutNumber,
                        statusMessage: existingMeta.statusMessage || `Provision mit Gutschrift ${payoutNumber} abgerechnet.`,
                        statusUpdatedAt: new Date().toISOString()
                    })
                }
            }).catch(() => {});
        }

        if (payableLeads.length > 0 && markPaid) {
            await prisma.partnerLead.updateMany({
                where: { id: { in: payableLeads.map(l => l.id) } },
                data: { status: 'PAID' }
            });
        }

        res.status(201).json({ success: true, payout: enrichPayoutForPortal(payout) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.patch('/api/admin/payouts/:id', authenticateAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { status } = req.body || {};
        const updated = await prisma.commissionPayout.update({
            where: { id },
            data: {
                status,
                paidAt: status === 'PAID' ? new Date() : undefined
            }
        });
        res.json({ success: true, payout: enrichPayoutForPortal(updated) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/admin/impersonate-partner', authenticateAdmin, async (req, res) => {
    try {
        await ensureDemoPartnersSeeded();
        const { partnerCode, partnerId } = req.body || {};
        let partner = null;
        if (partnerId) {
            partner = await prisma.partnerUser.findUnique({ where: { id: parseInt(partnerId, 10) } });
        } else if (partnerCode) {
            partner = await prisma.partnerUser.findUnique({ where: { partnerCode: String(partnerCode).trim() } });
        } else {
            partner = await prisma.partnerUser.findFirst({ orderBy: { id: 'asc' } });
        }
        if (!partner) {
            return res.status(404).json({ success: false, error: 'Partner nicht gefunden.' });
        }
        const token = jwt.sign(
            { partnerId: partner.id, partnerCode: partner.partnerCode, role: partner.role },
            PARTNER_JWT_SECRET,
            { expiresIn: '30d' }
        );
        res.json({
            success: true,
            token,
            partner: sanitizePartnerUser(partner)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Direct access routes for Stammdatenblatt via Werbelink
app.get('/stammdate', (req, res) => {
    res.sendFile(path.join(__dirname, 'stammdaten.html'));
});

app.get('/stammdaten', (req, res) => {
    res.sendFile(path.join(__dirname, 'stammdaten.html'));
});

// Serve Admin Pages explicitly to avoid conflicts
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// Global crash protection
process.on('uncaughtException', (err) => {
    console.error('Server Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Server Unhandled Rejection:', reason);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
