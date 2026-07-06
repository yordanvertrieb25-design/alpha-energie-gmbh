# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kampagne_stress.spec.js >> Kampagne Backend Stress Tests >> CSV Formatting under adversarial custom input >> GET /api/campaigns/:id/export - should export with proper double-quote escaping for quotes, semicolons, and carriage returns
- Location: tests\kampagne_stress.spec.js:231:5

# Error details

```
AggregateError: 
```

# Test source

```ts
  134 | 
  135 |   test.afterAll(async () => {
  136 |     if (mockHttpServer) {
  137 |       await new Promise(resolve => mockHttpServer.close(resolve));
  138 |     }
  139 |     if (mockSmtpHangServer) {
  140 |       await new Promise(resolve => mockSmtpHangServer.close(resolve));
  141 |     }
  142 |     await prisma.$disconnect();
  143 |   });
  144 | 
  145 |   // 1. Scraping crawler resilience
  146 |   test.describe('Scraping Crawler Resilience', () => {
  147 |     test('Crawl website with malformed HTML - should successfully parse emails', async () => {
  148 |       const email = await crawlWebsiteForEmail(`http://127.0.0.1:${mockHttpPort}/malformed`);
  149 |       expect(email).toBe('test@example.com');
  150 |     });
  151 | 
  152 |     test('Crawl website with no email addresses - should return null', async () => {
  153 |       const email = await crawlWebsiteForEmail(`http://127.0.0.1:${mockHttpPort}/no-email`);
  154 |       expect(email).toBeNull();
  155 |     });
  156 | 
  157 |     test('Crawl website with massive text input (10MB) - should extract email and not crash', async () => {
  158 |       const startTime = Date.now();
  159 |       const email = await crawlWebsiteForEmail(`http://127.0.0.1:${mockHttpPort}/massive`);
  160 |       const duration = Date.now() - startTime;
  161 |       console.log(`Massive crawl completed in ${duration}ms`);
  162 |       expect(email).toBe('info@massive-payload.de');
  163 |     });
  164 | 
  165 |     test('Crawl website that hangs - should timeout (5s) and return null instead of hanging indefinitely', async () => {
  166 |       const startTime = Date.now();
  167 |       const email = await crawlWebsiteForEmail(`http://127.0.0.1:${mockHttpPort}/hang`);
  168 |       const duration = Date.now() - startTime;
  169 |       console.log(`Hanging crawl completed in ${duration}ms`);
  170 |       expect(email).toBeNull();
  171 |       expect(duration).toBeLessThan(7500); // Axios timeout is 5000ms + network overhead, should be < 7.5s
  172 |     });
  173 |   });
  174 | 
  175 |   // 2. CSV formatting and escaping
  176 |   test.describe('CSV Formatting under adversarial custom input', () => {
  177 |     let campaign;
  178 | 
  179 |     test.beforeAll(async () => {
  180 |       // Create a test campaign with adversarial inputs
  181 |       campaign = await prisma.campaign.create({
  182 |         data: {
  183 |           name: 'Adversarial CSV Campaign',
  184 |           industry: 'Testing',
  185 |           companySize: '1'
  186 |         }
  187 |       });
  188 | 
  189 |       const adversarialContacts = [
  190 |         {
  191 |           campaignId: campaign.id,
  192 |           name: 'Name "With" Quotes',
  193 |           phone: '+49;123;456',
  194 |           website: 'http://example.com/test?param=1&other=2',
  195 |           email: 'quotes@example.com',
  196 |           status: 'PENDING'
  197 |         },
  198 |         {
  199 |           campaignId: campaign.id,
  200 |           name: 'Name\rWith\nNewlines',
  201 |           phone: '+49-000-000',
  202 |           website: 'http://example.com',
  203 |           email: 'newlines@example.com',
  204 |           status: 'PENDING'
  205 |         },
  206 |         {
  207 |           campaignId: campaign.id,
  208 |           name: 'Name "With" Quotes, ;Semicolons; & \r\nNewlines',
  209 |           phone: '+49;999;999',
  210 |           website: 'http://example.com',
  211 |           email: 'combined@example.com',
  212 |           status: 'PENDING'
  213 |         }
  214 |       ];
  215 | 
  216 |       for (const contact of adversarialContacts) {
  217 |         await prisma.scrapedContact.create({
  218 |           data: contact
  219 |         });
  220 |       }
  221 |     });
  222 | 
  223 |     test.afterAll(async () => {
  224 |       if (campaign) {
  225 |         await prisma.campaign.delete({
  226 |           where: { id: campaign.id }
  227 |         });
  228 |       }
  229 |     });
  230 | 
  231 |     test('GET /api/campaigns/:id/export - should export with proper double-quote escaping for quotes, semicolons, and carriage returns', async () => {
  232 |       expect(adminToken).toBeDefined();
  233 | 
> 234 |       const response = await axios.get(`${BASE_URL}/api/campaigns/${campaign.id}/export`, {
      |                        ^ AggregateError: 
  235 |         headers: {
  236 |           Authorization: `Bearer ${adminToken}`
  237 |         }
  238 |       });
  239 | 
  240 |       expect(response.status).toBe(200);
  241 |       expect(response.headers['content-type']).toContain('text/csv');
  242 | 
  243 |       const csvData = response.data;
  244 |       console.log("Raw CSV data returned:\n", csvData);
  245 | 
  246 |       const parsedRows = parseSemicolonCSV(csvData);
  247 |       
  248 |       // We expect header row + 3 contact rows = 4 rows
  249 |       expect(parsedRows.length).toBe(4);
  250 | 
  251 |       // Verify header row
  252 |       expect(parsedRows[0]).toEqual(['Name', 'Phone', 'Website', 'Email', 'Status', 'CreatedAt']);
  253 | 
  254 |       // Row 1: Name "With" Quotes
  255 |       expect(parsedRows[1][0]).toBe('Name "With" Quotes');
  256 |       expect(parsedRows[1][1]).toBe('+49;123;456'); // Semicolons intact inside field
  257 |       expect(parsedRows[1][3]).toBe('quotes@example.com');
  258 | 
  259 |       // Row 2: Name\rWith\nNewlines
  260 |       expect(parsedRows[2][0]).toBe('Name\rWith\nNewlines');
  261 |       expect(parsedRows[2][3]).toBe('newlines@example.com');
  262 | 
  263 |       // Row 3: Combined
  264 |       expect(parsedRows[3][0]).toBe('Name "With" Quotes, ;Semicolons; & \r\nNewlines');
  265 |       expect(parsedRows[3][1]).toBe('+49;999;999');
  266 |       expect(parsedRows[3][3]).toBe('combined@example.com');
  267 | 
  268 |       // Check for each parsed row that it has exactly 6 columns
  269 |       for (const row of parsedRows) {
  270 |         expect(row.length).toBe(6);
  271 |       }
  272 |     });
  273 |   });
  274 | 
  275 |   // 3. E-mail campaign background dispatcher resilience
  276 |   test.describe('E-mail Campaign Background Dispatcher Resilience', () => {
  277 |     let campaign;
  278 |     let contact;
  279 | 
  280 |     test.beforeEach(async () => {
  281 |       campaign = await prisma.campaign.create({
  282 |         data: {
  283 |           name: 'SMTP Failure Test Campaign',
  284 |           industry: 'Solar',
  285 |           companySize: 'Mittelstand'
  286 |         }
  287 |       });
  288 | 
  289 |       contact = await prisma.scrapedContact.create({
  290 |         data: {
  291 |           campaignId: campaign.id,
  292 |           name: 'Solar Tech Hamburg',
  293 |           phone: '+49 40 1234567',
  294 |           website: 'http://example.com',
  295 |           email: 'solar-tech-hamburg@example.com',
  296 |           status: 'PENDING'
  297 |         }
  298 |       });
  299 |     });
  300 | 
  301 |     test.afterEach(async () => {
  302 |       if (campaign) {
  303 |         await prisma.campaign.delete({
  304 |           where: { id: campaign.id }
  305 |         });
  306 |       }
  307 |     });
  308 | 
  309 |     test('POST /api/campaigns/:id/send - bad SMTP credentials (port connection refused) should log failure and update contact to FAILED', async () => {
  310 |       expect(adminToken).toBeDefined();
  311 | 
  312 |       const payload = {
  313 |         smtpHost: '127.0.0.1',
  314 |         smtpPort: '9999', // No server listening on 9999
  315 |         smtpUser: 'bad_user',
  316 |         smtpPass: 'bad_pass',
  317 |         smtpFrom: 'noreply@alpha-energie.de'
  318 |       };
  319 | 
  320 |       const startTime = Date.now();
  321 |       const response = await axios.post(`${BASE_URL}/api/campaigns/${campaign.id}/send`, payload, {
  322 |         headers: {
  323 |           Authorization: `Bearer ${adminToken}`
  324 |         }
  325 |       });
  326 |       const duration = Date.now() - startTime;
  327 |       console.log(`Bad SMTP credentials request completed in ${duration}ms`);
  328 | 
  329 |       expect(response.status).toBe(200);
  330 |       expect(response.data.success).toBe(true);
  331 |       expect(response.data.sent).toBe(0);
  332 |       expect(response.data.failed).toBe(1);
  333 | 
  334 |       // Check DB update
```