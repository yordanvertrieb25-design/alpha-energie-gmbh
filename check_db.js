const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== Campaigns ===");
  const campaigns = await prisma.campaign.findMany();
  console.log(JSON.stringify(campaigns, null, 2));

  console.log("=== Scraped Contacts (First 10) ===");
  const contacts = await prisma.scrapedContact.findMany({ take: 10 });
  console.log(JSON.stringify(contacts, null, 2));

  console.log("=== Scraped Contacts Count ===");
  const count = await prisma.scrapedContact.count();
  console.log("Total scraped contacts:", count);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
