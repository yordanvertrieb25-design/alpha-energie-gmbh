const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
    const count = await prisma.scrapedContact.count(); 
    console.log('Total contacts in DB:', count); 
    const recent = await prisma.scrapedContact.findMany({take: 10, orderBy: {createdAt: 'desc'}}); 
    console.log(recent); 
} 
main().finally(() => prisma.$disconnect());
