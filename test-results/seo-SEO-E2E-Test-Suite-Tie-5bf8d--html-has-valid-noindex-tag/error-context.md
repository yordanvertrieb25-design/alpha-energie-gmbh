# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: seo.spec.js >> SEO E2E Test Suite >> Tier 2: Boundary & Corner Cases >> 33.12. Non-indexable file /Marketing_Plan_Alpha_Energie_2026.html has valid noindex tag
- Location: tests\seo.spec.js:474:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]: Not Found
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
  20  |             if (['node_modules', 'tests', 'memory-bank', '.agents', 'test-results', 'public', 'prisma', 'services', 'partner_akquise_plan'].includes(trimmedFile)) {
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
  82  |         const count = await locator.count();
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
  93  | function verifyRobotsMetaForNonIndexable(metas) {
  94  |     const genericMetas = metas.filter(meta => meta.agent === 'robots');
> 95  |     expect(genericMetas.length).toBeGreaterThan(0);
      |                                 ^ Error: expect(received).toBeGreaterThan(expected)
  96  | 
  97  |     const hasNoIndexOrNone = genericMetas.some(meta => {
  98  |         const directives = meta.content.split(/[,\s]+/).map(d => d.trim().toLowerCase());
  99  |         return directives.includes('noindex') || directives.includes('none');
  100 |     });
  101 |     expect(hasNoIndexOrNone).toBe(true);
  102 | 
  103 |     const specificMetas = metas.filter(meta => meta.agent !== 'robots');
  104 |     for (const meta of specificMetas) {
  105 |         const directives = meta.content.split(/[,\s]+/).map(d => d.trim().toLowerCase());
  106 |         const permitsCrawling = directives.some(d => d === 'index' || d === 'all');
  107 |         expect(permitsCrawling).toBe(false);
  108 |     }
  109 | }
  110 | 
  111 | function isPathBlocked(block, path) {
  112 |     let longestMatch = null;
  113 |     for (const rule of block.rules) {
  114 |         let pattern = rule.value;
  115 |         if (!pattern) continue; // Empty disallow/allow rule doesn't match anything
  116 |         
  117 |         const hasTrailingDollar = pattern.endsWith('$');
  118 |         const cleanPattern = hasTrailingDollar ? pattern.slice(0, -1) : pattern;
  119 |         
  120 |         let regexStr = '^' + cleanPattern.replace(/[.+^$?{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  121 |         if (hasTrailingDollar) {
  122 |             regexStr += '$';
  123 |         }
  124 |         const regex = new RegExp(regexStr);
  125 |         if (regex.test(path)) {
  126 |             if (!longestMatch || rule.value.length > longestMatch.value.length) {
  127 |                 longestMatch = rule;
  128 |             }
  129 |         }
  130 |     }
  131 |     return longestMatch ? longestMatch.type === 'disallow' : false;
  132 | }
  133 | 
  134 | // Clean URL normalizer for navigation checks
  135 | function normalizeToHtml(pathOrHref) {
  136 |     if (!pathOrHref) return '';
  137 |     const cleanPath = pathOrHref.split('?')[0].split('#')[0];
  138 |     const noTrailingSlash = cleanPath.replace(/\/$/, '');
  139 |     const segment = noTrailingSlash.split('/').pop();
  140 |     if (!segment) return 'index.html';
  141 |     if (segment.toLowerCase().endsWith('.html')) {
  142 |         return segment.toLowerCase();
  143 |     }
  144 |     return `${segment.toLowerCase()}.html`;
  145 | }
  146 | 
  147 | // Robust XML sitemap parser helper
  148 | async function parseSitemapUrls(page) {
  149 |     const visited = new Set();
  150 |     const baseOrigin = new URL(page.url()).origin;
  151 | 
  152 |     const parseSingleXml = async (xmlStr) => {
  153 |         return await page.evaluate((xml) => {
  154 |             const parser = new DOMParser();
  155 |             const xmlDoc = parser.parseFromString(xml, "text/xml");
  156 |             const parserErrors = xmlDoc.getElementsByTagName("parsererror");
  157 |             if (parserErrors.length > 0) {
  158 |                 return { error: parserErrors[0].textContent, urls: [] };
  159 |             }
  160 |             const docEl = xmlDoc.documentElement;
  161 |             const rootName = docEl ? (docEl.localName || docEl.nodeName.split(':').pop()) : '';
  162 |             const isIndex = rootName.toLowerCase() === 'sitemapindex';
  163 |             
  164 |             const allElements = xmlDoc.getElementsByTagName("*");
  165 |             const urls = [];
  166 |             for (const el of Array.from(allElements)) {
  167 |                 const name = el.localName || el.nodeName.split(':').pop();
  168 |                 if (name.toLowerCase() === 'loc') {
  169 |                     urls.push(el.textContent.trim());
  170 |                 }
  171 |             }
  172 |             return { error: null, isIndex, urls };
  173 |         }, xmlStr);
  174 |     };
  175 | 
  176 |     const fetchAndParse = async (urlPath) => {
  177 |         const normalizedPath = urlPath.replace(/\/$/, '').toLowerCase();
  178 |         if (visited.has(normalizedPath)) {
  179 |             return [];
  180 |         }
  181 |         visited.add(normalizedPath);
  182 | 
  183 |         const res = await page.request.get(urlPath);
  184 |         expect(res.status()).toBe(200);
  185 |         const xmlText = await res.text();
  186 |         const parsed = await parseSingleXml(xmlText);
  187 |         expect(parsed.error).toBeNull();
  188 | 
  189 |         if (parsed.isIndex) {
  190 |             let aggregated = [];
  191 |             for (const childUrl of parsed.urls) {
  192 |                 try {
  193 |                     const parsedChildUrl = new URL(childUrl, baseOrigin);
  194 |                     const subUrls = await fetchAndParse(parsedChildUrl.pathname);
  195 |                     aggregated = aggregated.concat(subUrls);
```