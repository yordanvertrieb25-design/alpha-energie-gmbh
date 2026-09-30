const { test, expect } = require('@playwright/test');

test.describe('Firstcon Production Token & Override QA Verification', () => {

    test('1. Default token verification on /versorger', async ({ page }) => {
        const consoleErrors = [];
        const pageErrors = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        page.on('pageerror', err => {
            pageErrors.push(err.message);
        });

        // Ensure clean storage
        await page.addInitScript(() => {
            try {
                localStorage.clear();
                sessionStorage.clear();
                localStorage.setItem('alpha_consent_status', 'all');
                localStorage.setItem('cookieConsent', 'all');
            } catch (e) {}
        });

        await page.goto('/versorger', { waitUntil: 'networkidle' });

        // Verify #bestellstrasse_widget has data-token="1994e155-ce1c-47a7-83c8-21660f0857a7"
        const widgetToken = await page.evaluate(() => {
            const widget = document.getElementById('bestellstrasse_widget');
            return widget ? widget.getAttribute('data-token') : null;
        });
        expect(widgetToken).toBe('1994e155-ce1c-47a7-83c8-21660f0857a7');

        // Verify window.__FIRSTCON_TOKEN__ === '1994e155-ce1c-47a7-83c8-21660f0857a7'
        const windowToken = await page.evaluate(() => window.__FIRSTCON_TOKEN__);
        expect(windowToken).toBe('1994e155-ce1c-47a7-83c8-21660f0857a7');

        // Verify window.__FIRSTCON_ACTIVE__ is true
        const windowActive = await page.evaluate(() => window.__FIRSTCON_ACTIVE__);
        expect(windowActive).toBe(true);

        // Verify zero console errors or unhandled rejections
        expect(pageErrors).toEqual([]);
        expect(consoleErrors).toEqual([]);
    });

    test('2. Dynamic override with ?firstcon_token=partner-xyz', async ({ page }) => {
        const consoleErrors = [];
        const pageErrors = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        page.on('pageerror', err => {
            pageErrors.push(err.message);
        });

        await page.addInitScript(() => {
            try {
                localStorage.clear();
                sessionStorage.clear();
                localStorage.setItem('alpha_consent_status', 'all');
                localStorage.setItem('cookieConsent', 'all');
            } catch (e) {}
        });

        await page.goto('/versorger?firstcon_token=partner-xyz', { waitUntil: 'networkidle' });

        // Verify #bestellstrasse_widget data-token is overridden
        const widgetToken = await page.evaluate(() => {
            const widget = document.getElementById('bestellstrasse_widget');
            return widget ? (widget.dataset.token || widget.getAttribute('data-token')) : null;
        });
        expect(widgetToken).toBe('partner-xyz');

        // Verify window.__FIRSTCON_TOKEN__ is 'partner-xyz'
        const windowToken = await page.evaluate(() => window.__FIRSTCON_TOKEN__);
        expect(windowToken).toBe('partner-xyz');

        // Verify localStorage contains partner-xyz
        const storedToken = await page.evaluate(() => localStorage.getItem('firstcon_token'));
        expect(storedToken).toBe('partner-xyz');

        // Verify zero console errors or unhandled rejections
        expect(pageErrors).toEqual([]);
        expect(consoleErrors).toEqual([]);
    });
});
