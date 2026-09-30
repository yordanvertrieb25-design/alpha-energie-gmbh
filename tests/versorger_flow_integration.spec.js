const { test, expect } = require('@playwright/test');

test.describe('Alpha Energie 3D Versorger Flow Integration & Two-Way Sync Suite', () => {

    test.beforeEach(async ({ page }) => {
        // Pre-seed consent so cookie banner does not interfere with clicks
        await page.addInitScript(() => {
            localStorage.setItem('alpha_consent_status', 'all');
            localStorage.setItem('cookieConsent', 'all');
            localStorage.setItem('cookie_analytics', 'true');
            localStorage.setItem('cookie_marketing', 'true');
        });
    });

    test('1. Should auto-initialize 3D Versorger Flow scene in versorger.html with telemetry HUD', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('video')) {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('/versorger', { waitUntil: 'load' });

        // 1. Ensure Three.js and AlphaThree are loaded
        const isLoaded = await page.evaluate(() => {
            return typeof window.THREE !== 'undefined' && typeof window.AlphaThree !== 'undefined';
        });
        expect(isLoaded).toBe(true);

        // 2. Ensure section header/title is visible
        const sectionTitle = page.locator('#flow-visualizer .energy-section-title, #scrolly-flow-section .energy-3d-badge, .scrolly-tour-header');
        await expect(sectionTitle.first()).toBeVisible();

        const sectionSubtitle = page.locator('#flow-visualizer .energy-section-subtitle, #scrolly-flow-section .scrolly-tour-subtext, #scrolly-flow-section .scrolly-step-label');
        await expect(sectionSubtitle.first()).toBeVisible();

        // 3. Ensure Canvas is rendered in #alpha-versorger-canvas
        const canvas = page.locator('#alpha-versorger-canvas canvas');
        await expect(canvas).toBeVisible({ timeout: 12000 });

        // 4. Ensure Telemetry Bar & Savings Cockpit items are present
        const modeBadge = page.locator('#scrolly-flow-section .alpha-mode-label, #flow-visualizer .alpha-mode-label, .alpha-mode-label').first();
        await expect(modeBadge).toBeVisible();
        await expect(modeBadge).toContainText('Ökostrom');

        const savingsDisplay = page.locator('#sim-savings-display');
        await expect(savingsDisplay).toBeVisible();
        await expect(savingsDisplay).toContainText(/bis zu \d+ € \/ Jahr/);

        const compareTag = page.locator('#sim-compare-tag');
        await expect(compareTag).toBeVisible();
        await expect(compareTag).toContainText('Grundversorger');

        // 5. Ensure HUD controls are present
        const modeTabs = page.locator('#alpha-versorger-canvas .hud-tab[data-mode]');
        await expect(modeTabs).toHaveCount(3);

        const focusTabs = page.locator('#alpha-versorger-canvas .hud-tab[data-focus]');
        await expect(focusTabs).toHaveCount(5);

        const burstBtn = page.locator('#alpha-versorger-canvas [data-action="burst"]');
        await expect(burstBtn).toBeVisible();

        expect(consoleErrors).toEqual([]);
    });

    test('2. Two-Way Sync: Calculator tab switches should update 3D Scene and HUD active state', async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });

        // Wait for versorger scene to be available
        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getScene('#alpha-versorger-canvas'));
        }, { timeout: 12000 });

        // 1. Initial mode should be 'strom'
        const initialMode = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene ? scene.currentMode : null;
        });
        expect(initialMode).toBe('strom');

        // 2. Click calculator tab "Wärmestrom"
        const calcWaermeTab = page.locator('.calc-tab-btn[data-branch="waerme"]');
        await calcWaermeTab.click();
        await expect(calcWaermeTab).toHaveClass(/active/);

        // 3D scene should now be 'waerme'
        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.currentMode === 'waerme';
        });

        // 3D HUD tab should also have active class
        const hudWaermeTab = page.locator('#alpha-versorger-canvas .hud-tab[data-mode="waerme"]');
        await expect(hudWaermeTab).toHaveClass(/active/);
        await expect(hudWaermeTab).toHaveAttribute('aria-pressed', 'true');

        // Mode badge should show Wärmestrom
        const modeBadge = page.locator('#scrolly-flow-section .alpha-mode-label, #flow-visualizer .alpha-mode-label, .alpha-mode-label').first();
        await expect(modeBadge).toContainText('Wärmestrom');

        // 3. Click calculator tab "Erdgas"
        const calcGasTab = page.locator('.calc-tab-btn[data-branch="gas"]');
        await calcGasTab.click();
        await expect(calcGasTab).toHaveClass(/active/);

        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.currentMode === 'gas';
        });

        const hudGasTab = page.locator('#alpha-versorger-canvas .hud-tab[data-mode="gas"]');
        await expect(hudGasTab).toHaveClass(/active/);
        await expect(modeBadge).toContainText('Ökogas');

        // 4. Click calculator tab "Ökostrom"
        const calcStromTab = page.locator('.calc-tab-btn[data-branch="strom"]');
        await calcStromTab.dispatchEvent('click');
        await expect(calcStromTab).toHaveClass(/active/);

        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.currentMode === 'strom';
        });

        const hudStromTab = page.locator('#alpha-versorger-canvas .hud-tab[data-mode="strom"]');
        await expect(hudStromTab).toHaveClass(/active/);
    });

    test('3. Two-Way Sync: Changing kWh input or household preset updates 3D scene consumption', async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getScene('#alpha-versorger-canvas'));
        }, { timeout: 12000 });

        // 1. Click household preset "4+ Personen (4.500 kWh)"
        const btn4500 = page.locator('.household-btn[data-kwh="4500"]');
        await btn4500.click();
        await expect(btn4500).toHaveClass(/active/);

        // Check scene consumption
        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.consumption === 4500;
        });

        const consumptionData = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene ? { kwh: scene.consumption, mult: scene.consumptionSpeedMultiplier } : null;
        });
        expect(consumptionData.kwh).toBe(4500);
        expect(consumptionData.mult).toBeGreaterThan(1.0);

        // 2. Click household preset "1 Person (1.500 kWh)"
        const btn1500 = page.locator('.household-btn[data-kwh="1500"]');
        await btn1500.click();

        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.consumption === 1500;
        });

        // 3. Type directly into #calcKwh input
        const kwhInput = page.locator('#calcKwh');
        await kwhInput.fill('6000');
        await kwhInput.dispatchEvent('input');

        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.consumption === 6000;
        });
    });

    test('4. Reverse Sync: Clicking 3D HUD buttons switches calculator tabs and triggers pulse burst', async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getScene('#alpha-versorger-canvas'));
        }, { timeout: 12000 });

        // 1. Click 3D HUD button "Wärmestrom § 14a"
        const hudWaermeBtn = page.locator('#alpha-versorger-canvas .hud-tab[data-mode="waerme"]');
        await hudWaermeBtn.dispatchEvent('click');

        // Calculator tab should have automatically become active
        const calcWaermeTab = page.locator('.calc-tab-btn[data-branch="waerme"]');
        await expect(calcWaermeTab).toHaveClass(/active/);

        // Check notice bar updated
        const noticeBar = page.locator('#calcBranchNoticeText');
        await expect(noticeBar).toContainText('14a');

        // 2. Click 3D HUD button "Erdgas Klimabeitrag"
        const hudGasBtn = page.locator('#alpha-versorger-canvas .hud-tab[data-mode="gas"]');
        await hudGasBtn.dispatchEvent('click');

        const calcGasTab = page.locator('.calc-tab-btn[data-branch="gas"]');
        await expect(calcGasTab).toHaveClass(/active/);
        await expect(noticeBar).toContainText('Klimaschutzbeitrag');

        // 3. Click Pulse Burst button
        const burstBtn = page.locator('#alpha-versorger-canvas [data-action="burst"]');
        await burstBtn.dispatchEvent('click');

        const burstTriggered = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene ? scene.burstVelocityBoost > 1.0 : false;
        });
        expect(burstTriggered).toBe(true);
    });

    test('5. Form submission, navigation, and zero overflow validation', async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });

        // 1. Submit calculator form
        const submitBtn = page.locator('.calc-submit-btn').first();
        await submitBtn.click();

        // Tariffs section should be in viewport
        const tarifeSection = page.locator('#tarife');
        await expect(tarifeSection).toBeVisible();

        // Prices should be populated
        const priceAlphaBasic = page.locator('#price-alpha-basic');
        await expect(priceAlphaBasic).toContainText('€');

        // 2. Test Mobile Viewport and Overflow
        await page.setViewportSize({ width: 375, height: 667 });

        const viewport = page.locator('#alpha-versorger-canvas');
        await expect(viewport).toBeVisible();

        const box = await viewport.boundingBox();
        expect(box).not.toBeNull();
        expect(box.height).toBeLessThanOrEqual(420);

        // Zero horizontal overflow check
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

        // Hamburger menu is intact
        const hamburger = page.locator('.hamburger');
        await expect(hamburger).toBeVisible();
    });

});
