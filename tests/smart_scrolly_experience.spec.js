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
        await expect(tabs.nth(0)).toContainText('Ökostrom');
        await expect(tabs.nth(1)).toContainText('Ökogas');
        await expect(tabs.nth(2)).toContainText('Smart Home');

        // Check initial active state
        await expect(tabs.nth(0)).toHaveClass(/active/);

        // Check 3 stages
        const stages = smartFlow.locator('.smart-scrolly-stage');
        await expect(stages).toHaveCount(3);

        // Stage 0: Ökostrom
        const stage1 = stages.nth(0);
        await expect(stage1).toHaveClass(/active/);
        await expect(stage1.locator('.smart-badge-pill')).toContainText('100 % Ökostrom');
        await expect(stage1.locator('.smart-card-heading')).toContainText('Saubere Energie aus 100 % Wind- & Sonnenkraft');
        await expect(stage1.locator('.smart-usp-grid')).toContainText('100 % zertifizierter Ökostrom');
        await expect(stage1.locator('.smart-usp-grid')).toContainText('Bis zu 24 Monate Preisgarantie');
        await expect(stage1.locator('.smart-usp-grid')).toContainText('Kostenloser & TÜV-geprüfter Wechselservice');
        await expect(stage1.locator('.smart-cta-btn')).toContainText('Ökostrom berechnen & sparen');

        // Stage 1: Ökogas
        const stage2 = stages.nth(1);
        await expect(stage2.locator('.smart-badge-pill')).toContainText('Klimaneutrales Ökogas');
        await expect(stage2.locator('.smart-card-heading')).toContainText('Wohlfühlwärme mit fairen Ökogastarifen');
        await expect(stage2.locator('.smart-usp-grid')).toContainText('100 % CO₂-kompensiertes Ökogas');
        await expect(stage2.locator('.smart-usp-grid')).toContainText('Volle Preissicherheit');
        await expect(stage2.locator('.smart-usp-grid')).toContainText('Automatische Abmeldung beim Vorversorger');
        await expect(stage2.locator('.smart-cta-btn')).toContainText('Gastarif berechnen & sparen');

        // Stage 2: Smart Home
        const stage3 = stages.nth(2);
        await expect(stage3.locator('.smart-badge-pill')).toContainText('Das vernetzte Smart Energy Zuhause');
        await expect(stage3.locator('.smart-card-heading')).toContainText('Alles vernetzt: Photovoltaik, Speicher & Smart Energy');
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

        // Click Ökogas Tab (index 1)
        await tabs.nth(1).click();
        await expect(tabs.nth(1)).toHaveClass(/active/);
        await expect(stages.nth(1)).toHaveClass(/active/);

        // Click Smart Home Tab (index 2)
        await tabs.nth(2).click();
        await expect(tabs.nth(2)).toHaveClass(/active/);
        await expect(stages.nth(2)).toHaveClass(/active/);

        // Click Ökostrom Tab (index 0)
        await tabs.nth(0).click();
        await expect(tabs.nth(0)).toHaveClass(/active/);
        await expect(stages.nth(0)).toHaveClass(/active/);
    });

    test('4. CTA buttons correctly sync with #rechner tabs and scroll to calculator', async ({ page }) => {
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const smartFlow = page.locator('#smart-energy-flow');
        const tabs = smartFlow.locator('.smart-scrolly-tab');
        const stages = smartFlow.locator('.smart-scrolly-stage');

        // Stage 1 CTA (Ökogas) -> should switch #rechner to Erdgas tab (data-branch="gas")
        await tabs.nth(1).click();
        await page.waitForTimeout(300);
        const stage2Cta = stages.nth(1).locator('.smart-cta-btn');
        await stage2Cta.click();

        await page.waitForTimeout(600);
        const gasTab = page.locator('.calc-tab-btn[data-branch="gas"]');
        await expect(gasTab).toHaveClass(/active/);

        // Now go to Stage 0 CTA (Ökostrom) -> should switch #rechner to Ökostrom tab (data-branch="strom")
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

        // Stage 0 (Ökostrom)
        await smartFlow.locator('.smart-scrolly-tab[data-stage="0"]').click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: 'scratch/screenshot_desktop_stage0.png' });

        // Stage 1 (Ökogas)
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
