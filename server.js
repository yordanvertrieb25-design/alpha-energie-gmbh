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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        const isTargetPage = ['/index', '/vertriebspartner', '/agenturen', '/impressum'].includes(cleanPath);
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

// Dedicated route for /versorger (must be before express.static with extensions: ['html'])
app.get(['/versorger', '/versorger.html'], (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, 'versorger.html'));
});

const staticNoCacheHeaders = (res, filePath) => {
    if (/\.(html|css|js)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
};

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, 'public'), { setHeaders: staticNoCacheHeaders })); // For future public assets if needed
app.use(express.static(__dirname, { extensions: ['html'], setHeaders: staticNoCacheHeaders })); // Serving the HTML files from the root

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

// Dedicated route for ok-power Gütesiegel to ensure 100% availability and image/png content-type
app.get('/ok-power-siegel.png', (req, res) => {
    const pubFile = path.join(__dirname, 'public', 'ok-power-siegel.png');
    if (fs.existsSync(pubFile)) {
        res.setHeader('Content-Type', 'image/png');
        return res.sendFile(pubFile);
    }
    const rootFile = path.join(__dirname, 'ok-power-siegel.png');
    if (fs.existsSync(rootFile)) {
        res.setHeader('Content-Type', 'image/png');
        return res.sendFile(rootFile);
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
        res.status(201).json({ success: true, data: newContact });
    } catch (error) {
        console.error("Error saving contact:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// --- VERSORGER TARIFRECHNER & ORDER ROUTES (FIRSTCON API V2 CONNECTED) ---

// 1.0 Firstcon Live Connection Status & Grid/Street Lookup
app.get('/api/firstcon/status', async (req, res) => {
    try {
        const token = req.query.token || process.env.FIRSTCON_ORDERFLOW_TOKEN || firstconService.DEFAULT_FIRSTCON_TOKEN;
        const auth = await firstconService.authenticateOrderflow(token);
        res.json({
            success: true,
            connected: true,
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
            error: error.message
        });
    }
});

app.get('/api/firstcon/grid', async (req, res) => {
    try {
        const plz = req.query.plz || req.query.zip || '44379';
        const branch = req.query.branch || 'strom';
        const token = req.query.token || process.env.FIRSTCON_ORDERFLOW_TOKEN;
        const gridInfo = await firstconService.findEnergyGrid(plz, branch, token);
        if (!gridInfo) {
            return res.json({ success: false, found: false, plz });
        }
        let streets = [];
        if (req.query.streets === '1' || req.query.streets === 'true') {
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

// 1.1 Calculate Tariffs dynamically (Firstcon Live API v2 + Fallback)
app.post('/api/tarife/calculate', async (req, res) => {
    try {
        // If caller requests B2B / RLM calculation via /api/tarife/calculate, delegate to live RLM portal service
        if (req.body && (req.body.mode === 'rlm' || req.body.isB2B === true || req.body.customerType === 'COMMERCIAL' || req.body.measurement === 'RLM')) {
            const rlmResult = await calculateRlmTariffs(req.body);
            return res.json(rlmResult);
        }

        const { plz, consumption, consumptionHt, consumptionNt, meterType, currentAbschlag, branch = 'strom', orderflowToken, useFallbackOnly } = req.body;
        const normalizedBranch = branch === 'gas' ? 'gas' : (branch === 'waerme' ? 'waerme' : 'strom');
        const isGas = normalizedBranch === 'gas';
        const isWaerme = normalizedBranch === 'waerme';
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

        // Attempt live Firstcon API v2 calculation first
        if (!useFallbackOnly && /^\d{5}$/.test(cleanPlz)) {
            try {
                const liveFirstcon = await firstconService.calculateLiveTariffs({
                    plz: cleanPlz,
                    consumption: kwh,
                    consumptionHt: resolvedHt,
                    consumptionNt: resolvedNt,
                    meterType: resolvedMeterType,
                    currentAbschlag: abschlagOld,
                    branch: normalizedBranch,
                    token: orderflowToken
                });
                if (liveFirstcon && Array.isArray(liveFirstcon.tariffs) && liveFirstcon.tariffs.length > 0) {
                    return res.json({
                        success: true,
                        ...liveFirstcon,
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
                workingPriceCt: 33.66,
                basePriceEurMonth: 29.40,
                basePriceEur: 29.40,
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
                workingPriceCt: 34.85,
                basePriceEurMonth: 29.40,
                basePriceEur: 29.40,
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
                workingPriceCt: 36.04,
                basePriceEurMonth: 29.40,
                basePriceEur: 29.40,
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

        const gasTariffs = [
            {
                id: 'alpha-basic',
                firstconTariffId: 226,
                firstconName: 'Alpha Basic 24',
                name: 'ALPHA BASIC 24 GAS',
                badge: 'Fair & Preisstabil',
                isBestseller: false,
                workingPriceCt: 16.52,
                basePriceEurMonth: 28.25,
                basePriceEur: 28.25,
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
                workingPriceCt: 17.71,
                basePriceEurMonth: 28.25,
                basePriceEur: 28.25,
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
                workingPriceCt: 18.90,
                basePriceEurMonth: 28.25,
                basePriceEur: 28.25,
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

        const tariffs = isGas ? gasTariffs : (isWaerme ? waermeTariffs : stromTariffs);
        const refGrundversorgerYearly = isGas
            ? (kwh * 0.215) + (29.50 * 12)
            : (kwh * 0.415) + (29.90 * 12);
        const yearlyOld = Math.max(abschlagOld * 12, refGrundversorgerYearly);

        const calculatedTariffs = tariffs.map(t => {
            const rawYearly = (kwh * (t.workingPriceCt / 100)) + (t.basePriceEurMonth * 12);
            const monthlyPayment = Math.round(rawYearly / 12);
            const savings = Math.max(40, Math.round(yearlyOld - rawYearly));

            return {
                ...t,
                branch: normalizedBranch,
                meterType: resolvedMeterType,
                meterTypeId: resolvedMeterTypeId,
                consumptionHt: resolvedHt,
                consumptionNt: resolvedNt,
                monthlyPayment,
                grossYearlyEur: Math.round(rawYearly * 100) / 100,
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
                const adminEmail = process.env.NOTIFICATION_EMAIL || 'info@alpha-energie.de';
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
            iban
        } = req.body;

        if (!tariffName || !email || !firstName || !lastName || !meterNumber || !iban) {
            return res.status(400).json({
                success: false,
                error: 'Bitte füllen Sie alle erforderlichen Pflichtfelder (Name, E-Mail, Zählernummer, IBAN) aus.'
            });
        }

        const orderNumber = 'AE-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);

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
                iban,
                status: 'RECEIVED'
            }
        });

        // Forward order to Firstcon Orderflow API v2 (Validation & Contract submission)
        let firstconResult = null;
        try {
            firstconResult = await firstconService.submitOrderToFirstcon({
                ...req.body,
                orderNumber
            });
        } catch (fcOrderErr) {
            console.warn("[Firstcon Orderflow] Order forwarding warning:", fcOrderErr.message);
            firstconResult = {
                firstconConnected: false,
                validated: false,
                error: fcOrderErr.message
            };
        }

        // Send confirmation email asynchronously if transporter is configured
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

        res.status(201).json({
            success: true,
            orderNumber,
            firstcon: firstconResult,
            message: 'Ihr Auftrag wurde erfolgreich erfasst! Wir kümmern uns um den reibungslosen Wechsel.'
        });
    } catch (error) {
        console.error("Order submission error:", error);
        res.status(500).json({ success: false, error: 'Fehler beim Übermitteln des Auftrags: ' + error.message });
    }
});

// 1.3 Submit Meter Reading (Zählerstand melden)
app.post('/api/zaehlerstand/submit', async (req, res) => {
    try {
        const { meterNumber, reading, readingDate, customerName, email, notes } = req.body;
        if (!meterNumber || reading === undefined || !customerName || !email) {
            return res.status(400).json({
                success: false,
                error: 'Bitte füllen Sie Zählernummer, Zählerstand, Name und E-Mail aus.'
            });
        }

        const newReading = await prisma.meterReading.create({
            data: {
                meterNumber,
                reading: parseFloat(reading),
                readingDate: readingDate || new Date().toISOString().split('T')[0],
                customerName,
                email,
                notes: notes || null
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

                const backofficeEmail = process.env.NOTIFICATION_EMAIL || 'info@alpha-energie.de';
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
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

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
    const rawFrom = process.env.SMTP_FROM || 'noreply@alpha-energie.de';
    if (rawFrom.includes('<') && rawFrom.includes('>')) {
        return rawFrom;
    }
    return `"Alpha Energie GmbH" <${rawFrom}>`;
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
                            <strong style="color: #0f172a; font-size: 0.95rem;">Kennenlerngespräch buchen</strong>
                            <div style="color: #475569; font-size: 0.9rem; margin-top: 2px;">Sichere Dir direkt Deinen Wunschtermin für ein kurzes, persönliches Kennenlerngespräch (ca. 15–20 Min.).</div>
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

                <!-- Prominent CTA Button -->
                <div style="text-align: center; margin: 32px 0 28px 0;">
                    <a href="https://alpha-energie.de/onboarding.html" target="_blank" style="background: linear-gradient(135deg, #ef8a00 0%, #d97706 100%); background-color: #ef8a00; color: #ffffff; padding: 15px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1rem; display: inline-block; box-shadow: 0 4px 14px rgba(239, 138, 0, 0.35); text-shadow: 0 1px 1px rgba(0,0,0,0.15);">
                        Jetzt Kennenlerngespräch buchen &rarr;
                    </a>
                </div>

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
                <p style="color: #334155; font-size: 0.95rem; margin-bottom: 24px;">vielen Dank für Deine Buchung! Dein Termin für unser telefonisches Kennenlerngespräch ist erfolgreich eingetragen und verbindlich für Dich reserviert. Wir freuen uns auf den persönlichen Austausch mit Dir.</p>
                
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
                const transporter = getMailTransporter();
                if (!transporter) {
                    console.log("SMTP credentials missing. Partner registration emails not sent.");
                    return;
                }

                const sender = getSenderEmail();

                // A. Beautiful confirmation email to the applicant
                if (email) {
                    try {
                        await transporter.sendMail({
                            from: sender,
                            to: email,
                            subject: 'Willkommen bei Alpha Energie – Deine Registrierung war erfolgreich!',
                            html: getPartnerRegistrationConfirmationHtml(fullName, email, phone, experience)
                        });
                        console.log(`Confirmation email successfully sent to applicant: ${email}`);
                    } catch (applicantMailErr) {
                        console.error(`Failed to send confirmation email to applicant (${email}):`, applicantMailErr);
                    }
                }

                // B. Notification email to backoffice
                try {
                    await transporter.sendMail({
                        from: sender,
                        to: 'bewerbung@alpha-energie.de',
                        subject: `Neue Registrierung (Agentur/VP): ${fullName}${companyName ? ` (${companyName})` : ''}`,
                        text: `Eine neue Partner-Registrierung ist eingegangen:\n\nName: ${fullName}\nFirma / Agentur: ${companyName || 'Nicht angegeben'}\nE-Mail: ${email}\nTelefon: ${phone || 'Nicht angegeben'}\nPartnermodell / Erfahrung: ${experience || 'Nicht angegeben'}\nNachricht: ${notes || 'Keine'}\n\nBitte im Admin-Panel prüfen.`
                    });
                    console.log(`Notification email successfully sent to bewerbung@alpha-energie.de for ${fullName}`);
                } catch (backofficeMailErr) {
                    console.error("Failed to send partner registration notification to backoffice:", backofficeMailErr);
                }
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

// 2b. Get Available Appointment Slots
app.get('/api/appointments/available', async (req, res) => {
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

// 2c. Book an Appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const { name, email, phone, date, time } = req.body;
        
        const existing = await prisma.appointment.findFirst({
            where: { date, time }
        });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Time slot already booked' });
        }
        
        const newAppointment = await prisma.appointment.create({
            data: { name, email, phone, date, time }
        });

        // 1. Send confirmation email to applicant & 2. notification to backoffice asynchronously (non-blocking)
        (async () => {
            try {
                const transporter = getMailTransporter();
                if (!transporter) {
                    console.log("SMTP credentials missing. Appointment emails not sent.");
                    return;
                }

                const sender = getSenderEmail();
                const dateFormatted = formatGermanDate(date);

                // A. Beautiful confirmation email to the applicant
                if (email) {
                    try {
                        await transporter.sendMail({
                            from: sender,
                            to: email,
                            subject: `Terminbestätigung: Dein Kennenlerngespräch am ${dateFormatted} um ${time} Uhr`,
                            html: getAppointmentConfirmationHtml(name, email, phone, dateFormatted, time)
                        });
                        console.log(`Appointment confirmation email successfully sent to: ${email}`);
                    } catch (applicantMailErr) {
                        console.error(`Failed to send appointment confirmation email to (${email}):`, applicantMailErr);
                    }
                }

                // B. Notification email to backoffice
                try {
                    await transporter.sendMail({
                        from: sender,
                        to: 'bewerbung@alpha-energie.de',
                        subject: `Neuer Termin gebucht: ${dateFormatted} um ${time} Uhr`,
                        text: `Ein neuer Termin wurde gebucht:\n\nName: ${name}\nE-Mail: ${email}\nTelefon: ${phone || 'Nicht angegeben'}\nDatum: ${dateFormatted} (${date})\nUhrzeit: ${time}\n\nBitte im Admin-Panel prüfen.`
                    });
                    console.log(`Notification email successfully sent to bewerbung@alpha-energie.de for appointment on ${dateFormatted} at ${time}`);
                } catch (backofficeMailErr) {
                    console.error("Failed to send appointment notification to backoffice:", backofficeMailErr);
                }
            } catch (mailError) {
                console.error("Error in appointment email worker:", mailError);
            }
        })();

        res.status(201).json({ success: true, data: newAppointment });
    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


// 3. Admin Login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    
    if (password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '12h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
    }
});

// Middleware to protect admin routes
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.admin) {
                return next();
            }
        } catch (err) {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }
    }
    return res.status(401).json({ success: false, error: 'Unauthorized' });
};

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
            }
        }

        if (isNew) {
            const newApp = await prisma.partnerApplication.create({ data: payload });
            return res.json({ success: true, data: newApp });
        } else {
            const updatedApp = await prisma.partnerApplication.update({
                where: { id: appId },
                data: payload
            });
            return res.json({ success: true, data: updatedApp });
        }
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
