# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: seo.spec.js >> SEO E2E Test Suite >> Tier 2: Boundary & Corner Cases >> 33.11. Non-indexable file /news-energy-summer-2026.html has valid noindex tag
- Location: tests\seo.spec.js:447:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.count: Test timeout of 30000ms exceeded.
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
          - /url: vertriebspartner.html
        - link "VP-Portal" [ref=e24] [cursor=pointer]:
          - /url: https://vp.alpha-energie.de
        - link "B2B-Portal" [ref=e25] [cursor=pointer]:
          - /url: b2b-portal.html
  - main [ref=e26]:
    - generic [ref=e28]:
      - link "← Zurück zur News-Übersicht" [ref=e30] [cursor=pointer]:
        - /url: news.html
      - 'heading "Energy Summer 2026: Wenn aus einem Branchenevent echte Gemeinschaft wird" [level=1] [ref=e31]'
      - paragraph [ref=e32]: Dortmund, 22. Juni 2026 – Ein rundum gelungenes, unvergessliches Netzwerktreffen bei strahlendem Sommerwetter am Neckar, das neue Maßstäbe für Zusammenhalt und Spirit in der deutschen Energiebranche setzt.
    - article [ref=e35]:
      - paragraph [ref=e36]: "Unter dem motto „Gemeinsam wachsen, Zukunft gestalten“ fand am vergangenen, sonnigen Wochenende das lang ersehnte und intensiv vorbereitete Sommer-Highlight der Alpha Energie GmbH statt: Der Energy Summer 2026. Bei absolut bestem Open-Air-Wetter und hochsommerlichen Temperaturen wurde die Veranstaltung zu einem weithin sichtbaren, kraftvollen Symbol für gelebten Zusammenhalt, gegenseitiges Vertrauen und exzellente Zusammenarbeit im modernen Energiemarkt."
      - paragraph [ref=e37]: Weit über 150 Vertriebspartner, wichtige Kooperationspartner der Produktgeberseite sowie motivierte Mitarbeiter aus dem gesamten Bundesgebiet folgten der herzlichen Einladung nach Dortmund. Auf einem großzügig und stilvoll gestalteten Open-Air-Areal direkt am malerischen Neckarufer bot das Event die perfekte Plattform, um sich abseits des oft hektischen Vertriebsalltags in entspannter, lockerer Atmosphäre auf Augenhöhe auszutauschen, wertvolle neue Synergien für B2B und B2C zu stiften und die gemeinsamen Meilensteine des ersten Halbjahres zu feiern.
      - 'heading "Morgenworkshops: Fachwissen aus erster Hand" [level=2] [ref=e38]'
      - paragraph [ref=e39]: Das abwechslungsreiche Event startete bereits am Vormittag mit einer Reihe interaktiver, hochkarätig besetzter Fach-Workshops. Im Fokus standen dabei die aktuellen Herausforderungen der B2B-Kundenakquise unter den veränderten regulatorischen ESG- und CSRD-Richtlinien sowie die Live-Vorstellung neuer Schnittstellenlösungen für unsere Produktgeber. Die anwesenden Partner nutzten die Gelegenheit ausgiebig, um direkt mit unseren Produktmanagern und Brancheninsidern über zukünftige, flexible Tarifmodelle und Marktchancen zu diskutieren. Diese intensiven und praxisnahen Diskussionsrunden zeigten einmal mehr, wie unschätzbar wertvoll der direkte, ungefilterte Erfahrungsaustausch auf Augenhöhe im Netzwerk von Alpha Energie ist.
      - heading "Teambuilding und Freizeitspaß am Nachmittag" [level=2] [ref=e40]
      - paragraph [ref=e41]: Der sonnige Nachmittag stand dann ganz im Zeichen des lockeren Netzwerkens, des persönlichen Kennenlernens und zahlreicher spielerischer Aktivitäten im Freien. Neben gemütlichen Lounge-Ecken, die zum intensiven Fachsimpeln einluden, sorgte ein großes, packendes Tischkicker-Turnier für sportlichen Ehrgeiz und viel Gelächter. Gemischte Teams, bestehend aus neu gestarteten Vertriebspartnern und internen Mitarbeitern des Hauptsitzes Dortmund, traten gegeneinander an, was den stark ausgeprägten und gelebten Teamgeist von Alpha Energie eindrucksvoll unterstrich. Abgerundet wurde das bunte Freizeitprogramm durch eine geführte, entspannte Bootstour auf dem Neckar, die den weit angereisten Teilnehmern die schöne Möglichkeit bot, die Stadt Dortmund aus einer völlig neuen Perspektive zu erleben.
      - heading "Die Vertriebstools der nächsten Generation" [level=2] [ref=e42]
      - paragraph [ref=e43]: Ein absolutes Highlight des Tages war zweifellos die exklusive, mit Spannung erwartete Keynote der Geschäftsleitung zur Zukunft der digitalen Vertriebsunterstützung. Live auf der Großbildleinwand wurden die nächsten, hochinnovativen Entwicklungsstufen unseres unternehmenseigenen Vertriebspartner-Portals demonstriert. Die Partner dürfen sich bereits in naher Zukunft auf ein vollautomatisiertes, KI-gestütztes Lead-Management-System und noch schnellere, komplett papierlose B2C-Abschlussprozesse per Tablet freuen. Diese digitalen Tools werden die tägliche, operative Arbeit vor Ort beim Endkunden weiter spürbar erleichtern und den Vertrieb nachhaltig revolutionieren.
      - blockquote [ref=e44]: „Der Energy Summer ist für uns kein klassisches Business-Meeting. Es ist das emotionale Herzstück unseres Netzwerks. Hier wird greifbar, dass wir seit unserer Gründung im Jahr 2021 nicht nur geschäftliche Beziehungen, sondern eine echte Wertegemeinschaft aufgebaut haben.“ – Tolga Canga, Geschäftsführer.
      - heading "Ein festlicher Ausklang unter Sternen" [level=2] [ref=e45]
      - paragraph [ref=e46]: Mit stimmungsvoller Live-Musik einer bekannten regionalen Band, einem kulinarisch herausragenden, reichhaltigen Grillbuffet mit regionalen Spezialitäten und tiefen, inspirierenden Gesprächen bis weit nach Mitternacht fand der Energy Summer 2026 seinen perfekten Abschluss. Die durchweg positive Resonanz aller Teilnehmer und die spürbare, enorme Aufbruchstimmung haben einmal mehr eindrucksvoll gezeigt, wie stark und belastbar unsere Gemeinschaft ist. Wir bedanken uns von ganzem Herzen bei allen Organisatoren und Partnern, die dieses Fest unvergesslich gemacht haben. Mit diesem gewaltigen Rückenwind im Gepäck gehen wir nun hochmotiviert und voller Tatendrang in die anstehende zweite Jahlhälfte!
      - link "Zurück zu allen Beiträgen" [ref=e48] [cursor=pointer]:
        - /url: news.html
  - contentinfo [ref=e49]:
    - generic [ref=e50]:
      - generic [ref=e51]:
        - generic [ref=e52]:
          - link "Alpha Energie GmbH" [ref=e53] [cursor=pointer]:
            - /url: index.html
            - img "Alpha Energie GmbH" [ref=e54]
          - paragraph [ref=e55]: Alpha Energie GmbH ist dein kompetenter Begleiter und Berater bei der Energiekostenoptimierung!
          - generic [ref=e56]:
            - link "Facebook" [ref=e57] [cursor=pointer]:
              - /url: "#facebook"
            - link "LinkedIn" [ref=e58] [cursor=pointer]:
              - /url: "#linkedin"
            - link "Instagram" [ref=e59] [cursor=pointer]:
              - /url: "#instagram"
        - generic [ref=e60]:
          - heading "Unternehmen" [level=4] [ref=e61]
          - list [ref=e62]:
            - listitem [ref=e63]:
              - link "Über uns" [ref=e64] [cursor=pointer]:
                - /url: ueber-uns.html
            - listitem [ref=e65]:
              - link "Karriere" [ref=e66] [cursor=pointer]:
                - /url: karriere.html
            - listitem [ref=e67]:
              - link "Kontakt" [ref=e68] [cursor=pointer]:
                - /url: kontakt.html
        - generic [ref=e69]:
          - heading "Lösungen" [level=4] [ref=e70]
          - list [ref=e71]:
            - listitem [ref=e72]:
              - link "Für Vertriebspartner" [ref=e73] [cursor=pointer]:
                - /url: vertriebspartner.html
            - listitem [ref=e74]:
              - link "Für Gewerbekunden" [ref=e75] [cursor=pointer]:
                - /url: gewerbekunden.html
            - listitem [ref=e76]:
              - link "Für Produktgeber" [ref=e77] [cursor=pointer]:
                - /url: produktgeber.html
            - listitem [ref=e78]:
              - link "Für Agenturen" [ref=e79] [cursor=pointer]:
                - /url: agenturen.html
        - generic [ref=e80]:
          - heading "Rechtliches" [level=4] [ref=e81]
          - list [ref=e82]:
            - listitem [ref=e83]:
              - link "Datenschutz" [ref=e84] [cursor=pointer]:
                - /url: datenschutz.html
            - listitem [ref=e85]:
              - link "Impressum" [ref=e86] [cursor=pointer]:
                - /url: impressum.html
            - listitem [ref=e87]:
              - link "Cookie-Einstellungen" [ref=e88] [cursor=pointer]:
                - /url: cookie-einstellungen.html
            - listitem [ref=e89]:
              - link "VP-Portal" [ref=e90] [cursor=pointer]:
                - /url: https://vp.alpha-energie.de
      - paragraph [ref=e92]: © Copyright 2026. Alle Rechte vorbehalten. Alpha Energie GmbH
      - generic [ref=e93]:
        - link "Optionen verwalten" [ref=e94] [cursor=pointer]:
          - /url: cookie-einstellungen.html
        - text: "|"
        - link "Dienste verwalten" [ref=e95] [cursor=pointer]:
          - /url: cookie-einstellungen.html
        - text: "|"
        - link "Einstellungen ansehen" [ref=e96] [cursor=pointer]:
          - /url: cookie-einstellungen.html
  - generic [ref=e98]:
    - heading "Datenschutzeinstellungen" [level=3] [ref=e99]
    - paragraph [ref=e100]:
      - text: Wir verwenden Technologien zur Datenspeicherung, um Ihnen das beste Erlebnis auf unserer Website zu bieten. Einige davon sind essenziell (z.B. für die Grundfunktionen der Website), während andere uns helfen, unsere Website und Ihr Erlebnis zu verbessern. Weitere Informationen finden Sie in unserer
      - link "Datenschutzerklärung" [ref=e101] [cursor=pointer]:
        - /url: datenschutz.html
      - text: .
    - generic [ref=e102]:
      - generic [ref=e103]:
        - button "Alle akzeptieren" [ref=e104] [cursor=pointer]
        - button "Nur Essenzielle" [ref=e105] [cursor=pointer]
      - link "Individuelle Einstellungen anpassen" [ref=e106] [cursor=pointer]:
        - /url: cookie-einstellungen.html
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | const fs = require('fs');
  3   | const path = require('path');
  4   | 
  5   | const rootDir = path.resolve(__dirname, '..');
  6   | 
  7   | // Helper: Scan project directory recursively for HTML files, excluding administrative/metadata folders
  8   | function scanHtmlFiles(dir, fileList = []) {
  9   |     const files = fs.readdirSync(dir);
  10  |     for (const file of files) {
  11  |         const trimmedFile = file.trim();
  12  |         const fullPath = path.join(dir, file);
  13  |         const stat = fs.statSync(fullPath);
  14  |         if (stat.isDirectory()) {
  15  |             // Ignore directories starting with '.' (or starting with a space before '.')
  16  |             if (trimmedFile.startsWith('.') || file.startsWith('.') || file.trim().startsWith('.')) {
  17  |                 continue;
  18  |             }
  19  |             // Ignore specific folders
  20  |             if (['node_modules', 'tests', 'memory-bank', '.agents', 'test-results', 'public', 'prisma', 'services', 'partner_akquise_plan', 'admin'].includes(trimmedFile)) {
  21  |                 continue;
  22  |             }
  23  |             scanHtmlFiles(fullPath, fileList);
  24  |         } else {
  25  |             const lowerFile = trimmedFile.toLowerCase();
  26  |             if (lowerFile.endsWith('.html')) {
  27  |                 const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
  28  |                 fileList.push(relPath);
  29  |             }
  30  |         }
  31  |     }
  32  |     return fileList;
  33  | }
  34  | 
  35  | const allHtmlFiles = scanHtmlFiles(rootDir);
  36  | const indexablePages = ['index.html', 'vertriebspartner.html', 'agenturen.html', 'impressum.html'];
  37  | const nonIndexablePages = allHtmlFiles.filter(file => !indexablePages.includes(file));
  38  | 
  39  | // Robust robots.txt parser
  40  | function parseRobotsTxt(text) {
  41  |     const lines = text.split(/\r?\n/);
  42  |     const blocks = [];
  43  |     let currentBlock = null;
  44  | 
  45  |     for (const line of lines) {
  46  |         const cleanLine = line.split('#')[0].trim();
  47  |         if (!cleanLine) continue;
  48  | 
  49  |         const match = cleanLine.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/i);
  50  |         if (match) {
  51  |             const key = match[1].toLowerCase();
  52  |             const value = match[2].trim();
  53  | 
  54  |             if (key === 'user-agent') {
  55  |                 if (currentBlock && currentBlock.rules.length > 0) {
  56  |                     blocks.push(currentBlock);
  57  |                     currentBlock = null;
  58  |                 }
  59  |                 if (!currentBlock) {
  60  |                     currentBlock = { userAgents: [], rules: [] };
  61  |                 }
  62  |                 currentBlock.userAgents.push(value.toLowerCase());
  63  |             } else if (key === 'allow' || key === 'disallow') {
  64  |                 if (currentBlock) {
  65  |                     currentBlock.rules.push({ type: key, value });
  66  |                 }
  67  |             }
  68  |         }
  69  |     }
  70  |     if (currentBlock) {
  71  |         blocks.push(currentBlock);
  72  |     }
  73  |     return blocks;
  74  | }
  75  | 
  76  | const CRAWLER_AGENTS = ['robots', 'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot', 'facebot', 'ia_archiver'];
  77  | 
  78  | async function getRobotsMetaContents(page) {
  79  |     const contents = [];
  80  |     for (const agent of CRAWLER_AGENTS) {
  81  |         const locator = page.locator(`meta[name="${agent}" i]`);
> 82  |         const count = await locator.count();
      |                                     ^ Error: locator.count: Test timeout of 30000ms exceeded.
  83  |         for (let i = 0; i < count; i++) {
  84  |             const content = await locator.nth(i).getAttribute('content');
  85  |             if (content) {
  86  |                 contents.push({ agent, content: content.toLowerCase().trim() });
  87  |             }
  88  |         }
  89  |     }
  90  |     return contents;
  91  | }
  92  | 
  93  | function isPathBlocked(block, path) {
  94  |     let longestMatch = null;
  95  |     for (const rule of block.rules) {
  96  |         let pattern = rule.value;
  97  |         if (!pattern) continue; // Empty disallow/allow rule doesn't match anything
  98  |         
  99  |         const hasTrailingDollar = pattern.endsWith('$');
  100 |         const cleanPattern = hasTrailingDollar ? pattern.slice(0, -1) : pattern;
  101 |         
  102 |         let regexStr = '^' + cleanPattern.replace(/[.+^$?{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  103 |         if (hasTrailingDollar) {
  104 |             regexStr += '$';
  105 |         }
  106 |         const regex = new RegExp(regexStr);
  107 |         if (regex.test(path)) {
  108 |             if (!longestMatch || rule.value.length > longestMatch.value.length) {
  109 |                 longestMatch = rule;
  110 |             }
  111 |         }
  112 |     }
  113 |     return longestMatch ? longestMatch.type === 'disallow' : false;
  114 | }
  115 | 
  116 | // Clean URL normalizer for navigation checks
  117 | function normalizeToHtml(pathOrHref) {
  118 |     if (!pathOrHref) return '';
  119 |     const cleanPath = pathOrHref.split('?')[0].split('#')[0];
  120 |     const noTrailingSlash = cleanPath.replace(/\/$/, '');
  121 |     const segment = noTrailingSlash.split('/').pop();
  122 |     if (!segment) return 'index.html';
  123 |     if (segment.toLowerCase().endsWith('.html')) {
  124 |         return segment.toLowerCase();
  125 |     }
  126 |     return `${segment.toLowerCase()}.html`;
  127 | }
  128 | 
  129 | // Robust XML sitemap parser helper
  130 | async function parseSitemapUrls(page) {
  131 |     const visited = new Set();
  132 |     const parseSingleXml = async (xmlStr) => {
  133 |         return await page.evaluate((xml) => {
  134 |             const parser = new DOMParser();
  135 |             const xmlDoc = parser.parseFromString(xml, "text/xml");
  136 |             const parserErrors = xmlDoc.getElementsByTagName("parsererror");
  137 |             if (parserErrors.length > 0) {
  138 |                 return { error: parserErrors[0].textContent, urls: [] };
  139 |             }
  140 |             const isIndex = xmlDoc.documentElement && xmlDoc.documentElement.nodeName.toLowerCase() === 'sitemapindex';
  141 |             const locs = xmlDoc.getElementsByTagName("loc");
  142 |             const urls = Array.from(locs).map(loc => loc.textContent.trim());
  143 |             return { error: null, isIndex, urls };
  144 |         }, xmlStr);
  145 |     };
  146 | 
  147 |     const fetchAndParse = async (urlPath) => {
  148 |         const normalizedPath = urlPath.replace(/\/$/, '').toLowerCase();
  149 |         if (visited.has(normalizedPath)) {
  150 |             return [];
  151 |         }
  152 |         visited.add(normalizedPath);
  153 | 
  154 |         const res = await page.request.get(urlPath);
  155 |         expect(res.status()).toBe(200);
  156 |         const xmlText = await res.text();
  157 |         const parsed = await parseSingleXml(xmlText);
  158 |         expect(parsed.error).toBeNull();
  159 | 
  160 |         if (parsed.isIndex) {
  161 |             let aggregated = [];
  162 |             for (const childUrl of parsed.urls) {
  163 |                 try {
  164 |                     const parsedChildUrl = new URL(childUrl, 'http://localhost:3000');
  165 |                     const subUrls = await fetchAndParse(parsedChildUrl.pathname);
  166 |                     aggregated = aggregated.concat(subUrls);
  167 |                 } catch (e) {
  168 |                     // Ignore invalid URLs
  169 |                 }
  170 |             }
  171 |             return aggregated;
  172 |         } else {
  173 |             return parsed.urls;
  174 |         }
  175 |     };
  176 | 
  177 |     const urls = await fetchAndParse('/sitemap.xml');
  178 |     expect(urls.length).toBeGreaterThan(0);
  179 |     return urls;
  180 | }
  181 | 
  182 | // JSON-LD schema extraction helper
```