require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const path = require('path');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, 'public'))); // For future public assets if needed
app.use(express.static(__dirname, { extensions: ['html'] })); // Serving the HTML files from the root

// --- API ROUTES ---

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
        
        res.json({ success: true, data: { contacts, applications } });
    } catch (error) {
        console.error("Error fetching admin data:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
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
