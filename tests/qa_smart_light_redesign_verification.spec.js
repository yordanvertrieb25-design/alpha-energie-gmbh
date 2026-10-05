const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Alpha Energie GmbH - QA Light Redesign Detailed Verification Suite', () => {

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('alpha_consent_status', 'all');
            localStorage.setItem('cookieConsent', 'all');
            localStorage.setItem('cookie_analytics', 'true');
            localStorage.setItem('cookie_marketing', 'true');
        });
    });

    test('1. Console Errors & Dark Styling Verification', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                if (!text.includes('favicon') && !text.includes('analytics') && !text.includes('gtag')) {
                    consoleErrors.push(text);
                }
            }
        });
        page.on('pageerror', err => {
            consoleErrors.push(err.message);
        });

        await page.goto('/versorger.html', { waitUntil: 'load' });
        expect(consoleErrors).toEqual([]);

        // Verify #smart-energy-flow background style and computed color
        const styleInfo = await page.evaluate(() => {
            const sec = document.querySelector('#smart-energy-flow');
            if (!sec) return null;
            const computed = window.getComputedStyle(sec);
            return {
                backgroundColor: computed.backgroundColor,
                color: computed.color,
                display: computed.display,
                hasOldClasses: sec.classList.contains('dark') || sec.classList.contains('bg-dark') || sec.classList.contains('dark-theme')
            };
        });

        expect(styleInfo).not.toBeNull();
        expect(styleInfo.hasOldClasses).toBe(false);
        // Computed background color should be rgb(248, 250, 252) which is #f8fafc
        expect(styleInfo.backgroundColor).toBe('rgb(248, 250, 252)');
        // Text color should be dark rgb(15, 23, 42) which is #0f172a
        expect(styleInfo.color).toBe('rgb(15, 23, 42)');
    });

    test('2. Capture High-Res Desktop Screenshots (1920x1080 and 1280x800) for all 3 Stages', async ({ page }) => {
        // --- 1920x1080 ---
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const smartFlow = page.locator('#smart-energy-flow');
        await smartFlow.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);

        // Stage 0 (Ökostrom)
        await page.locator('#smart-tab-0').click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: 'scratch/screenshot_desktop_1920_stage0_oekostrom.png' });

        // Stage 1 (Ökogas)
        await page.locator('#smart-tab-1').click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: 'scratch/screenshot_desktop_1920_stage1_oekogas.png' });

        // Stage 2 (Smart Home)
        await page.locator('#smart-tab-2').click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: 'scratch/screenshot_desktop_1920_stage2_smarthome.png' });

        // --- 1280x800 ---
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/versorger.html', { waitUntil: 'load' });
        await smartFlow.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);

        // Stage 0
        await page.locator('#smart-tab-0').click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: 'scratch/screenshot_desktop_1280_stage0_oekostrom.png' });

        // Stage 1
        await page.locator('#smart-tab-1').click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: 'scratch/screenshot_desktop_1280_stage1_oekogas.png' });

        // Stage 2
        await page.locator('#smart-tab-2').click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: 'scratch/screenshot_desktop_1280_stage2_smarthome.png' });
    });

    test('3. Capture Mobile Screenshots (375x812) for all 3 Stages & Check Mobile Layout', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        const smartFlow = page.locator('#smart-energy-flow');
        await smartFlow.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);

        // Stage 0
        await page.locator('#smart-tab-0').click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: 'scratch/screenshot_mobile_375_stage0_oekostrom.png' });

        // Stage 1
        await page.locator('#smart-tab-1').click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: 'scratch/screenshot_mobile_375_stage1_oekogas.png' });

        // Stage 2
        await page.locator('#smart-tab-2').click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: 'scratch/screenshot_mobile_375_stage2_smarthome.png' });

        // Also capture element screenshot of active stage 0 to view full card + CTA in mobile
        await page.locator('#smart-tab-0').click();
        await page.waitForTimeout(400);
        const stage0Locator = page.locator('#smart-stage-0');
        await stage0Locator.screenshot({ path: 'scratch/screenshot_mobile_375_stage0_card_full.png' });
    });

    test('4. Contrast & Readability Verification across all elements', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/versorger.html', { waitUntil: 'load' });

        // Evaluate contrast colors
        const contrastData = await page.evaluate(() => {
            const results = {};
            const section = document.querySelector('#smart-energy-flow');
            
            // Header title
            const title = section.querySelector('.smart-scrolly-title');
            results.titleColor = window.getComputedStyle(title).color;

            // Tabs
            const tab0 = section.querySelector('#smart-tab-0');
            const tab1 = section.querySelector('#smart-tab-1');
            const tab2 = section.querySelector('#smart-tab-2');
            results.tab0Color = window.getComputedStyle(tab0).color;
            results.tab0Bg = window.getComputedStyle(tab0).backgroundColor;

            // Stage 0 Glass Card
            const stage0 = section.querySelector('#smart-stage-0');
            const heading = stage0.querySelector('.smart-card-heading');
            const desc = stage0.querySelector('.smart-card-desc');
            const usp = stage0.querySelector('.smart-usp-text');
            const cta = stage0.querySelector('.smart-cta-btn');
            const badge = stage0.querySelector('.smart-badge-pill');
            const chip = stage0.querySelector('.smart-visual-chip');

            results.headingColor = window.getComputedStyle(heading).color;
            results.descColor = window.getComputedStyle(desc).color;
            results.uspColor = window.getComputedStyle(usp).color;
            results.ctaColor = window.getComputedStyle(cta).color;
            results.badgeColor = window.getComputedStyle(badge).color;
            results.badgeBg = window.getComputedStyle(badge).backgroundColor;
            results.chipColor = window.getComputedStyle(chip).color;
            results.chipBg = window.getComputedStyle(chip).backgroundColor;

            return results;
        });

        // Heading must be dark slate (rgb(15, 23, 42))
        expect(contrastData.headingColor).toBe('rgb(15, 23, 42)');
        // Title must be dark slate (rgb(15, 23, 42))
        expect(contrastData.titleColor).toBe('rgb(15, 23, 42)');
        // Description must be slate (rgb(71, 85, 105))
        expect(contrastData.descColor).toBe('rgb(71, 85, 105)');
        // USP text must be dark slate (rgb(30, 41, 59))
        expect(contrastData.uspColor).toBe('rgb(30, 41, 59)');
        // CTA text must be pure white (rgb(255, 255, 255))
        expect(contrastData.ctaColor).toBe('rgb(255, 255, 255)');
        // Chip text must be dark slate (rgb(15, 23, 42))
        expect(contrastData.chipColor).toBe('rgb(15, 23, 42)');
    });

    test('5. Multi-viewport Zero Horizontal Overflow Check', async ({ page }) => {
        const viewports = [
            { width: 1920, height: 1080 },
            { width: 1440, height: 900 },
            { width: 1280, height: 800 },
            { width: 1024, height: 768 },
            { width: 768, height: 1024 },
            { width: 414, height: 896 },
            { width: 375, height: 812 },
            { width: 360, height: 740 },
            { width: 320, height: 568 }
        ];

        for (const vp of viewports) {
            await page.setViewportSize(vp);
            await page.goto('/versorger.html', { waitUntil: 'load' });
            
            const hasHorizontalOverflow = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });
            expect(hasHorizontalOverflow).toBe(false);
        }
    });

});
