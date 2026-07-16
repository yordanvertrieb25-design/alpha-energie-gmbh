require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { scrapeB2BContacts } = require('./services/scraperService');
const { sendCampaign, sendSingleContact, getFallbackTemplate } = require('./services/emailCampaignService');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Casing check and redirect middleware to prevent mixed-case duplicate content
app.use((req, res, next) => {
    if (req.method === 'GET' && /[A-Z]/.test(req.path)) {
        const lowerPath = req.path.toLowerCase();
        const cleanPath = lowerPath.replace(/\.html$/, '');
        const isHtml = lowerPath.endsWith('.html');
        const isTargetPage = ['/index', '/vertriebspartner', '/agenturen', '/impressum'].includes(cleanPath);
        const isSitemapOrRobots = lowerPath === '/robots.txt' || lowerPath === '/sitemap.xml' || lowerPath.startsWith('/sitemap');

        if (isHtml || isTargetPage || isSitemapOrRobots) {
            const query = req.url.slice(req.path.length);
            return res.redirect(301, lowerPath + query);
        }
    }
    
    // Casing check for robots.txt to prevent case-insensitive matches on Windows environments
    if (req.path.toLowerCase() === '/robots.txt' && req.path !== '/robots.txt') {
        return res.status(404).send('Not Found');
    }
    next();
});


// Serve static files from the root directory
app.use(express.static(path.join(__dirname, 'public'))); // For future public assets if needed
app.use(express.static(__dirname, { extensions: ['html'] })); // Serving the HTML files from the root

// --- API ROUTES ---

// DEBUG: Test Google Places API (temporary - remove after debugging)
app.get('/api/debug/places-test', async (req, res) => {
    const axios = require('axios');
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const result = {
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'N/A',
        nodeEnv: process.env.NODE_ENV || 'not set',
        timestamp: new Date().toISOString()
    };

    if (apiKey) {
        try {
            const query = encodeURIComponent('kiosk in Dortmund, Deutschland');
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&region=de&language=de&key=${apiKey}`;
            const response = await axios.get(url, { timeout: 10000 });
            result.googleStatus = response.data.status;
            result.googleError = response.data.error_message || null;
            result.resultsCount = response.data.results ? response.data.results.length : 0;
            if (response.data.results && response.data.results.length > 0) {
                result.sampleResults = response.data.results.slice(0, 3).map(r => ({
                    name: r.name,
                    address: r.formatted_address
                }));
            }
        } catch (e) {
            result.httpError = e.message;
        }
    }

    res.json(result);
});

// Proxy for egON API to bypass CORS
app.get('/api/proxy/rates', async (req, res) => {
    try {
        const axios = require('axios');
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "No authorization header provided" });
        }

        const queryParams = new URLSearchParams(req.query).toString();
        const targetUrl = `https://gateway.eg-on.com/rates/?${queryParams}`;

        const response = await axios.get(targetUrl, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            },
            validateStatus: () => true // Allow any status code
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Proxy error:", error.message);
        res.status(500).json({ message: "Proxy error: " + error.message });
    }
});

// DEBUG: Clear Database (temporary)
app.get('/api/debug/clear-db', async (req, res) => {
    try {
        await prisma.scrapedContact.deleteMany({});
        await prisma.campaign.deleteMany({});
        res.json({ success: true, message: 'Database cleared successfully!' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 1. Submit Contact Form
app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, email, subject, message } = req.body;
        const newContact = await prisma.contactRequest.create({
            data: { name, phone, email, subject, message }
        });
        res.status(201).json({ success: true, data: newContact });
    } catch (error) {
        console.error("Error saving contact:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 2. Submit Partner Application Form
app.post('/api/partner-application', async (req, res) => {
    try {
        const { fullName, email, phone, experience } = req.body;
        const newApp = await prisma.partnerApplication.create({
            data: { fullName, email, phone, experience }
        });

        // Send email notification to backoffice
        try {
            if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT) || 587,
                    secure: parseInt(process.env.SMTP_PORT) === 465,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });

                const mailOptions = {
                    from: process.env.SMTP_FROM || '"Alpha Energie System" <noreply@alpha-energie.de>',
                    to: 'bewerbung@alpha-energy.network',
                    subject: `Neue Registrierung (Agentur/VP): ${fullName}`,
                    text: `Eine neue Partner-Registrierung ist eingegangen:\n\nName: ${fullName}\nE-Mail: ${email}\nTelefon: ${phone || 'Nicht angegeben'}\nErfahrung: ${experience || 'Nicht angegeben'}\n\nBitte im Admin-Panel prüfen.`
                };

                await transporter.sendMail(mailOptions);
                console.log(`Notification email sent to bewerbung@alpha-energy.network for ${fullName}`);
            } else {
                console.log("SMTP credentials missing. Notification email not sent.");
            }
        } catch (mailError) {
            console.error("Error sending notification email:", mailError);
        }

        res.status(201).json({ success: true, data: newApp });
    } catch (error) {
        console.error("Error saving application:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 2b. Get Available Appointment Slots
app.get('/api/appointments/available', async (req, res) => {
    try {
        const { date } = req.query; // format: YYYY-MM-DD
        if (!date) return res.status(400).json({ success: false, error: 'Date is required' });
        
        const standardSlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
            "15:00", "15:30", "16:00"
        ];
        
        const booked = await prisma.appointment.findMany({
            where: { date }
        });
        const bookedTimes = booked.map(a => a.time);
        
        const available = standardSlots.filter(t => !bookedTimes.includes(t));
        res.json({ success: true, data: available });
    } catch (error) {
        console.error("Error fetching available slots:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 2c. Book an Appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const { name, email, phone, date, time } = req.body;
        
        const existing = await prisma.appointment.findFirst({
            where: { date, time }
        });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Time slot already booked' });
        }
        
        const newAppointment = await prisma.appointment.create({
            data: { name, email, phone, date, time }
        });
        res.status(201).json({ success: true, data: newAppointment });
    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


// 3. Admin Login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    
    if (password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '12h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
    }
});

// Middleware to protect admin routes
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.admin) {
                return next();
            }
        } catch (err) {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }
    }
    return res.status(401).json({ success: false, error: 'Unauthorized' });
};

// 4. Get Admin Data (Protected)
app.get('/api/admin/data', authenticateAdmin, async (req, res) => {
    try {
        const contacts = await prisma.contactRequest.findMany({ orderBy: { createdAt: 'desc' } });
        const applications = await prisma.partnerApplication.findMany({ orderBy: { createdAt: 'desc' } });
        const appointments = await prisma.appointment.findMany({ orderBy: { createdAt: 'desc' } });
        
        res.json({ success: true, data: { contacts, applications, appointments } });
    } catch (error) {
        console.error("Error fetching admin data:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

let cityToPlz = {};
try {
  // path and fs are already required at the top of server.js
  const cityData = fs.readFileSync(path.join(__dirname, 'data', 'cityToPlz.json'), 'utf8');
  cityToPlz = JSON.parse(cityData);
} catch(e) {
  console.error('[Startup] Could not load cityToPlz.json:', e.message);
}

const scraperProgress = require('./services/progressStore');

// 5. Scrape B2B Contacts for Campaign (Protected)
app.post('/api/campaigns/scrape', authenticateAdmin, async (req, res) => {
    try {
        const { name, industry, companySize, pages, requirePhone } = req.body;
        if (!name || !industry || !companySize) {
            return res.status(400).json({ success: false, error: 'Name, industry, and companySize are required' });
        }

        const cityLower = companySize.trim().toLowerCase();
        let targetPlzs = [];
        if (/^\d{5}$/.test(cityLower)) {
            // It's a 5-digit zip code. Find the city that contains it (ignoring numeric key entries)
            for (const [cityKey, cityData] of Object.entries(cityToPlz)) {
                if (!/^\d{5}$/.test(cityKey) && cityData.plzs && cityData.plzs.includes(cityLower)) {
                    targetPlzs = cityData.plzs;
                    console.log(`[Scraper API] PLZ ${cityLower} resolved to city "${cityData.originalName}" with ${targetPlzs.length} PLZs.`);
                    break;
                }
            }
            // Fallback: if PLZ is not associated with any city in the map, scan just this PLZ
            if (targetPlzs.length === 0) {
                targetPlzs = [cityLower];
            }
        } else if (cityToPlz[cityLower]) {
            targetPlzs = cityToPlz[cityLower].plzs;
            console.log(`[Scraper API] City name "${cityLower}" resolved to ${targetPlzs.length} PLZs.`);
        } else {
            console.log(`[Scraper API] No predefined PLZs found for "${companySize}". Using free text query.`);
        }

        // 1. Create campaign
        const campaign = await prisma.campaign.create({
            data: { name, industry, companySize, status: 'RUNNING' }
        });

        const isSync = process.env.NODE_ENV === 'test' || req.body.sync === true;

        if (isSync) {
            // Synchronously await the scraping process
            try {
                await scrapeB2BContacts({ 
                    prisma,
                    campaignId: campaign.id,
                    name, 
                    industry, 
                    companySize, 
                    pages, 
                    requirePhone,
                    targetPlzs,
                    port: PORT 
                });
            } catch (err) {
                console.error(`[Scraper] Synchronous task error for campaign ${campaign.id}:`, err);
            }

            const contactsCount = await prisma.scrapedContact.count({
                where: { campaignId: campaign.id }
            });

            return res.status(201).json({
                success: true,
                campaignId: campaign.id,
                plzs: targetPlzs,
                contactsCount,
                message: 'Scraping completed synchronously'
            });
        } else {
            // 2. Start scraping asynchronously in the background
            scrapeB2BContacts({ 
                prisma,
                campaignId: campaign.id,
                name, 
                industry, 
                companySize, 
                pages, 
                requirePhone,
                targetPlzs,
                port: PORT 
            }).catch(err => {
                console.error(`[Scraper] Background task error for campaign ${campaign.id}:`, err);
            });

            // 3. Respond immediately
            return res.status(201).json({
                success: true,
                campaignId: campaign.id,
                plzs: targetPlzs,
                message: 'Scraping started in background'
            });
        }
    } catch (error) {
        console.error("Error creating campaign:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 5a. Get Campaign Status (Protected)
app.get('/api/campaigns/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        if (isNaN(campaignId)) return res.status(400).json({ success: false, error: 'Invalid ID' });

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        });
        
        if (!campaign) return res.status(404).json({ success: false, error: 'Not found' });

        const contactsCount = await prisma.scrapedContact.count({
            where: { campaignId }
        });

        res.json({
            success: true,
            status: campaign.status,
            contactsCount,
            progress: scraperProgress[campaignId] || null
        });
    } catch (error) {
        console.error("Error fetching campaign status:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// 5c. Stop Campaign (Protected)
app.post('/api/campaigns/:id/stop', authenticateAdmin, async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        if (isNaN(campaignId)) return res.status(400).json({ success: false, error: 'Invalid ID' });

        const { cancelCampaign } = require('./services/scraperService');
        cancelCampaign(campaignId);

        // Update in DB immediately so frontend knows it's stopped before scraper finishes cleanup
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'STOPPED' }
        });

        res.json({ success: true, message: 'Campaign stop requested' });
    } catch (error) {
        console.error("Error stopping campaign:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// 5b. Get Paginated Contacts (Protected)
app.get('/api/campaigns/:id/contacts', authenticateAdmin, async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        if (isNaN(campaignId)) return res.status(400).json({ success: false, error: 'Invalid ID' });

        const contacts = await prisma.scrapedContact.findMany({
            where: { campaignId },
            skip,
            take: limit,
            orderBy: { id: 'desc' } // Zeige neueste zuerst
        });

        const total = await prisma.scrapedContact.count({
            where: { campaignId }
        });

        res.json({
            success: true,
            data: contacts,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Error fetching campaign contacts:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// 6. Global B2B Database Endpoints
// 6a. Get all contacts with pagination, search and filter
app.get('/api/contacts', authenticateAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const statusFilter = req.query.status || '';
        const cityFilter = req.query.city || '';
        const skip = (page - 1) * limit;

        const where = {};
        
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { website: { contains: search } }
            ];
        }

        if (statusFilter) {
            where.status = statusFilter;
        }
        
        if (cityFilter) {
            where.campaign = { companySize: cityFilter };
        }

        const contacts = await prisma.scrapedContact.findMany({
            where,
            skip,
            take: limit,
            include: { campaign: true },
            orderBy: [
                { campaign: { companySize: 'asc' } },
                { createdAt: 'desc' }
            ]
        });

        const total = await prisma.scrapedContact.count({ where });

        res.json({
            success: true,
            data: contacts,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Error fetching global contacts:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// 6b. Update contact status
app.patch('/api/contacts/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        
        if (isNaN(id) || !status) return res.status(400).json({ success: false, error: 'Invalid data' });

        await prisma.scrapedContact.update({
            where: { id },
            data: { status }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error updating contact status:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// 6c. Export filtered global contacts
app.get('/api/contacts/export', authenticateAdmin, async (req, res) => {
    try {
        const search = req.query.search || '';
        const statusFilter = req.query.status || '';
        
        const cityFilter = req.query.city || '';
        
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { website: { contains: search } }
            ];
        }
        if (statusFilter) {
            where.status = statusFilter;
        }
        if (cityFilter) {
            where.campaign = { companySize: cityFilter };
        }

        const contacts = await prisma.scrapedContact.findMany({
            where,
            include: { campaign: true },
            orderBy: [
                { campaign: { companySize: 'asc' } },
                { createdAt: 'desc' }
            ]
        });

        const formattedContacts = contacts.map(c => ({
            id: c.id,
            createdAt: c.createdAt,
            stadt: c.campaign?.companySize || 'Unbekannt',
            adresse: c.address || '',
            name: c.name,
            phone: c.phone,
            website: c.website,
            email: c.email,
            status: c.status
        }));
        
        const Parser = require('json2csv').Parser;
        const fields = ['id', 'createdAt', 'stadt', 'adresse', 'name', 'phone', 'website', 'email', 'status'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(formattedContacts);

        res.header('Content-Type', 'text/csv');
        res.attachment('b2b_database.csv');
        return res.send(csv);
    } catch (error) {
        console.error("Error exporting global contacts:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// 6d. Get distinct cities for filter
app.get('/api/cities', authenticateAdmin, async (req, res) => {
    try {
        const campaigns = await prisma.campaign.findMany({
            select: { companySize: true },
            distinct: ['companySize']
        });
        const cities = campaigns.map(c => c.companySize).filter(c => c).sort();
        res.json({ success: true, data: cities });
    } catch(e) {
        res.status(500).json({ success: false });
    }
});

// --- Existing logic from 5c onwards ---

// 6. Export Campaign Contacts as CSV (Protected)
app.get('/api/campaigns/:id/export', authenticateAdmin, async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        if (isNaN(campaignId)) {
            return res.status(400).json({ success: false, error: 'Invalid Campaign ID' });
        }

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { contacts: true }
        });

        if (!campaign) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }

        // Generate DACH style Excel-compatible semicolon separated CSV
        const headers = ['Name', 'Adresse', 'Phone', 'Website', 'Email', 'Status', 'CreatedAt'];
        const headerLine = headers.map(h => `"${h}"`).join(';');
        
        const rows = campaign.contacts.map(contact => {
            return [
                contact.name || '',
                contact.address || '',
                contact.phone || '',
                contact.website || '',
                contact.email || '',
                contact.status || '',
                contact.createdAt ? contact.createdAt.toISOString() : ''
            ].map(val => `"${val.replace(/"/g, '""')}"`).join(';');
        });

        const csvContent = [headerLine, ...rows].join('\r\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="campaign_${campaignId}_contacts.csv"`);
        res.status(200).send(csvContent);
    } catch (error) {
        console.error("Error exporting campaign:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 7. Send Campaign Emails (Protected)
app.post('/api/campaigns/:id/send', authenticateAdmin, async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        if (isNaN(campaignId)) {
            return res.status(400).json({ success: false, error: 'Invalid Campaign ID' });
        }

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }

        // Trigger email campaign dispatch
        const results = await sendCampaign(campaignId, req.body);

        res.json({
            success: true,
            sent: results.sent,
            failed: results.failed
        });
    } catch (error) {
        console.error("Error sending campaign emails:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 7a. Send Email to Single Contact (Protected)
app.post('/api/contacts/:id/send', authenticateAdmin, async (req, res) => {
    try {
        const contactId = parseInt(req.params.id);
        if (isNaN(contactId)) {
            return res.status(400).json({ success: false, error: 'Invalid Contact ID' });
        }
        
        await sendSingleContact(contactId, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error("Error sending single email:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// 7a. Get Rendered Email Preview (Public)
app.get('/api/email/preview', (req, res) => {
    try {
        const { subject, body } = getFallbackTemplate('Max Mustermann', 'Energieberater', 'Mittelstand');
        const imageSrc = '/sales_partner_smooth.png';
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>E-Mail Template Preview</title>
          </head>
          <body style="background-color: #f1f5f9; padding: 20px; font-family: Arial, sans-serif;">
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #0056b3; margin: 0;">Alpha Energie GmbH</h2>
                <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">Zukunftssichere B2B-Tarife & Vertriebspartnerschaften</p>
              </div>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <strong style="color: #475569;">Betreff:</strong> ${subject}
              </div>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 20px; white-space: pre-wrap;">${body}</div>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 120px; vertical-align: top; padding-right: 15px;">
                    <img src="${imageSrc}" alt="Ihr Alpha Energie Ansprechpartner" style="width: 120px; height: auto; border-radius: 8px;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <strong style="color: #0056b3; font-size: 16px;">Alpha Energie B2B Vertrieb</strong><br>
                    <span style="color: #555; font-size: 14px;">Partnerschafts- und Vertriebs-Service</span><br>
                    <a href="https://www.alpha-energie.de" style="color: #0056b3; text-decoration: none; font-size: 14px;">www.alpha-energie.de</a>
                  </td>
                </tr>
              </table>
              <br>
              <div style="font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                Sie erhalten diese B2B-Kooperationsanfrage als potenzieller Geschäftspartner. 
                <br>Wenn Sie keine weiteren E-Mails von uns wünschen, können Sie sich 
                <a href="#" style="color: #666;">hier abmelden</a>.
              </div>
            </div>
          </body>
          </html>
        `;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(html);
    } catch (error) {
        console.error("Error generating email preview:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 8. Mock website endpoint to dynamically serve email links for crawler testing
app.get('/api/mock-website/:slug', (req, res) => {
    const slug = req.params.slug;
    const email = `kontakt@${slug}.de`;
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mock Website - ${slug}</title>
        </head>
        <body>
            <h1>Willkommen bei ${slug.replace(/-/g, ' ')}</h1>
            <p>Wir sind Ihr B2B Partner.</p>
            <p>Kontaktieren Sie uns unter <a href="mailto:${email}">${email}</a> oder besuchen Sie uns.</p>
            <p>Impressum: info@${slug}.de</p>
        </body>
        </html>
    `);
});

// Serve Admin Pages explicitly to avoid conflicts
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
