# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: agenturen_challenger.spec.js >> Agenturen Page - Challenger Verification >> should validate form and show correct error messages on empty/invalid submit
- Location: tests\agenturen_challenger.spec.js:104:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('#application-form').locator('div:has(#experience) > .error-msg')
Expected: "Bitte wählen Sie Ihre Vertriebserfahrung aus."
Received: "Bitte wählen Sie Ihre Branche aus."
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for locator('#application-form').locator('div:has(#experience) > .error-msg')
    13 × locator resolved to <div class="error-msg">Bitte wählen Sie Ihre Branche aus.</div>
       - unexpected value "Bitte wählen Sie Ihre Branche aus."

```

```yaml
- text: Bitte wählen Sie Ihre Branche aus.
```

# Test source

```ts
  39  |         // Wait for GSAP and main.js initialization
  40  |         await page.waitForFunction(() => typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined');
  41  |         await page.waitForTimeout(500);
  42  |     });
  43  | 
  44  |     test('should verify calculator at boundary input 100 (minimum)', async ({ page }) => {
  45  |         const slider = page.locator('#contract-slider');
  46  |         const sliderVal = page.locator('#slider-val');
  47  |         const sofortProv = page.locator('#sofort-provision');
  48  |         const gesamtProv = page.locator('#gesamt-provision');
  49  |         const statusBadge = page.locator('#status-tier-badge');
  50  |         const progressBar = page.locator('#status-progress-bar');
  51  |         const nextBonusText = page.locator('#status-tier-next-bonus');
  52  | 
  53  |         // Focus and set slider value to 100
  54  |         await slider.focus();
  55  |         await slider.fill('100');
  56  | 
  57  |         // Verify slider value is 100
  58  |         await expect(sliderVal).toHaveText('100');
  59  | 
  60  |         // Verify mathematically correct calculations
  61  |         // sofort: 100 * 250 = 25.000
  62  |         // gesamt: 100 * 250 = 25.000
  63  |         await expect(sofortProv).toHaveText('25.000');
  64  |         await expect(gesamtProv).toHaveText('25.000');
  65  | 
  66  |         // Verify status progress bar width is 0% (since percentage is (val-100)/900 * 100)
  67  |         await expect(progressBar).toHaveAttribute('style', 'width: 0%;');
  68  | 
  69  |         // Verify status badge and next bonus text
  70  |         await expect(statusBadge).toHaveText('Einsteiger-Status');
  71  |         await expect(nextBonusText).toHaveText('Nächster Bonus ab 300 Verträgen!');
  72  |     });
  73  | 
  74  |     test('should verify calculator at boundary input 1000 (maximum)', async ({ page }) => {
  75  |         const slider = page.locator('#contract-slider');
  76  |         const sliderVal = page.locator('#slider-val');
  77  |         const sofortProv = page.locator('#sofort-provision');
  78  |         const gesamtProv = page.locator('#gesamt-provision');
  79  |         const statusBadge = page.locator('#status-tier-badge');
  80  |         const progressBar = page.locator('#status-progress-bar');
  81  |         const nextBonusText = page.locator('#status-tier-next-bonus');
  82  | 
  83  |         // Focus and set slider value to 1000
  84  |         await slider.focus();
  85  |         await slider.fill('1000');
  86  | 
  87  |         // Verify slider value is 1000
  88  |         await expect(sliderVal).toHaveText('1000');
  89  | 
  90  |         // Verify mathematically correct calculations
  91  |         // sofort: 1000 * 250 = 250.000
  92  |         // gesamt: 1000 * 250 = 250.000
  93  |         await expect(sofortProv).toHaveText('250.000');
  94  |         await expect(gesamtProv).toHaveText('250.000');
  95  | 
  96  |         // Verify status progress bar width is 100%
  97  |         await expect(progressBar).toHaveAttribute('style', 'width: 100%;');
  98  | 
  99  |         // Verify status badge and next bonus text
  100 |         await expect(statusBadge).toHaveText('Elite-Status');
  101 |         await expect(nextBonusText).toHaveText('+20% Premium-Provisionsstufe aktiv!');
  102 |     });
  103 | 
  104 |     test('should validate form and show correct error messages on empty/invalid submit', async ({ page }) => {
  105 |         const form = page.locator('#application-form');
  106 |         const submitBtn = form.locator('button[type="submit"]');
  107 | 
  108 |         // Trigger empty form validation
  109 |         await submitBtn.click();
  110 | 
  111 |         // Check validation errors are visible and contain correct text
  112 |         const nameError = form.locator('#fullName ~ .error-msg');
  113 |         const emailError = form.locator('#email ~ .error-msg');
  114 |         const phoneError = form.locator('#phone ~ .error-msg');
  115 |         const experienceError = form.locator('#experience ~ .error-msg');
  116 | 
  117 |         await expect(nameError).toBeVisible();
  118 |         await expect(nameError).toHaveText('Bitte geben Sie Ihren Vor- und Nachnamen an.');
  119 | 
  120 |         await expect(emailError).toBeVisible();
  121 |         await expect(emailError).toHaveText('Geben Sie eine gültige E-Mail-Adresse ein.');
  122 | 
  123 |         await expect(phoneError).toBeVisible();
  124 |         await expect(phoneError).toHaveText('Ungültiges Format. Beispiel: 0170 1234567');
  125 | 
  126 |         // For the select experience, wait, the error-msg is inside parent div, let's verify if experience ~ .error-msg works or if it's experience's parent.
  127 |         // In agenturen.html:
  128 |         // <div>
  129 |         //     <label for="experience" class="form-label">...</label>
  130 |         //     <div class="select-wrapper">
  131 |         //         <select id="experience" ...>...</select>
  132 |         //         <div class="select-arrow">...</div>
  133 |         //     </div>
  134 |         //     <div class="error-msg">Bitte wählen Sie Ihre Branche aus.</div>
  135 |         // </div>
  136 |         // So the error message is a sibling of .select-wrapper, not #experience directly.
  137 |         const experienceErrorMsg = form.locator('div:has(#experience) > .error-msg');
  138 |         await expect(experienceErrorMsg).toBeVisible();
> 139 |         await expect(experienceErrorMsg).toHaveText('Bitte wählen Sie Ihre Vertriebserfahrung aus.');
      |                                          ^ Error: expect(locator).toHaveText(expected) failed
  140 | 
  141 |         // Test invalid email
  142 |         await page.locator('#fullName').fill('Max Mustermann');
  143 |         await page.locator('#email').fill('not-an-email');
  144 |         await page.locator('#phone').fill('0170 1234567');
  145 |         await page.locator('#experience').selectOption('Versicherungsmakler');
  146 | 
  147 |         await submitBtn.click();
  148 |         await expect(emailError).toBeVisible();
  149 |         await expect(nameError).not.toBeVisible();
  150 |         await expect(phoneError).not.toBeVisible();
  151 |         await expect(experienceErrorMsg).not.toBeVisible();
  152 | 
  153 |         // Test invalid phone
  154 |         await page.locator('#email').fill('max@example.com');
  155 |         await page.locator('#phone').fill('123'); // too short / wrong format
  156 | 
  157 |         await submitBtn.click();
  158 |         await expect(phoneError).toBeVisible();
  159 |         await expect(emailError).not.toBeVisible();
  160 | 
  161 |         // Test valid submission transitions to success message
  162 |         await page.locator('#phone').fill('0170 1234567');
  163 |                 const valName = await page.locator('#fullName').inputValue();
  164 |         const valEmail = await page.locator('#email').inputValue();
  165 |         const valPhone = await page.locator('#phone').inputValue();
  166 |         const valExp = await page.locator('#experience').inputValue();
  167 |         console.log(`BEFORE SUBMIT - Name: "${valName}", Email: "${valEmail}", Phone: "${valPhone}", Exp: "${valExp}"`);
  168 |         
  169 |         const evalResult = await page.evaluate(() => {
  170 |             const validationRules = {
  171 |                 fullName: {
  172 |                     validate: (val) => val.trim().split(/\s+/).length >= 2,
  173 |                     error: "Bitte geben Sie Ihren Vor- und Nachnamen an."
  174 |                 },
  175 |                 email: {
  176 |                     validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
  177 |                     error: "Geben Sie eine gültige E-Mail-Adresse ein."
  178 |                 },
  179 |                 phone: {
  180 |                     validate: (val) => /^(?:\+49|0049|0)[1-9][0-9\s.-]{5,15}$/.test(val.replace(/\s+/g, '')),
  181 |                     error: "Ungültiges Format. Beispiel: 0170 1234567"
  182 |                 },
  183 |                 experience: {
  184 |                     validate: (val) => val !== null && val !== undefined && val !== "",
  185 |                     error: "Bitte wählen Sie Ihre Vertriebserfahrung aus."
  186 |                 }
  187 |             };
  188 |             const fields = ["fullName", "email", "phone", "experience"];
  189 |             let isValid = true;
  190 |             const details = {};
  191 |             fields.forEach(fieldId => {
  192 |                 const input = document.getElementById(fieldId);
  193 |                 const val = input ? input.value : null;
  194 |                 const rule = validationRules[fieldId];
  195 |                 const valid = rule.validate(val);
  196 |                 details[fieldId] = {
  197 |                     val: val,
  198 |                     valid: valid,
  199 |                     ruleError: rule.error
  200 |                 };
  201 |                 if (!valid) isValid = false;
  202 |             });
  203 |             return { isValid, details };
  204 |         });
  205 |         console.log(`EVAL VALIDATION RESULT: ${JSON.stringify(evalResult)}`);
  206 |         
  207 |         await page.evaluate(() => {
  208 |             const form = document.getElementById('application-form');
  209 |             if (form) {
  210 |                 form.addEventListener('submit', () => {
  211 |                     console.log('DIAGNOSTIC: Form submit event fired inside browser!');
  212 |                 });
  213 |             } else {
  214 |                 console.log('DIAGNOSTIC: Form element #application-form NOT found!');
  215 |             }
  216 |         });
  217 |         
  218 |         // Dispatch the submit event programmatically on the form
  219 |         await page.evaluate(() => {
  220 |             const form = document.getElementById('application-form');
  221 |             if (form) {
  222 |                 const event = new Event('submit', { cancelable: true, bubbles: true });
  223 |                 form.dispatchEvent(event);
  224 |             }
  225 |         });
  226 |         
  227 |         const fieldStatuses = await page.evaluate(() => {
  228 |             const fields = ["fullName", "email", "phone", "experience"];
  229 |             const res = {};
  230 |             fields.forEach(id => {
  231 |                 const el = document.getElementById(id);
  232 |                 if (el) {
  233 |                     const err = el.closest("div:not(.select-wrapper)").querySelector(".error-msg");
  234 |                     res[id] = {
  235 |                         val: el.value,
  236 |                         borderColor: el.style.borderColor,
  237 |                         errVisible: err ? window.getComputedStyle(err).display !== 'none' : null,
  238 |                         errText: err ? err.textContent : null
  239 |                     };
```