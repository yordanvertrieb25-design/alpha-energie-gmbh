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
            console.warn('[RLM-API] HTTP token refresh failed, trying Playwright fallback:', httpErr.message);
            return await refreshVpSessionViaPlaywright();
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

// Keep the VP portal session warm in the background every 40 minutes
const keepAliveTimer = setInterval(() => {
    refreshVpSessionViaHttp().catch(err => {
        console.warn('[RLM-API] Background session keep-alive warning:', err.message);
    });
}, 40 * 60 * 1000);
if (typeof keepAliveTimer.unref === 'function') {
    keepAliveTimer.unref();
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
async function resolveDeliveryAddress({ plz, city, street, houseNumber }) {
    const cleanZip = String(plz || '44379').replace(/\D/g, '').padStart(5, '0').slice(0, 5);
    const cleanHouseNr = String(houseNumber || '1').trim() || '1';

    let resolvedCity = city ? String(city).trim() : '';
    let resolvedStreet = street ? String(street).trim() : '';

    if (resolvedCity && resolvedStreet) {
        return {
            country: 'DE',
            zip: cleanZip,
            city: resolvedCity,
            street: resolvedStreet,
            houseNumber: cleanHouseNr,
            citiesInZip: [resolvedCity],
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
        resolvedCity = citiesInZip[0] || 'Dortmund';
    }

    let streetsInCity = (cached && cached.city === resolvedCity && cached.streets) ? cached.streets : null;
    if (!streetsInCity) {
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

    if (!resolvedStreet) {
        resolvedStreet = streetsInCity[0] || 'Hauptstraße';
    }

    return {
        country: 'DE',
        zip: cleanZip,
        city: resolvedCity,
        street: resolvedStreet,
        houseNumber: cleanHouseNr,
        citiesInZip,
        sampleStreets: streetsInCity.slice(0, 50)
    };
}

/**
 * Normalize delivery start date to YYYY-MM-DD.
 * Defaults to the 1st of next month if omitted.
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
    const now = new Date();
    const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return nextMonth.toISOString().slice(0, 10);
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
    drittkostenCalc,
    currentYearlyNetto,
    currentYearlyBrutto
}) {
    const prices = Array.isArray(product.pricesWithoutSurcharge) && product.pricesWithoutSurcharge.length > 0
        ? product.pricesWithoutSurcharge
        : (Array.isArray(product.prices) ? product.prices : []);

    const isRlm = measurement === 'RLM';
    const workPriceSurchargeRule = (Array.isArray(product.surcharges) ? product.surcharges : [])
        .find(s => s.priceType === 'WORK_PRICE') || { min: 0, max: 3, step: 0.1 };

    const maxAllowedSurcharge = Number.isFinite(Number(workPriceSurchargeRule.max)) ? Number(workPriceSurchargeRule.max) : 3;
    const minAllowedSurcharge = Number.isFinite(Number(workPriceSurchargeRule.min)) ? Number(workPriceSurchargeRule.min) : 0;
    const appliedSurchargeCt = round4(Math.min(maxAllowedSurcharge, Math.max(minAllowedSurcharge, Number(surchargeCt) || 0)));

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

            const durationMonths = Number(period.timeSeries) || Number(wpEntry.contractDurationMonths) || 12;

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
            const savingsYearlyBrutto = currentYearlyBrutto > 0 ? round2(Math.max(0, currentYearlyBrutto - totalYearlyBrutto)) : 0;
            const savingsMonthlyNetto = round2(savingsYearlyNetto / 12);
            const savingsMonthlyBrutto = round2(savingsYearlyBrutto / 12);

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
                id: `rlm-${product.id}-${durationMonths}m`,
                tariffId: `rlm-${product.id}-${durationMonths}m`,
                priceId: wpEntry.id,
                productId: product.id,
                name: tariffLabel,
                productName: product.name,
                providerName: cleanProvider,
                providerId: product.provider ? product.provider.id : null,
                notice: wpEntry.notice || '',
                basePriceNotice: matchedBaseNotice,
                branch,
                measurement,
                gridLayer,
                consumption,
                peakLoad: isRlm ? peakLoad : null,
                leistungKw: isRlm ? peakLoad : null,
                usageHours: isRlm ? usageHours : null,
                benutzungsstunden: isRlm ? usageHours : null,
                contractDurationMonths: durationMonths,
                contractTermMonths: durationMonths,
                priceGuaranteeMonths: durationMonths,
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
                basePriceEnergyMonthlyNetto: matchedBaseMonthlyNetto,
                basePriceEnergyMonthlyBrutto,
                basePriceEnergyYearlyNetto,
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
    const usageHoursExact = peakLoad > 0 ? round2(consumption / peakLoad) : usageHours;
    const usageHoursZone = usageHours >= 2500 ? '>= 2.500 h/a' : '< 2.500 h/a';

    const gridLayer = normalizeGridLayer(params.gridLayer || params.netzebene || params.druckstufe);
    const deliveryStart = normalizeDeliveryStart(params.deliveryStart || params.lieferbeginn);
    const surchargeCt = parseFloat(params.surchargeCt ?? params.aufschlagCt ?? params.provisionCt ?? 0) || 0;
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

    // Step 2: Build GraphQL inputs for FindProductOffer and PriceSpecialContractCalculation
    const searchTypes = isGas
        ? {
            SPECIAL_CONTRACT_GAS: {
                businessSector,
                loadProfile,
                gridLayer,
                measurement,
                meterId: gasMeterId,
                contractOrderType: 'NEW',
                consumption,
                deliveryStart,
                ...(measurement === 'RLM' ? { usageHours, peakLoad } : {})
            }
        }
        : {
            SPECIAL_CONTRACT_ELECTRICITY: {
                businessSector,
                loadProfile,
                gridLayer,
                measurement,
                meterType,
                contractOrderType: 'NEW',
                consumption,
                deliveryStart,
                ...(measurement === 'RLM' ? { usageHours, peakLoad } : {})
            }
        };

    const offerPromise = vpGraphql(
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
            searchTypes,
            productList: []
        }
    );

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

    const [offerRes, calcRes] = await Promise.all([offerPromise, calcPromise]);

    const offerBlock = (offerRes.data && Array.isArray(offerRes.data.findProductOffer))
        ? offerRes.data.findProductOffer.find(b => b.productType === productType) || offerRes.data.findProductOffer[0]
        : null;

    const drittkostenCalc = isGas
        ? (calcRes.data && calcRes.data.productFinder_priceSpecialContractCalculationGas) || null
        : (calcRes.data && calcRes.data.productFinder_priceSpecialContractCalculationElectricity) || null;

    const rawProducts = (offerBlock && Array.isArray(offerBlock.allProducts))
        ? offerBlock.allProducts.filter(ap => ap && ap.product && !ap.disabled && !ap.hidden)
        : [];

    const tariffs = [];
    const productsSummary = [];

    for (const ap of rawProducts) {
        const variants = buildTariffVariantsForProduct({
            product: ap.product,
            branch,
            measurement,
            consumption,
            peakLoad,
            usageHours,
            gridLayer,
            deliveryStart,
            surchargeCt,
            drittkostenCalc,
            currentYearlyNetto,
            currentYearlyBrutto
        });

        tariffs.push(...variants);
        productsSummary.push({
            productId: ap.product.id,
            productName: ap.product.name,
            providerName: ap.product.provider ? ap.product.provider.name : null,
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
        tariffsCount: tariffs.length,
        tariffs,
        products: productsSummary
    };
}

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
        businessSectors: (sectorsRes.data && sectorsRes.data.productFinder_getBusinessSectorsList) || [],
        loadProfiles: (profilesRes.data && profilesRes.data.productFinder_getLoadProfiles) || [],
        gasMeters: (metersRes.data && metersRes.data.productFinder_metersGas) || []
    };

    optionsCache.set(cacheKey, result);
    return result;
}

/**
 * Generate official RLM Portal PDF documents ("Angebot" & "Auftragsformular")
 * via InvokeWorkflowAction(actionKey: "get-all-order-files").
 */
async function generateVpOrderDocuments({
    orderId = '124',
    productId = 1573,
    salesNumber = 10011,
    branch = 'strom',
    businessSector = '36',
    consumption = 100000,
    contractOrderType = 'NEW',
    deliveryStart = '2027-01-01',
    loadProfile = '25',
    loadProfileName = 'Standard',
    companyName = 'Gewerbekunde',
    legalForm = 'GmbH',
    salutation = 'Herr',
    firstName = 'Max',
    lastName = 'Mustermann',
    zip = '44379',
    city = 'Dortmund',
    street = 'Abboweg',
    houseNumber = '11',
    meterNumber = '',
    maloId = ''
} = {}) {
    const isGas = String(branch).toLowerCase() === 'gas';
    const productType = isGas ? 'SPECIAL_CONTRACT_GAS' : 'SPECIAL_CONTRACT_ELECTRICITY';
    const cleanSalutation = ['Herr', 'Frau', 'Divers'].includes(salutation) ? salutation : 'Herr';

    const input = {
        productId: Number(productId) || (isGas ? 1574 : 1573),
        orderId: String(orderId || '124'),
        salesNumber: Number(salesNumber) || 10011,
        productType,
        productTypeFilter: {
            businessSector: String(businessSector || (isGas ? '35' : '36')),
            consumption: Number(consumption) || 100000,
            contractOrderType: contractOrderType || 'NEW',
            deliveryStart: String(deliveryStart || '2027-01-01').slice(0, 10),
            loadProfile: String(loadProfile || (isGas ? '6' : '25')),
            loadProfileName: String(loadProfileName || 'Standard'),
            meterId: '',
            meterSize: '',
            meterTariff: '',
            meterType: ''
        },
        contractDate: new Date().toISOString().slice(0, 10),
        billingAddress: {
            zip: String(zip || '44379'),
            city: String(city || 'Dortmund'),
            street: String(street || 'Abboweg'),
            houseNumber: String(houseNumber || '11'),
            receiver: {
                company: String(companyName || 'Gewerbekunde'),
                salutation: cleanSalutation,
                firstName: String(firstName || 'Max'),
                lastName: String(lastName || 'Mustermann'),
                academicTitle: ''
            }
        },
        deliveryAddress: {
            zip: String(zip || '44379'),
            city: String(city || 'Dortmund'),
            street: String(street || 'Abboweg'),
            houseNumber: String(houseNumber || '11'),
            streetAndHouseNumber: `${street || 'Abboweg'} ${houseNumber || '11'}`.trim(),
            zipAndCity: `${zip || '44379'} ${city || 'Dortmund'}`.trim()
        },
        company: {
            legalForm: String(legalForm || 'GmbH'),
            companyName: String(companyName || 'Gewerbekunde')
        },
        contactPerson: {
            salutation: cleanSalutation,
            firstName: String(firstName || 'Max'),
            lastName: String(lastName || 'Mustermann'),
            academicTitle: '',
            fullName: `${firstName || 'Max'} ${lastName || 'Mustermann'}`.trim(),
            dateOfBirth: ''
        },
        orderProductData: {
            meterNumber: String(meterNumber || ''),
            contractEnd: '',
            marketLocationId: String(maloId || ''),
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

    const pollDelay = Math.max(Number(wf.pollAfterMs) || 650, 400);
    for (let attempt = 0; attempt < 15; attempt++) {
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
            return st.result.uploadedFiles.map(f => ({
                id: f.objectId,
                name: f.originalFilename || 'Dokument',
                filename: (f.originalFilename || 'Dokument').endsWith('.pdf')
                    ? f.originalFilename
                    : `${f.originalFilename || 'Dokument'}.pdf`,
                signedUrl: f.signedUrl && f.signedUrl.startsWith('http')
                    ? f.signedUrl
                    : `https://vp.alpha-energie.de${f.signedUrl || ''}`,
                expiresInSeconds: f.expiresIn || 3600
            }));
        }
        if (st.status === 'FAILED' || st.status === 'CANCELLED' || st.errorMessage) {
            break;
        }
    }
    return [];
}

/**
 * Submit an official Offer ("Angebotserstellung", isOffer: true) or Order to the RLM Portal (`vp.alpha-energie.de`)
 * via GraphQL mutation `AddOrderByProductOffer`.
 */
async function createVpPortalOffer(params = {}, matchedTariff = null) {
    const isGas = String(params.branch || params.sparte || (matchedTariff && matchedTariff.branch) || 'strom').toLowerCase() === 'gas';
    const productType = isGas ? 'SPECIAL_CONTRACT_GAS' : 'SPECIAL_CONTRACT_ELECTRICITY';
    const measurement = String(params.measurement || params.messung || (matchedTariff && matchedTariff.measurement) || 'RLM').toUpperCase() === 'SLP' ? 'SLP' : 'RLM';
    const consumption = parseInt(params.consumption || params.verbrauch || params.jahresverbrauch || 100000, 10) || 100000;
    const peakLoad = measurement === 'RLM' ? (parseInt(params.peakLoad || params.leistungKw || params.jahreshoechstleistung || 32, 10) || 32) : null;
    const usageHours = measurement === 'RLM'
        ? (parseInt(params.usageHours || params.benutzungsstunden, 10) || Math.round(consumption / peakLoad))
        : null;
    const gridLayer = String(params.gridLayer || params.netzebene || params.druckstufe || (matchedTariff && matchedTariff.gridLayer) || 'LOW').toUpperCase();
    const deliveryStart = String(params.deliveryStart || params.lieferbeginn || (matchedTariff && matchedTariff.deliveryFrom) || `${new Date().getFullYear() + 1}-01-01`).slice(0, 10);
    const deliveryEnd = String((matchedTariff && matchedTariff.deliveryTo) || `${parseInt(deliveryStart.slice(0, 4), 10)}-12-31`).slice(0, 10);
    const durationMonths = parseInt(params.contractDurationMonths || (matchedTariff && matchedTariff.contractDurationMonths) || 12, 10) || 12;
    const productId = parseInt(params.productId || (matchedTariff && matchedTariff.productId) || (isGas ? 1574 : 1573), 10);
    const surchargeCt = parseFloat(params.surchargeCt ?? params.aufschlagCt ?? (matchedTariff && matchedTariff.surchargeCtNetto) ?? 0) || 0;
    const businessSector = String(params.businessSector || params.brancheId || (isGas ? '35' : '36'));
    const loadProfile = String(params.loadProfile || params.lastprofilId || (isGas ? '6' : '25'));
    const salesNumber = parseInt(params.salesNumber || 10011, 10) || 10011;

    // Resolve address
    const address = await resolveDeliveryAddress({
        plz: params.plz || params.zip || '44379',
        city: params.city || params.ort,
        street: params.street || params.strasse,
        houseNumber: params.houseNr || params.houseNumber || params.hausnummer || '1'
    });

    const companyName = String(params.companyName || params.firma || params.unternehmen || 'Gewerbekunde').trim();
    const legalForm = String(params.legalForm || params.rechtsform || 'GmbH').trim();
    const rawSalutation = String(params.salutation || params.anrede || 'Herr').trim();
    const salutation = ['Herr', 'Frau', 'Divers'].includes(rawSalutation) ? rawSalutation : 'Herr';
    const firstName = String(params.firstName || params.vorname || 'Max').trim();
    const lastName = String(params.lastName || params.nachname || 'Mustermann').trim();
    const email = String(params.email || params.mail || 'b2b@alpha-energie.de').trim();
    const phone = String(params.phone || params.telefon || '').trim();
    const meterNumber = String(params.meterNumber || params.zaehlernummer || '').trim();
    const maloId = String(params.maloId || params.marktlokationsId || '').trim();
    const contractOrderType = params.contractOrderType || (params.currentProvider || params.vorversorger ? 'CHANGE_PROVIDER' : 'NEW');
    const isOffer = params.isOffer !== false;
    const isDraft = Boolean(params.isDraft);

    const contactMediumList = [{ contactType: 'EMAIL', contactValue: email }];
    if (phone) {
        contactMediumList.push({ contactType: 'PHONE', contactValue: phone });
    }

    const contractOrderData = {
        ...(meterNumber.length >= 5 ? { meterNumber } : {}),
        ...(/^[0-9]{11}$/.test(maloId) ? { marketLocationId: maloId } : {}),
        contractTimeframe: {
            timeSeries: durationMonths,
            timeSeriesType: 'MONTH',
            contractDurationMonths: durationMonths,
            deliveryStart,
            deliveryEnd
        },
        contractDuration: durationMonths,
        readableContractDuration: `${durationMonths} Monate`,
        loadProfile,
        loadProfileName: 'Standard',
        deliveryStart,
        gridLayer,
        measurement,
        measurementMethod: measurement,
        businessSector,
        businessSectorName: params.businessSectorName || 'Gewerbe',
        ...(measurement === 'RLM' ? { peakLoad, usageHours } : {})
    };

    if (contractOrderType === 'CHANGE_PROVIDER' && (params.currentProvider || params.vorversorger)) {
        contractOrderData.previousProvider = {
            id: Number(params.previousProviderId) || 1,
            name: String(params.currentProvider || params.vorversorger)
        };
        contractOrderData.deliveryASAP = true;
    }

    const orderInput = {
        orderBaseData: {
            contractHolder: {
                personType: 'COMMERCIAL',
                contactPersonIsDifferent: false,
                personType_COMMERCIAL: {
                    companyName,
                    legalForm
                }
            },
            deliveryAddress: {
                country: 'DE',
                zip: address.zip,
                city: address.city,
                street: address.street,
                houseNumber: address.houseNumber
            },
            contactPersonList: [
                {
                    salutation,
                    firstName: firstName.length >= 2 ? firstName : 'Max',
                    lastName: lastName.length >= 2 ? lastName : 'Mustermann',
                    academicTitle: '',
                    dateOfBirth: null
                }
            ],
            contactMediumList,
            productPayment: params.iban && String(params.iban).length > 10
                ? {
                    paymentType: 'DEBIT_CHARGE',
                    paymentType_DEBIT_CHARGE: {
                        bankAccount: { iban: String(params.iban).replace(/\s+/g, '') },
                        bankAccountHolderIsDifferent: false
                    }
                }
                : {
                    paymentType: 'INVOICE',
                    paymentType_INVOICE: {}
                },
            customerConfirmation: {},
            onlyOnlineCustomerCommunication: false
        },
        productTypeFilter: [
            {
                type: productType,
                consumption,
                loadProfile,
                deliveryStart,
                businessSector: Number(businessSector) || 36,
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
                        contractOrderType,
                        consumption,
                        surcharge: surchargeCt > 0 ? [{ priceType: 'WORK_PRICE', surcharge: surchargeCt }] : [],
                        additionalData: { pairList: [] },
                        [`contractOrderType_${contractOrderType}`]: contractOrderData
                    }
                },
                optionList: []
            }
        ],
        salesNumber
    };

    let vpPortalResponse = null;
    let vpOrderId = null;
    let vpOrderNumber = null;
    let vpPortalError = null;

    if (params.syncToVpPortal !== false) {
        try {
            const gqlRes = await vpGraphql(
                'AddOrderByProductOffer',
                `mutation AddOrderByProductOffer($order: AddOrderByProductOfferOrderInput!) {
                    addOrderByProductOffer(order: $order)
                }`,
                { order: orderInput }
            );
            if (gqlRes.errors && gqlRes.errors.length > 0) {
                vpPortalError = gqlRes.errors[0].message;
            } else if (gqlRes.data && gqlRes.data.addOrderByProductOffer) {
                vpPortalResponse = gqlRes.data.addOrderByProductOffer;
                vpOrderId = vpPortalResponse.id || vpPortalResponse._id || (vpPortalResponse.order && (vpPortalResponse.order.id || vpPortalResponse.order._id)) || null;
                vpOrderNumber = vpPortalResponse.orderNumber || (vpPortalResponse.order && vpPortalResponse.order.orderNumber) || null;
            }
        } catch (err) {
            vpPortalError = err.message;
        }
    }

    // Generate official PDF documents ("Angebot.pdf" & "Auftragsformular.pdf") if requested or by default on offer creation
    let documents = [];
    if (params.generateDocuments !== false) {
        try {
            documents = await generateVpOrderDocuments({
                orderId: vpOrderId || '124',
                productId,
                salesNumber,
                branch: isGas ? 'gas' : 'strom',
                businessSector,
                consumption,
                contractOrderType,
                deliveryStart,
                loadProfile,
                companyName,
                legalForm,
                salutation,
                firstName,
                lastName,
                zip: address.zip,
                city: address.city,
                street: address.street,
                houseNumber: address.houseNumber,
                meterNumber,
                maloId
            });
        } catch (docErr) {
            console.warn('[RLM-API] Document generation warning:', docErr.message);
        }
    }

    return {
        vpOrderId,
        vpOrderNumber,
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
    resolveDeliveryAddress,
    getRlmPortalOptions,
    createVpPortalOffer,
    generateVpOrderDocuments,
    getVpPortalOrders,
    ensureFreshVpSession,
    refreshVpSessionViaHttp,
    refreshVpSessionViaPlaywright,
    saveCookiesToDisk
};

