# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: seo.spec.js >> SEO E2E Test Suite >> Tier 3: Cross-Feature Combinations >> 47. All HTML files not listed in sitemap.xml must have noindex tags
- Location: tests\seo.spec.js:564:5

# Error details

```
Test timeout of 30000ms exceeded.
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
        - link "VP-Portal" [ref=e23] [cursor=pointer]:
          - /url: https://vp.alpha-energie.de
        - link "B2B-Portal" [ref=e24] [cursor=pointer]:
          - /url: b2b-portal.html
  - main [ref=e25]:
    - generic [ref=e27]:
      - generic [ref=e28]: ✓
      - heading "Registrierung erfolgreich!" [level=1] [ref=e29]
      - paragraph [ref=e30]: Herzlich Willkommen bei Alpha Energie. Wir freuen uns auf die Zusammenarbeit. Erfahren Sie hier, wie die nächsten Schritte aussehen.
    - generic [ref=e32]:
      - generic [ref=e33]:
        - generic [ref=e34]: Ihr Start bei uns
        - heading "So geht es jetzt weiter" [level=2] [ref=e35]
        - paragraph [ref=e36]: Ihr Onboarding-Prozess in drei einfachen Schritten.
      - generic [ref=e37]:
        - generic [ref=e38]:
          - generic [ref=e39]: "1"
          - heading "Portal-Freischaltung" [level=3] [ref=e40]
          - paragraph [ref=e41]: Wir prüfen aktuell Ihre Angaben. Sobald dies abgeschlossen ist, erhalten Sie Ihre persönlichen Zugangsdaten für das VP-Portal per E-Mail, um sich direkt einloggen zu können.
        - generic [ref=e42]:
          - generic [ref=e43]: "2"
          - heading "Kennenlerngespräch" [level=3] [ref=e44]
          - paragraph [ref=e45]: Wählen Sie unten im Kalender direkt einen Termin für ein kurzes Einführungsgespräch. Wir zeigen Ihnen das Portal, klären offene Fragen und besprechen Ihre individuelle Strategie.
        - generic [ref=e46]:
          - generic [ref=e47]: "3"
          - heading "Erste Abschlüsse" [level=3] [ref=e48]
          - paragraph [ref=e49]: Nach unserem Gespräch sind Sie bestens vorbereitet. Sie können direkt starten, Kundenwechsel durchführen und sich ab dem ersten Tag Ihre Top-Provisionen sichern.
    - generic [ref=e51]:
      - generic [ref=e52]:
        - heading "Buchen Sie Ihr Einführungsgespräch" [level=2] [ref=e53]
        - paragraph [ref=e54]: Wählen Sie einen für Sie passenden Termin aus unserem Kalender. Das Gespräch dauert ca. 15-30 Minuten und findet bequem per Telefon oder Video-Call statt.
      - heading "1. Datum wählen" [level=3] [ref=e58]
  - contentinfo [ref=e60]:
    - generic [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e63]:
          - link "Alpha Energie GmbH" [ref=e64] [cursor=pointer]:
            - /url: index.html
            - img "Alpha Energie GmbH" [ref=e65]
          - paragraph [ref=e66]: Alpha Energie GmbH ist dein kompetenter Begleiter und Berater bei der Energiekostenoptimierung!
          - generic [ref=e67]:
            - link "Facebook" [ref=e68] [cursor=pointer]:
              - /url: "#facebook"
            - link "LinkedIn" [ref=e69] [cursor=pointer]:
              - /url: "#linkedin"
            - link "Instagram" [ref=e70] [cursor=pointer]:
              - /url: "#instagram"
        - generic [ref=e71]:
          - heading "Unternehmen" [level=4] [ref=e72]
          - list [ref=e73]:
            - listitem [ref=e74]:
              - link "Über uns" [ref=e75] [cursor=pointer]:
                - /url: ueber-uns.html
            - listitem [ref=e76]:
              - link "Karriere" [ref=e77] [cursor=pointer]:
                - /url: karriere.html
            - listitem [ref=e78]:
              - link "Kontakt" [ref=e79] [cursor=pointer]:
                - /url: kontakt.html
        - generic [ref=e80]:
          - heading "Lösungen" [level=4] [ref=e81]
          - list [ref=e82]:
            - listitem [ref=e83]:
              - link "Für Vertriebspartner" [ref=e84] [cursor=pointer]:
                - /url: vertriebspartner.html
            - listitem [ref=e85]:
              - link "Für Gewerbekunden" [ref=e86] [cursor=pointer]:
                - /url: gewerbekunden.html
            - listitem [ref=e87]:
              - link "Für Produktgeber" [ref=e88] [cursor=pointer]:
                - /url: produktgeber.html
            - listitem [ref=e89]:
              - link "Für Agenturen" [ref=e90] [cursor=pointer]:
                - /url: agenturen.html
        - generic [ref=e91]:
          - heading "Rechtliches" [level=4] [ref=e92]
          - list [ref=e93]:
            - listitem [ref=e94]:
              - link "Datenschutz" [ref=e95] [cursor=pointer]:
                - /url: datenschutz.html
            - listitem [ref=e96]:
              - link "Impressum" [ref=e97] [cursor=pointer]:
                - /url: impressum.html
            - listitem [ref=e98]:
              - link "Cookie-Einstellungen" [ref=e99] [cursor=pointer]:
                - /url: cookie-einstellungen.html
            - listitem [ref=e100]:
              - link "VP-Portal" [ref=e101] [cursor=pointer]:
                - /url: https://vp.alpha-energie.de
      - paragraph [ref=e103]: © Copyright 2026. Alle Rechte vorbehalten. Alpha Energie GmbH
      - generic [ref=e104]:
        - link "Optionen verwalten" [ref=e105] [cursor=pointer]:
          - /url: cookie-einstellungen.html
        - text: "|"
        - link "Dienste verwalten" [ref=e106] [cursor=pointer]:
          - /url: cookie-einstellungen.html
        - text: "|"
        - link "Einstellungen ansehen" [ref=e107] [cursor=pointer]:
          - /url: cookie-einstellungen.html
```