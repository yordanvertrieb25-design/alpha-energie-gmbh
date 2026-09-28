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

        // Navigate to homepage
        await page.goto('/index.html', { waitUntil: 'load', timeout: 30000 });

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

        await page.goto('/index.html', { waitUntil: 'load' });
        await page.waitForTimeout(1000);

        // Test household button preset
        const btn3Pers = page.locator('button.household-btn[data-kwh="3500"]');
        await btn3Pers.click();
        const kwhInput = page.locator('#calcKwh');
        await expect(kwhInput).toHaveValue('3500');

        // Test tariff tab switching (.calc-tab-btn[data-branch="waerme"])
        const tabWaerme = page.locator('.calc-tab-btn[data-branch="waerme"]');
        await tabWaerme.click();
        await expect(tabWaerme).toHaveClass(/active/);
        const noticeEl = page.locator('#calcBranchNoticeText');
        await expect(noticeEl).toContainText('Wärmestrom nach § 14a EnWG');

        // Test tariff order modal opening
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

        await page.goto(`/index.html?firstcon_token=${testToken}`, { waitUntil: 'load' });
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

    test('4. Strict White-Label Guarantee: Firstcon is NEVER visible in rendered UI', async ({ page }) => {
        await page.goto('/index.html', { waitUntil: 'load' });
        await page.waitForTimeout(1000);

        const visibleBodyText = await page.evaluate(() => {
            return document.body.innerText;
        });

        // The visible text of the website must NEVER contain "Firstcon" or "firstcon"
        expect(visibleBodyText.toLowerCase().includes('firstcon')).toBe(false);
    });

    test('5. Modal Close Mechanics: All modals close reliably via close button, backdrop click, and Escape key', async ({ page }) => {
        // Pre-seed consent so cookie banner does not interfere
        await page.addInitScript(() => {
            try {
                localStorage.setItem('alpha_consent_status', 'all');
                localStorage.setItem('cookieConsent', 'all');
                localStorage.removeItem('affiliate_ref');
                sessionStorage.clear();
            } catch (e) {}
        });

        await page.goto('/index.html', { waitUntil: 'load' });
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

        // Test #orderModal: Open via [data-select-tariff], close via Escape key
        await page.locator('[data-select-tariff]').first().click();
        await expect(orderModal).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(orderModal).not.toBeVisible();

        // Test #legalCancelModal: Open via #btnOpenCancelModal, close via close button
        await page.locator('#btnOpenCancelModal').click();
        await expect(cancelModal).toBeVisible();
        await page.locator('#legalCancelModal .modal-close-btn').click();
        await expect(cancelModal).not.toBeVisible();
    });
});

