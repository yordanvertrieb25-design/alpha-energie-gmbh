const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Tariff Card Layout Detailed Verification', () => {

    test.beforeEach(async ({ page }) => {
        // Pre-seed consent so cookie banner does not interfere
        await page.addInitScript(() => {
            localStorage.setItem('alpha_consent_status', 'all');
            localStorage.setItem('cookieConsent', 'all');
            localStorage.setItem('cookie_analytics', 'true');
            localStorage.setItem('cookie_marketing', 'true');
        });
    });

    test('Verify tariff cards vertical stacking and full-width price box', async ({ page }) => {
        // Set viewport to standard desktop
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto('/versorger', { waitUntil: 'load' });

        // Scroll to tariff section
        const tarifeSection = page.locator('#tarife');
        await expect(tarifeSection).toBeVisible();
        await tarifeSection.scrollIntoViewIfNeeded();

        // 3 cards expected
        const cards = page.locator('#tarife .versorger-tariff-card');
        const cardCount = await cards.count();
        expect(cardCount).toBe(3);

        const cardNames = ['ALPHA BASIC', 'ALPHA TIME', 'ALPHA PREMIUM'];

        for (let i = 0; i < cardCount; i++) {
            const card = cards.nth(i);
            const cardTitle = await card.locator('.tariff-title').textContent();
            console.log(`\n--- Inspecting Card ${i + 1}: ${cardTitle?.trim()} ---`);

            const cardBox = await card.boundingBox();
            expect(cardBox).not.toBeNull();

            const header = card.locator('.tariff-card-header');
            const priceBox = card.locator('.tariff-card-price-box');
            const kwhSubtext = card.locator('.tariff-kwh-subtext');
            const featureList = card.locator('.tariff-feature-list');

            await expect(header).toBeVisible();
            await expect(priceBox).toBeVisible();
            await expect(kwhSubtext).toBeVisible();
            await expect(featureList).toBeVisible();

            const headerBox = await header.boundingBox();
            const priceBoxBox = await priceBox.boundingBox();
            const kwhBox = await kwhSubtext.boundingBox();
            const featureListBox = await featureList.boundingBox();

            console.log(`Card bounds: x=${cardBox.x}, y=${cardBox.y}, w=${cardBox.width}, h=${cardBox.height}`);
            console.log(`Header: top=${headerBox.y}, h=${headerBox.height}`);
            console.log(`PriceBox: top=${priceBoxBox.y}, w=${priceBoxBox.width}, h=${priceBoxBox.height}`);
            console.log(`KwhSubtext: top=${kwhBox.y}, h=${kwhBox.height}`);
            console.log(`FeatureList: top=${featureListBox.y}, h=${featureListBox.height}`);

            // 1. Vertical Stacking Check (offsets strictly increasing top to bottom)
            expect(headerBox.y).toBeLessThan(priceBoxBox.y);
            expect(priceBoxBox.y).toBeLessThan(kwhBox.y);
            expect(kwhBox.y).toBeLessThan(featureListBox.y);

            // Verify header ends before price box begins (or doesn't overlap)
            expect(headerBox.y + headerBox.height).toBeLessThanOrEqual(priceBoxBox.y + 2); // 2px tolerance for subpixel
            expect(priceBoxBox.y + priceBoxBox.height).toBeLessThanOrEqual(kwhBox.y + 2);

            // 2. Full Width Check: Price box width should be > 80% of card width
            const widthRatio = priceBoxBox.width / cardBox.width;
            console.log(`Price box width ratio: ${(widthRatio * 100).toFixed(1)}%`);
            expect(widthRatio).toBeGreaterThan(0.80);

            // 3. Overflow check: ensure card does not have horizontal scroll clipping
            const hasHorizontalOverflow = await card.evaluate((el) => {
                return el.scrollWidth > el.clientWidth + 1; // 1px rounding tolerance
            });
            expect(hasHorizontalOverflow).toBe(false);
        }

        // Take screenshots for QA visual audit
        const screenshotDir = 'C:\\Users\\Levo\\.gemini\\antigravity\\brain\\53c3be8a-476a-4e8b-870e-5d00589d4c57';
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        const screenshotPath = path.join(screenshotDir, 'tariff-cards-desktop.png');
        await tarifeSection.screenshot({ path: screenshotPath });
        console.log(`Saved tariff cards desktop screenshot to: ${screenshotPath}`);

        // Also verify on Mobile Viewport (iPhone 13 size: 390x844)
        await page.setViewportSize({ width: 390, height: 844 });
        await tarifeSection.scrollIntoViewIfNeeded();

        for (let i = 0; i < cardCount; i++) {
            const card = cards.nth(i);
            const cardBox = await card.boundingBox();
            const headerBox = await card.locator('.tariff-card-header').boundingBox();
            const priceBoxBox = await card.locator('.tariff-card-price-box').boundingBox();
            const kwhBox = await card.locator('.tariff-kwh-subtext').boundingBox();
            const featureListBox = await card.locator('.tariff-feature-list').boundingBox();

            expect(headerBox.y).toBeLessThan(priceBoxBox.y);
            expect(priceBoxBox.y).toBeLessThan(kwhBox.y);
            expect(kwhBox.y).toBeLessThan(featureListBox.y);

            const mobileRatio = priceBoxBox.width / cardBox.width;
            expect(mobileRatio).toBeGreaterThan(0.80);
        }

        const mobileScreenshotPath = path.join(screenshotDir, 'tariff-cards-mobile.png');
        await tarifeSection.screenshot({ path: mobileScreenshotPath });
        console.log(`Saved tariff cards mobile screenshot to: ${mobileScreenshotPath}`);
    });
});
