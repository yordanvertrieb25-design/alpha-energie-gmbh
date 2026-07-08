# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: seo.spec.js >> SEO E2E Test Suite >> Tier 4: Real-World Application >> Descriptive Anchor Text: Indexable page /index.html has descriptive link text
- Location: tests\seo.spec.js:861:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.innerText: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('a').first()

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
        - /url: index.html
        - img "Alpha Energie GmbH" [ref=e11]
      - navigation [ref=e12]:
        - list [ref=e13]:
          - listitem [ref=e14]:
            - link "Über uns" [ref=e15] [cursor=pointer]:
              - /url: ueber-uns.html
          - listitem [ref=e16]:
            - link "Lösungen" [ref=e17] [cursor=pointer]:
              - /url: "#solutions"
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
  - main [ref=e25]:
    - generic [ref=e27]:
      - generic [ref=e28]:
        - heading "Zukunftssichere Energielösungen für Mittelstand & Vertrieb" [level=1] [ref=e29]:
          - text: Zukunftssichere
          - text: Energielösungen
          - text: für Mittelstand & Vertrieb
        - paragraph [ref=e30]: Wir senken Energiekosten für Gewerbekunden nachhaltig, bieten Vertriebspartnern eine erstklassige Infrastruktur und verhelfen Produktgebern zu starkem Absatz.
        - generic [ref=e31]:
          - link "Vertriebspartner werden" [ref=e32] [cursor=pointer]:
            - /url: vertriebspartner.html
          - link "B2B-Lösungen entdecken" [ref=e33] [cursor=pointer]:
            - /url: /gewerbekunden
      - generic [ref=e37]:
        - generic [ref=e38]:
          - img [ref=e39]
          - text: 100% Sicher & Seriös
        - generic [ref=e41]:
          - generic [ref=e42]:
            - img [ref=e43]
            - img [ref=e45]
            - img [ref=e47]
            - img [ref=e49]
            - img [ref=e51]
          - text: 4.9/5 Experten-Rating
        - generic [ref=e53]:
          - img [ref=e54]
          - text: Über 3.000 Partner
    - generic [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e63]: 15+
        - generic [ref=e64]: Jahre Erfahrung auf Chefebene
        - generic [ref=e65]: Erfolgreich im Energie- und B2B-Vertrieb
      - generic [ref=e66]:
        - generic [ref=e67]: 3000+
        - generic [ref=e68]: Aktive Vertriebspartner
        - generic [ref=e69]: Ein starkes bundesweites Netzwerk
      - generic [ref=e70]:
        - generic [ref=e71]: 150+
        - generic [ref=e72]: Energieversorger
        - generic [ref=e73]: Exklusives Tarifportfolio im System
      - generic [ref=e74]:
        - generic [ref=e75]: 84k+
        - generic [ref=e76]: Aufträge pro Jahr
        - generic [ref=e77]: Erfolgreich verarbeitete Verträge für unsere Kunden
    - generic [ref=e79]:
      - generic [ref=e80]:
        - heading "Für Gewerbekunden (B2B)" [level=2] [ref=e81]
        - paragraph [ref=e82]: Schützen Sie Ihr Unternehmen vor Preissprüngen. Mit DIN EN 16247-1 Energie-Audits, Photovoltaik-Eigenversorgung und Peak Shaving senken wir Ihre Betriebskosten nachhaltig und sichern Ihre ESG-Compliance.
        - link "Zu unseren B2B-Lösungen" [ref=e83] [cursor=pointer]:
          - /url: gewerbekunden.html
      - generic [ref=e84]:
        - heading "Für Vertriebspartner" [level=2] [ref=e85]
        - paragraph [ref=e86]: Nutzen Sie unser digitales VP-Portal für Strom, Gas und Telekommunikation. Profitieren Sie von Spitzenprovisionen, wöchentlichen Auszahlungen, Echtzeit-Tracking und persönlichem Support.
        - link "Jetzt Partner werden" [ref=e87] [cursor=pointer]:
          - /url: vertriebspartner.html
    - generic [ref=e89]:
      - generic [ref=e90]:
        - generic [ref=e91]: Ihr Browser unterstützt keine HTML5-Videos.
        - button "Ton umschalten" [ref=e92] [cursor=pointer]:
          - img [ref=e94]
      - generic [ref=e97]:
        - generic [ref=e98]: Unsere Vision
        - heading "Energievertrieb der Zukunft" [level=2] [ref=e99]
        - paragraph [ref=e100]: Entdecken Sie, wie wir mit innovativen Lösungen und starken Partnerschaften die Energielandschaft von morgen prägen. Bei der Alpha Energie GmbH verbinden wir langjährige Erfahrung mit modernster digitaler Infrastruktur – für Ihren maximalen und nachhaltigen Erfolg.
        - link "Lernen Sie uns kennen" [ref=e101] [cursor=pointer]:
          - /url: ueber-uns.html
    - generic [ref=e103]:
      - generic [ref=e104]:
        - generic [ref=e105]: Produktportfolio
        - heading "Vielfältige Energielösungen aus einer Hand" [level=2] [ref=e106]
        - paragraph [ref=e107]: Wir decken alle relevanten Energie- und Infrastrukturprodukte ab – für maximale Cross-Selling-Potenziale unserer Partner.
      - generic [ref=e108]:
        - generic [ref=e109]:
          - generic [ref=e110]: ⚡
          - generic [ref=e111]: Klassisch
          - heading "Strom & Gas" [level=3] [ref=e112]
          - paragraph [ref=e113]: Erstklassige Tarife renommierter Versorger für B2C und B2B zu unschlagbaren Konditionen.
        - generic [ref=e114]:
          - generic [ref=e115]: ☀️
          - generic [ref=e116]: Zukunft
          - heading "Photovoltaik" [level=3] [ref=e117]
          - paragraph [ref=e118]: Großprojekte und Eigenversorgungskonzepte inklusive Speicherlösungen für den Mittelstand.
        - generic [ref=e119]:
          - generic [ref=e120]: 🔥
          - generic [ref=e121]: Ökologisch
          - heading "Wärme & CO2" [level=3] [ref=e122]
          - paragraph [ref=e123]: ESG-konforme Heizungs- und Wärmekonzepte sowie nachhaltige CO2-Reduktionsstrategien.
        - generic [ref=e124]:
          - generic [ref=e125]: 🌐
          - generic [ref=e126]: Zusatzgeschäft
          - heading "Telekommunikation" [level=3] [ref=e127]
          - paragraph [ref=e128]: Highspeed-Glasfaseranschlüsse und Mobilfunktarife für die perfekte Kundenrundumbetreuung.
    - generic [ref=e130]:
      - generic [ref=e131]:
        - generic [ref=e132]: Deine Vorteile
        - heading "Warum Partner sich für Alpha Energie entscheiden" [level=2] [ref=e133]
      - generic [ref=e134]:
        - generic [ref=e135]:
          - img [ref=e137]
          - heading "Auszahlungssicherheit" [level=3] [ref=e139]
          - paragraph [ref=e140]: Pünktliche und transparente Provisionsabrechnungen. Auf Wunsch wöchentliche Auszahlungen und garantierte Bestandspflege-Provisionen zur langfristigen Einkommenssicherung.
        - generic [ref=e141]:
          - img [ref=e143]
          - heading "Digitales VP-Portal" [level=3] [ref=e145]
          - paragraph [ref=e146]: Abschlüsse in Minuten mit integriertem Tarifrechner, eSignature und Echtzeit-Statusverfolgung. Komplett papierlos, hocheffizient und mobil optimiert für die Direktberatung.
        - generic [ref=e147]:
          - img [ref=e149]
          - heading "KI-gestützte Tools" [level=3] [ref=e151]
          - paragraph [ref=e152]: Wir unterstützen Agenturen und Vertriebspartner mit intelligenten KI-Lösungen, um den administrativen Alltag spürbar zu erleichtern – für maximalen Fokus auf das Kerngeschäft.
        - generic [ref=e153]:
          - img [ref=e155]
          - heading "Support auf Augenhöhe" [level=3] [ref=e160]
          - paragraph [ref=e161]: Ein erfahrenes Backoffice-Team steht dir bei B2B-Sonderkalkulationen und Großkundenanfragen tatkräftig zur Seite. Plus exzellente Schulungen und kontinuierliche Coachings.
    - generic [ref=e163]:
      - generic [ref=e164]:
        - generic [ref=e165]: Unsere Geschichte
        - heading "Unser Weg im Zeitraffer" [level=2] [ref=e166]
      - generic [ref=e167]:
        - generic [ref=e170]: "2021"
        - generic [ref=e172]:
          - generic [ref=e173]:
            - heading "2021 – Die Gründung" [level=3] [ref=e174]
            - paragraph [ref=e175]: Gründung der Alpha Energie GmbH in Dortmund. Bündelung von über 15 Jahren Erfahrung auf Chefebene im Energiemarkt mit der Vision, Transparenz und Fairness in die Energieberatung zu bringen.
          - generic [ref=e176]:
            - heading "2022 – Skalierung & Technologie" [level=3] [ref=e177]
            - paragraph [ref=e178]: Etablierung eines bundesweiten Vertriebsnetzwerks. Einführung unserer ersten digitalen Erfassungstools, um Handelsvertretern und Agenturen die Arbeit vor Ort zu erleichtern.
          - generic [ref=e179]:
            - heading "2023 – B2B & Nachhaltigkeit" [level=3] [ref=e180]
            - paragraph [ref=e181]: Erweiterung des Portfolios um ganzheitliche B2B-Konzepte, zertifizierte Energieaudits nach DIN EN 16247-1 und großvolumige Photovoltaik-Eigenversorgung für den Mittelstand.
          - generic [ref=e182]:
            - heading "Heute – Führende Plattform" [level=3] [ref=e183]
            - paragraph [ref=e184]: Mit über 150 aktiven Vertriebspartnern, modernster VP-Portaltechnologie und exklusiven Tarifzugängen der führende, unabhängige Partner für Handelsvertreter und Agenturen.
      - link "Mehr über uns" [ref=e186] [cursor=pointer]:
        - /url: ueber-uns.html
    - generic [ref=e188]:
      - generic [ref=e189]:
        - heading "Aktuelle News" [level=2] [ref=e190]
        - link "Alle News" [ref=e191] [cursor=pointer]:
          - /url: news.html
      - generic [ref=e192]:
        - article [ref=e193]:
          - generic [ref=e194]: 22.06.2026
          - 'heading "Energy Summer 2026: Wenn aus einem Branchenevent echte Gemeinschaft wird" [level=3] [ref=e195]'
          - paragraph [ref=e196]: "Dortmund, 2026 – das Sommerfest des Jahres Energy Summer 2026: Wenn aus einem Branchenevent echte Gemeinschaft wird..."
          - link "Mehr dazu" [ref=e197] [cursor=pointer]:
            - /url: news-energy-summer-2026.html
        - article [ref=e198]:
          - generic [ref=e199]: 19.05.2026
          - heading "Watt zählt – der Podcast, der der Energiebranche eine Stimme gibt" [level=3] [ref=e200]
          - paragraph [ref=e201]: Dortmund, 2026 – der Podcast für echte Insights aus der Energiebranche Watt zählt – der Podcast, der der Energiebranche eine…
          - link "Mehr dazu" [ref=e202] [cursor=pointer]:
            - /url: news-watt-zaehlt-podcast.html
        - article [ref=e203]:
          - generic [ref=e204]: 23.04.2026
          - heading "Alpha Energie GmbH als Great Place To Work® zertifiziert" [level=3] [ref=e205]
          - paragraph [ref=e206]: Dortmund, 2026 – Alpha Energie GmbH wurde erneut als Great Place To Work® zertifiziert. Ein Arbeitsplatz mit Vertrauen...
          - link "Mehr dazu" [ref=e207] [cursor=pointer]:
            - /url: news-great-place-to-work.html
  - contentinfo [ref=e208]:
    - generic [ref=e209]:
      - generic [ref=e210]:
        - generic [ref=e211]:
          - link "Alpha Energie GmbH" [ref=e212] [cursor=pointer]:
            - /url: index.html
            - img "Alpha Energie GmbH" [ref=e213]
          - paragraph [ref=e214]: Alpha Energie GmbH ist dein kompetenter Begleiter und Berater bei der Energiekostenoptimierung!
          - paragraph [ref=e215]: Alter Hellweg 50, 44379 Dortmund
          - generic [ref=e216]:
            - link "Facebook" [ref=e217] [cursor=pointer]:
              - /url: https://facebook.com/alphaenergie
            - link "LinkedIn" [ref=e218] [cursor=pointer]:
              - /url: https://linkedin.com/company/alphaenergie
            - link "Instagram" [ref=e219] [cursor=pointer]:
              - /url: https://instagram.com/alphaenergie
        - generic [ref=e220]:
          - heading "Unternehmen" [level=3] [ref=e221]
          - list [ref=e222]:
            - listitem [ref=e223]:
              - link "Über uns" [ref=e224] [cursor=pointer]:
                - /url: ueber-uns.html
            - listitem [ref=e225]:
              - link "Karriere" [ref=e226] [cursor=pointer]:
                - /url: karriere.html
            - listitem [ref=e227]:
              - link "Kontakt" [ref=e228] [cursor=pointer]:
                - /url: kontakt.html
        - generic [ref=e229]:
          - heading "Lösungen" [level=3] [ref=e230]
          - list [ref=e231]:
            - listitem [ref=e232]:
              - link "Für Vertriebspartner" [ref=e233] [cursor=pointer]:
                - /url: vertriebspartner.html
            - listitem [ref=e234]:
              - link "Für Gewerbekunden" [ref=e235] [cursor=pointer]:
                - /url: gewerbekunden.html
            - listitem [ref=e236]:
              - link "Für Produktgeber" [ref=e237] [cursor=pointer]:
                - /url: produktgeber.html
            - listitem [ref=e238]:
              - link "Für Agenturen" [ref=e239] [cursor=pointer]:
                - /url: agenturen.html
        - generic [ref=e240]:
          - heading "Rechtliches" [level=3] [ref=e241]
          - list [ref=e242]:
            - listitem [ref=e243]:
              - link "Datenschutz" [ref=e244] [cursor=pointer]:
                - /url: datenschutz.html
            - listitem [ref=e245]:
              - link "Impressum" [ref=e246] [cursor=pointer]:
                - /url: impressum.html
            - listitem [ref=e247]:
              - link "Cookie-Einstellungen" [ref=e248] [cursor=pointer]:
                - /url: cookie-einstellungen.html
            - listitem [ref=e249]:
              - link "Cookie-Richtlinie" [ref=e250] [cursor=pointer]:
                - /url: cookie-richtlinie.html
            - listitem [ref=e251]:
              - link "VP-Portal" [ref=e252] [cursor=pointer]:
                - /url: https://vp.alpha-energie.de
      - paragraph [ref=e254]: © Copyright 2026. Alle Rechte vorbehalten. Alpha Energie GmbH
      - link "Cookie-Einstellungen verwalten" [ref=e256] [cursor=pointer]:
        - /url: cookie-einstellungen.html
  - generic [ref=e258]:
    - heading "Datenschutzeinstellungen" [level=3] [ref=e259]
    - paragraph [ref=e260]:
      - text: Wir verwenden Technologien zur Datenspeicherung, um Ihnen das beste Erlebnis auf unserer Website zu bieten. Einige davon sind essenziell (z.B. für die Grundfunktionen der Website), während andere uns helfen, unsere Website und Ihr Erlebnis zu verbessern. Weitere Informationen finden Sie in unserer
      - link "Datenschutzerklärung" [ref=e261] [cursor=pointer]:
        - /url: datenschutz.html
      - text: .
    - generic [ref=e262]:
      - generic [ref=e263]:
        - button "Alle akzeptieren" [ref=e264] [cursor=pointer]
        - button "Nur Essenzielle" [ref=e265] [cursor=pointer]
      - link "Individuelle Einstellungen anpassen" [ref=e266] [cursor=pointer]:
        - /url: cookie-einstellungen.html
```

# Test source

```ts
  788 |         const scripts = page.locator('script[type="application/ld+json"]');
  789 |         const count = await scripts.count();
  790 |         let foundOrg = false;
  791 | 
  792 |         for (let i = 0; i < count; i++) {
  793 |           const content = await scripts.nth(i).textContent();
  794 |           const parsed = JSON.parse(content);
  795 |           
  796 |           const schemas = extractSchemas(parsed);
  797 |           const orgSchema = schemas.find(s => {
  798 |             const types = Array.isArray(s['@type']) ? s['@type'] : [s['@type']];
  799 |             return types.includes('Organization');
  800 |           });
  801 |           
  802 |           if (orgSchema) {
  803 |             foundOrg = true;
  804 |             expect(orgSchema.name).toBe('Alpha Energie GmbH');
  805 |             expect(orgSchema.url).toContain('alpha-energie.de');
  806 |             expect(orgSchema.logo).toContain('logo.png');
  807 |             expect(orgSchema.email || (orgSchema.contactPoint && orgSchema.contactPoint.email)).toBeDefined();
  808 |           }
  809 |         }
  810 |         expect(foundOrg).toBe(true);
  811 |       });
  812 |     });
  813 | 
  814 |     test('63. All indexable pages have a canonical link matching sitemap url', async ({ page }) => {
  815 |       const urls = await parseSitemapUrls(page);
  816 |       const sitemapUrlsMap = {};
  817 |       urls.forEach(url => {
  818 |         const filename = url.split('/').pop() || 'index.html';
  819 |         sitemapUrlsMap[filename] = url;
  820 |       });
  821 | 
  822 |       for (const pageName of indexablePages) {
  823 |         await page.goto(`/${pageName}`);
  824 |         const canonicalLink = page.locator('link[rel="canonical"]');
  825 |         await expect(canonicalLink).toBeAttached();
  826 |         const href = await canonicalLink.getAttribute('href');
  827 |         
  828 |         const expectedSitemapUrl = sitemapUrlsMap[pageName];
  829 |         expect(expectedSitemapUrl).toBeDefined();
  830 |         expect(href).toBe(expectedSitemapUrl);
  831 |       }
  832 |     });
  833 | 
  834 |     // --- Dynamic SEO Guideline Assertions ---
  835 |     indexablePages.forEach((pageName) => {
  836 |       test(`Image Alt: Indexable page /${pageName} has alt attribute on all images`, async ({ page }) => {
  837 |         await page.goto(`/${pageName}`);
  838 |         const images = page.locator('img');
  839 |         const count = await images.count();
  840 |         for (let i = 0; i < count; i++) {
  841 |           const alt = await images.nth(i).getAttribute('alt');
  842 |           expect(alt).not.toBeNull();
  843 |           expect(alt.trim().length).toBeGreaterThan(0);
  844 |         }
  845 |       });
  846 | 
  847 |       test(`Heading Hierarchy: Indexable page /${pageName} has a valid heading hierarchy`, async ({ page }) => {
  848 |         await page.goto(`/${pageName}`);
  849 |         const headings = await page.evaluate(() => {
  850 |           const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  851 |           return Array.from(elements).map(el => parseInt(el.tagName.substring(1), 10));
  852 |         });
  853 |         
  854 |         let prevLevel = 0;
  855 |         for (const currentLevel of headings) {
  856 |           expect(currentLevel).toBeLessThanOrEqual(prevLevel + 1);
  857 |           prevLevel = currentLevel;
  858 |         }
  859 |       });
  860 | 
  861 |       test(`Descriptive Anchor Text: Indexable page /${pageName} has descriptive link text`, async ({ page }) => {
  862 |         await page.goto(`/${pageName}`);
  863 |         const links = page.locator('a');
  864 |         const count = await links.count();
  865 |         const genericWords = [
  866 |           'click here',
  867 |           'here',
  868 |           'klicken',
  869 |           'klick',
  870 |           'hier',
  871 |           'mehr',
  872 |           'click',
  873 |           'mehr erfahren',
  874 |           'erfahren',
  875 |           'hier klicken',
  876 |           'klick hier'
  877 |         ];
  878 | 
  879 |         const badPhrases = [
  880 |           'click here',
  881 |           'hier klicken',
  882 |           'mehr erfahren',
  883 |           'klick hier'
  884 |         ];
  885 |         
  886 |         for (let i = 0; i < count; i++) {
  887 |           const link = links.nth(i);
> 888 |           let text = await link.innerText();
      |                                 ^ Error: locator.innerText: Test timeout of 60000ms exceeded.
  889 |           if (!text.trim()) {
  890 |             const images = link.locator('img');
  891 |             if (await images.count() > 0) {
  892 |               text = (await images.first().getAttribute('alt')) || '';
  893 |             }
  894 |           }
  895 |           
  896 |           const trimmed = text
  897 |             .replace(/[!.,?:\-–—→()<>]/g, '')
  898 |             .trim()
  899 |             .replace(/\s+/g, ' ')
  900 |             .toLowerCase();
  901 |             
  902 |           if (trimmed) {
  903 |             expect(genericWords).not.toContain(trimmed);
  904 |             for (const phrase of badPhrases) {
  905 |               expect(trimmed).not.toContain(phrase);
  906 |             }
  907 |           }
  908 |         }
  909 |       });
  910 |     });
  911 |   });
  912 | });
  913 | 
```