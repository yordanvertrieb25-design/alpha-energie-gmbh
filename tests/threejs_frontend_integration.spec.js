const { test, expect } = require('@playwright/test');

test.describe('Alpha Energie Three.js Frontend Integration', () => {

    test.beforeEach(async ({ page }) => {
        // Pre-seed consent so cookie banner does not interfere with clicks
        await page.addInitScript(() => {
            localStorage.setItem('alpha_consent_status', 'all');
            localStorage.setItem('cookieConsent', 'all');
            localStorage.setItem('cookie_analytics', 'true');
            localStorage.setItem('cookie_marketing', 'true');
        });
    });

    test('should auto-initialize 3D Energy Network in index.html with interactive HUD', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('video')) {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('/');

        // 1. Ensure Three.js and AlphaThree are loaded
        const isLoaded = await page.evaluate(() => {
            return typeof window.THREE !== 'undefined' && typeof window.AlphaThree !== 'undefined';
        });
        expect(isLoaded).toBe(true);

        // 2. Ensure Canvas is rendered in #alpha-energy-network-canvas
        const canvas = page.locator('#alpha-energy-network-canvas canvas');
        await expect(canvas).toBeVisible({ timeout: 10000 });

        // 3. Ensure HUD controls are present
        const modeTabs = page.locator('#alpha-energy-network-canvas .hud-tab');
        await expect(modeTabs).toHaveCount(4);

        // 4. Test Mode Switching to Solar
        const solarTab = page.locator('#alpha-energy-network-canvas .hud-tab[data-mode="solar"]');
        await solarTab.click();
        await expect(solarTab).toHaveClass(/active/);

        const currentMode = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-energy-network-canvas');
            return scene ? scene.mode : null;
        });
        expect(currentMode).toBe('solar');

        // 5. Test Mode Switching to Wind
        const windTab = page.locator('#alpha-energy-network-canvas .hud-tab[data-mode="wind"]');
        await windTab.click();
        await expect(windTab).toHaveClass(/active/);

        const windMode = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-energy-network-canvas');
            return scene ? scene.mode : null;
        });
        expect(windMode).toBe('wind');

        // 6. Test Energy Pulse Burst Button
        const burstBtn = page.locator('#btn-pulse-burst');
        await expect(burstBtn).toBeVisible();
        await burstBtn.click();

        const burstTriggered = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-energy-network-canvas');
            return scene && scene.burstTime > 0;
        });
        expect(burstTriggered).toBe(true);

        // 7. Verify existing homepage elements remain intact
        const heroTitle = page.locator('.hero-title-mega');
        await expect(heroTitle).toBeVisible();

        const heroVideo = page.locator('.hero-video-inline');
        await expect(heroVideo).toBeVisible();

        const navLogo = page.locator('.nav-logo');
        await expect(navLogo).toBeVisible();

        expect(consoleErrors).toEqual([]);
    });

    test('should auto-initialize 3D Solar Grid in photovoltaik.html', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('video')) {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('/photovoltaik.html');

        // 1. Ensure Canvas is rendered in #pv-solar-network-canvas
        const canvas = page.locator('#pv-solar-network-canvas canvas');
        await expect(canvas).toBeVisible({ timeout: 10000 });

        // 2. Check scene mode is initially solar
        const currentMode = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#pv-solar-network-canvas');
            return scene ? scene.mode : null;
        });
        expect(currentMode).toBe('solar');

        // 3. Test Solar Pulse Action Button
        const burstBtn = page.locator('#pv-solar-network-canvas [data-action="burst"]');
        await expect(burstBtn).toBeVisible();
        await burstBtn.click();

        const burstActive = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#pv-solar-network-canvas');
            return scene && scene.burstTime > 0;
        });
        expect(burstActive).toBe(true);

        expect(consoleErrors).toEqual([]);
    });

    test('should maintain responsiveness on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        const viewport = page.locator('#alpha-energy-network-canvas');
        await expect(viewport).toBeVisible();

        const canvasBox = await viewport.boundingBox();
        expect(canvasBox).not.toBeNull();
        expect(canvasBox.height).toBeLessThanOrEqual(420);

        // HUD should be visible and usable on mobile
        const hud = page.locator('#alpha-energy-network-canvas .energy-3d-hud');
        await expect(hud).toBeVisible();

        // Mobile menu hamburger should be intact
        const hamburger = page.locator('.hamburger');
        await expect(hamburger).toBeVisible();
    });

});
