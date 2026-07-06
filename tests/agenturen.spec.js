const { test, expect } = require('@playwright/test');

test.describe('B2B Agency Page (agenturen.html)', () => {
    test.beforeEach(async ({ context, page }) => {
        await context.addInitScript(() => {
            window.localStorage.setItem('alpha_consent_status', 'all');
        });
        // Go to the landing page
        await page.goto('http://localhost:3000/agenturen.html');
    });

    test('should load page with correct metadata and headers', async ({ page }) => {
        await expect(page).toHaveTitle(/Für Agenturen & Makler - Alpha Energie GmbH/);
        
        // Verify solutions dropdown exists and has the agenturen.html option
        const dropdownLinks = page.locator('header .dropdown a');
        await expect(dropdownLinks).toHaveCount(4);
        await expect(dropdownLinks.nth(3)).toHaveAttribute('href', 'agenturen.html');
        await expect(dropdownLinks.nth(3)).toHaveText('Für Agenturen');
    });

    test('should dynamically calculate commission values via slider', async ({ page }) => {
        // Check default values at 20 contracts
        const sliderVal = page.locator('#slider-val');
        const sofortProv = page.locator('#sofort-provision');
        const bestandsProv = page.locator('#bestands-provision');
        const gesamtProv = page.locator('#gesamt-provision');
        const statusBadge = page.locator('#status-tier-badge');
        
        await expect(sliderVal).toHaveText('20');
        await expect(sofortProv).toHaveText('3.000');
        await expect(bestandsProv).toHaveText('240');
        await expect(gesamtProv).toHaveText('490');
        await expect(statusBadge).toHaveText('Einsteiger-Status');
        
        // Move slider to 50 contracts
        const slider = page.locator('#contract-slider');
        await slider.focus();
        
        // Use fill to set the slider value directly to trigger events
        await slider.fill('50');
        
        // Check updated values at 50 contracts (sofort: 50 * 150 = 7500, bestand: 50 * 12 = 600, gesamt: 50 * 24.5 = 1225)
        await expect(sliderVal).toHaveText('50');
        await expect(sofortProv).toHaveText('7.500');
        await expect(bestandsProv).toHaveText('600');
        await expect(gesamtProv).toHaveText('1.225');
        await expect(statusBadge).toHaveText('Profi-Status');
        
        // Move slider to 80 contracts
        await slider.fill('80');
        
        // Check updated values at 80 contracts (sofort: 80 * 150 = 12000, bestand: 80 * 12 = 960, gesamt: 80 * 24.5 = 1960)
        await expect(sliderVal).toHaveText('80');
        await expect(sofortProv).toHaveText('12.000');
        await expect(bestandsProv).toHaveText('960');
        await expect(gesamtProv).toHaveText('1.960');
        await expect(statusBadge).toHaveText('Elite-Status');
    });

    test('should validate form and submit successfully', async ({ page }) => {
        const form = page.locator('#application-form');
        const submitBtn = form.locator('button[type="submit"]');
        
        // Trigger empty form validation
        await submitBtn.click();
        
        // Check validation errors are visible
        const errors = form.locator('.error-msg');
        await expect(errors.nth(0)).toBeVisible();
        await expect(errors.nth(1)).toBeVisible();
        await expect(errors.nth(2)).toBeVisible();
        await expect(errors.nth(3)).toBeVisible();
        
        // Fill form fields
        await page.locator('#fullName').fill('Agentur Alpha e.K.');
        await page.locator('#email').fill('info@agentur-alpha.de');
        await page.locator('#phone').fill('0170 1234567');
        await page.locator('#experience').selectOption('Versicherungsmakler');
        
        // Submit valid form
        await submitBtn.click();
        
        // Success container should be shown
        const successContainer = page.locator('#form-success-container');
        await expect(successContainer).toBeVisible();
        
        // Success phone number matches the inputted phone number
        const successPhone = page.locator('#success-phone');
        await expect(successPhone).toHaveText('0170 1234567');
        
        // Form should be hidden
        await expect(form).not.toBeVisible();
    });
});
