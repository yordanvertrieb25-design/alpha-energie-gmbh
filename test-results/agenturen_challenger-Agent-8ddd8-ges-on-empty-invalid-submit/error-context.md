# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: agenturen_challenger.spec.js >> Agenturen Page - Challenger Verification >> should validate form and show correct error messages on empty/invalid submit
- Location: tests\agenturen_challenger.spec.js:81:5

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
    - text: Max Mustermann
  - text: E-Mail-Adresse *
  - textbox "E-Mail-Adresse *":
    - /placeholder: name@beispiel.de
    - text: max@example.com
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
  44  |         await expect(statusBadge).toHaveText('Einsteiger-Status');
  45  |         await expect(nextBonusText).toHaveText('Nächster Bonus ab 30 Verträgen!');
  46  |     });
  47  | 
  48  |     test('should verify calculator at boundary input 100 (maximum)', async ({ page }) => {
  49  |         const slider = page.locator('#contract-slider');
  50  |         const sliderVal = page.locator('#slider-val');
  51  |         const sofortProv = page.locator('#sofort-provision');
  52  |         const bestandsProv = page.locator('#bestands-provision');
  53  |         const gesamtProv = page.locator('#gesamt-provision');
  54  |         const statusBadge = page.locator('#status-tier-badge');
  55  |         const progressBar = page.locator('#status-progress-bar');
  56  |         const nextBonusText = page.locator('#status-tier-next-bonus');
  57  | 
  58  |         // Focus and set slider value to 100
  59  |         await slider.focus();
  60  |         await slider.fill('100');
  61  | 
  62  |         // Verify slider value is 100
  63  |         await expect(sliderVal).toHaveText('100');
  64  | 
  65  |         // Verify mathematically correct calculations
  66  |         // sofort: 100 * 150 = 15.000
  67  |         // bestand: 100 * 12 = 1.200
  68  |         // gesamt: Math.round(100 * 24.50) = 2.450
  69  |         await expect(sofortProv).toHaveText('15.000');
  70  |         await expect(bestandsProv).toHaveText('1.200');
  71  |         await expect(gesamtProv).toHaveText('2.450');
  72  | 
  73  |         // Verify status progress bar width is 100%
  74  |         await expect(progressBar).toHaveAttribute('style', 'width: 100%;');
  75  | 
  76  |         // Verify status badge and next bonus text
  77  |         await expect(statusBadge).toHaveText('Elite-Status');
  78  |         await expect(nextBonusText).toHaveText('+20% Premium-Provisionsstufe aktiv!');
  79  |     });
  80  | 
  81  |     test('should validate form and show correct error messages on empty/invalid submit', async ({ page }) => {
  82  |         const form = page.locator('#application-form');
  83  |         const submitBtn = form.locator('button[type="submit"]');
  84  | 
  85  |         // Trigger empty form validation
  86  |         await submitBtn.click();
  87  | 
  88  |         // Check validation errors are visible and contain correct text
  89  |         const nameError = form.locator('#fullName ~ .error-msg');
  90  |         const emailError = form.locator('#email ~ .error-msg');
  91  |         const phoneError = form.locator('#phone ~ .error-msg');
  92  |         const experienceError = form.locator('#experience ~ .error-msg');
  93  | 
  94  |         await expect(nameError).toBeVisible();
  95  |         await expect(nameError).toHaveText('Bitte geben Sie Ihren Vor- und Nachnamen an.');
  96  | 
  97  |         await expect(emailError).toBeVisible();
  98  |         await expect(emailError).toHaveText('Geben Sie eine gültige E-Mail-Adresse ein.');
  99  | 
  100 |         await expect(phoneError).toBeVisible();
  101 |         await expect(phoneError).toHaveText('Ungültiges Format. Beispiel: 0170 1234567');
  102 | 
  103 |         // For the select experience, wait, the error-msg is inside parent div, let's verify if experience ~ .error-msg works or if it's experience's parent.
  104 |         // In agenturen.html:
  105 |         // <div>
  106 |         //     <label for="experience" class="form-label">...</label>
  107 |         //     <div class="select-wrapper">
  108 |         //         <select id="experience" ...>...</select>
  109 |         //         <div class="select-arrow">...</div>
  110 |         //     </div>
  111 |         //     <div class="error-msg">Bitte wählen Sie Ihre Branche aus.</div>
  112 |         // </div>
  113 |         // So the error message is a sibling of .select-wrapper, not #experience directly.
  114 |         const experienceErrorMsg = form.locator('div:has(#experience) > .error-msg');
  115 |         await expect(experienceErrorMsg).toBeVisible();
  116 |         await expect(experienceErrorMsg).toHaveText('Bitte wählen Sie Ihre Vertriebserfahrung aus.');
  117 | 
  118 |         // Test invalid email
  119 |         await page.locator('#fullName').fill('Max Mustermann');
  120 |         await page.locator('#email').fill('not-an-email');
  121 |         await page.locator('#phone').fill('0170 1234567');
  122 |         await page.locator('#experience').selectOption('Versicherungsmakler');
  123 | 
  124 |         await submitBtn.click();
  125 |         await expect(emailError).toBeVisible();
  126 |         await expect(nameError).not.toBeVisible();
  127 |         await expect(phoneError).not.toBeVisible();
  128 |         await expect(experienceErrorMsg).not.toBeVisible();
  129 | 
  130 |         // Test invalid phone
  131 |         await page.locator('#email').fill('max@example.com');
  132 |         await page.locator('#phone').fill('123'); // too short / wrong format
  133 | 
  134 |         await submitBtn.click();
  135 |         await expect(phoneError).toBeVisible();
  136 |         await expect(emailError).not.toBeVisible();
  137 | 
  138 |         // Test valid submission transitions to success message
  139 |         await page.locator('#phone').fill('0170 1234567');
  140 |         await submitBtn.click();
  141 | 
  142 |         // Success container should be shown and form hidden
  143 |         const successContainer = page.locator('#form-success-container');
> 144 |         await expect(successContainer).toBeVisible();
      |                                        ^ Error: expect(locator).toBeVisible() failed
  145 |         await expect(form).not.toBeVisible();
  146 | 
  147 |         // Success phone number matches input
  148 |         const successPhone = page.locator('#success-phone');
  149 |         await expect(successPhone).toHaveText('0170 1234567');
  150 |     });
  151 | 
  152 |     test('should verify mobile responsiveness and no horizontal overflow at 320px viewport', async ({ page }) => {
  153 |         // Set viewport size to 320px width
  154 |         await page.setViewportSize({ width: 320, height: 600 });
  155 | 
  156 |         // Let layout adjust
  157 |         await page.waitForTimeout(500);
  158 | 
  159 |         // Check if there is any horizontal scroll/overflow
  160 |         const overflowResult = await page.evaluate(() => {
  161 |             const documentWidth = document.documentElement.scrollWidth;
  162 |             const viewportWidth = window.innerWidth;
  163 |             
  164 |             // Find all elements that overflow the viewport horizontally
  165 |             const overflowingElements = [];
  166 |             const allElements = document.querySelectorAll('*');
  167 |             for (const el of allElements) {
  168 |                 const rect = el.getBoundingClientRect();
  169 |                 if (rect.right > viewportWidth + 1 || rect.left < -1) {
  170 |                     overflowingElements.push({
  171 |                         tagName: el.tagName,
  172 |                         id: el.id,
  173 |                         className: el.className,
  174 |                         right: rect.right,
  175 |                         left: rect.left,
  176 |                         viewportWidth
  177 |                     });
  178 |                 }
  179 |             }
  180 |             
  181 |             return {
  182 |                 documentWidth,
  183 |                 viewportWidth,
  184 |                 hasOverflow: documentWidth > viewportWidth,
  185 |                 overflowingElements: overflowingElements.slice(0, 10) // Limit output
  186 |             };
  187 |         });
  188 | 
  189 |         console.log('Mobile overflow evaluation at 320px:', overflowResult);
  190 |         expect(overflowResult.hasOverflow).toBe(false);
  191 |     });
  192 | });
  193 | 
```