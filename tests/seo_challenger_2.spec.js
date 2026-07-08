const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const indexablePages = ['index.html', 'vertriebspartner.html', 'agenturen.html', 'impressum.html'];

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

test.describe('SEO Challenger 2 E2E Test Suite', () => {

  indexablePages.forEach((pageName) => {

    test.describe(`Adversarial Tests for /${pageName}`, () => {

      // 1. JSON-LD Organization Schema Deep Validation
      test(`Organization Schema on /${pageName} has telephone contact schema`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        const scripts = page.locator('script[type="application/ld+json"]');
        const count = await scripts.count();
        let foundOrg = false;
        let hasTelephone = false;
        
        for (let i = 0; i < count; i++) {
          const content = await scripts.nth(i).textContent();
          const parsed = JSON.parse(content);
          const schemas = extractSchemas(parsed);
          const org = schemas.find(s => {
            const types = Array.isArray(s['@type']) ? s['@type'] : [s['@type']];
            return types.includes('Organization');
          });
          if (org) {
            foundOrg = true;
            if (org.telephone || (org.contactPoint && org.contactPoint.telephone)) {
              hasTelephone = true;
            }
          }
        }
        expect(foundOrg, "Organization schema should be found").toBe(true);
        expect(hasTelephone, "Organization schema contact point is missing 'telephone' property").toBe(true);
      });

      // 2. JSON-LD BreadcrumbList Schema Integrity
      test(`BreadcrumbList Schema on /${pageName} has valid sequence and canonical match`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        
        const canonicalLocator = page.locator('link[rel="canonical"]');
        await expect(canonicalLocator).toBeAttached();
        const canonicalUrl = await canonicalLocator.getAttribute('href');
        expect(canonicalUrl).not.toBeNull();
        
        const scripts = page.locator('script[type="application/ld+json"]');
        const count = await scripts.count();
        let foundBreadcrumb = false;
        
        for (let i = 0; i < count; i++) {
          const content = await scripts.nth(i).textContent();
          const parsed = JSON.parse(content);
          const schemas = extractSchemas(parsed);
          const breadcrumb = schemas.find(s => {
            const types = Array.isArray(s['@type']) ? s['@type'] : [s['@type']];
            return types.includes('BreadcrumbList');
          });
          if (breadcrumb) {
            foundBreadcrumb = true;
            const items = breadcrumb.itemListElement || [];
            expect(items.length, "BreadcrumbList should contain at least one item").toBeGreaterThan(0);
            
            for (let j = 0; j < items.length; j++) {
              const item = items[j];
              expect(item['@type']).toBe('ListItem');
              expect(item.position, `Breadcrumb position should match index + 1`).toBe(j + 1);
              expect(item.name, "Breadcrumb item name should not be empty").toBeTruthy();
              const url = item.item || item.id;
              expect(url, "Breadcrumb item URL should be defined").toBeTruthy();
              expect(url.startsWith('https://alpha-energie.de'), "Breadcrumb URLs should be absolute on the canonical domain").toBe(true);
            }
            
            const lastItem = items[items.length - 1];
            const lastUrl = lastItem.item || lastItem.id;
            expect(lastUrl).toBe(canonicalUrl);
          }
        }
        expect(foundBreadcrumb, "BreadcrumbList schema should be found").toBe(true);
      });

      // 3. GEO/LLM SEO Text-to-Schema Verification
      test(`On-page text contains Organization schema details for /${pageName}`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        await page.waitForLoadState('domcontentloaded');
        const bodyText = await page.innerText('body');
        
        const scripts = page.locator('script[type="application/ld+json"]');
        const count = await scripts.count();
        let orgDetails = null;
        
        for (let i = 0; i < count; i++) {
          const content = await scripts.nth(i).textContent();
          const parsed = JSON.parse(content);
          const schemas = extractSchemas(parsed);
          const org = schemas.find(s => {
            const types = Array.isArray(s['@type']) ? s['@type'] : [s['@type']];
            return types.includes('Organization');
          });
          if (org) {
            orgDetails = org;
            break;
          }
        }
        
        expect(orgDetails).not.toBeNull();
        expect(bodyText).toContain(orgDetails.name);
        
        if (orgDetails.address) {
          expect(bodyText).toContain(orgDetails.address.streetAddress);
          expect(bodyText).toContain(orgDetails.address.addressLocality);
          expect(bodyText).toContain(orgDetails.address.postalCode);
        }
        
        const email = orgDetails.email || (orgDetails.contactPoint && orgDetails.contactPoint.email);
        if (email) {
          expect(bodyText).toContain(email);
        }
      });

      // 4. Broken Internal Anchor Links
      test(`All internal anchor links on /${pageName} are valid`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        
        const anchors = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a'));
          return links
            .map(a => a.getAttribute('href'))
            .filter(href => href && href.startsWith('#') && href.length > 1);
        });
        
        for (const anchor of anchors) {
          const id = anchor.substring(1);
          const element = page.locator(`#${id}`);
          const count = await element.count();
          expect(count, `Element with id "${id}" should exist on /${pageName} for anchor link "${anchor}"`).toBeGreaterThan(0);
        }
      });

      // 5. URL Format Consistency
      test(`URL format consistency on /${pageName}`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        
        const internalLinks = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a'));
          return links
            .map(a => a.getAttribute('href'))
            .filter(href => href && !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('mailto:') && !href.startsWith('http'));
        });
        
        const cleanPaths = ['/vertriebspartner', '/agenturen', '/impressum', '/index'];
        const htmlPaths = ['vertriebspartner.html', 'agenturen.html', 'impressum.html', 'index.html'];
        
        let hasClean = false;
        let hasHtml = false;
        
        for (const href of internalLinks) {
          const cleanHref = href.split('?')[0].split('#')[0];
          if (cleanPaths.some(p => cleanHref === p || cleanHref === p + '/')) {
            hasClean = true;
          }
          if (htmlPaths.some(p => cleanHref === p || cleanHref.endsWith('/' + p))) {
            hasHtml = true;
          }
        }
        
        expect(hasClean && hasHtml, `Page /${pageName} mixes clean paths and .html paths, causing crawler duplication risk`).toBe(false);
      });

      // 6. Image Alt Quality Check
      test(`All images on /${pageName} have descriptive alt text`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        
        const images = page.locator('img');
        const count = await images.count();
        
        for (let i = 0; i < count; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          const src = await img.getAttribute('src');
          
          expect(alt, `Image with src "${src}" is missing the alt attribute`).not.toBeNull();
          
          const trimmedAlt = alt.trim();
          expect(trimmedAlt.length, `Image with src "${src}" has an empty alt attribute`).toBeGreaterThan(0);
          
          const genericPattern = /^(image|img|photo|pic|picture|logo|icon|placeholder)(\.(png|jpg|jpeg|gif|webp|svg))?$/i;
          expect(genericPattern.test(trimmedAlt), `Image with src "${src}" has generic/poor alt text: "${alt}"`).toBe(false);
          
          const endsWithExt = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(trimmedAlt);
          expect(endsWithExt, `Image with src "${src}" has an alt text ending with file extension: "${alt}"`).toBe(false);
        }
      });

      // 7. Social Media Meta Tags (Open Graph)
      test(`Social Media Meta Tags (Open Graph) on /${pageName}`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        
        const ogTitle = page.locator('meta[property="og:title"]');
        const ogDesc = page.locator('meta[property="og:description"]');
        const ogUrl = page.locator('meta[property="og:url"]');
        const ogType = page.locator('meta[property="og:type"]');
        
        await expect(ogTitle, `Open Graph Title should be present on /${pageName}`).toBeAttached();
        await expect(ogDesc, `Open Graph Description should be present on /${pageName}`).toBeAttached();
        await expect(ogUrl, `Open Graph URL should be present on /${pageName}`).toBeAttached();
        await expect(ogType, `Open Graph Type should be present on /${pageName}`).toBeAttached();
      });

      // 8. Viewport Readiness
      test(`Mobile viewport meta tag on /${pageName}`, async ({ page }) => {
        await page.goto(`/${pageName}`);
        const viewport = page.locator('meta[name="viewport"]');
        await expect(viewport).toBeAttached();
        const content = await viewport.getAttribute('content');
        expect(content).toContain('width=device-width');
        expect(content).toContain('initial-scale=1');
      });

    });

  });

});
