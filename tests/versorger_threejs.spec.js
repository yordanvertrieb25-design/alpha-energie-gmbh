const { test, expect } = require('@playwright/test');

test.describe('Alpha Energie 3D Versorger Three.js Quality & Functional Suite', () => {

    test.beforeEach(async ({ page }) => {
        // Pre-seed consent so cookie banners and overlays do not obstruct interactions
        await page.addInitScript(() => {
            localStorage.setItem('alpha_consent_status', 'all');
            localStorage.setItem('cookieConsent', 'all');
            localStorage.setItem('cookie_analytics', 'true');
            localStorage.setItem('cookie_marketing', 'true');
        });
    });

    test('1. versorger.html loads with 0 console errors', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                // Filter out external resources that might not be hosted locally in testing env (e.g. video files/external fonts/favicon)
                if (!text.includes('favicon') && !text.includes('.mp4') && !text.includes('.webm')) {
                    consoleErrors.push(text);
                }
            }
        });

        const pageErrors = [];
        page.on('pageerror', err => {
            pageErrors.push(err.message || String(err));
        });

        await page.goto('/versorger.html', { waitUntil: 'load' });

        // Wait for Three.js engine and scene to initialize
        await page.waitForFunction(() => {
            return typeof window.AlphaThree !== 'undefined' &&
                   Boolean(window.AlphaThree.getScene('#alpha-versorger-canvas'));
        }, { timeout: 15000 });

        expect(pageErrors).toEqual([]);
        expect(consoleErrors).toEqual([]);
    });

    test('2. [data-three-scene="versorger-flow"] initializes WebGL canvas properly', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const container = page.locator('[data-three-scene="versorger-flow"]');
        await expect(container).toBeVisible({ timeout: 15000 });

        // Check WebGL canvas element
        const canvas = container.locator('canvas');
        await expect(canvas).toBeVisible();

        const canvasBox = await canvas.boundingBox();
        expect(canvasBox).not.toBeNull();
        expect(canvasBox.width).toBeGreaterThan(100);
        expect(canvasBox.height).toBeGreaterThan(100);

        // Verify scene and controller via AlphaThree API
        const sceneInfo = await page.evaluate(() => {
            const ctrl = window.AlphaThree.getController('#alpha-versorger-canvas');
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return {
                hasController: Boolean(ctrl),
                isControllerRunning: ctrl ? ctrl.isRunning : false,
                hasScene: Boolean(scene),
                hasWebGLRenderer: ctrl && ctrl.renderer ? Boolean(ctrl.renderer.getContext()) : false,
                currentMode: scene ? scene.currentMode : null,
                consumption: scene ? scene.consumption : null
            };
        });

        expect(sceneInfo.hasController).toBe(true);
        expect(sceneInfo.isControllerRunning).toBe(true);
        expect(sceneInfo.hasScene).toBe(true);
        expect(sceneInfo.hasWebGLRenderer).toBe(true);
        expect(sceneInfo.currentMode).toBe('strom');
        expect(sceneInfo.consumption).toBeGreaterThanOrEqual(1000);
    });

    test('3. Mode switching (Ökostrom, Wärmestrom, Erdgas) updates visual state and classes', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getScene('#alpha-versorger-canvas'));
        }, { timeout: 15000 });

        const hudWaermeBtn = page.locator('#alpha-versorger-canvas .hud-tab[data-mode="waerme"]');
        const hudGasBtn = page.locator('#alpha-versorger-canvas .hud-tab[data-mode="gas"]');
        const hudStromBtn = page.locator('#alpha-versorger-canvas .hud-tab[data-mode="strom"]');
        const modeBadge = page.locator('#flow-visualizer .alpha-mode-label, #flow-visualizer [data-mode-label]');

        // 1. Switch to Wärmestrom
        await hudWaermeBtn.click();
        await expect(hudWaermeBtn).toHaveClass(/active/);
        await expect(hudWaermeBtn).toHaveAttribute('aria-pressed', 'true');
        await expect(hudStromBtn).not.toHaveClass(/active/);
        await expect(modeBadge).toContainText('Wärmestrom');

        const modeAfterWaerme = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene ? scene.currentMode : null;
        });
        expect(modeAfterWaerme).toBe('waerme');

        // 2. Switch to Erdgas / Ökogas
        await hudGasBtn.click();
        await expect(hudGasBtn).toHaveClass(/active/);
        await expect(hudGasBtn).toHaveAttribute('aria-pressed', 'true');
        await expect(hudWaermeBtn).not.toHaveClass(/active/);
        await expect(modeBadge).toContainText('Ökogas');

        const modeAfterGas = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene ? scene.currentMode : null;
        });
        expect(modeAfterGas).toBe('gas');

        // 3. Switch back to Ökostrom
        await hudStromBtn.click();
        await expect(hudStromBtn).toHaveClass(/active/);
        await expect(hudStromBtn).toHaveAttribute('aria-pressed', 'true');
        await expect(hudGasBtn).not.toHaveClass(/active/);
        await expect(modeBadge).toContainText('Ökostrom');

        const modeAfterStrom = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene ? scene.currentMode : null;
        });
        expect(modeAfterStrom).toBe('strom');
    });

    test('4. Two-way sync with the Tarifrechner (tabs and kWh consumption)', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getScene('#alpha-versorger-canvas'));
        }, { timeout: 15000 });

        // A. Calculator tab click -> updates 3D scene
        const calcWaermeTab = page.locator('.calc-tab-btn[data-branch="waerme"]');
        await calcWaermeTab.click();
        await expect(calcWaermeTab).toHaveClass(/active/);

        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.currentMode === 'waerme';
        });

        const hudWaermeBtn = page.locator('#alpha-versorger-canvas .hud-tab[data-mode="waerme"]');
        await expect(hudWaermeBtn).toHaveClass(/active/);

        // B. Changing kWh updates consumption and speed multiplier
        const householdBtn4500 = page.locator('.household-btn[data-kwh="4500"]');
        await householdBtn4500.click();

        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.consumption === 4500;
        });

        const scaling4500 = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene ? { kwh: scene.consumption, mult: scene.consumptionSpeedMultiplier } : null;
        });
        expect(scaling4500.kwh).toBe(4500);
        expect(scaling4500.mult).toBeGreaterThan(1.0);

        // Typing custom kWh in #calcKwh input
        const kwhInput = page.locator('#calcKwh');
        await kwhInput.fill('7500');
        await kwhInput.dispatchEvent('input');

        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.consumption === 7500;
        });

        const scaling7500 = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene ? { kwh: scene.consumption, mult: scene.consumptionSpeedMultiplier } : null;
        });
        expect(scaling7500.kwh).toBe(7500);
        expect(scaling7500.mult).toBeGreaterThan(scaling4500.mult);

        // C. Reverse sync: clicking HUD tab switches calculator tab
        const hudGasBtn = page.locator('#alpha-versorger-canvas .hud-tab[data-mode="gas"]');
        await hudGasBtn.click();

        const calcGasTab = page.locator('.calc-tab-btn[data-branch="gas"]');
        await expect(calcGasTab).toHaveClass(/active/);
    });

    test('5. Pulse shockwave button trigger', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getScene('#alpha-versorger-canvas'));
        }, { timeout: 15000 });

        const burstBtn = page.locator('#alpha-versorger-canvas [data-action="burst"]');
        await expect(burstBtn).toBeVisible();
        await burstBtn.click();

        const burstState = await page.evaluate(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene ? {
                burstBoost: scene.burstVelocityBoost,
                burstTime: scene.burstTime,
                activeRings: scene.burstRings ? scene.burstRings.filter(r => r.active).length : 0
            } : null;
        });

        expect(burstState).not.toBeNull();
        expect(burstState.burstBoost).toBeGreaterThan(1.0);
        expect(burstState.burstTime).toBeGreaterThan(0);
        expect(burstState.activeRings).toBeGreaterThan(0);
    });

    test('6. Mobile responsiveness (375px viewport) and zero horizontal overflow', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const viewport = page.locator('#alpha-versorger-canvas');
        await expect(viewport).toBeVisible();

        const box = await viewport.boundingBox();
        expect(box).not.toBeNull();
        expect(box.width).toBeLessThanOrEqual(375);
        expect(box.height).toBeLessThanOrEqual(420);

        // Zero horizontal overflow across the entire page
        const overflowDetails = await page.evaluate(() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            return {
                docWidth,
                winWidth,
                hasOverflow: docWidth > winWidth
            };
        });

        expect(overflowDetails.hasOverflow).toBe(false);

        // Mobile header/navigation remains accessible
        const hamburger = page.locator('.hamburger');
        await expect(hamburger).toBeVisible();
    });

    test('7. IntersectionObserver pause/resume when scrolled out of view', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getController('#alpha-versorger-canvas'));
        }, { timeout: 15000 });

        // Scroll the canvas directly into center of view first
        await page.locator('#alpha-versorger-canvas').scrollIntoViewIfNeeded();

        await page.waitForFunction(() => {
            const ctrl = window.AlphaThree.getController('#alpha-versorger-canvas');
            return ctrl && ctrl.isVisible === true;
        }, { timeout: 5000 });

        const inViewStatus = await page.evaluate(() => {
            const ctrl = window.AlphaThree.getController('#alpha-versorger-canvas');
            return ctrl ? ctrl.isVisible : false;
        });
        expect(inViewStatus).toBe(true);

        // Scroll far down to the very bottom of the page (footer)
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });

        // Wait for IntersectionObserver callback to fire pause
        await page.waitForFunction(() => {
            const ctrl = window.AlphaThree.getController('#alpha-versorger-canvas');
            return ctrl && ctrl.isVisible === false;
        }, { timeout: 6000 });

        const scrolledOutStatus = await page.evaluate(() => {
            const ctrl = window.AlphaThree.getController('#alpha-versorger-canvas');
            return ctrl ? ctrl.isVisible : true;
        });
        expect(scrolledOutStatus).toBe(false);

        // Scroll back up to the canvas
        await page.locator('#alpha-versorger-canvas').scrollIntoViewIfNeeded();

        // Wait for IntersectionObserver callback to fire resume
        await page.waitForFunction(() => {
            const ctrl = window.AlphaThree.getController('#alpha-versorger-canvas');
            return ctrl && ctrl.isVisible === true;
        }, { timeout: 6000 });

        const resumedStatus = await page.evaluate(() => {
            const ctrl = window.AlphaThree.getController('#alpha-versorger-canvas');
            return ctrl ? ctrl.isVisible : false;
        });
        expect(resumedStatus).toBe(true);
    });

    test('8. Smart Home Spar-Simulator: Savings badge, comparison tag, and quick consumption buttons sync', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getScene('#alpha-versorger-canvas'));
        }, { timeout: 15000 });

        const savingsBadge = page.locator('#sim-savings-display');
        const compareTag = page.locator('#sim-compare-tag');

        await expect(savingsBadge).toBeVisible();
        await expect(compareTag).toBeVisible();
        await expect(savingsBadge).toContainText('380');
        await expect(compareTag).toContainText('1.140');
        await expect(compareTag).toContainText('760');

        // Click quick consumption pill: 5.000 kWh
        const kwh5000Btn = page.locator('.hud-kwh-btn[data-sim-kwh="5000"]');
        await expect(kwh5000Btn).toBeVisible();
        await kwh5000Btn.click();

        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.consumption === 5000;
        });

        // Calculator input should also sync to 5000
        const calcKwh = page.locator('#calcKwh');
        await expect(calcKwh).toHaveValue('5000');

        // Savings display should update dynamically to 760 € / Jahr
        await expect(savingsBadge).toContainText('760');
    });

    test('9. Hotspot camera focus buttons (solar, waerme, wallbox, strom, overview) update 3D scene camera target', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getScene('#alpha-versorger-canvas'));
        }, { timeout: 15000 });

        const solarFocusBtn = page.locator('#alpha-versorger-canvas .hud-tab[data-focus="solar"]');
        await expect(solarFocusBtn).toBeVisible();
        await solarFocusBtn.click();

        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.currentFocus === 'solar';
        });

        const waermeFocusBtn = page.locator('#alpha-versorger-canvas .hud-tab[data-focus="waerme"]');
        await waermeFocusBtn.click();

        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.currentFocus === 'waerme';
        });

        const wallboxFocusBtn = page.locator('#alpha-versorger-canvas .hud-tab[data-focus="wallbox"]');
        await wallboxFocusBtn.click();

        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.currentFocus === 'wallbox';
        });

        const overviewFocusBtn = page.locator('#alpha-versorger-canvas .hud-tab[data-focus="overview"]');
        await overviewFocusBtn.click();

        await page.waitForFunction(() => {
            const scene = window.AlphaThree.getScene('#alpha-versorger-canvas');
            return scene && scene.currentFocus === 'overview';
        });
    });

    test('10. Floating 3D Callout Banners render with required tariff copy and direct calculator links', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        await page.waitForFunction(() => {
            return Boolean(window.AlphaThree && window.AlphaThree.getScene('#alpha-versorger-canvas'));
        }, { timeout: 15000 });

        // Wait for anchor layer
        const anchorLayer = page.locator('#alpha-versorger-canvas .alpha-3d-anchors-layer');
        await expect(anchorLayer).toBeAttached();

        // 1. Heat Pump Banner & Text
        const waermeCard = page.locator('#alpha-versorger-canvas .alpha-anchor-waerme');
        await expect(waermeCard).toBeAttached();
        await expect(waermeCard).toContainText('Wir bieten günstige Stromtarife für Wärmepumpen an');

        // 2. Wallbox Banner & Text
        const wallboxCard = page.locator('#alpha-versorger-canvas .alpha-anchor-wallbox');
        await expect(wallboxCard).toBeAttached();
        await expect(wallboxCard).toContainText('Wir bieten spezielle Stromtarife für Wallboxen an');

        // 3. Hausstrom Banner & Text
        const stromCard = page.locator('#alpha-versorger-canvas .alpha-anchor-strom');
        await expect(stromCard).toBeAttached();
        await expect(stromCard).toContainText('Wir bieten 100 % Ökostromtarife für Ihren Hausstrom an');

        // 4. Solar Banner & Text
        const solarCard = page.locator('#alpha-versorger-canvas .alpha-anchor-solar');
        await expect(solarCard).toBeAttached();
        await expect(solarCard).toContainText('Wir bieten flexible Stromtarife für Solaranlagen & Speicher an');

        // 5. Test Banner CTA Click scrolls to calculator
        const waermeCta = waermeCard.locator('.alpha-anchor-btn');
        await waermeCta.click();

        // Should switch calculator to waerme tab
        const activeTab = page.locator('.calc-tab-btn.active');
        await expect(activeTab).toHaveAttribute('data-branch', 'waerme');
    });

});
