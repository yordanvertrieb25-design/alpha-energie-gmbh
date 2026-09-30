const { test, expect } = require('@playwright/test');

test.describe('Tariff Cards Bonus Removal & Honest Pricing QA', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });
    });

    test('1. No bonus pills exist on any of the 3 tariff cards', async ({ page }) => {
        const bonusPills = page.locator('.tariff-bonus-pill');
        await expect(bonusPills).toHaveCount(0);
    });

    test('2. Initial static prices, savings, and 4 bullet points in German (DE)', async ({ page }) => {
        // ALPHA BASIC
        const cardBasic = page.locator('#card-alpha-basic');
        await expect(cardBasic.locator('#price-alpha-basic')).toContainText('70 €');
        await expect(cardBasic.locator('#savings-alpha-basic')).toContainText('Bis zu 30');
        const basicItems = cardBasic.locator('.tariff-feature-list .tariff-feature-item');
        await expect(basicItems).toHaveCount(4);
        for (let i = 0; i < 4; i++) {
            const text = await basicItems.nth(i).textContent();
            expect(text.toLowerCase()).not.toContain('bonus');
            expect(text.toLowerCase()).not.toContain('prämie');
        }

        // ALPHA TIME
        const cardTime = page.locator('#card-alpha-time');
        await expect(cardTime.locator('#price-alpha-time')).toContainText('63 €');
        await expect(cardTime.locator('#savings-alpha-time')).toContainText('Bis zu 38');
        const timeItems = cardTime.locator('.tariff-feature-list .tariff-feature-item');
        await expect(timeItems).toHaveCount(4);
        for (let i = 0; i < 4; i++) {
            const text = await timeItems.nth(i).textContent();
            expect(text.toLowerCase()).not.toContain('bonus');
            expect(text.toLowerCase()).not.toContain('prämie');
        }

        // ALPHA PREMIUM
        const cardPremium = page.locator('#card-alpha-premium');
        await expect(cardPremium.locator('#price-alpha-premium')).toContainText('72 €');
        await expect(cardPremium.locator('#savings-alpha-premium')).toContainText('Bis zu 280 €');
        const premiumItems = cardPremium.locator('.tariff-feature-list .tariff-feature-item');
        await expect(premiumItems).toHaveCount(4);
        for (let i = 0; i < 4; i++) {
            const text = await premiumItems.nth(i).textContent();
            expect(text.toLowerCase()).not.toContain('bonus');
            expect(text.toLowerCase()).not.toContain('prämie');
        }
    });

    test('3. Dynamic recalculation produces honest monthly amounts without bonus deduction', async ({ page }) => {
        // For 3500 kWh, current monthly 120 €:
        // ALPHA BASIC: 3500 * (27.85 / 100) + 11.90 * 12 = 974.75 + 142.80 = 1117.55 € -> / 12 = 93.13 -> Math.round = 93 € / Monat
        // ALPHA TIME: 3500 * (24.50 / 100) + 12.00 * 12 = 857.50 + 144.00 = 1001.50 € -> / 12 = 83.46 -> Math.round = 83 € / Monat
        // ALPHA PREMIUM: 3500 * (28.20 / 100) + 12.90 * 12 = 987.00 + 154.80 = 1141.80 € -> / 12 = 95.15 -> Math.round = 95 € / Monat
        const kwhInput = page.locator('#calcKwh');
        await kwhInput.fill('3500');
        await kwhInput.dispatchEvent('input');

        const cardBasic = page.locator('#card-alpha-basic');
        const cardTime = page.locator('#card-alpha-time');
        const cardPremium = page.locator('#card-alpha-premium');

        await expect(cardBasic.locator('#price-alpha-basic')).toContainText('93 €');
        await expect(cardTime.locator('#price-alpha-time')).toContainText('83 €');
        await expect(cardPremium.locator('#price-alpha-premium')).toContainText('95 €');
    });

    test('4. Language switching (EN & TR) renders accurate 4 bullets without bonus references', async ({ page }) => {
        // Switch to EN via API
        await page.evaluate(() => window.i18n.setLanguage('en'));

        const cardBasic = page.locator('#card-alpha-basic');
        const cardTime = page.locator('#card-alpha-time');
        const cardPremium = page.locator('#card-alpha-premium');

        await expect(cardBasic.locator('.tariff-feature-list .tariff-feature-item')).toHaveCount(4);
        await expect(cardTime.locator('.tariff-feature-list .tariff-feature-item')).toHaveCount(4);
        await expect(cardPremium.locator('.tariff-feature-list .tariff-feature-item')).toHaveCount(4);

        const enBasicB2 = await cardBasic.locator('.tariff-feature-list .tariff-feature-item:nth-child(2) span').textContent();
        expect(enBasicB2).toBe('Green electricity from 100% renewable energy (hydropower)');

        const enTimeB4 = await cardTime.locator('.tariff-feature-list .tariff-feature-item:nth-child(4) span').textContent();
        expect(enTimeB4).toBe('Transparent app insights & live control');

        // Switch to TR via API
        await page.evaluate(() => window.i18n.setLanguage('tr'));

        await expect(cardBasic.locator('.tariff-feature-list .tariff-feature-item')).toHaveCount(4);
        await expect(cardTime.locator('.tariff-feature-list .tariff-feature-item')).toHaveCount(4);
        await expect(cardPremium.locator('.tariff-feature-list .tariff-feature-item')).toHaveCount(4);

        const trBasicB2 = await cardBasic.locator('.tariff-feature-list .tariff-feature-item:nth-child(2) span').textContent();
        expect(trBasicB2).toBe('%100 yenilenebilir enerjiden yeşil elektrik (hidroelektrik)');

        const trTimeB4 = await cardTime.locator('.tariff-feature-list .tariff-feature-item:nth-child(4) span').textContent();
        expect(trTimeB4).toBe('Şeffaf mobil uygulama takibi & canlı kontrol');
    });
});
