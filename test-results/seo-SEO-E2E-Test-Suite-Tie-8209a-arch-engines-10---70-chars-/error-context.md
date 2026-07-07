# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: seo.spec.js >> SEO E2E Test Suite >> Tier 2: Boundary & Corner Cases >> 38. Title lengths are optimal for search engines (10 - 70 chars)
- Location: tests\seo.spec.js:464:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/agenturen.html", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]: Montag – Freitag 08:00 Uhr bis 17:00 Uhr
    - generic [ref=e4]:
      - link "T +49 7131 6169560" [ref=e5] [cursor=pointer]:
        - /url: tel:+4971316169560
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
              - /url: "#"
          - listitem [ref=e18]:
            - link "Karriere" [ref=e19] [cursor=pointer]:
              - /url: karriere.html
          - listitem [ref=e20]:
            - link "Kontakt" [ref=e21] [cursor=pointer]:
              - /url: kontakt.html
      - generic [ref=e22]:
        - link "Partner werden" [ref=e23] [cursor=pointer]:
          - /url: "#partner-form"
        - link "VP-Portal" [ref=e24] [cursor=pointer]:
          - /url: https://vp.alpha-energie.de
        - link "B2B-Portal" [ref=e25] [cursor=pointer]:
          - /url: b2b-portal.html
  - main [ref=e26]:
    - generic [ref=e27]:
      - generic:
        - generic:
          - generic: a
          - generic: €
      - generic:
        - img "Agenturkooperation der Alpha Energie GmbH"
      - generic [ref=e29]:
        - generic [ref=e30]: Für Door2Door Teams | Strukturvertriebe | Versicherungsmakler
        - 'heading "Skaliere deine Agentur: Höchste Provisionen pro Stromvertrag ohne eigenes Backoffice" [level=1] [ref=e31]':
          - text: "Skaliere deine Agentur:"
          - text: Höchste Provisionen pro Stromvertrag
          - text: ohne eigenes Backoffice
        - paragraph [ref=e32]: Optimieren Sie die Energiekosten Ihrer Kunden und sichern Sie sich als Agentur erstklassige Zusatzprovisionen. Volldigital, flexibel und auf Wunsch komplett unter Ihrer eigenen Marke.
        - list [ref=e33]:
          - listitem [ref=e34]:
            - generic [ref=e35]: ✓
            - generic [ref=e36]: Zusätzliche Einnahmequellen & hohe Provisionen
          - listitem [ref=e37]:
            - generic [ref=e38]: ✓
            - generic [ref=e39]: Einfache Prozesse & digitale Abwicklung (Portal/API)
          - listitem [ref=e40]:
            - generic [ref=e41]: ✓
            - generic [ref=e42]: Nachhaltigkeit & grüne Energie für Ihre Kunden
          - listitem [ref=e43]:
            - generic [ref=e44]: ✓
            - generic [ref=e45]: White-Label-Lösungen zur Stärkung der eigenen Marke
        - generic [ref=e46]:
          - link "Jetzt Partner-Agentur werden (2 Minuten)" [ref=e47] [cursor=pointer]:
            - /url: "#partner-form"
          - link "Kostenlose API/Portal-Anbindung sichern" [ref=e48] [cursor=pointer]:
            - /url: "#partner-form"
    - generic [ref=e51]:
      - generic [ref=e52]:
        - generic [ref=e53]: Unser Mehrwert
        - heading "Unser B2B-Portal für Ihren Agenturerfolg" [level=2] [ref=e54]
        - paragraph [ref=e55]:
          - text: Wir bieten Ihnen ein Portal mit sehr vielen Funktionen
          - strong [ref=e56]: UND
          - text: wir bauen individuelle Funktionen ein, damit Ihnen als Agentur bzw. Vertriebspartner der Arbeitsalltag um ein Vielfaches erleichtert wird!
        - list [ref=e57]:
          - listitem [ref=e58]:
            - generic [ref=e59]: ✓
            - generic [ref=e60]:
              - strong [ref=e61]: "Individuelle Anpassungen:"
              - text: Exakt auf Ihren Workflow zugeschnitten.
          - listitem [ref=e62]:
            - generic [ref=e63]: ✓
            - generic [ref=e64]:
              - strong [ref=e65]: "KI-Funktionen:"
              - text: Intelligente Automatisierung und Datenanalyse für maximale Effizienz.
      - generic [ref=e66]:
        - generic [ref=e67]:
          - img [ref=e69]
          - generic [ref=e71]:
            - strong [ref=e72]: Interaktive Vorschau
            - generic [ref=e73]: Klicken Sie links im Portal-Bild auf die Menüpunkte, um die Funktionen zu testen.
        - iframe [ref=e75]
    - generic [ref=e78]:
      - generic [ref=e79]:
        - generic [ref=e80]: 150.000€+
        - generic [ref=e81]: Zusatz-Umsatz pro Monat
        - generic [ref=e82]: ∅ Durchschnittliche aktive Agentur
      - generic [ref=e83]:
        - generic [ref=e84]: 800+
        - generic [ref=e85]: Abschlüsse pro Monat
        - generic [ref=e86]: Top-Agenturen Performance
      - generic [ref=e87]:
        - generic [ref=e88]: < 5 Min.
        - generic [ref=e89]: Abwicklungszeit
        - generic [ref=e90]: Tarifvergleich & Abschluss vollautomatisiert
    - generic [ref=e92]:
      - heading "Maßgeschneiderte Lösungen für Ihre Branche" [level=2] [ref=e93]
      - generic [ref=e94]:
        - generic [ref=e95]:
          - generic [ref=e96]: "1"
          - heading "Versicherungsmakler" [level=3] [ref=e97]
          - paragraph [ref=e98]: Nutzen Sie den jährlichen Beratungsanlass Ihrer Kunden für einen kostenfreien Strom- und Gasvergleich. Mit Alpha Energie erweitern Sie Ihr Serviceportfolio nahtlos und sichern sich attraktive Abschlussprovisionen. Die Abwicklung erfolgt papierlos in wenigen Minuten – so bleibt mehr Zeit für Ihr Kerngeschäft.
        - generic [ref=e99]:
          - generic [ref=e100]: "2"
          - heading "Finanzagenturen" [level=3] [ref=e101]
          - paragraph [ref=e102]: Optimieren Sie die laufenden Fixkosten Ihrer Mandanten direkt im Zuge einer Finanzierungs- oder Vermögensplanung. Jede Senkung der Energiekosten erhöht die verfügbare Liquidität Ihrer Kunden und verbessert deren Bonität. Profitieren Sie von einer schnellen, wöchentlich abrufbaren Provisionszahlung und stärken Sie Ihre Position als ganzheitlicher Finanzbegleiter.
        - generic [ref=e103]:
          - generic [ref=e104]: "3"
          - heading "Hausverwaltungen" [level=3] [ref=e105]
          - paragraph [ref=e106]: Vereinfachen Sie die Zählerverwaltung bei Leerständen und Mieterwechseln über unser zentrales Partnerportal. Durch die Bündelung von Allgemeinstrom- und Gassammelverträgen senken Sie die Nebenkosten Ihrer Liegenschaften spürbar. Profitieren Sie von Sonderkonditionen und verbessern Sie gleichzeitig die ESG-Bilanz Ihres Immobilienportfolios durch 100% grüne Energie.
    - generic [ref=e108]:
      - generic [ref=e109]:
        - generic [ref=e110]: Ertrags-Kalkulator
        - heading "Berechnen Sie das Zusatzpotenzial Ihrer Agentur" [level=2] [ref=e111]
        - paragraph [ref=e112]: Wählen Sie die erwartete Anzahl an Kundenwechseln pro Monat aus und sehen Sie Ihr zusätzliches Einkommenspotenzial.
      - generic [ref=e113]:
        - generic [ref=e114]:
          - generic [ref=e115]:
            - generic [ref=e116]: "Kundenwechsel pro Monat:"
            - generic [ref=e117]: "20"
          - 'slider "Kundenwechsel pro Monat: 20" [ref=e118] [cursor=pointer]': "500"
          - generic [ref=e119]:
            - generic [ref=e120]: 100 Verträge
            - generic [ref=e121]: 1000 Verträge
        - generic [ref=e122]:
          - generic [ref=e123]:
            - generic [ref=e124]: Einsteiger-Status
            - generic [ref=e125]:
              - text: Nächster Bonus ab
              - strong [ref=e126]: "30"
              - text: Verträgen!
          - generic [ref=e127]:
            - generic [ref=e130]: "300"
            - generic [ref=e132]: "700"
        - generic [ref=e133]:
          - generic [ref=e134]:
            - generic [ref=e135]: Sofort-Provision
            - paragraph [ref=e136]: "Wir rechnen hier mit unserer Durchschnittsprovision für Privatkunden: ca. 250 € pro Vertrag bei einem durchschnittlichen Verbrauch von 2.000 kWh. Auszahlung erfolgt wöchentlich."
            - generic [ref=e137]: 5.000 €
            - generic [ref=e138]: wöchentlich abrufbar
          - generic [ref=e139]:
            - generic [ref=e140]:
              - text: Monatsgesamtverdienst
              - generic [ref=e142] [cursor=pointer]: i
            - generic [ref=e143]: 5.000 €
            - generic [ref=e144]: kalkulatorisch / monat
        - link "Jetzt Provision sichern" [ref=e146] [cursor=pointer]:
          - /url: "#partner-form"
    - generic [ref=e149]:
      - generic [ref=e150]:
        - heading "Einfache API-Prozesse & flexible White-Label-Modelle" [level=2] [ref=e151]
        - paragraph [ref=e152]: Mit Alpha Energie erweitern Sie Ihr Geschäftsmodell ohne administrativen Aufwand oder technologische Hürden. Unser volldigitales Partnerportal und unsere modernen API-Schnittstellen ermöglichen einen vollautomatisierten Tarifvergleich und schnellen Vertragsabschluss in Echtzeit. Alle Prozesse laufen papierlos und sind perfekt auf Tablets für Kundengespräche vor Ort oder die Online-Beratung optimiert.
        - paragraph [ref=e153]:
          - text: Zusätzlich unterstützen wir Agenturen und ihre Vertriebspartner mit modernsten
          - strong [ref=e154]: KI-gestützten Tools
          - text: ", um den Alltag zu erleichtern. So automatisieren wir administrative Aufgaben, damit Sie sich mehr auf Ihr Kerngeschäft und die Beratung Ihrer Kunden konzentrieren können."
        - paragraph [ref=e155]: "Dank unserer flexiblen White-Label-Lösungen treten Sie gegenüber Ihren Kunden stets unter Ihrem guten Namen auf. Wir bleiben im Hintergrund als zuverlässiger Abwicklungspartner. Zudem punkten Sie bei Ihren Mandanten mit Nachhaltigkeit: Wir bieten ausschließlich zertifizierten Ökostrom und klimaneutrale Erdgastarife von renommierten Anbietern zur spürbaren Senkung des CO2-Fußabdrucks."
      - generic [ref=e156]:
        - heading "Ihre Vorteile als Partner-Agentur:" [level=3] [ref=e157]
        - list [ref=e158]:
          - listitem [ref=e159]:
            - generic [ref=e160]: ✓
            - generic [ref=e161]: Zusätzliche Einnahmequellen & hohe Provisionen
          - listitem [ref=e162]:
            - generic [ref=e163]: ✓
            - generic [ref=e164]: Einfache, digitale Abwicklung via Portal oder API-Schnittstelle
          - listitem [ref=e165]:
            - generic [ref=e166]: ✓
            - generic [ref=e167]: KI-gestützte Tools zur Erleichterung Ihres administrativen Alltags
          - listitem [ref=e168]:
            - generic [ref=e169]: ✓
            - generic [ref=e170]: Zertifizierte grüne Energie- und Telekommunikationstarife
          - listitem [ref=e171]:
            - generic [ref=e172]: ✓
            - generic [ref=e173]: White-Label-Portal zur Stärkung der eigenen Kundenbindung
          - listitem [ref=e174]:
            - generic [ref=e175]: ✓
            - generic [ref=e176]: Persönlicher Key-Account-Support & kostenfreie Schulungen
    - generic [ref=e178]:
      - generic [ref=e179]:
        - generic [ref=e180]: Erfolgsgeschichten
        - heading "Was unsere Partner-Agenturen sagen" [level=2] [ref=e181]
        - paragraph [ref=e182]: Echte Erfahrungen, verifizierte Umsätze und reibungslose Kooperationen aus der täglichen Praxis.
      - generic [ref=e183]:
        - generic [ref=e185]:
          - generic [ref=e186]:
            - generic [ref=e187]: TB
            - generic [ref=e188]:
              - heading "Thomas B." [level=3] [ref=e189]
              - text: Freier Versicherungsmakler
          - generic [ref=e190]:
            - generic [ref=e191]: Branchen-Performance
            - generic [ref=e192]: 30 – 50 Verträge / Monat
            - generic [ref=e193]: "Zusatzverdienst: Wöchentlich ausgezahlt"
          - paragraph [ref=e194]: "\"Wir prüfen bei jedem Sachversicherungs-Check auch die Strom- und Gasverträge. Die Kunden sparen bares Geld, und für unsere Agentur ist es dank der schnellen Abwicklung im Portal ein erstklassiger Zusatzverdienst von knapp 12.000€ im Monat.\""
        - generic [ref=e196]:
          - generic [ref=e197]:
            - generic [ref=e198]: SW
            - generic [ref=e199]:
              - heading "Sabine W." [level=3] [ref=e200]
              - text: Baufinanzierungsberatung
          - generic [ref=e201]:
            - generic [ref=e202]: Branchen-Performance
            - generic [ref=e203]: 20 – 40 Verträge / Monat
            - generic [ref=e204]: "Co-Branding: White-Label-Portal"
          - paragraph [ref=e205]: "\"Die Optimierung von Energietarifen erhöht die freie Liquidität unserer Kunden bei Finanzierungen. Dank der White-Label-Option nutzen wir das Portal unter unserem eigenen Logo. Die wöchentlichen Provisionsauszahlungen laufen absolut reibungslos.\""
        - generic [ref=e207]:
          - generic [ref=e208]:
            - generic [ref=e209]: DK
            - generic [ref=e210]:
              - heading "Dieter K." [level=3] [ref=e211]
              - text: Immobilien- & Hausverwaltung
          - generic [ref=e212]:
            - generic [ref=e213]: Branchen-Performance
            - generic [ref=e214]: 100+ Wohneinheiten / Jahr
            - generic [ref=e215]: "Sammeltarife: Leerstand & Allgemeinstrom"
          - paragraph [ref=e216]: "\"Das Portal vereinfacht das Zählermanagement bei Leerstand enorm. Die Umstellung auf Ökostrom spart Eigentümern Kosten und verbessert die CO2-Bilanz unserer Immobilien. Eine absolute Win-Win-Situation für uns.\""
        - generic [ref=e218]:
          - generic [ref=e219]:
            - generic [ref=e220]: MS
            - generic [ref=e221]:
              - heading "Markus S." [level=3] [ref=e222]
              - text: Energie-Strukturvertrieb
          - generic [ref=e223]:
            - generic [ref=e224]: Branchen-Performance
            - generic [ref=e225]: 800+ Verträge / Monat
            - generic [ref=e226]: "Abwicklung: API-Schnittstelle & Portal"
          - paragraph [ref=e227]: "\"Bei unserem Volumen kommt es auf fehlerfreie und schnelle Prozesse an. Dank der API-Anbindung an unser CRM und dem Portal von Alpha Energie wickeln wir monatlich hunderte Verträge effizient ab – und generieren so einen mittleren 6-stelligen Jahresumsatz als reinen Zusatzertrag.\""
    - generic [ref=e230]:
      - generic [ref=e231]:
        - generic [ref=e232]: Partner werden
        - heading "Jetzt Kooperation starten" [level=2] [ref=e233]
        - paragraph [ref=e234]: Registrieren Sie Ihre Agentur kostenlos. Wir melden uns innerhalb von 15 Minuten telefonisch für Ihre Portal-Freischaltung und Schnittstellen-Einrichtung.
      - generic [ref=e235]:
        - generic [ref=e236]:
          - generic [ref=e237]: Vor- und Nachname des Ansprechpartners *
          - textbox "Vor- und Nachname des Ansprechpartners *" [ref=e238]:
            - /placeholder: z.B. Max Mustermann
        - generic [ref=e239]:
          - generic [ref=e240]: E-Mail-Adresse *
          - textbox "E-Mail-Adresse *" [ref=e241]:
            - /placeholder: name@beispiel.de
        - generic [ref=e242]:
          - generic [ref=e243]: Telefonnummer *
          - textbox "Telefonnummer *" [ref=e244]:
            - /placeholder: z.B. 0170 1234567
        - generic [ref=e245]:
          - generic [ref=e246]: Agenturtyp / Branche *
          - generic [ref=e247]:
            - combobox "Agenturtyp / Branche *" [ref=e248] [cursor=pointer]:
              - option "Versicherungsmakler"
              - option "Finanzagentur"
              - option "Immobilien- / Hausverwaltung"
              - option "Sonstige Agentur"
            - generic:
              - img
        - button "Jetzt Partner-Agentur werden (2 Minuten)" [ref=e249] [cursor=pointer]
  - contentinfo [ref=e250]:
    - generic [ref=e251]:
      - generic [ref=e252]:
        - generic [ref=e253]:
          - link "Alpha Energie GmbH" [ref=e254] [cursor=pointer]:
            - /url: index.html
            - img "Alpha Energie GmbH" [ref=e255]
          - paragraph [ref=e256]: Alpha Energie GmbH ist dein kompetenter Begleiter und Berater bei der Energiekostenoptimierung!
          - generic [ref=e257]:
            - link "Facebook" [ref=e258] [cursor=pointer]:
              - /url: "#facebook"
            - link "LinkedIn" [ref=e259] [cursor=pointer]:
              - /url: "#linkedin"
            - link "Instagram" [ref=e260] [cursor=pointer]:
              - /url: "#instagram"
        - generic [ref=e261]:
          - heading "Unternehmen" [level=3] [ref=e262]
          - list [ref=e263]:
            - listitem [ref=e264]:
              - link "Über uns" [ref=e265] [cursor=pointer]:
                - /url: ueber-uns.html
            - listitem [ref=e266]:
              - link "Karriere" [ref=e267] [cursor=pointer]:
                - /url: karriere.html
            - listitem [ref=e268]:
              - link "Kontakt" [ref=e269] [cursor=pointer]:
                - /url: kontakt.html
        - generic [ref=e270]:
          - heading "Lösungen" [level=3] [ref=e271]
          - list [ref=e272]:
            - listitem [ref=e273]:
              - link "Für Vertriebspartner" [ref=e274] [cursor=pointer]:
                - /url: vertriebspartner.html
            - listitem [ref=e275]:
              - link "Für Gewerbekunden" [ref=e276] [cursor=pointer]:
                - /url: gewerbekunden.html
            - listitem [ref=e277]:
              - link "Für Produktgeber" [ref=e278] [cursor=pointer]:
                - /url: produktgeber.html
            - listitem [ref=e279]:
              - link "Für Agenturen" [ref=e280] [cursor=pointer]:
                - /url: agenturen.html
        - generic [ref=e281]:
          - heading "Rechtliches" [level=3] [ref=e282]
          - list [ref=e283]:
            - listitem [ref=e284]:
              - link "Datenschutz" [ref=e285] [cursor=pointer]:
                - /url: datenschutz.html
            - listitem [ref=e286]:
              - link "Impressum" [ref=e287] [cursor=pointer]:
                - /url: impressum.html
            - listitem [ref=e288]:
              - link "Cookie-Einstellungen" [ref=e289] [cursor=pointer]:
                - /url: cookie-einstellungen.html
            - listitem [ref=e290]:
              - link "VP-Portal" [ref=e291] [cursor=pointer]:
                - /url: https://vp.alpha-energie.de
      - paragraph [ref=e293]: © Copyright 2026. Alle Rechte vorbehalten. Alpha Energie GmbH
      - generic [ref=e294]:
        - link "Optionen verwalten" [ref=e295] [cursor=pointer]:
          - /url: cookie-einstellungen.html
        - text: "|"
        - link "Dienste verwalten" [ref=e296] [cursor=pointer]:
          - /url: cookie-einstellungen.html
        - text: "|"
        - link "Einstellungen ansehen" [ref=e297] [cursor=pointer]:
          - /url: cookie-einstellungen.html
  - generic [ref=e299]:
    - heading "Datenschutzeinstellungen" [level=3] [ref=e300]
    - paragraph [ref=e301]:
      - text: Wir verwenden Technologien zur Datenspeicherung, um Ihnen das beste Erlebnis auf unserer Website zu bieten. Einige davon sind essenziell (z.B. für die Grundfunktionen der Website), während andere uns helfen, unsere Website und Ihr Erlebnis zu verbessern. Weitere Informationen finden Sie in unserer
      - link "Datenschutzerklärung" [ref=e302] [cursor=pointer]:
        - /url: datenschutz.html
      - text: .
    - generic [ref=e303]:
      - generic [ref=e304]:
        - button "Alle akzeptieren" [ref=e305] [cursor=pointer]
        - button "Nur Essenzielle" [ref=e306] [cursor=pointer]
      - link "Individuelle Einstellungen anpassen" [ref=e307] [cursor=pointer]:
        - /url: cookie-einstellungen.html
```

# Test source

```ts
  366 |   test.describe('Tier 2: Boundary & Corner Cases', () => {
  367 | 
  368 |     test('26. robots.txt handles request casing', async ({ request }) => {
  369 |       const indexRes = await request.get('/INDEX.HTML');
  370 |       if (indexRes.status() === 200) {
  371 |         // The server is case-insensitive. /ROBOTS.TXT returning 200 (default fallback) or 301/302/404 is acceptable.
  372 |         const res = await request.get('/ROBOTS.TXT');
  373 |         expect([200, 301, 302, 404]).toContain(res.status());
  374 |       } else {
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
> 466 |         await page.goto(`/${pageName}`);
      |                    ^ Error: page.goto: Test timeout of 30000ms exceeded.
  467 |         const title = await page.title();
  468 |         expect(title.length).toBeGreaterThanOrEqual(10);
  469 |         expect(title.length).toBeLessThanOrEqual(70);
  470 |       }
  471 |     });
  472 | 
  473 |     test('39. Description lengths are optimal for search engines (50 - 160 chars)', async ({ page }) => {
  474 |       for (const pageName of indexablePages) {
  475 |         await page.goto(`/${pageName}`);
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
```