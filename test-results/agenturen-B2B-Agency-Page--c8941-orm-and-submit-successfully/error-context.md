# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: agenturen.spec.js >> B2B Agency Page (agenturen.html) >> should validate form and submit successfully
- Location: tests\agenturen.spec.js:61:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('#form-success-container')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('#form-success-container')
    13 × locator resolved to <div id="form-success-container">…</div>
       - unexpected value "hidden"

```

```yaml
- text: Montag – Freitag 08:00 Uhr bis 17:00 Uhr
- link "T +49 7131 6169560":
  - /url: tel:+4971316169560
- link "E info@alpha-energie.de":
  - /url: mailto:info@alpha-energie.de
- banner:
  - link "Alpha Energie GmbH":
    - /url: index.html
    - img "Alpha Energie GmbH"
  - navigation:
    - list:
      - listitem:
        - link "Über uns":
          - /url: ueber-uns.html
      - listitem:
        - link "Lösungen":
          - /url: "#"
      - listitem:
        - link "Karriere":
          - /url: karriere.html
      - listitem:
        - link "Kontakt":
          - /url: kontakt.html
  - link "Partner werden":
    - /url: "#partner-form"
  - link "VP-Portal":
    - /url: https://vp.alpha-energie.de
  - link "B2B-Portal":
    - /url: b2b-portal.html
- main:
  - text: a €
  - img "Agenturkooperation der Alpha Energie GmbH"
  - text: B2B-Partnerschaft • 100% DSGVO-konform • White-Label
  - heading "Die perfekte Portfolio-Erweiterung für Ihre Agentur" [level=1]
  - paragraph: Optimieren Sie die Energiekosten Ihrer Kunden und sichern Sie sich als Versicherungsmakler, Finanzagentur oder Hausverwaltung erstklassige Zusatzprovisionen. Volldigital, flexibel und auf Wunsch komplett unter Ihrer eigenen Marke.
  - list:
    - listitem: ✓ Zusätzliche Einnahmequellen & hohe Provisionen
    - listitem: ✓ Einfache Prozesse & digitale Abwicklung (Portal/API)
    - listitem: ✓ Nachhaltigkeit & grüne Energie für Ihre Kunden
    - listitem: ✓ White-Label-Lösungen zur Stärkung der eigenen Marke
  - link "Jetzt Kooperation starten":
    - /url: "#partner-form"
  - text: 0 € Investition Keine Lizenzgebühren, kein Risiko 100% White-Label-fähig Volle Stärkung Ihrer eigenen Marke < 5 Min. Abwicklungszeit Tarifvergleich & Abschluss vollautomatisiert
  - heading "Maßgeschneiderte Lösungen für Ihre Branche" [level=2]
  - text: "1"
  - heading "Versicherungsmakler" [level=3]
  - paragraph: Nutzen Sie den jährlichen Beratungsanlass Ihrer Kunden für einen kostenfreien Strom- und Gasvergleich. Mit Alpha Energie erweitern Sie Ihr Serviceportfolio nahtlos und sichern sich attraktive Abschluss- sowie dauerhafte, wiederkehrende Bestandsprovisionen. Die Abwicklung erfolgt papierlos in wenigen Minuten – so bleibt mehr Zeit für Ihr Kerngeschäft.
  - text: "2"
  - heading "Finanzagenturen" [level=3]
  - paragraph: Optimieren Sie die laufenden Fixkosten Ihrer Mandanten direkt im Zuge einer Finanzierungs- oder Vermögensplanung. Jede Senkung der Energiekosten erhöht die verfügbare Liquidität Ihrer Kunden und verbessert deren Bonität. Profitieren Sie von einer schnellen, wöchentlich abrufbaren Provisionszahlung und stärken Sie Ihre Position als ganzheitlicher Finanzbegleiter.
  - text: "3"
  - heading "Hausverwaltungen" [level=3]
  - paragraph: Vereinfachen Sie die Zählerverwaltung bei Leerständen und Mieterwechseln über unser zentrales Partnerportal. Durch die Bündelung von Allgemeinstrom- und Gassammelverträgen senken Sie die Nebenkosten Ihrer Liegenschaften spürbar. Profitieren Sie von Sonderkonditionen und verbessern Sie gleichzeitig die ESG-Bilanz Ihres Immobilienportfolios durch 100% grüne Energie.
  - text: Ertrags-Kalkulator
  - heading "Berechnen Sie das Zusatzpotenzial Ihrer Agentur" [level=2]
  - paragraph: Wählen Sie die erwartete Anzahl an Kundenwechseln pro Monat aus und sehen Sie Ihr zusätzliches Einkommenspotenzial.
  - text: "Kundenwechsel pro Monat: 20"
  - 'slider "Kundenwechsel pro Monat: 20"': "20"
  - text: 5 Verträge 100 Verträge Einsteiger-Status Nächster Bonus ab
  - strong: "30"
  - text: Verträgen! 30 70 Sofort-Provision i 3.000 € wöchentlich abrufbar Bestandsprovision i 240 € jährlich (passiv) Monatsgesamtverdienst i 490 € kalkulatorisch / monat
  - link "Jetzt Provision sichern":
    - /url: "#partner-form"
  - heading "Einfache API-Prozesse & flexible White-Label-Modelle" [level=2]
  - paragraph: Mit Alpha Energie erweitern Sie Ihr Geschäftsmodell ohne administrativen Aufwand oder technologische Hürden. Unser volldigitales Partnerportal und unsere modernen API-Schnittstellen ermöglichen einen vollautomatisierten Tarifvergleich und schnellen Vertragsabschluss in Echtzeit. Alle Prozesse laufen papierlos und sind perfekt auf Tablets für Kundengespräche vor Ort oder die Online-Beratung optimiert.
  - paragraph: "Dank unserer flexiblen White-Label-Lösungen treten Sie gegenüber Ihren Kunden stets unter Ihrem guten Namen auf. Wir bleiben im Hintergrund als zuverlässiger Abwicklungspartner. Zudem punkten Sie bei Ihren Mandanten mit Nachhaltigkeit: Wir bieten ausschließlich zertifizierten Ökostrom und klimaneutrale Erdgastarife von renommierten Anbietern zur spürbaren Senkung des CO2-Fußabdrucks."
  - heading "Ihre Vorteile als Partner-Agentur:" [level=3]
  - list:
    - listitem: ✓ Zusätzliche Einnahmequellen & hohe Provisionen
    - listitem: ✓ Einfache, digitale Abwicklung via Portal oder API-Schnittstelle
    - listitem: ✓ Zertifizierte grüne Energie- und Telekommunikationstarife
    - listitem: ✓ White-Label-Portal zur Stärkung der eigenen Kundenbindung
    - listitem: ✓ Persönlicher Key-Account-Support & kostenfreie Schulungen
  - text: Erfolgsgeschichten
  - heading "Was unsere Partner-Agenturen sagen" [level=2]
  - paragraph: Echte Erfahrungen, verifizierte Umsätze und reibungslose Kooperationen aus der täglichen Praxis.
  - text: TB
  - heading "Thomas B." [level=4]
  - text: "Freier Versicherungsmakler Branchen-Performance 30 – 50 Verträge / Monat Zusatzverdienst: Wöchentlich ausgezahlt"
  - paragraph: "\"Wir prüfen bei jedem Sachversicherungs-Check auch die Strom- und Gasverträge. Die Kunden sparen bares Geld, und für unsere Agentur ist es dank der schnellen Abwicklung im Portal ein erstklassiger, wiederkehrender Zusatzverdienst.\""
  - text: SW
  - heading "Sabine W." [level=4]
  - text: "Baufinanzierungsberatung Branchen-Performance 20 – 40 Verträge / Monat Co-Branding: White-Label-Portal"
  - paragraph: "\"Die Optimierung von Energietarifen erhöht die freie Liquidität unserer Kunden bei Finanzierungen. Dank der White-Label-Option nutzen wir das Portal unter unserem eigenen Logo. Die wöchentlichen Provisionsauszahlungen laufen absolut reibungslos.\""
  - text: DK
  - heading "Dieter K." [level=4]
  - text: "Immobilien- & Hausverwaltung Branchen-Performance 100+ Wohneinheiten / Jahr Sammeltarife: Leerstand & Allgemeinstrom"
  - paragraph: "\"Das Portal vereinfacht das Zählermanagement bei Leerstand enorm. Die Umstellung auf Ökostrom spart Eigentümern Kosten und verbessert die CO2-Bilanz unserer Immobilien. Eine absolute Win-Win-Situation für uns.\""
  - text: Partner werden
  - heading "Jetzt Kooperation starten" [level=3]
  - paragraph: Registrieren Sie Ihre Agentur kostenlos. Wir melden uns innerhalb von 15 Minuten telefonisch für Ihre Portal-Freischaltung und Schnittstellen-Einrichtung.
  - text: Vor- und Nachname des Ansprechpartners *
  - textbox "Vor- und Nachname des Ansprechpartners *":
    - /placeholder: z.B. Max Mustermann
    - text: Agentur Alpha e.K.
  - text: E-Mail-Adresse *
  - textbox "E-Mail-Adresse *":
    - /placeholder: name@beispiel.de
    - text: info@agentur-alpha.de
  - text: Telefonnummer *
  - textbox "Telefonnummer *":
    - /placeholder: z.B. 0170 1234567
    - text: 0170 1234567
  - text: Agenturtyp / Branche *
  - combobox "Agenturtyp / Branche *":
    - option "Versicherungsmakler" [selected]
    - option "Finanzagentur"
    - option "Immobilien- / Hausverwaltung"
    - option "Sonstige Agentur"
  - img
  - button "Kostenlos registrieren"
- contentinfo:
  - link "Alpha Energie GmbH":
    - /url: index.html
    - img "Alpha Energie GmbH"
  - paragraph: Alpha Energie GmbH ist dein kompetenter Begleiter und Berater bei der Energiekostenoptimierung!
  - link "Facebook":
    - /url: "#facebook"
  - link "LinkedIn":
    - /url: "#linkedin"
  - link "Instagram":
    - /url: "#instagram"
  - heading "Unternehmen" [level=4]
  - list:
    - listitem:
      - link "Über uns":
        - /url: ueber-uns.html
    - listitem:
      - link "Karriere":
        - /url: karriere.html
    - listitem:
      - link "Kontakt":
        - /url: kontakt.html
  - heading "Lösungen" [level=4]
  - list:
    - listitem:
      - link "Für Vertriebspartner":
        - /url: vertriebspartner.html
    - listitem:
      - link "Für Gewerbekunden":
        - /url: gewerbekunden.html
    - listitem:
      - link "Für Produktgeber":
        - /url: produktgeber.html
    - listitem:
      - link "Für Agenturen":
        - /url: agenturen.html
  - heading "Rechtliches" [level=4]
  - list:
    - listitem:
      - link "Datenschutz":
        - /url: datenschutz.html
    - listitem:
      - link "Impressum":
        - /url: impressum.html
    - listitem:
      - link "Cookie-Einstellungen":
        - /url: cookie-einstellungen.html
    - listitem:
      - link "VP-Portal":
        - /url: https://vp.alpha-energie.de
  - paragraph: © Copyright 2026. Alle Rechte vorbehalten. Alpha Energie GmbH
  - link "Optionen verwalten":
    - /url: "#optionen-verwalten"
  - text: "|"
  - link "Dienste verwalten":
    - /url: "#dienste-verwalten"
  - text: "|"
  - link "Einstellungen ansehen":
    - /url: "#einstellungen-ansehen"
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('B2B Agency Page (agenturen.html)', () => {
  4  |     test.beforeEach(async ({ context, page }) => {
  5  |         await context.addInitScript(() => {
  6  |             window.localStorage.setItem('alpha_consent_status', 'all');
  7  |         });
  8  |         // Go to the landing page
  9  |         await page.goto('http://localhost:3000/agenturen.html');
  10 |     });
  11 | 
  12 |     test('should load page with correct metadata and headers', async ({ page }) => {
  13 |         await expect(page).toHaveTitle(/Für Agenturen & Makler - Alpha Energie GmbH/);
  14 |         
  15 |         // Verify solutions dropdown exists and has the agenturen.html option
  16 |         const dropdownLinks = page.locator('header .dropdown a');
  17 |         await expect(dropdownLinks).toHaveCount(4);
  18 |         await expect(dropdownLinks.nth(3)).toHaveAttribute('href', 'agenturen.html');
  19 |         await expect(dropdownLinks.nth(3)).toHaveText('Für Agenturen');
  20 |     });
  21 | 
  22 |     test('should dynamically calculate commission values via slider', async ({ page }) => {
  23 |         // Check default values at 20 contracts
  24 |         const sliderVal = page.locator('#slider-val');
  25 |         const sofortProv = page.locator('#sofort-provision');
  26 |         const bestandsProv = page.locator('#bestands-provision');
  27 |         const gesamtProv = page.locator('#gesamt-provision');
  28 |         const statusBadge = page.locator('#status-tier-badge');
  29 |         
  30 |         await expect(sliderVal).toHaveText('20');
  31 |         await expect(sofortProv).toHaveText('3.000');
  32 |         await expect(bestandsProv).toHaveText('240');
  33 |         await expect(gesamtProv).toHaveText('490');
  34 |         await expect(statusBadge).toHaveText('Einsteiger-Status');
  35 |         
  36 |         // Move slider to 50 contracts
  37 |         const slider = page.locator('#contract-slider');
  38 |         await slider.focus();
  39 |         
  40 |         // Use fill to set the slider value directly to trigger events
  41 |         await slider.fill('50');
  42 |         
  43 |         // Check updated values at 50 contracts (sofort: 50 * 150 = 7500, bestand: 50 * 12 = 600, gesamt: 50 * 24.5 = 1225)
  44 |         await expect(sliderVal).toHaveText('50');
  45 |         await expect(sofortProv).toHaveText('7.500');
  46 |         await expect(bestandsProv).toHaveText('600');
  47 |         await expect(gesamtProv).toHaveText('1.225');
  48 |         await expect(statusBadge).toHaveText('Profi-Status');
  49 |         
  50 |         // Move slider to 80 contracts
  51 |         await slider.fill('80');
  52 |         
  53 |         // Check updated values at 80 contracts (sofort: 80 * 150 = 12000, bestand: 80 * 12 = 960, gesamt: 80 * 24.5 = 1960)
  54 |         await expect(sliderVal).toHaveText('80');
  55 |         await expect(sofortProv).toHaveText('12.000');
  56 |         await expect(bestandsProv).toHaveText('960');
  57 |         await expect(gesamtProv).toHaveText('1.960');
  58 |         await expect(statusBadge).toHaveText('Elite-Status');
  59 |     });
  60 | 
  61 |     test('should validate form and submit successfully', async ({ page }) => {
  62 |         const form = page.locator('#application-form');
  63 |         const submitBtn = form.locator('button[type="submit"]');
  64 |         
  65 |         // Trigger empty form validation
  66 |         await submitBtn.click();
  67 |         
  68 |         // Check validation errors are visible
  69 |         const errors = form.locator('.error-msg');
  70 |         await expect(errors.nth(0)).toBeVisible();
  71 |         await expect(errors.nth(1)).toBeVisible();
  72 |         await expect(errors.nth(2)).toBeVisible();
  73 |         await expect(errors.nth(3)).toBeVisible();
  74 |         
  75 |         // Fill form fields
  76 |         await page.locator('#fullName').fill('Agentur Alpha e.K.');
  77 |         await page.locator('#email').fill('info@agentur-alpha.de');
  78 |         await page.locator('#phone').fill('0170 1234567');
  79 |         await page.locator('#experience').selectOption('Versicherungsmakler');
  80 |         
  81 |         // Submit valid form
  82 |         await submitBtn.click();
  83 |         
  84 |         // Success container should be shown
  85 |         const successContainer = page.locator('#form-success-container');
> 86 |         await expect(successContainer).toBeVisible();
     |                                        ^ Error: expect(locator).toBeVisible() failed
  87 |         
  88 |         // Success phone number matches the inputted phone number
  89 |         const successPhone = page.locator('#success-phone');
  90 |         await expect(successPhone).toHaveText('0170 1234567');
  91 |         
  92 |         // Form should be hidden
  93 |         await expect(form).not.toBeVisible();
  94 |     });
  95 | });
  96 | 
```