const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const VP_GRAPHQL_URL = 'https://vp.alpha-energie.de/api/graphql';
const VP_REFRESH_URL = 'https://vp.alpha-energie.de/auth/v1/refresh';
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.8078.4 Safari/537.36';

const LOCAL_TOKENS_PATH = path.join(__dirname, '..', 'data', 'vp_portal_tokens.json');
const EXTERNAL_SESSION_PATH = 'c:/Users/Alpha Energie Server/Desktop/NewsletterHub-Windows-Server/egon_sessions/session_vp_portal.json';
const PLAYWRIGHT_REFRESH_SCRIPT = 'c:/Users/Alpha Energie Server/Desktop/NewsletterHub-Windows-Server/scripts/refresh-vp-session.cjs';

let cachedCookies = null;
let lastRefreshAt = 0;
let refreshPromise = null;

// In-memory caches for ultra-fast responses (< 350ms)
const addressCache = new Map();
const optionsCache = new Map();
const supplierListCache = new Map();

/**
 * Validates an 11-digit German Market Location ID (MaLo-ID) using the official BDEW Mod-10 check digit.
 */
function isValidMaloId(rawMalo) {
    const clean = String(rawMalo || '').replace(/\s+/g, '').trim();
    if (!/^[1-9][0-9]{10}$/.test(clean)) return false;
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        const digit = Number(clean[i]);
        sum += (i % 2 === 0) ? digit : digit * 2;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === Number(clean[10]);
}

/**
 * Loads & caches the official Vorversorger list (`productFinder_getSupplierList`) for a productId.
 */
async function getPreviousSupplierList(productId = 1586) {
    const pid = parseInt(productId, 10) || 1586;
    const cached = supplierListCache.get(pid);
    if (cached && (Date.now() - cached.ts) < 60 * 60 * 1000) {
        return cached.items;
    }
    try {
        const res = await vpGraphql(
            'productFinder_getSupplierList',
            `query productFinder_getSupplierList($productId: Int!) {
                productFinder_getSupplierList(productId: $productId) {
                    supplierValue
                    supplierKey
                }
            }`,
            { productId: pid }
        );
        const rawList = (res.data && res.data.productFinder_getSupplierList) || [];
        const items = rawList
            .filter(s => s && s.supplierValue && s.supplierKey && !Number.isNaN(Number(s.supplierKey)))
            .map(s => ({
                id: Number(s.supplierKey),
                name: String(s.supplierValue).trim()
            }));
        if (items.length > 0) {
            supplierListCache.set(pid, { ts: Date.now(), items });
        }
        return items;
    } catch (err) {
        console.warn('[RLM-API] Failed to load supplier list:', err.message);
        return [];
    }
}

async function searchPreviousSuppliers(productId = 1586, search = '', limit = 30) {
    const list = await getPreviousSupplierList(productId);
    const q = String(search || '').trim().toLowerCase();
    const filtered = q
        ? list.filter(item => item.name.toLowerCase().includes(q))
        : list;
    return filtered.slice(0, Math.min(Number(limit) || 30, 100));
}

async function resolvePreviousProviderObject(productId, rawProviderInput, fallbackCity = '') {
    const list = await getPreviousSupplierList(productId);
    const raw = String(rawProviderInput || '').trim();

    if (raw) {
        const lower = raw.toLowerCase();
        const exact = list.find(s => s.name.toLowerCase() === lower);
        if (exact) return exact;
        const starts = list.find(s => s.name.toLowerCase().startsWith(lower));
        if (starts) return starts;
        const contains = list.find(s => s.name.toLowerCase().includes(lower) || lower.includes(s.name.toLowerCase()));
        if (contains) return contains;
    }

    if (fallbackCity) {
        const cityLower = String(fallbackCity).trim().toLowerCase();
        const stadtwerkeMatch = list.find(
            s => s.name.toLowerCase().includes('stadtwerke') && s.name.toLowerCase().includes(cityLower)
        ) || list.find(s => s.name.toLowerCase().includes(cityLower));
        if (stadtwerkeMatch) return stadtwerkeMatch;
    }

    const eonMatch = list.find(s => /e\.on energie deutschland/i.test(s.name)) || list[0];
    return eonMatch || { id: 9900105000003, name: raw || 'E.ON Energie Deutschland GmbH' };
}

function round2(val) {
    return Math.round((Number(val) || 0) * 100) / 100;
}

function round4(val) {
    return Math.round((Number(val) || 0) * 10000) / 10000;
}

/**
 * Load VP portal cookies from disk (preferring the newest token file).
 */
function loadCookiesFromDisk() {
    let bestCookies = null;
    let bestTime = 0;

    // 1. Check local data/vp_portal_tokens.json
    try {
        if (fs.existsSync(LOCAL_TOKENS_PATH)) {
            const stat = fs.statSync(LOCAL_TOKENS_PATH);
            const raw = JSON.parse(fs.readFileSync(LOCAL_TOKENS_PATH, 'utf8'));
            if (raw && raw.cookies && raw.cookies.session) {
                bestCookies = raw.cookies;
                bestTime = stat.mtimeMs;
            }
        }
    } catch (err) {
        console.warn('[RLM-API] Failed to read local vp_portal_tokens.json:', err.message);
    }

    // 2. Check NewsletterHub session_vp_portal.json if on Windows Server
    try {
        if (fs.existsSync(EXTERNAL_SESSION_PATH)) {
            const stat = fs.statSync(EXTERNAL_SESSION_PATH);
            if (stat.mtimeMs > bestTime || !bestCookies) {
                const state = JSON.parse(fs.readFileSync(EXTERNAL_SESSION_PATH, 'utf8'));
                const extracted = {};
                for (const c of (state.cookies || [])) {
                    if (c.domain && c.domain.includes('alpha-energie.de')) {
                        extracted[c.name] = c.value;
                    }
                }
                if (extracted.session || extracted.refresh_token) {
                    bestCookies = { ...(bestCookies || {}), ...extracted };
                    bestTime = stat.mtimeMs;
                }
            }
        }
    } catch (err) {
        console.warn('[RLM-API] Failed to read external session_vp_portal.json:', err.message);
    }

    // 3. Also allow environment variables override on cloud deployments
    if (process.env.VP_PORTAL_REFRESH_TOKEN) {
        bestCookies = bestCookies || {};
        if (!bestCookies.refresh_token) {
            bestCookies.refresh_token = process.env.VP_PORTAL_REFRESH_TOKEN;
        }
        if (process.env.VP_PORTAL_SESSION_TOKEN && !bestCookies.session) {
            bestCookies.session = process.env.VP_PORTAL_SESSION_TOKEN;
        }
    }

    if (bestCookies) {
        cachedCookies = bestCookies;
    }
    return cachedCookies || {};
}

/**
 * Save rotated cookies to both local tokens file and external session file (if present).
 */
function saveCookiesToDisk(cookiesObj) {
    cachedCookies = { ...(cachedCookies || {}), ...cookiesObj };
    try {
        fs.mkdirSync(path.dirname(LOCAL_TOKENS_PATH), { recursive: true });
        fs.writeFileSync(LOCAL_TOKENS_PATH, JSON.stringify({
            updatedAt: new Date().toISOString(),
            cookies: cachedCookies
        }, null, 2), 'utf8');
    } catch (err) {
        console.warn('[RLM-API] Could not write local vp_portal_tokens.json:', err.message);
    }

    try {
        if (fs.existsSync(EXTERNAL_SESSION_PATH)) {
            const state = JSON.parse(fs.readFileSync(EXTERNAL_SESSION_PATH, 'utf8'));
            if (Array.isArray(state.cookies)) {
                for (const [k, v] of Object.entries(cookiesObj)) {
                    const existing = state.cookies.find(c => c.domain && c.domain.includes('alpha-energie.de') && c.name === k);
                    if (existing) {
                        existing.value = v;
                    } else {
                        state.cookies.push({
                            name: k,
                            value: v,
                            domain: 'vp.alpha-energie.de',
                            path: '/',
                            httpOnly: true,
                            secure: true,
                            sameSite: 'Lax'
                        });
                    }
                }
                fs.writeFileSync(EXTERNAL_SESSION_PATH, JSON.stringify(state, null, 2), 'utf8');
            }
        }
    } catch (err) {
        console.warn('[RLM-API] Could not update external session_vp_portal.json:', err.message);
    }
}

function buildCookieHeader(cookiesObj) {
    const obj = cookiesObj || cachedCookies || loadCookiesFromDisk();
    return Object.entries(obj)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
}

/**
 * Fast HTTP token refresh using `refresh_token` cookie on `https://vp.alpha-energie.de/auth/v1/refresh`.
 * Takes ~150ms and rotates both `session` (1h) and `refresh_token` (30d).
 */
async function refreshVpSessionViaHttp() {
    const cookies = cachedCookies || loadCookiesFromDisk();
    if (!cookies || !cookies.refresh_token) {
        throw new Error('No refresh_token available for HTTP session refresh');
    }

    const res = await fetch(VP_REFRESH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': buildCookieHeader(cookies),
            'User-Agent': DEFAULT_USER_AGENT
        },
        body: JSON.stringify({})
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP refresh failed with status ${res.status}: ${errText}`);
    }

    const newCookies = {};
    const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
    for (const sc of setCookies) {
        const m = sc.match(/^([^=]+)=([^;]+)/);
        if (m) {
            newCookies[m[1].trim()] = m[2].trim();
        }
    }

    const json = await res.json().catch(() => ({}));
    if (json && json.data) {
        if (json.data.sessionToken) newCookies.session = json.data.sessionToken;
        if (json.data.refreshToken) newCookies.refresh_token = json.data.refreshToken;
    }

    if (!newCookies.session) {
        throw new Error('HTTP refresh did not return a new sessionToken');
    }

    saveCookiesToDisk(newCookies);
    lastRefreshAt = Date.now();
    console.log('[RLM-API] Successfully refreshed VP portal session via HTTP (/auth/v1/refresh)');
    return cachedCookies;
}

/**
 * Fallback Playwright + TOTP refresh (available when running on the Windows Server).
 */
async function refreshVpSessionViaPlaywright() {
    if (!fs.existsSync(PLAYWRIGHT_REFRESH_SCRIPT)) {
        throw new Error('Playwright refresh script not available in this environment');
    }
    console.log('[RLM-API] Running Playwright TOTP session refresh...');
    await new Promise((resolve, reject) => {
        execFile(process.execPath, [PLAYWRIGHT_REFRESH_SCRIPT], {
            cwd: path.dirname(PLAYWRIGHT_REFRESH_SCRIPT),
            timeout: 90000
        }, (err, stdout, stderr) => {
            if (err) {
                console.error('[RLM-API] Playwright refresh error:', stderr || err.message);
                return reject(err);
            }
            console.log('[RLM-API] Playwright refresh completed');
            resolve(stdout);
        });
    });
    cachedCookies = null;
    loadCookiesFromDisk();
    lastRefreshAt = Date.now();
    return cachedCookies;
}

let remoteSessionRefresher = null;

function setRemoteSessionRefresher(fn) {
    remoteSessionRefresher = typeof fn === 'function' ? fn : null;
}

/**
 * Coordinated session refresh (deduplicates concurrent refresh calls).
 */
async function ensureFreshVpSession(force = false) {
    if (!cachedCookies) {
        loadCookiesFromDisk();
    }
    const ageMs = Date.now() - lastRefreshAt;
    if (!force && cachedCookies && cachedCookies.session && ageMs < 40 * 60 * 1000) {
        return cachedCookies;
    }

    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            return await refreshVpSessionViaHttp();
        } catch (httpErr) {
            console.warn('[RLM-API] HTTP token refresh failed, trying fallback:', httpErr.message);
            if (fs.existsSync(PLAYWRIGHT_REFRESH_SCRIPT)) {
                return await refreshVpSessionViaPlaywright();
            }
            if (remoteSessionRefresher) {
                console.log('[RLM-API] Requesting fresh VP session via Windows PC-Bridge...');
                const bridgeRes = await remoteSessionRefresher();
                if (bridgeRes && bridgeRes.cookies && bridgeRes.cookies.session) {
                    saveCookiesToDisk(bridgeRes.cookies);
                    lastRefreshAt = Date.now();
                    console.log('[RLM-API] Successfully synced fresh VP session via PC-Bridge');
                    return cachedCookies;
                }
                throw new Error('PC-Bridge did not return valid VP session cookies');
            }
            return await refreshVpSessionViaPlaywright();
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

// Keep the VP portal session warm in the background every 35 minutes (unless disabled on relay worker)
if (process.env.DISABLE_RLM_KEEPALIVE !== '1') {
    const keepAliveTimer = setInterval(() => {
        refreshVpSessionViaHttp().catch(err => {
            console.warn('[RLM-API] Background session keep-alive warning:', err.message);
        });
    }, 35 * 60 * 1000);
    if (typeof keepAliveTimer.unref === 'function') {
        keepAliveTimer.unref();
    }
}

/**
 * Execute a GraphQL operation against `https://vp.alpha-energie.de/api/graphql`
 * with automatic 401 token refresh and retry.
 */
async function vpGraphql(operationName, query, variables = {}, retried = false) {
    if (!cachedCookies) {
        loadCookiesFromDisk();
    }

    const res = await fetch(VP_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': buildCookieHeader(cachedCookies),
            'Referer': 'https://vp.alpha-energie.de/portal/product-finder-next?embed=true',
            'User-Agent': DEFAULT_USER_AGENT
        },
        body: JSON.stringify({ operationName, query, variables })
    });

    const json = await res.json().catch(() => ({}));
    const isUnauthenticated =
        res.status === 401 ||
        res.status === 403 ||
        (Array.isArray(json.errors) && json.errors.some(e =>
            (e.message && e.message.toLowerCase().includes('authentication')) ||
            (e.extensions && e.extensions.code === 'UNAUTHENTICATED')
        ));

    if (isUnauthenticated && !retried) {
        await ensureFreshVpSession(true);
        return vpGraphql(operationName, query, variables, true);
    }

    if (!res.ok && !json.data) {
        throw new Error(`VP GraphQL HTTP ${res.status} on ${operationName}`);
    }

    return json;
}

/**
 * Resolve city and street for a German PLZ via the RLM Portal GraphQL API (cached in memory).
 */
async function resolveDeliveryAddress({ plz, city, street, houseNumber, lookupOnly }) {
    const cleanZip = String(plz || '44379').replace(/\D/g, '').padStart(5, '0').slice(0, 5);
    const cleanHouseNr = String(houseNumber || '1').trim() || '1';

    let resolvedCity = city ? String(city).trim() : '';
    let resolvedStreet = street ? String(street).trim() : '';

    if (resolvedCity && resolvedStreet && !lookupOnly) {
        return {
            success: true,
            country: 'DE',
            zip: cleanZip,
            city: resolvedCity,
            street: resolvedStreet,
            houseNumber: cleanHouseNr,
            citiesInZip: [resolvedCity],
            streets: [resolvedStreet],
            sampleStreets: [resolvedStreet]
        };
    }

    const cached = addressCache.get(cleanZip);
    let citiesInZip = cached ? cached.cities : null;

    if (!citiesInZip) {
        const cityRes = await vpGraphql(
            'AddressSearchCity',
            `query AddressSearchCity($address: ProductFinder_addressSearchInput!, $usecase: ProductFinder_addressSearchUsecaseEnum) {
                addressSearchCity: productFinder_addressSearch(address: $address, usecase: $usecase) {
                    zip
                    city
                }
            }`,
            { address: { country: 'DE', zip: cleanZip }, usecase: 'PRODUCT_AVAILABILITY' }
        );
        const list = (cityRes.data && cityRes.data.addressSearchCity) || [];
        citiesInZip = Array.from(new Set(list.map(item => item.city).filter(Boolean)));
    }

    if (!resolvedCity) {
        resolvedCity = citiesInZip[0] || (lookupOnly ? '' : 'Dortmund');
    }

    let streetsInCity = (cached && cached.city === resolvedCity && cached.streets) ? cached.streets : null;
    if (!streetsInCity && resolvedCity) {
        const streetRes = await vpGraphql(
            'AddressSearchStreet',
            `query AddressSearchStreet($address: ProductFinder_addressSearchInput!, $usecase: ProductFinder_addressSearchUsecaseEnum) {
                addressSearchStreet: productFinder_addressSearch(address: $address, usecase: $usecase) {
                    zip
                    street
                }
            }`,
            { address: { country: 'DE', zip: cleanZip, city: resolvedCity }, usecase: 'PRODUCT_AVAILABILITY' }
        );
        const sList = (streetRes.data && streetRes.data.addressSearchStreet) || [];
        streetsInCity = Array.from(new Set(sList.map(item => item.street).filter(Boolean)));
        if (citiesInZip.length > 0 && streetsInCity.length > 0) {
            addressCache.set(cleanZip, {
                cities: citiesInZip,
                city: resolvedCity,
                streets: streetsInCity
            });
        }
    }
    if (!streetsInCity) {
        streetsInCity = [];
    }

    if (!resolvedStreet) {
        resolvedStreet = streetsInCity[0] || (lookupOnly ? '' : 'Hauptstraße');
    }

    return {
        success: true,
        country: 'DE',
        zip: cleanZip,
        city: resolvedCity,
        street: resolvedStreet,
        houseNumber: cleanHouseNr,
        citiesInZip,
        streets: streetsInCity,
        sampleStreets: streetsInCity
    };
}

/**
 * Normalize delivery start date to YYYY-MM-DD.
 * Defaults to the 1st of the month at least 45 days in the future (so providers with a 6-week lead time like EVITA & E.ON are always active).
 */
function normalizeDeliveryStart(dateInput) {
    if (dateInput && typeof dateInput === 'string') {
        const trimmed = dateInput.trim();
        // DD.MM.YYYY
        const deMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (deMatch) {
            return `${deMatch[3]}-${deMatch[2]}-${deMatch[1]}`;
        }
        // YYYY-MM-DD
        const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
        }
    }
    const leadDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
    const firstOfMonth = new Date(Date.UTC(leadDate.getUTCFullYear(), leadDate.getUTCMonth() + 1, 1));
    return firstOfMonth.toISOString().slice(0, 10);
}

/**
 * Normalize gridLayer / Druckstufe to LOW | MEDIUM | HIGH
 */
function normalizeGridLayer(input) {
    const val = String(input || 'LOW').trim().toUpperCase();
    if (['MEDIUM', 'MITTEL', 'MITTELSPANNUNG', 'MITTELDRUCK', 'MD', 'MS'].includes(val)) {
        return 'MEDIUM';
    }
    if (['HIGH', 'HOCH', 'HOCHSPANNUNG', 'HOCHDRUCK', 'HD', 'HS'].includes(val)) {
        return 'HIGH';
    }
    return 'LOW';
}

// Known RLM SalesBinding fallback map from vp.alpha-energie.de (RecordService_getSalesBindings)
const STATIC_RLM_SALES_BINDINGS = {
    10011: { salesChannel: 'Alpha Energie GmbH', salesLevel: 'Alpha Energie GmbH', levelId: 67, sort: 1, ratePct: 90 },
    10141: { salesChannel: 'Alpha 2027', salesLevel: 'Alpha 2027', levelId: 303, sort: 1, ratePct: 90 },
    10185: { salesChannel: 'Alpha Energie GmbH', salesLevel: 'Landesdirektor', levelId: 69, sort: 3, ratePct: 80 },
    10186: { salesChannel: 'Alpha Energie GmbH', salesLevel: 'Bezirksdirektor', levelId: 72, sort: 6, ratePct: 65 },
    10197: { salesChannel: 'Alpha Energie GmbH', salesLevel: 'Landesdirektor', levelId: 69, sort: 3, ratePct: 80 },
    10307: { salesChannel: 'Alpha Energie GmbH', salesLevel: 'Landesdirektor', levelId: 69, sort: 3, ratePct: 80 },
    11088: { salesChannel: 'Alpha Energie GmbH', salesLevel: 'Landesdirektor', levelId: 69, sort: 3, ratePct: 80 },
    11302: { salesChannel: 'Alpha 2027', salesLevel: 'Landesdirektor', levelId: 305, sort: 3, ratePct: 80 },
    11366: { salesChannel: 'Alpha 2026', salesLevel: 'Landesdirektor', levelId: 292, sort: 2, ratePct: 85 },
    11810: { salesChannel: 'Alpha do to do', salesLevel: 'S0', levelId: 27, sort: 2, ratePct: 85 },
    12058: { salesChannel: 'Alpha Energie GmbH', salesLevel: 'Landesdirektor', levelId: 69, sort: 3, ratePct: 80 },
    12488: { salesChannel: 'Alpha do to do', salesLevel: 'F1', levelId: 31, sort: 6, ratePct: 65 },
    13080: { salesChannel: 'Alpha 2027', salesLevel: 'Landesdirektor', levelId: 305, sort: 3, ratePct: 80 },
    13276: { salesChannel: 'Alpha 2027', salesLevel: 'Generaldirektor', levelId: 304, sort: 2, ratePct: 85 },
    14281: { salesChannel: 'Alpha Energie GmbH', salesLevel: 'Distriktdirektor', levelId: 71, sort: 5, ratePct: 70 },
    14283: { salesChannel: 'Alpha Energie GmbH', salesLevel: 'Verkaufsleiter', levelId: 74, sort: 8, ratePct: 55 },
    14669: { salesChannel: 'Alpha 2026', salesLevel: 'Alpha 2026', levelId: 291, sort: 1, ratePct: 90 },
    14701: { salesChannel: 'Alpha Energie GmbH', salesLevel: 'Verkaufsleiter', levelId: 74, sort: 8, ratePct: 55 },
    14719: { salesChannel: 'Alpha 2028', salesLevel: 'Alpha 2028', levelId: 350, sort: 1, ratePct: 90 },
    14764: { salesChannel: 'Alpha 2027', salesLevel: 'Landesdirektor', levelId: 305, sort: 3, ratePct: 80 },
    14809: { salesChannel: 'Alpha 2027', salesLevel: 'Landesdirektor', levelId: 305, sort: 3, ratePct: 80 },
    14822: { salesChannel: 'Alpha Stufe 11', salesLevel: 'General', levelId: 280, sort: 2, ratePct: 85 },
    14950: { salesChannel: 'Alpha 2026', salesLevel: 'Landesdirektor', levelId: 292, sort: 2, ratePct: 85 },
    15143: { salesChannel: 'Alpha 2026', salesLevel: 'Regionaldirektor', levelId: 293, sort: 3, ratePct: 80 },
    15154: { salesChannel: 'Alpha 2027', salesLevel: 'Landesdirektor', levelId: 305, sort: 3, ratePct: 80 },
    15629: { salesChannel: 'Alpha 2027', salesLevel: 'Landesdirektor', levelId: 305, sort: 3, ratePct: 80 },
    15800: { salesChannel: 'Alpha 2027', salesLevel: 'Alpha 2027', levelId: 303, sort: 1, ratePct: 90 },
    16016: { salesChannel: 'Call', salesLevel: 'Call', levelId: 329, sort: 1, ratePct: 90 },
    16113: { salesChannel: 'Prime', salesLevel: 'Prime', levelId: 335, sort: 1, ratePct: 90 },
    16114: { salesChannel: 'Prime 2', salesLevel: 'Prime 2', levelId: 345, sort: 1, ratePct: 90 },
    16135: { salesChannel: 'Prime', salesLevel: 'Platinum', levelId: 336, sort: 2, ratePct: 80 },
    16136: { salesChannel: 'Prime', salesLevel: 'Platinum', levelId: 336, sort: 2, ratePct: 80 },
    16305: { salesChannel: 'Alpha 2027', salesLevel: 'Landesdirektor', levelId: 305, sort: 3, ratePct: 80 },
    16330: { salesChannel: 'Alpha 2027', salesLevel: 'Generaldirektor', levelId: 304, sort: 2, ratePct: 85 },
    16331: { salesChannel: 'Alpha 2027', salesLevel: 'Landesdirektor', levelId: 305, sort: 3, ratePct: 80 },
    16463: { salesChannel: 'Vertriebweg Berlin 2', salesLevel: 'General', levelId: 382, sort: 2, ratePct: 85 },
    16464: { salesChannel: 'Vertriebweg Berlin 2', salesLevel: 'Senior General', levelId: 383, sort: 3, ratePct: 80 },
    16465: { salesChannel: 'Vertriebweg Berlin 2', salesLevel: 'Junior General', levelId: 384, sort: 4, ratePct: 75 },
    16481: { salesChannel: 'Alpha 2027', salesLevel: 'Vertriebsassistent', levelId: 315, sort: 13, ratePct: 30 },
    16482: { salesChannel: 'Alpha 2027', salesLevel: 'Vertriebsassistent', levelId: 315, sort: 13, ratePct: 30 },
    16483: { salesChannel: 'Alpha 2027', salesLevel: 'Vertriebsassistent', levelId: 315, sort: 13, ratePct: 30 },
    16486: { salesChannel: 'Vertriebweg Berlin 2', salesLevel: 'Geschäftsleiter', levelId: 385, sort: 5, ratePct: 70 },
    16488: { salesChannel: 'Vertriebweg Berlin 2', salesLevel: 'Regionalleiter', levelId: 386, sort: 6, ratePct: 65 },
    16505: { salesChannel: 'Vertriebweg Berlin 2', salesLevel: 'Vertriebler', levelId: 389, sort: 9, ratePct: 50 },
    16520: { salesChannel: '4 Stufe', salesLevel: 'Geschäftsleiter', levelId: 391, sort: 2, ratePct: 85 },
    16521: { salesChannel: '4 Stufe', salesLevel: 'Geschäftsleiter', levelId: 391, sort: 2, ratePct: 85 },
    16523: { salesChannel: '4 Stufe', salesLevel: 'Vertriebler', levelId: 393, sort: 4, ratePct: 75 },
    16524: { salesChannel: '4 Stufe', salesLevel: 'Vertriebler', levelId: 393, sort: 4, ratePct: 75 },
    16528: { salesChannel: '4 Stufe', salesLevel: 'Vertriebsleiter', levelId: 392, sort: 3, ratePct: 80 },
    16566: { salesChannel: '4 Stufe', salesLevel: 'Vertriebler', levelId: 393, sort: 4, ratePct: 75 }
};

let cachedSalesBindingsMap = null;
let cachedSalesBindingsAt = 0;

function computeRatePctFromBinding(channelDesc, levelSort) {
    const chName = String(channelDesc || '').trim();
    const isPrime = chName.toLowerCase() === 'prime' || chName.toLowerCase() === 'prime 2';
    const sort = Math.max(1, Number(levelSort) || 1);
    const idx = sort - 1;
    if (isPrime) {
        if (idx === 0) return 90;
        if (idx === 1) return 80;
        return Math.max(0, 80 - (idx - 1) * 5);
    }
    return Math.max(0, 90 - idx * 5);
}

/**
 * Resolve the individual RLM commission profile (Provisionssatz %, salesChannel, salesLevel)
 * for a given VP number (`salesNumber`) directly from `vp.alpha-energie.de/api/graphql` (`RecordService_getSalesBindings`).
 */
async function resolveVpCommissionProfile(salesNumberInput) {
    const cleanVp = parseInt(String(salesNumberInput || '10011').replace(/\D/g, ''), 10) || 10011;
    const now = Date.now();

    if (!cachedSalesBindingsMap || (now - cachedSalesBindingsAt > 10 * 60 * 1000)) {
        try {
            const res = await vpGraphql(
                'RecordService_getSalesBindings',
                `query RecordService_getSalesBindings($salesNumberList: [Int!]) {
                    recordService_getSalesBindings(salesNumberList: $salesNumberList) {
                        active
                        id
                        salesNumber
                        resellerId
                        parentId
                        levelId
                        salesChannel { id description }
                        salesLevel { id description sort isMain }
                    }
                }`,
                {}
            );
            const list = (res && res.data && Array.isArray(res.data.recordService_getSalesBindings))
                ? res.data.recordService_getSalesBindings
                : [];
            if (list.length > 0) {
                const freshMap = new Map();
                for (const b of list) {
                    const sn = Number(b.salesNumber);
                    if (!sn) continue;
                    const chDesc = (b.salesChannel && b.salesChannel.description) ? b.salesChannel.description : 'Alpha Energie GmbH';
                    const lvlDesc = (b.salesLevel && b.salesLevel.description) ? b.salesLevel.description : 'Partner';
                    const sort = (b.salesLevel && Number(b.salesLevel.sort)) ? Number(b.salesLevel.sort) : 1;
                    const ratePct = computeRatePctFromBinding(chDesc, sort);
                    freshMap.set(sn, {
                        salesNumber: sn,
                        resellerId: b.resellerId || null,
                        parentId: b.parentId || null,
                        levelId: b.levelId || null,
                        salesChannel: chDesc,
                        salesLevel: lvlDesc,
                        levelSort: sort,
                        commissionRatePct: ratePct,
                        source: 'live_rlm_graphql'
                    });
                }
                cachedSalesBindingsMap = freshMap;
                cachedSalesBindingsAt = now;
            }
        } catch (err) {
            console.warn('[RLM-API] Live RecordService_getSalesBindings lookup warning, using cached/static bindings:', err.message);
        }
    }

    if (cachedSalesBindingsMap && cachedSalesBindingsMap.has(cleanVp)) {
        return cachedSalesBindingsMap.get(cleanVp);
    }

    const staticHit = STATIC_RLM_SALES_BINDINGS[cleanVp];
    if (staticHit) {
        return {
            salesNumber: cleanVp,
            resellerId: null,
            parentId: null,
            levelId: staticHit.levelId,
            salesChannel: staticHit.salesChannel,
            salesLevel: staticHit.salesLevel,
            levelSort: staticHit.sort,
            commissionRatePct: staticHit.ratePct,
            source: 'static_rlm_binding'
        };
    }

    // Fallback for VP numbers not yet bound in RecordService_getSalesBindings
    return {
        salesNumber: cleanVp,
        resellerId: null,
        parentId: 10011,
        levelId: null,
        salesChannel: 'Alpha Energie GmbH',
        salesLevel: 'Vertriebspartner',
        levelSort: 3,
        commissionRatePct: 80,
        source: 'default_partner_tier'
    };
}

/**
 * Extracts allowed payment types (`['INVOICE', 'DEBIT']` vs `['DEBIT']` / `['INVOICE']`)
 * from a product's JSON Schema (`product.forms.schemaDefinition.properties.productPayment.properties.paymentType`).
 */
function extractProductPaymentConfig(product) {
    const normalizeRawType = (raw) => {
        const val = String(raw || '').toUpperCase().trim();
        if (val === 'DEBIT_CHARGE' || val === 'DEBIT' || val === 'SEPA') return 'DEBIT';
        if (val === 'INVOICE') return 'INVOICE';
        return null;
    };

    const formList = Array.isArray(product && product.forms)
        ? product.forms
        : (product && product.forms && typeof product.forms === 'object' ? [product.forms] : []);

    const collected = new Set();
    for (const formEntry of formList) {
        const schemaDef = formEntry && formEntry.schemaDefinition;
        const ptSchema = schemaDef &&
            schemaDef.properties &&
            schemaDef.properties.productPayment &&
            schemaDef.properties.productPayment.properties &&
            schemaDef.properties.productPayment.properties.paymentType;
        if (!ptSchema || typeof ptSchema !== 'object') continue;

        if (Array.isArray(ptSchema.oneOf)) {
            for (const opt of ptSchema.oneOf) {
                const mapped = normalizeRawType(opt && (opt.const || opt.id || opt.value));
                if (mapped) collected.add(mapped);
            }
        }
        if (Array.isArray(ptSchema.enum)) {
            for (const opt of ptSchema.enum) {
                const mapped = normalizeRawType(opt);
                if (mapped) collected.add(mapped);
            }
        }
        if (ptSchema.const && collected.size === 0) {
            const mapped = normalizeRawType(ptSchema.const);
            if (mapped) collected.add(mapped);
        }
    }

    // Known IBAN-only product fallback if schemaDefinition was omitted
    if (collected.size === 0 && product && (Number(product.id) === 1135 || Number(product.id) === 1136)) {
        collected.add('DEBIT');
    }

    const allowedPaymentTypes = [];
    if (collected.size === 0) {
        allowedPaymentTypes.push('INVOICE', 'DEBIT');
    } else {
        if (collected.has('INVOICE')) allowedPaymentTypes.push('INVOICE');
        if (collected.has('DEBIT')) allowedPaymentTypes.push('DEBIT');
    }

    return {
        allowedPaymentTypes,
        ibanOnly: allowedPaymentTypes.length === 1 && allowedPaymentTypes[0] === 'DEBIT'
    };
}

/**
 * Extract structured tariff variants from a raw RLM Portal product and combine with official network/levy calculation.
 */
function buildTariffVariantsForProduct({
    product,
    branch,
    measurement,
    consumption,
    peakLoad,
    usageHours,
    gridLayer,
    deliveryStart,
    surchargeCt,
    baseSurchargeEur,
    drittkostenCalc,
    currentYearlyNetto,
    currentYearlyBrutto,
    vpCommissionProfile
}) {
    const vpProfile = vpCommissionProfile || {
        salesNumber: 10011,
        salesChannel: 'Alpha Energie GmbH',
        salesLevel: 'Alpha Energie GmbH',
        levelSort: 1,
        commissionRatePct: 90,
        source: 'default'
    };
    const vpCommissionRatePct = Number(vpProfile.commissionRatePct) || 80;
    const paymentConfig = extractProductPaymentConfig(product);
    const prices = Array.isArray(product.pricesWithoutSurcharge) && product.pricesWithoutSurcharge.length > 0
        ? product.pricesWithoutSurcharge
        : (Array.isArray(product.prices) ? product.prices : []);

    const isRlm = measurement === 'RLM';
    const workPriceSurchargeRule = (Array.isArray(product.surcharges) ? product.surcharges : [])
        .find(s => s.priceType === 'WORK_PRICE') || { min: 0, max: 3, step: 0.1 };

    const maxAllowedSurcharge = Number.isFinite(Number(workPriceSurchargeRule.max)) ? Number(workPriceSurchargeRule.max) : 3;
    const minAllowedSurcharge = Number.isFinite(Number(workPriceSurchargeRule.min)) ? Number(workPriceSurchargeRule.min) : 0;
    const appliedSurchargeCt = round4(Math.min(maxAllowedSurcharge, Math.max(minAllowedSurcharge, Number(surchargeCt) || 0)));
    const appliedBaseSurchargeEur = round2(Math.max(0, Number(baseSurchargeEur) || 0));

    // Filter price entries matching RLM vs SLP
    const matchingPrices = prices.filter(p => {
        if (isRlm && p.isRlm === false && p.isSlp === true) return false;
        if (!isRlm && p.isSlp === false && p.isRlm === true) return false;
        return true;
    });

    const workPrices = matchingPrices.filter(p => p.priceType === 'WORK_PRICE');
    const basePrices = matchingPrices.filter(p => p.priceType === 'BASE_PRICE');

    // Extract Drittkosten (Netzentgelte, Umlagen, Abgaben, Steuern, Messstellenbetrieb) from official calculation
    const calcItems = (drittkostenCalc && Array.isArray(drittkostenCalc.calculationItems))
        ? drittkostenCalc.calculationItems.filter(item => item.notice !== 'Energie')
        : [];

    // Consumption-based Drittkosten in ct/kWh (where count === consumption or unit === 'CT_K_WH')
    const drittkostenWorkItems = calcItems.filter(item => item.unit === 'CT_K_WH' || Number(item.count) === Number(consumption));
    const drittkostenWorkPriceCtNetto = round4(
        drittkostenWorkItems.reduce((sum, item) => sum + (Number(item.pricePerUnit) || 0), 0)
    );
    const drittkostenWorkYearlyNetto = round2(
        drittkostenWorkItems.reduce((sum, item) => sum + (Number(item.sum) || 0), 0)
    );

    // Fixed / Peak-load based Drittkosten in €/year (Wirkleistung/Leistung €/kW, Grundpreis Netz €/a, Messstellenbetrieb €/a)
    const drittkostenFixedItems = calcItems.filter(item => !(item.unit === 'CT_K_WH' || Number(item.count) === Number(consumption)));
    const drittkostenFixedYearlyNetto = round2(
        drittkostenFixedItems.reduce((sum, item) => sum + (Number(item.sum) || 0), 0)
    );

    const totalDrittkostenYearlyNetto = drittkostenCalc && Number.isFinite(Number(drittkostenCalc.totalOneYearNetto))
        ? round2(Number(drittkostenCalc.totalOneYearNetto))
        : round2(drittkostenWorkYearlyNetto + drittkostenFixedYearlyNetto);

    const variants = [];

    for (const wpEntry of workPrices) {
        const periods = Array.isArray(wpEntry.workingPricePeriods) ? wpEntry.workingPricePeriods : [];

        for (let pIdx = 0; pIdx < periods.length; pIdx++) {
            const period = periods[pIdx];
            const rawWorkPriceCt = Number(period.price) || 0;
            const taxRate = Number(wpEntry.taxRate) || 19;
            // Convert to Netto if price entry has isNetto === false AND explicit taxRate > 0
            const baseWorkPriceCtNetto = (!wpEntry.isNetto && wpEntry.taxRate !== null && Number(wpEntry.taxRate) > 0)
                ? round4(rawWorkPriceCt / (1 + taxRate / 100))
                : round4(rawWorkPriceCt);

            let durationMonths = Number(period.timeSeries) || Number(wpEntry.contractDurationMonths) || 12;
            if (durationMonths > 0 && durationMonths <= 6) {
                durationMonths = durationMonths * 12;
            }
            if (!period.timeSeries && period.from && period.to) {
                const dFrom = new Date(`${period.from}T00:00:00Z`);
                const dTo = new Date(`${period.to}T00:00:00Z`);
                if (!Number.isNaN(dFrom.getTime()) && !Number.isNaN(dTo.getTime()) && dTo > dFrom) {
                    const spanMonths = Math.round((dTo.getTime() - dFrom.getTime()) / (30.4375 * 86400000));
                    if (spanMonths >= 12) {
                        durationMonths = spanMonths;
                    }
                }
            }

            const paymentIntervalAttr = (Array.isArray(product.attributes) ? product.attributes : [])
                .find(a => a && a.key === 'paymentInterval');
            const paymentInterval = paymentIntervalAttr && Number(paymentIntervalAttr.value) > 0
                ? Number(paymentIntervalAttr.value)
                : 12;
            const effectiveMeasurement = (wpEntry.isSlp && !wpEntry.isRlm)
                ? 'SLP'
                : ((wpEntry.isRlm && !wpEntry.isSlp) ? 'RLM' : measurement);

            // Find matching BASE_PRICE entry for this duration/timeSeries
            let matchedBaseMonthlyNetto = 0;
            let matchedBaseNotice = null;
            const matchingBpEntry = basePrices.find(bp => Number(bp.contractDurationMonths) === Number(wpEntry.contractDurationMonths)) || basePrices[0];

            if (matchingBpEntry && Array.isArray(matchingBpEntry.workingPricePeriods)) {
                const bpPeriod = matchingBpEntry.workingPricePeriods.find(bpp =>
                    (period.timeSeries && Number(bpp.timeSeries) === Number(period.timeSeries)) ||
                    (period.from && bpp.from === period.from && period.to === bpp.to)
                ) || matchingBpEntry.workingPricePeriods[pIdx] || matchingBpEntry.workingPricePeriods[0];

                if (bpPeriod) {
                    const rawBp = Number(bpPeriod.price) || 0;
                    const bpTax = Number(matchingBpEntry.taxRate) || 19;
                    const bpNetto = (!matchingBpEntry.isNetto && matchingBpEntry.taxRate !== null && Number(matchingBpEntry.taxRate) > 0)
                        ? rawBp / (1 + bpTax / 100)
                        : rawBp;

                    const unit = String(bpPeriod.unit || matchingBpEntry.billInterval || 'EURO_M').toUpperCase();
                    if (unit === 'EURO_A' || unit === 'YEARLY') {
                        matchedBaseMonthlyNetto = round2(bpNetto / 12);
                    } else if (unit === 'EURO_Q' || unit === 'QUARTERLY') {
                        matchedBaseMonthlyNetto = round2(bpNetto / 3);
                    } else {
                        matchedBaseMonthlyNetto = round2(bpNetto);
                    }
                    matchedBaseNotice = matchingBpEntry.notice || null;
                }
            }

            const basePriceEnergyBaseMonthlyNetto = matchedBaseMonthlyNetto;
            matchedBaseMonthlyNetto = round2(basePriceEnergyBaseMonthlyNetto + appliedBaseSurchargeEur);
            const drittkostenFixedMonthlyNetto = round2(drittkostenFixedYearlyNetto / 12);
            const totalFixedMonthlyNetto = round2(matchedBaseMonthlyNetto + drittkostenFixedMonthlyNetto);

            const workingPriceEnergyCtNetto = round4(baseWorkPriceCtNetto + appliedSurchargeCt);
            const workingPriceEnergyCtBrutto = round4(workingPriceEnergyCtNetto * (1 + taxRate / 100));

            const workingPriceTotalCtNetto = round4(workingPriceEnergyCtNetto + drittkostenWorkPriceCtNetto);
            const workingPriceTotalCtBrutto = round4(workingPriceTotalCtNetto * (1 + taxRate / 100));

            const energyWorkYearlyNetto = round2(consumption * (workingPriceEnergyCtNetto / 100));
            const basePriceEnergyYearlyNetto = round2(matchedBaseMonthlyNetto * 12);
            const basePriceEnergyMonthlyBrutto = round2(matchedBaseMonthlyNetto * (1 + taxRate / 100));

            const energyCostYearlyNetto = round2(energyWorkYearlyNetto + basePriceEnergyYearlyNetto);
            const energyCostYearlyBrutto = round2(energyCostYearlyNetto * (1 + taxRate / 100));

            const totalYearlyNetto = round2(energyCostYearlyNetto + totalDrittkostenYearlyNetto);
            const totalYearlyBrutto = round2(totalYearlyNetto * (1 + taxRate / 100));

            // Monthly advance payments (Abschläge) - 12 installments & 11 installments
            const abschlagMonthlyNetto = round2(totalYearlyNetto / 12);
            const abschlagMonthlyBrutto = round2(totalYearlyBrutto / 12);
            const abschlag11MonthlyNetto = round2(totalYearlyNetto / 11);
            const abschlag11MonthlyBrutto = round2(totalYearlyBrutto / 11);

            const energyOnlyAbschlagMonthlyNetto = round2(energyCostYearlyNetto / 12);
            const energyOnlyAbschlagMonthlyBrutto = round2(energyCostYearlyBrutto / 12);

            const savingsYearlyNetto = currentYearlyNetto > 0 ? round2(Math.max(0, currentYearlyNetto - totalYearlyNetto)) : 0;
            const savingsYearlyBrutto = currentYearlyBrutto > 0 ? round2(Math.max(0, currentYearlyBrutto - totalYearlyNetto)) : 0;
            const savingsMonthlyNetto = round2(savingsYearlyNetto / 12);
            const savingsMonthlyBrutto = round2(savingsYearlyBrutto / 12);

            // --- Partner Commission / Provision (per tariff & VP Provisionssatz %) ---
            const marginWorkYearlyNetto = round2(consumption * (appliedSurchargeCt / 100));
            const marginBaseYearlyNetto = round2(appliedBaseSurchargeEur * 12);
            const marginYearlyNetto = round2(marginWorkYearlyNetto + marginBaseYearlyNetto);
            const provisionYearlyNetto = round2(marginYearlyNetto * (vpCommissionRatePct / 100));
            const provisionMonthlyNetto = round2(provisionYearlyNetto / 12);
            const provisionTotalContractNetto = round2(provisionYearlyNetto * (durationMonths / 12));

            const deliveryFrom = period.from || deliveryStart;
            let deliveryTo = period.to || null;
            if (!deliveryTo && deliveryFrom && durationMonths) {
                const d = new Date(`${deliveryFrom}T00:00:00Z`);
                if (!Number.isNaN(d.getTime())) {
                    d.setUTCMonth(d.getUTCMonth() + durationMonths);
                    d.setUTCDate(d.getUTCDate() - 1);
                    deliveryTo = d.toISOString().slice(0, 10);
                }
            }

            const endYear = deliveryTo ? deliveryTo.slice(0, 4) : '';
            const cleanProvider = (product.provider && product.provider.name) ? product.provider.name : 'Alpha Energie Partner';
            const tariffLabel = endYear
                ? `${product.name} – ${durationMonths} Monate (bis ${deliveryTo.split('-').reverse().join('.')})`
                : `${product.name} – ${durationMonths} Monate`;

            variants.push({
                id: `${effectiveMeasurement.toLowerCase()}-${product.id}-${durationMonths}m`,
                tariffId: `${effectiveMeasurement.toLowerCase()}-${product.id}-${durationMonths}m`,
                priceId: wpEntry.id,
                productId: product.id,
                name: tariffLabel,
                productName: product.name,
                providerName: cleanProvider,
                providerId: product.provider ? product.provider.id : null,
                notice: wpEntry.notice || '',
                basePriceNotice: matchedBaseNotice,
                branch,
                measurement: effectiveMeasurement,
                gridLayer,
                consumption,
                peakLoad: effectiveMeasurement === 'RLM' ? peakLoad : null,
                leistungKw: effectiveMeasurement === 'RLM' ? peakLoad : null,
                usageHours: effectiveMeasurement === 'RLM' ? usageHours : null,
                benutzungsstunden: effectiveMeasurement === 'RLM' ? usageHours : null,
                contractDurationMonths: durationMonths,
                contractTermMonths: durationMonths,
                priceGuaranteeMonths: durationMonths,
                paymentInterval,
                abschlaegeProJahr: paymentInterval,
                allowedPaymentTypes: paymentConfig.allowedPaymentTypes,
                ibanOnly: paymentConfig.ibanOnly,
                deliveryFrom,
                deliveryTo,
                taxRate,

                // --- Working Prices (ct/kWh) ---
                workingPriceEnergyBaseCtNetto: baseWorkPriceCtNetto,
                surchargeCtNetto: appliedSurchargeCt,
                surchargeRange: {
                    min: minAllowedSurcharge,
                    max: maxAllowedSurcharge,
                    step: Number(workPriceSurchargeRule.step) || 0.1
                },
                workingPriceEnergyCtNetto,
                workingPriceEnergyCtBrutto,
                workingPriceDrittkostenCtNetto: drittkostenWorkPriceCtNetto,
                workingPriceTotalCtNetto,
                workingPriceTotalCtBrutto,

                // --- Base & Peak Prices (€) ---
                basePriceEnergyBaseMonthlyNetto,
                baseSurchargeEurNetto: appliedBaseSurchargeEur,
                basePriceEnergyMonthlyNetto: matchedBaseMonthlyNetto,
                basePriceEnergyMonthlyBrutto,
                basePriceEnergyYearlyNetto,
                drittkostenFixedMonthlyNetto,
                totalFixedMonthlyNetto,
                drittkostenFixedYearlyNetto,
                drittkostenWorkYearlyNetto,
                drittkostenYearlyNetto: totalDrittkostenYearlyNetto,
                drittkostenYearlyBrutto: round2(totalDrittkostenYearlyNetto * (1 + taxRate / 100)),

                // --- Annual Totals (€/year) ---
                energyWorkYearlyNetto,
                energyCostYearlyNetto,
                energyCostYearlyBrutto,
                totalYearlyNetto,
                totalYearlyBrutto,

                // --- Monthly Advance Payments / Abschläge (€/month) ---
                abschlagMonthlyNetto,
                abschlagMonthlyBrutto,
                abschlag11MonthlyNetto,
                abschlag11MonthlyBrutto,
                energyOnlyAbschlagMonthlyNetto,
                energyOnlyAbschlagMonthlyBrutto,

                // --- Savings ---
                savingsYearlyNetto,
                savingsYearlyBrutto,
                savingsMonthlyNetto,
                savingsMonthlyBrutto,

                // --- Partner Commission / Provision (per tariff & VP Provisionssatz %) ---
                vpSalesNumber: vpProfile.salesNumber,
                vpSalesChannel: vpProfile.salesChannel,
                vpSalesLevel: vpProfile.salesLevel,
                vpCommissionRatePct,
                marginWorkYearlyNetto,
                marginBaseYearlyNetto,
                marginYearlyNetto,
                provisionYearlyNetto,
                provisionMonthlyNetto,
                provisionTotalContractNetto,

                // --- Backwards-compatible aliases for standard calculator widgets ---
                workingPriceCt: workingPriceEnergyCtNetto,
                workingPriceTotalCt: workingPriceTotalCtNetto,
                basePriceEurMonth: matchedBaseMonthlyNetto,
                monthlyPayment: abschlagMonthlyNetto,
                monthlyPaymentNetto: abschlagMonthlyNetto,
                monthlyPaymentBrutto: abschlagMonthlyBrutto,
                netYearlyEur: totalYearlyNetto,
                grossYearlyEur: totalYearlyBrutto,
                savingsEur: savingsYearlyNetto,

                // --- Detailed cost positions ---
                calculationBreakdown: [
                    {
                        category: 'ENERGY',
                        notice: 'Energie Arbeitspreis',
                        count: consumption,
                        unit: 'CT_K_WH',
                        pricePerUnit: workingPriceEnergyCtNetto,
                        sumNetto: energyWorkYearlyNetto
                    },
                    ...(matchedBaseMonthlyNetto > 0 ? [{
                        category: 'ENERGY_BASE',
                        notice: 'Energie Grundpreis (12 Monate)',
                        count: 12,
                        unit: 'EURO_M',
                        pricePerUnit: matchedBaseMonthlyNetto,
                        sumNetto: basePriceEnergyYearlyNetto
                    }] : []),
                    ...calcItems.map(ci => ({
                        category: ci.category,
                        notice: ci.notice,
                        count: ci.count,
                        unit: ci.unit,
                        pricePerUnit: ci.pricePerUnit,
                        sumNetto: round2(ci.sum)
                    }))
                ]
            });
        }
    }

    return variants;
}

/**
 * Main entry point: Query RLM Portal (`vp.alpha-energie.de/api/graphql`) for live B2B/RLM tariffs,
 * network fees, levies, taxes, and calculate exact monthly Abschläge (Netto & Brutto).
 */
async function calculateRlmTariffs(params = {}) {
    const startTime = Date.now();

    const rawBranch = String(params.branch || params.sparte || 'strom').trim().toLowerCase();
    const isGas = rawBranch === 'gas' || rawBranch === 'erdgas';
    const branch = isGas ? 'gas' : 'strom';
    const productType = isGas ? 'SPECIAL_CONTRACT_GAS' : 'SPECIAL_CONTRACT_ELECTRICITY';

    const consumption = Math.max(1000, parseInt(params.consumption || params.verbrauch || params.jahresverbrauch || 100000, 10) || 100000);

    // Determine measurement type (RLM vs SLP)
    const rawMeasurement = String(params.measurement || params.messung || 'AUTO').trim().toUpperCase();
    const measurement = (rawMeasurement === 'RLM' || rawMeasurement === 'SLP')
        ? rawMeasurement
        : (consumption >= 100000 ? 'RLM' : 'SLP');

    const defaultUsageHours = isGas ? 1600 : 3125;
    let peakLoad = parseInt(params.peakLoad || params.leistungKw || params.jahreshoechstleistung || 0, 10);
    let usageHours = parseInt(params.usageHours || params.benutzungsstunden || 0, 10);
    let autoCalculatedUsageHours = false;
    let autoCalculatedPeakLoad = false;

    if (peakLoad > 0 && !usageHours) {
        usageHours = Math.max(100, Math.min(8760, Math.round(consumption / peakLoad)));
        autoCalculatedUsageHours = true;
    } else if (usageHours > 0 && !peakLoad) {
        peakLoad = Math.max(1, Math.round(consumption / usageHours));
        autoCalculatedPeakLoad = true;
    } else if (!peakLoad && !usageHours) {
        usageHours = defaultUsageHours;
        peakLoad = Math.max(1, Math.round(consumption / usageHours));
        autoCalculatedUsageHours = true;
        autoCalculatedPeakLoad = true;
    }

    // Physical plausibility guard: a year only has 8,760 hours.
    // If consumption / peakLoad > 8760 (e.g. consumption changed to 1,000,000 kWh while peakLoad stayed at 32 kW),
    // vp.alpha-energie.de rejects the network fee calculation (drittkostenCalc = null).
    // Automatically scale peakLoad so usageHours stays physically valid.
    if (peakLoad > 0 && (consumption / peakLoad > 8760 || consumption / peakLoad < 100)) {
        const targetUh = (usageHours >= 100 && usageHours < 8760) ? usageHours : defaultUsageHours;
        peakLoad = Math.max(1, Math.round(consumption / targetUh));
        usageHours = Math.max(100, Math.min(8760, Math.round(consumption / peakLoad)));
        autoCalculatedPeakLoad = true;
        autoCalculatedUsageHours = true;
    }

    const usageHoursExact = peakLoad > 0 ? round2(consumption / peakLoad) : usageHours;
    const usageHoursZone = usageHours >= 2500 ? '>= 2.500 h/a' : '< 2.500 h/a';

    const gridLayer = normalizeGridLayer(params.gridLayer || params.netzebene || params.druckstufe);
    const deliveryStart = normalizeDeliveryStart(params.deliveryStart || params.lieferbeginn);
    const surchargeCt = parseFloat(params.surchargeCt ?? params.aufschlagCt ?? params.provisionCt ?? 0) || 0;
    const baseSurchargeEur = parseFloat(params.baseSurchargeEur ?? params.grundpreisAufschlag ?? 0) || 0;
    const businessSector = String(params.businessSector || params.branche || '23');
    const loadProfile = String(params.loadProfile || params.lastprofil || (isGas ? '119' : '25'));
    const meterType = String(params.meterType || 'MME');
    const gasMeterId = parseInt(params.meterId || (measurement === 'RLM' ? 65 : 5), 10);

    // Optional current costs for savings calculation
    const currentAbschlagInput = parseFloat(params.currentAbschlag || params.bisherigerAbschlag || 0) || 0;
    const currentYearlyInput = parseFloat(params.currentYearlyCost || params.bisherigeJahreskosten || 0) || 0;
    const currentIsBrutto = Boolean(params.currentIsBrutto);
    let currentYearlyNetto = currentYearlyInput > 0 ? currentYearlyInput : (currentAbschlagInput > 0 ? currentAbschlagInput * 12 : 0);
    if (currentIsBrutto && currentYearlyNetto > 0) {
        currentYearlyNetto = round2(currentYearlyNetto / 1.19);
    }
    const currentYearlyBrutto = round2(currentYearlyNetto * 1.19);

    // Step 1: Resolve Delivery Address (cached per PLZ)
    const address = await resolveDeliveryAddress({
        plz: params.plz || params.zip || '44379',
        city: params.city || params.ort,
        street: params.street || params.strasse,
        houseNumber: params.houseNumber || params.hausnummer || '1'
    });

    // Step 2: Helper to query FindProductOffer for a specific (measurement, consumption, deliveryStart) tuple
    const buildOfferPromise = (meas, offerCons, dStart) => {
        const mGasMeterId = parseInt(params.meterId || (meas === 'RLM' ? 65 : 5), 10);
        const sTypes = isGas
            ? {
                SPECIAL_CONTRACT_GAS: {
                    businessSector,
                    loadProfile,
                    gridLayer,
                    measurement: meas,
                    meterId: mGasMeterId,
                    contractOrderType: 'NEW',
                    consumption: offerCons,
                    deliveryStart: dStart,
                    ...(meas === 'RLM' ? { usageHours, peakLoad } : {})
                }
            }
            : {
                SPECIAL_CONTRACT_ELECTRICITY: {
                    businessSector,
                    loadProfile,
                    gridLayer,
                    measurement: meas,
                    meterType,
                    contractOrderType: 'NEW',
                    consumption: offerCons,
                    deliveryStart: dStart,
                    ...(meas === 'RLM' ? { usageHours, peakLoad } : {})
                }
            };

        return vpGraphql(
            'FindProductOffer',
            `query FindProductOffer($orderBaseData: AddOrderBaseData!, $customerType: ProductCustomerTypeEnum!, $searchTypes: findProductOfferSearchProductTypes, $productList: [AddOrderByProductOfferOrderProductInput!]) {
                findProductOffer(orderBaseData: $orderBaseData, customerType: $customerType, searchTypes: $searchTypes, productList: $productList) {
                    productType
                    searchQuery
                    baseSurcharge
                    allProducts {
                        disabled
                        hidden
                        product {
                            id
                            name
                            description
                            productType
                            provider { id name logo }
                            prices
                            pricesWithoutSurcharge
                            surcharges { min max inputMin inputMax priceType surchargeSetting step }
                            periods { termType period periodType activeFrom activeTo endDate }
                            attributes { key value }
                            forms { schemaDefinition }
                        }
                        priceOverview { notice totalNetto totalBrutto prices }
                    }
                }
            }`,
            {
                orderBaseData: {
                    deliveryAddress: {
                        country: address.country,
                        zip: address.zip,
                        city: address.city,
                        street: address.street,
                        houseNumber: address.houseNumber
                    }
                },
                customerType: 'COMMERCIAL',
                searchTypes: sTypes,
                productList: []
            }
        ).then(res => ({ res, meas, dStart }));
    };

    // Build parallel offer queries so EVITA (SLP up to 1,000,000 kWh), E.ON (SLP & RLM), and meistro (SLP & RLM) are all captured
    const offerQueries = [];
    const rlmOfferCons = (!isGas && measurement === 'RLM' && consumption === 100000)
        ? 100001
        : ((!isGas && measurement === 'RLM' && consumption === 1000000)
            ? 1000001
            : ((isGas && measurement === 'RLM' && consumption <= 1000000) ? 1000001 : consumption));

    offerQueries.push(buildOfferPromise(measurement, measurement === 'RLM' ? rlmOfferCons : consumption, deliveryStart));

    // Also include SLP offers when consumption <= 1,000,000 kWh (unless explicitly disabled via includeSlp: false)
    // because EVITA (E.VITA Wochenpreis Strom/Gas) is configured under SLP up to 1,000,000 kWh
    const includeSlpOffers = params.includeSlp !== false && rawMeasurement !== 'RLM_ONLY' && consumption <= 1000000;
    if (measurement === 'RLM' && includeSlpOffers) {
        offerQueries.push(buildOfferPromise('SLP', consumption, deliveryStart));
    }

    // If the caller passed a deliveryStart earlier than the 6-week lead time on the server clock (2026-12-01),
    // also query '2027-01-01' so EVITA & E.ON (which require 6 weeks lead time) are always returned alongside meistro.
    if (deliveryStart < '2026-12-01') {
        offerQueries.push(buildOfferPromise(measurement, measurement === 'RLM' ? rlmOfferCons : consumption, '2027-01-01'));
        if (measurement === 'RLM' && includeSlpOffers) {
            offerQueries.push(buildOfferPromise('SLP', consumption, '2027-01-01'));
        }
    }

    const calcPromise = isGas
        ? vpGraphql(
            'ProductFinder_priceSpecialContractCalculationGas',
            `query ProductFinder_priceSpecialContractCalculationGas($input: ProductFinder_priceSpecialContractCalculationGasInput!) {
                productFinder_priceSpecialContractCalculationGas(input: $input) {
                    calculationItems { pricePerUnit notice count sum unit category }
                    totalOneYearNetto
                    totalOneYearBrutto
                    sumBasePriceNetto
                    sumBasePriceBrutto
                    sumWorkPriceNetto
                    sumWorkPriceBrutto
                    networkList { ... on ProductFinder_GasGrid { operator gridArea subnetwork } }
                    measurementNoSingleEntry
                    measurementPricing { meter meterId price }
                }
            }`,
            {
                input: {
                    consumption,
                    energyPrice: 0,
                    zip: address.zip,
                    city: address.city,
                    gridLayer,
                    measurement,
                    slpProfile: 'COMMERCIAL',
                    usageHours,
                    connectionPower: peakLoad,
                    meterId: gasMeterId
                }
            }
        )
        : vpGraphql(
            'ProductFinder_priceSpecialContractCalculationElectricity',
            `query ProductFinder_priceSpecialContractCalculationElectricity($input: ProductFinder_priceSpecialContractCalculationElectricityInput!) {
                productFinder_priceSpecialContractCalculationElectricity(input: $input) {
                    calculationItems { pricePerUnit notice count sum unit category }
                    totalOneYearNetto
                    totalOneYearBrutto
                    sumBasePriceNetto
                    sumBasePriceBrutto
                    sumWorkPriceNetto
                    sumWorkPriceBrutto
                    networkList { ... on ProductFinder_ElectricGrid { networkId name } }
                    measurementNoSingleEntry
                    measurementPricing { meter meterId price }
                }
            }`,
            {
                input: {
                    consumption,
                    energyPricePt: 0,
                    energyPriceSt: 0,
                    zip: address.zip,
                    city: address.city,
                    gridLayer,
                    measurement,
                    slpProfile: 'COMMERCIAL',
                    usageHours,
                    connectionPower: peakLoad,
                    exceeds30KTwoTimesPerYear: false,
                    hasIms: false,
                    meterType
                }
            }
        );

    const requestedVpNumber = parseInt(
        params.salesNumber || params.vp || params.vpNumber || params.partnerNumber || params.partnerCode || 10011,
        10
    ) || 10011;

    const [offerResults, calcRes, vpCommissionProfile] = await Promise.all([
        Promise.all(offerQueries),
        calcPromise,
        resolveVpCommissionProfile(requestedVpNumber)
    ]);

    const drittkostenCalc = isGas
        ? (calcRes.data && calcRes.data.productFinder_priceSpecialContractCalculationGas) || null
        : (calcRes.data && calcRes.data.productFinder_priceSpecialContractCalculationElectricity) || null;

    const includeAllPortalProducts = Boolean(params.includeAllPortalProducts);
    const seenProductIds = new Set();
    const rawProductEntries = [];

    for (const { res: offerRes, meas: queryMeas, dStart: queryDStart } of offerResults) {
        const offerBlock = (offerRes.data && Array.isArray(offerRes.data.findProductOffer))
            ? offerRes.data.findProductOffer.find(b => b.productType === productType) || offerRes.data.findProductOffer[0]
            : null;
        const list = (offerBlock && Array.isArray(offerBlock.allProducts))
            ? offerBlock.allProducts.filter(ap => ap && ap.product && !ap.hidden && (includeAllPortalProducts || !ap.disabled))
            : [];
        for (const ap of list) {
            const pid = Number(ap.product.id);
            if (!seenProductIds.has(pid)) {
                seenProductIds.add(pid);
                rawProductEntries.push({ ap, queryMeas, queryDStart });
            }
        }
    }

    const tariffs = [];
    const productsSummary = [];

    for (const { ap, queryMeas, queryDStart } of rawProductEntries) {
        const variants = buildTariffVariantsForProduct({
            product: ap.product,
            branch,
            measurement: queryMeas,
            consumption,
            peakLoad,
            usageHours,
            gridLayer,
            deliveryStart: queryDStart,
            surchargeCt,
            baseSurchargeEur,
            drittkostenCalc,
            currentYearlyNetto,
            currentYearlyBrutto,
            vpCommissionProfile
        });

        tariffs.push(...variants);
        productsSummary.push({
            productId: ap.product.id,
            productName: ap.product.name,
            providerName: ap.product.provider ? ap.product.provider.name : null,
            measurement: variants[0] ? variants[0].measurement : queryMeas,
            variantsCount: variants.length,
            variants
        });
    }

    // Sort tariffs by contractDurationMonths ascending, then workingPriceEnergyCtNetto ascending
    tariffs.sort((a, b) => {
        if (a.contractDurationMonths !== b.contractDurationMonths) {
            return a.contractDurationMonths - b.contractDurationMonths;
        }
        return a.workingPriceEnergyCtNetto - b.workingPriceEnergyCtNetto;
    });

    // Mark the lowest-price tariff as bestseller/recommended
    if (tariffs.length > 0) {
        const cheapest = [...tariffs].sort((a, b) => a.totalYearlyNetto - b.totalYearlyNetto)[0];
        for (const t of tariffs) {
            t.isRecommended = (t.id === cheapest.id);
            t.isBestseller = (t.id === cheapest.id);
        }
    }

    const maxSavingsNetto = tariffs.length > 0 ? Math.max(...tariffs.map(t => t.savingsYearlyNetto), 0) : 0;
    const maxSavingsBrutto = tariffs.length > 0 ? Math.max(...tariffs.map(t => t.savingsYearlyBrutto), 0) : 0;

    return {
        success: true,
        source: 'vp.alpha-energie.de (Live RLM/B2B GraphQL)',
        responseTimeMs: Date.now() - startTime,
        consumption,
        verbrauch: consumption,
        measurement,
        peakLoad: measurement === 'RLM' ? peakLoad : null,
        leistungKw: measurement === 'RLM' ? peakLoad : null,
        jahreshoechstleistung: measurement === 'RLM' ? peakLoad : null,
        usageHours: measurement === 'RLM' ? usageHours : null,
        benutzungsstunden: measurement === 'RLM' ? usageHours : null,
        usageHoursExact: measurement === 'RLM' ? usageHoursExact : null,
        usageHoursZone: measurement === 'RLM' ? usageHoursZone : null,
        autoCalculatedUsageHours: measurement === 'RLM' ? autoCalculatedUsageHours : false,
        autoCalculatedPeakLoad: measurement === 'RLM' ? autoCalculatedPeakLoad : false,
        query: {
            branch,
            productType,
            measurement,
            consumption,
            verbrauch: consumption,
            peakLoad: measurement === 'RLM' ? peakLoad : null,
            leistungKw: measurement === 'RLM' ? peakLoad : null,
            usageHours: measurement === 'RLM' ? usageHours : null,
            benutzungsstunden: measurement === 'RLM' ? usageHours : null,
            usageHoursExact: measurement === 'RLM' ? usageHoursExact : null,
            usageHoursZone: measurement === 'RLM' ? usageHoursZone : null,
            autoCalculatedUsageHours: measurement === 'RLM' ? autoCalculatedUsageHours : false,
            autoCalculatedPeakLoad: measurement === 'RLM' ? autoCalculatedPeakLoad : false,
            gridLayer,
            deliveryStart,
            surchargeCt,
            businessSector,
            loadProfile,
            address: {
                zip: address.zip,
                city: address.city,
                street: address.street,
                houseNumber: address.houseNumber
            }
        },
        drittkostenOverview: drittkostenCalc ? {
            totalOneYearNetto: round2(drittkostenCalc.totalOneYearNetto),
            totalOneYearBrutto: round2(drittkostenCalc.totalOneYearBrutto),
            sumBasePriceNetto: round2(drittkostenCalc.sumBasePriceNetto),
            sumWorkPriceCtNetto: round4((Number(drittkostenCalc.sumWorkPriceNetto) || 0) * (isGas ? 1 : 100)),
            items: (drittkostenCalc.calculationItems || []).map(ci => ({
                notice: ci.notice,
                category: ci.category,
                pricePerUnit: ci.pricePerUnit,
                count: ci.count,
                unit: ci.unit,
                sumNetto: round2(ci.sum)
            }))
        } : null,
        maxSavings: maxSavingsNetto,
        maxSavingsNetto,
        maxSavingsBrutto,
        vpCommissionProfile,
        tariffsCount: tariffs.length,
        tariffs,
        products: productsSummary
    };
}

const FALLBACK_BUSINESS_SECTORS = [
    { id: '23', name: 'Handel, Büro & Dienstleistung' },
    { id: '14', name: 'Produktion & Verarbeitendes Gewerbe' },
    { id: '9', name: 'Gastronomie & Hotellerie' },
    { id: '11', name: 'Immobilien & Wohnungswirtschaft' },
    { id: '7', name: 'Bauwirtschaft & Handwerk' },
    { id: '18', name: 'Logistik & Transport' },
    { id: '10', name: 'Gesundheits- & Sozialwesen' }
];

const FALLBACK_LOAD_PROFILES_STROM = [
    { id: '25', name: 'G0 – Gewerbe allgemein', code: 'G0', description: 'Gewerbe allgemein' },
    { id: '26', name: 'G1 – Gewerbe werktags 8–18 Uhr', code: 'G1', description: 'Gewerbe werktags 8–18 Uhr' },
    { id: '27', name: 'G2 – Gewerbe mit starkem Abendverbrauch', code: 'G2', description: 'Stark bis spät abends' },
    { id: '28', name: 'G3 – Gewerbe durchlaufend', code: 'G3', description: 'Durchlaufender Betrieb' },
    { id: '29', name: 'G4 – Laden / Friseur', code: 'G4', description: 'Einzelhandel / Ladenlokal' },
    { id: '30', name: 'G5 – Bäckerei mit Backstube', code: 'G5', description: 'Bäckerei' },
    { id: '31', name: 'G6 – Wochenendbetrieb', code: 'G6', description: 'Schwerpunkt Wochenende' }
];

const FALLBACK_LOAD_PROFILES_GAS = [
    { id: '119', name: 'GHD – Gewerbe, Handel, Dienstleistung', code: 'GHD', description: 'Standard-Gewerbeprofil Gas' },
    { id: '120', name: 'KO – Gebietskörperschaften & Kreditinstitute', code: 'KO', description: 'Büro & Verwaltung' },
    { id: '121', name: 'MFH – Mehrfamilienhaus / Wohnungswirtschaft', code: 'MFH', description: 'Heizgas Immobilien' }
];

const FALLBACK_GAS_METERS = [
    { meterId: 65, meterType: 'RLM', meterSize: 'G65', meterAttribute: 'Standard', pressureLevel: 'LOW' },
    { meterId: 100, meterType: 'RLM', meterSize: 'G100', meterAttribute: 'Standard', pressureLevel: 'LOW' },
    { meterId: 160, meterType: 'RLM', meterSize: 'G160', meterAttribute: 'Standard', pressureLevel: 'MEDIUM' },
    { meterId: 5, meterType: 'SLP', meterSize: 'G16', meterAttribute: 'Standard', pressureLevel: 'LOW' }
];

/**
 * Fetch available business sectors, load profiles, and gas meters for external B2B calculator dropdowns.
 */
async function getRlmPortalOptions(branch = 'strom') {
    const isGas = String(branch).toLowerCase() === 'gas';
    const productType = isGas ? 'SPECIAL_CONTRACT_GAS' : 'SPECIAL_CONTRACT_ELECTRICITY';
    const cacheKey = productType;

    if (optionsCache.has(cacheKey)) {
        return optionsCache.get(cacheKey);
    }

    let businessSectors = null;
    let loadProfiles = null;
    let gasMeters = null;
    let usedFallback = false;

    try {
        const [sectorsRes, profilesRes, metersRes] = await Promise.all([
            vpGraphql(
                'GetBusinessSectorsList',
                `query GetBusinessSectorsList($productType: [ProductFinder_ProductTypeEnum!]) {
                    productFinder_getBusinessSectorsList(productType: $productType) { id name }
                }`,
                { productType: [productType] }
            ),
            vpGraphql(
                'GetLoadProfiles',
                `query GetLoadProfiles($productType: ProductFinder_ProductTypeEnum) {
                    productFinder_getLoadProfiles(productType: $productType) { id name code description }
                }`,
                { productType }
            ),
            isGas
                ? vpGraphql(
                    'ProductFinder_metersGas',
                    `query ProductFinder_metersGas($input: ProductFinder_metersGasInput!) {
                        productFinder_metersGas(input: $input) { meterId meterType meterSize meterAttribute pressureLevel }
                    }`,
                    { input: { measurement: 'RLM' } }
                )
                : Promise.resolve({ data: {} })
        ]);

        businessSectors = (sectorsRes.data && sectorsRes.data.productFinder_getBusinessSectorsList) || null;
        loadProfiles = (profilesRes.data && profilesRes.data.productFinder_getLoadProfiles) || null;
        gasMeters = (metersRes.data && metersRes.data.productFinder_metersGas) || [];
    } catch (err) {
        usedFallback = true;
        console.warn('[RLM-API] getRlmPortalOptions live fetch failed, returning static fallback options:', err.message);
    }

    const result = {
        success: true,
        branch: isGas ? 'gas' : 'strom',
        productType,
        gridLayers: isGas
            ? [
                { value: 'LOW', label: 'Niederdruck (ND)' },
                { value: 'MEDIUM', label: 'Mitteldruck (MD)' },
                { value: 'HIGH', label: 'Hochdruck (HD)' }
            ]
            : [
                { value: 'LOW', label: 'Niederspannung (NS)' },
                { value: 'MEDIUM', label: 'Mittelspannung (MS)' },
                { value: 'HIGH', label: 'Hochspannung (HS)' }
            ],
        measurements: [
            { value: 'RLM', label: 'RLM (Registrierende Leistungsmessung ab 100.000 kWh)' },
            { value: 'SLP', label: 'SLP (Standardlastprofil Gewerbe bis 100.000 kWh)' }
        ],
        businessSectors: Array.isArray(businessSectors) && businessSectors.length > 0 ? businessSectors : FALLBACK_BUSINESS_SECTORS,
        loadProfiles: Array.isArray(loadProfiles) && loadProfiles.length > 0 ? loadProfiles : (isGas ? FALLBACK_LOAD_PROFILES_GAS : FALLBACK_LOAD_PROFILES_STROM),
        gasMeters: Array.isArray(gasMeters) && gasMeters.length > 0 ? gasMeters : (isGas ? FALLBACK_GAS_METERS : [])
    };

    if (!usedFallback) {
        optionsCache.set(cacheKey, result);
    }
    return result;
}

/**
 * Helper: Map German/short grid layer values to GraphQL GridLayer enum.
 */
function toGraphqlGridLayer(gridLayer) {
    const raw = String(gridLayer || 'LOW').trim().toUpperCase();
    const validEnums = [
        'LOW',
        'MEDIUM',
        'HIGH',
        'MEDIUM_WITH_CONVERSION_TO_LOW',
        'MEDIUM_WITH_MEASUREMENT_IN_LOW',
        'HIGH_WITH_CONVERSION_TO_MEDIUM',
        'HIGH_WITH_MEASUREMENT_IN_MEDIUM'
    ];
    if (validEnums.includes(raw)) return raw;
    if (raw.includes('MITTEL') || raw === 'MS' || raw === 'MD') return 'MEDIUM';
    if (raw.includes('HOCH') || raw === 'HS' || raw === 'HD') return 'HIGH';
    return 'LOW';
}

/**
 * Helper: Map salutation to GraphQL SalutationEnum ('MAN' | 'WOMAN' | 'DIVERSE')
 * and human-readable German salutation ('Herr' | 'Frau' | 'Divers').
 */
function normalizeSalutationPair(salutation) {
    const raw = String(salutation || 'Herr').trim().toUpperCase();
    if (raw === 'FRAU' || raw === 'WOMAN' || raw === 'FEMALE' || raw === 'MRS' || raw === 'MS') {
        return { gql: 'WOMAN', de: 'Frau' };
    }
    if (raw === 'DIVERS' || raw === 'DIVERSE') {
        return { gql: 'DIVERSE', de: 'Divers' };
    }
    return { gql: 'MAN', de: 'Herr' };
}

/**
 * Extracts the 100% untouched original Blanko-PDF template from a portal-generated
 * `Auftragsformular.pdf` buffer.
 *
 * Technical background:
 * The portal generates `Auftragsformular.pdf` by taking the supplier's original Blanko-PDF
 * (which ends at the first `%%EOF` marker and contains all interactive AcroForm fields empty)
 * and appending a PDF incremental update (`/Prev ...` ending at the second `%%EOF`) that stamps
 * the filled field values. Slicing at the first `%%EOF` yields the byte-exact original Blanko-PDF!
 */
function extractPureBlankoPdfBuffer(pdfBuffer) {
    if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) return pdfBuffer;
    const eofMarker = Buffer.from('%%EOF');
    const firstEofIdx = pdfBuffer.indexOf(eofMarker);
    if (firstEofIdx === -1) return pdfBuffer;
    const secondEofIdx = pdfBuffer.indexOf(eofMarker, firstEofIdx + eofMarker.length);
    if (secondEofIdx === -1) {
        // Only one %%EOF present — already a base PDF
        return pdfBuffer;
    }
    // Include trailing newline (\r\n or \n) after the first %%EOF
    let endOffset = firstEofIdx + eofMarker.length;
    if (pdfBuffer[endOffset] === 0x0d) endOffset++;
    if (pdfBuffer[endOffset] === 0x0a) endOffset++;
    return pdfBuffer.subarray(0, endOffset);
}

/**
 * Extracts all interactive AcroForm field names (`/T (...)`) from a PDF buffer.
 */
function extractPdfFormFieldNames(pdfBuffer) {
    if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) return [];
    const baseBuf = extractPureBlankoPdfBuffer(pdfBuffer);
    const latin1 = baseBuf.toString('latin1');
    const matches = [...latin1.matchAll(/\/T\s*\(([^)]+)\)/g)].map(m => m[1]);
    return [...new Set(matches)];
}

/**
 * Downloads a generated PDF binary from a portal signedUrl using active session cookies.
 */
async function fetchPdfBufferFromSignedUrl(signedUrl) {
    const cookies = await ensureFreshVpSession();
    const url = signedUrl && signedUrl.startsWith('http')
        ? signedUrl
        : `https://vp.alpha-energie.de${signedUrl || ''}`;
    const res = await fetch(url, {
        headers: {
            'Cookie': buildCookieHeader(cookies),
            'Referer': 'https://vp.alpha-energie.de/portal/product-finder-next?embed=true'
        }
    });
    if (!res.ok) {
        throw new Error(`PDF download failed with HTTP ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Builds the validated GraphQL order payload for `UpdateOrderByProductOffer` and `AddOrderByProductOffer`.
 */
async function buildValidatedGraphqlOrderPayload(params = {}, matchedTariff = null) {
    const isGas = String(params.branch || params.sparte || (matchedTariff && matchedTariff.branch) || 'strom').toLowerCase() === 'gas';
    const productType = isGas ? 'SPECIAL_CONTRACT_GAS' : 'SPECIAL_CONTRACT_ELECTRICITY';
    const measurement = String(params.measurement || params.messung || (matchedTariff && matchedTariff.measurement) || 'RLM').toUpperCase() === 'SLP' ? 'SLP' : 'RLM';
    const consumption = parseInt(params.consumption || params.verbrauch || params.jahresverbrauch || 100000, 10) || 100000;
    const peakLoad = measurement === 'RLM' ? (parseInt(params.peakLoad || params.leistungKw || params.jahreshoechstleistung || Math.max(1, Math.round(consumption / 2500)), 10) || 40) : null;
    const usageHours = measurement === 'RLM'
        ? (parseInt(params.usageHours || params.benutzungsstunden, 10) || Math.round(consumption / peakLoad))
        : null;
    const gridLayer = toGraphqlGridLayer(params.gridLayer || params.netzebene || params.druckstufe || (matchedTariff && matchedTariff.gridLayer) || 'LOW');
    const deliveryStart = String(params.deliveryStart || params.lieferbeginn || (matchedTariff && matchedTariff.deliveryFrom) || '2026-05-01').slice(0, 10);
    const productId = parseInt(params.productId || (matchedTariff && matchedTariff.productId) || (isGas ? 1574 : 1586), 10) || (isGas ? 1574 : 1586);
    const surchargeCt = parseFloat(params.surchargeCt ?? params.aufschlagCt ?? (matchedTariff && matchedTariff.surchargeCtNetto) ?? 0) || 0;
    const baseSurchargeEur = parseFloat(params.baseSurchargeEur ?? params.grundpreisAufschlag ?? 0) || 0;
    const businessSectorInt = parseInt(params.businessSector || params.brancheId || (isGas ? 35 : 6), 10) || (isGas ? 35 : 6);
    const businessSectorStr = String(businessSectorInt);
    const businessSectorName = String(params.businessSectorName || 'Gewerbe allgemein');
    const loadProfile = String(params.loadProfile || params.lastprofilId || (isGas ? '6' : '69'));
    const loadProfileName = String(params.loadProfileName || (isGas ? 'Standard' : 'NPR'));
    const salesNumber = parseInt(params.salesNumber || params.vp || params.partnerNumber || params.partnerCode || 10011, 10) || 10011;

    const address = await resolveDeliveryAddress({
        plz: params.plz || params.zip || '07745',
        city: params.city || params.ort,
        street: params.street || params.strasse,
        houseNumber: params.houseNr || params.houseNumber || params.hausnummer || '22'
    });

    const rawCompany = String(params.companyName || params.firma || params.unternehmen || '').trim();
    const companyName = rawCompany.length >= 2 ? rawCompany : 'Musterunternehmen GmbH';
    const legalForm = String(params.legalForm || params.rechtsform || 'GmbH').trim();
    const companyRegistrationNumber = String(params.commercialRegisterNumber || params.companyRegistrationNumber || params.hrb || params.handelsregister || '').trim();
    const placeOfJurisdiction = String(params.registerCourt || params.placeOfJurisdiction || params.amtsgericht || '').trim();
    const salutationPair = normalizeSalutationPair(params.salutation || params.anrede || 'Herr');
    const academicTitle = String(params.academicTitle || params.titel || '').trim();
    const rawFirst = String(params.firstName || params.vorname || '').trim();
    const firstName = rawFirst.length >= 2 ? rawFirst : 'Max';
    const rawLast = String(params.lastName || params.nachname || '').trim();
    const lastName = rawLast.length >= 2 ? rawLast : 'Mustermann';
    const dateOfBirth = String(params.dateOfBirth || params.birthDate || params.geburtsdatum || '1980-01-01').slice(0, 10);
    const email = String(params.email || params.mail || 'b2b@alpha-energie.de').trim();
    const phone = String(params.phone || params.telefon || '03641123456').trim();
    const rawMeter = String(params.meterNumber || params.zaehlernummer || '').trim();
    const meterNumber = rawMeter.length >= 3 ? rawMeter : '1ISK0012345678';
    const rawMalo = String(params.maloId || params.marktlokationsId || '').replace(/\s+/g, '').trim();
    const contractDurationMonths = parseInt(
        params.contractDurationMonths || params.laufzeit || (matchedTariff && matchedTariff.contractDurationMonths) || 12,
        10
    ) || 12;
    const contractOrderType = params.contractOrderType === 'NEW' ? 'CHANGE_PROVIDER' : (params.contractOrderType || 'CHANGE_PROVIDER');

    const rawSigningMethod = String(params.signingMethod || '').toUpperCase().trim();
    const explicitOrderMode =
        params.isOffer === false ||
        String(params.mode || '').toLowerCase() === 'order' ||
        ['DIGITAL_REMOTE', 'DIGITAL_LOCAL', 'PAPER'].includes(rawSigningMethod);
    const isOffer = !explicitOrderMode && (params.isOffer !== false || rawSigningMethod === 'OFFER');

    if (!isOffer && rawMalo.length > 0 && !isValidMaloId(rawMalo)) {
        throw new Error('Die eingegebene Marktlokations-ID (MaLo-ID) ist ungültig (11 Ziffern inkl. gültiger Prüfziffer erforderlich). Bitte prüfen oder leer lassen.');
    }
    const maloId = isValidMaloId(rawMalo) ? rawMalo : null;

    const hasInlineSignature = Boolean(params.signatureDataUrl && String(params.signatureDataUrl).trim().startsWith('data:image/'));
    const signingMethod = isOffer
        ? 'OFFER'
        : (rawSigningMethod === 'DIGITAL_LOCAL' || hasInlineSignature
            ? 'DIGITAL_LOCAL'
            : (rawSigningMethod === 'PAPER' ? 'PAPER' : 'DIGITAL_REMOTE'));
    const confirmationLinkDeliveryMethod =
        String(params.confirmationLinkDeliveryMethod || params.deliveryMethod || 'EMAIL').toUpperCase().trim() === 'SMS'
            ? 'SMS'
            : 'EMAIL';
    const isDraft = params.isDraft !== undefined ? Boolean(params.isDraft) : (signingMethod !== 'OFFER');
    const customerMessage = String(params.notes || params.bemerkung || params.customerMessage || '').trim();

    const billingObj = params.billingAddress && typeof params.billingAddress === 'object' ? params.billingAddress : {};
    const billingDifferent = Boolean(
        params.billingAddressDifferent ||
        params.abweichendeRechnungsadresse ||
        billingObj.street ||
        billingObj.plz ||
        params.billingStreet ||
        params.billingPlz
    );
    const billingAddress = billingDifferent
        ? {
            country: 'DE',
            zip: String(billingObj.plz || billingObj.zip || params.billingPlz || params.billingZip || address.zip).trim(),
            city: String(billingObj.city || billingObj.ort || params.billingCity || address.city).trim(),
            street: String(billingObj.street || billingObj.strasse || params.billingStreet || address.street).trim(),
            houseNumber: String(billingObj.houseNumber || billingObj.houseNr || params.billingHouseNumber || params.billingHouseNr || address.houseNumber).trim()
        }
        : null;

    const cleanIban = String(params.iban || '').replace(/\s+/g, '').toUpperCase().trim();
    const hasValidIban = cleanIban.length >= 15 && cleanIban !== 'AUF-ANFRAGE';
    const accountHolder = String(params.accountHolder || params.kontoinhaber || '').trim();
    const bankAccountHolderIsDifferent = Boolean(accountHolder && accountHolder.toLowerCase() !== companyName.toLowerCase());

    const tariffAllowedPayments = Array.isArray(matchedTariff && matchedTariff.allowedPaymentTypes)
        ? matchedTariff.allowedPaymentTypes
        : ((productId === 1135 || productId === 1136) ? ['DEBIT'] : ['INVOICE', 'DEBIT']);
    const tariffIbanOnly = Boolean((matchedTariff && matchedTariff.ibanOnly) || (tariffAllowedPayments.length === 1 && tariffAllowedPayments[0] === 'DEBIT'));
    const rawRequestedPayment = String(params.paymentType || '').toUpperCase().trim();
    const requestedPaymentType = tariffIbanOnly
        ? 'DEBIT'
        : (rawRequestedPayment === 'DEBIT' || rawRequestedPayment === 'DEBIT_CHARGE'
            ? 'DEBIT'
            : (rawRequestedPayment === 'INVOICE' ? 'INVOICE' : (hasValidIban ? 'DEBIT' : 'INVOICE')));

    if (!isOffer && requestedPaymentType === 'DEBIT' && !hasValidIban) {
        throw new Error('Für diesen Tarif ist ein gültiges SEPA-Lastschriftmandat (IBAN) erforderlich. Bitte geben Sie eine gültige IBAN ein.');
    }

    const contactMediumList = [{ contactType: 'EMAIL', contactValue: email }];
    if (phone) {
        contactMediumList.push({ contactType: 'PHONE', contactValue: phone });
    }

    const previousProvider = contractOrderType === 'CHANGE_PROVIDER'
        ? await resolvePreviousProviderObject(
            productId,
            params.currentProvider || params.vorversorger || params.previousProviderName || '',
            address.city
        )
        : null;

    const contractOrderData = {
        meterNumber,
        ...(maloId ? { marketLocationId: maloId } : {}),
        deliveryDate: deliveryStart,
        deliveryASAP: Boolean(params.deliveryASAP),
        contractDuration: contractDurationMonths,
        readableContractDuration: `${contractDurationMonths} Monate`,
        ...(previousProvider ? { previousProvider } : {}),
        loadProfile,
        loadProfileName,
        exceeds30KTwoTimesPerYear: false,
        hasIms: false,
        networkProvider: address.networkProvider || {
            id: 375,
            name: 'Stadtwerke Energie Jena-Pößneck GmbH'
        },
        deliveryStart,
        gridLayer,
        measurement,
        measurementMethod: measurement,
        businessSector: businessSectorStr,
        businessSectorName,
        ...(measurement === 'RLM' ? { peakLoad, usageHours } : {})
    };

    const customerConfirmation = signingMethod === 'DIGITAL_REMOTE'
        ? {
            signingMethod: 'DIGITAL_REMOTE',
            signingMethod_DIGITAL_REMOTE: {
                confirmationLinkDeliveryMethod
            }
        }
        : signingMethod === 'DIGITAL_LOCAL'
            ? {
                signingMethod: 'DIGITAL_LOCAL',
                signingMethod_DIGITAL_LOCAL: {}
            }
            : signingMethod === 'PAPER'
                ? { signingMethod: 'PAPER' }
                : {
                    signingMethod: 'OFFER',
                    signingMethod_OFFER: {
                        confirmationLinkDeliveryMethod: 'EMAIL'
                    }
                };

    const validatedSalutation = salutationPair.de === 'Frau' ? 'Frau' : 'Herr';

    const orderBase = {
        salesNumber,
        orderBaseData: {
            contractHolder: {
                personType: 'COMMERCIAL',
                contactPersonIsDifferent: false,
                personType_COMMERCIAL: {
                    companyName,
                    legalForm,
                    ...(companyRegistrationNumber ? { companyRegistrationNumber } : {}),
                    ...(placeOfJurisdiction ? { placeOfJurisdiction } : {})
                }
            },
            deliveryAddress: {
                country: 'DE',
                zip: address.zip,
                city: address.city,
                street: address.street,
                houseNumber: address.houseNumber
            },
            ...(billingAddress ? { billingAddress } : {}),
            contactPersonList: [
                {
                    salutation: validatedSalutation,
                    firstName: firstName.length >= 2 ? firstName : 'Max',
                    lastName: lastName.length >= 2 ? lastName : 'Mustermann',
                    academicTitle,
                    dateOfBirth
                }
            ],
            contactMediumList,
            productPayment: (requestedPaymentType === 'DEBIT' && hasValidIban)
                ? {
                    paymentType: 'DEBIT_CHARGE',
                    paymentType_DEBIT_CHARGE: {
                        bankAccount: {
                            iban: cleanIban,
                            ...(accountHolder ? { owner: accountHolder } : {})
                        },
                        bankAccountHolderIsDifferent
                    }
                }
                : {
                    paymentType: 'INVOICE',
                    paymentType_INVOICE: {}
                },
            customerConfirmation,
            onlyOnlineCustomerCommunication: false
        },
        productTypeFilter: [
            {
                type: productType,
                consumption,
                loadProfile,
                deliveryStart,
                businessSector: businessSectorInt,
                measurement
            }
        ],
        productList: [
            {
                isDraft,
                isActionRequired: false,
                isOffer,
                productFinderId: productId,
                selected: [],
                orderBaseData: {
                    signatureList: [],
                    advertisingConsent: {},
                    couponCodes: []
                },
                orderProductData: {
                    [`productType_${productType}`]: {
                        consumption,
                        contractOrderType,
                        ...(customerMessage ? { customerMessage } : {}),
                        additionalData: { pairList: [] },
                        surcharge: [
                            { priceType: 'WORK_PRICE', surcharge: surchargeCt },
                            { priceType: 'BASE_PRICE', surcharge: baseSurchargeEur }
                        ],
                        [`contractOrderType_${contractOrderType}`]: contractOrderData
                    }
                },
                optionList: []
            }
        ]
    };

    return {
        orderBase,
        address,
        meta: {
            isGas,
            productType,
            measurement,
            consumption,
            peakLoad,
            usageHours,
            gridLayer,
            deliveryStart,
            contractDurationMonths,
            productId,
            surchargeCt,
            businessSectorStr,
            loadProfile,
            loadProfileName,
            salesNumber,
            companyName,
            legalForm,
            salutationDe: validatedSalutation,
            firstName,
            lastName,
            dateOfBirth,
            email,
            phone,
            meterNumber,
            maloId: maloId || '',
            contractOrderType,
            isOffer,
            isDraft,
            signingMethod,
            confirmationLinkDeliveryMethod,
            requestedPaymentType,
            previousProvider
        }
    };
}

/**
 * Updates an existing Offer/Draft slot in the portal (default `orderId: "172"`) via `UpdateOrderByProductOffer`
 * so the portal generates the exact `Angebot.pdf` and `Auftragsformular.pdf` for the given tariff & customer data.
 */
async function syncVpOrderForPdfGeneration(params = {}, matchedTariff = null) {
    const targetOrderId = String(params.orderId || '172');
    const built = await buildValidatedGraphqlOrderPayload(params, matchedTariff);
    const gqlRes = await vpGraphql(
        'UpdateOrderByProductOffer',
        `mutation UpdateOrderByProductOffer($order: UpdateOrderByProductOfferOrderInput!, $skipEventSubscription: Boolean) {
            updateOrderByProductOffer(order: $order, skipEventSubscription: $skipEventSubscription)
        }`,
        {
            order: {
                orderId: targetOrderId,
                ...built.orderBase,
                prepareForSigning: false
            },
            skipEventSubscription: false
        }
    );
    const updatedOrder = gqlRes.data && gqlRes.data.updateOrderByProductOffer;
    const error = gqlRes.errors && gqlRes.errors.length > 0 ? gqlRes.errors[0].message : null;
    return {
        orderId: (updatedOrder && updatedOrder.id) ? String(updatedOrder.id) : targetOrderId,
        orderNumber: updatedOrder && updatedOrder.orderNumber ? updatedOrder.orderNumber : null,
        updatedOrder,
        error,
        built
    };
}

/**
 * Generate official RLM Portal PDF documents ("Angebot.pdf" & "Auftragsformular.pdf")
 * via `UpdateOrderByProductOffer` + `InvokeWorkflowAction(actionKey: "get-all-order-files")`.
 */
async function generateVpOrderDocuments(params = {}, matchedTariff = null) {
    let targetOrderId = String(params.orderId || '172');
    let meta = null;
    let address = null;

    if (params.syncOrderFirst !== false) {
        try {
            const syncRes = await syncVpOrderForPdfGeneration({ ...params, orderId: targetOrderId }, matchedTariff);
            if (syncRes && syncRes.orderId) targetOrderId = syncRes.orderId;
            if (syncRes && syncRes.built) {
                meta = syncRes.built.meta;
                address = syncRes.built.address;
            }
        } catch (syncErr) {
            console.warn('[RLM-API] syncVpOrderForPdfGeneration warning:', syncErr.message);
        }
    }

    if (!meta) {
        const built = await buildValidatedGraphqlOrderPayload(params, matchedTariff);
        meta = built.meta;
        address = built.address;
    }

    const input = {
        productId: Number(params.productId || meta.productId) || (meta.isGas ? 1574 : 1586),
        orderId: String(targetOrderId || '172'),
        salesNumber: Number(params.salesNumber || params.vp || params.partnerNumber || params.partnerCode || meta.salesNumber) || 10011,
        productType: meta.productType,
        productTypeFilter: {
            businessSector: String(params.workflowBusinessSector || (meta.isGas ? '35' : '36')),
            consumption: Number(meta.consumption) || 100000,
            contractOrderType: 'NEW',
            deliveryStart: String(meta.deliveryStart || '2026-05-01').slice(0, 10),
            loadProfile: String(meta.isGas ? '6' : '25'),
            loadProfileName: 'Standard',
            meterId: '',
            meterSize: '',
            meterTariff: '',
            meterType: ''
        },
        contractDate: new Date().toISOString().slice(0, 10),
        billingAddress: {
            zip: String(address.zip || '07745'),
            city: String(address.city || 'Jena'),
            street: String(address.street || 'Göschwitzer Str.'),
            houseNumber: String(address.houseNumber || '22'),
            receiver: {
                company: meta.companyName,
                salutation: meta.salutationDe,
                firstName: meta.firstName,
                lastName: meta.lastName,
                academicTitle: ''
            }
        },
        deliveryAddress: {
            zip: String(address.zip || '07745'),
            city: String(address.city || 'Jena'),
            street: String(address.street || 'Göschwitzer Str.'),
            houseNumber: String(address.houseNumber || '22'),
            streetAndHouseNumber: `${address.street || 'Göschwitzer Str.'} ${address.houseNumber || '22'}`.trim(),
            zipAndCity: `${address.zip || '07745'} ${address.city || 'Jena'}`.trim()
        },
        company: {
            legalForm: meta.legalForm,
            companyName: meta.companyName
        },
        contactPerson: {
            salutation: meta.salutationDe,
            firstName: meta.firstName,
            lastName: meta.lastName,
            academicTitle: '',
            fullName: `${meta.firstName} ${meta.lastName}`.trim(),
            dateOfBirth: ''
        },
        orderProductData: {
            meterNumber: '',
            contractEnd: '',
            marketLocationId: '',
            currentContractId: '',
            ownerType: '',
            reasonType: ''
        }
    };

    const startRes = await vpGraphql(
        'InvokeWorkflowAction',
        `mutation InvokeWorkflowAction($actionKey: String!, $input: JSON, $mode: WorkflowActionInvocationMode) {
            invokeWorkflowAction(actionKey: $actionKey, input: $input, mode: $mode) {
                accepted
                executionId
                status
                pollAfterMs
                resultAvailable
                pollToken
            }
        }`,
        { actionKey: 'get-all-order-files', input }
    );

    const wf = startRes.data && startRes.data.invokeWorkflowAction;
    if (!wf || (!wf.executionId && !wf.pollToken)) {
        return [];
    }

    const pollDelay = Math.max(Number(wf.pollAfterMs) || 650, 450);
    for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise(r => setTimeout(r, pollDelay));
        const pollRes = await vpGraphql(
            'WorkflowActionStatus',
            `query WorkflowActionStatus($pollToken: String, $executionId: ID) {
                workflowActionStatus(pollToken: $pollToken, executionId: $executionId) {
                    executionId
                    status
                    errorMessage
                    result
                    pollAfterMs
                }
            }`,
            { pollToken: wf.pollToken || null, executionId: wf.executionId || null }
        );
        const st = pollRes.data && pollRes.data.workflowActionStatus;
        if (!st) continue;
        if (st.status === 'COMPLETED' && st.result && Array.isArray(st.result.uploadedFiles)) {
            return st.result.uploadedFiles.map(f => {
                const rawName = f.originalFilename || 'Dokument';
                const filename = rawName.endsWith('.pdf') ? rawName : `${rawName}.pdf`;
                const isAngebot = rawName.toLowerCase().includes('angebot');
                const signedUrl = f.signedUrl && f.signedUrl.startsWith('http')
                    ? f.signedUrl
                    : `https://vp.alpha-energie.de${f.signedUrl || ''}`;
                return {
                    id: f.objectId,
                    name: rawName,
                    filename,
                    type: isAngebot ? 'angebot' : 'auftragsformular',
                    productId: meta.productId,
                    orderId: targetOrderId,
                    signedUrl,
                    url: signedUrl,
                    downloadUrl: signedUrl,
                    expiresInSeconds: f.expiresIn || 3600
                };
            });
        }
        if (st.status === 'FAILED' || st.status === 'CANCELLED' || st.errorMessage) {
            break;
        }
    }
    return [];
}

// Cache & Disk Persistence for Blanko-PDF metadata & buffers by productId
const blankoPdfCache = new Map();
const BLANKO_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const BLANKO_TEMPLATES_DIR = path.join(__dirname, '..', 'data', 'blanko_templates');

function loadDiskBlankoBuffers(pid) {
    try {
        const baseBlankoPath = path.join(BLANKO_TEMPLATES_DIR, 'Blanko_Auftragsformular_Base.pdf');
        const pidBlankoPath = path.join(BLANKO_TEMPLATES_DIR, `Blanko_Auftragsformular_${pid}.pdf`);
        const pidTariffPath = path.join(BLANKO_TEMPLATES_DIR, `Tarif_Auftragsformular_${pid}.pdf`);
        const defaultTariffPath = path.join(BLANKO_TEMPLATES_DIR, 'Tarif_Auftragsformular_1586.pdf');
        const pidAngebotPath = path.join(BLANKO_TEMPLATES_DIR, `Angebot_${pid}.pdf`);
        const baseAngebotPath = path.join(BLANKO_TEMPLATES_DIR, 'Angebot_Base.pdf');

        const pureBlankoBuffer = fs.existsSync(pidBlankoPath)
            ? fs.readFileSync(pidBlankoPath)
            : (fs.existsSync(baseBlankoPath) ? fs.readFileSync(baseBlankoPath) : null);
        const tariffFilledBuffer = fs.existsSync(pidTariffPath)
            ? fs.readFileSync(pidTariffPath)
            : (fs.existsSync(defaultTariffPath) ? fs.readFileSync(defaultTariffPath) : pureBlankoBuffer);
        const angebotBuffer = fs.existsSync(pidAngebotPath)
            ? fs.readFileSync(pidAngebotPath)
            : (fs.existsSync(baseAngebotPath) ? fs.readFileSync(baseAngebotPath) : null);

        return {
            pureBlankoBuffer,
            tariffFilledBuffer,
            angebotBuffer,
            hasExactPidTariffOnDisk: fs.existsSync(pidTariffPath)
        };
    } catch (e) {
        return { pureBlankoBuffer: null, tariffFilledBuffer: null, angebotBuffer: null, hasExactPidTariffOnDisk: false };
    }
}

function saveDiskBlankoBuffers(pid, { pureBlankoBuffer, tariffFilledBuffer, angebotBuffer }) {
    try {
        fs.mkdirSync(BLANKO_TEMPLATES_DIR, { recursive: true });
        if (pureBlankoBuffer && pureBlankoBuffer.length > 0) {
            fs.writeFileSync(path.join(BLANKO_TEMPLATES_DIR, `Blanko_Auftragsformular_${pid}.pdf`), pureBlankoBuffer);
            const baseBlankoPath = path.join(BLANKO_TEMPLATES_DIR, 'Blanko_Auftragsformular_Base.pdf');
            if (!fs.existsSync(baseBlankoPath)) {
                fs.writeFileSync(baseBlankoPath, pureBlankoBuffer);
            }
        }
        if (tariffFilledBuffer && tariffFilledBuffer.length > 0) {
            fs.writeFileSync(path.join(BLANKO_TEMPLATES_DIR, `Tarif_Auftragsformular_${pid}.pdf`), tariffFilledBuffer);
        }
        if (angebotBuffer && angebotBuffer.length > 0) {
            fs.writeFileSync(path.join(BLANKO_TEMPLATES_DIR, `Angebot_${pid}.pdf`), angebotBuffer);
            const baseAngebotPath = path.join(BLANKO_TEMPLATES_DIR, 'Angebot_Base.pdf');
            if (!fs.existsSync(baseAngebotPath)) {
                fs.writeFileSync(baseAngebotPath, angebotBuffer);
            }
        }
    } catch (e) {
        console.warn('[RLM-API] Could not save blanko PDF buffer to disk:', e.message);
    }
}

/**
 * Automatically discovers all currently active tariffs in the portal (`FindProductOffer` for Strom & Gas)
 * and fetches/extracts their official Blanko-PDFs (`Auftragsformular.pdf` + `Angebot.pdf`).
 *
 * Whenever new tariffs or updated price sheets are published in the portal, `calculateRlmTariffs`
 * discovers the new `productId` automatically in real time and extracts its Blanko-PDF!
 */
async function getRlmBlankoPdfs(params = {}) {
    const requestedProductId = params.productId ? parseInt(params.productId, 10) : null;
    const forceRefresh = Boolean(params.forceRefresh || params.refresh);
    const includeBuffers = Boolean(params.includeBuffers);
    const branches = params.branch
        ? [String(params.branch).toLowerCase()]
        : ['strom', 'gas'];

    // 1. Discover all active tariffs live from the portal across current & upcoming delivery windows
    const discoveredTariffsByProductId = new Map();
    const deliveryWindows = params.deliveryStart
        ? [String(params.deliveryStart).slice(0, 10)]
        : ['2026-05-01', '2026-11-01', '2027-01-01'];

    const discoveryTasks = [];
    for (const branch of branches) {
        for (const dStart of deliveryWindows) {
            discoveryTasks.push(
                calculateRlmTariffs({
                    branch,
                    measurement: params.measurement || 'RLM',
                    plz: params.plz || '44379',
                    consumption: params.consumption || 100000,
                    peakLoad: params.peakLoad || 32,
                    deliveryStart: dStart,
                    surchargeCt: params.surchargeCt || 0,
                    includeAllPortalProducts: true
                }).catch(err => {
                    console.warn(`[RLM-API] Auto-discovery for ${branch} (${dStart}) warning:`, err.message);
                    return null;
                })
            );
        }
    }

    const calcResults = await Promise.all(discoveryTasks);
    for (const calc of calcResults) {
        if (calc && Array.isArray(calc.tariffs)) {
            for (const t of calc.tariffs) {
                if (t.productId && !discoveredTariffsByProductId.has(Number(t.productId))) {
                    discoveredTariffsByProductId.set(Number(t.productId), {
                        productId: Number(t.productId),
                        tariffId: t.id,
                        tariffName: t.name,
                        providerName: t.providerName,
                        branch: t.branch || 'strom',
                        measurement: t.measurement || 'RLM',
                        contractDurationMonths: t.contractDurationMonths,
                        deliveryFrom: t.deliveryFrom,
                        deliveryTo: t.deliveryTo,
                        workingPriceEnergyBaseCtNetto: t.workingPriceEnergyBaseCtNetto,
                        basePriceEnergyMonthlyNetto: t.basePriceEnergyMonthlyNetto
                    });
                }
            }
        }
    }

    // Ensure all 22 portal B2B/RLM/SLP catalog IDs (EVITA, E.ON, meistro) are indexed alongside live-discovered tariffs
    const knownCatalogDefaults = [
        // EVITA (E.VITA Wochenpreis - SLP Strom & Gas bis 1.000.000 kWh)
        { productId: 1572, tariffId: 'slp-1572-12m', tariffName: 'E.VITA Wochenpreis Strom (Lieferende 2027)', providerName: 'EVITA', branch: 'strom', measurement: 'SLP', contractDurationMonths: 12 },
        { productId: 1571, tariffId: 'slp-1571-24m', tariffName: 'E.VITA Wochenpreis Strom (Lieferende 2028)', providerName: 'EVITA', branch: 'strom', measurement: 'SLP', contractDurationMonths: 24 },
        { productId: 1573, tariffId: 'slp-1573-36m', tariffName: 'E.VITA Wochenpreis Strom (Lieferende 2029)', providerName: 'EVITA', branch: 'strom', measurement: 'SLP', contractDurationMonths: 36 },
        { productId: 1574, tariffId: 'slp-1574-12m', tariffName: 'E.VITA Wochenpreis Gas  (Lieferende 2027)', providerName: 'EVITA', branch: 'gas', measurement: 'SLP', contractDurationMonths: 12 },
        { productId: 1575, tariffId: 'slp-1575-24m', tariffName: 'E.VITA Wochenpreis Gas  (Lieferende 2028)', providerName: 'EVITA', branch: 'gas', measurement: 'SLP', contractDurationMonths: 24 },
        { productId: 1576, tariffId: 'slp-1576-36m', tariffName: 'E.VITA Wochenpreis Gas  (Lieferende 2029)', providerName: 'EVITA', branch: 'gas', measurement: 'SLP', contractDurationMonths: 36 },
        // E.ON (SLP & RLM Strom & Gas)
        { productId: 1586, tariffId: 'slp-1586-12m', tariffName: 'E.ON BusinessStrom fix (SLP)', providerName: 'E.ON Digital Technology GmbH', branch: 'strom', measurement: 'SLP', contractDurationMonths: 12 },
        { productId: 1587, tariffId: 'slp-1587-12m', tariffName: 'E.ON BusinessStrom fix öko basic (SLP)', providerName: 'E.ON Digital Technology GmbH', branch: 'strom', measurement: 'SLP', contractDurationMonths: 12 },
        { productId: 1579, tariffId: 'rlm-1579-12m', tariffName: 'E.ON BusinessStrom fix (RLM ≤999.999)', providerName: 'E.ON Digital Technology GmbH', branch: 'strom', measurement: 'RLM', contractDurationMonths: 12 },
        { productId: 1585, tariffId: 'rlm-1585-12m', tariffName: 'E.ON BusinessStrom fix öko basic (RLM ≤999.999)', providerName: 'E.ON Digital Technology GmbH', branch: 'strom', measurement: 'RLM', contractDurationMonths: 12 },
        { productId: 1580, tariffId: 'rlm-1580-12m', tariffName: 'E.ON BusinessStrom fix (RLM ≥1.000.000)', providerName: 'E.ON Digital Technology GmbH', branch: 'strom', measurement: 'RLM', contractDurationMonths: 12 },
        { productId: 1588, tariffId: 'rlm-1588-12m', tariffName: 'E.ON BusinessStrom fix öko basic (RLM ≥1.000.000)', providerName: 'E.ON Digital Technology GmbH', branch: 'strom', measurement: 'RLM', contractDurationMonths: 12 },
        { productId: 1577, tariffId: 'slp-1577-12m', tariffName: 'E.ON BusinessGas fix (SLP)', providerName: 'E.ON Digital Technology GmbH', branch: 'gas', measurement: 'SLP', contractDurationMonths: 12 },
        { productId: 1578, tariffId: 'slp-1578-12m', tariffName: 'E.ON BusinessGas fix klima (SLP)', providerName: 'E.ON Digital Technology GmbH', branch: 'gas', measurement: 'SLP', contractDurationMonths: 12 },
        { productId: 1581, tariffId: 'rlm-1581-12m', tariffName: 'E.ON BusinessGas fix (RLM ≤1.499.999)', providerName: 'E.ON Digital Technology GmbH', branch: 'gas', measurement: 'RLM', contractDurationMonths: 12 },
        { productId: 1582, tariffId: 'rlm-1582-12m', tariffName: 'E.ON BusinessGas fix klima (RLM ≤1.499.999)', providerName: 'E.ON Digital Technology GmbH', branch: 'gas', measurement: 'RLM', contractDurationMonths: 12 },
        { productId: 1583, tariffId: 'rlm-1583-12m', tariffName: 'E.ON BusinessGas fix (RLM ≥1.500.000)', providerName: 'E.ON Digital Technology GmbH', branch: 'gas', measurement: 'RLM', contractDurationMonths: 12 },
        { productId: 1584, tariffId: 'rlm-1584-12m', tariffName: 'E.ON BusinessGas fix klima (RLM ≥1.500.000)', providerName: 'E.ON Digital Technology GmbH', branch: 'gas', measurement: 'RLM', contractDurationMonths: 12 },
        // meistro (SLP & RLM Strom & Gas)
        { productId: 1135, tariffId: 'rlm-1135-12m', tariffName: 'meistro Strom (Lieferbeginn ab dem 01.01.2026)', providerName: 'meistro Energie GmbH', branch: 'strom', measurement: 'RLM', contractDurationMonths: 12 },
        { productId: 1136, tariffId: 'rlm-1136-12m', tariffName: 'meistro Strom (Lieferbeginn ab dem 01.01.2027)', providerName: 'meistro Energie GmbH', branch: 'strom', measurement: 'RLM', contractDurationMonths: 12 },
        { productId: 1206, tariffId: 'rlm-1206-12m', tariffName: 'meistro Gas (Lieferbeginn ab dem 01.01.2026)', providerName: 'meistro Energie GmbH', branch: 'gas', measurement: 'RLM', contractDurationMonths: 12 },
        { productId: 1207, tariffId: 'rlm-1207-12m', tariffName: 'meistro Gas (Lieferbeginn ab dem 01.01.2027)', providerName: 'meistro Energie GmbH', branch: 'gas', measurement: 'RLM', contractDurationMonths: 12 }
    ];
    for (const item of knownCatalogDefaults) {
        if (branches.includes(item.branch) && !discoveredTariffsByProductId.has(item.productId)) {
            discoveredTariffsByProductId.set(item.productId, item);
        }
    }

    if (requestedProductId && !discoveredTariffsByProductId.has(requestedProductId)) {
        discoveredTariffsByProductId.set(requestedProductId, {
            productId: requestedProductId,
            tariffId: `rlm-${requestedProductId}`,
            tariffName: params.tariffName || `RLM Sondertarif #${requestedProductId}`,
            providerName: params.providerName || 'E.ON Energie Deutschland GmbH',
            branch: params.branch || 'strom',
            measurement: params.measurement || 'RLM',
            contractDurationMonths: parseInt(params.contractDurationMonths || 12, 10) || 12,
            deliveryFrom: params.deliveryStart || '2026-05-01',
            deliveryTo: null,
            workingPriceEnergyBaseCtNetto: null,
            basePriceEnergyMonthlyNetto: null
        });
    }

    const targetProductIds = requestedProductId
        ? [requestedProductId]
        : [...discoveredTariffsByProductId.keys()];

    const results = [];
    for (const pid of targetProductIds) {
        const tariffMeta = discoveredTariffsByProductId.get(pid) || { productId: pid, branch: 'strom' };
        const cached = blankoPdfCache.get(pid);
        const now = Date.now();

        if (cached && !forceRefresh && (now - cached.cachedAt < BLANKO_CACHE_TTL_MS)) {
            results.push({
                ...cached.info,
                tariff: tariffMeta,
                ...(includeBuffers ? { buffers: cached.buffers } : {})
            });
            continue;
        }

        // Check persistent disk cache first for instant response (< 20ms)
        const disk = loadDiskBlankoBuffers(pid);
        let pureBlankoBuffer = disk.pureBlankoBuffer;
        let tariffFilledBuffer = disk.tariffFilledBuffer;
        let angebotBuffer = disk.angebotBuffer;
        let auftragDoc = null;
        let angebotDoc = null;

        // Fetch live from portal if forced or if no Blanko-PDF exists on disk yet
        if (forceRefresh || !pureBlankoBuffer) {
            const docs = await generateVpOrderDocuments({
                orderId: params.orderId || '172',
                productId: pid,
                branch: tariffMeta.branch || 'strom',
                measurement: tariffMeta.measurement || 'RLM',
                consumption: params.consumption || 100000,
                peakLoad: params.peakLoad || 40,
                deliveryStart: params.deliveryStart || '2026-05-01',
                contractDurationMonths: tariffMeta.contractDurationMonths || 12,
                surchargeCt: params.surchargeCt || 0.7,
                companyName: params.companyName || 'Musterunternehmen GmbH',
                legalForm: params.legalForm || 'GmbH',
                firstName: params.firstName || 'Max',
                lastName: params.lastName || 'Mustermann',
                plz: params.plz || '07745',
                city: params.city || 'Jena',
                street: params.street || 'Göschwitzer Str.',
                houseNumber: params.houseNumber || '22'
            });

            auftragDoc = docs.find(d => d.type === 'auftragsformular') || docs[0] || null;
            angebotDoc = docs.find(d => d.type === 'angebot') || null;

            if (auftragDoc && auftragDoc.signedUrl) {
                try {
                    tariffFilledBuffer = await fetchPdfBufferFromSignedUrl(auftragDoc.signedUrl);
                    pureBlankoBuffer = extractPureBlankoPdfBuffer(tariffFilledBuffer);
                } catch (dlErr) {
                    console.warn(`[RLM-API] Failed to download Auftragsformular for productId ${pid}:`, dlErr.message);
                }
            }
            if (angebotDoc && angebotDoc.signedUrl) {
                try {
                    angebotBuffer = await fetchPdfBufferFromSignedUrl(angebotDoc.signedUrl);
                } catch (dlErr) {
                    console.warn(`[RLM-API] Failed to download Angebot for productId ${pid}:`, dlErr.message);
                }
            }

            if (pureBlankoBuffer || tariffFilledBuffer || angebotBuffer) {
                saveDiskBlankoBuffers(pid, { pureBlankoBuffer, tariffFilledBuffer, angebotBuffer });
            }
        } else if (!disk.hasExactPidTariffOnDisk) {
            // If this is a brand-new tariff ID discovered in the portal, refresh its specific tariff PDF asynchronously in background
            generateVpOrderDocuments({
                orderId: '172',
                productId: pid,
                branch: tariffMeta.branch || 'strom',
                measurement: tariffMeta.measurement || 'RLM',
                consumption: 100000,
                peakLoad: 40,
                deliveryStart: '2026-05-01',
                surchargeCt: 0.7
            }).then(async (bgDocs) => {
                const bgAuftrag = bgDocs.find(d => d.type === 'auftragsformular') || bgDocs[0];
                const bgAngebot = bgDocs.find(d => d.type === 'angebot');
                if (bgAuftrag && bgAuftrag.signedUrl) {
                    const tBuf = await fetchPdfBufferFromSignedUrl(bgAuftrag.signedUrl);
                    const bBuf = extractPureBlankoPdfBuffer(tBuf);
                    const aBuf = (bgAngebot && bgAngebot.signedUrl) ? await fetchPdfBufferFromSignedUrl(bgAngebot.signedUrl) : null;
                    saveDiskBlankoBuffers(pid, { pureBlankoBuffer: bBuf, tariffFilledBuffer: tBuf, angebotBuffer: aBuf });
                    blankoPdfCache.delete(pid);
                }
            }).catch(() => {});
        }

        const formFields = pureBlankoBuffer ? extractPdfFormFieldNames(pureBlankoBuffer) : [];

        const info = {
            productId: pid,
            tariff: tariffMeta,
            updatedAt: new Date(now).toISOString(),
            pureBlankoAvailable: Boolean(pureBlankoBuffer && pureBlankoBuffer.length > 0),
            pureBlankoByteLength: pureBlankoBuffer ? pureBlankoBuffer.length : null,
            tariffFilledByteLength: tariffFilledBuffer ? tariffFilledBuffer.length : null,
            angebotByteLength: angebotBuffer ? angebotBuffer.length : null,
            interactiveFormFieldCount: formFields.length,
            interactiveFormFields: formFields,
            downloads: {
                pureBlankoPdfUrl: `/api/b2b/rlm-tarife/blanko-pdfs?productId=${pid}&download=true&mode=blanko`,
                tariffPreFilledPdfUrl: `/api/b2b/rlm-tarife/blanko-pdfs?productId=${pid}&download=true&mode=tariff`,
                angebotPdfUrl: `/api/b2b/rlm-tarife/blanko-pdfs?productId=${pid}&download=true&mode=angebot`,
                portalAuftragsformularSignedUrl: auftragDoc ? auftragDoc.signedUrl : null,
                portalAngebotSignedUrl: angebotDoc ? angebotDoc.signedUrl : null
            }
        };

        const buffers = {
            pureBlankoBuffer,
            tariffFilledBuffer,
            angebotBuffer
        };

        blankoPdfCache.set(pid, { cachedAt: now, info, buffers });
        results.push({
            ...info,
            ...(includeBuffers ? { buffers } : {})
        });
    }

    return {
        success: true,
        autoDiscoveredTariffCount: discoveredTariffsByProductId.size,
        count: results.length,
        blankoPdfs: results
    };
}

/**
 * Fetches live customer confirmation & signature status for a specific order via `RecordService_GetOrder`.
 */
async function getVpOrderSigningDetails(orderId) {
    const cleanId = String(orderId || '').trim();
    if (!cleanId) return null;

    const res = await vpGraphql(
        'RecordService_GetOrder',
        `query RecordService_GetOrder($orderId: ID!) {
            getOrder(orderId: $orderId) {
                id
                orderNumber
                salesNumber
                createdAt
                productList {
                    id
                    orderProductNumber
                    status { id statusCode statusText }
                    signatureList { fieldId signatureFieldId signature }
                    customerConfirmation {
                        signingMethod
                        confirmationStatus
                        confirmationStatusDate
                        confirmationToken
                        presignedDownloadUrls { url fileId }
                        filesForReferenceObjects { id name fieldCoordinates }
                    }
                }
            }
        }`,
        { orderId: cleanId }
    );

    const ord = res && res.data && res.data.getOrder;
    if (!ord) return null;

    const firstProd = Array.isArray(ord.productList) && ord.productList[0] ? ord.productList[0] : {};
    const cc = firstProd.customerConfirmation || {};
    const refFiles = Array.isArray(cc.filesForReferenceObjects) ? cc.filesForReferenceObjects : [];
    const presigned = Array.isArray(cc.presignedDownloadUrls) ? cc.presignedDownloadUrls : [];
    const sigList = Array.isArray(firstProd.signatureList) ? firstProd.signatureList : [];

    const presignedDocuments = presigned
        .filter(p => p && p.url)
        .map((p, idx) => {
            const matchedRef = refFiles.find(rf => String(rf.id) === String(p.fileId));
            const rawLabel = matchedRef && matchedRef.name
                ? String(matchedRef.name).split('/').pop()
                : (idx === 0 ? 'Auftragsformular' : `Vertragsdokument_${idx + 1}`);
            const filename = rawLabel.toLowerCase().endsWith('.pdf') ? rawLabel : `${rawLabel}.pdf`;
            const fullUrl = String(p.url).startsWith('http')
                ? String(p.url)
                : `https://vp.alpha-energie.de${p.url}`;
            return {
                id: p.fileId || `presigned-${idx}`,
                name: rawLabel,
                filename,
                type: rawLabel.toLowerCase().includes('angebot') ? 'angebot' : 'auftragsformular',
                orderId: String(ord.id),
                signedUrl: fullUrl,
                url: fullUrl,
                downloadUrl: fullUrl,
                expiresInSeconds: 3600
            };
        });

    return {
        orderId: String(ord.id),
        orderNumber: ord.orderNumber,
        salesNumber: ord.salesNumber,
        createdAt: ord.createdAt,
        orderProductId: firstProd.id ? String(firstProd.id) : String(ord.id),
        orderProductNumber: firstProd.orderProductNumber || null,
        status: firstProd.status || null,
        signingMethod: cc.signingMethod || null,
        confirmationStatus: cc.confirmationStatus || 'PENDING',
        confirmationStatusDate: cc.confirmationStatusDate || null,
        confirmationToken: cc.confirmationToken || null,
        pdfsReady: refFiles.length > 0,
        filesForReferenceObjects: refFiles,
        presignedDocuments,
        signatureCount: sigList.length
    };
}

/**
 * Triggers or re-sends the official contactless signature e-mail (`resend-contactless-signature-email`)
 * to the customer for an order in `DIGITAL_REMOTE` mode.
 */
async function resendVpSignatureEmail(orderId, email) {
    const cleanOrderId = String(orderId || '').trim();
    const cleanEmail = String(email || '').trim();
    if (!cleanOrderId) {
        throw new Error('Keine Auftrags-ID für den E-Mail-Versand vorhanden.');
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        throw new Error('Bitte geben Sie eine gültige Kunden-E-Mail-Adresse an.');
    }

    const startRes = await vpGraphql(
        'InvokeWorkflowAction',
        `mutation InvokeWorkflowAction($actionKey: String!, $input: JSON, $mode: WorkflowActionInvocationMode) {
            invokeWorkflowAction(actionKey: $actionKey, input: $input, mode: $mode) {
                accepted
                executionId
                status
                pollAfterMs
                resultAvailable
                pollToken
            }
        }`,
        {
            actionKey: 'resend-contactless-signature-email',
            input: { orderId: cleanOrderId, email: cleanEmail }
        }
    );

    if (startRes.errors && startRes.errors.length > 0) {
        throw new Error(startRes.errors[0].message || 'Unterschrifts-E-Mail konnte nicht ausgelöst werden.');
    }

    const wf = startRes.data && startRes.data.invokeWorkflowAction;
    if (!wf) {
        throw new Error('Unterschrifts-E-Mail konnte nicht gestartet werden.');
    }
    if (wf.status === 'FAILED' || wf.status === 'CANCELLED') {
        throw new Error('Der Versand der Unterschrifts-E-Mail ist fehlgeschlagen.');
    }
    if (wf.status === 'COMPLETED' && !wf.pollToken && !wf.executionId) {
        return { success: true, orderId: cleanOrderId, email: cleanEmail, status: 'COMPLETED' };
    }

    const pollDelay = Math.max(Number(wf.pollAfterMs) || 500, 400);
    for (let attempt = 0; attempt < 25; attempt++) {
        await new Promise(r => setTimeout(r, pollDelay));
        const pollRes = await vpGraphql(
            'WorkflowActionStatus',
            `query WorkflowActionStatus($pollToken: String, $executionId: ID) {
                workflowActionStatus(pollToken: $pollToken, executionId: $executionId) {
                    executionId
                    status
                    errorMessage
                    pollAfterMs
                }
            }`,
            { pollToken: wf.pollToken || null, executionId: wf.executionId || null }
        );
        const st = pollRes.data && pollRes.data.workflowActionStatus;
        if (!st) continue;
        if (st.errorMessage) {
            throw new Error(st.errorMessage);
        }
        if (st.status === 'COMPLETED') {
            return { success: true, orderId: cleanOrderId, email: cleanEmail, status: 'COMPLETED' };
        }
        if (st.status === 'FAILED' || st.status === 'CANCELLED') {
            throw new Error('Der Versand der Unterschrifts-E-Mail ist fehlgeschlagen.');
        }
    }

    return { success: true, orderId: cleanOrderId, email: cleanEmail, status: 'DISPATCHED' };
}

function extractGraphqlErrorText(gqlRes) {
    if (!gqlRes || !Array.isArray(gqlRes.errors) || gqlRes.errors.length === 0) return null;
    const messages = [];
    for (const err of gqlRes.errors) {
        const extErrors = err && err.extensions && Array.isArray(err.extensions.errors) ? err.extensions.errors : [];
        for (const sub of extErrors) {
            if (sub && sub.message) messages.push(sub.message);
        }
        if (messages.length === 0 && err && err.message) {
            messages.push(err.message);
        }
    }
    return messages.filter(Boolean).join(' • ') || 'Unbekannter Validierungsfehler';
}

/**
 * Submit an official Offer ("Angebotserstellung", isOffer: true) or Order to the RLM system (`vp.alpha-energie.de`)
 * via `AddOrderByProductOffer`, coupled with native customer signing (`DIGITAL_REMOTE`, `DIGITAL_LOCAL`, `PAPER`, `OFFER`).
 */
async function createVpPortalOffer(params = {}, matchedTariff = null) {
    const built = await buildValidatedGraphqlOrderPayload(params, matchedTariff);
    const { orderBase, address, meta } = built;

    const signatureDataUrl = String(params.signatureDataUrl || '').trim();
    if (!meta.isOffer && meta.signingMethod === 'DIGITAL_LOCAL' && !signatureDataUrl.startsWith('data:image/')) {
        throw new Error('Bitte unterschreiben Sie im digitalen Unterschriftenfeld, bevor Sie den Auftrag absenden.');
    }

    let vpPortalResponse = null;
    let vpOrderId = params.orderId ? String(params.orderId) : null;
    let vpOrderNumber = null;
    let vpPortalError = null;
    let signingDetails = null;
    let signatureCompleted = false;
    let signatureEmailSent = false;

    const shouldPrepareForSigning = ['DIGITAL_REMOTE', 'DIGITAL_LOCAL'].includes(meta.signingMethod);

    if (params.syncToVpPortal !== false) {
        if (!vpOrderId) {
            try {
                const addRes = await vpGraphql(
                    'AddOrderByProductOffer',
                    `mutation AddOrderByProductOffer($order: AddOrderByProductOfferOrderInput!) {
                        addOrderByProductOffer(order: $order)
                    }`,
                    { order: orderBase }
                );
                if (addRes.data && addRes.data.addOrderByProductOffer && !addRes.data.addOrderByProductOffer.error) {
                    vpPortalResponse = addRes.data.addOrderByProductOffer;
                    vpOrderId = vpPortalResponse.id || vpPortalResponse._id || (vpPortalResponse.order && (vpPortalResponse.order.id || vpPortalResponse.order._id)) || null;
                    vpOrderNumber = vpPortalResponse.orderNumber || (vpPortalResponse.order && vpPortalResponse.order.orderNumber) || null;
                    if (vpOrderId) vpOrderId = String(vpOrderId);
                } else {
                    vpPortalError = extractGraphqlErrorText(addRes) || 'Auftrag konnte nicht angelegt werden.';
                }
            } catch (err) {
                vpPortalError = err.message;
            }
        } else {
            // Explicit update of an existing orderId
            try {
                const updateRes = await vpGraphql(
                    'UpdateOrderByProductOffer',
                    `mutation UpdateOrderByProductOffer($order: UpdateOrderByProductOfferOrderInput!, $skipEventSubscription: Boolean) {
                        updateOrderByProductOffer(order: $order, skipEventSubscription: $skipEventSubscription)
                    }`,
                    {
                        order: {
                            orderId: vpOrderId,
                            ...orderBase,
                            prepareForSigning: shouldPrepareForSigning
                        },
                        skipEventSubscription: false
                    }
                );
                if (updateRes.data && updateRes.data.updateOrderByProductOffer) {
                    vpPortalResponse = updateRes.data.updateOrderByProductOffer;
                    vpOrderId = String(vpPortalResponse.id || vpOrderId);
                    vpOrderNumber = vpPortalResponse.orderNumber || vpOrderNumber;
                } else {
                    vpPortalError = extractGraphqlErrorText(updateRes);
                }
            } catch (err) {
                vpPortalError = err.message;
            }
        }

        // Never silently swallow errors on a real Order submission
        if (!meta.isOffer && !vpOrderId && vpPortalError) {
            throw new Error(vpPortalError);
        }

        // Native RLM Signing & Finalization Coupling for Orders
        if (vpOrderId && !meta.isOffer) {
            if (meta.signingMethod === 'PAPER' && vpOrderNumber) {
                const compRes = await vpGraphql(
                    'CompleteCustomerConfirmation',
                    `mutation CompleteCustomerConfirmation($dealNumber: ID!) {
                        completeCustomerConfirmation(dealNumber: $dealNumber) {
                            id
                            orderNumber
                            salesNumber
                        }
                    }`,
                    { dealNumber: String(vpOrderNumber) }
                );
                if (!compRes.errors || compRes.errors.length === 0) {
                    signatureCompleted = true;
                }
                signingDetails = await getVpOrderSigningDetails(vpOrderId).catch(() => null);
            } else if (meta.signingMethod === 'DIGITAL_LOCAL') {
                // 1. Wait for PDF signature coordinate extraction (`filesForReferenceObjects`)
                let kickedPrepare = false;
                for (let attempt = 0; attempt < 22; attempt++) {
                    if (attempt > 0) {
                        await new Promise(r => setTimeout(r, 900));
                    }
                    signingDetails = await getVpOrderSigningDetails(vpOrderId).catch(() => null);
                    if (signingDetails && signingDetails.pdfsReady) {
                        break;
                    }
                    if (attempt === 4 && !kickedPrepare) {
                        kickedPrepare = true;
                        await vpGraphql(
                            'UpdateOrderByProductOffer',
                            `mutation UpdateOrderByProductOffer($order: UpdateOrderByProductOfferOrderInput!, $skipEventSubscription: Boolean) {
                                updateOrderByProductOffer(order: $order, skipEventSubscription: $skipEventSubscription)
                            }`,
                            {
                                order: {
                                    orderId: vpOrderId,
                                    ...orderBase,
                                    prepareForSigning: true
                                },
                                skipEventSubscription: false
                            }
                        ).catch(() => null);
                    }
                }

                if (!signingDetails || !signingDetails.pdfsReady) {
                    throw new Error('Die Vertragsdokumente für die digitale Unterschrift konnten nicht rechtzeitig vorbereitet werden. Bitte wählen Sie den Versand des Unterschrifts-Links per E-Mail oder versuchen Sie es erneut.');
                }

                // 2. Stamp customer signature onto every required SIGNATURE coordinate
                const isDebit = meta.requestedPaymentType === 'DEBIT';
                const requiredFieldIds = new Set();
                for (const refObj of (signingDetails.filesForReferenceObjects || [])) {
                    const coords = Array.isArray(refObj.fieldCoordinates) ? refObj.fieldCoordinates : [];
                    for (const fc of coords) {
                        if (!fc || fc.fieldType !== 'SIGNATURE' || !fc.fieldId) continue;
                        const fieldNameLower = String(fc.fieldName || '').toLowerCase();
                        const isBankSig = ['###signature_bank###', 'signature_bank'].includes(fieldNameLower);
                        if (!isDebit && isBankSig) continue;
                        requiredFieldIds.add(String(fc.fieldId));
                    }
                }

                const orderProductId = signingDetails.orderProductId || vpOrderId;
                for (const fieldId of requiredFieldIds) {
                    const sigRes = await vpGraphql(
                        'AddOrderProductSignature',
                        `mutation AddOrderProductSignature($signature: RecordService_OrderProductSignatureInput!, $orderId: ID!) {
                            addOrderProductSignature(signature: $signature, orderId: $orderId) {
                                signatureFieldId
                            }
                        }`,
                        {
                            orderId: String(orderProductId),
                            signature: {
                                fieldId: String(fieldId),
                                signature: signatureDataUrl
                            }
                        }
                    );
                    if (sigRes.errors && sigRes.errors.length > 0) {
                        throw new Error('Unterschrift konnte nicht gespeichert werden: ' + (extractGraphqlErrorText(sigRes) || 'Fehler'));
                    }
                }

                // 3. Finalize customer confirmation (`CompleteCustomerConfirmation`)
                const dealNum = String(vpOrderNumber || signingDetails.orderNumber);
                const compRes = await vpGraphql(
                    'CompleteCustomerConfirmation',
                    `mutation CompleteCustomerConfirmation($dealNumber: ID!) {
                        completeCustomerConfirmation(dealNumber: $dealNumber) {
                            id
                            orderNumber
                            salesNumber
                            productList {
                                customerConfirmation {
                                    signingMethod
                                    confirmationStatus
                                    confirmationStatusDate
                                }
                            }
                        }
                    }`,
                    { dealNumber: dealNum }
                );
                if (compRes.errors && compRes.errors.length > 0) {
                    throw new Error('Auftragsabschluss nach Unterschrift fehlgeschlagen: ' + (extractGraphqlErrorText(compRes) || 'Fehler'));
                }
                signatureCompleted = true;
                signingDetails = await getVpOrderSigningDetails(vpOrderId).catch(() => signingDetails);
            } else if (meta.signingMethod === 'DIGITAL_REMOTE') {
                // Wait briefly so confirmationToken & PDFs are initialized and customer opt-in e-mail/SMS is dispatched
                let kickedPrepare = false;
                for (let attempt = 0; attempt < 10; attempt++) {
                    if (attempt > 0) {
                        await new Promise(r => setTimeout(r, 800));
                    }
                    signingDetails = await getVpOrderSigningDetails(vpOrderId).catch(() => null);
                    if (signingDetails && (signingDetails.pdfsReady || signingDetails.confirmationToken)) {
                        break;
                    }
                    if (attempt === 4 && !kickedPrepare) {
                        kickedPrepare = true;
                        await vpGraphql(
                            'UpdateOrderByProductOffer',
                            `mutation UpdateOrderByProductOffer($order: UpdateOrderByProductOfferOrderInput!, $skipEventSubscription: Boolean) {
                                updateOrderByProductOffer(order: $order, skipEventSubscription: $skipEventSubscription)
                            }`,
                            {
                                order: {
                                    orderId: vpOrderId,
                                    ...orderBase,
                                    prepareForSigning: true
                                },
                                skipEventSubscription: false
                            }
                        ).catch(() => null);
                    }
                }
                signatureEmailSent = true;
            }
        } else if (vpOrderId && meta.isOffer) {
            signingDetails = await getVpOrderSigningDetails(vpOrderId).catch(() => null);
        }
    }

    // Generate / collect official PDF documents ("Angebot.pdf" & "Auftragsformular.pdf") without mutating the created order
    let documents = [];
    if (signingDetails && Array.isArray(signingDetails.presignedDocuments) && signingDetails.presignedDocuments.length > 0) {
        documents = [...signingDetails.presignedDocuments];
    }

    if (params.generateDocuments !== false) {
        try {
            const workflowDocs = await generateVpOrderDocuments(
                {
                    ...params,
                    orderId: vpOrderId || '172',
                    productId: meta.productId,
                    salesNumber: meta.salesNumber,
                    syncOrderFirst: !vpOrderId // NEVER overwrite a real newly created order!
                },
                matchedTariff
            );
            if (Array.isArray(workflowDocs) && workflowDocs.length > 0) {
                if (signatureCompleted && documents.length > 0) {
                    // Keep the signed Auftragsformular from presignedDocuments and add Angebot.pdf from workflowDocs
                    const extraAngebotDocs = workflowDocs.filter(d => d.type === 'angebot');
                    documents = [...documents, ...extraAngebotDocs];
                } else {
                    documents = workflowDocs;
                }
            }
        } catch (docErr) {
            console.warn('[RLM-API] Document generation warning:', docErr.message);
        }
    }

    return {
        vpOrderId: vpOrderId || null,
        vpOrderNumber: vpOrderNumber || (signingDetails && signingDetails.orderNumber) || null,
        salesNumber: meta.salesNumber,
        signingMethod: meta.signingMethod,
        confirmationLinkDeliveryMethod: meta.confirmationLinkDeliveryMethod,
        confirmationStatus: (signingDetails && signingDetails.confirmationStatus) || (signatureCompleted ? 'ACCEPTED' : 'PENDING'),
        confirmationToken: (signingDetails && signingDetails.confirmationToken) || null,
        signatureCompleted,
        signatureEmailSent,
        vpPortalResponse,
        vpPortalError,
        documents,
        resolvedAddress: address
    };
}

/**
 * Fetch recent offers/orders directly from `vp.alpha-energie.de/api/graphql`.
 */
async function getVpPortalOrders(limit = 20) {
    const res = await vpGraphql(
        'RecordService_getOrderList',
        `query RecordService_getOrderList($search: OrderListSearchInput, $pagination: PaginationInput, $sorting: String) {
            getOrderList(search: $search, pagination: $pagination, sorting: $sorting) {
                meta { total limit page pages }
                data {
                    id
                    orderNumber
                    salesNumber
                    createdAt
                    productList {
                        id
                        orderProductNumber
                        status { id statusCode statusText statusDescription }
                        contractHolder {
                            ... on RecordService_CrmCommercialPerson {
                                companyName
                                legalForm
                            }
                            ... on RecordService_CrmPrivatePerson {
                                salutation
                                firstName
                                lastName
                            }
                        }
                        deliveryAddress {
                            ... on RecordService_CrmBuildingAddress {
                                zip
                                city
                                street
                                houseNumber
                            }
                        }
                        orderProductData {
                            product { id name productType }
                        }
                    }
                }
            }
        }`,
        {
            pagination: { skip: 0, limit: Math.min(Number(limit) || 20, 100) },
            sorting: JSON.stringify({ field: 'createdAt', direction: 'desc' })
        }
    );
    return (res.data && res.data.getOrderList) || { meta: { total: 0 }, data: [] };
}

module.exports = {
    calculateRlmTariffs,
    calculateTariffs: calculateRlmTariffs,
    resolveVpCommissionProfile,
    resolveDeliveryAddress,
    lookupAddressOptions: (plz, branch, city) => resolveDeliveryAddress({ plz, branch, city, lookupOnly: true }),
    getRlmPortalOptions,
    getPortalFilterOptions: getRlmPortalOptions,
    searchPreviousSuppliers,
    createVpPortalOffer,
    getVpOrderSigningDetails,
    resendVpSignatureEmail,
    syncVpOrderForPdfGeneration,
    generateVpOrderDocuments,
    generateVpPortalOrderDocuments: generateVpOrderDocuments,
    getRlmBlankoPdfs,
    extractPureBlankoPdfBuffer,
    extractPdfFormFieldNames,
    fetchPdfBufferFromSignedUrl,
    getVpPortalOrders,
    ensureFreshVpSession,
    refreshVpSessionViaHttp,
    refreshVpSessionViaPlaywright,
    setRemoteSessionRefresher,
    saveCookiesToDisk
};

