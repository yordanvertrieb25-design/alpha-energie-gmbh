# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: seo.spec.js >> SEO E2E Test Suite >> Tier 3: Cross-Feature Combinations >> 47. All HTML files not listed in sitemap.xml must have noindex tags
- Location: tests\seo.spec.js:597:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 9

- Array []
+ Array [
+   Object {
+     "error": "expect(received).toBeGreaterThan(expected)
+
+ Expected: > 0
+ Received:   0",
+     "file": "Marketing_Plan_Alpha_Energie_2026.html",
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]: Montag – Freitag 08:00 Uhr bis 17:00 Uhr
    - generic [ref=e4]:
      - link "T +49 231 6169560" [ref=e5] [cursor=pointer]:
        - /url: tel:+492316169560
      - link "E info@alpha-energie.de" [ref=e6] [cursor=pointer]:
        - /url: mailto:info@alpha-energie.de
  - banner [ref=e7]:
    - generic [ref=e8]:
      - link "Alpha Energie GmbH" [ref=e10] [cursor=pointer]:
        - /url: /
        - img "Alpha Energie GmbH" [ref=e11]
      - navigation [ref=e12]:
        - list [ref=e13]:
          - listitem [ref=e14]:
            - link "Über uns" [ref=e15] [cursor=pointer]:
              - /url: ueber-uns.html
          - listitem [ref=e16]:
            - link "Lösungen" [ref=e17] [cursor=pointer]:
              - /url: "#"
          - listitem [ref=e18]:
            - link "Karriere" [ref=e19] [cursor=pointer]:
              - /url: karriere.html
          - listitem [ref=e20]:
            - link "Kontakt" [ref=e21] [cursor=pointer]:
              - /url: kontakt.html
      - generic [ref=e22]:
        - link "Partner werden" [ref=e23] [cursor=pointer]:
          - /url: vertriebspartner.html
        - link "VP-Portal" [ref=e24] [cursor=pointer]:
          - /url: https://vp.alpha-energie.de
        - link "B2B-Portal" [ref=e25] [cursor=pointer]:
          - /url: b2b-portal.html
  - main [ref=e26]:
    - generic [ref=e28]:
      - heading "Vertriebspartner-Portal (VP)" [level=1] [ref=e29]
      - paragraph [ref=e30]: Tarife vergleichen, Verträge einreichen und Provisionen tracken an einem zentralen Ort.
    - generic [ref=e33]:
      - generic [ref=e34]:
        - generic [ref=e35]: Digitaler Vertrieb
        - heading "Alles, was Sie für Ihren Vertriebserfolg benötigen" [level=2] [ref=e36]
        - generic [ref=e37]:
          - generic [ref=e38]:
            - generic [ref=e39]: "01"
            - generic [ref=e40]:
              - heading "Echtzeit-Tarifdatenbank & Vergleichsrechner" [level=3] [ref=e41]
              - paragraph [ref=e42]: Vergleichen Sie mit wenigen Klicks tagesaktuelle B2C- und B2B-Tarife für Strom, Gas und Telekommunikation von über 80 führenden Versorgungsunternehmen. Unser System führt im Hintergrund eine automatisierte Postleitzahlen- und Verbrauchsanalyse durch.
          - generic [ref=e43]:
            - generic [ref=e44]: "02"
            - generic [ref=e45]:
              - heading "Volldigitaler, rechtssicherer Abschluss (eSign)" [level=3] [ref=e46]
              - paragraph [ref=e47]: Reichen Sie Verträge direkt vor Ort beim Kunden auf dem Tablet oder Smartphone ein. Dank integrierter Plausibilitätsprüfung und digitaler Unterschriftsabwicklung minimieren Sie Fehler und beschleunigen die Freigabe der Tarife durch die Lieferanten.
          - generic [ref=e48]:
            - generic [ref=e49]: "03"
            - generic [ref=e50]:
              - heading "Echtzeit-Provisionsübersicht & Reporting" [level=3] [ref=e51]
              - paragraph [ref=e52]: Behalten Sie den Status all Ihrer eingereichten Verträge lückenlos im Auge. Unser Portal bietet Ihnen detaillierte Auswertungen über Genehmigungen, Stornos und anstehende Auszahlungen mit vollautomatischen Provisionsabrechnungen.
      - generic [ref=e54]:
        - generic [ref=e55]:
          - generic [ref=e56] [cursor=pointer]: Login
          - generic [ref=e57] [cursor=pointer]: Registrieren
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]: E-Mail-Adresse
            - textbox "E-Mail-Adresse" [ref=e62]:
              - /placeholder: name@beispiel.de
          - generic [ref=e63]:
            - generic [ref=e64]: Passwort
            - textbox "Passwort" [ref=e65]:
              - /placeholder: ••••••••
          - generic [ref=e66]:
            - generic [ref=e67] [cursor=pointer]:
              - checkbox "Angemeldet bleiben" [ref=e68]
              - text: Angemeldet bleiben
            - link "Passwort vergessen?" [ref=e69] [cursor=pointer]:
              - /url: "#"
          - button "Jetzt einloggen" [ref=e70] [cursor=pointer]
  - contentinfo [ref=e71]:
    - generic [ref=e72]:
      - generic [ref=e73]:
        - generic [ref=e74]:
          - link "Alpha Energie GmbH" [ref=e75] [cursor=pointer]:
            - /url: /
            - img "Alpha Energie GmbH" [ref=e76]
          - paragraph [ref=e77]: Alpha Energie GmbH ist dein kompetenter Begleiter und Berater bei der Energiekostenoptimierung!
          - generic [ref=e78]:
            - link "Facebook" [ref=e79] [cursor=pointer]:
              - /url: "#facebook"
            - link "LinkedIn" [ref=e80] [cursor=pointer]:
              - /url: "#linkedin"
            - link "Instagram" [ref=e81] [cursor=pointer]:
              - /url: "#instagram"
        - generic [ref=e82]:
          - heading "Unternehmen" [level=4] [ref=e83]
          - list [ref=e84]:
            - listitem [ref=e85]:
              - link "Über uns" [ref=e86] [cursor=pointer]:
                - /url: ueber-uns.html
            - listitem [ref=e87]:
              - link "Karriere" [ref=e88] [cursor=pointer]:
                - /url: karriere.html
            - listitem [ref=e89]:
              - link "Kontakt" [ref=e90] [cursor=pointer]:
                - /url: kontakt.html
        - generic [ref=e91]:
          - heading "Lösungen" [level=4] [ref=e92]
          - list [ref=e93]:
            - listitem [ref=e94]:
              - link "Für Vertriebspartner" [ref=e95] [cursor=pointer]:
                - /url: vertriebspartner.html
            - listitem [ref=e96]:
              - link "Für Gewerbekunden" [ref=e97] [cursor=pointer]:
                - /url: gewerbekunden.html
            - listitem [ref=e98]:
              - link "Für Produktgeber" [ref=e99] [cursor=pointer]:
                - /url: produktgeber.html
            - listitem [ref=e100]:
              - link "Für Agenturen" [ref=e101] [cursor=pointer]:
                - /url: agenturen.html
        - generic [ref=e102]:
          - heading "Rechtliches" [level=4] [ref=e103]
          - list [ref=e104]:
            - listitem [ref=e105]:
              - link "Datenschutz" [ref=e106] [cursor=pointer]:
                - /url: datenschutz.html
            - listitem [ref=e107]:
              - link "Impressum" [ref=e108] [cursor=pointer]:
                - /url: impressum.html
            - listitem [ref=e109]:
              - link "Cookie-Einstellungen" [ref=e110] [cursor=pointer]:
                - /url: cookie-einstellungen.html
            - listitem [ref=e111]:
              - link "VP-Portal" [ref=e112] [cursor=pointer]:
                - /url: https://vp.alpha-energie.de
      - paragraph [ref=e114]: © Copyright 2026. Alle Rechte vorbehalten. Alpha Energie GmbH
      - generic [ref=e115]:
        - link "Optionen verwalten" [ref=e116] [cursor=pointer]:
          - /url: cookie-einstellungen.html
        - text: "|"
        - link "Dienste verwalten" [ref=e117] [cursor=pointer]:
          - /url: cookie-einstellungen.html
        - text: "|"
        - link "Einstellungen ansehen" [ref=e118] [cursor=pointer]:
          - /url: cookie-einstellungen.html
  - generic [ref=e120]:
    - heading "Datenschutzeinstellungen" [level=3] [ref=e121]
    - paragraph [ref=e122]:
      - text: Wir verwenden Technologien zur Datenspeicherung, um Ihnen das beste Erlebnis auf unserer Website zu bieten. Einige davon sind essenziell (z.B. für die Grundfunktionen der Website), während andere uns helfen, unsere Website und Ihr Erlebnis zu verbessern. Weitere Informationen finden Sie in unserer
      - link "Datenschutzerklärung" [ref=e123] [cursor=pointer]:
        - /url: datenschutz.html
      - text: .
    - generic [ref=e124]:
      - generic [ref=e125]:
        - button "Alle akzeptieren" [ref=e126] [cursor=pointer]
        - button "Nur Essenzielle" [ref=e127] [cursor=pointer]
      - link "Individuelle Einstellungen anpassen" [ref=e128] [cursor=pointer]:
        - /url: cookie-einstellungen.html
```

# Test source

```ts
  518 | 
  519 |     test('41. Description tags do not have duplicate contents across indexable pages', async ({ page }) => {
  520 |       const descriptions = [];
  521 |       for (const pageName of indexablePages) {
  522 |         await page.goto(`/${pageName}`);
  523 |         const descMeta = page.locator('meta[name="description" i]');
  524 |         const descContent = await descMeta.getAttribute('content');
  525 |         expect(descContent).not.toBeNull();
  526 |         descriptions.push(descContent);
  527 |       }
  528 |       const uniqueDescs = new Set(descriptions);
  529 |       expect(descriptions.length).toBe(uniqueDescs.size);
  530 |     });
  531 | 
  532 |     indexablePages.forEach((pageName, idx) => {
  533 |       test(`${42 + idx}. Indexable page /${pageName} JSON-LD parses successfully`, async ({ page }) => {
  534 |         await page.goto(`/${pageName}`);
  535 |         const scripts = page.locator('script[type="application/ld+json"]');
  536 |         const count = await scripts.count();
  537 |         expect(count).toBeGreaterThan(0);
  538 |         
  539 |         for (let i = 0; i < count; i++) {
  540 |           const content = await scripts.nth(i).textContent();
  541 |           let parsed;
  542 |           expect(() => { parsed = JSON.parse(content); }).not.toThrow();
  543 |           expect(parsed).toBeDefined();
  544 |           
  545 |           const contextMatches = (ctx) => {
  546 |             if (typeof ctx === 'string') {
  547 |               return /^https?:\/\/schema\.org\/?$/.test(ctx);
  548 |             }
  549 |             if (Array.isArray(ctx)) {
  550 |               return ctx.some(item => typeof item === 'string' && /^https?:\/\/schema\.org\/?$/.test(item));
  551 |             }
  552 |             return false;
  553 |           };
  554 | 
  555 |           const checkContext = (obj, inheritedContext = null) => {
  556 |             if (!obj || typeof obj !== 'object') {
  557 |               return false;
  558 |             }
  559 |             if (Array.isArray(obj)) {
  560 |               return obj.length > 0 && obj.every(item => checkContext(item, inheritedContext));
  561 |             }
  562 |             
  563 |             const currentContext = obj['@context'] ? obj['@context'] : inheritedContext;
  564 |             const hasValidContext = currentContext && contextMatches(currentContext);
  565 | 
  566 |             if (obj['@graph'] && Array.isArray(obj['@graph'])) {
  567 |               return obj['@graph'].length > 0 && obj['@graph'].every(item => checkContext(item, currentContext));
  568 |             }
  569 | 
  570 |             return !!hasValidContext;
  571 |           };
  572 | 
  573 |           expect(checkContext(parsed)).toBe(true);
  574 |         }
  575 |       });
  576 |     });
  577 |   });
  578 | 
  579 |   // ==========================================
  580 |   // TIER 3: CROSS-FEATURE COMBINATIONS
  581 |   // ==========================================
  582 |   test.describe('Tier 3: Cross-Feature Combinations', () => {
  583 | 
  584 |     test('46. Pages listed in sitemap.xml do not contain noindex tags', async ({ page }) => {
  585 |       const urls = await parseSitemapUrls(page);
  586 |       for (const url of urls) {
  587 |         const parsedUrl = new URL(url);
  588 |         await page.goto(parsedUrl.pathname);
  589 |         const metas = await getRobotsMetaContents(page);
  590 |         for (const meta of metas) {
  591 |           expect(meta.content).not.toContain('noindex');
  592 |           expect(meta.content).not.toContain('none');
  593 |         }
  594 |       }
  595 |     });
  596 | 
  597 |     test('47. All HTML files not listed in sitemap.xml must have noindex tags', async ({ page }) => {
  598 |       const urls = await parseSitemapUrls(page);
  599 |       const sitemapUrls = urls.map(url => {
  600 |         const parsed = new URL(url);
  601 |         let pathname = parsed.pathname.substring(1);
  602 |         if (!pathname) pathname = 'index.html';
  603 |         return pathname;
  604 |       });
  605 | 
  606 |       const errors = [];
  607 |       for (const file of nonIndexablePages) {
  608 |         try {
  609 |           expect(sitemapUrls).not.toContain(file);
  610 |           
  611 |           await page.goto(`/${file}`);
  612 |           const metas = await getRobotsMetaContents(page);
  613 |           verifyRobotsMetaForNonIndexable(metas);
  614 |         } catch (err) {
  615 |           errors.push({ file, error: err.message });
  616 |         }
  617 |       }
> 618 |       expect(errors).toEqual([]);
      |                      ^ Error: expect(received).toEqual(expected) // deep equality
  619 |     });
  620 | 
  621 |     test('48. Sitemap URL specified in robots.txt is fetchable and identical to sitemap.xml', async ({ request }) => {
  622 |       const robotsRes = await request.get('/robots.txt');
  623 |       expect(robotsRes.status()).toBe(200);
  624 |       const robotsText = await robotsRes.text();
  625 |       const match = robotsText.match(/^Sitemap:\s+(https?:\/\/[^\s]+)/im);
  626 |       expect(match).not.toBeNull();
  627 |       
  628 |       if (match) {
  629 |         const sitemapUrl = match[1];
  630 |         const sitemapRes = await request.get(sitemapUrl);
  631 |         expect(sitemapRes.status()).toBe(200);
  632 |         expect(sitemapRes.headers()['content-type']).toMatch(/(application\/xml|text\/xml)/);
  633 |       }
  634 |     });
  635 | 
  636 |     test('49. sitemap.xml does not list any URL blocked in robots.txt', async ({ page }) => {
  637 |       const robotsRes = await page.request.get('/robots.txt');
  638 |       expect(robotsRes.status()).toBe(200);
  639 |       const robotsText = await robotsRes.text();
  640 |       const blocks = parseRobotsTxt(robotsText);
  641 |       const starBlock = blocks.find(b => b.userAgents.includes('*'));
  642 | 
  643 |       const urls = await parseSitemapUrls(page);
  644 |       const sitemapPaths = urls.map(url => new URL(url).pathname);
  645 | 
  646 |       for (const urlPath of sitemapPaths) {
  647 |         if (starBlock) {
  648 |           expect(isPathBlocked(starBlock, urlPath)).toBe(false);
  649 |         }
  650 |       }
  651 |     });
  652 | 
  653 |     indexablePages.forEach((pageName, idx) => {
  654 |       test(`${50 + idx}. Indexable page /${pageName} BreadcrumbList URL matches page URL`, async ({ page }) => {
  655 |         await page.goto(`/${pageName}`);
  656 |         const scripts = page.locator('script[type="application/ld+json"]');
  657 |         const count = await scripts.count();
  658 |         let foundBreadcrumb = false;
  659 | 
  660 |         for (let i = 0; i < count; i++) {
  661 |           const content = await scripts.nth(i).textContent();
  662 |           const parsed = JSON.parse(content);
  663 |           
  664 |           const schemas = extractSchemas(parsed);
  665 |           const breadcrumbSchema = schemas.find(s => {
  666 |             const types = Array.isArray(s['@type']) ? s['@type'] : [s['@type']];
  667 |             return types.includes('BreadcrumbList');
  668 |           });
  669 |           
  670 |           if (breadcrumbSchema) {
  671 |             foundBreadcrumb = true;
  672 |             const items = breadcrumbSchema.itemListElement || [];
  673 |             expect(items.length).toBeGreaterThan(0);
  674 |             
  675 |             const lastItem = items[items.length - 1];
  676 |             let itemVal = lastItem.item || lastItem.id;
  677 |             if (itemVal && typeof itemVal === 'object') {
  678 |               itemVal = itemVal['@id'] || itemVal.id;
  679 |             }
  680 |             const breadcrumbUrl = itemVal;
  681 |             expect(breadcrumbUrl).toBeDefined();
  682 |             
  683 |             const breadcrumbPathname = new URL(breadcrumbUrl, page.url()).pathname;
  684 |             const pagePathname = new URL(page.url()).pathname;
  685 |             const normPage = pagePathname.replace(/\/index\.html$/, '/');
  686 |             const normBreadcrumb = breadcrumbPathname.replace(/\/index\.html$/, '/');
  687 |             expect(normPage).toBe(normBreadcrumb);
  688 |           }
  689 |         }
  690 |         expect(foundBreadcrumb).toBe(true);
  691 |       });
  692 |     });
  693 | 
  694 |     test('54. Navigation links to indexable pages are valid and point to correct destinations', async ({ page }) => {
  695 |       await page.goto('/');
  696 |       const navLinks = page.locator('header a');
  697 |       const count = await navLinks.count();
  698 |       const localOrigin = new URL(page.url()).origin;
  699 |       for (let i = 0; i < count; i++) {
  700 |         const href = await navLinks.nth(i).getAttribute('href');
  701 |         if (href && !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('mailto:')) {
  702 |           let testUrl = href;
  703 |           let isExternal = false;
  704 |           if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
  705 |             try {
  706 |               const urlToParse = href.startsWith('//') ? `https:${href}` : href;
  707 |               const parsed = new URL(urlToParse);
  708 |               const hostname = parsed.hostname.toLowerCase();
  709 |               if (hostname === 'alpha-energie.de' || hostname === 'www.alpha-energie.de') {
  710 |                 testUrl = localOrigin + parsed.pathname + parsed.search + parsed.hash;
  711 |               } else if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
  712 |                 isExternal = true;
  713 |               }
  714 |             } catch (e) {
  715 |               isExternal = true;
  716 |             }
  717 |           }
  718 |           if (isExternal) {
```