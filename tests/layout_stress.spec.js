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
    'vertriebspartner-portal.html',
    'oekostrom.html',
    'waermestrom.html',
    'oekogas.html',
    'sektorenkopplung.html',
    'service.html',
    'partner-werden.html'
];

test.describe('Layout & Responsiveness Stress Test', () => {

    for (const pageName of pages) {
        test(`Mobile Viewport (375px) - Check for Horizontal Overflow on /${pageName}`, async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            // Pre-seed cookie consent so banner doesn't shift layout
            await page.addInitScript(() => {
                try {
                    localStorage.setItem('alpha_consent_status', 'all');
                    localStorage.setItem('cookieConsent', 'all');
                    localStorage.removeItem('affiliate_ref');
                    sessionStorage.clear();
                } catch (e) {}
            });
            await page.goto(`/${pageName}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(500);

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
            await page.addInitScript(() => {
                try {
                    localStorage.setItem('alpha_consent_status', 'all');
                    localStorage.setItem('cookieConsent', 'all');
                    localStorage.removeItem('affiliate_ref');
                    sessionStorage.clear();
                } catch (e) {}
            });
            await page.goto(`/${pageName}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(500);

            const stats = await page.evaluate(() => {
                const docWidth = document.documentElement.scrollWidth;
                const viewWidth = window.innerWidth;
                const hasOverflow = docWidth > viewWidth;
                const overflowing = [];
                if (hasOverflow) {
                    for (const el of document.querySelectorAll('*')) {
                        const rect = el.getBoundingClientRect();
                        if (rect.right > viewWidth + 1) {
                            overflowing.push({ tag: el.tagName, class: el.className, right: rect.right, width: rect.width });
                        }
                    }
                }
                return { docWidth, viewWidth, hasOverflow, overflowing };
            });

            if (stats.hasOverflow) {
                console.log(`[Desktop 1440px] Overflowing on /${pageName}:`, stats.overflowing);
            }

            expect(stats.hasOverflow, `Page /${pageName} has desktop horizontal overflow`).toBe(false);
        });
    }
});
