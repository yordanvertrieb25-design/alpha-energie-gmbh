const { test, expect } = require('@playwright/test');

test.describe('Alpha Energie Three.js Integration & QA Suite', () => {

    test.beforeEach(async ({ page }) => {
        // Pre-seed cookie consent so overlay does not interfere with pointer and click interactions
        await page.addInitScript(() => {
            localStorage.setItem('alpha_consent_status', 'all');
            localStorage.setItem('cookieConsent', 'all');
            localStorage.setItem('cookie_analytics', 'true');
            localStorage.setItem('cookie_marketing', 'true');
        });
    });

    test('1. Three.js library loading, module initialization, and brand palette tokens', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && !msg.text().includes('favicon')) {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('/three-demo.html');

        // Check window.THREE and window.AlphaThree global availability
        const isLoaded = await page.evaluate(() => {
            return {
                hasThree: typeof window.THREE !== 'undefined',
                hasAlphaThree: typeof window.AlphaThree !== 'undefined',
                hasManager: typeof window.AlphaThreeManager !== 'undefined',
                isWebGLSupported: window.AlphaThree.isWebGLSupported(),
                scenes: window.AlphaThree.getRegisteredScenes(),
                palette: window.AlphaThree.PALETTE
            };
        });

        expect(isLoaded.hasThree).toBe(true);
        expect(isLoaded.hasAlphaThree).toBe(true);
        expect(isLoaded.hasManager).toBe(true);
        expect(isLoaded.isWebGLSupported).toBe(true);
        expect(isLoaded.scenes).toContain('energy-network');
        expect(isLoaded.scenes).toContain('energy-globe');

        // Check Alpha Energie brand palette tokens
        expect(isLoaded.palette.greenNeon).toBe('#00E676');
        expect(isLoaded.palette.blueCyan).toBe('#00D2FF');
        expect(isLoaded.palette.slateMidnight).toBe('#0B132B');

        expect(consoleErrors).toEqual([]);
    });

    test('2. Canvas creation and WebGL context rendering across scenes', async ({ page }) => {
        await page.goto('/three-demo.html');

        // Wait for hero canvas creation
        const heroContainer = page.locator('#hero-network-canvas');
        const heroCanvas = heroContainer.locator('canvas');
        await expect(heroCanvas).toBeVisible({ timeout: 10000 });

        // Wait for card globe canvas creation
        const globeContainer = page.locator('#card-globe-canvas');
        const globeCanvas = globeContainer.locator('canvas');
        await expect(globeCanvas).toBeVisible({ timeout: 10000 });

        // Verify WebGL context status and render state
        const contextStatus = await page.evaluate(() => {
            const canvas = document.querySelector('#hero-network-canvas canvas');
            if (!canvas) return null;
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            const ctrl = window.AlphaThree.getController('#hero-network-canvas');
            return {
                hasGl: Boolean(gl),
                isContextLost: gl ? gl.isContextLost() : true,
                drawingWidth: gl ? gl.drawingBufferWidth : 0,
                drawingHeight: gl ? gl.drawingBufferHeight : 0,
                pixelRatio: ctrl && ctrl.renderer ? ctrl.renderer.getPixelRatio() : 0,
                maxPixelRatio: ctrl ? ctrl.options.maxPixelRatio : 0,
                hasSceneInstance: Boolean(ctrl && ctrl.sceneInstance)
            };
        });

        expect(contextStatus).not.toBeNull();
        expect(contextStatus.hasGl).toBe(true);
        expect(contextStatus.isContextLost).toBe(false);
        expect(contextStatus.drawingWidth).toBeGreaterThan(0);
        expect(contextStatus.drawingHeight).toBeGreaterThan(0);
        // Pixel ratio clamped to max 2
        expect(contextStatus.pixelRatio).toBeLessThanOrEqual(2);
        expect(contextStatus.hasSceneInstance).toBe(true);
    });

    test('3. Interaction response (mouse move, normalized coordinates, and burst pulse)', async ({ page }) => {
        await page.goto('/three-demo.html');

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getController('#hero-network-canvas'));
        });

        const heroBox = await page.locator('#hero-network-canvas').boundingBox();
        expect(heroBox).not.toBeNull();

        // Initial pointer state at rest
        const initialPointer = await page.evaluate(() => {
            const ctrl = window.AlphaThree.getController('#hero-network-canvas');
            return { ...ctrl.targetPointer };
        });
        expect(initialPointer.x).toBe(0);
        expect(initialPointer.y).toBe(0);

        // Move mouse to top-right quadrant of canvas
        const targetX = heroBox.x + heroBox.width * 0.85;
        const targetY = heroBox.y + heroBox.height * 0.25;
        await page.mouse.move(targetX, targetY);
        await page.waitForTimeout(150);

        // Verify pointer updated to normalized range
        const movedPointer = await page.evaluate(() => {
            const ctrl = window.AlphaThree.getController('#hero-network-canvas');
            return {
                target: { ...ctrl.targetPointer },
                isInside: ctrl.isPointerInside,
                current: { ...ctrl.currentPointer }
            };
        });

        expect(movedPointer.isInside).toBe(true);
        expect(movedPointer.target.x).toBeGreaterThan(0.5);
        expect(movedPointer.target.y).toBeGreaterThan(0.2);

        // Move mouse outside canvas to trigger mouseleave
        await page.mouse.move(10, 10);
        await page.waitForTimeout(150);

        const leftPointer = await page.evaluate(() => {
            const ctrl = window.AlphaThree.getController('#hero-network-canvas');
            return {
                target: { ...ctrl.targetPointer },
                isInside: ctrl.isPointerInside
            };
        });
        expect(leftPointer.isInside).toBe(false);
        expect(leftPointer.target.x).toBe(0);
        expect(leftPointer.target.y).toBe(0);

        // Test energy burst pulse trigger
        const burstResult = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#hero-network-canvas');
            if (!scene) return null;
            scene.pulseBurst();
            return {
                burstTime: scene.burstTime
            };
        });
        expect(burstResult).not.toBeNull();
        expect(burstResult.burstTime).toBeGreaterThan(0);
    });

    test('4. Visibility and IntersectionObserver logic (pausing offscreen, resuming onscreen)', async ({ page }) => {
        await page.goto('/three-demo.html');

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getController('#card-globe-canvas'));
        });

        // 1. Verify card globe canvas controller exists and handles visibility state
        const initialStatus = await page.evaluate(() => {
            const ctrl = window.AlphaThree.getController('#card-globe-canvas');
            return {
                hasObserver: Boolean(ctrl.intersectionObserver),
                isRunning: ctrl.isRunning,
                isVisible: ctrl.isVisible
            };
        });
        expect(initialStatus.hasObserver).toBe(true);

        // 2. Direct pause / resume cycle testing (0% CPU/GPU throttle test)
        const pauseResumeTest = await page.evaluate(() => {
            const ctrl = window.AlphaThree.getController('#card-globe-canvas');
            ctrl.pause();
            const afterPause = {
                isVisible: ctrl.isVisible,
                rafId: ctrl.rafId
            };
            ctrl.resume();
            const afterResume = {
                isVisible: ctrl.isVisible,
                rafId: ctrl.rafId !== null
            };
            return { afterPause, afterResume };
        });

        expect(pauseResumeTest.afterPause.isVisible).toBe(false);
        expect(pauseResumeTest.afterPause.rafId).toBeNull();
        expect(pauseResumeTest.afterResume.isVisible).toBe(true);
        expect(pauseResumeTest.afterResume.rafId).toBe(true);

        // 3. Scroll simulation: scroll page to bottom then back to top
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(300);

        // When scrolled to bottom, hero section at the top should have triggered pause if offscreen
        const heroOffscreen = await page.evaluate(() => {
            const heroCtrl = window.AlphaThree.getController('#hero-network-canvas');
            return heroCtrl ? heroCtrl.isVisible : true;
        });

        // Scroll back to top
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);

        const heroOnscreen = await page.evaluate(() => {
            const heroCtrl = window.AlphaThree.getController('#hero-network-canvas');
            return heroCtrl ? heroCtrl.isVisible : false;
        });
        expect(heroOnscreen).toBe(true);
    });

    test('5. Responsive behavior across mobile, tablet, and desktop viewports', async ({ page }) => {
        const viewports = [
            { name: 'Mobile', width: 375, height: 667 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Desktop', width: 1280, height: 800 },
            { name: 'Full HD', width: 1920, height: 1080 }
        ];

        for (const vp of viewports) {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.goto('/three-demo.html');

            await page.waitForFunction(() => {
                return Boolean(window.AlphaThree && window.AlphaThree.getController('#hero-network-canvas'));
            });

            // Verify canvas dimensions and camera aspect ratio adapt
            const dimensions = await page.evaluate(() => {
                const ctrl = window.AlphaThree.getController('#hero-network-canvas');
                if (!ctrl) return null;
                const canvas = ctrl.renderer.domElement;
                return {
                    aspect: ctrl.camera.aspect,
                    containerWidth: ctrl.container.clientWidth,
                    containerHeight: ctrl.container.clientHeight,
                    canvasWidth: canvas.clientWidth,
                    canvasHeight: canvas.clientHeight,
                    scrollWidth: document.documentElement.scrollWidth,
                    windowWidth: window.innerWidth
                };
            });

            expect(dimensions).not.toBeNull();
            expect(dimensions.canvasWidth).toBeGreaterThan(0);
            expect(dimensions.canvasHeight).toBeGreaterThan(0);

            // Aspect ratio matches container aspect within 0.05
            const expectedAspect = dimensions.containerWidth / dimensions.containerHeight;
            expect(Math.abs(dimensions.aspect - expectedAspect)).toBeLessThan(0.05);

            // No horizontal scroll overflow
            expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.windowWidth + 2);
        }
    });

    test('6. Clean teardown, disposal without memory leaks, and zero console errors', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('video')) {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('/three-demo.html');

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getController('#hero-network-canvas'));
        });

        // Test comprehensive destruction
        const destroyStatus = await page.evaluate(() => {
            const container = document.querySelector('#hero-network-canvas');
            const ctrl = window.AlphaThree.getController('#hero-network-canvas');
            const renderer = ctrl.renderer;

            // Spy on context loss
            let contextLossForced = false;
            if (renderer && renderer.forceContextLoss) {
                const originalForce = renderer.forceContextLoss.bind(renderer);
                renderer.forceContextLoss = () => {
                    contextLossForced = true;
                    originalForce();
                };
            }

            const success = window.AlphaThree.destroy('#hero-network-canvas');
            const canvasRemaining = container.querySelectorAll('canvas').length;
            const controllerRemaining = window.AlphaThree.getController('#hero-network-canvas');

            return {
                success,
                canvasRemaining,
                hasController: Boolean(controllerRemaining),
                contextLossForced
            };
        });

        expect(destroyStatus.success).toBe(true);
        expect(destroyStatus.canvasRemaining).toBe(0);
        expect(destroyStatus.hasController).toBe(false);

        // Re-initialize scene after destruction
        const reinitStatus = await page.evaluate(async () => {
            const ctrl = await window.AlphaThree.init('#hero-network-canvas', 'energy-network', {
                mode: 'wind',
                speed: 1.5
            });
            return {
                hasCtrl: Boolean(ctrl),
                mode: ctrl && ctrl.sceneInstance ? ctrl.sceneInstance.mode : null,
                hasCanvas: document.querySelectorAll('#hero-network-canvas canvas').length > 0
            };
        });

        expect(reinitStatus.hasCtrl).toBe(true);
        expect(reinitStatus.mode).toBe('wind');
        expect(reinitStatus.hasCanvas).toBe(true);

        // Verify zero console errors
        expect(consoleErrors).toEqual([]);
    });

    test('7. End-to-end integration on Homepage and Photovoltaik page', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('video')) {
                consoleErrors.push(msg.text());
            }
        });

        // 1. Visit index.html
        await page.goto('/');
        const indexCanvas = page.locator('#alpha-energy-network-canvas canvas');
        await expect(indexCanvas).toBeVisible({ timeout: 10000 });

        const indexMode = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-energy-network-canvas');
            return scene ? scene.mode : null;
        });
        expect(indexMode).toBe('balanced');

        // 2. Visit photovoltaik.html
        await page.goto('/photovoltaik.html');
        const pvCanvas = page.locator('#pv-solar-network-canvas canvas');
        await expect(pvCanvas).toBeVisible({ timeout: 10000 });

        const pvMode = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#pv-solar-network-canvas');
            return scene ? scene.mode : null;
        });
        expect(pvMode).toBe('solar');

        // Verify zero console errors across navigation
        expect(consoleErrors).toEqual([]);
    });

});
