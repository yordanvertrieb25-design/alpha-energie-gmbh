const { test, expect } = require('@playwright/test');

test.describe('Redesign Verification Suite', () => {

    test('1. Typography check - Sora & Manrope are loaded and applied', async ({ page }) => {
        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
        
        // Check body font-family
        const bodyFontFamily = await page.evaluate(() => {
            return window.getComputedStyle(document.body).fontFamily;
        });
        console.log('Body font family:', bodyFontFamily);
        expect(bodyFontFamily.toLowerCase()).toContain('manrope');

        // Check heading font-family
        const headingFontFamily = await page.evaluate(() => {
            const h1 = document.querySelector('h1') || document.querySelector('h2');
            return h1 ? window.getComputedStyle(h1).fontFamily : '';
        });
        console.log('Heading font family:', headingFontFamily);
        expect(headingFontFamily.toLowerCase()).toContain('sora');
    });

    test('2. Layout structure check - section container padding and max-width', async ({ page }) => {
        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
        
        const containerMaxWidth = await page.evaluate(() => {
            // Find a container inside a section, not the header container
            const container = document.querySelector('section .container');
            return container ? window.getComputedStyle(container).maxWidth : '';
        });
        console.log('Container max-width:', containerMaxWidth);
        // The container max-width in style.css is 1152px
        expect(containerMaxWidth).toBe('1152px');
    });

    test('3. Hero Component Preservation', async ({ page }) => {
        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
        const heroExists = await page.locator('#hero').count();
        expect(heroExists).toBe(1);
        
        const hasHeroClass = await page.evaluate(() => {
            const hero = document.getElementById('hero');
            return hero ? hero.classList.contains('hero-section') : false;
        });
        expect(hasHeroClass).toBe(true);
    });

    test('4. Timeline Component Preservation & Scroll Action', async ({ page }) => {
        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
        const yearDisplay = page.locator('#timeline-current-year');
        await expect(yearDisplay).toBeVisible();
        await expect(yearDisplay).toHaveText('2021');

        // Scroll to timeline to trigger GSAP interaction
        await page.evaluate(() => {
            const el = document.getElementById('about');
            if (el) el.scrollIntoView();
        });
        await page.waitForTimeout(1000);
        
        // The sticky current year should exist
        const yearVal = await yearDisplay.textContent();
        console.log('Timeline year text after scroll:', yearVal);
        expect(['2021', '2022', '2023', '2024', '2025', '2026']).toContain(yearVal);
    });

    test('5. Slider Component Preservation & Dynamic Calculation', async ({ page }) => {
        await page.goto('/vertriebspartner.html', { waitUntil: 'domcontentloaded' });
        
        // Ensure slider and values exist
        const slider = page.locator('#contract-slider');
        await expect(slider).toBeVisible();
        
        const valSpan = page.locator('#slider-val');
        await expect(valSpan).toBeVisible();
        
        const sofortSpan = page.locator('#sofort-provision');
        const gesamtSpan = page.locator('#gesamt-provision');
        
        // Read initial values
        const initialVal = await valSpan.innerText();
        console.log('Initial slider value:', initialVal);
        
        // Change slider value
        await slider.fill('50');
        await page.waitForTimeout(500); // Allow animation to settle
        
        const updatedVal = await valSpan.innerText();
        const updatedSofort = await sofortSpan.innerText();
        const updatedGesamt = await gesamtSpan.innerText();
        
        console.log(`Updated Slider: val=${updatedVal}, sofort=${updatedSofort}, gesamt=${updatedGesamt}`);
        expect(updatedVal).toBe('50');
        expect(updatedSofort.replace(/\./g, '')).toContain('12.500'.replace(/\./g, ''));
        expect(updatedGesamt.replace(/\./g, '')).toContain('12.500'.replace(/\./g, ''));
    });
});
