const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const apps = await prisma.partnerApplication.findMany();
        console.log("All applications with dates:");
        apps.forEach(app => {
            console.log(`ID: ${app.id}, Name: ${app.fullName}, Date: ${app.createdAt.toISOString()}`);
        });
    } catch (err) {
        console.error("Prisma error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
