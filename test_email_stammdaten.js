const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Check if test application exists
    let testApp = await prisma.partnerApplication.findFirst({
        where: { email: 'backoffice@alpha-energie-gmbh.de' }
    });

    if (!testApp) {
        testApp = await prisma.partnerApplication.create({
            data: {
                fullName: 'Yordan Test',
                email: 'backoffice@alpha-energie-gmbh.de',
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

    const stammdatenLink = `https://alpha-energie.de/stammdaten.html?id=${testApp.id}`;

    const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://alpha-energie.de/logo.png" alt="Alpha Energie GmbH" style="max-width: 200px;">
        </div>
        <p>Hallo ${testApp.fullName},</p>
        <p>herzlichen Dank für Deine Bewerbung und Dein Vertrauen in die Alpha Energie GmbH! Wir freuen uns sehr über Dein Interesse an einer Vertriebspartnerschaft.</p>
        <p>Um Deine Registrierung zügig abzuschließen und Deinen Account freizuschalten, benötigen wir im nächsten Schritt noch einige Stammdaten von Dir.</p>
        <p><strong>So geht es jetzt weiter:</strong></p>
        <ol style="line-height: 1.6; margin-bottom: 20px;">
            <li>Klicke auf den Button unten und trage Deine restlichen Daten ein (inkl. Upload Deiner Gewerbeanmeldung oder Deines Handelsregisterauszugs).</li>
            <li>Unser Backoffice-Team prüft Deine Unterlagen schnellstmöglich.</li>
            <li>Sobald alles verifiziert ist, senden wir Dir Deine persönlichen Zugangsdaten für das Vertriebsportal zu, und Du kannst direkt starten!</li>
        </ol>
        <div style="text-align: center; margin: 35px 0;">
            <a href="${stammdatenLink}" style="background-color: #ef8a00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1rem;">Jetzt Stammdaten hinterlegen</a>
        </div>
        <p>Solltest Du vorab Fragen haben, kannst Du jederzeit auf diese E-Mail antworten.</p>
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
