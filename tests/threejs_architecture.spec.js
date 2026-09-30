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

        // Verify canvas elements exist inside containers
        const heroCanvas = page.locator('#hero-network-canvas canvas');
        await expect(heroCanvas).toBeVisible();

        const cardCanvas = page.locator('#card-globe-canvas canvas');
        await expect(cardCanvas).toBeVisible();

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

});
