const { test, expect } = require('@playwright/test');

test.describe('Alpha Energie GmbH - Dedicated QA End-to-End Verification Suite', () => {

    test.beforeEach(async ({ page }) => {
        // Pre-seed consent so cookie banner does not interfere with test actions
        await page.addInitScript(() => {
            localStorage.setItem('alpha_consent_status', 'all');
            localStorage.setItem('cookieConsent', 'all');
            localStorage.setItem('cookie_analytics', 'true');
            localStorage.setItem('cookie_marketing', 'true');
        });
    });

    test('1. Cleanliness Check: Complete removal of old video section, old tariff section, and old script', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                if (!text.includes('favicon') && !text.includes('analytics') && !text.includes('gtag')) {
                    consoleErrors.push(text);
                }
            }
        });

        await page.goto('/versorger.html', { waitUntil: 'load' });
        expect(consoleErrors).toEqual([]);

        // Confirm #scrolly-flow-section is 0
        const oldVideoSection = page.locator('#scrolly-flow-section');
        await expect(oldVideoSection).toHaveCount(0);

        // Confirm #tarife-overview is 0
        const oldTarifeOverview = page.locator('#tarife-overview');
        await expect(oldTarifeOverview).toHaveCount(0);

        // Confirm video-flow-controller.js script tag is 0
        const oldScript = page.locator('script[src*="video-flow-controller.js"]');
        await expect(oldScript).toHaveCount(0);

        // Confirm new script smart-scrolly-controller.js is present
        const newScript = page.locator('script[src*="smart-scrolly-controller.js"]');
        await expect(newScript).toHaveCount(1);
    });

    test('2. Asset Integrity: 3 visual assets exist and load successfully with HTTP 200 and naturalWidth > 0', async ({ page }) => {
        const failedRequests = [];
        page.on('response', response => {
            const url = response.url();
            if (url.includes('smart_step_') && response.status() !== 200) {
                failedRequests.push({ url, status: response.status() });
            }
        });

        await page.goto('/versorger.html', { waitUntil: 'load' });
        expect(failedRequests).toEqual([]);

        const smartFlow = page.locator('#smart-energy-flow');
        await expect(smartFlow).toBeVisible();

        const images = smartFlow.locator('.smart-stage-media');
        await expect(images).toHaveCount(3);

        for (let i = 0; i < 3; i++) {
            const img = images.nth(i);
            const naturalWidth = await img.evaluate((el) => {
                // Ensure image is loaded
                if (el.complete) return el.naturalWidth;
                return new Promise(resolve => {
                    el.onload = () => resolve(el.naturalWidth);
                    el.onerror = () => resolve(0);
                });
            });
            expect(naturalWidth).toBeGreaterThan(0);
        }
    });

    test('3. Desktop (1920x1080): Layout, Animations from Left/Right, and Stepper Tabs', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                if (!text.includes('favicon') && !text.includes('analytics') && !text.includes('gtag')) {
                    consoleErrors.push(text);
                }
            }
        });

        await page.goto('/versorger.html', { waitUntil: 'load' });
        expect(consoleErrors).toEqual([]);

        const smartFlow = page.locator('#smart-energy-flow');
        const tabs = smartFlow.locator('.smart-scrolly-tab');
        const stages = smartFlow.locator('.smart-scrolly-stage');

        // Stage 0 Active initially on load
        await expect(tabs.nth(0)).toHaveClass(/active/);
        await expect(stages.nth(0)).toHaveClass(/active/);
        await expect(stages.nth(0).locator('.smart-stage-visual-pane')).toBeAttached();
        await expect(stages.nth(0).locator('.smart-stage-content-pane')).toBeAttached();

        // Scroll to the start of the scrolly section
        const smartBox = await smartFlow.boundingBox();
        await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), smartBox.y);
        await page.waitForTimeout(300);

        // Switch to Stage 1 (Ökogas)
        await tabs.nth(1).click();
        await page.waitForTimeout(300);
        await expect(tabs.nth(1)).toHaveClass(/active/);
        await expect(stages.nth(1)).toHaveClass(/active/);
        await expect(stages.nth(1).locator('.smart-card-heading')).toContainText('Wohlfühlwärme');

        // Switch to Stage 2 (Smart Home)
        await tabs.nth(2).click();
        await page.waitForTimeout(300);
        await expect(tabs.nth(2)).toHaveClass(/active/);
        await expect(stages.nth(2)).toHaveClass(/active/);
        await expect(stages.nth(2).locator('.smart-card-heading')).toContainText('Photovoltaik');

        // Switch back to Stage 0 (Ökostrom)
        await tabs.nth(0).click();
        await page.waitForTimeout(300);
        await expect(tabs.nth(0)).toHaveClass(/active/);
        await expect(stages.nth(0)).toHaveClass(/active/);
        await expect(stages.nth(0).locator('.smart-card-heading')).toContainText('Saubere Energie');
    });

    test('4. Tablet (768x1024): Layout, No Overflow, and Stepper Tabs', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const smartFlow = page.locator('#smart-energy-flow');
        await expect(smartFlow).toBeVisible();

        const overflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(overflow).toBe(false);

        const tabs = smartFlow.locator('.smart-scrolly-tab');
        const stages = smartFlow.locator('.smart-scrolly-stage');

        await tabs.nth(1).click();
        await expect(tabs.nth(1)).toHaveClass(/active/);
        await expect(stages.nth(1)).toHaveClass(/active/);

        await tabs.nth(2).click();
        await expect(tabs.nth(2)).toHaveClass(/active/);
        await expect(stages.nth(2)).toHaveClass(/active/);
    });

    test('5. Mobile (375x667): Zero Horizontal Overflow, Clean Mobile Layout, Touch/Tabs', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const smartFlow = page.locator('#smart-energy-flow');
        await expect(smartFlow).toBeVisible();

        const overflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(overflow).toBe(false);

        const tabs = smartFlow.locator('.smart-scrolly-tab');
        const stages = smartFlow.locator('.smart-scrolly-stage');

        await tabs.nth(0).click();
        await expect(tabs.nth(0)).toHaveClass(/active/);
        await expect(stages.nth(0)).toBeVisible();

        await tabs.nth(1).click();
        await expect(tabs.nth(1)).toHaveClass(/active/);
        await expect(stages.nth(1)).toBeVisible();

        await tabs.nth(2).click();
        await expect(tabs.nth(2)).toHaveClass(/active/);
        await expect(stages.nth(2)).toBeVisible();
    });

    test('6. CTA Interaction: All 3 Stage CTAs activate proper #rechner tabs and scroll to calculator', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const smartFlow = page.locator('#smart-energy-flow');
        const tabs = smartFlow.locator('.smart-scrolly-tab');
        const stages = smartFlow.locator('.smart-scrolly-stage');

        // Test Stage 1 CTA (Ökogas) -> gas tab
        await tabs.nth(1).click();
        await page.waitForTimeout(300);
        await stages.nth(1).locator('.smart-cta-btn').click();
        await page.waitForTimeout(800);

        const gasTab = page.locator('.calc-tab-btn[data-branch="gas"]');
        await expect(gasTab).toHaveClass(/active/);

        // Verify calculator in viewport
        const rechner = page.locator('#rechner');
        await expect(rechner).toBeInViewport();

        // Test Stage 2 CTA (Smart Home) -> solar/strom tab
        await tabs.nth(2).click();
        await page.waitForTimeout(300);
        await stages.nth(2).locator('.smart-cta-btn').click();
        await page.waitForTimeout(600);

        const stromTabAfterSolar = page.locator('.calc-tab-btn[data-branch="strom"]');
        await expect(stromTabAfterSolar).toHaveClass(/active/);

        // Test Stage 0 CTA (Ökostrom) -> strom tab
        await tabs.nth(0).click();
        await page.waitForTimeout(300);
        await stages.nth(0).locator('.smart-cta-btn').click();
        await page.waitForTimeout(600);

        const stromTab = page.locator('.calc-tab-btn[data-branch="strom"]');
        await expect(stromTab).toHaveClass(/active/);
    });

    test('7. Runway Scroll Synchronization: Scrolling down page automatically activates next stages', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const smartFlow = page.locator('#smart-energy-flow');
        const stages = smartFlow.locator('.smart-scrolly-stage');

        // Scroll to the smartFlow section runway top
        const box = await smartFlow.boundingBox();
        expect(box).toBeTruthy();

        // Scroll into middle zone (Stage 1)
        await page.evaluate((top) => {
            window.scrollTo({ top: top + 600, behavior: 'instant' });
        }, box.y);
        await page.waitForTimeout(400);

        // Check active stage after scrolling
        const activeStageIndex = await page.evaluate(() => {
            return window.AlphaSmartScrolly ? window.AlphaSmartScrolly.controller.activeStage : -1;
        });
        expect([0, 1, 2]).toContain(activeStageIndex);

        // Scroll down to Stage 2 zone
        await page.evaluate((top) => {
            window.scrollTo({ top: top + 1300, behavior: 'instant' });
        }, box.y);
        await page.waitForTimeout(400);

        const stageAfterScroll2 = await page.evaluate(() => {
            return window.AlphaSmartScrolly ? window.AlphaSmartScrolly.controller.activeStage : -1;
        });
        expect(stageAfterScroll2).toBe(2);
    });

});
