# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: seo.spec.js >> SEO E2E Test Suite >> Tier 2: Boundary & Corner Cases >> 39. Description lengths are optimal for search engines (50 - 160 chars)
- Location: tests\seo.spec.js:473:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/impressum.html", waiting until "load"

```

# Test source

```ts
  375 |         // The server is case-sensitive, so /ROBOTS.TXT must return 301, 302, or 404.
  376 |         const res = await request.get('/ROBOTS.TXT');
  377 |         expect([301, 302, 404]).toContain(res.status());
  378 |       }
  379 |     });
  380 | 
  381 |     test('27. robots.txt has no syntax errors', async ({ request }) => {
  382 |       const res = await request.get('/robots.txt');
  383 |       expect(res.status()).toBe(200);
  384 |       const text = await res.text();
  385 |       const lines = text.split('\n');
  386 |       for (const line of lines) {
  387 |         const trimmed = line.trim();
  388 |         if (trimmed && !trimmed.startsWith('#')) {
  389 |           expect(trimmed).toMatch(/^[A-Za-z0-9_-]+:\s*/);
  390 |         }
  391 |       }
  392 |     });
  393 | 
  394 |     test('28. robots.txt permits specified AI bots explicitly', async ({ request }) => {
  395 |       const res = await request.get('/robots.txt');
  396 |       expect(res.status()).toBe(200);
  397 |       const text = await res.text();
  398 |       const blocks = parseRobotsTxt(text);
  399 |       
  400 |       const aiBots = ['gptbot', 'ccbot', 'google-extended'];
  401 |       const indexableUrls = ['/index.html', '/vertriebspartner.html', '/agenturen.html', '/impressum.html'];
  402 |       
  403 |       for (const bot of aiBots) {
  404 |         let botBlock = blocks.find(b => b.userAgents.includes(bot));
  405 |         if (!botBlock) {
  406 |           botBlock = blocks.find(b => b.userAgents.includes('*'));
  407 |         }
  408 |         expect(botBlock).toBeDefined();
  409 |         for (const urlPath of indexableUrls) {
  410 |           expect(isPathBlocked(botBlock, urlPath)).toBe(false);
  411 |         }
  412 |       }
  413 |     });
  414 | 
  415 |     test('29. sitemap.xml contains valid XML namespace', async ({ request }) => {
  416 |       const res = await request.get('/sitemap.xml');
  417 |       expect(res.status()).toBe(200);
  418 |       const text = await res.text();
  419 |       expect(text).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  420 |     });
  421 | 
  422 |     test('30. sitemap.xml has no duplicate URLs', async ({ page }) => {
  423 |       const urls = await parseSitemapUrls(page);
  424 |       const uniqueUrls = new Set(urls);
  425 |       expect(urls.length).toBe(uniqueUrls.size);
  426 |     });
  427 | 
  428 |     test('31. sitemap.xml URLs are fully qualified absolute URLs', async ({ page }) => {
  429 |       const urls = await parseSitemapUrls(page);
  430 |       for (const url of urls) {
  431 |         expect(url).toMatch(/^https?:\/\/[^\s/]+/);
  432 |       }
  433 |     });
  434 | 
  435 |     test('32. noindex meta tag casing is correct and handles variations', async ({ page }) => {
  436 |       expect(nonIndexablePages.length).toBeGreaterThan(0);
  437 |       if (nonIndexablePages.length > 0) {
  438 |         await page.goto(`/${nonIndexablePages[0]}`);
  439 |         const metas = await getRobotsMetaContents(page);
  440 |         expect(metas.length).toBeGreaterThan(0);
  441 |         const hasNoIndexOrNone = metas.some(meta => meta.content.includes('noindex') || meta.content.includes('none'));
  442 |         expect(hasNoIndexOrNone).toBe(true);
  443 |       }
  444 |     });
  445 | 
  446 |     nonIndexablePages.forEach((pageName, idx) => {
  447 |       test(`33.${idx + 1}. Non-indexable file /${pageName} has valid noindex tag`, async ({ page }) => {
  448 |         await page.goto(`/${pageName}`);
  449 |         const metas = await getRobotsMetaContents(page);
  450 |         expect(metas.length).toBeGreaterThan(0);
  451 |         const hasNoIndexOrNone = metas.some(meta => meta.content.includes('noindex') || meta.content.includes('none'));
  452 |         expect(hasNoIndexOrNone).toBe(true);
  453 |       });
  454 |     });
  455 | 
  456 |     indexablePages.forEach((pageName, idx) => {
  457 |       test(`${34 + idx}. Indexable page /${pageName} H1 is not empty`, async ({ page }) => {
  458 |         await page.goto(`/${pageName}`);
  459 |         const h1 = page.locator('h1');
  460 |         await expect(h1).not.toBeEmpty();
  461 |       });
  462 |     });
  463 | 
  464 |     test('38. Title lengths are optimal for search engines (10 - 70 chars)', async ({ page }) => {
  465 |       for (const pageName of indexablePages) {
  466 |         await page.goto(`/${pageName}`);
  467 |         const title = await page.title();
  468 |         expect(title.length).toBeGreaterThanOrEqual(10);
  469 |         expect(title.length).toBeLessThanOrEqual(70);
  470 |       }
  471 |     });
  472 | 
  473 |     test('39. Description lengths are optimal for search engines (50 - 160 chars)', async ({ page }) => {
  474 |       for (const pageName of indexablePages) {
> 475 |         await page.goto(`/${pageName}`);
      |                    ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  476 |         const descMeta = page.locator('meta[name="description" i]');
  477 |         const descContent = await descMeta.getAttribute('content');
  478 |         expect(descContent).not.toBeNull();
  479 |         expect(descContent.length).toBeGreaterThanOrEqual(50);
  480 |         expect(descContent.length).toBeLessThanOrEqual(160);
  481 |       }
  482 |     });
  483 | 
  484 |     test('40. Title tags do not have duplicate contents across indexable pages', async ({ page }) => {
  485 |       const titles = [];
  486 |       for (const pageName of indexablePages) {
  487 |         await page.goto(`/${pageName}`);
  488 |         titles.push(await page.title());
  489 |       }
  490 |       const uniqueTitles = new Set(titles);
  491 |       expect(titles.length).toBe(uniqueTitles.size);
  492 |     });
  493 | 
  494 |     test('41. Description tags do not have duplicate contents across indexable pages', async ({ page }) => {
  495 |       const descriptions = [];
  496 |       for (const pageName of indexablePages) {
  497 |         await page.goto(`/${pageName}`);
  498 |         const descMeta = page.locator('meta[name="description" i]');
  499 |         const descContent = await descMeta.getAttribute('content');
  500 |         expect(descContent).not.toBeNull();
  501 |         descriptions.push(descContent);
  502 |       }
  503 |       const uniqueDescs = new Set(descriptions);
  504 |       expect(descriptions.length).toBe(uniqueDescs.size);
  505 |     });
  506 | 
  507 |     indexablePages.forEach((pageName, idx) => {
  508 |       test(`${42 + idx}. Indexable page /${pageName} JSON-LD parses successfully`, async ({ page }) => {
  509 |         await page.goto(`/${pageName}`);
  510 |         const scripts = page.locator('script[type="application/ld+json"]');
  511 |         const count = await scripts.count();
  512 |         expect(count).toBeGreaterThan(0);
  513 |         
  514 |         for (let i = 0; i < count; i++) {
  515 |           const content = await scripts.nth(i).textContent();
  516 |           let parsed;
  517 |           expect(() => { parsed = JSON.parse(content); }).not.toThrow();
  518 |           expect(parsed).toBeDefined();
  519 |           
  520 |           const contextMatches = (ctx) => {
  521 |             if (typeof ctx === 'string') {
  522 |               return /^https?:\/\/schema\.org\/?$/.test(ctx);
  523 |             }
  524 |             if (Array.isArray(ctx)) {
  525 |               return ctx.some(item => typeof item === 'string' && /^https?:\/\/schema\.org\/?$/.test(item));
  526 |             }
  527 |             return false;
  528 |           };
  529 | 
  530 |           const checkContext = (obj) => {
  531 |             if (obj && obj['@context'] && contextMatches(obj['@context'])) {
  532 |               return true;
  533 |             }
  534 |             if (obj && obj['@graph'] && Array.isArray(obj['@graph'])) {
  535 |               return obj['@graph'].some(item => checkContext(item));
  536 |             }
  537 |             return false;
  538 |           };
  539 | 
  540 |           expect(checkContext(parsed)).toBe(true);
  541 |         }
  542 |       });
  543 |     });
  544 |   });
  545 | 
  546 |   // ==========================================
  547 |   // TIER 3: CROSS-FEATURE COMBINATIONS
  548 |   // ==========================================
  549 |   test.describe('Tier 3: Cross-Feature Combinations', () => {
  550 | 
  551 |     test('46. Pages listed in sitemap.xml do not contain noindex tags', async ({ page }) => {
  552 |       const urls = await parseSitemapUrls(page);
  553 |       for (const url of urls) {
  554 |         const parsedUrl = new URL(url);
  555 |         await page.goto(parsedUrl.pathname);
  556 |         const metas = await getRobotsMetaContents(page);
  557 |         for (const meta of metas) {
  558 |           expect(meta.content).not.toContain('noindex');
  559 |           expect(meta.content).not.toContain('none');
  560 |         }
  561 |       }
  562 |     });
  563 | 
  564 |     test('47. All HTML files not listed in sitemap.xml must have noindex tags', async ({ page }) => {
  565 |       const urls = await parseSitemapUrls(page);
  566 |       const sitemapUrls = urls.map(url => {
  567 |         const parsed = new URL(url);
  568 |         let pathname = parsed.pathname.substring(1);
  569 |         if (!pathname) pathname = 'index.html';
  570 |         return pathname;
  571 |       });
  572 | 
  573 |       const errors = [];
  574 |       for (const file of nonIndexablePages) {
  575 |         try {
```