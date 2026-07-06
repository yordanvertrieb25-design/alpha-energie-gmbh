const { test, expect } = require('@playwright/test');

test.describe('B2B Agency Page (agenturen.html)', () => {
    let logs = [];
    test.beforeEach(async ({ context, page }) => {
        logs = [];
        page.on('console', msg => {
            logs.push(`BROWSER LOG: ${msg.text()}`);
            console.log(`BROWSER LOG: ${msg.text()}`);
        });
        page.on('pageerror', err => {
            logs.push(`BROWSER ERROR: ${err.message}`);
            console.log(`BROWSER ERROR: ${err.message}`);
        });
        page.on('dialog', async dialog => {
            logs.push(`DIALOG DETECTED: ${dialog.message()}`);
            console.log(`DIALOG DETECTED: ${dialog.message()}`);
            await dialog.dismiss();
        });
        page.on('response', response => {
            logs.push(`HTTP RESPONSE: ${response.status()} ${response.url()}`);
            console.log(`HTTP RESPONSE: ${response.status()} ${response.url()}`);
        });
        page.on('request', request => {
            logs.push(`HTTP REQUEST: ${request.method()} ${request.url()}`);
            console.log(`HTTP REQUEST: ${request.method()} ${request.url()}`);
        });
        
        // Go to the landing page first to establish origin, set localStorage, then reload.
        await page.goto('http://localhost:3000/agenturen.html');
        await page.evaluate(() => {
            localStorage.setItem('alpha_consent_status', 'all');
            localStorage.setItem('cookieConsent', 'all');
            localStorage.setItem('cookie_analytics', 'true');
            localStorage.setItem('cookie_marketing', 'true');
        });
        await page.reload();

        // Wait for GSAP and main.js initialization
        await page.waitForFunction(() => typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined');
        await page.waitForTimeout(500);
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
        // Check default values at 500 contracts
        const sliderVal = page.locator('#slider-val');
        const sofortProv = page.locator('#sofort-provision');
        const bestandsProv = page.locator('#bestands-provision');
        const gesamtProv = page.locator('#gesamt-provision');
        const statusBadge = page.locator('#status-tier-badge');
        
        await expect(sliderVal).toHaveText('500');
        await expect(sofortProv).toHaveText('75.000');
        await expect(bestandsProv).toHaveText('6.000');
        await expect(gesamtProv).toHaveText('12.250');
        await expect(statusBadge).toHaveText('Profi-Status');
        
        // Move slider to 800 contracts
        const slider = page.locator('#contract-slider');
        await slider.focus();
        
        // Use fill to set the slider value directly to trigger events
        await slider.fill('800');
        
        // Check updated values at 800 contracts
        await expect(sliderVal).toHaveText('800');
        await expect(sofortProv).toHaveText('120.000');
        await expect(bestandsProv).toHaveText('9.600');
        await expect(gesamtProv).toHaveText('19.600');
        await expect(statusBadge).toHaveText('Elite-Status');
        
        // Move slider to 200 contracts
        await slider.fill('200');
        
        // Check updated values at 200 contracts
        await expect(sliderVal).toHaveText('200');
        await expect(sofortProv).toHaveText('30.000');
        await expect(bestandsProv).toHaveText('2.400');
        await expect(gesamtProv).toHaveText('4.900');
        await expect(statusBadge).toHaveText('Einsteiger-Status');
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
        const valName = await page.locator('#fullName').inputValue();
        const valEmail = await page.locator('#email').inputValue();
        const valPhone = await page.locator('#phone').inputValue();
        const valExp = await page.locator('#experience').inputValue();
        logs.push(`BEFORE SUBMIT - Name: "${valName}", Email: "${valEmail}", Phone: "${valPhone}", Exp: "${valExp}"`);
        
        const evalResult = await page.evaluate(() => {
            const validationRules = {
                fullName: {
                    validate: (val) => val.trim().split(/\s+/).length >= 2,
                    error: "Bitte geben Sie Ihren Vor- und Nachnamen an."
                },
                email: {
                    validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
                    error: "Geben Sie eine gültige E-Mail-Adresse ein."
                },
                phone: {
                    validate: (val) => /^(?:\+49|0049|0)[1-9][0-9\s.-]{5,15}$/.test(val.replace(/\s+/g, '')),
                    error: "Ungültiges Format. Beispiel: 0170 1234567"
                },
                experience: {
                    validate: (val) => val !== null && val !== undefined && val !== "",
                    error: "Bitte wählen Sie Ihre Vertriebserfahrung aus."
                }
            };
            const fields = ["fullName", "email", "phone", "experience"];
            let isValid = true;
            const details = {};
            fields.forEach(fieldId => {
                const input = document.getElementById(fieldId);
                const val = input ? input.value : null;
                const rule = validationRules[fieldId];
                const valid = rule.validate(val);
                details[fieldId] = {
                    val: val,
                    valid: valid,
                    ruleError: rule.error
                };
                if (!valid) isValid = false;
            });
            return { isValid, details };
        });
        await page.evaluate(() => {
            const form = document.getElementById('application-form');
            if (form) {
                const event = new Event('submit', { cancelable: true, bubbles: true });
                form.dispatchEvent(event);
            }
        });
        
        // Success container should be shown
        const successContainer = page.locator('#form-success-container');
        try {
            await expect(successContainer).toBeVisible();
            
            // Success phone number matches the inputted phone number
            const successPhone = page.locator('#success-phone');
            await expect(successPhone).toHaveText('0170 1234567');
            
            // Form should be hidden
            await expect(form).not.toBeVisible();
        } catch (err) {
            throw new Error(`${err.message}\nCaptured Logs:\n${logs.join('\n')}`);
        }
    });
});
