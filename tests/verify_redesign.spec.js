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

    test('6. Hero Showcase Image & Floating Glass Badges Verification', async ({ page }) => {
        let imageStatus = null;
        let imageContentType = null;
        page.on('response', response => {
            if (response.url().includes('clean_energy_home.jpg')) {
                imageStatus = response.status();
                imageContentType = response.headers()['content-type'];
            }
        });

        await page.goto('/versorger', { waitUntil: 'networkidle' });

        const heroImg = page.locator('.hero-visual-frame img');
        await expect(heroImg).toBeVisible();
        await expect(heroImg).toHaveAttribute('src', '/clean_energy_home.jpg');

        // Check image is completely loaded with positive natural dimensions
        const isLoaded = await heroImg.evaluate((img) => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
        expect(isLoaded).toBe(true);
        expect(imageStatus).toBe(200);
        expect(imageContentType).toContain('image/jpeg');

        // Verify the 3 specific badges
        const badgesContainer = page.locator('.hero-visual-frame');
        await expect(badgesContainer).toContainText('100 % Strom aus erneuerbaren Quellen');
        await expect(badgesContainer).toContainText('Bis zu 380 € / Jahr Ersparnis');
        await expect(badgesContainer).toContainText('Vor-Ort-Kundenservice in Dortmund');
    });

    test('7. Tariff ribbon visibility, overflow, and viewport bounds check (#card-alpha-time)', async ({ page }) => {
        // Pre-seed consent so cookie banner does not interfere
        await page.addInitScript(() => {
            localStorage.setItem('alpha_consent_status', 'all');
            localStorage.setItem('cookieConsent', 'all');
        });

        await page.goto('/versorger', { waitUntil: 'networkidle' });

        const card = page.locator('#card-alpha-time');
        await expect(card).toBeVisible();

        // 1. Verify that computed overflow on the card is 'visible' (not hidden by spotlight-card)
        const computedOverflow = await card.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
                overflow: style.overflow,
                overflowY: style.overflowY,
                overflowX: style.overflowX
            };
        });
        console.log('Card #card-alpha-time computed overflow:', computedOverflow);
        expect(computedOverflow.overflowY).toBe('visible');

        // 2. Locate ribbon and verify visibility and content
        const ribbon = card.locator('.tariff-ribbon');
        await expect(ribbon).toBeVisible();
        await expect(ribbon).toContainText('Bestseller & Smart Energy');

        // 3. Verify vector SVG star inside ribbon
        const starSvg = ribbon.locator('svg');
        await expect(starSvg).toBeVisible();

        // 4. Scroll card into view with 120px top offset to remain clear of sticky header
        await page.evaluate(() => {
            const el = document.getElementById('card-alpha-time');
            if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 120;
                window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
            }
        });
        await page.waitForTimeout(300);

        // 5. Check bounding boxes - ribbon must be rendered and not clipped
        const ribbonBox = await ribbon.boundingBox();
        const cardBox = await card.boundingBox();
        expect(ribbonBox).not.toBeNull();
        expect(cardBox).not.toBeNull();

        console.log('Ribbon box:', ribbonBox, 'Card box:', cardBox);

        // Ribbon protrudes above card top (ribbon y < card y)
        expect(ribbonBox.y).toBeLessThan(cardBox.y);
        // Ribbon height is fully intact (expected ~31px, definitely > 20px)
        expect(ribbonBox.height).toBeGreaterThanOrEqual(20);

        // 6. Check that ribbon is rendered inside the visible viewport
        const viewportSize = page.viewportSize();
        expect(ribbonBox.y).toBeGreaterThanOrEqual(0);
        if (viewportSize) {
            expect(ribbonBox.x).toBeGreaterThanOrEqual(0);
            expect(ribbonBox.x + ribbonBox.width).toBeLessThanOrEqual(viewportSize.width);
            expect(ribbonBox.y + ribbonBox.height).toBeLessThanOrEqual(viewportSize.height);
        }

        // 7. Hit-test verification: The top portion of the ribbon is hit-testable and not occluded/clipped
        const isUpperRibbonHitTestable = await page.evaluate(() => {
            const el = document.querySelector('#card-alpha-time .tariff-ribbon');
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            // Test 4px inside the top edge of the ribbon
            const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + 4);
            return el.contains(hit);
        });
        expect(isUpperRibbonHitTestable).toBe(true);
    });

    test('8. Official ok-power Gütesiegel integration verification', async ({ page }) => {
        // Pre-seed consent so cookie banner does not obscure elements
        await page.addInitScript(() => {
            localStorage.setItem('alpha_consent_status', 'all');
            localStorage.setItem('cookieConsent', 'all');
        });

        // 1. Direct route verification of /ok-power-siegel.png
        const directResp = await page.request.get('/ok-power-siegel.png');
        expect(directResp.status()).toBe(200);
        expect(directResp.headers()['content-type']).toContain('image/png');

        await page.goto('/versorger', { waitUntil: 'domcontentloaded' });

        // 2. Explainer card seal image is visible and loaded
        const explainerSeal = page.locator('.ok-power-explainer-card .ok-power-seal-img');
        await explainerSeal.scrollIntoViewIfNeeded();
        await expect(explainerSeal).toBeVisible();
        await expect(explainerSeal).toHaveAttribute('src', '/ok-power-siegel.png');
        await expect.poll(async () => {
            return await explainerSeal.evaluate((img) => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
        }, { timeout: 10000 }).toBe(true);

        // 3. Footer seal image is visible and loaded
        const footerSeal = page.locator('footer .footer-badge-okpower');
        await footerSeal.scrollIntoViewIfNeeded();
        await expect(footerSeal).toBeVisible();
        await expect(footerSeal).toHaveAttribute('src', '/ok-power-siegel.png');
        await expect.poll(async () => {
            return await footerSeal.evaluate((img) => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
        }, { timeout: 10000 }).toBe(true);

        // 4. Footer BDEB badge is visible alongside
        const footerBdeb = page.locator('footer .footer-badge-bdeb');
        await expect(footerBdeb).toBeVisible();
    });

    test('9. Google Search & Browser Favicon Assets and Head Link Verification', async ({ page }) => {
        // 1. Direct route verification of /favicon.ico
        const icoResp = await page.request.get('/favicon.ico');
        expect(icoResp.status()).toBe(200);
        expect(icoResp.headers()['content-type']).toContain('image/x-icon');

        // 2. Direct route verification of /favicon.svg
        const svgResp = await page.request.get('/favicon.svg');
        expect(svgResp.status()).toBe(200);
        expect(svgResp.headers()['content-type']).toContain('image/svg+xml');

        // 3. Direct route verification of /favicon-48x48.png
        const fav48Resp = await page.request.get('/favicon-48x48.png');
        expect(fav48Resp.status()).toBe(200);
        expect(fav48Resp.headers()['content-type']).toContain('image/png');

        // 4. Direct route verification of /favicon-192x192.png
        const fav192Resp = await page.request.get('/favicon-192x192.png');
        expect(fav192Resp.status()).toBe(200);
        expect(fav192Resp.headers()['content-type']).toContain('image/png');

        // 5. Direct route verification of /apple-touch-icon.png
        const appleResp = await page.request.get('/apple-touch-icon.png');
        expect(appleResp.status()).toBe(200);
        expect(appleResp.headers()['content-type']).toContain('image/png');

        // 6. Direct route verification of /site.webmanifest
        const manifestResp = await page.request.get('/site.webmanifest');
        expect(manifestResp.status()).toBe(200);
        expect(manifestResp.headers()['content-type']).toContain('application/manifest+json');

        // 7. Verify index.html head tags
        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
        const fav48Link = page.locator('head link[rel="icon"][sizes="48x48"]');
        await expect(fav48Link).toHaveCount(1);
        await expect(fav48Link).toHaveAttribute('href', '/favicon-48x48.png');
    });
});



