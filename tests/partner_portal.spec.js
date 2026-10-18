require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

test.describe('AlphaTarife In-House Partner Portal & Attribution Suite', () => {
    test('1. Live IBAN Verification API validates ISO-7064 Mod-97-10 & edge cases', async ({ request }) => {
        // Valid German IBAN
        const validRes = await request.get(`${BASE_URL}/api/verify-iban?iban=DE89370400440532013000`);
        expect(validRes.ok()).toBeTruthy();
        const validJson = await validRes.json();
        expect(validJson.valid).toBe(true);
        expect(validJson.bic).toContain('COBADEFF');
        expect(validJson.bankName).toContain('Commerzbank');

        // Invalid Mod-97 checksum
        const badRes = await request.get(`${BASE_URL}/api/verify-iban?iban=DE11370400440532013000`);
        const badJson = await badRes.json();
        expect(badJson.valid).toBe(false);

        // Too short IBAN
        const shortRes = await request.get(`${BASE_URL}/api/verify-iban?iban=DE12345`);
        const shortJson = await shortRes.json();
        expect(shortJson.valid).toBe(false);

        // Empty IBAN returns 400
        const emptyRes = await request.post(`${BASE_URL}/api/verify-iban`, { data: { iban: '' } });
        expect(emptyRes.status()).toBe(400);
    });

    test('2. Partner Demo Logins, Self-Registration, D2D eSign & Remote Sign Flow, Leads, Subpartners & PDF Payouts', async ({ request, page }) => {
        // 2a. Demo login for D2D
        const loginRes = await request.post(`${BASE_URL}/api/partner/login`, {
            data: { demoRole: 'D2D' }
        });
        expect(loginRes.ok()).toBeTruthy();
        const loginData = await loginRes.json();
        expect(loginData.success).toBe(true);
        expect(loginData.partner.partnerCode).toBe('VP-D2D100');
        const token = loginData.token;

        // 2b. Dashboard endpoint returns KPIs, orders, subIdStats
        const dashRes = await request.get(`${BASE_URL}/api/partner/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(dashRes.ok()).toBeTruthy();
        const dashData = await dashRes.json();
        expect(dashData.success).toBe(true);
        expect(typeof dashData.kpis.totalEarnedEur).toBe('number');

        // 2c. Submit a D2D order with REMOTE signature mode
        const d2dRes = await request.post(`${BASE_URL}/api/partner/orders`, {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                tariffId: 'alpha-strom-24',
                tariffName: 'AlphaStrom 24 Fix',
                branch: 'strom',
                consumption: 3200,
                monthlyPayment: 92,
                savings: 195,
                salutation: 'Herr',
                firstName: 'Martin',
                lastName: 'Testkunde',
                email: 'm.testkunde@example.de',
                phone: '0176 99887766',
                street: 'Westhellweg',
                houseNr: '15',
                plz: '44137',
                city: 'Dortmund',
                meterNumber: '1ISK77889900',
                iban: 'DE89370400440532013000',
                subId: 'd2d_test_spec',
                signatureMode: 'REMOTE'
            }
        });
        expect(d2dRes.status()).toBe(201);
        const d2dData = await d2dRes.json();
        expect(d2dData.success).toBe(true);
        expect(d2dData.signatureToken).toBeTruthy();
        expect(d2dData.order.commissionAmount).toBe(65);
        expect(d2dData.order.overrideAmount).toBe(15); // Linked to AG-NRW01

        // 2d. Complete Remote Customer eSign via API
        const signToken = d2dData.signatureToken;
        const remoteGet = await request.get(`${BASE_URL}/api/order/remote-sign/${signToken}`);
        expect(remoteGet.ok()).toBeTruthy();
        const remotePost = await request.post(`${BASE_URL}/api/order/remote-sign/${signToken}`, {
            data: { signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }
        });
        expect(remotePost.ok()).toBeTruthy();
        const remotePostJson = await remotePost.json();
        expect(remotePostJson.success).toBe(true);

        // 2e. Tippgeber Lead submission
        const leadRes = await request.post(`${BASE_URL}/api/partner/leads`, {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                customerName: 'Tippgeber Test GmbH',
                customerPhone: '0231 554433',
                branch: 'strom',
                estimatedConsumption: 15000
            }
        });
        expect(leadRes.status()).toBe(201);

        // 2f. PDF Credit Note endpoint returns valid PDF
        const pdfRes = await request.get(`${BASE_URL}/api/partner/payouts/1/pdf`);
        expect(pdfRes.ok()).toBeTruthy();
        expect(pdfRes.headers()['content-type']).toContain('application/pdf');

        // 2g. UI Verification on /vertriebspartner-portal.html
        await page.addInitScript(() => {
            try {
                localStorage.setItem('alpha_consent_status', 'all');
                localStorage.setItem('cookieConsent', 'all');
                localStorage.setItem('alpha_dsgvo_consent_v1', JSON.stringify({ essential: true, analytics: true, marketing: true, timestamp: Date.now() }));
            } catch (e) {}
        });
        await page.goto(`${BASE_URL}/vertriebspartner-portal.html`, { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => {
            const ov = document.getElementById('alphaDsgvoOverlay');
            if (ov) ov.remove();
        });
        expect(page.url()).toContain('vertriebspartner-portal.html');

        // Click 1-click Demo button for Affiliate
        await page.click('[data-demo-role="AFFILIATE"]');
        await expect(page.locator('#partnerCockpitSection')).toBeVisible({ timeout: 8000 });
        await expect(page.locator('#cockpitPartnerCode')).toHaveText('AFF-MAX24');

        // Switch through tabs
        await page.click('[data-cockpit-tab="affiliate"]');
        await expect(page.locator('#cockpit-pane-affiliate')).toBeVisible();
        const generatedLink = await page.locator('#affGeneratedUrlInput').inputValue();
        expect(generatedLink).toContain('ref=AFF-MAX24');
    });

    test('3. 90-Day Affiliate & Sub-ID Attribution + Root Redirect Fix', async ({ page, request }) => {
        // Visiting root /?ref=AFF-MAX24&subid=campaign_hero does NOT hijack to stammdaten.html
        await page.goto(`${BASE_URL}/?ref=AFF-MAX24&subid=campaign_hero`, { waitUntil: 'domcontentloaded' });
        expect(page.url()).not.toContain('stammdaten.html');

        const attr = await page.evaluate(() => window.getAlphaAffiliateAttribution());
        expect(attr.partnerCode).toBe('AFF-MAX24');
        expect(attr.subId).toBe('campaign_hero');

        // Explicit ?ref=AFF-MAX24&redirect=stammdaten DOES redirect to stammdaten.html
        await page.goto(`${BASE_URL}/?ref=AFF-MAX24&redirect=stammdaten`);
        await page.waitForURL(/stammdaten\.html\?ref=AFF-MAX24/);
        expect(page.url()).toContain('stammdaten.html?ref=AFF-MAX24');

        // Submitting an order attributes partnerCode & subId
        const orderRes = await request.post(`${BASE_URL}/api/order/submit`, {
            data: {
                tariffId: 'alpha-basic',
                tariffName: 'AlphaStrom Basic',
                branch: 'strom',
                consumption: 2500,
                monthlyPayment: 79,
                street: 'Kampstr.',
                houseNr: '1',
                plz: '44137',
                city: 'Dortmund',
                meterNumber: '1ISK11223344',
                firstName: 'Julia',
                lastName: 'AffiliateKunde',
                email: 'julia.aff@example.de',
                phone: '0231 123456',
                iban: 'DE89370400440532013000',
                partnerCode: attr.partnerCode,
                subId: attr.subId
            }
        });
        expect(orderRes.status()).toBe(201);
        const orderJson = await orderRes.json();
        expect(orderJson.success).toBe(true);
        expect(orderJson.partnerAttribution.partnerCode).toBe('AFF-MAX24');
        expect(orderJson.partnerAttribution.subId).toBe('campaign_hero');
        expect(orderJson.partnerAttribution.commissionAmount).toBe(55);
    });

    test('4. Self-Registration, Agency Sub-Partners, Remote Sign UI & Admin 1-Click Activation + Payouts', async ({ request, page }) => {
        // 4a. Reject registration with invalid IBAN checksum
        const badReg = await request.post(`${BASE_URL}/api/partner/register`, {
            data: {
                firstName: 'Test',
                lastName: 'InvalidIban',
                email: `invalid.${Date.now()}@example.de`,
                password: 'Password123!',
                role: 'AFFILIATE',
                iban: 'DE00370400440532013000'
            }
        });
        expect(badReg.status()).toBe(400);

        // 4b. Valid Self-Registration creates PartnerUser + AffiliateLink + JWT
        const uniqueEmail = `partner.${Date.now()}@example.de`;
        const regRes = await request.post(`${BASE_URL}/api/partner/register`, {
            data: {
                firstName: 'Elena',
                lastName: 'Neupartner',
                email: uniqueEmail,
                password: 'Password123!',
                role: 'AGENCY',
                companyName: 'Elena Sales Agency GmbH',
                iban: 'DE89370400440532013000',
                isVatLiable: true
            }
        });
        expect(regRes.status()).toBe(201);
        const regJson = await regRes.json();
        expect(regJson.success).toBe(true);
        expect(regJson.token).toBeTruthy();
        expect(regJson.partner.role).toBe('AGENCY');

        // 4c. Agency creates a Sub-Partner in its Downline
        const subRes = await request.post(`${BASE_URL}/api/partner/subpartners`, {
            headers: { Authorization: `Bearer ${regJson.token}` },
            data: {
                firstName: 'kevin',
                lastName: 'Subrep',
                email: `sub.${Date.now()}@example.de`,
                role: 'D2D',
                stromCommissionEur: 55,
                gasCommissionEur: 55
            }
        });
        expect(subRes.status()).toBe(201);
        const subJson = await subRes.json();
        expect(subJson.success).toBe(true);
        expect(subJson.subPartner.partnerCode).toBeTruthy();

        // 4d. Submit partner application & activate via Admin 1-Click Portal Activation
        const appRes = await request.post(`${BASE_URL}/api/partner-application`, {
            data: {
                fullName: 'Stefan Bewerber',
                companyName: 'Stefan Vertrieb',
                email: `stefan.${Date.now()}@example.de`,
                phone: '0231 998877',
                experience: 'D2D Direktvertrieb'
            }
        });
        expect(appRes.status()).toBe(201);
        const appJson = await appRes.json();

        const adminLogin = await request.post(`${BASE_URL}/api/admin/login`, {
            data: { password: process.env.ADMIN_PASSWORD }
        });
        expect(adminLogin.ok()).toBeTruthy();
        const { token: adminToken } = await adminLogin.json();

        const actRes = await request.post(`${BASE_URL}/api/admin/partner-applications/${appJson.data.id}/activate-portal`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            data: { role: 'D2D' }
        });
        expect(actRes.ok()).toBeTruthy();
        const actJson = await actRes.json();
        expect(actJson.success).toBe(true);
        expect(actJson.partner.partnerCode).toContain('VP-');

        // 4e. Admin Portal Overview returns orders, partners, leads, payouts, clicks
        const ovRes = await request.get(`${BASE_URL}/api/admin/portal-overview`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        expect(ovRes.ok()).toBeTruthy();
        const ovJson = await ovRes.json();
        expect(ovJson.success).toBe(true);
        expect(Array.isArray(ovJson.orders)).toBe(true);
        expect(Array.isArray(ovJson.partners)).toBe(true);
        expect(Array.isArray(ovJson.payouts)).toBe(true);
    });
});
