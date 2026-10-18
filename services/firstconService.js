const axios = require('axios');

const DEFAULT_FIRSTCON_TOKEN = process.env.FIRSTCON_ORDERFLOW_TOKEN || '1994e155-ce1c-47a7-83c8-21660f0857a7';
const FIRSTCON_API_BASE = process.env.FIRSTCON_API_URL || 'https://dev01.firstcon.de/api/v2';

// In-memory caches to keep live calculation responses fast (< 200ms after warm-up)
const tokenCache = new Map(); // integrationKey -> { jwt, expiresAt, payload }
const gridCache = new Map();  // `${categoryId}:${plz}` -> { data, expiresAt }
const tariffsCache = new Map(); // `${categoryId}` -> { data, expiresAt }
const streetsCache = new Map(); // `${categoryId}:${plz}:${gridNo}` -> { data, expiresAt }

function sanitizeIntegrationToken(rawToken) {
    const trimmed = String(rawToken || '').trim();
    if (!trimmed || trimmed === 'alpha-energie-live' || trimmed === 'TOKEN') {
        return DEFAULT_FIRSTCON_TOKEN;
    }
    return trimmed;
}

function decodeJwtPayload(jwtStr) {
    try {
        const parts = String(jwtStr || '').split('.');
        if (parts.length < 2) return null;
        return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    } catch (e) {
        return null;
    }
}

/**
 * Authenticates against Firstcon Orderflow API v2 and returns a Bearer JWT.
 */
async function authenticateOrderflow(customToken, forceRefresh = false) {
    const integrationKey = sanitizeIntegrationToken(customToken);
    const now = Date.now();

    if (!forceRefresh && tokenCache.has(integrationKey)) {
        const cached = tokenCache.get(integrationKey);
        if (cached && cached.expiresAt > now) {
            return cached;
        }
    }

    let res;
    let activeKey = integrationKey;
    try {
        res = await axios.post(
            `${FIRSTCON_API_BASE}/Security/AuthenticateOrderflow`,
            { integrationKey: activeKey },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 8000
            }
        );
    } catch (err) {
        if (activeKey !== DEFAULT_FIRSTCON_TOKEN) {
            activeKey = DEFAULT_FIRSTCON_TOKEN;
            if (!forceRefresh && tokenCache.has(activeKey)) {
                const cached = tokenCache.get(activeKey);
                if (cached && cached.expiresAt > now) {
                    return cached;
                }
            }
            res = await axios.post(
                `${FIRSTCON_API_BASE}/Security/AuthenticateOrderflow`,
                { integrationKey: activeKey },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 8000
                }
            );
        } else {
            throw err;
        }
    }

    const jwt = typeof res.data === 'string' ? res.data.trim() : (res.data?.accessToken || '');
    if (!jwt) {
        throw new Error('Firstcon AuthenticateOrderflow returned empty token');
    }

    const payload = decodeJwtPayload(jwt);
    const entry = {
        jwt,
        integrationKey: activeKey,
        requestedToken: integrationKey,
        payload,
        expiresAt: now + 25 * 60 * 1000 // 25 minutes
    };
    tokenCache.set(integrationKey, entry);
    tokenCache.set(activeKey, entry);
    return entry;
}

/**
 * Helper to execute an authenticated Firstcon v2 request with automatic 401 token refresh.
 */
async function firstconRequest(method, endpoint, { data, params, token, timeout = 12000 } = {}) {
    let auth = await authenticateOrderflow(token, false);
    const makeCall = async (jwt) => {
        return axios({
            method,
            url: `${FIRSTCON_API_BASE}${endpoint}`,
            data,
            params,
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout,
            validateStatus: () => true
        });
    };

    let response = await makeCall(auth.jwt);
    if (response.status === 401) {
        auth = await authenticateOrderflow(token, true);
        response = await makeCall(auth.jwt);
    }
    return response;
}

/**
 * Resolves EnergyGridNumber and City for a given 5-digit PLZ and branch ('strom' | 'gas').
 */
async function findEnergyGrid(plz, branch = 'strom', token) {
    const cleanPlz = String(plz || '44379').replace(/\D/g, '').slice(0, 5);
    const energyCategoryId = branch === 'gas' ? 2 : 1;
    const cacheKey = `${energyCategoryId}:${cleanPlz}`;
    const now = Date.now();

    if (gridCache.has(cacheKey)) {
        const cached = gridCache.get(cacheKey);
        if (cached.expiresAt > now) {
            return cached.data;
        }
    }

    const res = await firstconRequest('POST', '/Tariff/FindEnergyGrid', {
        token,
        data: {
            EnergyCategoryId: energyCategoryId,
            SearchString: cleanPlz
        }
    });

    if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
        return null;
    }

    const grids = res.data;
    const primary = grids[0];
    let resolvedGridNo = primary.EnergyGridNumber || '';
    const resolvedZip = primary.ZipCode || cleanPlz;
    const resolvedCity = primary.City || '';

    // When CountOfGrids > 1 (e.g., Berlin 10115, Köln 50667, München 80331), FindEnergyGrid returns EnergyGridNumber: null.
    // Resolve the primary EnergyGridNumber via /Tariff/GetStreets.
    if (!resolvedGridNo && resolvedCity) {
        const streetsRes = await firstconRequest('POST', '/Tariff/GetStreets', {
            token,
            data: {
                EnergyCategoryId: energyCategoryId,
                ZipCode: resolvedZip,
                City: resolvedCity
            }
        });
        if (streetsRes.status === 200 && Array.isArray(streetsRes.data) && streetsRes.data.length > 0) {
            const firstWithGrid = streetsRes.data.find(s => s && s.EnergyGridNumber);
            if (firstWithGrid) {
                resolvedGridNo = firstWithGrid.EnergyGridNumber;
            }
            const namedStreets = streetsRes.data
                .map(item => item && item.Street ? String(item.Street).trim() : '')
                .filter(Boolean);
            if (namedStreets.length > 0 && resolvedGridNo) {
                const uniqueStreets = [...new Set(namedStreets)];
                streetsCache.set(`${energyCategoryId}:${resolvedZip}:${resolvedGridNo}`, {
                    data: uniqueStreets,
                    expiresAt: now + 60 * 60 * 1000
                });
            }
        }
    }

    const result = {
        energyCategoryId,
        zipCode: resolvedZip,
        city: resolvedCity,
        energyGridNumber: resolvedGridNo,
        countOfGrids: primary.CountOfGrids || grids.length,
        grids
    };

    gridCache.set(cacheKey, { data: result, expiresAt: now + 60 * 60 * 1000 });
    return result;
}

/**
 * Fetches available streets for a PLZ & EnergyGridNumber from Firstcon.
 */
async function getStreets(plz, city, energyGridNumber, branch = 'strom', token) {
    const cleanPlz = String(plz || '').replace(/\D/g, '').slice(0, 5);
    if (!cleanPlz) return [];
    const energyCategoryId = branch === 'gas' ? 2 : 1;

    let resolvedCity = city;
    let resolvedGrid = energyGridNumber;
    if (!resolvedCity || !resolvedGrid) {
        const gridInfo = await findEnergyGrid(cleanPlz, branch, token);
        if (gridInfo) {
            resolvedCity = resolvedCity || gridInfo.city;
            resolvedGrid = resolvedGrid || gridInfo.energyGridNumber;
        }
    }
    if (!resolvedGrid) return [];

    const cacheKey = `${energyCategoryId}:${cleanPlz}:${resolvedGrid}`;
    const now = Date.now();
    if (streetsCache.has(cacheKey)) {
        const cached = streetsCache.get(cacheKey);
        if (cached.expiresAt > now) return cached.data;
    }

    let res = await firstconRequest('POST', '/Tariff/GetStreets', {
        token,
        data: {
            EnergyCategoryId: energyCategoryId,
            City: resolvedCity || '',
            ZipCode: cleanPlz,
            EnergyGridNumber: resolvedGrid
        }
    });

    let streets = Array.isArray(res.data)
        ? res.data.map(item => item && item.Street ? String(item.Street).trim() : '').filter(Boolean)
        : [];

    if (streets.length === 0 && resolvedCity) {
        const cityRes = await firstconRequest('POST', '/Tariff/GetStreets', {
            token,
            data: {
                EnergyCategoryId: energyCategoryId,
                City: resolvedCity
            }
        });
        if (cityRes.status === 200 && Array.isArray(cityRes.data)) {
            streets = cityRes.data
                .map(item => item && item.Street ? String(item.Street).trim() : '')
                .filter(Boolean);
        }
    }

    const uniqueStreets = [...new Set(streets)];
    streetsCache.set(cacheKey, { data: uniqueStreets, expiresAt: now + 60 * 60 * 1000 });
    return uniqueStreets;
}

/**
 * Fetches the official Alpha Energie tariffs configured in Firstcon for Strom (1) or Gas (2).
 */
async function getFirstconTariffs(branch = 'strom', token) {
    const energyCategoryId = branch === 'gas' ? 2 : 1;
    const cacheKey = String(energyCategoryId);
    const now = Date.now();

    if (tariffsCache.has(cacheKey)) {
        const cached = tariffsCache.get(cacheKey);
        if (cached.expiresAt > now) return cached.data;
    }

    const res = await firstconRequest('POST', '/Tariff/GetTariffs', {
        token,
        data: {
            EnergyCategoryId: energyCategoryId,
            TariffFilterType: 1,
            CustomerTypeId: 1
        }
    });

    if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
        return null;
    }

    tariffsCache.set(cacheKey, { data: res.data, expiresAt: now + 30 * 60 * 1000 });
    return res.data;
}

/**
 * Maps a Firstcon tariff object to our canonical frontend tariff slot ('alpha-basic' | 'alpha-time' | 'alpha-premium').
 */
function mapFirstconTariffToSlotId(fcTariff) {
    const name = String(fcTariff?.Name || fcTariff?.NameDisplay || '').toLowerCase();
    if (name.includes('basic') || name.includes('basis')) return 'alpha-basic';
    if (name.includes('time') || name.includes('plus')) return 'alpha-time';
    if (name.includes('premium')) return 'alpha-premium';
    if (fcTariff?.TariffId === 279 || fcTariff?.TariffId === 226) return 'alpha-basic';
    if (fcTariff?.TariffId === 280 || fcTariff?.TariffId === 227) return 'alpha-time';
    if (fcTariff?.TariffId === 281 || fcTariff?.TariffId === 228) return 'alpha-premium';
    return 'alpha-basic';
}

function normalizeFirstconBranch(branch) {
    const raw = String(branch || 'strom').toLowerCase().trim();
    if (raw === 'gas' || raw === 'oekogas' || raw === 'erdgas') return 'gas';
    if (raw === 'waerme' || raw === 'waermestrom' || raw === 'waermepumpe' || raw === 'htnt') return 'waerme';
    if (raw === 'ladestrom' || raw === 'autostrom' || raw === 'wallbox' || raw === 'mobility') return 'ladestrom';
    return 'strom';
}

/**
 * Calculates live tariffs & prices directly from Firstcon Orderflow API v2.
 */
async function calculateLiveTariffs({ plz, consumption, consumptionHt, consumptionNt, meterType, currentAbschlag, branch = 'strom', token }) {
    const normalizedBranch = normalizeFirstconBranch(branch);
    const isGas = normalizedBranch === 'gas';
    const isWaerme = normalizedBranch === 'waerme';
    const isLadestrom = normalizedBranch === 'ladestrom';
    const energyCategoryId = isGas ? 2 : 1;
    const defaultKwh = isGas ? 12000 : (isWaerme ? 6000 : (isLadestrom ? 2500 : 2500));
    const parsedHt = parseInt(consumptionHt, 10) || 0;
    const parsedNt = parseInt(consumptionNt, 10) || 0;
    const htNtSum = parsedHt + parsedNt;
    const kwh = Math.max(500, (isWaerme && htNtSum >= 500) ? htNtSum : (parseInt(consumption, 10) || defaultKwh));
    const resolvedMeterType = isGas ? 'gas' : (isWaerme ? (meterType === 'et' ? 'et' : 'htnt') : 'et');
    const resolvedMeterTypeId = isGas ? 3 : (resolvedMeterType === 'htnt' ? 2 : 1);
    const resolvedHt = isWaerme ? (parsedHt > 0 ? parsedHt : (resolvedMeterType === 'et' ? kwh : Math.round(kwh * 0.6))) : kwh;
    const resolvedNt = isWaerme ? (resolvedMeterType === 'et' ? 0 : (parsedNt > 0 ? parsedNt : Math.max(0, kwh - resolvedHt))) : 0;
    const cleanPlz = String(plz || '44379').replace(/\D/g, '').slice(0, 5) || '44379';

    // 1. Resolve grid and tariffs in parallel
    let [gridInfo, fcTariffs] = await Promise.all([
        findEnergyGrid(cleanPlz, normalizedBranch, token),
        getFirstconTariffs(normalizedBranch, token)
    ]);

    if ((!gridInfo || !gridInfo.energyGridNumber) && cleanPlz !== '44379') {
        gridInfo = await findEnergyGrid('44379', normalizedBranch, token);
    }

    if (!gridInfo || !gridInfo.energyGridNumber || !fcTariffs || fcTariffs.length === 0) {
        return null;
    }

    // If Firstcon provides dedicated IsHeatFlowTariff or IsMobilityTariff tariffs, prefer them
    let activeFcTariffs = fcTariffs;
    if (isWaerme) {
        const heatFlowOnly = fcTariffs.filter(t => t && t.IsHeatFlowTariff === true);
        if (heatFlowOnly.length > 0) {
            activeFcTariffs = heatFlowOnly;
        }
    } else if (isLadestrom) {
        const mobilityOnly = fcTariffs.filter(t => t && t.IsMobilityTariff === true);
        if (mobilityOnly.length > 0) {
            activeFcTariffs = mobilityOnly;
        }
    }

    const tariffIds = activeFcTariffs.map(t => t.TariffId).filter(Boolean);

    // 2. Fetch live prices for the resolved EnergyGridNumber & Consumption
    const pricesRes = await firstconRequest('POST', '/Tariff/GetPrices', {
        token,
        data: {
            EnergyCategoryId: energyCategoryId,
            TariffIds: tariffIds,
            EnergyGridNumber: gridInfo.energyGridNumber,
            Consumption: kwh
        }
    });

    if (pricesRes.status !== 200 || !Array.isArray(pricesRes.data) || pricesRes.data.length === 0) {
        return null;
    }

    const priceByTariffId = new Map();
    for (const p of pricesRes.data) {
        if (p && p.TariffId) {
            priceByTariffId.set(p.TariffId, p);
        }
    }

    // Sort returned price tiers ascending by yearly gross cost so that:
    // index 0 (cheapest) -> alpha-basic
    // index 1 (middle)   -> alpha-time
    // index 2 (highest)  -> alpha-premium
    const sortedPrices = pricesRes.data
        .filter(p => p && (Number(p.TotalPricePerYearGross) > 0 || Number(p.PricePerUnitGross) > 0))
        .sort((a, b) => {
            const totalA = Number(a.TotalPricePerYearGross) || ((kwh * ((Number(a.PricePerUnitGross) || 0) / 100)) + ((Number(a.PriceBasicPerMonthGross) || 0) * 12));
            const totalB = Number(b.TotalPricePerYearGross) || ((kwh * ((Number(b.PricePerUnitGross) || 0) / 100)) + ((Number(b.PriceBasicPerMonthGross) || 0) * 12));
            return totalA - totalB;
        });

    // Reference Grundversorger benchmark when user has not entered a custom higher Abschlag
    const parsedAbschlag = parseFloat(currentAbschlag);
    const refGrundversorgerYearly = isGas
        ? (kwh * 0.215) + (29.50 * 12)
        : (kwh * 0.415) + (29.90 * 12);
    const userYearlyOld = (!isNaN(parsedAbschlag) && parsedAbschlag > 0)
        ? Math.max(parsedAbschlag * 12, refGrundversorgerYearly)
        : refGrundversorgerYearly;

    const slotMetadata = isGas ? {
        'alpha-basic': {
            name: 'ALPHA BASIC 24 GAS',
            badge: 'Fair & Preisstabil',
            isBestseller: false,
            ecoCertificate: 'Erdgas mit freiwilligem Klimaschutzbeitrag'
        },
        'alpha-time': {
            name: 'ALPHA TIME 24 GAS',
            badge: 'Bestseller & Spar-Vorteil',
            isBestseller: true,
            ecoCertificate: 'Erdgas mit freiwilligem Klimaschutzbeitrag'
        },
        'alpha-premium': {
            name: 'ALPHA PREMIUM 24 GAS',
            badge: '24 Monate Preisschutz & Komfort',
            isBestseller: false,
            ecoCertificate: 'Erdgas mit freiwilligem Klimaschutzbeitrag'
        }
    } : (isWaerme ? {
        'alpha-basic': {
            name: 'ALPHA BASIC 24 WÄRME',
            badge: 'Wärmepumpe & Nachtspeicher (HT/NT)',
            isBestseller: false,
            ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien'
        },
        'alpha-time': {
            name: 'ALPHA TIME 24 WÄRME',
            badge: 'Bestseller • § 14a EnWG & HT/NT',
            isBestseller: true,
            ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien'
        },
        'alpha-premium': {
            name: 'ALPHA PREMIUM 24 WÄRME',
            badge: '24 Monate Preisschutz • HT/NT Komfort',
            isBestseller: false,
            ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien'
        }
    } : (isLadestrom ? {
        'alpha-basic': {
            name: 'ALPHA BASIC 24 LADESTROM',
            badge: 'Wallbox & E-Auto (§ 14a EnWG)',
            isBestseller: false,
            ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien'
        },
        'alpha-time': {
            name: 'ALPHA TIME 24 LADESTROM',
            badge: 'Bestseller • Wallbox & E-Auto',
            isBestseller: true,
            ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien'
        },
        'alpha-premium': {
            name: 'ALPHA PREMIUM 24 LADESTROM',
            badge: '24 Monate Preisschutz • Ladestrom VIP',
            isBestseller: false,
            ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien'
        }
    } : {
        'alpha-basic': {
            name: 'ALPHA BASIC 24',
            badge: 'Flexibel & Günstig',
            isBestseller: false,
            ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien'
        },
        'alpha-time': {
            name: 'ALPHA TIME 24',
            badge: 'Bestseller & Spar-Vorteil',
            isBestseller: true,
            ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien'
        },
        'alpha-premium': {
            name: 'ALPHA PREMIUM 24',
            badge: '24 Monate Preisschutz & VIP',
            isBestseller: false,
            ecoCertificate: 'Ökostrom aus 100 % erneuerbaren Energien'
        }
    }));

    // Order tariffs consistently first: alpha-basic (0), alpha-time (1), alpha-premium (2)
    const orderRank = { 'alpha-basic': 1, 'alpha-time': 2, 'alpha-premium': 3 };
    const orderedFcTariffs = [...activeFcTariffs].sort((a, b) => {
        const slotA = mapFirstconTariffToSlotId(a);
        const slotB = mapFirstconTariffToSlotId(b);
        return (orderRank[slotA] || 99) - (orderRank[slotB] || 99);
    });

    const mappedTariffs = [];
    for (let idx = 0; idx < orderedFcTariffs.length; idx++) {
        const fcTariff = orderedFcTariffs[idx];
        const price = sortedPrices[idx] || priceByTariffId.get(fcTariff.TariffId);
        if (!price) continue;

        const slotId = mapFirstconTariffToSlotId(fcTariff);
        const meta = slotMetadata[slotId] || slotMetadata['alpha-basic'];

        const workingPriceCt = Number(price.PricePerUnitGross) || 0;
        const basePriceEurMonth = Number(price.PriceBasicPerMonthGross) || 0;
        const basePriceYearGross = Number(price.PriceBasicPerYearGross) || (basePriceEurMonth * 12);
        const computedYearlyEur = (kwh * (workingPriceCt / 100)) + basePriceYearGross;
        const grossYearlyEur = Number(price.TotalPricePerYearGross) || Math.round(computedYearlyEur * 100) / 100;
        const totalPricePerMonthGross = Number(price.TotalPricePerMonthGross) || Math.round((grossYearlyEur / 12) * 100) / 100;
        const monthlyPayment = Number(price.MonthlyAdvancePaymentGross) || Math.ceil(totalPricePerMonthGross);
        const savingsEur = Math.max(40, Math.round(userYearlyOld - grossYearlyEur));

        const defaultFeatures = isGas ? [
            `${fcTariff.PriceGuaranteeDuration || 24} Monate volle Preisgarantie`,
            'Erdgas mit freiwilligem Klimaschutzbeitrag',
            'Förderung ausgewählter Klimaschutzprojekte',
            'Kostenloser & automatischer Wechselservice'
        ] : (isWaerme ? [
            `${fcTariff.PriceGuaranteeDuration || 24} Monate volle Preisgarantie`,
            'Für Wärmepumpe (§ 14a EnWG) & Nachtspeicherheizung (HT/NT)',
            'Geeignet für Doppeltarifzähler (HT/NT) & Eintarifzähler',
            'Ökostrom aus 100 % erneuerbaren Energien'
        ] : (isLadestrom ? [
            `${fcTariff.PriceGuaranteeDuration || 24} Monate volle Preisgarantie`,
            'Für Heim-Wallbox (11 kW / 22 kW) & Elektroauto (§ 14a EnWG)',
            'Ökostrom aus 100 % erneuerbaren Energien (ok-power+)',
            'Kostenloser & automatischer Wechselservice'
        ] : [
            `${fcTariff.PriceGuaranteeDuration || 24} Monate volle Preisgarantie`,
            'Ökostrom aus 100 % erneuerbaren Energien',
            'Monatlich kündbar nach der Erstlaufzeit',
            'Kostenloser Wechselservice & Abmeldung'
        ]));

        const rawFcFeatures = Array.isArray(fcTariff.AdditionalFeatures)
            ? fcTariff.AdditionalFeatures
                .filter(f => f && !/bonus|prämie/i.test(f))
                .map(f => {
                    if (/kurzer\s+Vertragslaufzeit/i.test(f)) {
                        return 'Attraktives Preis-Leistungs-Verhältnis mit 24 Monaten Planungssicherheit';
                    }
                    if (/kompensation|klimaneutral|co2/i.test(f)) {
                        return 'Erdgas mit freiwilligem Klimaschutzbeitrag';
                    }
                    if (/^100\s*%?\s*Ökostrom$/i.test(f.trim())) {
                        return 'Ökostrom aus 100 % erneuerbaren Energien';
                    }
                    return f;
                })
            : [];

        const mergedFeatures = (isWaerme || isLadestrom) ? [
            ...defaultFeatures,
            ...rawFcFeatures
        ] : [
            `${fcTariff.PriceGuaranteeDuration || 24} Monate volle Preisgarantie`,
            ...rawFcFeatures,
            ...defaultFeatures
        ];
        const uniqueFeatures = [];
        for (const item of mergedFeatures) {
            if (!uniqueFeatures.includes(item) && uniqueFeatures.length < 4) {
                uniqueFeatures.push(item);
            }
        }
        const features = uniqueFeatures.slice(0, 4);

        mappedTariffs.push({
            id: slotId,
            firstconTariffId: fcTariff.TariffId,
            firstconName: fcTariff.NameDisplay || fcTariff.Name,
            brandId: fcTariff.BrandId || 54,
            brandName: fcTariff.BrandName || 'Alpha Energie',
            energyGridNumber: gridInfo.energyGridNumber,
            city: gridInfo.city,
            branch: normalizedBranch,
            meterType: resolvedMeterType,
            meterTypeId: resolvedMeterTypeId,
            consumptionHt: resolvedHt,
            consumptionNt: resolvedNt,
            name: meta.name,
            badge: meta.badge,
            isBestseller: meta.isBestseller,
            workingPriceCt,
            workingPriceHtCt: workingPriceCt,
            workingPriceNtCt: workingPriceCt,
            workingPriceNetCt: Number(price.PricePerUnitNet) || 0,
            basePriceEurMonth,
            basePriceEur: basePriceEurMonth,
            basePriceYearGross,
            bonusEur: Number(fcTariff.BonusAmount) || 0,
            priceGuaranteeMonths: Number(fcTariff.PriceGuaranteeDuration) || 24,
            contractTermMonths: Number(fcTariff.TermInMonth) || 24,
            ecoCertificate: meta.ecoCertificate,
            features,
            monthlyPayment,
            monthlyAdvancePaymentGross: monthlyPayment,
            totalPricePerMonthGross,
            grossYearlyEur: Math.round(grossYearlyEur * 100) / 100,
            netYearlyEur: Number(price.TotalPricePerYearNet) || 0,
            savingsEur,
            savingsYear: savingsEur
        });
    }

    mappedTariffs.sort((a, b) => (orderRank[a.id] || 99) - (orderRank[b.id] || 99));

    const maxSavings = Math.max(...mappedTariffs.map(t => t.savingsEur), 0);

    return {
        source: 'firstcon-live',
        firstconConnected: true,
        plz: gridInfo.zipCode || cleanPlz,
        city: gridInfo.city,
        energyGridNumber: gridInfo.energyGridNumber,
        consumption: kwh,
        consumptionHt: resolvedHt,
        consumptionNt: resolvedNt,
        meterType: resolvedMeterType,
        meterTypeId: resolvedMeterTypeId,
        branch: normalizedBranch,
        maxSavings,
        tariffs: mappedTariffs
    };
}

/**
 * Formats a date string (YYYY-MM-DD or DD.MM.YYYY) to Firstcon's MM-DD-YYYY format.
 */
function formatBirthdayForFirstcon(birthDateStr) {
    if (!birthDateStr) return '01-01-1985';
    const str = String(birthDateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [yyyy, mm, dd] = str.split('-');
        return `${mm}-${dd}-${yyyy}`;
    }
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(str)) {
        const [dd, mm, yyyy] = str.split('.');
        return `${mm}-${dd}-${yyyy}`;
    }
    return '01-01-1985';
}

/**
 * Validates and submits a customer order to Firstcon API v2 (/Validation & /Contract).
 */
async function submitOrderToFirstcon(orderPayload) {
    const token = sanitizeIntegrationToken(orderPayload.orderflowToken);
    const normalizedBranch = normalizeFirstconBranch(orderPayload.branch);
    const isGas = normalizedBranch === 'gas';
    const isWaerme = normalizedBranch === 'waerme';
    const energyCategoryId = isGas ? 2 : 1;
    const cleanPlz = String(orderPayload.plz || '44379').replace(/\D/g, '').slice(0, 5) || '44379';
    const parsedHt = parseInt(orderPayload.consumptionHt, 10) || 0;
    const parsedNt = parseInt(orderPayload.consumptionNt, 10) || 0;
    const htNtSum = parsedHt + parsedNt;
    const kwh = Math.max(500, (isWaerme && htNtSum >= 500) ? htNtSum : (parseInt(orderPayload.consumption, 10) || (isGas ? 12000 : (isWaerme ? 6000 : 2500))));
    const cleanIban = String(orderPayload.iban || '').replace(/\s+/g, '').toUpperCase();
    const resolvedMeterTypeId = isGas
        ? 3
        : ((orderPayload.meterType === 'htnt' || Number(orderPayload.meterTypeId) === 2 || (isWaerme && orderPayload.meterType !== 'et')) ? 2 : 1);

    // 1. Calculate / fetch live Firstcon tariff & price details for the customer's PLZ & kWh
    const liveCalc = await calculateLiveTariffs({
        plz: cleanPlz,
        consumption: kwh,
        consumptionHt: parsedHt,
        consumptionNt: parsedNt,
        meterType: orderPayload.meterType,
        branch: normalizedBranch,
        token
    });

    let matchedTariff = null;
    if (liveCalc && Array.isArray(liveCalc.tariffs)) {
        matchedTariff = liveCalc.tariffs.find(t =>
            t.id === orderPayload.tariffId ||
            String(t.firstconTariffId) === String(orderPayload.firstconTariffId)
        ) || liveCalc.tariffs[0];
    }

    const firstconTariffId = matchedTariff
        ? matchedTariff.firstconTariffId
        : (isGas
            ? (orderPayload.tariffId === 'alpha-premium' ? 228 : (orderPayload.tariffId === 'alpha-time' ? 227 : 226))
            : (orderPayload.tariffId === 'alpha-premium' ? 281 : (orderPayload.tariffId === 'alpha-time' ? 280 : 279)));

    const fullName = `${orderPayload.firstName || ''} ${orderPayload.lastName || ''}`.trim();
    const authInfo = await authenticateOrderflow(token, false).catch(() => null);
    const resolvedBrandId = Number(authInfo?.payload?.BrandId) || 54;
    const resolvedSalesPartnerId = Number(authInfo?.payload?.SalesPartnerId) || 13341;

    // 2. Verify bank account & obtain ClickwrapperId in parallel
    // Note: /Tariff/GetClickWrapperId renders the PDF contract & SEPA documents on Firstcon's server (~15-18s)
    const [bankVerificationRes, clickWrapperRes] = await Promise.all([
        firstconRequest('POST', '/Verification/VerifyBankAccount', {
            token,
            timeout: 15000,
            data: { iban: cleanIban }
        }).catch(() => ({ status: 0, data: null })),
        firstconRequest('POST', '/Tariff/GetClickWrapperId', {
            token,
            timeout: 35000,
            data: {
                energyCategoryId,
                customerTypeId: 1,
                tariffId: firstconTariffId,
                generateSepaDocument: true,
                customerName: fullName,
                iban: cleanIban
            }
        }).catch(() => ({ status: 0, data: '' }))
    ]);

    const clickwrapperId = (clickWrapperRes && clickWrapperRes.status === 200 && typeof clickWrapperRes.data === 'string')
        ? clickWrapperRes.data.replace(/^"+|"+$/g, '').trim()
        : '';

    const salutationStr = String(orderPayload.salutation || 'Herr').toLowerCase();
    const salutationId = salutationStr.includes('frau') ? '2' : (salutationStr.includes('firma') || salutationStr.includes('familie') ? '5' : '1');

    const contractPayload = {
        BrandId: resolvedBrandId,
        SalesPartnerId: resolvedSalesPartnerId,
        ExternalOrderNo: orderPayload.orderNumber ? String(orderPayload.orderNumber) : null,
        BankAccount: {
            AccountHolder: fullName,
            Bic: '',
            Iban: cleanIban,
            Institute: ''
        },
        ContractTypeId: energyCategoryId,
        CustomerTypeId: 1,
        DesiredStartOfDelivery: null,
        LiableToVat: true,
        SendMailOrderConfirmation: true,
        Meter: {
            MeterNumber: String(orderPayload.meterNumber || '').trim(),
            MeterTypeId: resolvedMeterTypeId
        },
        PaymentViaSepa: Boolean(cleanIban),
        PriceDetails: {
            IsGrossPrice: true,
            KWhPerYear: kwh,
            PriceBasicPerMonth: matchedTariff ? matchedTariff.basePriceEurMonth : 29.40,
            PricePerMonth: matchedTariff ? matchedTariff.totalPricePerMonthGross : (parseFloat(orderPayload.monthlyPayment) || 99.53),
            PricePerUnit: matchedTariff ? matchedTariff.workingPriceCt : 33.66,
            PricePerYear: matchedTariff ? matchedTariff.grossYearlyEur : 1194.36
        },
        ProviderChangeReasonId: '1',
        SupplyContact: {
            Address: {
                AddressTypeId: 7,
                City: String(orderPayload.city || liveCalc?.city || 'Dortmund').trim(),
                Street: String(orderPayload.street || 'Alter Hellweg').trim(),
                StreetNumber: String(orderPayload.houseNr || '50').trim(),
                ZipCode: cleanPlz
            },
            Birthday: formatBirthdayForFirstcon(orderPayload.birthDate),
            CellPhone: String(orderPayload.phone || '023139989390').trim(),
            ContactTypeId: '1',
            Email: String(orderPayload.email || '').trim(),
            Firstname: String(orderPayload.firstName || '').trim(),
            PersonTypeId: 1,
            SalutationId: salutationId,
            Surname: String(orderPayload.lastName || '').trim(),
            Title: ''
        },
        TariffId: firstconTariffId,
        BonusId: null,
        VoucherNo: '',
        ClickwrapperId: clickwrapperId
    };

    if (orderPayload.currentProvider && String(orderPayload.currentProvider).trim() !== '') {
        contractPayload.PreviousSupplier = {
            SupplierName: String(orderPayload.currentProvider).trim(),
            TerminationDate: null
        };
    }

    // 3. Validate order against Firstcon /Validation endpoint
    const validationRes = await firstconRequest('POST', '/Validation', {
        token,
        timeout: 20000,
        data: contractPayload
    });

    const isValidated = validationRes.status === 200;
    let contractSubmitted = false;
    let firstconContractResponse = null;

    // 4. Submit contract to Firstcon /Contract if validation passed and not dryRun
    if (isValidated && !orderPayload.dryRun) {
        const contractRes = await firstconRequest('POST', '/Contract', {
            token,
            timeout: 35000,
            data: contractPayload
        });
        if (contractRes.status === 200 || contractRes.status === 201) {
            contractSubmitted = true;
            firstconContractResponse = contractRes.data;
        }
    }

    return {
        firstconConnected: true,
        firstconTariffId,
        energyGridNumber: liveCalc?.energyGridNumber || null,
        ibanValid: bankVerificationRes?.data?.IsValid ?? null,
        clickwrapperId,
        sendMailOrderConfirmation: true,
        validated: isValidated,
        validationStatus: validationRes.status,
        validationMessage: validationRes.data,
        contractSubmitted,
        firstconContractId: typeof firstconContractResponse === 'string' || typeof firstconContractResponse === 'number'
            ? String(firstconContractResponse)
            : (firstconContractResponse?.ContractId || firstconContractResponse?.id || null)
    };
}

const pdfCache = new Map(); // `${type}:${energyCategoryId}:${tariffId}` -> { buffer, filename, expiresAt }

function resolveDefaultFirstconTariffId(branch = 'strom', tariffIdInput) {
    const isGas = branch === 'gas';
    const num = parseInt(tariffIdInput, 10);
    if (!isNaN(num) && num > 0) return num;
    const str = String(tariffIdInput || '').toLowerCase();
    if (isGas) {
        if (str.includes('premium')) return 228;
        if (str.includes('time')) return 227;
        return 226;
    }
    if (str.includes('premium')) return 281;
    if (str.includes('time')) return 280;
    return 279;
}

/**
 * Fetches the official Firstcon AGB + Widerrufsbelehrung PDF (/Tariff/GetTariffTermsFile) for a given branch & tariffId.
 */
async function getTariffTermsFile({ branch = 'strom', tariffId, customerTypeId = 1, token } = {}) {
    const isGas = branch === 'gas';
    const energyCategoryId = isGas ? 2 : 1;
    const resolvedTariffId = resolveDefaultFirstconTariffId(branch, tariffId);
    const cacheKey = `agb:${energyCategoryId}:${resolvedTariffId}`;
    const now = Date.now();

    if (pdfCache.has(cacheKey)) {
        const cached = pdfCache.get(cacheKey);
        if (cached && cached.expiresAt > now) {
            return cached;
        }
    }

    const auth = await authenticateOrderflow(token, false);
    const tokRes = await firstconRequest('GET', '/Tariff/GetToken', { token });
    if (tokRes.status !== 200 || !tokRes.data) {
        throw new Error('Firstcon GetToken failed with status ' + tokRes.status);
    }
    const fileToken = String(tokRes.data).replace(/^"+|"+$/g, '').trim();

    const pdfRes = await axios.get(`${FIRSTCON_API_BASE}/Tariff/GetTariffTermsFile`, {
        params: {
            energyCategoryId,
            customerTypeId: Number(customerTypeId) || 1,
            tariffId: resolvedTariffId,
            token: fileToken
        },
        headers: {
            'Authorization': `Bearer ${auth.jwt}`,
            'Accept': 'application/pdf'
        },
        responseType: 'arraybuffer',
        timeout: 12000,
        validateStatus: () => true
    });

    if (pdfRes.status !== 200 || !pdfRes.data || pdfRes.data.byteLength < 1000) {
        throw new Error('Firstcon GetTariffTermsFile returned status ' + pdfRes.status);
    }

    const buffer = Buffer.from(pdfRes.data);
    const filename = isGas
        ? `AGB_Erdgas_Alpha_Energie_${resolvedTariffId}.pdf`
        : `AGB_Strom_Alpha_Energie_${resolvedTariffId}.pdf`;

    const entry = { buffer, filename, expiresAt: now + 6 * 60 * 60 * 1000 };
    pdfCache.set(cacheKey, entry);
    return entry;
}

/**
 * Fetches the official Firstcon Datenschutzerklärung PDF (/Tariff/GetDataProtectionFile) for a given branch & tariffId.
 */
async function getDataProtectionFile({ branch = 'strom', tariffId, customerTypeId = 1, token } = {}) {
    const isGas = branch === 'gas';
    const energyCategoryId = isGas ? 2 : 1;
    const resolvedTariffId = resolveDefaultFirstconTariffId(branch, tariffId);
    const cacheKey = `dp:${energyCategoryId}:${resolvedTariffId}`;
    const now = Date.now();

    if (pdfCache.has(cacheKey)) {
        const cached = pdfCache.get(cacheKey);
        if (cached && cached.expiresAt > now) {
            return cached;
        }
    }

    const auth = await authenticateOrderflow(token, false);
    const tokRes = await firstconRequest('GET', '/Tariff/GetToken', { token });
    if (tokRes.status !== 200 || !tokRes.data) {
        throw new Error('Firstcon GetToken failed with status ' + tokRes.status);
    }
    const fileToken = String(tokRes.data).replace(/^"+|"+$/g, '').trim();

    const pdfRes = await axios.get(`${FIRSTCON_API_BASE}/Tariff/GetDataProtectionFile`, {
        params: {
            energyCategoryId,
            customerTypeId: Number(customerTypeId) || 1,
            tariffId: resolvedTariffId,
            token: fileToken
        },
        headers: {
            'Authorization': `Bearer ${auth.jwt}`,
            'Accept': 'application/pdf'
        },
        responseType: 'arraybuffer',
        timeout: 12000,
        validateStatus: () => true
    });

    if (pdfRes.status !== 200 || !pdfRes.data || pdfRes.data.byteLength < 1000) {
        throw new Error('Firstcon GetDataProtectionFile returned status ' + pdfRes.status);
    }

    const buffer = Buffer.from(pdfRes.data);
    const filename = `Datenschutzinformationen_Alpha_Energie_${resolvedTariffId}.pdf`;

    const entry = { buffer, filename, expiresAt: now + 6 * 60 * 60 * 1000 };
    pdfCache.set(cacheKey, entry);
    return entry;
}

const IBAN_LENGTH_BY_COUNTRY = {
    DE: 22, AT: 20, CH: 21, NL: 18, BE: 16, LU: 20, FR: 27, ES: 24, IT: 27, PL: 28, DK: 18, SE: 24
};

const GERMAN_BLZ_BANK_MAP = {
    '10010010': { bankName: 'Postbank', bic: 'PBNKDEFFXXX' },
    '10011001': { bankName: 'N26 Bank', bic: 'NTSBDEB1XXX' },
    '10050000': { bankName: 'Berliner Sparkasse', bic: 'BELADEBEXXX' },
    '10070000': { bankName: 'Deutsche Bank', bic: 'DEUTDEBBXXX' },
    '10070024': { bankName: 'Deutsche Bank Privat- und Geschäftskunden', bic: 'DEUTDEDBBER' },
    '12030000': { bankName: 'Deutsche Kreditbank (DKB)', bic: 'BYLADEM1001' },
    '20040000': { bankName: 'Commerzbank', bic: 'COBADEFFXXX' },
    '20041133': { bankName: 'comdirect – Commerzbank', bic: 'COBADEHD001' },
    '37040044': { bankName: 'Commerzbank Köln', bic: 'COBADEFF370' },
    '44010046': { bankName: 'Postbank Dortmund', bic: 'PBNKDEFFXXX' },
    '44040037': { bankName: 'Commerzbank Dortmund', bic: 'COBADEFF440' },
    '44050199': { bankName: 'Sparkasse Dortmund', bic: 'DORTDE33XXX' },
    '44080050': { bankName: 'Commerzbank (ehem. Dresdner Bank Dortmund)', bic: 'DRESDEFF440' },
    '44160014': { bankName: 'Dortmunder Volksbank', bic: 'GENODEM1DOR' },
    '50010060': { bankName: 'Postbank Frankfurt', bic: 'PBNKDEFFXXX' },
    '50010517': { bankName: 'ING-DiBa', bic: 'INGDDEFFXXX' },
    '50020200': { bankName: 'BHF-BANK', bic: 'BHFBDEFF500' },
    '50040000': { bankName: 'Commerzbank Frankfurt', bic: 'COBADEFFXXX' },
    '50050201': { bankName: 'Frankfurter Sparkasse', bic: 'HELADEF1822' },
    '50070010': { bankName: 'Deutsche Bank Frankfurt', bic: 'DEUTDEFFXXX' },
    '70020270': { bankName: 'UniCredit Bank (HypoVereinsbank)', bic: 'HYVEDEMMXXX' },
    '76026000': { bankName: 'Consorsbank', bic: 'CSDBDE71XXX' }
};

function validateIbanMod97(rawIban) {
    const clean = String(rawIban || '').replace(/\s+/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(clean)) {
        return { valid: false, clean, reason: 'Ungültiges IBAN-Format' };
    }
    const country = clean.slice(0, 2);
    const expectedLen = IBAN_LENGTH_BY_COUNTRY[country];
    if (expectedLen && clean.length !== expectedLen) {
        return {
            valid: false,
            clean,
            reason: `IBAN für ${country} muss genau ${expectedLen} Zeichen lang sein (aktuell: ${clean.length}).`
        };
    }

    // Rearrange first 4 chars to the end and convert letters A=10 .. Z=35
    const rearranged = clean.slice(4) + clean.slice(0, 4);
    let numericStr = '';
    for (let i = 0; i < rearranged.length; i++) {
        const code = rearranged.charCodeAt(i);
        if (code >= 65 && code <= 90) {
            numericStr += String(code - 55);
        } else {
            numericStr += rearranged[i];
        }
    }

    // Compute mod 97 in chunks
    let remainder = 0;
    for (let i = 0; i < numericStr.length; i += 7) {
        const part = String(remainder) + numericStr.slice(i, i + 7);
        remainder = parseInt(part, 10) % 97;
    }

    if (remainder !== 1) {
        return { valid: false, clean, reason: 'IBAN-Prüfziffer (Modulo-97) ist ungültig.' };
    }

    let bankName = '';
    let bic = '';
    if (country === 'DE' && clean.length === 22) {
        const blz = clean.slice(4, 12);
        if (GERMAN_BLZ_BANK_MAP[blz]) {
            bankName = GERMAN_BLZ_BANK_MAP[blz].bankName;
            bic = GERMAN_BLZ_BANK_MAP[blz].bic;
        } else if (blz.startsWith('5')) {
            bankName = 'Deutsche Geschäftsbank / Sparkasse';
        } else if (blz.startsWith('4')) {
            bankName = 'Kreditinstitut NRW / Westfalen';
        } else {
            bankName = `Deutsches Kreditinstitut (BLZ ${blz})`;
        }
    }

    const formattedIban = clean.replace(/(.{4})/g, '$1 ').trim();
    return {
        valid: true,
        clean,
        formattedIban,
        country,
        blz: country === 'DE' ? clean.slice(4, 12) : null,
        bankName,
        bic
    };
}

const ibanCache = new Map();

/**
 * Verifies an IBAN via ISO-7064 Mod-97-10 and live Firstcon /Verification/VerifyBankAccount.
 */
async function verifyBankAccount(rawIban, token) {
    const localCheck = validateIbanMod97(rawIban);
    if (!localCheck.valid) {
        return {
            valid: false,
            iban: localCheck.clean,
            formattedIban: localCheck.clean.replace(/(.{4})/g, '$1 ').trim(),
            bankName: null,
            bic: null,
            source: 'iso-mod97',
            message: localCheck.reason,
            reason: localCheck.reason
        };
    }

    const clean = localCheck.clean;
    const now = Date.now();
    if (ibanCache.has(clean)) {
        const cached = ibanCache.get(clean);
        if (cached && cached.expiresAt > now) {
            return cached.data;
        }
    }

    let fcValid = null;
    let fcBankName = null;
    let fcBic = null;
    try {
        const res = await firstconRequest('POST', '/Verification/VerifyBankAccount', {
            token,
            timeout: 4500,
            data: { iban: clean }
        });
        if (res && res.status === 200 && res.data) {
            if (typeof res.data.IsValid === 'boolean') {
                fcValid = res.data.IsValid;
            } else if (typeof res.data.isValid === 'boolean') {
                fcValid = res.data.isValid;
            }
            fcBankName = res.data.BankName || res.data.Institute || res.data.bankName || null;
            fcBic = res.data.Bic || res.data.bic || null;
        }
    } catch (e) {
        // Fallback to local ISO Mod97 check if Firstcon is unreachable
    }

    const finalValid = fcValid !== null ? fcValid : localCheck.valid;
    const result = {
        valid: finalValid,
        iban: clean,
        formattedIban: localCheck.formattedIban,
        country: localCheck.country,
        blz: localCheck.blz,
        bankName: fcBankName || localCheck.bankName || 'SEPA-Kreditinstitut verifiziert',
        bic: fcBic || localCheck.bic || '',
        source: fcValid !== null ? 'firstcon-live' : 'iso-mod97',
        message: finalValid ? 'SEPA-Bankverbindung erfolgreich verifiziert.' : 'Bankverbindung konnte nicht verifiziert werden.'
    };

    ibanCache.set(clean, { data: result, expiresAt: now + 60 * 60 * 1000 });
    return result;
}

module.exports = {
    DEFAULT_FIRSTCON_TOKEN,
    FIRSTCON_API_BASE,
    authenticateOrderflow,
    findEnergyGrid,
    getStreets,
    getFirstconTariffs,
    calculateLiveTariffs,
    submitOrderToFirstcon,
    getTariffTermsFile,
    getDataProtectionFile,
    verifyBankAccount,
    validateIbanMod97
};

