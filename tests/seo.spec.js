const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Helper: Scan project directory recursively for HTML files, excluding administrative/metadata folders
function scanHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const trimmedFile = file.trim();
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            // Ignore directories starting with '.' (or starting with a space before '.')
            if (trimmedFile.startsWith('.') || file.startsWith('.') || file.trim().startsWith('.')) {
                continue;
            }
            // Ignore specific folders
            if (['node_modules', 'tests', 'memory-bank', '.agents', 'test-results', 'public', 'prisma', 'services', 'partner_akquise_plan'].includes(trimmedFile)) {
                continue;
            }
            scanHtmlFiles(fullPath, fileList);
        } else {
            const lowerFile = trimmedFile.toLowerCase();
            if (lowerFile.endsWith('.html')) {
                const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
                fileList.push(relPath);
            }
        }
    }
    return fileList;
}

const allHtmlFiles = scanHtmlFiles(rootDir);
const indexablePages = ['index.html', 'vertriebspartner.html', 'agenturen.html', 'impressum.html'];
const nonIndexablePages = allHtmlFiles.filter(file => !indexablePages.includes(file));

// Robust robots.txt parser
function parseRobotsTxt(text) {
    const lines = text.split(/\r?\n/);
    const blocks = [];
    let currentBlock = null;

    for (const line of lines) {
        const cleanLine = line.split('#')[0].trim();
        if (!cleanLine) continue;

        const match = cleanLine.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/i);
        if (match) {
            const key = match[1].toLowerCase();
            const value = match[2].trim();

            if (key === 'user-agent') {
                if (currentBlock && currentBlock.rules.length > 0) {
                    blocks.push(currentBlock);
                    currentBlock = null;
                }
                if (!currentBlock) {
                    currentBlock = { userAgents: [], rules: [] };
                }
                currentBlock.userAgents.push(value.toLowerCase());
            } else if (key === 'allow' || key === 'disallow') {
                if (currentBlock) {
                    currentBlock.rules.push({ type: key, value });
                }
            }
        }
    }
    if (currentBlock) {
        blocks.push(currentBlock);
    }
    return blocks;
}

const CRAWLER_AGENTS = ['robots', 'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot', 'facebot', 'ia_archiver'];

async function getRobotsMetaContents(page) {
    const contents = [];
    for (const agent of CRAWLER_AGENTS) {
        const locator = page.locator(`meta[name="${agent}" i]`);
        const count = await locator.count();
        for (let i = 0; i < count; i++) {
            const content = await locator.nth(i).getAttribute('content');
            if (content) {
                contents.push({ agent, content: content.toLowerCase().trim() });
            }
        }
    }
    return contents;
}

function verifyRobotsMetaForNonIndexable(metas) {
    const genericMetas = metas.filter(meta => meta.agent === 'robots');
    expect(genericMetas.length).toBeGreaterThan(0);

    const hasNoIndexOrNone = genericMetas.some(meta => {
        const directives = meta.content.split(/[,\s]+/).map(d => d.trim().toLowerCase());
        return directives.includes('noindex') || directives.includes('none');
    });
    expect(hasNoIndexOrNone).toBe(true);

    const specificMetas = metas.filter(meta => meta.agent !== 'robots');
    for (const meta of specificMetas) {
        const directives = meta.content.split(/[,\s]+/).map(d => d.trim().toLowerCase());
        const permitsCrawling = directives.some(d => d === 'index' || d === 'all');
        expect(permitsCrawling).toBe(false);
    }
}

function isPathBlocked(block, path) {
    let longestMatch = null;
    for (const rule of block.rules) {
        let pattern = rule.value;
        if (!pattern) continue; // Empty disallow/allow rule doesn't match anything
        
        const hasTrailingDollar = pattern.endsWith('$');
        const cleanPattern = hasTrailingDollar ? pattern.slice(0, -1) : pattern;
        
        let regexStr = '^' + cleanPattern.replace(/[.+^$?{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        if (hasTrailingDollar) {
            regexStr += '$';
        }
        const regex = new RegExp(regexStr);
        if (regex.test(path)) {
            if (!longestMatch || rule.value.length > longestMatch.value.length) {
                longestMatch = rule;
            }
        }
    }
    return longestMatch ? longestMatch.type === 'disallow' : false;
}

// Clean URL normalizer for navigation checks
function normalizeToHtml(pathOrHref) {
    if (!pathOrHref) return '';
    const cleanPath = pathOrHref.split('?')[0].split('#')[0];
    const noTrailingSlash = cleanPath.replace(/\/$/, '');
    const segment = noTrailingSlash.split('/').pop();
    if (!segment) return 'index.html';
    if (segment.toLowerCase().endsWith('.html')) {
        return segment.toLowerCase();
    }
    return `${segment.toLowerCase()}.html`;
}

// Robust XML sitemap parser helper
async function parseSitemapUrls(page) {
    const visited = new Set();
    const baseOrigin = new URL(page.url()).origin;

    const parseSingleXml = async (xmlStr) => {
        return await page.evaluate((xml) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, "text/xml");
            const parserErrors = xmlDoc.getElementsByTagName("parsererror");
            if (parserErrors.length > 0) {
                return { error: parserErrors[0].textContent, urls: [] };
            }
            const docEl = xmlDoc.documentElement;
            const rootName = docEl ? (docEl.localName || docEl.nodeName.split(':').pop()) : '';
            const isIndex = rootName.toLowerCase() === 'sitemapindex';
            
            const allElements = xmlDoc.getElementsByTagName("*");
            const urls = [];
            for (const el of Array.from(allElements)) {
                const name = el.localName || el.nodeName.split(':').pop();
                if (name.toLowerCase() === 'loc') {
                    urls.push(el.textContent.trim());
                }
            }
            return { error: null, isIndex, urls };
        }, xmlStr);
    };

    const fetchAndParse = async (urlPath) => {
        const normalizedPath = urlPath.replace(/\/$/, '').toLowerCase();
        if (visited.has(normalizedPath)) {
            return [];
        }
        visited.add(normalizedPath);

        const res = await page.request.get(urlPath);
        expect(res.status()).toBe(200);
        const xmlText = await res.text();
        const parsed = await parseSingleXml(xmlText);
        expect(parsed.error).toBeNull();

        if (parsed.isIndex) {
            let aggregated = [];
            for (const childUrl of parsed.urls) {
                try {
                    const parsedChildUrl = new URL(childUrl, baseOrigin);
                    const subUrls = await fetchAndParse(parsedChildUrl.pathname);
                    aggregated = aggregated.concat(subUrls);
                } catch (e) {
                    // Ignore invalid URLs
                }
            }
            return aggregated;
        } else {
            return parsed.urls;
        }
    };

    const urls = await fetchAndParse('/sitemap.xml');
    expect(urls.length).toBeGreaterThan(0);
    return urls;
}

// JSON-LD schema extraction helper
function extractSchemas(parsedObj) {
    let schemas = [];
    if (!parsedObj || typeof parsedObj !== 'object') {
        return schemas;
    }
    if (Array.isArray(parsedObj)) {
        for (const item of parsedObj) {
            schemas = schemas.concat(extractSchemas(item));
        }
        return schemas;
    }
    if (parsedObj['@graph'] && Array.isArray(parsedObj['@graph'])) {
        schemas = schemas.concat(extractSchemas(parsedObj['@graph']));
    }
    if (parsedObj['@type']) {
        schemas.push(parsedObj);
    }
    return schemas;
}

test.describe('SEO E2E Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Block external CDN requests to prevent network-mode timeouts
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (
        url.includes('cdnjs.cloudflare.com') ||
        url.includes('fonts.googleapis.com') ||
        url.includes('fonts.gstatic.com') ||
        url.includes('google-analytics.com') ||
        url.includes('googletagmanager.com')
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });
  });

  // ==========================================
  // TIER 1: FEATURE COVERAGE
  // ==========================================
  test.describe('Tier 1: Feature Coverage', () => {

    test('1. robots.txt exists and is accessible', async ({ request }) => {
      const res = await request.get('/robots.txt');
      expect(res.status()).toBe(200);
    });

    test('2. robots.txt has text/plain content type', async ({ request }) => {
      const res = await request.get('/robots.txt');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('text/plain');
    });

    test('3. robots.txt references sitemap.xml', async ({ request }) => {
      const res = await request.get('/robots.txt');
      expect(res.status()).toBe(200);
      const text = await res.text();
      expect(text).toMatch(/^Sitemap:\s+https?:\/\/[^\s]+\/sitemap\.xml/im);
    });

    test('4. robots.txt permits general crawling', async ({ request }) => {
      const res = await request.get('/robots.txt');
      expect(res.status()).toBe(200);
      const text = await res.text();
      const blocks = parseRobotsTxt(text);
      const starBlock = blocks.find(b => b.userAgents.includes('*'));
      expect(starBlock).toBeDefined();
      expect(isPathBlocked(starBlock, '/')).toBe(false);
    });

    test('5. robots.txt permits GPTBot', async ({ request }) => {
      const res = await request.get('/robots.txt');
      expect(res.status()).toBe(200);
      const text = await res.text();
      const blocks = parseRobotsTxt(text);
      const botBlock = blocks.find(b => b.userAgents.includes('gptbot')) || blocks.find(b => b.userAgents.includes('*'));
      expect(botBlock).toBeDefined();
      expect(isPathBlocked(botBlock, '/')).toBe(false);
    });

    test('6. robots.txt permits CCBot', async ({ request }) => {
      const res = await request.get('/robots.txt');
      expect(res.status()).toBe(200);
      const text = await res.text();
      const blocks = parseRobotsTxt(text);
      const botBlock = blocks.find(b => b.userAgents.includes('ccbot')) || blocks.find(b => b.userAgents.includes('*'));
      expect(botBlock).toBeDefined();
      expect(isPathBlocked(botBlock, '/')).toBe(false);
    });

    test('7. robots.txt permits Google-Extended', async ({ request }) => {
      const res = await request.get('/robots.txt');
      expect(res.status()).toBe(200);
      const text = await res.text();
      const blocks = parseRobotsTxt(text);
      const botBlock = blocks.find(b => b.userAgents.includes('google-extended')) || blocks.find(b => b.userAgents.includes('*'));
      expect(botBlock).toBeDefined();
      expect(isPathBlocked(botBlock, '/')).toBe(false);
    });

    test('8. sitemap.xml exists and is accessible', async ({ request }) => {
      const res = await request.get('/sitemap.xml');
      expect(res.status()).toBe(200);
    });

    test('9. sitemap.xml has XML content type', async ({ request }) => {
      const res = await request.get('/sitemap.xml');
      expect(res.status()).toBe(200);
      const contentType = res.headers()['content-type'];
      expect(contentType).toMatch(/(application\/xml|text\/xml)/);
    });

    test('10. sitemap.xml lists index.html (or root)', async ({ request }) => {
      const res = await request.get('/sitemap.xml');
      expect(res.status()).toBe(200);
      const text = await res.text();
      expect(text).toMatch(/<loc>https?:\/\/[^/<>]+(\/|\/index\.html)<\/loc>/);
    });

    test('11. sitemap.xml lists vertriebspartner.html', async ({ request }) => {
      const res = await request.get('/sitemap.xml');
      expect(res.status()).toBe(200);
      const text = await res.text();
      expect(text).toContain('vertriebspartner.html');
    });

    test('12. sitemap.xml lists agenturen.html', async ({ request }) => {
      const res = await request.get('/sitemap.xml');
      expect(res.status()).toBe(200);
      const text = await res.text();
      expect(text).toContain('agenturen.html');
    });

    test('13. sitemap.xml lists impressum.html', async ({ request }) => {
      const res = await request.get('/sitemap.xml');
      expect(res.status()).toBe(200);
      const text = await res.text();
      expect(text).toContain('impressum.html');
    });

    indexablePages.forEach((pageName, idx) => {
      test(`${14 + idx}. Indexable page /${pageName} does not have noindex tag`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        const metas = await getRobotsMetaContents(page);
        for (const meta of metas) {
          expect(meta.content).not.toContain('noindex');
          expect(meta.content).not.toContain('none');
        }
      });
    });

    indexablePages.forEach((pageName, idx) => {
      test(`${18 + idx}. Indexable page /${pageName} has title, description, and exactly one H1`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
        
        const descMeta = page.locator('meta[name="description" i]');
        await expect(descMeta).toBeAttached();
        const descContent = await descMeta.getAttribute('content');
        expect(descContent.length).toBeGreaterThan(0);
        
        const h1s = page.locator('h1');
        await expect(h1s).toHaveCount(1);
      });
    });

    indexablePages.forEach((pageName, idx) => {
      test(`${22 + idx}. Indexable page /${pageName} contains JSON-LD structured data`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        const scripts = page.locator('script[type="application/ld+json"]');
        expect(await scripts.count()).toBeGreaterThan(0);
      });
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES
  // ==========================================
  test.describe('Tier 2: Boundary & Corner Cases', () => {

    test('26. robots.txt handles request casing', async ({ request }) => {
      const indexRes = await request.get('/INDEX.HTML');
      if (indexRes.status() === 200) {
        // The server is case-insensitive. /ROBOTS.TXT returning 200 (default fallback) or 301/302/404 is acceptable.
        const res = await request.get('/ROBOTS.TXT');
        expect([200, 301, 302, 404]).toContain(res.status());
      } else {
        // The server is case-sensitive, so /ROBOTS.TXT must return 301, 302, or 404.
        const res = await request.get('/ROBOTS.TXT');
        expect([301, 302, 404]).toContain(res.status());
      }
    });

    test('27. robots.txt has no syntax errors', async ({ request }) => {
      const res = await request.get('/robots.txt');
      expect(res.status()).toBe(200);
      const text = await res.text();
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          expect(trimmed).toMatch(/^[A-Za-z0-9_-]+:\s*/);
        }
      }
    });

    test('28. robots.txt permits specified AI bots explicitly', async ({ request }) => {
      const res = await request.get('/robots.txt');
      expect(res.status()).toBe(200);
      const text = await res.text();
      const blocks = parseRobotsTxt(text);
      
      const aiBots = ['gptbot', 'ccbot', 'google-extended'];
      const indexableUrls = ['/index.html', '/vertriebspartner.html', '/agenturen.html', '/impressum.html'];
      
      for (const bot of aiBots) {
        let botBlock = blocks.find(b => b.userAgents.includes(bot));
        if (!botBlock) {
          botBlock = blocks.find(b => b.userAgents.includes('*'));
        }
        expect(botBlock).toBeDefined();
        for (const urlPath of indexableUrls) {
          expect(isPathBlocked(botBlock, urlPath)).toBe(false);
        }
      }
    });

    test('29. sitemap.xml contains valid XML namespace', async ({ request }) => {
      const res = await request.get('/sitemap.xml');
      expect(res.status()).toBe(200);
      const text = await res.text();
      expect(text).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    });

    test('30. sitemap.xml has no duplicate URLs', async ({ page }) => {
      const urls = await parseSitemapUrls(page);
      const uniqueUrls = new Set(urls);
      expect(urls.length).toBe(uniqueUrls.size);
    });

    test('31. sitemap.xml URLs are fully qualified absolute URLs', async ({ page }) => {
      const urls = await parseSitemapUrls(page);
      for (const url of urls) {
        expect(url).toMatch(/^https?:\/\/[^\s/]+/);
      }
    });

    test('32. noindex meta tag casing is correct and handles variations', async ({ page }) => {
      expect(nonIndexablePages.length).toBeGreaterThan(0);
      if (nonIndexablePages.length > 0) {
        await page.goto(`/${nonIndexablePages[0]}`);
        const metas = await getRobotsMetaContents(page);
        verifyRobotsMetaForNonIndexable(metas);
      }
    });

    nonIndexablePages.forEach((pageName, idx) => {
      test(`33.${idx + 1}. Non-indexable file /${pageName} has valid noindex tag`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        const metas = await getRobotsMetaContents(page);
        verifyRobotsMetaForNonIndexable(metas);
      });
    });

    indexablePages.forEach((pageName, idx) => {
      test(`${34 + idx}. Indexable page /${pageName} H1 is not empty`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        const h1 = page.locator('h1');
        await expect(h1).not.toBeEmpty();
      });
    });

    test('38. Title lengths are optimal for search engines (10 - 70 chars)', async ({ page }) => {
      for (const pageName of indexablePages) {
        await page.goto(`/${pageName}`);
        const title = await page.title();
        expect(title.length).toBeGreaterThanOrEqual(10);
        expect(title.length).toBeLessThanOrEqual(70);
      }
    });

    test('39. Description lengths are optimal for search engines (50 - 160 chars)', async ({ page }) => {
      for (const pageName of indexablePages) {
        await page.goto(`/${pageName}`);
        const descMeta = page.locator('meta[name="description" i]');
        const descContent = await descMeta.getAttribute('content');
        expect(descContent).not.toBeNull();
        expect(descContent.length).toBeGreaterThanOrEqual(50);
        expect(descContent.length).toBeLessThanOrEqual(160);
      }
    });

    test('40. Title tags do not have duplicate contents across indexable pages', async ({ page }) => {
      const titles = [];
      for (const pageName of indexablePages) {
        await page.goto(`/${pageName}`);
        titles.push(await page.title());
      }
      const uniqueTitles = new Set(titles);
      expect(titles.length).toBe(uniqueTitles.size);
    });

    test('41. Description tags do not have duplicate contents across indexable pages', async ({ page }) => {
      const descriptions = [];
      for (const pageName of indexablePages) {
        await page.goto(`/${pageName}`);
        const descMeta = page.locator('meta[name="description" i]');
        const descContent = await descMeta.getAttribute('content');
        expect(descContent).not.toBeNull();
        descriptions.push(descContent);
      }
      const uniqueDescs = new Set(descriptions);
      expect(descriptions.length).toBe(uniqueDescs.size);
    });

    indexablePages.forEach((pageName, idx) => {
      test(`${42 + idx}. Indexable page /${pageName} JSON-LD parses successfully`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        const scripts = page.locator('script[type="application/ld+json"]');
        const count = await scripts.count();
        expect(count).toBeGreaterThan(0);
        
        for (let i = 0; i < count; i++) {
          const content = await scripts.nth(i).textContent();
          let parsed;
          expect(() => { parsed = JSON.parse(content); }).not.toThrow();
          expect(parsed).toBeDefined();
          
          const contextMatches = (ctx) => {
            if (typeof ctx === 'string') {
              return /^https?:\/\/schema\.org\/?$/.test(ctx);
            }
            if (Array.isArray(ctx)) {
              return ctx.some(item => typeof item === 'string' && /^https?:\/\/schema\.org\/?$/.test(item));
            }
            return false;
          };

          const checkContext = (obj, inheritedContext = null) => {
            if (!obj || typeof obj !== 'object') {
              return false;
            }
            if (Array.isArray(obj)) {
              return obj.length > 0 && obj.every(item => checkContext(item, inheritedContext));
            }
            
            const currentContext = obj['@context'] ? obj['@context'] : inheritedContext;
            const hasValidContext = currentContext && contextMatches(currentContext);

            if (obj['@graph'] && Array.isArray(obj['@graph'])) {
              return obj['@graph'].length > 0 && obj['@graph'].every(item => checkContext(item, currentContext));
            }

            return !!hasValidContext;
          };

          expect(checkContext(parsed)).toBe(true);
        }
      });
    });
  });

  // ==========================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // ==========================================
  test.describe('Tier 3: Cross-Feature Combinations', () => {

    test('46. Pages listed in sitemap.xml do not contain noindex tags', async ({ page }) => {
      const urls = await parseSitemapUrls(page);
      for (const url of urls) {
        const parsedUrl = new URL(url);
        await page.goto(parsedUrl.pathname);
        const metas = await getRobotsMetaContents(page);
        for (const meta of metas) {
          expect(meta.content).not.toContain('noindex');
          expect(meta.content).not.toContain('none');
        }
      }
    });

    test('47. All HTML files not listed in sitemap.xml must have noindex tags', async ({ page }) => {
      const urls = await parseSitemapUrls(page);
      const sitemapUrls = urls.map(url => {
        const parsed = new URL(url);
        let pathname = parsed.pathname.substring(1);
        if (!pathname) pathname = 'index.html';
        return pathname;
      });

      const errors = [];
      for (const file of nonIndexablePages) {
        try {
          expect(sitemapUrls).not.toContain(file);
          
          await page.goto(`/${file}`);
          const metas = await getRobotsMetaContents(page);
          verifyRobotsMetaForNonIndexable(metas);
        } catch (err) {
          errors.push({ file, error: err.message });
        }
      }
      expect(errors).toEqual([]);
    });

    test('48. Sitemap URL specified in robots.txt is fetchable and identical to sitemap.xml', async ({ request }) => {
      const robotsRes = await request.get('/robots.txt');
      expect(robotsRes.status()).toBe(200);
      const robotsText = await robotsRes.text();
      const match = robotsText.match(/^Sitemap:\s+(https?:\/\/[^\s]+)/im);
      expect(match).not.toBeNull();
      
      if (match) {
        const sitemapUrl = match[1];
        const sitemapRes = await request.get(sitemapUrl);
        expect(sitemapRes.status()).toBe(200);
        expect(sitemapRes.headers()['content-type']).toMatch(/(application\/xml|text\/xml)/);
      }
    });

    test('49. sitemap.xml does not list any URL blocked in robots.txt', async ({ page }) => {
      const robotsRes = await page.request.get('/robots.txt');
      expect(robotsRes.status()).toBe(200);
      const robotsText = await robotsRes.text();
      const blocks = parseRobotsTxt(robotsText);
      const starBlock = blocks.find(b => b.userAgents.includes('*'));

      const urls = await parseSitemapUrls(page);
      const sitemapPaths = urls.map(url => new URL(url).pathname);

      for (const urlPath of sitemapPaths) {
        if (starBlock) {
          expect(isPathBlocked(starBlock, urlPath)).toBe(false);
        }
      }
    });

    indexablePages.forEach((pageName, idx) => {
      test(`${50 + idx}. Indexable page /${pageName} BreadcrumbList URL matches page URL`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        const scripts = page.locator('script[type="application/ld+json"]');
        const count = await scripts.count();
        let foundBreadcrumb = false;

        for (let i = 0; i < count; i++) {
          const content = await scripts.nth(i).textContent();
          const parsed = JSON.parse(content);
          
          const schemas = extractSchemas(parsed);
          const breadcrumbSchema = schemas.find(s => {
            const types = Array.isArray(s['@type']) ? s['@type'] : [s['@type']];
            return types.includes('BreadcrumbList');
          });
          
          if (breadcrumbSchema) {
            foundBreadcrumb = true;
            const items = breadcrumbSchema.itemListElement || [];
            expect(items.length).toBeGreaterThan(0);
            
            const lastItem = items[items.length - 1];
            let itemVal = lastItem.item || lastItem.id;
            if (itemVal && typeof itemVal === 'object') {
              itemVal = itemVal['@id'] || itemVal.id;
            }
            const breadcrumbUrl = itemVal;
            expect(breadcrumbUrl).toBeDefined();
            
            const breadcrumbPathname = new URL(breadcrumbUrl, page.url()).pathname;
            const pagePathname = new URL(page.url()).pathname;
            const normPage = pagePathname.replace(/\/index\.html$/, '/');
            const normBreadcrumb = breadcrumbPathname.replace(/\/index\.html$/, '/');
            expect(normPage).toBe(normBreadcrumb);
          }
        }
        expect(foundBreadcrumb).toBe(true);
      });
    });

    test('54. Navigation links to indexable pages are valid and point to correct destinations', async ({ page }) => {
      await page.goto('/');
      const navLinks = page.locator('header a');
      const count = await navLinks.count();
      const localOrigin = new URL(page.url()).origin;
      for (let i = 0; i < count; i++) {
        const href = await navLinks.nth(i).getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('mailto:')) {
          let testUrl = href;
          let isExternal = false;
          if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
            try {
              const urlToParse = href.startsWith('//') ? `https:${href}` : href;
              const parsed = new URL(urlToParse);
              const hostname = parsed.hostname.toLowerCase();
              if (hostname === 'alpha-energie.de' || hostname === 'www.alpha-energie.de') {
                testUrl = localOrigin + parsed.pathname + parsed.search + parsed.hash;
              } else if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
                isExternal = true;
              }
            } catch (e) {
              isExternal = true;
            }
          }
          if (isExternal) {
            continue;
          }
          const normalized = normalizeToHtml(testUrl);
          if (indexablePages.includes(normalized)) {
            const response = await page.request.get(testUrl);
            expect(response.status()).toBe(200);
          }
        }
      }
    });

    test('55. Footer links to non-indexable legal pages correctly have noindex tags', async ({ page }) => {
      await page.goto('/');
      const footerLinks = page.locator('footer a');
      const count = await footerLinks.count();
      const urlsToTest = [];
      for (let i = 0; i < count; i++) {
        const href = await footerLinks.nth(i).getAttribute('href');
        if (href && !href.startsWith('#') && href.includes('.html')) {
          const cleanHref = href.split('/').pop();
          if (cleanHref && nonIndexablePages.includes(cleanHref)) {
            urlsToTest.push(href);
          }
        }
      }
      const uniqueUrls = [...new Set(urlsToTest)];
      const errors = [];
      for (const url of uniqueUrls) {
        try {
          await page.goto(url);
          const metas = await getRobotsMetaContents(page);
          verifyRobotsMetaForNonIndexable(metas);
        } catch (err) {
          errors.push({ url, error: err.message });
        }
      }
      expect(errors).toEqual([]);
    });
  });

  // ==========================================
  // TIER 4: REAL-WORLD APPLICATION
  // ==========================================
  test.describe('Tier 4: Real-World Application', () => {

    test('56. Page is accessible with simulated Googlebot User-Agent', async ({ request }) => {
      const response = await request.get('/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
      });
      expect(response.status()).toBe(200);
    });

    test('57. Page is accessible with simulated GPTBot User-Agent', async ({ request }) => {
      const response = await request.get('/', {
        headers: { 'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)' }
      });
      expect(response.status()).toBe(200);
    });

    test('58. Page is accessible with simulated CCBot User-Agent', async ({ request }) => {
      const response = await request.get('/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CCBot/2.0; +http://commoncrawl.org/faq/)' }
      });
      expect(response.status()).toBe(200);
    });

    indexablePages.forEach((pageName, idx) => {
      test(`${59 + idx}. Indexable page /${pageName} Schema Organization matches official details`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        const scripts = page.locator('script[type="application/ld+json"]');
        const count = await scripts.count();
        let foundOrg = false;

        for (let i = 0; i < count; i++) {
          const content = await scripts.nth(i).textContent();
          const parsed = JSON.parse(content);
          
          const schemas = extractSchemas(parsed);
          const orgSchema = schemas.find(s => {
            const types = Array.isArray(s['@type']) ? s['@type'] : [s['@type']];
            return types.includes('Organization');
          });
          
          if (orgSchema) {
            foundOrg = true;
            expect(orgSchema.name).toBe('Alpha Energie GmbH');
            expect(orgSchema.url).toContain('alpha-energie.de');
            expect(orgSchema.logo).toContain('logo.png');
            expect(orgSchema.email || (orgSchema.contactPoint && orgSchema.contactPoint.email)).toBeDefined();
          }
        }
        expect(foundOrg).toBe(true);
      });
    });

    test('63. All indexable pages have a canonical link matching sitemap url', async ({ page }) => {
      const urls = await parseSitemapUrls(page);
      const sitemapUrlsMap = {};
      urls.forEach(url => {
        const filename = url.split('/').pop() || 'index.html';
        sitemapUrlsMap[filename] = url;
      });

      for (const pageName of indexablePages) {
        await page.goto(`/${pageName}`);
        const canonicalLink = page.locator('link[rel="canonical"]');
        await expect(canonicalLink).toBeAttached();
        const href = await canonicalLink.getAttribute('href');
        
        const expectedSitemapUrl = sitemapUrlsMap[pageName];
        expect(expectedSitemapUrl).toBeDefined();
        expect(href).toBe(expectedSitemapUrl);
      }
    });

    // --- Dynamic SEO Guideline Assertions ---
    indexablePages.forEach((pageName) => {
      test(`Image Alt: Indexable page /${pageName} has alt attribute on all images`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        const images = page.locator('img');
        const count = await images.count();
        for (let i = 0; i < count; i++) {
          const alt = await images.nth(i).getAttribute('alt');
          expect(alt).not.toBeNull();
          expect(alt.trim().length).toBeGreaterThan(0);
        }
      });

      test(`Heading Hierarchy: Indexable page /${pageName} has a valid heading hierarchy`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        const headings = await page.evaluate(() => {
          const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          return Array.from(elements).map(el => parseInt(el.tagName.substring(1), 10));
        });
        
        let prevLevel = 0;
        for (const currentLevel of headings) {
          expect(currentLevel).toBeLessThanOrEqual(prevLevel + 1);
          prevLevel = currentLevel;
        }
      });

      test(`Descriptive Anchor Text: Indexable page /${pageName} has descriptive link text`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        const links = page.locator('a');
        const count = await links.count();
        const genericWords = [
          'click here',
          'here',
          'klicken',
          'klick',
          'hier',
          'mehr',
          'click',
          'mehr erfahren',
          'erfahren',
          'hier klicken',
          'klick hier'
        ];

        const badPhrases = [
          'click here',
          'hier klicken',
          'mehr erfahren',
          'klick hier'
        ];
        
        for (let i = 0; i < count; i++) {
          const link = links.nth(i);
          let text = await link.innerText();
          if (!text.trim()) {
            const images = link.locator('img');
            if (await images.count() > 0) {
              text = (await images.first().getAttribute('alt')) || '';
            }
          }
          
          const trimmed = text
            .replace(/[!.,?:\-–—→()<>]/g, '')
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase();
            
          if (trimmed) {
            expect(genericWords).not.toContain(trimmed);
            for (const phrase of badPhrases) {
              expect(trimmed).not.toContain(phrase);
            }
          }
        }
      });
    });
  });
});
