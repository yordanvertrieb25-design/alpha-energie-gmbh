# Test Infrastructure Specification (TEST_INFRA.md)

## Test Philosophy
Our E2E test philosophy rests on **genuine validation** and **zero shortcuts**. We treat search engines as first-class citizens of our application. All SEO configurations, metadata schemas, response headers, routing boundary conditions, and cross-feature interactions must be verified via actual browser automation (Playwright) and network-level request assertions. This ensures that:
- Search engines see exact, highly indexable pages with proper structural semantic elements.
- Administrative, staging, and user-facing dashboards are cleanly hidden from indexes using robust `noindex, nofollow` controls.
- Structural Schema.org JSON-LD data correctly reflects company attributes and matches the page hierarchy.
- Robots.txt and sitemap.xml files are well-formed and dynamically aligned without sync mismatches.

## Feature Inventory
We test a total of **97 test cases** partitioned across four tiers of complexity:
- **Tier 1: Feature Coverage (25 tests)**:
  - Robots.txt base properties, content-type, permissions (User-agent: *, GPTBot, CCBot, Google-Extended) with wildcard fallbacks, and sitemap references.
  - Sitemap.xml availability, XML content-type, and presence of standard indexable pages (supporting nested sitemap index `<sitemapindex>` structures with recursive aggregation using prefix-tolerant `.localName` check, dynamically extracting the base URL/origin from the current `page.url()`, and circular sitemap index protection via a `visited` Set).
  - Absence of noindex or none tags in all crawler-specific robots meta tags (e.g. `googlebot`, `bingbot`, etc.) on whitelisted indexable pages.
  - Structural metadata existence (title, description, single H1) and JSON-LD scripts on indexable pages.
- **Tier 2: Boundary & Corner Cases (42 tests)**:
  - Case-sensitivity of crawler requests (e.g. `/ROBOTS.TXT` handling).
  - Syntax verification for robots.txt (allowing empty `Disallow:` values) and sitemap.xml namespace and URL formatting.
  - Casing variations in meta robots and crawler-specific tags.
  - Scan-wide verification that every non-indexable HTML file has a generic `robots` meta tag specifying `noindex` or `none` (split by comma/whitespace to check exact directive keywords, preventing substring matches like `not-noindex`), and if other crawler-specific tags (e.g. `googlebot`, `bingbot`) exist, NONE of them contains `index` or `all` or any directive that permits crawling (preventing conflicts).
  - Content length validation (titles 10-70 chars, descriptions 50-160 chars).
  - Uniqueness assertions for titles and descriptions across the indexable set.
  - Strict JSON syntax, schema.org context validation (preventing context URL bypasses), graph structure traversal, and strict array context validation (ensuring every schema object in arrays and `@graph` arrays has a valid context instead of using a loose `some()` check).
- **Tier 3: Cross-Feature Combinations (10 tests)**:
  - Cross-referencing sitemap.xml lists against meta tags: sitemap pages must be indexable (no `noindex`/`none`); non-sitemap pages must be noindexed.
  - Absolute alignment between robots.txt blocks and sitemap URLs using block-by-block parsing with regex trailing `$` anchors and literal `?` escapes.
  - Matching breadcrumb schema item URLs with actual browser page locations (comparing pathnames instead of absolute URLs).
  - Link health check: validation that navigation links point only to 200 OK indexable routes (with clean URL normalization mapping back to HTML paths; for absolute URLs pointing to production domains `alpha-energie.de` or `www.alpha-energie.de`, they are translated to target the local test server dynamically, and other external absolute host requests are skipped), and footer links targeting legal pages correctly serve `noindex` or `none` (checked via try-catch loop isolation to collect all errors).
- **Tier 4: Real-World Application (20 tests)**:
  - User-Agent spoofing to simulate Googlebot, GPTBot, and CCBot.
  - Extraction and matching of schema data properties (Organization details like name, logo, contact points) with business definitions.
  - Verification of canonical links matching the exact URLs in sitemap.xml.
  - Dynamic SEO Guideline Assertions:
    - **Image Alt Attributes**: Verification that all images on indexable pages have the `alt` attribute present AND it is not empty or space-only (meaningful text length > 0: `expect(alt.trim().length).toBeGreaterThan(0)`).
    - **Heading Hierarchy**: Validation in DOM order that each heading level is at most 1 level deeper than the level of the *immediately preceding* heading element (`level <= prevLevel + 1`).
    - **Descriptive Anchor Text**: Case-insensitive check against a generic words list (including slang like "klick"), with prior trimming, normalization of extra spaces, and stripping of common punctuation and angle brackets (e.g. `!`, `.`, `,`, `?`, `:`, `-`, `–`, `—`, `→`, `(`, `)`, `<`, `>`) to prevent bypasses, verifying that the normalized text does not contain bad multi-word generic phrases as substrings.

## Test Architecture
```
                                 [Playwright Runner]
                                          |
                     +--------------------+--------------------+
                     |                                         |
            [Local File System]                         [Local WebServer]
                     |                                         |
           (Dynamic HTML Scanning)                        (Express Server)
                     |                                         |
     [scanHtmlFiles() recursively finds pages]            [Serves HTML files]
                     |                                         |
                     v                                         v
          Categorizes indexable vs.                     navigates to pages,
             non-indexable pages                        queries elements,
                     |                                 simulates User-Agents
                     +--------------------+--------------------+
                                          |
                                          v
                              [Assert Expected Rules]
```

- **Dynamic File Scanning**: The runner parses the repository tree recursively, excluding administrative/tool folders (like `.git`, `node_modules`, `tests`, `.agents`), and identifies all HTML files. These are split into a whitelist of indexable files and a dynamic list of non-whitelisted (non-indexable) files.
- **Server Spawning**: Playwright's `webServer` block starts `server.js` asynchronously on port 3000.
- **Network & DOM Assertions**: Tests execute both API checks (network request/response headers) and page checks (DOM querying, script extraction, and header spoofing).

## Coverage Thresholds
- **File Coverage**: 100% of discovered HTML files must be scanned and tested.
- **Assertion Coverage**:
  - robots.txt: 100% compliance with crawl permissions.
  - sitemap.xml: 100% URL validity and namespace.
  - Meta tags: 100% of pages mapped correctly to their indexability state.
  - Structured Data: 100% of indexable pages have valid JSON-LD.
- **Target Pass Rate**: 100% passing tests post-implementation.
