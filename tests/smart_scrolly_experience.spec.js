const { test, expect } = require('@playwright/test');

test.describe('Alpha Energie GmbH - Smart Scrollytelling Experience Suite', () => {

    test.beforeEach(async ({ page }) => {
        // Pre-seed consent so cookie banner does not interfere with test actions
        await page.addInitScript(() => {
            localStorage.setItem('alpha_consent_status', 'all');
            localStorage.setItem('cookieConsent', 'all');
            localStorage.setItem('cookie_analytics', 'true');
            localStorage.setItem('cookie_marketing', 'true');
        });
    });

    test('1. Old video section, old tariff section, and old video controller script are cleanly removed', async ({ page }) => {
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

        // Ensure old video section is gone
        const oldVideoSection = page.locator('#scrolly-flow-section');
        await expect(oldVideoSection).toHaveCount(0);

        // Ensure old tarife-overview section is gone
        const oldTarifeOverview = page.locator('#tarife-overview');
        await expect(oldTarifeOverview).toHaveCount(0);

        // Ensure old video-flow-controller script is gone
        const oldScript = page.locator('script[src*="video-flow-controller.js"]');
        await expect(oldScript).toHaveCount(0);
    });

    test('2. New #smart-energy-flow section is rendered with all 3 stages, images, and content', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const smartFlow = page.locator('#smart-energy-flow');
        await expect(smartFlow).toBeVisible();

        // Check stepper tabs
        const tabs = smartFlow.locator('.smart-scrolly-tab');
        await expect(tabs).toHaveCount(3);
        await expect(tabs.nth(0)).toContainText('Wallbox');
        await expect(tabs.nth(1)).toContainText('Wärmepumpe');
        await expect(tabs.nth(2)).toContainText('Smart Home');

        // Check initial active state
        await expect(tabs.nth(0)).toHaveClass(/active/);

        // Check 3 stages
        const stages = smartFlow.locator('.smart-scrolly-stage');
        await expect(stages).toHaveCount(3);

        // Stage 1: Wallbox
        const stage1 = stages.nth(0);
        await expect(stage1).toHaveClass(/active/);
        await expect(stage1.locator('.smart-badge-pill')).toContainText('Wallbox- & Autostrom');
        await expect(stage1.locator('.smart-card-heading')).toContainText('Intelligent laden mit 100 % Ökostrom');
        await expect(stage1.locator('.smart-usp-grid')).toContainText('100 % zertifizierter Ökostrom');
        await expect(stage1.locator('.smart-usp-grid')).toContainText('24 Monate Preisgarantie');
        await expect(stage1.locator('.smart-usp-grid')).toContainText('KfW & § 14a konform');
        await expect(stage1.locator('.smart-cta-btn')).toContainText('Autostrom berechnen & sparen');

        // Stage 2: Wärmepumpe
        const stage2 = stages.nth(1);
        await expect(stage2.locator('.smart-badge-pill')).toContainText('Wärmepumpenstrom § 14a EnWG');
        await expect(stage2.locator('.smart-card-heading')).toContainText('Heizkosten senken mit speziellem Wärmestrom');
        await expect(stage2.locator('.smart-usp-grid')).toContainText('Bis zu 25 % Netzentgelt-Rabatt');
        await expect(stage2.locator('.smart-usp-grid')).toContainText('100 % Öko-Heizstrom');
        await expect(stage2.locator('.smart-usp-grid')).toContainText('TÜV-geprüfter Wechselservice');
        await expect(stage2.locator('.smart-cta-btn')).toContainText('Wärmetarif berechnen & sparen');

        // Stage 3: Smart Home
        const stage3 = stages.nth(2);
        await expect(stage3.locator('.smart-badge-pill')).toContainText('Das vernetzte Smart Energy Zuhause');
        await expect(stage3.locator('.smart-card-heading')).toContainText('Alles vernetzt: Photovoltaik, Speicher, Wärmepumpe & Wallbox');
        await expect(stage3.locator('.smart-usp-grid')).toContainText('Volle Sektorenkopplung');
        await expect(stage3.locator('.smart-usp-grid')).toContainText('Solar- & PV-Reststrom');
        await expect(stage3.locator('.smart-usp-grid')).toContainText('Dortmunder Expertenberatung');
        await expect(stage3.locator('.smart-cta-btn')).toContainText('Tarif für Ihr Zuhause berechnen');

        // Verify images exist in DOM and have non-empty sources
        const images = smartFlow.locator('.smart-stage-media');
        await expect(images).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
            const src = await images.nth(i).getAttribute('src');
            expect(src).toBeTruthy();
        }
    });

    test('3. Interactive stepper tabs smoothly switch between stages', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const smartFlow = page.locator('#smart-energy-flow');
        const tabs = smartFlow.locator('.smart-scrolly-tab');
        const stages = smartFlow.locator('.smart-scrolly-stage');

        // Click Wärmepumpe Tab (index 1)
        await tabs.nth(1).click();
        await expect(tabs.nth(1)).toHaveClass(/active/);
        await expect(stages.nth(1)).toHaveClass(/active/);

        // Click Smart Home Tab (index 2)
        await tabs.nth(2).click();
        await expect(tabs.nth(2)).toHaveClass(/active/);
        await expect(stages.nth(2)).toHaveClass(/active/);

        // Click Wallbox Tab (index 0)
        await tabs.nth(0).click();
        await expect(tabs.nth(0)).toHaveClass(/active/);
        await expect(stages.nth(0)).toHaveClass(/active/);
    });

    test('4. CTA buttons correctly sync with #rechner tabs and scroll to calculator', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const smartFlow = page.locator('#smart-energy-flow');
        const tabs = smartFlow.locator('.smart-scrolly-tab');
        const stages = smartFlow.locator('.smart-scrolly-stage');

        // Stage 2 CTA (Wärmepumpe) -> should switch #rechner to Wärmestrom tab (data-branch="waerme")
        await tabs.nth(1).click();
        await page.waitForTimeout(300);
        const stage2Cta = stages.nth(1).locator('.smart-cta-btn');
        await stage2Cta.click();

        await page.waitForTimeout(600);
        const waermeTab = page.locator('.calc-tab-btn[data-branch="waerme"]');
        await expect(waermeTab).toHaveClass(/active/);

        // Now go to Stage 1 CTA (Wallbox) -> should switch #rechner to Ökostrom tab (data-branch="strom")
        await tabs.nth(0).click();
        await page.waitForTimeout(300);
        const stage1Cta = stages.nth(0).locator('.smart-cta-btn');
        await stage1Cta.click();

        await page.waitForTimeout(600);
        const stromTab = page.locator('.calc-tab-btn[data-branch="strom"]');
        await expect(stromTab).toHaveClass(/active/);
    });

    test('5. Responsive mobile viewport (<768px): zero horizontal overflow, tabs and stages function cleanly', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const smartFlow = page.locator('#smart-energy-flow');
        await expect(smartFlow).toBeVisible();

        // Check for horizontal overflow
        const overflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(overflow).toBe(false);

        // Test tabs in mobile viewport
        const tabs = smartFlow.locator('.smart-scrolly-tab');
        const stages = smartFlow.locator('.smart-scrolly-stage');

        await tabs.nth(1).click();
        await expect(tabs.nth(1)).toHaveClass(/active/);
        await expect(stages.nth(1)).toBeVisible();

        await tabs.nth(2).click();
        await expect(tabs.nth(2)).toHaveClass(/active/);
        await expect(stages.nth(2)).toBeVisible();
    });

    test('6. Capture visual screenshots of all 3 stages for verification', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const smartFlow = page.locator('#smart-energy-flow');
        await smartFlow.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);

        // Stage 0 (Wallbox)
        await smartFlow.locator('.smart-scrolly-tab[data-stage="0"]').click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: 'scratch/screenshot_desktop_stage0.png' });

        // Stage 1 (Wärmepumpe)
        await smartFlow.locator('.smart-scrolly-tab[data-stage="1"]').click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: 'scratch/screenshot_desktop_stage1.png' });

        // Stage 2 (Smart Home)
        await smartFlow.locator('.smart-scrolly-tab[data-stage="2"]').click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: 'scratch/screenshot_desktop_stage2.png' });

        // Mobile
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/versorger.html', { waitUntil: 'load' });
        await smartFlow.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        await page.screenshot({ path: 'scratch/screenshot_mobile_stage0.png' });
    });

});
