const { test, expect } = require('@playwright/test');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'alpha-admin-2026';

test.describe('Kampagne Backend API Tests', () => {
  let token = '';
  let campaignId = null;

  test.beforeAll(async () => {
    // 1. Log in as admin to get token
    try {
      const response = await axios.post(`${BASE_URL}/api/admin/login`, {
        password: ADMIN_PASSWORD
      });
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      token = response.data.token;
      expect(token).toBeDefined();
    } catch (err) {
      throw new Error(`Login failed: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }
  });

  test('POST /api/campaigns/scrape - should scrape B2B contacts and save campaign', async () => {
    const payload = {
      name: 'Test Solar Campaign',
      industry: 'Solar',
      companySize: 'Mittelstand'
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/campaigns/scrape`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.campaignId).toBeDefined();
      expect(response.data.contactsCount).toBeGreaterThan(0);

      campaignId = response.data.campaignId;
      console.log(`Created Campaign ID: ${campaignId} with ${response.data.contactsCount} contacts.`);
    } catch (err) {
      throw new Error(`Scrape endpoint failed: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }
  });

  test('GET /api/campaigns/:id/export - should export campaign contacts as semicolon CSV', async () => {
    expect(campaignId).not.toBeNull();

    try {
      const response = await axios.get(`${BASE_URL}/api/campaigns/${campaignId}/export`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      
      const csvData = response.data;
      expect(csvData).toContain('"Name";"Phone";"Website";"Email";"Status";"CreatedAt"');
      
      // Verify rows format (semicolon count per line should match headers count)
      const lines = csvData.split('\r\n').filter(line => line.trim().length > 0);
      expect(lines.length).toBeGreaterThan(1);
      
      for (const line of lines) {
        const semicolons = (line.match(/;/g) || []).length;
        expect(semicolons).toBe(5); // 6 columns implies 5 semicolons
      }

      console.log(`Exported CSV successfully: ${lines.length - 1} contact rows.`);
    } catch (err) {
      throw new Error(`Export endpoint failed: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }
  });

  test('POST /api/campaigns/:id/send - should process email campaign with mock mailer', async () => {
    expect(campaignId).not.toBeNull();

    // Passing empty or mock SMTP details to trigger the simulated mailer
    const payload = {
      smtpHost: '',
      smtpPort: '587',
      smtpUser: '',
      smtpPass: '',
      smtpFrom: 'noreply@alpha-energie.de'
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/campaigns/${campaignId}/send`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.sent).toBeGreaterThan(0);
      expect(response.data.failed).toBe(0);

      console.log(`Sent campaign emails successfully: ${response.data.sent} sent, ${response.data.failed} failed.`);
    } catch (err) {
      throw new Error(`Send campaign endpoint failed: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }
  });
});
