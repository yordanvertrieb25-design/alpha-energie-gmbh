const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const updated = await prisma.campaign.updateMany({
      where: { status: 'RUNNING' },
      data: { status: 'COMPLETED' }
    });
    console.log("Updated running campaigns count:", updated.count);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
