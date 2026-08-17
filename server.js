require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const multer = require('multer');

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

const { scrapeB2BContacts } = require('./services/scraperService');
const { sendCampaign, sendSingleContact, getFallbackTemplate } = require('./services/emailCampaignService');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Canonical host redirect: redirect www.alpha-energie.de to https://alpha-energie.de
app.use((req, res, next) => {
    const host = (req.headers.host || '').toLowerCase();
    if (host.startsWith('www.alpha-energie.de')) {
        return res.redirect(301, `https://alpha-energie.de${req.url}`);
    }
    next();
});

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

// Email Helpers & Templates
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, (m) => {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return m;
        }
    });
}
// Email Helpers & Templates
function getMailTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.ionos.de';
    const port = parseInt(process.env.SMTP_PORT, 10) || 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465,
        auth: {
            user: user,
            pass: pass
        }
    });
}

function getSenderEmail() {
    const rawFrom = process.env.SMTP_FROM || 'noreply@alpha-energie.de';
    if (rawFrom.includes('<') && rawFrom.includes('>')) {
        return rawFrom;
    }
    return `"Alpha Energie GmbH" <${rawFrom}>`;
}

function formatGermanDate(dateStr) {
    if (!dateStr) return '';
    try {
        const str = String(dateStr).trim();
        // If already DD.MM.YYYY
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(str)) {
            return str;
        }
        // If YYYY-MM-DD
        const parts = str.split('-');
        if (parts.length === 3) {
            const year = parts[0];
            const month = parts[1];
            const day = parts[2].substring(0, 2);
            return `${day}.${month}.${year}`;
        }
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
    } catch (e) {
        // fallback
    }
    return String(dateStr);
}

function getPartnerRegistrationConfirmationHtml(fullName, email, phone, experience) {
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Willkommen bei Alpha Energie</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="background-color: #f1f5f9; padding: 35px 15px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #e2e8f0;">
            
            <!-- Header with Logo & Brand Gradient -->
            <div style="background: linear-gradient(135deg, #0b1120 0%, #1e3b6a 100%); padding: 36px 25px; text-align: center;">
                <a href="https://alpha-energie.de" target="_blank" style="text-decoration: none; display: inline-block;">
                    <img src="https://alpha-energie.de/logo.png" alt="Alpha Energie GmbH" style="max-width: 190px; height: auto; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto; border: 0;">
                </a>
                <h1 style="color: #ffffff; margin: 0; font-size: 1.35rem; font-weight: 700; letter-spacing: -0.3px; line-height: 1.3;">Herzlich willkommen im Alpha Energie Netzwerk!</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 0.95rem;">Deine Registrierung war erfolgreich</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 32px 28px;">
                <p style="font-size: 1.05rem; margin-top: 0; color: #0f172a;">Hallo <strong>${fullName || 'Vertriebspartner'}</strong>,</p>
                <p style="color: #334155; font-size: 0.95rem; margin-bottom: 24px;">Vielen Dank für Dein Vertrauen und Deine Registrierung als Vertriebspartner bei der Alpha Energie GmbH. Wir freuen uns sehr, Dich in unserem Partnernetzwerk begrüßen zu dürfen!</p>
                
                <!-- Summary Box with Applicant Details -->
                <div style="background: #f8fafc; border-left: 4px solid #ef8a00; padding: 18px 20px; border-radius: 8px; margin: 24px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                    <h3 style="margin: 0 0 12px 0; font-size: 0.85rem; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">
                        📋 Deine Registrierungsdaten im Überblick:
                    </h3>
                    <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; color: #64748b; width: 110px;"><strong>Name:</strong></td>
                            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${fullName || '–'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748b;"><strong>E-Mail:</strong></td>
                            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${email || '–'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748b;"><strong>Telefon:</strong></td>
                            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${phone || 'Nicht angegeben'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748b;"><strong>Erfahrung:</strong></td>
                            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${experience || 'Nicht angegeben'}</td>
                        </tr>
                    </table>
                </div>

                <!-- So geht es weiter Section -->
                <h3 style="color: #0f172a; font-size: 1.05rem; margin: 28px 0 16px 0; font-weight: 700;">So geht es jetzt weiter:</h3>
                
                <table style="width: 100%; border-collapse: separate; border-spacing: 0 14px; margin-bottom: 10px;">
                    <tr>
                        <td style="vertical-align: top; width: 34px;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #ef8a00; color: #ffffff; font-weight: 700; font-size: 0.85rem; text-align: center; line-height: 26px;">1</div>
                        </td>
                        <td style="vertical-align: top; padding-left: 10px;">
                            <strong style="color: #0f172a; font-size: 0.95rem;">Prüfung Deiner Angaben</strong>
                            <div style="color: #475569; font-size: 0.9rem; margin-top: 2px;">Unser Partnermanagement sichtet Deine übermittelten Angaben und bereitet Dein persönliches Onboarding vor.</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="vertical-align: top; width: 34px;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #ef8a00; color: #ffffff; font-weight: 700; font-size: 0.85rem; text-align: center; line-height: 26px;">2</div>
                        </td>
                        <td style="vertical-align: top; padding-left: 10px;">
                            <strong style="color: #0f172a; font-size: 0.95rem;">Kennenlerngespräch buchen</strong>
                            <div style="color: #475569; font-size: 0.9rem; margin-top: 2px;">Sichere Dir direkt Deinen Wunschtermin für ein kurzes, persönliches Kennenlerngespräch (ca. 15–20 Min.).</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="vertical-align: top; width: 34px;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #ef8a00; color: #ffffff; font-weight: 700; font-size: 0.85rem; text-align: center; line-height: 26px;">3</div>
                        </td>
                        <td style="vertical-align: top; padding-left: 10px;">
                            <strong style="color: #0f172a; font-size: 0.95rem;">Freischaltung des VP-Portals</strong>
                            <div style="color: #475569; font-size: 0.9rem; margin-top: 2px;">Du erhältst Deine Zugangsdaten zum VP-Portal, unsere exklusiven Tarifkonditionen und kannst sofort voll durchstarten.</div>
                        </td>
                    </tr>
                </table>

                <!-- Prominent CTA Button -->
                <div style="text-align: center; margin: 32px 0 28px 0;">
                    <a href="https://alpha-energie.de/onboarding.html" target="_blank" style="background: linear-gradient(135deg, #ef8a00 0%, #d97706 100%); background-color: #ef8a00; color: #ffffff; padding: 15px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1rem; display: inline-block; box-shadow: 0 4px 14px rgba(239, 138, 0, 0.35); text-shadow: 0 1px 1px rgba(0,0,0,0.15);">
                        Jetzt Kennenlerngespräch buchen &rarr;
                    </a>
                </div>

                <p style="font-size: 0.9rem; color: #64748b; margin: 24px 0 8px 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                    Du hast vorab Fragen oder Anmerkungen? Antworte einfach direkt auf diese E-Mail oder melde Dich telefonisch bei uns.
                </p>

                <!-- Professional Signature -->
                <p style="margin-top: 20px; font-size: 0.95rem; color: #334155;">
                    Mit freundlichen Grüßen,<br>
                    <strong style="color: #0f172a;">Dein Team der Alpha Energie GmbH</strong>
                </p>
            </div>

            <!-- Legal Company Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; font-size: 0.8rem; color: #64748b; text-align: center; line-height: 1.6;">
                <strong style="color: #334155;">Alpha Energie GmbH</strong><br>
                Alter Hellweg 50 | 44379 Dortmund<br>
                Telefon: <a href="tel:023139989390" style="color: #64748b; text-decoration: none;">0231 39989390</a> | E-Mail: <a href="mailto:info@alpha-energy.network" style="color: #64748b; text-decoration: none;">info@alpha-energy.network</a><br>
                Geschäftsführer: Tolga Canga | Registergericht: Amtsgericht Dortmund, HRB 38030<br>
                <a href="https://alpha-energie.de" target="_blank" style="color: #ef8a00; text-decoration: none; font-weight: 600; margin-top: 6px; display: inline-block;">www.alpha-energie.de</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function getAppointmentConfirmationHtml(name, email, phone, dateFormatted, time) {
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminbestätigung</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="background-color: #f1f5f9; padding: 35px 15px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #e2e8f0;">
            
            <!-- Header with Logo & Brand Gradient -->
            <div style="background: linear-gradient(135deg, #0b1120 0%, #1e3b6a 100%); padding: 36px 25px; text-align: center;">
                <a href="https://alpha-energie.de" target="_blank" style="text-decoration: none; display: inline-block;">
                    <img src="https://alpha-energie.de/logo.png" alt="Alpha Energie GmbH" style="max-width: 190px; height: auto; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto; border: 0;">
                </a>
                <h1 style="color: #ffffff; margin: 0; font-size: 1.35rem; font-weight: 700; letter-spacing: -0.3px; line-height: 1.3;">Dein Termin ist bestätigt! 📅</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 0.95rem;">Kennenlerngespräch mit der Alpha Energie GmbH</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 32px 28px;">
                <p style="font-size: 1.05rem; margin-top: 0; color: #0f172a;">Hallo <strong>${name || 'Vertriebspartner'}</strong>,</p>
                <p style="color: #334155; font-size: 0.95rem; margin-bottom: 24px;">vielen Dank für Deine Buchung! Dein Termin für unser telefonisches Kennenlerngespräch ist erfolgreich eingetragen und verbindlich für Dich reserviert. Wir freuen uns auf den persönlichen Austausch mit Dir.</p>
                
                <!-- Highlighted Appointment Box -->
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 5px solid #10b981; padding: 20px 22px; border-radius: 8px; margin: 24px 0;">
                    <h3 style="margin: 0 0 14px 0; font-size: 0.85rem; color: #166534; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">
                        📅 Deine Termindetails:
                    </h3>
                    <table style="width: 100%; font-size: 0.95rem; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; color: #475569; width: 130px;"><strong>Datum:</strong></td>
                            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${dateFormatted}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #475569;"><strong>Uhrzeit:</strong></td>
                            <td style="padding: 6px 0; color: #ef8a00; font-weight: 700; font-size: 1.05rem;">${time} Uhr</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #475569;"><strong>Gesprächspartner:</strong></td>
                            <td style="padding: 6px 0; color: #0f172a; font-weight: 500;">Alpha Energie Onboarding-Team</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #475569;"><strong>Telefon:</strong></td>
                            <td style="padding: 6px 0; color: #0f172a; font-weight: 500;">${phone || 'Nicht angegeben'}</td>
                        </tr>
                    </table>
                </div>

                <!-- Friendly Instructions -->
                <h3 style="color: #0f172a; font-size: 1.05rem; margin: 24px 0 12px 0; font-weight: 700;">Wichtige Hinweise zum Ablauf:</h3>
                
                <table style="width: 100%; border-collapse: separate; border-spacing: 0 10px; margin-bottom: 15px;">
                    <tr>
                        <td style="vertical-align: top; width: 24px; color: #10b981; font-size: 1.1rem; line-height: 1.4;">📞</td>
                        <td style="vertical-align: top; padding-left: 8px; color: #334155; font-size: 0.92rem;">
                            <strong>Telefonischer Anruf:</strong> Wir rufen Dich pünktlich zur vereinbarten Uhrzeit unter Deiner angegebenen Rufnummer (<strong>${phone || 'angegebene Telefonnummer'}</strong>) an.
                        </td>
                    </tr>
                    <tr>
                        <td style="vertical-align: top; width: 24px; color: #10b981; font-size: 1.1rem; line-height: 1.4;">⏱️</td>
                        <td style="vertical-align: top; padding-left: 8px; color: #334155; font-size: 0.92rem;">
                            <strong>Dauer:</strong> Das Gespräch dauert ca. <strong>15–20 Minuten</strong>. Wir besprechen Deine Vertriebspotenziale, unsere Tarife und wie Du sofort durchstarten kannst.
                        </td>
                    </tr>
                    <tr>
                        <td style="vertical-align: top; width: 24px; color: #10b981; font-size: 1.1rem; line-height: 1.4;">🔄</td>
                        <td style="vertical-align: top; padding-left: 8px; color: #334155; font-size: 0.92rem;">
                            <strong>Termin ändern oder absagen:</strong> Solltest Du den Termin verschieben müssen, antworte einfach kurz auf diese E-Mail oder rufe uns unter <a href="tel:023139989390" style="color: #0284c7; text-decoration: underline;">0231 39989390</a> an.
                        </td>
                    </tr>
                </table>

                <p style="margin-top: 25px; font-size: 0.95rem; color: #334155;">
                    Wir freuen uns auf das Kennenlernen!<br><br>
                    Mit freundlichen Grüßen,<br>
                    <strong style="color: #0f172a;">Dein Team der Alpha Energie GmbH</strong>
                </p>
            </div>

            <!-- Legal Company Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; font-size: 0.8rem; color: #64748b; text-align: center; line-height: 1.6;">
                <strong style="color: #334155;">Alpha Energie GmbH</strong><br>
                Alter Hellweg 50 | 44379 Dortmund<br>
                Telefon: <a href="tel:023139989390" style="color: #64748b; text-decoration: none;">0231 39989390</a> | E-Mail: <a href="mailto:info@alpha-energy.network" style="color: #64748b; text-decoration: none;">info@alpha-energy.network</a><br>
                Geschäftsführer: Tolga Canga | Registergericht: Amtsgericht Dortmund, HRB 38030<br>
                <a href="https://alpha-energie.de" target="_blank" style="color: #ef8a00; text-decoration: none; font-weight: 600; margin-top: 6px; display: inline-block;">www.alpha-energie.de</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// 2. Submit Partner Application Form
app.post('/api/partner-application', async (req, res) => {
    try {
        const { fullName, email, phone, experience, refCode } = req.body;
        
        let affiliateLinkId = null;
        if (refCode) {
            const affiliate = await prisma.affiliateLink.findUnique({
                where: { code: refCode }
            });
            if (affiliate) {
                affiliateLinkId = affiliate.id;
            }
        }

        const newApp = await prisma.partnerApplication.create({
            data: { fullName, email, phone, experience, affiliateLinkId }
        });

        // 1. Send confirmation email to applicant & 2. notification to backoffice asynchronously (non-blocking)
        (async () => {
            try {
                const transporter = getMailTransporter();
                if (!transporter) {
                    console.log("SMTP credentials missing. Partner registration emails not sent.");
                    return;
                }

                const sender = getSenderEmail();

                // A. Beautiful confirmation email to the applicant
                if (email) {
                    try {
                        await transporter.sendMail({
                            from: sender,
                            to: email,
                            subject: 'Willkommen bei Alpha Energie – Deine Registrierung war erfolgreich!',
                            html: getPartnerRegistrationConfirmationHtml(fullName, email, phone, experience)
                        });
                        console.log(`Confirmation email successfully sent to applicant: ${email}`);
                    } catch (applicantMailErr) {
                        console.error(`Failed to send confirmation email to applicant (${email}):`, applicantMailErr);
                    }
                }

                // B. Notification email to backoffice
                try {
                    await transporter.sendMail({
                        from: sender,
                        to: 'info@alpha-energy.network',
                        subject: `Neue Registrierung (Agentur/VP): ${fullName}`,
                        text: `Eine neue Partner-Registrierung ist eingegangen:\n\nName: ${fullName}\nE-Mail: ${email}\nTelefon: ${phone || 'Nicht angegeben'}\nErfahrung: ${experience || 'Nicht angegeben'}\n\nBitte im Admin-Panel prüfen.`
                    });
                    console.log(`Notification email successfully sent to info@alpha-energy.network for ${fullName}`);
                } catch (backofficeMailErr) {
                    console.error("Failed to send partner registration notification to backoffice:", backofficeMailErr);
                }
            } catch (mailError) {
                console.error("Error in partner registration email worker:", mailError);
            }
        })();

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

        // 1. Send confirmation email to applicant & 2. notification to backoffice asynchronously (non-blocking)
        (async () => {
            try {
                const transporter = getMailTransporter();
                if (!transporter) {
                    console.log("SMTP credentials missing. Appointment emails not sent.");
                    return;
                }

                const sender = getSenderEmail();
                const dateFormatted = formatGermanDate(date);

                // A. Beautiful confirmation email to the applicant
                if (email) {
                    try {
                        await transporter.sendMail({
                            from: sender,
                            to: email,
                            subject: `Terminbestätigung: Dein Kennenlerngespräch am ${dateFormatted} um ${time} Uhr`,
                            html: getAppointmentConfirmationHtml(name, email, phone, dateFormatted, time)
                        });
                        console.log(`Appointment confirmation email successfully sent to: ${email}`);
                    } catch (applicantMailErr) {
                        console.error(`Failed to send appointment confirmation email to (${email}):`, applicantMailErr);
                    }
                }

                // B. Notification email to backoffice
                try {
                    await transporter.sendMail({
                        from: sender,
                        to: 'bewerbung@alpha-energy.network',
                        subject: `Neuer Termin gebucht: ${dateFormatted} um ${time} Uhr`,
                        text: `Ein neuer Termin wurde gebucht:\n\nName: ${name}\nE-Mail: ${email}\nTelefon: ${phone || 'Nicht angegeben'}\nDatum: ${dateFormatted} (${date})\nUhrzeit: ${time}\n\nBitte im Admin-Panel prüfen.`
                    });
                    console.log(`Notification email successfully sent to bewerbung@alpha-energy.network for appointment on ${dateFormatted} at ${time}`);
                } catch (backofficeMailErr) {
                    console.error("Failed to send appointment notification to backoffice:", backofficeMailErr);
                }
            } catch (mailError) {
                console.error("Error in appointment email worker:", mailError);
            }
        })();

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
        const applications = await prisma.partnerApplication.findMany({ 
            include: { affiliateLink: true }, 
            orderBy: { createdAt: 'desc' } 
        });
        const appointments = await prisma.appointment.findMany({ orderBy: { createdAt: 'desc' } });
        
        res.json({ success: true, data: { contacts, applications, appointments } });
    } catch (error) {
        console.error("Error fetching admin data:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// 4a. Delete Contact Request
app.delete('/api/admin/contacts/:id', authenticateAdmin, async (req, res) => {
    try {
        await prisma.contactRequest.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 4b. Delete Partner Application
app.delete('/api/admin/partner-applications/:id', authenticateAdmin, async (req, res) => {
    try {
        await prisma.partnerApplication.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Update Partner Application Notes
app.patch('/api/admin/partner-applications/:id/notes', authenticateAdmin, async (req, res) => {
    try {
        const { notes } = req.body;
        await prisma.partnerApplication.update({
            where: { id: parseInt(req.params.id) },
            data: { notes }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 4c. Delete Appointment
app.delete('/api/admin/appointments/:id', authenticateAdmin, async (req, res) => {
    try {
        await prisma.appointment.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Send Master Data Email (Stammdaten)
app.post('/api/admin/partner-applications/:id/send-master-data-email', authenticateAdmin, async (req, res) => {
    try {
        const appId = parseInt(req.params.id);
        if (isNaN(appId) || appId <= 0) {
            return res.status(400).json({ success: false, error: 'Ungültige Bewerbungs-ID.' });
        }
        const application = await prisma.partnerApplication.findUnique({ where: { id: appId } });
        if (!application) return res.status(404).json({ success: false, error: 'Bewerbung nicht gefunden.' });

        const { customEmail, customSubject, customBody } = req.body;
        const recipientEmail = customEmail || application.email;
        const emailSubject = customSubject || 'Wichtige Stammdaten für Deine Vertriebspartnerschaft';

        const transporter = getMailTransporter();
        if (!transporter) {
            return res.status(500).json({ success: false, error: 'SMTP Zugangsdaten nicht konfiguriert.' });
        }

        const stammdatenLink = `https://alpha-energie.de/stammdaten.html?id=${application.id}`;

        let htmlBody = customBody;
        if (!htmlBody) {
            htmlBody = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://alpha-energie.de/logo.png" alt="Alpha Energie GmbH" style="max-width: 200px;">
                </div>
                <p>Hallo ${application.fullName},</p>
                <p>herzlichen Dank für Deine Bewerbung und Dein Vertrauen in die Alpha Energie GmbH! Wir freuen uns sehr über Dein Interesse an einer Vertriebspartnerschaft.</p>
                <p>Um Deine Registrierung zügig abzuschließen und Deinen Account freizuschalten, benötigen wir im nächsten Schritt noch einige Stammdaten von Dir.</p>
                <p><strong>So geht es jetzt weiter:</strong></p>
                <ol style="line-height: 1.6; margin-bottom: 20px;">
                    <li>Klicke auf den Button unten und trage Deine restlichen Daten ein (inkl. Upload Deiner Gewerbeanmeldung oder Deines Handelsregisterauszugs).</li>
                    <li>Unser Backoffice-Team prüft Deine Unterlagen schnellstmöglich.</li>
                    <li>Sobald alles verifiziert ist, senden wir Dir Deine persönlichen Zugangsdaten für das Vertriebsportal zu, und Du kannst direkt starten!</li>
                </ol>
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${stammdatenLink}" style="background-color: #ef8a00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1rem;">Jetzt Stammdaten hinterlegen</a>
                </div>
                <p>Solltest Du vorab Fragen haben, kannst Du jederzeit auf diese E-Mail antworten.</p>
                <p>Mit freundlichen Grüßen,</p>
                <p><strong>Dein Team der Alpha Energie GmbH</strong></p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                <div style="font-size: 0.85rem; color: #666;">
                    <strong>Alpha Energie GmbH</strong><br>
                    Alter Hellweg 50 | 44379 Dortmund<br>
                    Telefon: 0231 39989390<br>
                    E-Mail: info@alpha-energy.network<br>
                    Geschäftsführer: Tolga Canga<br>
                    Registergericht: Amtsgericht Dortmund, HRB 38030
                </div>
            </div>
            `;
        }

        await transporter.sendMail({
            from: getSenderEmail(),
            to: recipientEmail,
            subject: emailSubject,
            html: htmlBody
        });

        // Mark on the application entry that master data email was sent
        const updatedApp = await prisma.partnerApplication.update({
            where: { id: appId },
            data: {
                masterDataEmailSent: true,
                masterDataEmailSentAt: new Date()
            }
        });

        res.json({ success: true, message: 'E-Mail gesendet.', application: updatedApp });
    } catch (e) {
        console.error("Error sending stammdaten email:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// GET Partner Application for form (public)
app.get('/api/partner/stammdaten/:id', async (req, res) => {
    try {
        const appId = parseInt(req.params.id);
        const application = await prisma.partnerApplication.findUnique({ where: { id: appId } });
        if (!application) return res.status(404).json({ success: false, error: 'Nicht gefunden.' });
        
        res.json({ success: true, data: application });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Submit Stammdaten (with file upload, supports both existing appId and new applications via ref link)
const stammdatenUploadHandler = upload.fields([
    { name: 'tradeLicense', maxCount: 1 },
    { name: 'idCardFront', maxCount: 1 },
    { name: 'idCardBack', maxCount: 1 }
]);

const handleStammdatenSubmit = async (req, res) => {
    try {
        const rawId = req.params.id;
        const appId = parseInt(rawId);
        const isNew = !rawId || rawId === 'new' || isNaN(appId);
        const data = req.body;
        
        let payload = {
            salutation: data.salutation,
            firstName: data.firstName,
            lastName: data.lastName,
            fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.fullName || 'Unbekannt',
            email: data.email,
            phone: data.phone,
            experience: data.experience || 'Über Stammdatenblatt eingereicht',
            birthDate: data.birthDate,
            street: data.street,
            houseNr: data.houseNr,
            plz: data.plz,
            city: data.city,
            country: data.country || 'Deutschland',
            isVatLiable: data.isVatLiable === 'true',
            companyName: data.companyName,
            legalForm: data.legalForm,
            taxId: data.taxId,
            taxOffice: data.taxOffice,
            iban: data.iban,
            bic: data.bic,
            bankName: data.bankName,
            website: data.website,
            masterDataStatus: 'SUBMITTED'
        };

        if (req.files) {
            if (req.files.tradeLicense && req.files.tradeLicense[0]) {
                payload.tradeLicenseUrl = '/uploads/' + req.files.tradeLicense[0].filename;
            }
            if (req.files.idCardFront && req.files.idCardFront[0]) {
                payload.idCardFrontUrl = '/uploads/' + req.files.idCardFront[0].filename;
            }
            if (req.files.idCardBack && req.files.idCardBack[0]) {
                payload.idCardBackUrl = '/uploads/' + req.files.idCardBack[0].filename;
            }
        }

        let refCode = data.refCode || data.ref || data.partner;
        if (refCode) {
            const affiliate = await prisma.affiliateLink.findFirst({
                where: {
                    OR: [
                        { code: refCode },
                        { name: { equals: refCode } }
                    ]
                }
            });
            if (affiliate) {
                payload.affiliateLinkId = affiliate.id;
            }
        }

        if (isNew) {
            const newApp = await prisma.partnerApplication.create({ data: payload });
            return res.json({ success: true, data: newApp });
        } else {
            const updatedApp = await prisma.partnerApplication.update({
                where: { id: appId },
                data: payload
            });
            return res.json({ success: true, data: updatedApp });
        }
    } catch (e) {
        console.error("Stammdaten submit error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
};

app.post('/api/partner/stammdaten', stammdatenUploadHandler, handleStammdatenSubmit);
app.post('/api/partner/stammdaten/:id', stammdatenUploadHandler, handleStammdatenSubmit);

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

// --- Affiliate API ---
app.post('/api/admin/affiliates', authenticateAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const code = Math.random().toString(36).substring(2, 8); // random short string
        const newAffiliate = await prisma.affiliateLink.create({
            data: { name, code }
        });
        res.json({ success: true, data: newAffiliate });
    } catch (error) {
        console.error("Error creating affiliate:", error);
        res.status(500).json({ success: false, error: 'Failed to create affiliate link' });
    }
});

app.get('/api/admin/affiliates', authenticateAdmin, async (req, res) => {
    try {
        const affiliates = await prisma.affiliateLink.findMany({
            include: {
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: affiliates });
    } catch (error) {
        console.error("Error fetching affiliates:", error);
        res.status(500).json({ success: false, error: 'Failed to fetch affiliates' });
    }
});

app.get('/api/admin/affiliates/:id/applications', authenticateAdmin, async (req, res) => {
    try {
        const applications = await prisma.partnerApplication.findMany({
            where: { affiliateLinkId: parseInt(req.params.id) },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: applications });
    } catch (error) {
        console.error("Error fetching affiliate applications:", error);
        res.status(500).json({ success: false, error: 'Failed to fetch applications' });
    }
});

// --- Werbelink Applications Admin API ---
app.get('/api/admin/werbelink-applications', authenticateAdmin, async (req, res) => {
    try {
        const { partnerId, status, search } = req.query;

        let where = { affiliateLinkId: { not: null } };
        if (partnerId) {
            where.affiliateLinkId = parseInt(partnerId);
        }
        if (status) {
            where.masterDataStatus = status;
        }
        if (search) {
            where.AND = [
                {
                    OR: [
                        { fullName: { contains: search } },
                        { email: { contains: search } },
                        { phone: { contains: search } },
                        { companyName: { contains: search } }
                    ]
                }
            ];
        }

        const applications = await prisma.partnerApplication.findMany({
            where,
            include: { affiliateLink: true },
            orderBy: { createdAt: 'desc' }
        });

        // KPIs
        const total = await prisma.partnerApplication.count({ where: { affiliateLinkId: { not: null } } });
        const newCount = await prisma.partnerApplication.count({ where: { affiliateLinkId: { not: null }, masterDataStatus: 'SUBMITTED' } });
        const pendingCount = await prisma.partnerApplication.count({ where: { affiliateLinkId: { not: null }, masterDataStatus: 'PENDING' } });
        const activePartners = await prisma.affiliateLink.count();

        res.json({
            success: true,
            data: applications,
            kpis: {
                total,
                newCount,
                pendingCount,
                activePartners
            }
        });
    } catch (e) {
        console.error("Error fetching werbelink applications:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.patch('/api/admin/werbelink-applications/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await prisma.partnerApplication.update({
            where: { id: parseInt(req.params.id) },
            data: { masterDataStatus: status }
        });
        res.json({ success: true, data: updated });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Admin endpoint to manually create partner application with full Stammdaten
app.post('/api/admin/partner-applications/create', authenticateAdmin, async (req, res) => {
    try {
        const data = req.body;
        if (!data.email || !data.fullName && (!data.firstName || !data.lastName)) {
            return res.status(400).json({ success: false, error: 'E-Mail und Name sind erforderlich.' });
        }

        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.fullName || 'Unbekannt';

        let affiliateLinkId = null;
        if (data.affiliateLinkId) {
            affiliateLinkId = parseInt(data.affiliateLinkId);
        } else if (data.refCode) {
            const affiliate = await prisma.affiliateLink.findFirst({
                where: {
                    OR: [
                        { code: data.refCode },
                        { name: { equals: data.refCode } }
                    ]
                }
            });
            if (affiliate) affiliateLinkId = affiliate.id;
        }

        const newApp = await prisma.partnerApplication.create({
            data: {
                salutation: data.salutation || 'Herr',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                fullName: fullName,
                email: data.email,
                phone: data.phone || '',
                experience: data.experience || 'Manuell im Admin angelegt',
                birthDate: data.birthDate || null,
                street: data.street || null,
                houseNr: data.houseNr || null,
                plz: data.plz || null,
                city: data.city || null,
                country: data.country || 'Deutschland',
                isVatLiable: data.isVatLiable === true || data.isVatLiable === 'true',
                companyName: data.companyName || null,
                legalForm: data.legalForm || null,
                taxId: data.taxId || null,
                taxOffice: data.taxOffice || null,
                iban: data.iban || null,
                bic: data.bic || null,
                bankName: data.bankName || null,
                website: data.website || null,
                notes: data.notes || null,
                masterDataStatus: data.masterDataStatus || 'SUBMITTED',
                affiliateLinkId: affiliateLinkId
            }
        });

        res.json({ success: true, data: newApp });
    } catch (e) {
        console.error("Error creating manual partner application:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Direct access routes for Stammdatenblatt via Werbelink
app.get('/stammdate', (req, res) => {
    res.sendFile(path.join(__dirname, 'stammdaten.html'));
});

app.get('/stammdaten', (req, res) => {
    res.sendFile(path.join(__dirname, 'stammdaten.html'));
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
