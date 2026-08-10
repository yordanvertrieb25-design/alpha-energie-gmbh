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
            if (trimmedFile.startsWith('.') || file.startsWith('.') || file.trim().startsWith('.')) {
                continue;
            }
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

// Simple robots.txt parser for specific user-agent '*'
function getBlockedPaths(robotsText) {
    const lines = robotsText.split(/\r?\n/);
    const blocked = [];
    let inStarBlock = false;

    for (const line of lines) {
        const cleanLine = line.split('#')[0].trim();
        if (!cleanLine) continue;

        const match = cleanLine.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/i);
        if (match) {
            const key = match[1].toLowerCase();
            const value = match[2].trim();

            if (key === 'user-agent') {
                inStarBlock = (value === '*');
            } else if (inStarBlock && key === 'disallow') {
                if (value) {
                    blocked.push(value);
                }
            }
        }
    }
    return blocked;
}

function isBlocked(blockedPaths, urlPath) {
    for (const pattern of blockedPaths) {
        const hasTrailingDollar = pattern.endsWith('$');
        const cleanPattern = hasTrailingDollar ? pattern.slice(0, -1) : pattern;
        
        let regexStr = '^' + cleanPattern.replace(/[.+^$?{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        if (hasTrailingDollar) {
            regexStr += '$';
        }
        const regex = new RegExp(regexStr);
        if (regex.test(urlPath)) {
            return true;
        }
    }
    return false;
}

test.describe('Adversarial SEO & GEO Audit Suite', () => {

  // ==========================================
  // 1. Case-Sensitivity & Case-Folding Checks
  // ==========================================
  test('1. Sitemap.xml mixed-case request handles casing strictly', async ({ request }) => {
    // Standard webservers on Linux are case-sensitive. Express static on Windows serves mixed-case files,
    // which causes duplicate content issues if Googlebot accesses /Sitemap.xml or /Sitemap.XML.
    const res = await request.get('/Sitemap.xml', { maxRedirects: 0 });
    // It should either return 404 Not Found (strict casing) or redirect (301/302) to lowercase /sitemap.xml
    expect([301, 302, 404]).toContain(res.status());
  });

  test('2. Target pages mixed-case requests handle casing strictly', async ({ request }) => {
    const mixedCasePages = ['/Index.html', '/Vertriebspartner.html', '/Agenturen.html', '/Impressum.html'];
    for (const pagePath of mixedCasePages) {
      const res = await request.get(pagePath, { maxRedirects: 0 });
      // Enforce redirect or 404 to avoid duplicate content indexing of mixed-case URLs
      expect([301, 302, 404]).toContain(res.status());
    }
  });

  // ==========================================
  // 2. Canonical vs Internal Link Match
  // ==========================================
  test('3. Internal navigation anchors match canonical page URLs exactly', async ({ page }) => {
    // 1. Fetch the canonical URLs declared on each indexable page
    const canonicalMap = {};
    for (const pageName of indexablePages) {
      await page.goto(`/${pageName}`);
      const canonicalLink = page.locator('link[rel="canonical"]');
      const canonicalHref = await canonicalLink.getAttribute('href');
      expect(canonicalHref).not.toBeNull();
      canonicalMap[pageName] = canonicalHref;
    }

    // 2. Scan internal links in navigation headers/footers/buttons on all indexable pages
    for (const pageName of indexablePages) {
      await page.goto(`/${pageName}`);
      
      const anchors = page.locator('a');
      const count = await anchors.count();
      
      for (let i = 0; i < count; i++) {
        const href = await anchors.nth(i).getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('mailto:') && !href.startsWith('http')) {
          // Normalize internal href
          const targetFile = href.split('?')[0].split('#')[0].replace(/^\//, '');
          
          // Check if it matches one of our indexable pages
          const matchingPageName = indexablePages.find(p => p === targetFile || p === `${targetFile}.html` || (targetFile === '' && p === 'index.html'));
          if (matchingPageName) {
            const canonicalUrl = canonicalMap[matchingPageName];
            const parsedCanonical = new URL(canonicalUrl);
            const canonicalPath = parsedCanonical.pathname; // e.g. /vertriebspartner.html
            
            // The linked href pathname should match the canonical pathname exactly to prevent equity dilution
            const linkedPath = href.startsWith('/') ? href : `/${href}`;
            expect(linkedPath, `Link in /${pageName} pointing to "${href}" does not match target canonical path "${canonicalPath}"`).toBe(canonicalPath);
          }
        }
      }
    }
  });

  // ==========================================
  // 3. BreadcrumbList Schema Integrity
  // ==========================================
  test('4. BreadcrumbList schema positions are sequential and end at canonical URL', async ({ page }) => {
    for (const pageName of indexablePages) {
      await page.goto(`/${pageName}`);
      
      // Get canonical URL of the page
      const canonicalLink = page.locator('link[rel="canonical"]');
      const canonicalHref = await canonicalLink.getAttribute('href');
      expect(canonicalHref).not.toBeNull();
      
      const scripts = page.locator('script[type="application/ld+json"]');
      const count = await scripts.count();
      
      for (let i = 0; i < count; i++) {
        const content = await scripts.nth(i).textContent();
        const parsed = JSON.parse(content);
        
        // Find BreadcrumbList type
        const schemas = Array.isArray(parsed) ? parsed : (parsed['@graph'] || [parsed]);
        for (const schema of schemas) {
          if (schema['@type'] === 'BreadcrumbList') {
            const items = schema.itemListElement || [];
            expect(items.length, `BreadcrumbList in /${pageName} must have items`).toBeGreaterThan(0);
            
            // Check that positions start at 1 and increment by 1
            items.forEach((item, index) => {
              expect(item.position, `Breadcrumb position at index ${index} in /${pageName} should be ${index + 1}`).toBe(index + 1);
            });
            
            // The last breadcrumb item must point to the canonical URL of this page
            const lastItem = items[items.length - 1];
            const lastItemUrl = lastItem.item || lastItem.id;
            expect(lastItemUrl, `Last breadcrumb URL in /${pageName} must match canonical URL`).toBe(canonicalHref);
          }
        }
      }
    }
  });

  // ==========================================
  // 4. LLM / GEO NAP & Legal Registry Consistency
  // ==========================================
  test('5. NAP and registry information is consistent across metadata and Impressum', async ({ page }) => {
    // 1. Get structured data Organization values from homepage
    await page.goto('/index.html');
    const scripts = page.locator('script[type="application/ld+json"]');
    const count = await scripts.count();
    let orgSchema = null;
    
    for (let i = 0; i < count; i++) {
      const content = await scripts.nth(i).textContent();
      const parsed = JSON.parse(content);
      const schemas = Array.isArray(parsed) ? parsed : (parsed['@graph'] || [parsed]);
      const found = schemas.find(s => s['@type'] === 'Organization');
      if (found) {
        orgSchema = found;
        break;
      }
    }
    
    expect(orgSchema, "Organization structured data must exist on homepage").not.toBeNull();
    
    const schemaLocality = orgSchema.address?.addressLocality;
    const schemaPostalCode = orgSchema.address?.postalCode;
    const schemaStreet = orgSchema.address?.streetAddress;
    
    expect(schemaLocality).toBe('Dortmund');
    expect(schemaPostalCode).toBe('44379');
    
    // 2. Load Impressum page and verify registry details
    await page.goto('/impressum.html');
    const pageText = await page.innerText('body');
    
    // Check city and zip code matches in Impressum
    expect(pageText).toContain(schemaLocality);
    expect(pageText).toContain(schemaPostalCode);
    expect(pageText).toContain(schemaStreet);
    
    // Check Registry Court. If the company is located in Dortmund (NRW), the registry court MUST be Amtsgericht Dortmund.
    // If it says "Amtsgericht Stuttgart", this is a major legal and geographical inconsistency.
    const registryCourtMatch = pageText.match(/Registergericht\s*:\s*([A-Za-z]+)\s+([A-Za-z]+)/i) || pageText.match(/Registergericht\s*:\s*([A-Za-z]+)/i);
    expect(registryCourtMatch).not.toBeNull();
    const courtName = registryCourtMatch[0];
    expect(courtName, `Registry court "${courtName}" is inconsistent with location "${schemaLocality}"`).toContain(schemaLocality);
    
    // Check Phone area code. The Dortmund area code is 0231 (+49 231).
    // The phone number listed is +49 7131 6169560, which belongs to Heilbronn (Baden-Württemberg).
    const phoneLocator = page.locator('a[href^="tel:"]');
    const phoneHref = await phoneLocator.first().getAttribute('href');
    expect(phoneHref).not.toBeNull();
    const phoneNum = phoneHref.replace('tel:', '');
    
    // Dortmund zip starts with 44, area code starts with +49231 or +49230.
    // Heilbronn (+49 7131) is inconsistent.
    expect(phoneNum, `Phone area code "${phoneNum}" is inconsistent with Dortmund address locality`).toMatch(/^(\+49|0)23/);
  });

  // ==========================================
  // 5. Robots.txt vs Noindex Conflicts (SEO Catch-22)
  // ==========================================
  test('6. No pages containing noindex tags are blocked in robots.txt', async ({ request, page }) => {
    // 1. Fetch and parse robots.txt disallow rules for User-agent '*'
    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.status()).toBe(200);
    const robotsText = await robotsRes.text();
    const blockedPaths = getBlockedPaths(robotsText);

    // 2. Check all files in the project. If a page has 'noindex', it must NOT be blocked.
    for (const file of allHtmlFiles) {
      await page.goto(`/${file}`);
      
      const robotsMeta = page.locator('meta[name="robots" i]');
      const metaCount = await robotsMeta.count();
      let hasNoIndex = false;
      
      for (let i = 0; i < metaCount; i++) {
        const content = await robotsMeta.nth(i).getAttribute('content');
        if (content && (content.toLowerCase().includes('noindex') || content.toLowerCase().includes('none'))) {
          hasNoIndex = true;
          break;
        }
      }
      
      if (hasNoIndex) {
        const urlPath = `/${file}`;
        const isBlockedInRobots = isBlocked(blockedPaths, urlPath);
        // Assert that a noindexed page is not blocked by robots.txt, otherwise Google cannot crawl to read the noindex tag.
        expect(isBlockedInRobots, `SEO Catch-22: Page "/${file}" has noindex but is blocked in robots.txt. Crawlers will never see the noindex tag.`).toBe(false);
      }
    }
  });

  // ==========================================
  // 6. Critical Image Alt Validation
  // ==========================================
  test('7. Critical logo image has a non-empty descriptive alt attribute', async ({ page }) => {
    for (const pageName of indexablePages) {
      await page.goto(`/${pageName}`);
      
      const logoImages = page.locator('img[src*="logo.png"]');
      const count = await logoImages.count();
      expect(count, `Logo image must exist on page /${pageName}`).toBeGreaterThan(0);
      
      for (let i = 0; i < count; i++) {
        const alt = await logoImages.nth(i).getAttribute('alt');
        expect(alt, `Logo alt attribute on /${pageName} must exist`).not.toBeNull();
        expect(alt.trim(), `Logo alt attribute on /${pageName} must not be empty or whitespace only`).not.toBe('');
      }
    }
  });
});
