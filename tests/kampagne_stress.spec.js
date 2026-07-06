const { test, expect } = require('@playwright/test');
const axios = require('axios');
const http = require('http');
const net = require('net');
const { PrismaClient } = require('@prisma/client');
const { crawlWebsiteForEmail } = require('../services/scraperService');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'alpha-admin-2026';

// Custom robust CSV parser to handle quotes, semicolons, and newlines
function parseSemicolonCSV(csvText) {
  const result = [];
  let row = [];
  let currentField = '';
  let insideQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // skip next quote
        } else {
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ';') {
        row.push(currentField);
        currentField = '';
      } else if (char === '\r' && nextChar === '\n') {
        row.push(currentField);
        result.push(row);
        row = [];
        currentField = '';
        i++; // skip \n
      } else if (char === '\n') {
        row.push(currentField);
        result.push(row);
        row = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }
  if (row.length > 0 || currentField !== '') {
    row.push(currentField);
    result.push(row);
  }
  return result;
}

test.describe('Kampagne Backend Stress Tests', () => {
  let adminToken = '';
  let mockHttpServer;
  let mockHttpPort;
  let mockSmtpHangServer;
  let mockSmtpHangPort;

  test.beforeAll(async () => {
    // 1. Get Admin Token
    try {
      const response = await axios.post(`${BASE_URL}/api/admin/login`, {
        password: ADMIN_PASSWORD
      });
      adminToken = response.data.token;
    } catch (err) {
      console.warn("Could not log in as admin. Make sure the server is running or configured correctly.", err.message);
    }

    // 2. Start Mock HTTP Server for Scraping Tests
    mockHttpServer = http.createServer((req, res) => {
      if (req.url === '/malformed') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><head><title>Malformed</title></head><body><div class="test" >Email: <a>test@example.com</a> <p href="abc" <span>some broken html</span> <script>console.log("no-email");</script></body>');
      } else if (req.url === '/no-email') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body><h1>Hello World</h1><p>No email address here!</p></body></html>');
      } else if (req.url === '/massive') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        // Return 10MB of text with email at the end
        const chunkSize = 1024 * 1024; // 1MB
        res.write('<html><body>');
        for (let i = 0; i < 10; i++) {
          res.write('a'.repeat(chunkSize));
        }
        res.end('info@massive-payload.de</body></html>');
      } else if (req.url === '/hang') {
        // Keep connection open but don't write anything. Timeout in axios is 5000ms.
        setTimeout(() => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('too-late@example.com');
        }, 8000);
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise((resolve) => {
      mockHttpServer.listen(0, '127.0.0.1', () => {
        mockHttpPort = mockHttpServer.address().port;
        console.log(`Mock HTTP Server listening on port ${mockHttpPort}`);
        resolve();
      });
    });

    // 3. Start Mock SMTP Hang Server
    mockSmtpHangServer = net.createServer((socket) => {
      // Just keep socket open, send no SMTP greeting (simulates SMTP port hang)
    });

    await new Promise((resolve) => {
      mockSmtpHangServer.listen(0, '127.0.0.1', () => {
        mockSmtpHangPort = mockSmtpHangServer.address().port;
        console.log(`Mock SMTP Hang Server listening on port ${mockSmtpHangPort}`);
        resolve();
      });
    });
  });

  test.afterAll(async () => {
    if (mockHttpServer) {
      await new Promise(resolve => mockHttpServer.close(resolve));
    }
    if (mockSmtpHangServer) {
      await new Promise(resolve => mockSmtpHangServer.close(resolve));
    }
    await prisma.$disconnect();
  });

  // 1. Scraping crawler resilience
  test.describe('Scraping Crawler Resilience', () => {
    test('Crawl website with malformed HTML - should successfully parse emails', async () => {
      const email = await crawlWebsiteForEmail(`http://127.0.0.1:${mockHttpPort}/malformed`);
      expect(email).toBe('test@example.com');
    });

    test('Crawl website with no email addresses - should return null', async () => {
      const email = await crawlWebsiteForEmail(`http://127.0.0.1:${mockHttpPort}/no-email`);
      expect(email).toBeNull();
    });

    test('Crawl website with massive text input (10MB) - should extract email and not crash', async () => {
      const startTime = Date.now();
      const email = await crawlWebsiteForEmail(`http://127.0.0.1:${mockHttpPort}/massive`);
      const duration = Date.now() - startTime;
      console.log(`Massive crawl completed in ${duration}ms`);
      expect(email).toBe('info@massive-payload.de');
    });

    test('Crawl website that hangs - should timeout (5s) and return null instead of hanging indefinitely', async () => {
      const startTime = Date.now();
      const email = await crawlWebsiteForEmail(`http://127.0.0.1:${mockHttpPort}/hang`);
      const duration = Date.now() - startTime;
      console.log(`Hanging crawl completed in ${duration}ms`);
      expect(email).toBeNull();
      expect(duration).toBeLessThan(7500); // Axios timeout is 5000ms + network overhead, should be < 7.5s
    });
  });

  // 2. CSV formatting and escaping
  test.describe('CSV Formatting under adversarial custom input', () => {
    let campaign;

    test.beforeAll(async () => {
      // Create a test campaign with adversarial inputs
      campaign = await prisma.campaign.create({
        data: {
          name: 'Adversarial CSV Campaign',
          industry: 'Testing',
          companySize: '1'
        }
      });

      const adversarialContacts = [
        {
          campaignId: campaign.id,
          name: 'Name "With" Quotes',
          phone: '+49;123;456',
          website: 'http://example.com/test?param=1&other=2',
          email: 'quotes@example.com',
          status: 'PENDING'
        },
        {
          campaignId: campaign.id,
          name: 'Name\rWith\nNewlines',
          phone: '+49-000-000',
          website: 'http://example.com',
          email: 'newlines@example.com',
          status: 'PENDING'
        },
        {
          campaignId: campaign.id,
          name: 'Name "With" Quotes, ;Semicolons; & \r\nNewlines',
          phone: '+49;999;999',
          website: 'http://example.com',
          email: 'combined@example.com',
          status: 'PENDING'
        }
      ];

      for (const contact of adversarialContacts) {
        await prisma.scrapedContact.create({
          data: contact
        });
      }
    });

    test.afterAll(async () => {
      if (campaign) {
        await prisma.campaign.delete({
          where: { id: campaign.id }
        });
      }
    });

    test('GET /api/campaigns/:id/export - should export with proper double-quote escaping for quotes, semicolons, and carriage returns', async () => {
      expect(adminToken).toBeDefined();

      const response = await axios.get(`${BASE_URL}/api/campaigns/${campaign.id}/export`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');

      const csvData = response.data;
      console.log("Raw CSV data returned:\n", csvData);

      const parsedRows = parseSemicolonCSV(csvData);
      
      // We expect header row + 3 contact rows = 4 rows
      expect(parsedRows.length).toBe(4);

      // Verify header row
      expect(parsedRows[0]).toEqual(['Name', 'Phone', 'Website', 'Email', 'Status', 'CreatedAt']);

      // Row 1: Name "With" Quotes
      expect(parsedRows[1][0]).toBe('Name "With" Quotes');
      expect(parsedRows[1][1]).toBe('+49;123;456'); // Semicolons intact inside field
      expect(parsedRows[1][3]).toBe('quotes@example.com');

      // Row 2: Name\rWith\nNewlines
      expect(parsedRows[2][0]).toBe('Name\rWith\nNewlines');
      expect(parsedRows[2][3]).toBe('newlines@example.com');

      // Row 3: Combined
      expect(parsedRows[3][0]).toBe('Name "With" Quotes, ;Semicolons; & \r\nNewlines');
      expect(parsedRows[3][1]).toBe('+49;999;999');
      expect(parsedRows[3][3]).toBe('combined@example.com');

      // Check for each parsed row that it has exactly 6 columns
      for (const row of parsedRows) {
        expect(row.length).toBe(6);
      }
    });
  });

  // 3. E-mail campaign background dispatcher resilience
  test.describe('E-mail Campaign Background Dispatcher Resilience', () => {
    let campaign;
    let contact;

    test.beforeEach(async () => {
      campaign = await prisma.campaign.create({
        data: {
          name: 'SMTP Failure Test Campaign',
          industry: 'Solar',
          companySize: 'Mittelstand'
        }
      });

      contact = await prisma.scrapedContact.create({
        data: {
          campaignId: campaign.id,
          name: 'Solar Tech Hamburg',
          phone: '+49 40 1234567',
          website: 'http://example.com',
          email: 'solar-tech-hamburg@example.com',
          status: 'PENDING'
        }
      });
    });

    test.afterEach(async () => {
      if (campaign) {
        await prisma.campaign.delete({
          where: { id: campaign.id }
        });
      }
    });

    test('POST /api/campaigns/:id/send - bad SMTP credentials (port connection refused) should log failure and update contact to FAILED', async () => {
      expect(adminToken).toBeDefined();

      const payload = {
        smtpHost: '127.0.0.1',
        smtpPort: '9999', // No server listening on 9999
        smtpUser: 'bad_user',
        smtpPass: 'bad_pass',
        smtpFrom: 'noreply@alpha-energie.de'
      };

      const startTime = Date.now();
      const response = await axios.post(`${BASE_URL}/api/campaigns/${campaign.id}/send`, payload, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      const duration = Date.now() - startTime;
      console.log(`Bad SMTP credentials request completed in ${duration}ms`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.sent).toBe(0);
      expect(response.data.failed).toBe(1);

      // Check DB update
      const updatedContact = await prisma.scrapedContact.findUnique({
        where: { id: contact.id },
        include: { emailLogs: true }
      });

      expect(updatedContact.status).toBe('FAILED');
      expect(updatedContact.emailLogs.length).toBe(1);
      expect(updatedContact.emailLogs[0].status).toBe('FAILED');
      expect(updatedContact.emailLogs[0].errorMessage).toContain('ECONNREFUSED');
    });

    test('POST /api/campaigns/:id/send - hanging SMTP server connection should timeout and log failure without crashing server', async () => {
      expect(adminToken).toBeDefined();

      const payload = {
        smtpHost: '127.0.0.1',
        smtpPort: mockSmtpHangPort.toString(), // Hangs
        smtpUser: 'hang_user',
        smtpPass: 'hang_pass',
        smtpFrom: 'noreply@alpha-energie.de'
      };

      const startTime = Date.now();
      const response = await axios.post(`${BASE_URL}/api/campaigns/${campaign.id}/send`, payload, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      const duration = Date.now() - startTime;
      console.log(`Hanging SMTP request completed in ${duration}ms`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.sent).toBe(0);
      expect(response.data.failed).toBe(1);

      // Check DB update
      const updatedContact = await prisma.scrapedContact.findUnique({
        where: { id: contact.id },
        include: { emailLogs: true }
      });

      expect(updatedContact.status).toBe('FAILED');
      expect(updatedContact.emailLogs.length).toBe(1);
      expect(updatedContact.emailLogs[0].status).toBe('FAILED');
      
      // Let's print the actual error message and check if the timeout was 10s or 30s or 120s!
      console.log("Hanging SMTP Error Message:", updatedContact.emailLogs[0].errorMessage);
    });
  });
});
