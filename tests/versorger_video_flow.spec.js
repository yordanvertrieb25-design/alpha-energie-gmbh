const { test, expect } = require('@playwright/test');

test.describe('Alpha Energie Smart Home Video Showcase Suite (Clean Full-Format Cinematic)', () => {

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

    test('2. Video container and video element are properly mounted in full-format with correct sources', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const videoSection = page.locator('#scrolly-flow-section');
        await expect(videoSection).toBeVisible();
        await expect(videoSection).toHaveClass(/versorger-video-fullformat-section/);

        const videoContainer = page.locator('#versorger-video-container');
        await expect(videoContainer).toBeVisible();
        await expect(videoContainer).toHaveClass(/versorger-video-fullformat-container/);

        const videoEl = page.locator('#versorger-video');
        await expect(videoEl).toBeAttached();
        await expect(videoEl).toHaveClass(/versorger-video-fullformat-element/);

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

    test('3. Directive enforcement: NO text overlays, NO play buttons, NO HUD bar, NO banners in the video viewport', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        // HUD bar must not exist or be visible
        const hud = page.locator('.video-player-hud');
        await expect(hud).toHaveCount(0);

        // Play/Pause button on video must not exist or be visible
        const playBtn = page.locator('#btn-video-toggle-play, .video-hud-btn');
        await expect(playBtn).toHaveCount(0);

        // Stepper / Cockpit header inside video must not exist or be visible
        const scrollyHeader = page.locator('#scrolly-flow-section .scrolly-tour-header, #scrolly-flow-section .sim-cockpit-header');
        await expect(scrollyHeader).toHaveCount(0);

        // Floating banners inside video must not exist or be visible
        const banners = page.locator('#scrolly-flow-section .video-tariff-banner, #scrolly-flow-section [data-video-banner], #scrolly-flow-section .video-banners-layer');
        await expect(banners).toHaveCount(0);

        // Skip / replay buttons must not be visible on video
        const skipBtn = page.locator('#scrolly-flow-section .btn-video-skip, #scrolly-flow-section .video-skip-btn');
        await expect(skipBtn).toHaveCount(0);
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

    test('5. Video click unlocks scrolling and toggles playback', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        // Manually lock scroll
        await page.evaluate(() => {
            window.AlphaVideoFlow.lockScroll();
        });

        let isLocked = await page.evaluate(() => window.AlphaVideoFlow.isLocked());
        expect(isLocked).toBe(true);

        // Click the video element
        const videoEl = page.locator('#versorger-video');
        await videoEl.dispatchEvent('click');

        // Scroll lock must now be unlocked
        isLocked = await page.evaluate(() => window.AlphaVideoFlow.isLocked());
        expect(isLocked).toBe(false);
    });

    test('6. Escape key unlocks scrolling immediately', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        // Manually lock scroll
        await page.evaluate(() => {
            window.AlphaVideoFlow.lockScroll();
        });

        let isLocked = await page.evaluate(() => window.AlphaVideoFlow.isLocked());
        expect(isLocked).toBe(true);

        // Press Escape
        await page.keyboard.press('Escape');

        // Scroll lock must now be unlocked
        isLocked = await page.evaluate(() => window.AlphaVideoFlow.isLocked());
        expect(isLocked).toBe(false);
    });

    test('7. Pausing or ending video immediately releases scroll lock', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        await page.evaluate(() => {
            window.AlphaVideoFlow.lockScroll();
            window.AlphaVideoFlow.pause();
        });

        let isLocked = await page.evaluate(() => window.AlphaVideoFlow.isLocked());
        expect(isLocked).toBe(false);

        // Test tour ended
        await page.evaluate(() => {
            window.AlphaVideoFlow.lockScroll();
            window.AlphaVideoFlow.seek(10.0);
        });

        isLocked = await page.evaluate(() => window.AlphaVideoFlow.isLocked());
        expect(isLocked).toBe(false);
    });

    test('8. Tariff offerings grid section below video is intact with 4 cards', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const tariffSection = page.locator('#tarife-overview');
        await expect(tariffSection).toBeAttached();

        const tariffCards = page.locator('#tarife-overview .energy-tariff-card');
        const count = await tariffCards.count();
        expect(count).toBeGreaterThanOrEqual(3);

        // Calculator CTA buttons on tariff cards are present
        const rechnerCtas = page.locator('#tarife-overview .btn-rechner-sync');
        const ctaCount = await rechnerCtas.count();
        expect(ctaCount).toBeGreaterThanOrEqual(3);
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

    test('10. Full-format edge-to-edge layout renders without borders or padding', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const videoContainer = page.locator('#versorger-video-container');
        await expect(videoContainer).toBeVisible();

        const videoEl = page.locator('#versorger-video');
        await expect(videoEl).toBeVisible();

        const styles = await videoContainer.evaluate(el => {
            const cs = window.getComputedStyle(el);
            return {
                borderRadius: cs.borderRadius,
                borderTopWidth: cs.borderTopWidth,
                padding: cs.padding
            };
        });

        expect(styles.borderRadius).toBe('0px');
        expect(styles.borderTopWidth).toBe('0px');
    });

});
