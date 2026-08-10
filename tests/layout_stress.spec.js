const { test, expect } = require('@playwright/test');

const pages = [
    'index.html',
    'vertriebspartner.html',
    'agenturen.html',
    'gewerbekunden.html',
    'nachhaltigkeit-co2.html',
    'photovoltaik.html',
    'karriere.html',
    'kontakt.html',
    'impressum.html',
    'onboarding.html',
    'vertriebspartner-portal.html'
];

test.describe('Layout & Responsiveness Stress Test', () => {

    for (const pageName of pages) {
        test(`Mobile Viewport (375px) - Check for Horizontal Overflow on /${pageName}`, async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto(`/${pageName}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
            
            // Accept cookie banner if present
            try {
                await page.evaluate(() => {
                    localStorage.setItem('alpha_consent_status', 'all');
                    localStorage.setItem('cookieConsent', 'all');
                });
                await page.reload({ waitUntil: 'domcontentloaded' });
            } catch (e) {}

            await page.waitForTimeout(1000);

            const overflow = await page.evaluate(() => {
                const docWidth = document.documentElement.scrollWidth;
                const viewWidth = window.innerWidth;
                const hasOverflow = docWidth > viewWidth;

                const overflowingElements = [];
                if (hasOverflow) {
                    const all = document.querySelectorAll('*');
                    for (const el of all) {
                        const rect = el.getBoundingClientRect();
                        if (rect.right > viewWidth + 1) {
                            overflowingElements.push({
                                tagName: el.tagName,
                                id: el.id,
                                className: el.className,
                                right: rect.right,
                                width: rect.width,
                                textSnippet: el.innerText ? el.innerText.substring(0, 30) : ''
                            });
                        }
                    }
                }
                return { docWidth, viewWidth, hasOverflow, overflowingElements };
            });

            console.log(`[Mobile 375px] Page /${pageName}: docWidth=${overflow.docWidth}, viewWidth=${overflow.viewWidth}, hasOverflow=${overflow.hasOverflow}`);
            if (overflow.hasOverflow) {
                console.log(`[Mobile 375px] Overflowing elements in /${pageName}:`, JSON.stringify(overflow.overflowingElements, null, 2));
            }

            expect(overflow.hasOverflow, `Page /${pageName} has horizontal overflow: scrollWidth=${overflow.docWidth} > viewportWidth=${overflow.viewWidth}`).toBe(false);
        });

        test(`Desktop Viewport (1440px) - Check for basic layout integrity on /${pageName}`, async ({ page }) => {
            await page.setViewportSize({ width: 1440, height: 900 });
            await page.goto(`/${pageName}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(500);

            const stats = await page.evaluate(() => {
                const docWidth = document.documentElement.scrollWidth;
                const viewWidth = window.innerWidth;
                return { docWidth, viewWidth, hasOverflow: docWidth > viewWidth };
            });

            expect(stats.hasOverflow, `Page /${pageName} has desktop horizontal overflow`).toBe(false);
        });
    }
});
