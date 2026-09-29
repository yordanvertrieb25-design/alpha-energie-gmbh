const { test, expect } = require('@playwright/test');

test('Check for overflow at all widths from 320px to 1600px', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/versorger', { waitUntil: 'domcontentloaded' });
    const offending = [];
    for (let w = 320; w <= 1600; w += 25) {
        await page.setViewportSize({ width: w, height: 900 });
        
        const res = await page.evaluate((viewW) => {
            const docW = document.documentElement.scrollWidth;
            if (docW > viewW) {
                const bad = [];
                for (const el of document.querySelectorAll('*')) {
                    const r = el.getBoundingClientRect();
                    if (r.right > viewW + 1) {
                        bad.push({
                            tag: el.tagName,
                            id: el.id,
                            cls: (typeof el.className === 'string') ? el.className.substring(0, 30) : '',
                            right: Math.round(r.right),
                            width: Math.round(r.width)
                        });
                    }
                }
                return { viewW, docW, bad: bad.slice(0, 5) };
            }
            return null;
        }, w);

        if (res) {
            console.log(`OVERFLOW at ${w}px (docW=${res.docW}):`, res.bad);
            offending.push(res);
        }
    }
    expect(offending).toEqual([]);
});
