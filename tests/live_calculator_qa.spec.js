import { test, expect } from '@playwright/test';

test.describe('Live-Tarifrechner Rigorous QA Verification Suite', () => {

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            try {
                localStorage.setItem('alpha_consent_status', 'all');
                localStorage.setItem('cookieConsent', 'all');
                sessionStorage.clear();
            } catch (e) {}
        });
        await page.goto('/versorger', { waitUntil: 'load' });
        await page.waitForTimeout(300);
    });

    test('1. DOM & Initial State Verification', async ({ page }) => {
        const calcPlz = page.locator('#calcPlz');
        const calcKwh = page.locator('#calcKwh');
        const calcAbschlag = page.locator('#calcAbschlag');
        const calcCityBadge = page.locator('#calcCityBadge');
        const householdBtns = page.locator('.household-btn-grid .household-btn');

        // Verify elements are visible and ready
        await expect(calcPlz).toBeVisible();
        await expect(calcKwh).toBeVisible();
        await expect(calcAbschlag).toBeVisible();

        // 1.1 #calcPlz: NO value or empty string, placeholder 'z. B. 44379'
        const plzVal = await calcPlz.inputValue();
        expect(plzVal).toBe('');
        await expect(calcPlz).toHaveAttribute('placeholder', 'z. B. 44379');

        // 1.2 #calcKwh: NO value or empty string, placeholder 'z. B. 2.500'
        const kwhVal = await calcKwh.inputValue();
        expect(kwhVal).toBe('');
        await expect(calcKwh).toHaveAttribute('placeholder', 'z. B. 2.500');

        // 1.3 #calcAbschlag: NO value or empty string, placeholder 'z. B. 95'
        const abschlagVal = await calcAbschlag.inputValue();
        expect(abschlagVal).toBe('');
        await expect(calcAbschlag).toHaveAttribute('placeholder', 'z. B. 95');

        // 1.4 #calcCityBadge is hidden (display: none) on initial load
        await expect(calcCityBadge).not.toBeVisible();
        const displayStyle = await calcCityBadge.evaluate(el => window.getComputedStyle(el).display);
        expect(displayStyle).toBe('none');

        // 1.5 No .household-btn has the .active class on initial load
        const count = await householdBtns.count();
        expect(count).toBe(4);
        for (let i = 0; i < count; i++) {
            const hasActive = await householdBtns.nth(i).evaluate(el => el.classList.contains('active'));
            expect(hasActive).toBe(false);
        }

        // 1.6 Initial tariff prices render valid numbers without NaN
        const priceIds = ['#price-alpha-basic', '#price-alpha-time', '#price-alpha-premium'];
        for (const id of priceIds) {
            const text = await page.locator(id).textContent();
            expect(text).not.toContain('NaN');
            expect(text).toMatch(/\d+\s*€/);
        }
    });

    test('2. Tab Switching Behavioral Check (Strom <-> Gas)', async ({ page }) => {
        const calcKwh = page.locator('#calcKwh');
        const calcAbschlag = page.locator('#calcAbschlag');
        const gasTab = page.locator('.calc-tab-btn[data-branch="gas"]');
        const stromTab = page.locator('.calc-tab-btn[data-branch="strom"]');
        const householdBtns = page.locator('.household-btn-grid .household-btn');

        // Switch to Gas while fields are empty
        await gasTab.click();
        await page.waitForTimeout(200);

        // Fields must remain empty
        expect(await calcKwh.inputValue()).toBe('');
        expect(await calcAbschlag.inputValue()).toBe('');

        // Placeholders must update to Gas defaults
        await expect(calcKwh).toHaveAttribute('placeholder', 'z. B. 12.000');
        await expect(calcAbschlag).toHaveAttribute('placeholder', 'z. B. 115');

        // Household buttons must NOT have .active class
        const count = await householdBtns.count();
        for (let i = 0; i < count; i++) {
            const hasActive = await householdBtns.nth(i).evaluate(el => el.classList.contains('active'));
            expect(hasActive).toBe(false);
        }

        // Check gas preset values: 5.000, 12.000, 18.000, 25.000
        expect(await householdBtns.nth(0).getAttribute('data-kwh')).toBe('5000');
        expect(await householdBtns.nth(1).getAttribute('data-kwh')).toBe('12000');
        expect(await householdBtns.nth(2).getAttribute('data-kwh')).toBe('18000');
        expect(await householdBtns.nth(3).getAttribute('data-kwh')).toBe('25000');

        // Switch back to Strom while fields are empty
        await stromTab.click();
        await page.waitForTimeout(200);

        expect(await calcKwh.inputValue()).toBe('');
        expect(await calcAbschlag.inputValue()).toBe('');
        await expect(calcKwh).toHaveAttribute('placeholder', 'z. B. 2.500');
        await expect(calcAbschlag).toHaveAttribute('placeholder', 'z. B. 95');

        for (let i = 0; i < count; i++) {
            const hasActive = await householdBtns.nth(i).evaluate(el => el.classList.contains('active'));
            expect(hasActive).toBe(false);
        }

        // Check strom preset values: 1.500, 2.500, 3.500, 4.500
        expect(await householdBtns.nth(0).getAttribute('data-kwh')).toBe('1500');
        expect(await householdBtns.nth(1).getAttribute('data-kwh')).toBe('2500');
        expect(await householdBtns.nth(2).getAttribute('data-kwh')).toBe('3500');
        expect(await householdBtns.nth(3).getAttribute('data-kwh')).toBe('4500');
    });

    test('3. Household Presets Interaction and Two-way Input Sync', async ({ page }) => {
        const calcKwh = page.locator('#calcKwh');
        const householdBtns = page.locator('.household-btn-grid .household-btn');

        // Click preset 3 (3.500 kWh)
        await householdBtns.nth(2).click();
        expect(await calcKwh.inputValue()).toBe('3500');
        expect(await householdBtns.nth(2).evaluate(el => el.classList.contains('active'))).toBe(true);
        expect(await householdBtns.nth(0).evaluate(el => el.classList.contains('active'))).toBe(false);
        expect(await householdBtns.nth(1).evaluate(el => el.classList.contains('active'))).toBe(false);
        expect(await householdBtns.nth(3).evaluate(el => el.classList.contains('active'))).toBe(false);

        // Switch to Gas: user had 3500, which transitions to gas default 12000
        const gasTab = page.locator('.calc-tab-btn[data-branch="gas"]');
        await gasTab.click();
        expect(await calcKwh.inputValue()).toBe('12000');
        expect(await householdBtns.nth(1).evaluate(el => el.classList.contains('active'))).toBe(true);

        // Click preset 18.000 kWh on gas
        await householdBtns.nth(2).click();
        expect(await calcKwh.inputValue()).toBe('18000');
        expect(await householdBtns.nth(2).evaluate(el => el.classList.contains('active'))).toBe(true);

        // Manually typing 5000 should activate preset 0 (Wohnung 5.000 kWh)
        await calcKwh.fill('5000');
        await page.waitForTimeout(100);
        expect(await householdBtns.nth(0).evaluate(el => el.classList.contains('active'))).toBe(true);
        expect(await householdBtns.nth(1).evaluate(el => el.classList.contains('active'))).toBe(false);

        // Manually typing a custom non-preset number (e.g. 7777) should deactivate all presets
        await calcKwh.fill('7777');
        await page.waitForTimeout(100);
        const count = await householdBtns.count();
        for (let i = 0; i < count; i++) {
            expect(await householdBtns.nth(i).evaluate(el => el.classList.contains('active'))).toBe(false);
        }
    });

    test('4. City Badge Dynamics: Typing & Clearing PLZ Prefix', async ({ page }) => {
        const calcPlz = page.locator('#calcPlz');
        const calcCityBadge = page.locator('#calcCityBadge');

        // Initially hidden
        await expect(calcCityBadge).not.toBeVisible();

        // Type '44' -> reveals Dortmund / NRW
        await calcPlz.fill('44');
        await expect(calcCityBadge).toBeVisible();
        expect(await calcCityBadge.textContent()).toBe('Dortmund');

        // Type '10' -> Berlin
        await calcPlz.fill('10');
        await expect(calcCityBadge).toBeVisible();
        expect(await calcCityBadge.textContent()).toBe('Berlin');

        // Clear input -> hidden
        await calcPlz.fill('');
        await expect(calcCityBadge).not.toBeVisible();

        // Single character '4' -> hidden
        await calcPlz.fill('4');
        await expect(calcCityBadge).not.toBeVisible();

        // Complete 5 digits '44379' -> visible Dortmund
        await calcPlz.fill('44379');
        await expect(calcCityBadge).toBeVisible();
        expect(await calcCityBadge.textContent()).toBe('Dortmund');
    });

    test('5. Pricing Calculations Integrity: Zero NaN, Honest Calculation', async ({ page }) => {
        const calcKwh = page.locator('#calcKwh');
        const calcAbschlag = page.locator('#calcAbschlag');
        const priceIds = ['#price-alpha-basic', '#price-alpha-time', '#price-alpha-premium'];
        const savingsIds = ['#savings-alpha-basic', '#savings-alpha-time', '#savings-alpha-premium'];

        // Check with empty fields (defaults apply internally)
        for (let i = 0; i < 3; i++) {
            const priceText = await page.locator(priceIds[i]).textContent();
            expect(priceText).not.toContain('NaN');
            expect(priceText).toMatch(/\d+\s*€/);

            const savingsText = await page.locator(savingsIds[i]).textContent();
            expect(savingsText).not.toContain('NaN');
        }

        // Fill custom values
        await calcKwh.fill('3200');
        await calcAbschlag.fill('120');
        await page.waitForTimeout(200);

        for (let i = 0; i < 3; i++) {
            const priceText = await page.locator(priceIds[i]).textContent();
            expect(priceText).not.toContain('NaN');
            expect(priceText).toMatch(/\d+\s*€/);

            const savingsText = await page.locator(savingsIds[i]).textContent();
            expect(savingsText).not.toContain('NaN');
        }
    });

    test('6. Order Modal PLZ & City Forwarding', async ({ page }) => {
        const calcPlz = page.locator('#calcPlz');
        const orderBtn = page.locator('.tariff-action-btn').first();
        const orderModal = page.locator('#orderModal');
        const orderPlz = page.locator('#orderPlz');
        const orderCity = page.locator('#orderCity');

        // Test with empty PLZ initially
        await orderBtn.click();
        await expect(orderModal).toBeVisible();
        expect(await orderPlz.inputValue()).toBe('');
        await expect(orderPlz).toHaveAttribute('placeholder', 'z. B. 44379');
        expect(await orderCity.inputValue()).toBe('');
        await expect(orderCity).toHaveAttribute('placeholder', 'z. B. Dortmund');

        // Close modal
        await page.locator('#orderModal .modal-close-btn').click();
        await expect(orderModal).not.toBeVisible();

        // Now enter PLZ '44379'
        await calcPlz.fill('44379');
        await orderBtn.click();
        await expect(orderModal).toBeVisible();
        expect(await orderPlz.inputValue()).toBe('44379');
        expect(await orderCity.inputValue()).toBe('Dortmund');
    });
});
