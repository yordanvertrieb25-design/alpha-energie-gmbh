const { test, expect } = require('@playwright/test');

test('Diagnostic - Find elements with scrollWidth > clientWidth after Tweak 1', async ({ page }) => {
    await page.goto('http://localhost:3000/agenturen.html');
    await page.evaluate(() => {
        localStorage.setItem('alpha_consent_status', 'all');
    });
    await page.reload();
    await page.waitForTimeout(500);
    await page.setViewportSize({ width: 320, height: 600 });
    await page.waitForTimeout(1000);

    // Apply Tweak 1
    await page.evaluate(() => {
        const card = document.querySelector('.grid-split .card.highlight-card');
        if (card) {
            card.style.padding = '1.5rem';
        }
    });
    await page.waitForTimeout(1000);

    const results = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const list = [];
        allElements.forEach(el => {
            if (el.scrollWidth > el.clientWidth) {
                // Ignore html and body since they contain the overflow
                if (el.tagName !== 'HTML' && el.tagName !== 'BODY') {
                    let path = el.tagName.toLowerCase();
                    if (el.id) path += '#' + el.id;
                    if (el.className) path += '.' + Array.from(el.classList).join('.');
                    list.push({
                        path,
                        scrollWidth: el.scrollWidth,
                        clientWidth: el.clientWidth,
                        rect: el.getBoundingClientRect(),
                        text: el.innerText ? el.innerText.substring(0, 50) : ''
                    });
                }
            }
        });
        return {
            scrollWidth: document.documentElement.scrollWidth,
            list
        };
    });

    console.log(`Document scrollWidth: ${results.scrollWidth}`);
    console.log(`Elements with scrollWidth > clientWidth: ${results.list.length}`);
    results.list.forEach((item, idx) => {
        console.log(`[${idx}] ${item.path}`);
        console.log(`    ScrollWidth: ${item.scrollWidth}, ClientWidth: ${item.clientWidth}`);
        console.log(`    Rect: L:${item.rect.left.toFixed(2)} R:${item.rect.right.toFixed(2)} W:${item.rect.width.toFixed(2)}`);
        console.log(`    Text: ${item.text}`);
    });
});
