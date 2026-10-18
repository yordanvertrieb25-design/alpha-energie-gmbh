const { test, expect } = require('@playwright/test');

test.describe('Firstcon Guard & Error Interceptor Verification', () => {

    test('1. Firstcon 401 error modal is suppressed and page is never blocked', async ({ page }) => {
        // Pre-seed consent so cookie banner does not interfere
        await page.addInitScript(() => {
            try {
                localStorage.setItem('alpha_consent_status', 'all');
                localStorage.setItem('cookieConsent', 'all');
                localStorage.removeItem('affiliate_ref');
                sessionStorage.clear();
            } catch (e) {}
        });

        // Navigate to versorger page
        await page.goto('/versorger', { waitUntil: 'load', timeout: 30000 });

        // Wait 3 seconds to allow Firstcon script to run and attempt authentication
        await page.waitForTimeout(3000);

        // Assert no visible SweetAlert2 modal exists
        const visibleSwal = await page.evaluate(() => {
            const containers = Array.from(document.querySelectorAll('.swal2-container, #swal2-container'));
            return containers.filter(c => {
                const style = window.getComputedStyle(c);
                return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
            }).length;
        });
        expect(visibleSwal).toBe(0);

        // Assert body and html scrolling are not locked
        const bodyScrollLocked = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;
            return body.classList.contains('swal2-shown') || html.classList.contains('swal2-shown');
        });
        expect(bodyScrollLocked).toBe(false);

        // Assert Status Notice is completely removed
        const statusNotice = page.locator('#bestellstrasse_status_notice');
        await expect(statusNotice).toHaveCount(0);

        // Reveal tariff cards via calculator submit ("Tarif finden")
        await page.locator('#calcPlz').fill('44379');
        await page.locator('#rechnerForm .calc-submit-btn').click();

        // Assert 3 official tariffs exist
        await expect(page.locator('#card-alpha-basic')).toBeVisible();
        await expect(page.locator('#card-alpha-time')).toBeVisible();
        await expect(page.locator('#card-alpha-premium')).toBeVisible();
    });

    test('2. Live-Tarifrechner operates independently and smoothly', async ({ page }) => {
        page.on('console', msg => console.log(`[TEST 2 BROWSER] ${msg.type()}: ${msg.text()}`));
        page.on('pageerror', err => console.log(`[TEST 2 ERROR]: ${err.message}`));
        page.on('request', req => {
            if (req.url().includes('AuthenticateOrderflow')) {
                console.log(`[TEST 2 REQ] ${req.method()} ${req.url()} (${req.resourceType()})`);
            }
        });
        page.on('response', res => {
            if (res.status() === 401) {
                console.log(`[TEST 2 RES 401] ${res.url()} (${res.status()})`);
            }
        });

        await page.addInitScript(() => {
            try {
                localStorage.setItem('alpha_consent_status', 'all');
                localStorage.setItem('cookieConsent', 'all');
                localStorage.removeItem('affiliate_ref');
                sessionStorage.clear();
            } catch (e) {}
        });

        await page.goto('/versorger', { waitUntil: 'load' });
        await page.waitForTimeout(1000);

        // Test household button preset
        const btn3Pers = page.locator('button.household-btn[data-kwh="3500"]');
        await btn3Pers.click();
        const kwhInput = page.locator('#calcKwh');
        await expect(kwhInput).toHaveValue('3500');

        // Test Wärmestrom & HT/NT tab (.calc-tab-btn[data-branch="waerme"])
        const tabWaerme = page.locator('.calc-tab-btn[data-branch="waerme"]');
        await expect(tabWaerme).toBeVisible();
        await tabWaerme.click();
        await expect(tabWaerme).toHaveClass(/active/);
        const htNtRow = page.locator('#calcWaermeHtNtRow');
        await expect(htNtRow).toBeVisible();
        const htntBtn = page.locator('.octo-meter-type-btn[data-meter-type="htnt"]');
        if (await htntBtn.count() > 0) {
            await htntBtn.click();
        }
        await expect(page.locator('#calcKwhHt')).toBeVisible();
        await expect(page.locator('#calcKwhNt')).toBeVisible();
        const noticeEl = page.locator('#calcBranchNoticeText');
        await expect(noticeEl).toContainText('HT/NT');

        // Test tariff tab switching (.calc-tab-btn[data-branch="gas"])
        const tabGas = page.locator('.calc-tab-btn[data-branch="gas"]');
        await expect(tabGas).toBeVisible();
        await tabGas.click();
        await expect(tabGas).toHaveClass(/active/);
        await expect(htNtRow).not.toBeVisible();
        await expect(noticeEl).toContainText('Klimaschutzbeitrag');

        // Reveal tariff cards via calculator submit ("Tarif finden") and test order modal opening
        await page.locator('#calcPlz').fill('44379');
        await page.locator('#rechnerForm .calc-submit-btn').click();
        const btnOrderTariff = page.locator('[data-select-tariff]').first();
        await btnOrderTariff.click();

        const orderModal = page.locator('#orderModal');
        await expect(orderModal).toBeVisible();

        // Close modal
        const btnClose = orderModal.locator('.btn-close-modal').first();
        await btnClose.click();
        await expect(orderModal).not.toBeVisible();
    });

    test('3. Dynamic token support via URL parameter ?firstcon_token=...', async ({ page }) => {
        const testToken = 'custom-partner-token-999';
        await page.addInitScript(() => {
            try {
                localStorage.setItem('alpha_consent_status', 'all');
                localStorage.setItem('cookieConsent', 'all');
                localStorage.removeItem('affiliate_ref');
                sessionStorage.clear();
            } catch (e) {}
        });

        await page.goto(`/versorger?firstcon_token=${testToken}`, { waitUntil: 'load' });
        await page.waitForTimeout(1000);

        const widgetToken = await page.evaluate(() => {
            const widget = document.getElementById('bestellstrasse_widget');
            return widget ? widget.dataset.token : null;
        });

        expect(widgetToken).toBe(testToken);

        const storedToken = await page.evaluate(() => {
            return localStorage.getItem('firstcon_token');
        });

        expect(storedToken).toBe(testToken);
    });

    test('4. Strict White-Label Guarantee: Firstcon is NEVER visible in calculator, tariff cards, or order modal UI', async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });
        await page.waitForTimeout(1000);

        const mainUiText = await page.evaluate(() => {
            const rechnerEl = document.getElementById('rechner');
            const tarifeEl = document.getElementById('tarife');
            const modalEl = document.getElementById('orderModal');
            return [
                rechnerEl ? rechnerEl.innerText : '',
                tarifeEl ? tarifeEl.innerText : '',
                modalEl ? modalEl.innerText : ''
            ].join(' ');
        });

        // The calculator, tariff cards, and order modal UI must NEVER contain "Firstcon" or "firstcon"
        expect(mainUiText.toLowerCase().includes('firstcon')).toBe(false);
    });

    test('5. Modal Close Mechanics: All modals close reliably via close button, backdrop click, and Escape key', async ({ page }) => {
        test.setTimeout(90000);
        // Pre-seed consent so cookie banner does not interfere
        await page.addInitScript(() => {
            try {
                localStorage.setItem('alpha_consent_status', 'all');
                localStorage.setItem('cookieConsent', 'all');
                localStorage.removeItem('affiliate_ref');
                sessionStorage.clear();
            } catch (e) {}
        });

        await page.goto('/versorger', { waitUntil: 'load' });
        await page.waitForTimeout(1000);

        const meterModal = page.locator('#meterModal');
        const orderModal = page.locator('#orderModal');
        const cancelModal = page.locator('#legalCancelModal');

        // Test #meterModal: Open, close via button
        await page.locator('#btnOpenMeterModal').click();
        await expect(meterModal).toBeVisible();
        await page.locator('#meterModal .modal-close-btn').click();
        await expect(meterModal).not.toBeVisible();

        // Reopen #meterModal: close via backdrop click
        await page.locator('#btnOpenMeterModal').click();
        await expect(meterModal).toBeVisible();
        await page.locator('#meterModal').click({ position: { x: 5, y: 5 } });
        await expect(meterModal).not.toBeVisible();

        // Reopen #meterModal: close via Escape key
        await page.locator('#btnOpenMeterModal').click();
        await expect(meterModal).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(meterModal).not.toBeVisible();
        await page.waitForTimeout(400);

        // Test #orderModal: Reveal #tarife via calculator submit, open via [data-select-tariff], close via Escape key
        await page.locator('#calcPlz').fill('44379');
        await page.locator('#rechnerForm .calc-submit-btn').click();
        const btnSelectTariff = page.locator('[data-select-tariff]').first();
        await btnSelectTariff.scrollIntoViewIfNeeded();
        await btnSelectTariff.click();
        await expect(orderModal).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(orderModal).not.toBeVisible();
        await page.waitForTimeout(400);

        // Test #legalCancelModal: Open via #btnOpenCancelModal, close via close button
        await page.locator('#btnOpenCancelModal').click();
        await expect(cancelModal).toBeVisible();
        await page.locator('#legalCancelModal .modal-close-btn').click();
        await expect(cancelModal).not.toBeVisible();
    });
});

