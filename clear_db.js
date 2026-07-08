const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
    await prisma.scrapedContact.deleteMany({}); 
    await prisma.campaign.deleteMany({}); 
    console.log('Database cleared!'); 
} 
main().finally(() => prisma.$disconnect());
