const { test, expect } = require('@playwright/test');
const { crawlWebsiteForEmail } = require('../services/scraperService');
const { sendCampaign } = require('../services/emailCampaignService');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const net = require('net');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'alpha-admin-2026';

// Helper function to parse CSV robustly (RFC 4180)
function parseCSV(csvContent) {
  const records = [];
  let currentField = '';
  let currentRecord = [];
  let inQuotes = false;
  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    if (char === '"') {
      if (inQuotes && csvContent[i + 1] === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ';' && !inQuotes) {
      currentRecord.push(currentField);
      currentField = '';
    } else if (char === '\n' && !inQuotes) {
      if (currentField.endsWith('\r')) {
        currentField = currentField.slice(0, -1);
      }
      currentRecord.push(currentField);
      records.push(currentRecord);
      currentRecord = [];
      currentField = '';
    } else if (char === '\r' && !inQuotes) {
      if (csvContent[i + 1] !== '\n') {
        currentRecord.push(currentField);
        records.push(currentRecord);
        currentRecord = [];
        currentField = '';
      }
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRecord.length > 0) {
    currentRecord.push(currentField);
    records.push(currentRecord);
  }
  return records;
}

test.describe('Kampagne Backend Stress Tests', () => {
  let token = '';

  test.beforeAll(async () => {
    // Set 120s timeout for the beforeAll hook itself
    test.setTimeout(120000);
    
    // Retry login up to 5 times with 1s delay to handle server startup / recycle
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const response = await axios.post(`${BASE_URL}/api/admin/login`, {
          password: ADMIN_PASSWORD
        });
        token = response.data.token;
        console.log('[Stress Test] Successfully retrieved admin login token.');
        break;
      } catch (err) {
        console.warn(`[Stress Test] Admin login attempt ${attempt} failed: ${err.message}`);
        if (attempt === 5) {
          throw new Error(`Failed to get admin token after 5 attempts: ${err.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  });

  test.beforeEach(async () => {
    // Set 120s timeout for every test in this suite
    test.setTimeout(120000);
  });

  // --- STRESS TEST 1: Scraping crawler resilience ---
  test.describe('Scraping Crawler Resilience', () => {
    let mockHttpServer;
    const MOCK_PORT = 4001;

    test.beforeAll(async () => {
      // Create a mock server that returns malformed HTML, no email addresses, or massive text inputs
      mockHttpServer = http.createServer((req, res) => {
        if (req.url === '/malformed') {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body>
                <div>Malformed HTML: unclosed tags, bad headers, nested garbage.
                <span>Unclosed Tag
                <script>some bad javascript;
                <a href="mailto:scraped-email@test.de">scraped-email@test.de</a>
                <div>missing closures
          `);
        } else if (req.url === '/no-email') {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>No email</title></head>
            <body>
              <p>This page contains no email addresses whatsoever. Only links.</p>
              <a href="https://example.com">Visit us</a>
              <p>Contact: phone 123456789</p>
            </body>
            </html>
          `);
        } else if (req.url === '/massive') {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          // Generate massive text input (12 Megabytes)
          const size = 12 * 1024 * 1024;
          const chunk = 'This is a long sentence with some characters. '.repeat(100);
          const chunkCount = Math.floor(size / chunk.length);
          
          for (let i = 0; i < chunkCount; i++) {
            res.write(chunk);
          }
          // Write an email near the end
          res.write('\r\ncontact-at-end@massive-domain.com\r\n');
          res.end();
        } else if (req.url === '/hang') {
          // Accept but never respond. This tests the 5s axios timeout.
          // We will let it hang. The connection is held open.
        } else {
          res.writeHead(404);
          res.end();
        }
      });

      await new Promise(resolve => mockHttpServer.listen(MOCK_PORT, resolve));
      console.log(`[Stress Test] Mock HTTP Server listening on port ${MOCK_PORT}`);
    });

    test.afterAll(async () => {
      if (mockHttpServer) {
        await new Promise(resolve => mockHttpServer.close(resolve));
        console.log('[Stress Test] Mock HTTP Server stopped');
      }
    });

    test('should scrape a website with malformed HTML successfully', async () => {
      const email = await crawlWebsiteForEmail(`http://localhost:${MOCK_PORT}/malformed`);
      expect(email).toBe('scraped-email@test.de');
    });

    test('should return null when website has no email addresses without crashing', async () => {
      const email = await crawlWebsiteForEmail(`http://localhost:${MOCK_PORT}/no-email`);
      expect(email).toBeNull();
    });

    test('should handle massive text inputs without crashing or hanging indefinitely', async () => {
      const startTime = Date.now();
      const email = await crawlWebsiteForEmail(`http://localhost:${MOCK_PORT}/massive`);
      const duration = Date.now() - startTime;
      console.log(`[Stress Test] Crawling massive text completed in ${duration}ms. Email found: ${email}`);
      expect(email).toBe('contact-at-end@massive-domain.com');
      expect(duration).toBeLessThan(10000); // Should finish well within 10 seconds
    });

    test('should timeout and return null when website hangs (5s timeout test)', async () => {
      const startTime = Date.now();
      const email = await crawlWebsiteForEmail(`http://localhost:${MOCK_PORT}/hang`);
      const duration = Date.now() - startTime;
      console.log(`[Stress Test] Crawled hanging website in ${duration}ms. Email: ${email}`);
      expect(email).toBeNull();
      expect(duration).toBeGreaterThan(4500); // Axios timeout is set to 5000ms
      expect(duration).toBeLessThan(6500); // Ensure it doesn't hang forever
    });

    test('should block private and loopback IP addresses (SSRF prevention)', async () => {
      const emailPrivate = await crawlWebsiteForEmail('http://10.0.0.1/malformed');
      expect(emailPrivate).toBeNull();

      const emailPrivate2 = await crawlWebsiteForEmail('http://192.168.1.1/index.html');
      expect(emailPrivate2).toBeNull();
    });
  });

  // --- STRESS TEST 2: Semicolon-separated CSV formatting under custom input ---
  test.describe('CSV Formatting and Escaping', () => {
    let testCampaignId;

    test.beforeAll(async () => {
      // Insert a test campaign with a contact containing special characters:
      // quotes, semicolons, and carriage returns
      const campaign = await prisma.campaign.create({
        data: {
          name: 'CSV Stress Campaign',
          industry: 'Solar',
          companySize: 'Mittelstand'
        }
      });
      testCampaignId = campaign.id;

      // Add a contact with adversarial fields
      await prisma.scrapedContact.create({
        data: {
          campaignId: testCampaignId,
          name: 'Solar "Expert" Partner; Gmbh\r\nLine 2 with "Quotes"',
          phone: '+49 170 123456;78',
          website: 'http://example.com/partner;query="value"',
          email: 'info@expert-solar.de',
          status: 'PENDING'
        }
      });
    });

    test.afterAll(async () => {
      if (testCampaignId) {
        // Clean up test data
        await prisma.campaign.delete({
          where: { id: testCampaignId }
        });
      }
    });

    test('should properly escape quotes, semicolons, and carriage returns in CSV', async () => {
      expect(token).toBeDefined();

      const response = await axios.get(`${BASE_URL}/api/campaigns/${testCampaignId}/export`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');

      const csvData = response.data;
      console.log('[Stress Test] Exported CSV raw content:\n', csvData);

      // Parse the CSV using our robust RFC 4180 parser
      const records = parseCSV(csvData);
      
      // We expect header row + 1 contact row
      expect(records.length).toBe(2);

      const header = records[0];
      const contactRow = records[1];

      // Validate header structure
      expect(header).toEqual(['Name', 'Phone', 'Website', 'Email', 'Status', 'CreatedAt']);

      // Validate escaped fields
      expect(contactRow[0]).toBe('Solar "Expert" Partner; Gmbh\r\nLine 2 with "Quotes"');
      expect(contactRow[1]).toBe('+49 170 123456;78');
      expect(contactRow[2]).toBe('http://example.com/partner;query="value"');
      expect(contactRow[3]).toBe('info@expert-solar.de');
      expect(contactRow[4]).toBe('PENDING');
      
      console.log('[Stress Test] CSV parsing verified successfully. All adversarial characters were correctly escaped and parsed.');
    });
  });

  // --- STRESS TEST 3: E-mail campaign background dispatcher resilience ---
  test.describe('Email Campaign Background Dispatcher Resilience', () => {
    let testCampaignId;
    let contactId;
    let hangTcpServer;
    const HANG_SMTP_PORT = 2526;

    test.beforeAll(async () => {
      // Start a TCP server that accepts SMTP connections but hangs completely
      hangTcpServer = net.createServer((socket) => {
        // Just accept but do not send the SMTP 220 greeting. This causes the client to hang.
      });
      await new Promise(resolve => hangTcpServer.listen(HANG_SMTP_PORT, resolve));
      console.log(`[Stress Test] Hanging SMTP TCP Server listening on port ${HANG_SMTP_PORT}`);

      // Create a campaign and a pending contact for testing dispatcher failure
      const campaign = await prisma.campaign.create({
        data: {
          name: 'SMTP Stress Campaign',
          industry: 'Solar',
          companySize: 'Mittelstand'
        }
      });
      testCampaignId = campaign.id;

      const contact = await prisma.scrapedContact.create({
        data: {
          campaignId: testCampaignId,
          name: 'SMTP Test Contact',
          phone: '+49 111 111111',
          website: 'http://smtp-test.de',
          email: 'smtp-recipient@test.de',
          status: 'PENDING'
        }
      });
      contactId = contact.id;
    });

    test.afterAll(async () => {
      if (hangTcpServer) {
        await new Promise(resolve => hangTcpServer.close(resolve));
        console.log('[Stress Test] Hanging SMTP TCP Server stopped');
      }

      if (testCampaignId) {
        // Clean up test data
        await prisma.campaign.delete({
          where: { id: testCampaignId }
        });
      }
    });

    test('should log failure in EmailLog table when SMTP credentials are bad instead of crashing', async () => {
      // Call sendCampaign with invalid credentials/host that rejects connection
      const badSettings = {
        smtpHost: 'localhost',
        smtpPort: '2599', // No server running here, will trigger connection refused
        smtpUser: 'wrong-user',
        smtpPass: 'wrong-pass',
        smtpFrom: 'sender@alpha-energie.de'
      };

      console.log('[Stress Test] Running sendCampaign with bad SMTP credentials...');
      const results = await sendCampaign(testCampaignId, badSettings);

      expect(results.sent).toBe(0);
      expect(results.failed).toBe(1);

      // Verify DB logs
      const updatedContact = await prisma.scrapedContact.findUnique({
        where: { id: contactId }
      });
      expect(updatedContact.status).toBe('FAILED');

      const emailLog = await prisma.emailLog.findFirst({
        where: { scrapedContactId: contactId }
      });
      expect(emailLog).not.toBeNull();
      expect(emailLog.status).toBe('FAILED');
      expect(emailLog.errorMessage).toMatch(/(connect|ECONNREFUSED|ETIMEDOUT)/i);
      console.log(`[Stress Test] Bad SMTP credentials handled and logged. Error message: ${emailLog.errorMessage}`);
    });

    test('should log failure in EmailLog table when SMTP connection hangs instead of crashing', async () => {
      // Reset contact status back to PENDING first
      await prisma.scrapedContact.update({
        where: { id: contactId },
        data: { status: 'PENDING' }
      });

      // Call sendCampaign with the hanging SMTP server settings
      const hangSettings = {
        smtpHost: 'localhost',
        smtpPort: HANG_SMTP_PORT.toString(),
        smtpUser: 'user',
        smtpPass: 'pass',
        smtpFrom: 'sender@alpha-energie.de'
      };

      console.log('[Stress Test] Running sendCampaign with hanging SMTP server (will wait for timeout)...');
      const startTime = Date.now();
      const results = await sendCampaign(testCampaignId, hangSettings);
      const duration = Date.now() - startTime;

      console.log(`[Stress Test] sendCampaign completed in ${duration}ms. Results:`, results);

      expect(results.sent).toBe(0);
      expect(results.failed).toBe(1);
      // Nodemailer timeout is set to 10000ms. So it should take slightly more than 10 seconds.
      expect(duration).toBeGreaterThan(9500); 

      // Verify DB logs
      const updatedContact = await prisma.scrapedContact.findUnique({
        where: { id: contactId }
      });
      expect(updatedContact.status).toBe('FAILED');

      const emailLog = await prisma.emailLog.findFirst({
        where: { scrapedContactId: contactId },
        orderBy: { sentAt: 'desc' } // Get the latest log
      });
      expect(emailLog).not.toBeNull();
      expect(emailLog.status).toBe('FAILED');
      expect(emailLog.errorMessage).toMatch(/(Greeting never received|ETIMEDOUT|timeout)/i);
      console.log(`[Stress Test] Hanging SMTP connection handled and logged. Error message: ${emailLog.errorMessage}`);
    });
  });
});
