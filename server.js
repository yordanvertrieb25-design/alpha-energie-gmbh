require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const path = require('path');
const { scrapeB2BContacts } = require('./services/scraperService');
const { sendCampaign } = require('./services/emailCampaignService');

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

// 5. Scrape B2B Contacts for Campaign (Protected)
app.post('/api/campaigns/scrape', authenticateAdmin, async (req, res) => {
    try {
        const { name, industry, companySize, pages } = req.body;
        if (!name || !industry || !companySize) {
            return res.status(400).json({ success: false, error: 'Name, industry, and companySize are required' });
        }

        // 1. Create campaign
        const campaign = await prisma.campaign.create({
            data: { name, industry, companySize, status: 'RUNNING' }
        });

        // 2. Start scraping asynchronously in the background
        // We do NOT await this. It runs independently.
        scrapeB2BContacts({ 
            prisma,
            campaignId: campaign.id,
            name, 
            industry, 
            companySize, 
            pages, 
            port: PORT 
        }).catch(err => {
            console.error(`[Scraper] Background task error for campaign ${campaign.id}:`, err);
        });

        // 3. Respond immediately
        res.status(201).json({
            success: true,
            campaignId: campaign.id,
            message: 'Scraping started in background'
        });
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
            contactsCount
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

        const contacts = await prisma.scrapedContact.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
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

        const contacts = await prisma.scrapedContact.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        const Parser = require('json2csv').Parser;
        const fields = ['id', 'createdAt', 'name', 'phone', 'website', 'email', 'status'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(contacts);

        res.header('Content-Type', 'text/csv');
        res.attachment('b2b_database.csv');
        return res.send(csv);
    } catch (error) {
        console.error("Error exporting global contacts:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
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
        const headers = ['Name', 'Phone', 'Website', 'Email', 'Status', 'CreatedAt'];
        const headerLine = headers.map(h => `"${h}"`).join(';');
        
        const rows = campaign.contacts.map(contact => {
            return [
                contact.name || '',
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
