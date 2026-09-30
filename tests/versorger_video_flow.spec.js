const { test, expect } = require('@playwright/test');

test.describe('Alpha Energie Smart Home Video Scrollytelling Suite', () => {

    test('1. versorger.html loads with 0 console errors and initializes AlphaVideoFlow', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                // Filter out non-actionable browser sandbox errors (favicon or missing third-party tracker)
                if (!text.includes('favicon') && !text.includes('gtag') && !text.includes('analytics')) {
                    consoleErrors.push(text);
                }
            }
        });

        await page.goto('/versorger.html', { waitUntil: 'load' });
        expect(consoleErrors).toEqual([]);

        // Verify AlphaVideoFlow is mounted on window
        const isControllerMounted = await page.evaluate(() => {
            return typeof window.AlphaVideoFlow === 'object' && window.AlphaVideoFlow !== null;
        });
        expect(isControllerMounted).toBe(true);
    });

    test('2. Video container and video element are properly mounted with correct sources', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const videoContainer = page.locator('#versorger-video-container');
        await expect(videoContainer).toBeVisible();

        const videoEl = page.locator('#versorger-video');
        await expect(videoEl).toBeAttached();

        // Check attributes: muted, playsinline, preload
        await expect(videoEl).toHaveAttribute('muted', '');
        await expect(videoEl).toHaveAttribute('playsinline', '');

        // Check sources inside video
        const sources = page.locator('#versorger-video source');
        const count = await sources.count();
        expect(count).toBeGreaterThanOrEqual(1);

        const srcUrls = await sources.evaluateAll(els => els.map(s => s.getAttribute('src')));
        const hasSmartHomeFlow = srcUrls.some(s => s && s.includes('smart-home-flow.mp4'));
        expect(hasSmartHomeFlow).toBe(true);
    });

    test('3. Exact German commercial offering phrasing is intact on all 3 banners', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        // Wallbox
        const wallboxBanner = page.locator('#video-banner-wallbox');
        await expect(wallboxBanner).toBeAttached();
        const wallboxTitle = wallboxBanner.locator('.video-banner-title');
        await expect(wallboxTitle).toHaveText('Wir bieten spezielle Stromtarife für Wallboxen an');

        // Wärmepumpe
        const waermeBanner = page.locator('#video-banner-waerme');
        await expect(waermeBanner).toBeAttached();
        const waermeTitle = waermeBanner.locator('.video-banner-title');
        await expect(waermeTitle).toHaveText('Wir bieten günstige Stromtarife für Wärmepumpen an');

        // Hausstrom
        const hausBanner = page.locator('#video-banner-haus');
        await expect(hausBanner).toBeAttached();
        const hausTitle = hausBanner.locator('.video-banner-title');
        await expect(hausTitle).toHaveText('Wir bieten 100 % Ökostromtarife für Ihren Hausstrom an');
    });

    test('4. Stage definitions enforce accurate playback rates (slow-mo 0.35x / 0.45x)', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const stages = await page.evaluate(() => {
            if (window.AlphaVideoFlow && window.AlphaVideoFlow.STAGES) {
                return window.AlphaVideoFlow.STAGES;
            }
            return null;
        });

        expect(stages).toBeTruthy();

        // Check Wallbox stage (2.5s - 4.6s @ 0.35x)
        const wallboxStage = stages.find(s => s.id === 'wallbox');
        expect(wallboxStage).toBeDefined();
        expect(wallboxStage.start).toBeCloseTo(2.5, 1);
        expect(wallboxStage.end).toBeCloseTo(4.6, 1);
        expect(wallboxStage.speed).toBeCloseTo(0.35, 2);

        // Check Wärmepumpe stage (5.2s - 6.8s @ 0.35x)
        const waermeStage = stages.find(s => s.id === 'waerme');
        expect(waermeStage).toBeDefined();
        expect(waermeStage.start).toBeCloseTo(5.2, 1);
        expect(waermeStage.end).toBeCloseTo(6.8, 1);
        expect(waermeStage.speed).toBeCloseTo(0.35, 2);

        // Check Hausstrom stage (7.5s - 10.0s @ 0.45x)
        const hausStage = stages.find(s => s.id === 'haus');
        expect(hausStage).toBeDefined();
        expect(hausStage.start).toBeCloseTo(7.5, 1);
        expect(hausStage.end).toBeCloseTo(10.0, 1);
        expect(hausStage.speed).toBeCloseTo(0.45, 2);
    });

    test('5. Single-banner isolation & stepper time seeking functionality', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const wallboxBanner = page.locator('#video-banner-wallbox');
        const waermeBanner = page.locator('#video-banner-waerme');
        const hausBanner = page.locator('#video-banner-haus');

        // 1. Activate Wallbox stage (seek to 3.0s)
        await page.evaluate(() => {
            window.AlphaVideoFlow.seek(3.0);
        });

        await expect(wallboxBanner).toHaveClass(/active/);
        await expect(wallboxBanner).toHaveAttribute('aria-hidden', 'false');
        await expect(waermeBanner).not.toHaveClass(/active/);
        await expect(hausBanner).not.toHaveClass(/active/);

        // 2. Activate Wärmepumpe stage (seek to 5.5s)
        await page.evaluate(() => {
            window.AlphaVideoFlow.seek(5.5);
        });

        await expect(waermeBanner).toHaveClass(/active/);
        await expect(waermeBanner).toHaveAttribute('aria-hidden', 'false');
        await expect(wallboxBanner).not.toHaveClass(/active/);
        await expect(hausBanner).not.toHaveClass(/active/);

        // 3. Activate Hausstrom stage (seek to 8.0s)
        await page.evaluate(() => {
            window.AlphaVideoFlow.seek(8.0);
        });

        await expect(hausBanner).toHaveClass(/active/);
        await expect(hausBanner).toHaveAttribute('aria-hidden', 'false');
        await expect(wallboxBanner).not.toHaveClass(/active/);
        await expect(waermeBanner).not.toHaveClass(/active/);
    });

    test('6. Stepper pills click navigates to corresponding stage and updates active states', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const stepWaermePill = page.locator('.scrolly-step-pill[data-video-step="waerme"]');
        await expect(stepWaermePill).toBeVisible();
        await stepWaermePill.dispatchEvent('click');

        await expect(stepWaermePill).toHaveClass(/active/);
        const waermeBanner = page.locator('#video-banner-waerme');
        await expect(waermeBanner).toHaveClass(/active/);

        const stepHausPill = page.locator('.scrolly-step-pill[data-video-step="haus"]');
        await expect(stepHausPill).toBeVisible();
        await stepHausPill.dispatchEvent('click');

        await expect(stepHausPill).toHaveClass(/active/);
        const hausBanner = page.locator('#video-banner-haus');
        await expect(hausBanner).toHaveClass(/active/);
    });

    test('7. Two-way sync: Banner CTA clicks activate calculator branch', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        // Seek to waerme stage
        await page.evaluate(() => {
            window.AlphaVideoFlow.seek(5.5);
        });

        const waermeCta = page.locator('#video-banner-waerme .btn-video-banner-cta');
        await expect(waermeCta).toBeVisible();
        await waermeCta.dispatchEvent('click');

        // Calculator tab 'waerme' should be activated
        const activeCalcTab = page.locator('.calc-tab-btn.active');
        await expect(activeCalcTab).toHaveAttribute('data-branch', 'waerme');
    });

    test('8. Skip & Replay controls operate smoothly', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const skipBtn = page.locator('#btn-video-skip');
        await expect(skipBtn).toBeVisible();
        await skipBtn.dispatchEvent('click');

        // After skip, scroll lock is false
        const isLocked = await page.evaluate(() => {
            return window.AlphaVideoFlow.isLocked();
        });
        expect(isLocked).toBe(false);

        const replayBtn = page.locator('#btn-video-replay');
        if (await replayBtn.isVisible()) {
            await replayBtn.dispatchEvent('click');
            const currentTime = await page.evaluate(() => {
                const v = document.getElementById('versorger-video');
                return v ? v.currentTime : -1;
            });
            expect(currentTime).toBeLessThan(1.0);
        }
    });

    test('9. Mobile responsiveness (375px viewport) and zero horizontal overflow', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const videoContainer = page.locator('#versorger-video-container');
        await expect(videoContainer).toBeVisible();

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth,
                hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
            };
        });

        expect(overflow.hasOverflow).toBe(false);
    });

    test('10. Desktop layout (1280px viewport) renders HUD, Stepper and Banners flawlessly', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const videoContainer = page.locator('#versorger-video-container');
        await expect(videoContainer).toBeVisible();

        const stepperTrack = page.locator('.scrolly-stepper-track');
        await expect(stepperTrack).toBeVisible();

        const hud = page.locator('.video-player-hud');
        await expect(hud).toBeVisible();

        const playBtn = page.locator('#btn-video-toggle-play');
        await expect(playBtn).toBeVisible();
    });

});
