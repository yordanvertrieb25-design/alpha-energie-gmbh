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
async function firstconRequest(method, endpoint, { data, params, token } = {}) {
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
            timeout: 8000,
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

/**
 * Calculates live tariffs & prices directly from Firstcon Orderflow API v2.
 */
async function calculateLiveTariffs({ plz, consumption, currentAbschlag, branch = 'strom', token }) {
    const isGas = branch === 'gas';
    const energyCategoryId = isGas ? 2 : 1;
    const defaultKwh = isGas ? 12000 : 2500;
    const kwh = Math.max(500, parseInt(consumption, 10) || defaultKwh);
    const cleanPlz = String(plz || '44379').replace(/\D/g, '').slice(0, 5) || '44379';

    // 1. Resolve grid and tariffs in parallel
    let [gridInfo, fcTariffs] = await Promise.all([
        findEnergyGrid(cleanPlz, branch, token),
        getFirstconTariffs(branch, token)
    ]);

    if ((!gridInfo || !gridInfo.energyGridNumber) && cleanPlz !== '44379') {
        gridInfo = await findEnergyGrid('44379', branch, token);
    }

    if (!gridInfo || !gridInfo.energyGridNumber || !fcTariffs || fcTariffs.length === 0) {
        return null;
    }

    const tariffIds = fcTariffs.map(t => t.TariffId).filter(Boolean);

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
        priceByTariffId.set(p.TariffId, p);
    }

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
    };

    const mappedTariffs = [];
    for (const fcTariff of fcTariffs) {
        const price = priceByTariffId.get(fcTariff.TariffId);
        if (!price) continue;

        const slotId = mapFirstconTariffToSlotId(fcTariff);
        const meta = slotMetadata[slotId] || slotMetadata['alpha-basic'];

        const workingPriceCt = Number(price.PricePerUnitGross) || 0;
        const basePriceEurMonth = Number(price.PriceBasicPerMonthGross) || 0;
        const grossYearlyEur = Number(price.TotalPricePerYearGross) || ((kwh * (workingPriceCt / 100)) + (basePriceEurMonth * 12));
        const monthlyPayment = Number(price.MonthlyAdvancePaymentGross) || Math.round(Number(price.TotalPricePerMonthGross) || (grossYearlyEur / 12));
        const savingsEur = Math.max(40, Math.round(userYearlyOld - grossYearlyEur));

        const defaultFeatures = isGas ? [
            `${fcTariff.PriceGuaranteeDuration || 24} Monate volle Preisgarantie`,
            'Erdgas mit freiwilligem Klimaschutzbeitrag',
            'Förderung ausgewählter Klimaschutzprojekte',
            'Kostenloser & automatischer Wechselservice'
        ] : [
            `${fcTariff.PriceGuaranteeDuration || 24} Monate volle Preisgarantie`,
            'Ökostrom aus 100 % erneuerbaren Energien',
            'Monatlich kündbar nach der Erstlaufzeit',
            'Kostenloser Wechselservice & Abmeldung'
        ];

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

        const mergedFeatures = [
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
            name: meta.name,
            badge: meta.badge,
            isBestseller: meta.isBestseller,
            workingPriceCt,
            workingPriceNetCt: Number(price.PricePerUnitNet) || 0,
            basePriceEurMonth,
            basePriceEur: basePriceEurMonth,
            basePriceYearGross: Number(price.PriceBasicPerYearGross) || 0,
            bonusEur: Number(fcTariff.BonusAmount) || 0,
            priceGuaranteeMonths: Number(fcTariff.PriceGuaranteeDuration) || 24,
            contractTermMonths: Number(fcTariff.TermInMonth) || 24,
            ecoCertificate: meta.ecoCertificate,
            features,
            monthlyPayment,
            totalPricePerMonthGross: Number(price.TotalPricePerMonthGross) || monthlyPayment,
            grossYearlyEur: Math.round(grossYearlyEur * 100) / 100,
            netYearlyEur: Number(price.TotalPricePerYearNet) || 0,
            savingsEur,
            savingsYear: savingsEur
        });
    }

    // Order consistently: alpha-basic, alpha-time, alpha-premium
    const orderRank = { 'alpha-basic': 1, 'alpha-time': 2, 'alpha-premium': 3 };
    mappedTariffs.sort((a, b) => (orderRank[a.id] || 99) - (orderRank[b.id] || 99));

    const maxSavings = Math.max(...mappedTariffs.map(t => t.savingsEur), 0);

    return {
        source: 'firstcon-live',
        firstconConnected: true,
        plz: gridInfo.zipCode || cleanPlz,
        city: gridInfo.city,
        energyGridNumber: gridInfo.energyGridNumber,
        consumption: kwh,
        branch: isGas ? 'gas' : 'strom',
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
    const isGas = orderPayload.branch === 'gas';
    const energyCategoryId = isGas ? 2 : 1;
    const cleanPlz = String(orderPayload.plz || '44379').replace(/\D/g, '').slice(0, 5) || '44379';
    const kwh = Math.max(500, parseInt(orderPayload.consumption, 10) || (isGas ? 12000 : 2500));
    const cleanIban = String(orderPayload.iban || '').replace(/\s+/g, '').toUpperCase();

    // 1. Calculate / fetch live Firstcon tariff & price details for the customer's PLZ & kWh
    const liveCalc = await calculateLiveTariffs({
        plz: cleanPlz,
        consumption: kwh,
        branch: orderPayload.branch || 'strom',
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

    // 2. Verify bank account & obtain ClickwrapperId in parallel
    const [bankVerificationRes, clickWrapperRes] = await Promise.all([
        firstconRequest('POST', '/Verification/VerifyBankAccount', {
            token,
            data: { iban: cleanIban }
        }).catch(() => ({ status: 0, data: null })),
        firstconRequest('POST', '/Tariff/GetClickWrapperId', {
            token,
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
        ? clickWrapperRes.data
        : '';

    const salutationStr = String(orderPayload.salutation || 'Herr').toLowerCase();
    const salutationId = salutationStr.includes('frau') ? '2' : (salutationStr.includes('firma') || salutationStr.includes('familie') ? '5' : '1');

    const contractPayload = {
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
            MeterTypeId: isGas ? 3 : 1
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
        BonusId: '',
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
        data: contractPayload
    });

    const isValidated = validationRes.status === 200;
    let contractSubmitted = false;
    let firstconContractResponse = null;

    // 4. Submit contract to Firstcon /Contract if validation passed and not dryRun
    if (isValidated && !orderPayload.dryRun) {
        const contractRes = await firstconRequest('POST', '/Contract', {
            token,
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
        validated: isValidated,
        validationStatus: validationRes.status,
        validationMessage: validationRes.data,
        contractSubmitted,
        firstconContractId: typeof firstconContractResponse === 'string' || typeof firstconContractResponse === 'number'
            ? String(firstconContractResponse)
            : (firstconContractResponse?.ContractId || firstconContractResponse?.id || null)
    };
}

module.exports = {
    DEFAULT_FIRSTCON_TOKEN,
    FIRSTCON_API_BASE,
    authenticateOrderflow,
    findEnergyGrid,
    getStreets,
    getFirstconTariffs,
    calculateLiveTariffs,
    submitOrderToFirstcon
};
