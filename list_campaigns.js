const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const campaigns = await prisma.campaign.findMany();
    console.log("Campaigns in database:", JSON.stringify(campaigns, null, 2));
    const contacts = await prisma.scrapedContact.findMany({ take: 10 });
    console.log("Sample scraped contacts:", JSON.stringify(contacts, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
