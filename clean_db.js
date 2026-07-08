const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.campaign.updateMany({
    where: { status: 'RUNNING' },
    data: { status: 'COMPLETED' }
  });
  console.log("Updated running campaigns:", result.count);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
