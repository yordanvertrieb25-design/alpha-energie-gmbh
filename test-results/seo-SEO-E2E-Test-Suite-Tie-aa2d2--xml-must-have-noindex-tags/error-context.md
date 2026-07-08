# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: seo.spec.js >> SEO E2E Test Suite >> Tier 3: Cross-Feature Combinations >> 47. All HTML files not listed in sitemap.xml must have noindex tags
- Location: tests\seo.spec.js:597:5

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - img "Watermark"
    - generic [ref=e4]:
      - img "Alpha Energie GmbH"
      - generic [ref=e5]: Partner-Programm
    - generic [ref=e7]:
      - heading "Ihr Upgrade im B2B-Energievertrieb." [level=1] [ref=e8]:
        - text: Ihr Upgrade im
        - text: B2B-Energievertrieb.
      - paragraph [ref=e9]: Werden Sie Partner der Alpha Energie GmbH. Bieten Sie Ihren Kunden zertifizierte ESG-Lösungen und profitieren Sie vom stärksten Partner-Portal am Markt.
  - generic [ref=e10]:
    - img "Watermark"
    - generic [ref=e11]:
      - heading "Der Markt wächst. Sichern Sie sich Ihren Anteil." [level=2] [ref=e12]:
        - text: Der Markt wächst.
        - text: Sichern Sie sich Ihren Anteil.
      - paragraph [ref=e13]:
        - text: "Durch die EU-Regulierung (CSRD) stehen mittelständische Unternehmen massiv unter Druck, Emissionen zu senken. Hier setzen Sie an: Liefern Sie nicht nur Energie, sondern messbare"
        - strong [ref=e14]: Dekarbonisierung
        - text: und
        - strong [ref=e15]: strategische Beratung
        - text: .
      - generic [ref=e16]:
        - generic [ref=e17]:
          - img [ref=e19]
          - generic [ref=e22]:
            - heading "Nachhaltiges Portfolio" [level=3] [ref=e23]
            - paragraph [ref=e24]: Positionieren Sie sich als echter Lösungsanbieter. Bieten Sie zertifizierten Grünstrom, PPA-Modelle und intelligente Energie-Konzepte, die den CO₂-Fußabdruck Ihrer Kunden senken.
        - generic [ref=e25]:
          - img [ref=e27]
          - generic [ref=e29]:
            - heading "Das digitale B2B-Portal" [level=3] [ref=e30]
            - paragraph [ref=e31]: Kalkulieren Sie komplexe B2B-Angebote in Sekunden. Verwalten Sie Leads, Verträge und Provisionen zentral an einem Ort – effizient, transparent und 100% digital.
        - generic [ref=e32]:
          - img [ref=e34]
          - generic [ref=e37]:
            - heading "CSRD- & Compliance-Ready" [level=3] [ref=e38]
            - paragraph [ref=e39]: Unterstützen Sie Ihre Kunden bei den Berichtspflichten. Unsere Energielösungen liefern die validen Daten, die mittelständische Unternehmen heute für ihr ESG-Rating zwingend benötigen.
        - generic [ref=e40]:
          - img [ref=e42]
          - generic [ref=e44]:
            - heading "Maximale Provisionen" [level=3] [ref=e45]
            - paragraph [ref=e46]: Profitieren Sie von Best-in-Class Vergütungsmodellen. Durch Cross-Selling-Optionen wie Photovoltaik und Ladeinfrastruktur maximieren Sie Ihren Umsatz pro Kunde deutlich.
      - generic [ref=e47]:
        - img "QR Code zum Partner Portal" [ref=e49]
        - generic [ref=e50]:
          - heading "Starten Sie jetzt als Alpha Energie Partner." [level=4] [ref=e51]
          - paragraph [ref=e52]: Scannen Sie den Code für die Registrierung im Partner-Portal oder kontaktieren Sie unseren Vertriebssupport für ein Onboarding-Gespräch.
      - generic [ref=e53]:
        - strong [ref=e54]: Alpha Energie GmbH
        - text: "| Das Partner-Netzwerk für ESG & Energie"
        - text: www.alpha-energie.de/partner | partner@alpha-energie.de | +49 (0) 123 456 789
```