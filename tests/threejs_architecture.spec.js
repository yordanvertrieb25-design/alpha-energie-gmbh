const { test, expect } = require('@playwright/test');

test.describe('Alpha Energie Three.js Architecture & Engine', () => {

    test('should load Three.js engine and auto-initialize scenes', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('/three-demo.html');

        // Check window.THREE & window.AlphaThree
        const isThreeLoaded = await page.evaluate(() => {
            return typeof window.THREE !== 'undefined' && typeof window.AlphaThree !== 'undefined';
        });
        expect(isThreeLoaded).toBe(true);

        // Verify registered scenes
        const scenes = await page.evaluate(() => {
            return window.AlphaThree.getRegisteredScenes();
        });
        expect(scenes).toContain('energy-network');
        expect(scenes).toContain('energy-globe');
        expect(scenes).toContain('versorger-flow');

        // Verify canvas elements exist inside containers
        const heroCanvas = page.locator('#hero-network-canvas canvas');
        await expect(heroCanvas).toBeVisible();

        const cardCanvas = page.locator('#card-globe-canvas canvas');
        await expect(cardCanvas).toBeVisible();

        const flowCanvas = page.locator('#card-flow-canvas canvas');
        await expect(flowCanvas).toBeVisible();

        // Ensure no WebGL or runtime JS errors
        expect(consoleErrors.filter(err => !err.includes('favicon'))).toEqual([]);
    });

    test('should handle interactive mode switching and pulses', async ({ page }) => {
        await page.goto('/three-demo.html');

        // Wait for hero scene instance
        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getScene('#hero-network-canvas'));
        });

        // Click Solar Fokus mode
        const solarBtn = page.locator('#network-modes button[data-mode="solar"]');
        await solarBtn.click();

        const currentMode = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#hero-network-canvas');
            return scene ? scene.mode : null;
        });
        expect(currentMode).toBe('solar');

        // Trigger burst
        const burstBtn = page.locator('#btn-burst');
        await burstBtn.click();

        const burstActive = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#hero-network-canvas');
            return scene && scene.burstTime > 0;
        });
        expect(burstActive).toBe(true);
    });

    test('should support clean teardown and recreation without leaks', async ({ page }) => {
        await page.goto('/three-demo.html');

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getScene('#hero-network-canvas'));
        });

        // Click Destroy
        await page.locator('#btn-destroy-hero').click();

        // Canvas should be removed from DOM
        const heroCanvasesAfterDestroy = await page.locator('#hero-network-canvas canvas').count();
        expect(heroCanvasesAfterDestroy).toBe(0);

        // Scene instance should be null
        const sceneAfterDestroy = await page.evaluate(() => {
            return window.AlphaThree.getScene('#hero-network-canvas');
        });
        expect(sceneAfterDestroy).toBeNull();

        // Recreate scene
        await page.locator('#btn-recreate-hero').click();
        await page.waitForSelector('#hero-network-canvas canvas');

        const sceneRecreated = await page.evaluate(() => {
            return Boolean(window.AlphaThree.getScene('#hero-network-canvas'));
        });
        expect(sceneRecreated).toBe(true);
    });

    test('should support pauseAll and resumeAll', async ({ page }) => {
        await page.goto('/three-demo.html');

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getController('#hero-network-canvas'));
        });

        // Pause
        await page.locator('#btn-pause-all').click();
        const isPaused = await page.evaluate(() => {
            const ctrl = window.AlphaThree.getController('#hero-network-canvas');
            return ctrl ? !ctrl.isVisible : false;
        });
        expect(isPaused).toBe(true);

        // Resume
        await page.locator('#btn-resume-all').click();
        const isResumed = await page.evaluate(() => {
            const ctrl = window.AlphaThree.getController('#hero-network-canvas');
            return ctrl ? ctrl.isVisible : false;
        });
        expect(isResumed).toBe(true);
    });

    test('should control VersorgerFlowScene modes, consumption scaling, and pulse burst', async ({ page }) => {
        await page.goto('/three-demo.html');

        // Wait for versorger-flow scene instance
        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getScene('#card-flow-canvas'));
        });

        // 1. Initial Mode should be 'strom'
        const initialMode = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#card-flow-canvas');
            return scene ? scene.currentMode : null;
        });
        expect(initialMode).toBe('strom');

        // 2. Switch to Wärmestrom
        const waermeBtn = page.locator('button[data-mode="waerme"][data-scene-target="#card-flow-canvas"]');
        await waermeBtn.click();

        const waermeMode = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#card-flow-canvas');
            return scene ? scene.currentMode : null;
        });
        expect(waermeMode).toBe('waerme');

        // Verify label update
        const modeLabel = page.locator('#card-flow-canvas').locator('xpath=ancestor::div[contains(@class,"scene-card")]').locator('[data-mode-label]');
        await expect(modeLabel).toContainText('Wärmestrom');

        // 3. Switch to Ökogas
        const gasBtn = page.locator('button[data-mode="gas"][data-scene-target="#card-flow-canvas"]');
        await gasBtn.click();

        const gasMode = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#card-flow-canvas');
            return scene ? scene.currentMode : null;
        });
        expect(gasMode).toBe('gas');
        await expect(modeLabel).toContainText('Ökogas');

        // 4. Test dynamic consumption scaling
        await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#card-flow-canvas');
            if (scene) scene.setConsumption(6500);
        });

        const updatedConsumption = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#card-flow-canvas');
            return scene ? { consumption: scene.consumption, multiplier: scene.consumptionSpeedMultiplier } : null;
        });
        expect(updatedConsumption.consumption).toBe(6500);
        expect(updatedConsumption.multiplier).toBeGreaterThan(1.2);

        // 5. Test pulse burst on versorger-flow
        const burstBtn = page.locator('button[data-action="burst"][data-scene-target="#card-flow-canvas"]');
        await burstBtn.click();

        const burstTriggered = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#card-flow-canvas');
            return scene ? scene.burstVelocityBoost > 1.0 : false;
        });
        expect(burstTriggered).toBe(true);
    });

});
