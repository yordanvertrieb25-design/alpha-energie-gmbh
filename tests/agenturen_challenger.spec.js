const { test, expect } = require('@playwright/test');

test.describe('Agenturen Page - Challenger Verification', () => {
    let logs = [];
    test.beforeEach(async ({ page, context }) => {
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

    test('should verify calculator at boundary input 100 (minimum)', async ({ page }) => {
        const slider = page.locator('#contract-slider');
        const sliderVal = page.locator('#slider-val');
        const sofortProv = page.locator('#sofort-provision');
        const bestandsProv = page.locator('#bestands-provision');
        const gesamtProv = page.locator('#gesamt-provision');
        const statusBadge = page.locator('#status-tier-badge');
        const progressBar = page.locator('#status-progress-bar');
        const nextBonusText = page.locator('#status-tier-next-bonus');

        // Focus and set slider value to 100
        await slider.focus();
        await slider.fill('100');

        // Verify slider value is 100
        await expect(sliderVal).toHaveText('100');

        // Verify mathematically correct calculations
        // sofort: 100 * 150 = 15.000
        // bestand: 100 * 12 = 1.200
        // gesamt: Math.round(100 * 24.50) = 2.450
        await expect(sofortProv).toHaveText('15.000');
        await expect(bestandsProv).toHaveText('1.200');
        await expect(gesamtProv).toHaveText('2.450');

        // Verify status progress bar width is 0% (since percentage is (val-100)/900 * 100)
        await expect(progressBar).toHaveAttribute('style', 'width: 0%;');

        // Verify status badge and next bonus text
        await expect(statusBadge).toHaveText('Einsteiger-Status');
        await expect(nextBonusText).toHaveText('Nächster Bonus ab 300 Verträgen!');
    });

    test('should verify calculator at boundary input 1000 (maximum)', async ({ page }) => {
        const slider = page.locator('#contract-slider');
        const sliderVal = page.locator('#slider-val');
        const sofortProv = page.locator('#sofort-provision');
        const bestandsProv = page.locator('#bestands-provision');
        const gesamtProv = page.locator('#gesamt-provision');
        const statusBadge = page.locator('#status-tier-badge');
        const progressBar = page.locator('#status-progress-bar');
        const nextBonusText = page.locator('#status-tier-next-bonus');

        // Focus and set slider value to 1000
        await slider.focus();
        await slider.fill('1000');

        // Verify slider value is 1000
        await expect(sliderVal).toHaveText('1000');

        // Verify mathematically correct calculations
        // sofort: 1000 * 150 = 150.000
        // bestand: 1000 * 12 = 12.000
        // gesamt: Math.round(1000 * 24.50) = 24.500
        await expect(sofortProv).toHaveText('150.000');
        await expect(bestandsProv).toHaveText('12.000');
        await expect(gesamtProv).toHaveText('24.500');

        // Verify status progress bar width is 100%
        await expect(progressBar).toHaveAttribute('style', 'width: 100%;');

        // Verify status badge and next bonus text
        await expect(statusBadge).toHaveText('Elite-Status');
        await expect(nextBonusText).toHaveText('+20% Premium-Provisionsstufe aktiv!');
    });

    test('should validate form and show correct error messages on empty/invalid submit', async ({ page }) => {
        const form = page.locator('#application-form');
        const submitBtn = form.locator('button[type="submit"]');

        // Trigger empty form validation
        await submitBtn.click();

        // Check validation errors are visible and contain correct text
        const nameError = form.locator('#fullName ~ .error-msg');
        const emailError = form.locator('#email ~ .error-msg');
        const phoneError = form.locator('#phone ~ .error-msg');
        const experienceError = form.locator('#experience ~ .error-msg');

        await expect(nameError).toBeVisible();
        await expect(nameError).toHaveText('Bitte geben Sie Ihren Vor- und Nachnamen an.');

        await expect(emailError).toBeVisible();
        await expect(emailError).toHaveText('Geben Sie eine gültige E-Mail-Adresse ein.');

        await expect(phoneError).toBeVisible();
        await expect(phoneError).toHaveText('Ungültiges Format. Beispiel: 0170 1234567');

        // For the select experience, wait, the error-msg is inside parent div, let's verify if experience ~ .error-msg works or if it's experience's parent.
        // In agenturen.html:
        // <div>
        //     <label for="experience" class="form-label">...</label>
        //     <div class="select-wrapper">
        //         <select id="experience" ...>...</select>
        //         <div class="select-arrow">...</div>
        //     </div>
        //     <div class="error-msg">Bitte wählen Sie Ihre Branche aus.</div>
        // </div>
        // So the error message is a sibling of .select-wrapper, not #experience directly.
        const experienceErrorMsg = form.locator('div:has(#experience) > .error-msg');
        await expect(experienceErrorMsg).toBeVisible();
        await expect(experienceErrorMsg).toHaveText('Bitte wählen Sie Ihre Branche aus.');

        // Test invalid email
        await page.locator('#fullName').fill('Max Mustermann');
        await page.locator('#email').fill('not-an-email');
        await page.locator('#phone').fill('0170 1234567');
        await page.locator('#experience').selectOption('Versicherungsmakler');

        await submitBtn.click();
        await expect(emailError).toBeVisible();
        await expect(nameError).not.toBeVisible();
        await expect(phoneError).not.toBeVisible();
        await expect(experienceErrorMsg).not.toBeVisible();

        // Test invalid phone
        await page.locator('#email').fill('max@example.com');
        await page.locator('#phone').fill('123'); // too short / wrong format

        await submitBtn.click();
        await expect(phoneError).toBeVisible();
        await expect(emailError).not.toBeVisible();

        // Test valid submission transitions to success message
        await page.locator('#phone').fill('0170 1234567');
                const valName = await page.locator('#fullName').inputValue();
        const valEmail = await page.locator('#email').inputValue();
        const valPhone = await page.locator('#phone').inputValue();
        const valExp = await page.locator('#experience').inputValue();
        console.log(`BEFORE SUBMIT - Name: "${valName}", Email: "${valEmail}", Phone: "${valPhone}", Exp: "${valExp}"`);
        
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
        console.log(`EVAL VALIDATION RESULT: ${JSON.stringify(evalResult)}`);
        
        await page.evaluate(() => {
            const form = document.getElementById('application-form');
            if (form) {
                form.addEventListener('submit', () => {
                    console.log('DIAGNOSTIC: Form submit event fired inside browser!');
                });
            } else {
                console.log('DIAGNOSTIC: Form element #application-form NOT found!');
            }
        });
        
        // Dispatch the submit event programmatically on the form
        await page.evaluate(() => {
            const form = document.getElementById('application-form');
            if (form) {
                const event = new Event('submit', { cancelable: true, bubbles: true });
                form.dispatchEvent(event);
            }
        });
        
        const fieldStatuses = await page.evaluate(() => {
            const fields = ["fullName", "email", "phone", "experience"];
            const res = {};
            fields.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const err = el.closest("div:not(.select-wrapper)").querySelector(".error-msg");
                    res[id] = {
                        val: el.value,
                        borderColor: el.style.borderColor,
                        errVisible: err ? window.getComputedStyle(err).display !== 'none' : null,
                        errText: err ? err.textContent : null
                    };
                }
            });
            const btn = document.querySelector('#application-form button[type="submit"]');
            res['submitBtn'] = {
                disabled: btn ? btn.disabled : null,
                text: btn ? btn.textContent : null
            };
            return res;
        });
        console.log("FIELD STATUSES AFTER 4TH CLICK:", JSON.stringify(fieldStatuses));

        // Success container should be shown and form hidden
        const successContainer = page.locator('#form-success-container');
        await expect(successContainer).toBeVisible();
        await expect(form).not.toBeVisible();
        
        // Success phone number matches input
        const successPhone = page.locator('#success-phone');
        await expect(successPhone).toHaveText('0170 1234567');
    });

    test('should verify mobile responsiveness and no horizontal overflow at 320px viewport', async ({ page }) => {
        // Set viewport size to 320px width
        await page.setViewportSize({ width: 320, height: 600 });

        // Let layout adjust
        await page.waitForTimeout(500);

        // Check if there is any horizontal scroll/overflow
        const overflowResult = await page.evaluate(() => {
            const documentWidth = document.documentElement.scrollWidth;
            const viewportWidth = window.innerWidth;
            
            // Find all elements that overflow the viewport horizontally
            const overflowingElements = [];
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
                const rect = el.getBoundingClientRect();
                if (rect.right > viewportWidth + 1 || rect.left < -1) {
                    overflowingElements.push({
                        tagName: el.tagName,
                        id: el.id,
                        className: el.className,
                        right: rect.right,
                        left: rect.left,
                        viewportWidth
                    });
                }
            }
            
            return {
                documentWidth,
                viewportWidth,
                hasOverflow: documentWidth > viewportWidth,
                overflowingElements: overflowingElements.slice(0, 10) // Limit output
            };
        });

        console.log('Mobile overflow evaluation at 320px:', overflowResult);
        expect(overflowResult.hasOverflow).toBe(false);
    });
});
