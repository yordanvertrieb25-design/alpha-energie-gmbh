const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Check if test application exists
    let testApp = await prisma.partnerApplication.findFirst({
        where: { email: 'yordan.vertrieb25@gmail.com' }
    });

    if (!testApp) {
        testApp = await prisma.partnerApplication.create({
            data: {
                fullName: 'Yordan Test',
                email: 'yordan.vertrieb25@gmail.com',
                phone: '0123456789',
                experience: 'Test Experience'
            }
        });
        console.log('Created test application with ID:', testApp.id);
    } else {
        console.log('Found test application with ID:', testApp.id);
    }

    console.log('Now triggering email endpoint for ID:', testApp.id);

    // Call the local API to send the email
    // But since authentication is required, it's easier to just call nodemailer directly here to test the SMTP credentials.
    const nodemailer = require('nodemailer');
    require('dotenv').config();

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ionos.de',
        port: process.env.SMTP_PORT || 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const stammdatenLink = `http://localhost:3000/stammdaten.html?id=${testApp.id}`;

    const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <p>Hallo ${testApp.fullName},</p>
        <p>Vielen Dank für Dein Interesse an einer Vertriebspartnerschaft mit Alpha Energie!</p>
        <p>Damit wir Deine Registrierung abschließen und Dir Deine Zugangsdaten freischalten können, benötigen wir noch einige Stammdaten von Dir.</p>
        <p>Bitte klicke auf den folgenden Link, um Deine Daten (inkl. Gewerbeanmeldung / Handelsregisterauszug) sicher bei uns zu hinterlegen:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${stammdatenLink}" style="background-color: #ef8a00; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Stammdaten hinterlegen</a>
        </div>
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

    try {
        await transporter.sendMail({
            from: '"Alpha Energie GmbH" <info@alpha-energy.network>',
            to: testApp.email,
            subject: 'TEST: Wichtige Stammdaten für Deine Vertriebspartnerschaft',
            html: htmlBody
        });
        console.log('Test email successfully sent to', testApp.email);
    } catch (e) {
        console.error('Failed to send email:', e);
    }

}

main().catch(console.error).finally(() => prisma.$disconnect());
