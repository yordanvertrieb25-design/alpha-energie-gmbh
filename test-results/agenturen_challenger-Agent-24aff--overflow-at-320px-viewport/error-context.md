# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: agenturen_challenger.spec.js >> Agenturen Page - Challenger Verification >> should verify mobile responsiveness and no horizontal overflow at 320px viewport
- Location: tests\agenturen_challenger.spec.js:152:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
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
      - button "Menu" [ref=e12] [cursor=pointer]
      - navigation:
        - list [ref=e16]:
          - listitem [ref=e17]:
            - link "Über uns" [ref=e18] [cursor=pointer]:
              - /url: ueber-uns.html
          - listitem [ref=e19]:
            - link "Lösungen" [ref=e20] [cursor=pointer]:
              - /url: "#"
          - listitem [ref=e21]:
            - link "Karriere" [ref=e22] [cursor=pointer]:
              - /url: karriere.html
          - listitem [ref=e23]:
            - link "Kontakt" [ref=e24] [cursor=pointer]:
              - /url: kontakt.html
  - main [ref=e25]:
    - generic [ref=e26]:
      - generic:
        - img "Agenturkooperation der Alpha Energie GmbH"
      - generic [ref=e28]:
        - generic [ref=e29]: B2B-Partnerschaft • 100% DSGVO-konform • White-Label
        - heading "Die perfekte Portfolio-Erweiterung für Ihre Agentur" [level=1] [ref=e30]
        - paragraph [ref=e31]: Optimieren Sie die Energiekosten Ihrer Kunden und sichern Sie sich als Versicherungsmakler, Finanzagentur oder Hausverwaltung erstklassige Zusatzprovisionen. Volldigital, flexibel und auf Wunsch komplett unter Ihrer eigenen Marke.
        - list [ref=e32]:
          - listitem [ref=e33]:
            - generic [ref=e34]: ✓
            - generic [ref=e35]: Zusätzliche Einnahmequellen & hohe Provisionen
          - listitem [ref=e36]:
            - generic [ref=e37]: ✓
            - generic [ref=e38]: Einfache Prozesse & digitale Abwicklung (Portal/API)
          - listitem [ref=e39]:
            - generic [ref=e40]: ✓
            - generic [ref=e41]: Nachhaltigkeit & grüne Energie für Ihre Kunden
          - listitem [ref=e42]:
            - generic [ref=e43]: ✓
            - generic [ref=e44]: White-Label-Lösungen zur Stärkung der eigenen Marke
        - link "Jetzt Kooperation starten" [ref=e45] [cursor=pointer]:
          - /url: "#partner-form"
    - generic [ref=e48]:
      - generic [ref=e49]:
        - generic [ref=e50]: 0 €
        - generic [ref=e51]: Investition
        - generic [ref=e52]: Keine Lizenzgebühren, kein Risiko
      - generic [ref=e53]:
        - generic [ref=e54]: 100%
        - generic [ref=e55]: White-Label-fähig
        - generic [ref=e56]: Volle Stärkung Ihrer eigenen Marke
      - generic [ref=e57]:
        - generic [ref=e58]: < 5 Min.
        - generic [ref=e59]: Abwicklungszeit
        - generic [ref=e60]: Tarifvergleich & Abschluss vollautomatisiert
    - generic [ref=e62]:
      - heading "Maßgeschneiderte Lösungen für Ihre Branche" [level=2] [ref=e63]
      - generic [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]: "1"
          - heading "Versicherungsmakler" [level=3] [ref=e67]
          - paragraph [ref=e68]: Nutzen Sie den jährlichen Beratungsanlass Ihrer Kunden für einen kostenfreien Strom- und Gasvergleich. Mit Alpha Energie erweitern Sie Ihr Serviceportfolio nahtlos und sichern sich attraktive Abschluss- sowie dauerhafte, wiederkehrende Bestandsprovisionen. Die Abwicklung erfolgt papierlos in wenigen Minuten – so bleibt mehr Zeit für Ihr Kerngeschäft.
        - generic [ref=e69]:
          - generic [ref=e70]: "2"
          - heading "Finanzagenturen" [level=3] [ref=e71]
          - paragraph [ref=e72]: Optimieren Sie die laufenden Fixkosten Ihrer Mandanten direkt im Zuge einer Finanzierungs- oder Vermögensplanung. Jede Senkung der Energiekosten erhöht die verfügbare Liquidität Ihrer Kunden und verbessert deren Bonität. Profitieren Sie von einer schnellen, wöchentlich abrufbaren Provisionszahlung und stärken Sie Ihre Position als ganzheitlicher Finanzbegleiter.
        - generic [ref=e73]:
          - generic [ref=e74]: "3"
          - heading "Hausverwaltungen" [level=3] [ref=e75]
          - paragraph [ref=e76]: Vereinfachen Sie die Zählerverwaltung bei Leerständen und Mieterwechseln über unser zentrales Partnerportal. Durch die Bündelung von Allgemeinstrom- und Gassammelverträgen senken Sie die Nebenkosten Ihrer Liegenschaften spürbar. Profitieren Sie von Sonderkonditionen und verbessern Sie gleichzeitig die ESG-Bilanz Ihres Immobilienportfolios durch 100% grüne Energie.
    - generic [ref=e78]:
      - generic [ref=e79]:
        - generic [ref=e80]: Ertrags-Kalkulator
        - heading "Berechnen Sie das Zusatzpotenzial Ihrer Agentur" [level=2] [ref=e81]
        - paragraph [ref=e82]: Wählen Sie die erwartete Anzahl an Kundenwechseln pro Monat aus und sehen Sie Ihr zusätzliches Einkommenspotenzial.
      - generic [ref=e83]:
        - generic [ref=e84]:
          - generic [ref=e85]:
            - generic [ref=e86]: "Kundenwechsel pro Monat:"
            - generic [ref=e87]: "20"
          - 'slider "Kundenwechsel pro Monat: 20" [ref=e88] [cursor=pointer]': "20"
          - generic [ref=e89]:
            - generic [ref=e90]: 5 Verträge
            - generic [ref=e91]: 100 Verträge
        - generic [ref=e92]:
          - generic [ref=e93]:
            - generic [ref=e94]: Einsteiger-Status
            - generic [ref=e95]:
              - text: Nächster Bonus ab
              - strong [ref=e96]: "30"
              - text: Verträgen!
          - generic [ref=e97]:
            - generic [ref=e100]: "30"
            - generic [ref=e102]: "70"
        - generic [ref=e103]:
          - generic [ref=e104]:
            - generic [ref=e105]:
              - text: Sofort-Provision
              - generic [ref=e107] [cursor=pointer]: i
            - generic [ref=e108]: 3.000 €
            - generic [ref=e109]: wöchentlich abrufbar
          - generic [ref=e110]:
            - generic [ref=e111]:
              - text: Bestandsprovision
              - generic [ref=e113] [cursor=pointer]: i
            - generic [ref=e114]: 240 €
            - generic [ref=e115]: jährlich (passiv)
          - generic [ref=e116]:
            - generic [ref=e117]:
              - text: Monatsgesamtverdienst
              - generic [ref=e119] [cursor=pointer]: i
            - generic [ref=e120]: 490 €
            - generic [ref=e121]: kalkulatorisch / monat
        - link "Jetzt Provision sichern" [ref=e123] [cursor=pointer]:
          - /url: "#partner-form"
    - generic [ref=e125]:
      - generic [ref=e126]:
        - heading "Einfache API-Prozesse & flexible White-Label-Modelle" [level=2] [ref=e127]
        - paragraph [ref=e128]: Mit Alpha Energie erweitern Sie Ihr Geschäftsmodell ohne administrativen Aufwand oder technologische Hürden. Unser volldigitales Partnerportal und unsere modernen API-Schnittstellen ermöglichen einen vollautomatisierten Tarifvergleich und schnellen Vertragsabschluss in Echtzeit. Alle Prozesse laufen papierlos und sind perfekt auf Tablets für Kundengespräche vor Ort oder die Online-Beratung optimiert.
        - paragraph [ref=e129]: "Dank unserer flexiblen White-Label-Lösungen treten Sie gegenüber Ihren Kunden stets unter Ihrem guten Namen auf. Wir bleiben im Hintergrund als zuverlässiger Abwicklungspartner. Zudem punkten Sie bei Ihren Mandanten mit Nachhaltigkeit: Wir bieten ausschließlich zertifizierten Ökostrom und klimaneutrale Erdgastarife von renommierten Anbietern zur spürbaren Senkung des CO2-Fußabdrucks."
      - generic [ref=e130]:
        - heading "Ihre Vorteile als Partner-Agentur:" [level=3] [ref=e131]
        - list [ref=e132]:
          - listitem [ref=e133]:
            - generic [ref=e134]: ✓
            - generic [ref=e135]: Zusätzliche Einnahmequellen & hohe Provisionen
          - listitem [ref=e136]:
            - generic [ref=e137]: ✓
            - generic [ref=e138]: Einfache, digitale Abwicklung via Portal oder API-Schnittstelle
          - listitem [ref=e139]:
            - generic [ref=e140]: ✓
            - generic [ref=e141]: Zertifizierte grüne Energie- und Telekommunikationstarife
          - listitem [ref=e142]:
            - generic [ref=e143]: ✓
            - generic [ref=e144]: White-Label-Portal zur Stärkung der eigenen Kundenbindung
          - listitem [ref=e145]:
            - generic [ref=e146]: ✓
            - generic [ref=e147]: Persönlicher Key-Account-Support & kostenfreie Schulungen
    - generic [ref=e149]:
      - generic [ref=e150]:
        - generic [ref=e151]: Erfolgsgeschichten
        - heading "Was unsere Partner-Agenturen sagen" [level=2] [ref=e152]
        - paragraph [ref=e153]: Echte Erfahrungen, verifizierte Umsätze und reibungslose Kooperationen aus der täglichen Praxis.
      - generic [ref=e154]:
        - generic [ref=e156]:
          - generic [ref=e157]:
            - generic [ref=e158]: TB
            - generic [ref=e159]:
              - heading "Thomas B." [level=4] [ref=e160]
              - text: Freier Versicherungsmakler
          - generic [ref=e161]:
            - generic [ref=e162]: Branchen-Performance
            - generic [ref=e163]: 30 – 50 Verträge / Monat
            - generic [ref=e164]: "Zusatzverdienst: Wöchentlich ausgezahlt"
          - paragraph [ref=e165]: "\"Wir prüfen bei jedem Sachversicherungs-Check auch die Strom- und Gasverträge. Die Kunden sparen bares Geld, und für unsere Agentur ist es dank der schnellen Abwicklung im Portal ein erstklassiger, wiederkehrender Zusatzverdienst.\""
        - generic [ref=e167]:
          - generic [ref=e168]:
            - generic [ref=e169]: SW
            - generic [ref=e170]:
              - heading "Sabine W." [level=4] [ref=e171]
              - text: Baufinanzierungsberatung
          - generic [ref=e172]:
            - generic [ref=e173]: Branchen-Performance
            - generic [ref=e174]: 20 – 40 Verträge / Monat
            - generic [ref=e175]: "Co-Branding: White-Label-Portal"
          - paragraph [ref=e176]: "\"Die Optimierung von Energietarifen erhöht die freie Liquidität unserer Kunden bei Finanzierungen. Dank der White-Label-Option nutzen wir das Portal unter unserem eigenen Logo. Die wöchentlichen Provisionsauszahlungen laufen absolut reibungslos.\""
        - generic [ref=e178]:
          - generic [ref=e179]:
            - generic [ref=e180]: DK
            - generic [ref=e181]:
              - heading "Dieter K." [level=4] [ref=e182]
              - text: Immobilien- & Hausverwaltung
          - generic [ref=e183]:
            - generic [ref=e184]: Branchen-Performance
            - generic [ref=e185]: 100+ Wohneinheiten / Jahr
            - generic [ref=e186]: "Sammeltarife: Leerstand & Allgemeinstrom"
          - paragraph [ref=e187]: "\"Das Portal vereinfacht das Zählermanagement bei Leerstand enorm. Die Umstellung auf Ökostrom spart Eigentümern Kosten und verbessert die CO2-Bilanz unserer Immobilien. Eine absolute Win-Win-Situation für uns.\""
    - generic [ref=e190]:
      - generic [ref=e191]:
        - generic [ref=e192]: Partner werden
        - heading "Jetzt Kooperation starten" [level=3] [ref=e193]
        - paragraph [ref=e194]: Registrieren Sie Ihre Agentur kostenlos. Wir melden uns innerhalb von 15 Minuten telefonisch für Ihre Portal-Freischaltung und Schnittstellen-Einrichtung.
      - generic [ref=e195]:
        - generic [ref=e196]:
          - generic [ref=e197]: Vor- und Nachname des Ansprechpartners *
          - textbox "Vor- und Nachname des Ansprechpartners *" [ref=e198]:
            - /placeholder: z.B. Max Mustermann
        - generic [ref=e199]:
          - generic [ref=e200]: E-Mail-Adresse *
          - textbox "E-Mail-Adresse *" [ref=e201]:
            - /placeholder: name@beispiel.de
        - generic [ref=e202]:
          - generic [ref=e203]: Telefonnummer *
          - textbox "Telefonnummer *" [ref=e204]:
            - /placeholder: z.B. 0170 1234567
        - generic [ref=e205]:
          - generic [ref=e206]: Agenturtyp / Branche *
          - generic [ref=e207]:
            - combobox "Agenturtyp / Branche *" [ref=e208] [cursor=pointer]:
              - option "Versicherungsmakler"
              - option "Finanzagentur"
              - option "Immobilien- / Hausverwaltung"
              - option "Sonstige Agentur"
            - generic:
              - img
        - button "Kostenlos registrieren" [ref=e209] [cursor=pointer]
  - contentinfo [ref=e210]:
    - generic [ref=e211]:
      - generic [ref=e212]:
        - generic [ref=e213]:
          - link "Alpha Energie GmbH" [ref=e214] [cursor=pointer]:
            - /url: index.html
            - img "Alpha Energie GmbH" [ref=e215]
          - paragraph [ref=e216]: Alpha Energie GmbH ist dein kompetenter Begleiter und Berater bei der Energiekostenoptimierung!
          - generic [ref=e217]:
            - link "Facebook" [ref=e218] [cursor=pointer]:
              - /url: "#facebook"
            - link "LinkedIn" [ref=e219] [cursor=pointer]:
              - /url: "#linkedin"
            - link "Instagram" [ref=e220] [cursor=pointer]:
              - /url: "#instagram"
        - generic [ref=e221]:
          - heading "Unternehmen" [level=4] [ref=e222]
          - list [ref=e223]:
            - listitem [ref=e224]:
              - link "Über uns" [ref=e225] [cursor=pointer]:
                - /url: ueber-uns.html
            - listitem [ref=e226]:
              - link "Karriere" [ref=e227] [cursor=pointer]:
                - /url: karriere.html
            - listitem [ref=e228]:
              - link "Kontakt" [ref=e229] [cursor=pointer]:
                - /url: kontakt.html
        - generic [ref=e230]:
          - heading "Lösungen" [level=4] [ref=e231]
          - list [ref=e232]:
            - listitem [ref=e233]:
              - link "Für Vertriebspartner" [ref=e234] [cursor=pointer]:
                - /url: vertriebspartner.html
            - listitem [ref=e235]:
              - link "Für Gewerbekunden" [ref=e236] [cursor=pointer]:
                - /url: gewerbekunden.html
            - listitem [ref=e237]:
              - link "Für Produktgeber" [ref=e238] [cursor=pointer]:
                - /url: produktgeber.html
            - listitem [ref=e239]:
              - link "Für Agenturen" [ref=e240] [cursor=pointer]:
                - /url: agenturen.html
        - generic [ref=e241]:
          - heading "Rechtliches" [level=4] [ref=e242]
          - list [ref=e243]:
            - listitem [ref=e244]:
              - link "Datenschutz" [ref=e245] [cursor=pointer]:
                - /url: datenschutz.html
            - listitem [ref=e246]:
              - link "Impressum" [ref=e247] [cursor=pointer]:
                - /url: impressum.html
            - listitem [ref=e248]:
              - link "Cookie-Einstellungen" [ref=e249] [cursor=pointer]:
                - /url: cookie-einstellungen.html
            - listitem [ref=e250]:
              - link "VP-Portal" [ref=e251] [cursor=pointer]:
                - /url: https://vp.alpha-energie.de
      - paragraph [ref=e253]: © Copyright 2026. Alle Rechte vorbehalten. Alpha Energie GmbH
      - generic [ref=e254]:
        - link "Optionen verwalten" [ref=e255] [cursor=pointer]:
          - /url: "#optionen-verwalten"
        - text: "|"
        - link "Dienste verwalten" [ref=e256] [cursor=pointer]:
          - /url: "#dienste-verwalten"
        - text: "|"
        - link "Einstellungen ansehen" [ref=e257] [cursor=pointer]:
          - /url: "#einstellungen-ansehen"
```

# Test source

```ts
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
  144 |         await expect(successContainer).toBeVisible();
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
> 190 |         expect(overflowResult.hasOverflow).toBe(false);
      |                                            ^ Error: expect(received).toBe(expected) // Object.is equality
  191 |     });
  192 | });
  193 | 
```