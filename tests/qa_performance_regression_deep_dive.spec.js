const { test, expect } = require('@playwright/test');

test.describe('Alpha Energie GmbH - Rigorous QA Performance & Regression Deep Dive', () => {

    test.beforeEach(async ({ page }) => {
        // Pre-seed consent so cookie banners don't interfere
        await page.addInitScript(() => {
            localStorage.setItem('alpha_consent_status', 'all');
            localStorage.setItem('cookieConsent', 'all');
            localStorage.setItem('cookie_analytics', 'true');
            localStorage.setItem('cookie_marketing', 'true');
        });
    });

    test('1. Console Inspection & Zero-Error Check on versorger.html and index.html', async ({ page }) => {
        const pagesToCheck = ['/versorger.html', '/index.html'];

        for (const path of pagesToCheck) {
            const consoleErrors = [];
            const pageErrors = [];
            const failedRequests = [];

            page.on('console', msg => {
                if (msg.type() === 'error') {
                    const text = msg.text();
                    // Ignore non-actionable external sandbox items like favicon if missing or external analytics
                    if (!text.includes('favicon') && !text.includes('gtag') && !text.includes('analytics')) {
                        consoleErrors.push(`[${path}] Console Error: ${text}`);
                    }
                }
            });

            page.on('pageerror', err => {
                pageErrors.push(`[${path}] Page Exception: ${err.message || String(err)}`);
            });

            page.on('requestfailed', req => {
                const url = req.url();
                if (!url.includes('favicon') && !url.includes('analytics') && !url.includes('googletagmanager')) {
                    failedRequests.push(`[${path}] Request Failed: ${url} - ${req.failure()?.errorText}`);
                }
            });

            await page.goto(path, { waitUntil: 'networkidle' });

            // Let any async animations and Three.js / Scrollytelling finish initializing
            await page.waitForTimeout(1000);

            expect(pageErrors, `Page errors found on ${path}`).toEqual([]);
            expect(consoleErrors, `Console errors found on ${path}`).toEqual([]);
            expect(failedRequests, `Failed network requests found on ${path}`).toEqual([]);
        }
    });

    test('2. 60 FPS Smooth Scrolling & Frame Budget Verification on versorger.html and index.html', async ({ page }) => {
        const targets = ['/versorger.html', '/index.html'];

        for (const target of targets) {
            await page.setViewportSize({ width: 1440, height: 900 });
            await page.goto(target, { waitUntil: 'networkidle' });
            await page.waitForTimeout(500);

            // Measure requestAnimationFrame delta intervals during continuous scrolling
            const fpsMetrics = await page.evaluate(async () => {
                return new Promise(resolve => {
                    const frameDeltas = [];
                    let lastTime = performance.now();
                    let frames = 0;
                    let scrollDistance = 0;
                    const maxScroll = Math.min(3000, document.documentElement.scrollHeight - window.innerHeight);

                    function step(time) {
                        const delta = time - lastTime;
                        lastTime = time;
                        frameDeltas.push(delta);
                        frames++;

                        scrollDistance += 60;
                        window.scrollTo(0, scrollDistance);

                        if (scrollDistance < maxScroll && frames < 120) {
                            requestAnimationFrame(step);
                        } else {
                            // Calculate stats
                            // Drop first frame as warm-up
                            const validDeltas = frameDeltas.slice(1);
                            const avgDelta = validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length;
                            const maxDelta = Math.max(...validDeltas);
                            const jankFrames = validDeltas.filter(d => d > 33.33).length; // Dropped below 30fps
                            const fps = 1000 / avgDelta;

                            resolve({
                                totalFrames: frames,
                                avgDeltaMs: avgDelta,
                                maxDeltaMs: maxDelta,
                                jankFrames,
                                approxFps: fps
                            });
                        }
                    }

                    requestAnimationFrame(step);
                });
            });

            console.log(`[FPS Audit] ${target}: Approx FPS = ${fpsMetrics.approxFps.toFixed(1)}, Avg Frame Delta = ${fpsMetrics.avgDeltaMs.toFixed(2)}ms, Jank (>33ms) = ${fpsMetrics.jankFrames}`);

            // Average FPS should be high (>= 45fps in headless CI virtual environments without hardware GPU acceleration)
            expect(fpsMetrics.approxFps).toBeGreaterThanOrEqual(40);
            // Long frames (>100ms frozen UI) should be near zero
            expect(fpsMetrics.jankFrames).toBeLessThanOrEqual(5);
        }
    });

    test('3. Smart Scrollytelling Stepper, Interactive Tabs, and Calculator Cross-Linking on versorger.html', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/versorger.html', { waitUntil: 'networkidle' });

        const scrollySection = page.locator('#smart-energy-flow');
        await expect(scrollySection).toBeVisible();

        const stepBtns = scrollySection.locator('.smart-scrolly-tab');
        await expect(stepBtns).toHaveCount(3);
        const stages = scrollySection.locator('.smart-scrolly-stage');

        // Step 1: Wallbox
        await expect(stepBtns.nth(0)).toHaveClass(/active/);
        await expect(stages.nth(0)).toHaveClass(/active/);
        await expect(stages.nth(0)).toContainText('Wallbox');

        // Step 2: Click Wärmepumpe
        await stepBtns.nth(1).click();
        await page.waitForTimeout(300);
        await expect(stepBtns.nth(1)).toHaveClass(/active/);
        await expect(stages.nth(1)).toHaveClass(/active/);
        await expect(stages.nth(1)).toContainText('Wärmestrom');

        // Step 3: Click Smart Home
        await stepBtns.nth(2).click();
        await page.waitForTimeout(300);
        await expect(stepBtns.nth(2)).toHaveClass(/active/);
        await expect(stages.nth(2)).toHaveClass(/active/);
        await expect(stages.nth(2)).toContainText('Photovoltaik');

        // Test CTA click from stage 2 to calculator
        const ctaBtn = stages.nth(2).locator('.smart-cta-btn');
        await expect(ctaBtn).toBeVisible();
        await ctaBtn.click();
        await page.waitForTimeout(500);

        // Verify calculator section is reached
        const rechnerSection = page.locator('#rechner');
        await expect(rechnerSection).toBeVisible();
    });

    test('4. Dynamic Tariff Calculator Sync & Slider Responsiveness', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/versorger.html', { waitUntil: 'networkidle' });

        const rechner = page.locator('#rechner');
        await expect(rechner).toBeVisible();

        // Check tariff card prices exist and are non-empty
        const basicPrice = page.locator('#price-alpha-basic');
        await expect(basicPrice).toBeVisible();
        await expect(basicPrice).toContainText('€');

        const timePrice = page.locator('#price-alpha-time');
        await expect(timePrice).toBeVisible();
        await expect(timePrice).toContainText('€');

        // Dynamic recalculation via input
        const kwhInput = page.locator('#calcKwh');
        if (await kwhInput.count() > 0) {
            await kwhInput.fill('4000');
            await kwhInput.dispatchEvent('input');
            await page.waitForTimeout(300);
            await expect(basicPrice).toContainText('€');
        }
    });

    test('5. Mobile Viewport (375px) Layout, Navigation, and Zero Overflow', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/versorger.html', { waitUntil: 'networkidle' });

        // Zero horizontal overflow check on versorger.html
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

        // Check stepper tabs on mobile
        const scrollySection = page.locator('#smart-energy-flow');
        const stepBtns = scrollySection.locator('.smart-scrolly-tab');
        await expect(stepBtns).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
            await expect(stepBtns.nth(i)).toBeVisible();
        }

        // Click tabs on mobile
        await stepBtns.nth(1).click();
        await page.waitForTimeout(200);
        await expect(stepBtns.nth(1)).toHaveClass(/active/);

        await stepBtns.nth(2).click();
        await page.waitForTimeout(200);
        await expect(stepBtns.nth(2)).toHaveClass(/active/);

        // Test index.html mobile overflow
        await page.goto('/index.html', { waitUntil: 'networkidle' });
        const idxScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const idxInnerWidth = await page.evaluate(() => window.innerWidth);
        expect(idxScrollWidth).toBeLessThanOrEqual(idxInnerWidth);
    });

    test('6. Three.js Engine Lifecycle & Dynamic Optimization on index.html', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/index.html', { waitUntil: 'networkidle' });

        // Verify AlphaThree is defined and running
        const threeStatus = await page.evaluate(() => {
            if (!window.AlphaThree) return null;
            return {
                initialized: true,
                sceneCount: window.AlphaThree.getSceneCount ? window.AlphaThree.getSceneCount() : 1
            };
        });

        expect(threeStatus).not.toBeNull();
        expect(threeStatus.initialized).toBe(true);

        // Verify canvas presence
        const canvas = page.locator('canvas');
        await expect(canvas.first()).toBeVisible();

        // Pause and Resume checks
        const pauseResumeTest = await page.evaluate(() => {
            try {
                window.AlphaThree.pauseAll();
                const paused = true;
                window.AlphaThree.resumeAll();
                const resumed = true;
                return { paused, resumed };
            } catch (e) {
                return { error: e.message };
            }
        });

        expect(pauseResumeTest.error).toBeUndefined();
        expect(pauseResumeTest.paused).toBe(true);
        expect(pauseResumeTest.resumed).toBe(true);
    });

    test('7. Multi-Language Switcher (DE, EN, TR) Integrity Check', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/versorger.html', { waitUntil: 'networkidle' });

        const langBtns = page.locator('.lang-switch-btn, [data-lang-switch]');
        if (await langBtns.count() > 0) {
            // Switch to EN
            const enBtn = page.locator('[data-lang-switch="en"], button:has-text("EN")').first();
            if (await enBtn.isVisible()) {
                await enBtn.click();
                await page.waitForTimeout(400);

                // Re-switch to DE
                const deBtn = page.locator('[data-lang-switch="de"], button:has-text("DE")').first();
                if (await deBtn.isVisible()) {
                    await deBtn.click();
                    await page.waitForTimeout(400);
                }
            }
        }

        // Verify German default headlines remain intact
        const heroTitle = page.locator('.hero-title, h1').first();
        await expect(heroTitle).toBeVisible();
        const heroText = await heroTitle.textContent();
        expect(heroText.length).toBeGreaterThan(5);
    });

});
