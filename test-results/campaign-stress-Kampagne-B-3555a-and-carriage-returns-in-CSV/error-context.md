# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: campaign-stress.spec.js >> Kampagne Backend Stress Tests >> CSV Formatting and Escaping >> should properly escape quotes, semicolons, and carriage returns in CSV
- Location: tests\campaign-stress.spec.js:212:5

# Error details

```
AggregateError: 
```

# Test source

```ts
  115 |           const chunk = 'This is a long sentence with some characters. '.repeat(100);
  116 |           const chunkCount = Math.floor(size / chunk.length);
  117 |           
  118 |           for (let i = 0; i < chunkCount; i++) {
  119 |             res.write(chunk);
  120 |           }
  121 |           // Write an email near the end
  122 |           res.write('\r\ncontact-at-end@massive-domain.com\r\n');
  123 |           res.end();
  124 |         } else if (req.url === '/hang') {
  125 |           // Accept but never respond. This tests the 5s axios timeout.
  126 |           // We will let it hang. The connection is held open.
  127 |         } else {
  128 |           res.writeHead(404);
  129 |           res.end();
  130 |         }
  131 |       });
  132 | 
  133 |       await new Promise(resolve => mockHttpServer.listen(MOCK_PORT, resolve));
  134 |       console.log(`[Stress Test] Mock HTTP Server listening on port ${MOCK_PORT}`);
  135 |     });
  136 | 
  137 |     test.afterAll(async () => {
  138 |       if (mockHttpServer) {
  139 |         await new Promise(resolve => mockHttpServer.close(resolve));
  140 |         console.log('[Stress Test] Mock HTTP Server stopped');
  141 |       }
  142 |     });
  143 | 
  144 |     test('should scrape a website with malformed HTML successfully', async () => {
  145 |       const email = await crawlWebsiteForEmail(`http://localhost:${MOCK_PORT}/malformed`);
  146 |       expect(email).toBe('scraped-email@test.de');
  147 |     });
  148 | 
  149 |     test('should return null when website has no email addresses without crashing', async () => {
  150 |       const email = await crawlWebsiteForEmail(`http://localhost:${MOCK_PORT}/no-email`);
  151 |       expect(email).toBeNull();
  152 |     });
  153 | 
  154 |     test('should handle massive text inputs without crashing or hanging indefinitely', async () => {
  155 |       const startTime = Date.now();
  156 |       const email = await crawlWebsiteForEmail(`http://localhost:${MOCK_PORT}/massive`);
  157 |       const duration = Date.now() - startTime;
  158 |       console.log(`[Stress Test] Crawling massive text completed in ${duration}ms. Email found: ${email}`);
  159 |       expect(email).toBe('contact-at-end@massive-domain.com');
  160 |       expect(duration).toBeLessThan(10000); // Should finish well within 10 seconds
  161 |     });
  162 | 
  163 |     test('should timeout and return null when website hangs (5s timeout test)', async () => {
  164 |       const startTime = Date.now();
  165 |       const email = await crawlWebsiteForEmail(`http://localhost:${MOCK_PORT}/hang`);
  166 |       const duration = Date.now() - startTime;
  167 |       console.log(`[Stress Test] Crawled hanging website in ${duration}ms. Email: ${email}`);
  168 |       expect(email).toBeNull();
  169 |       expect(duration).toBeGreaterThan(4500); // Axios timeout is set to 5000ms
  170 |       expect(duration).toBeLessThan(6500); // Ensure it doesn't hang forever
  171 |     });
  172 |   });
  173 | 
  174 |   // --- STRESS TEST 2: Semicolon-separated CSV formatting under custom input ---
  175 |   test.describe('CSV Formatting and Escaping', () => {
  176 |     let testCampaignId;
  177 | 
  178 |     test.beforeAll(async () => {
  179 |       // Insert a test campaign with a contact containing special characters:
  180 |       // quotes, semicolons, and carriage returns
  181 |       const campaign = await prisma.campaign.create({
  182 |         data: {
  183 |           name: 'CSV Stress Campaign',
  184 |           industry: 'Solar',
  185 |           companySize: 'Mittelstand'
  186 |         }
  187 |       });
  188 |       testCampaignId = campaign.id;
  189 | 
  190 |       // Add a contact with adversarial fields
  191 |       await prisma.scrapedContact.create({
  192 |         data: {
  193 |           campaignId: testCampaignId,
  194 |           name: 'Solar "Expert" Partner; Gmbh\r\nLine 2 with "Quotes"',
  195 |           phone: '+49 170 123456;78',
  196 |           website: 'http://example.com/partner;query="value"',
  197 |           email: 'info@expert-solar.de',
  198 |           status: 'PENDING'
  199 |         }
  200 |       });
  201 |     });
  202 | 
  203 |     test.afterAll(async () => {
  204 |       if (testCampaignId) {
  205 |         // Clean up test data
  206 |         await prisma.campaign.delete({
  207 |           where: { id: testCampaignId }
  208 |         });
  209 |       }
  210 |     });
  211 | 
  212 |     test('should properly escape quotes, semicolons, and carriage returns in CSV', async () => {
  213 |       expect(token).toBeDefined();
  214 | 
> 215 |       const response = await axios.get(`${BASE_URL}/api/campaigns/${testCampaignId}/export`, {
      |                        ^ AggregateError: 
  216 |         headers: {
  217 |           Authorization: `Bearer ${token}`
  218 |         }
  219 |       });
  220 | 
  221 |       expect(response.status).toBe(200);
  222 |       expect(response.headers['content-type']).toContain('text/csv');
  223 | 
  224 |       const csvData = response.data;
  225 |       console.log('[Stress Test] Exported CSV raw content:\n', csvData);
  226 | 
  227 |       // Parse the CSV using our robust RFC 4180 parser
  228 |       const records = parseCSV(csvData);
  229 |       
  230 |       // We expect header row + 1 contact row
  231 |       expect(records.length).toBe(2);
  232 | 
  233 |       const header = records[0];
  234 |       const contactRow = records[1];
  235 | 
  236 |       // Validate header structure
  237 |       expect(header).toEqual(['Name', 'Phone', 'Website', 'Email', 'Status', 'CreatedAt']);
  238 | 
  239 |       // Validate escaped fields
  240 |       expect(contactRow[0]).toBe('Solar "Expert" Partner; Gmbh\r\nLine 2 with "Quotes"');
  241 |       expect(contactRow[1]).toBe('+49 170 123456;78');
  242 |       expect(contactRow[2]).toBe('http://example.com/partner;query="value"');
  243 |       expect(contactRow[3]).toBe('info@expert-solar.de');
  244 |       expect(contactRow[4]).toBe('PENDING');
  245 |       
  246 |       console.log('[Stress Test] CSV parsing verified successfully. All adversarial characters were correctly escaped and parsed.');
  247 |     });
  248 |   });
  249 | 
  250 |   // --- STRESS TEST 3: E-mail campaign background dispatcher resilience ---
  251 |   test.describe('Email Campaign Background Dispatcher Resilience', () => {
  252 |     let testCampaignId;
  253 |     let contactId;
  254 |     let hangTcpServer;
  255 |     const HANG_SMTP_PORT = 2526;
  256 | 
  257 |     test.beforeAll(async () => {
  258 |       // Start a TCP server that accepts SMTP connections but hangs completely
  259 |       hangTcpServer = net.createServer((socket) => {
  260 |         // Just accept but do not send the SMTP 220 greeting. This causes the client to hang.
  261 |       });
  262 |       await new Promise(resolve => hangTcpServer.listen(HANG_SMTP_PORT, resolve));
  263 |       console.log(`[Stress Test] Hanging SMTP TCP Server listening on port ${HANG_SMTP_PORT}`);
  264 | 
  265 |       // Create a campaign and a pending contact for testing dispatcher failure
  266 |       const campaign = await prisma.campaign.create({
  267 |         data: {
  268 |           name: 'SMTP Stress Campaign',
  269 |           industry: 'Solar',
  270 |           companySize: 'Mittelstand'
  271 |         }
  272 |       });
  273 |       testCampaignId = campaign.id;
  274 | 
  275 |       const contact = await prisma.scrapedContact.create({
  276 |         data: {
  277 |           campaignId: testCampaignId,
  278 |           name: 'SMTP Test Contact',
  279 |           phone: '+49 111 111111',
  280 |           website: 'http://smtp-test.de',
  281 |           email: 'smtp-recipient@test.de',
  282 |           status: 'PENDING'
  283 |         }
  284 |       });
  285 |       contactId = contact.id;
  286 |     });
  287 | 
  288 |     test.afterAll(async () => {
  289 |       if (hangTcpServer) {
  290 |         await new Promise(resolve => hangTcpServer.close(resolve));
  291 |         console.log('[Stress Test] Hanging SMTP TCP Server stopped');
  292 |       }
  293 | 
  294 |       if (testCampaignId) {
  295 |         // Clean up test data
  296 |         await prisma.campaign.delete({
  297 |           where: { id: testCampaignId }
  298 |         });
  299 |       }
  300 |     });
  301 | 
  302 |     test('should log failure in EmailLog table when SMTP credentials are bad instead of crashing', async () => {
  303 |       // Call sendCampaign with invalid credentials/host that rejects connection
  304 |       const badSettings = {
  305 |         smtpHost: 'localhost',
  306 |         smtpPort: '2599', // No server running here, will trigger connection refused
  307 |         smtpUser: 'wrong-user',
  308 |         smtpPass: 'wrong-pass',
  309 |         smtpFrom: 'sender@alpha-energie.de'
  310 |       };
  311 | 
  312 |       console.log('[Stress Test] Running sendCampaign with bad SMTP credentials...');
  313 |       const results = await sendCampaign(testCampaignId, badSettings);
  314 | 
  315 |       expect(results.sent).toBe(0);
```