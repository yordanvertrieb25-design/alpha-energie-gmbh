const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
const axios = require('axios');
require('dotenv').config();
const { scrapeB2BContacts } = require('./services/scraperService');

async function main() { 
    // Create a dummy campaign
    const campaign = await prisma.campaign.create({
        data: { name: 'test', industry: 'kiosk', companySize: 'Dortmund', status: 'RUNNING' }
    });

    await scrapeB2BContacts({ 
        prisma, 
        campaignId: campaign.id, 
        name: 'test', 
        industry: 'kiosk', 
        companySize: 'Dortmund', 
        pages: 'max', 
        requirePhone: false, 
        targetPlzs: ['44135', '44137'], 
        port: 3000 
    }); 
} 

main().catch(console.error).finally(() => prisma.$disconnect());
