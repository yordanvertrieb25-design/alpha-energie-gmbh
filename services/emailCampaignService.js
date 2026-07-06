const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Helper to generate personalized template via Gemini API
async function generateAIEmail({ contactName, industry, companySize }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log(`[Gemini API] GEMINI_API_KEY not set. Using template fallback.`);
    return getFallbackTemplate(contactName, industry, companySize);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using the recommended gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Du bist ein erfahrener B2B-Vertriebsleiter bei der Alpha Energie GmbH, einem führenden deutschen Anbieter für Photovoltaikanlagen und Energielösungen.
Schreibe eine personalisierte, professionelle und überzeugende Erstkontakt-E-Mail (auf Deutsch) an ein Unternehmen, um eine B2B-Partnerschaft vorzuschlagen.

Details zum Empfänger:
- Name des Unternehmens: ${contactName}
- Branche: ${industry}
- Unternehmensgröße: ${companySize}

Anweisungen:
1. Der Ton muss professionell, vertrauenswürdig und geschäftsorientiert sein (Verwendung von "Sie").
2. Hebe den Mehrwert einer Partnerschaft mit Alpha Energie hervor (schlüsselfertige PV-Lösungen, attraktive Provisionen, hoher Kundennutzen).
3. Beziehe dich subtil auf die Branche (${industry}) und die Unternehmensgröße (${companySize}), um die E-Mail personalisiert wirken zu lassen.
4. Schließe mit einem klaren Call-to-Action (z.B. Einladung zu einem kurzen Telefonat).
5. Das Ausgabeformat MUSS exakt wie folgt sein:
Subject: [Der Betreff der E-Mail]

[Der Inhalt der E-Mail]

Gib KEINE zusätzlichen Kommentare, Einleitungen, Markdown-Formatierungen (wie \`\`\`html) oder Erklärungen aus. Nur das beschriebene Format.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    let subject = '';
    let body = '';

    const subjectMatch = responseText.match(/^Subject:\s*(.*)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      body = responseText.replace(/^Subject:\s*(.*)/i, '').trim();
    } else {
      const lines = responseText.split('\n');
      subject = lines[0].replace(/^Subject:\s*/i, '').trim();
      body = lines.slice(1).join('\n').trim();
    }

    if (!subject || !body) {
      throw new Error("Failed to parse Subject or Body from response.");
    }

    return { subject, body };

  } catch (err) {
    console.error(`[Gemini API] Error generating content: ${err.message}. Falling back to template.`);
    return getFallbackTemplate(contactName, industry, companySize);
  }
}

function getFallbackTemplate(contactName, industry, companySize) {
  const subject = `Kooperationsanfrage: B2B-Partnerschaft mit Alpha Energie GmbH`;
  const body = `Sehr geehrte Damen und Herren von ${contactName},

als führender Anbieter für schlüsselfertige Photovoltaikanlagen und Energielösungen in der DACH-Region suchen wir kompetente B2B-Partner.

Da Sie im Bereich ${industry} tätig sind (Unternehmensgröße: ${companySize}), sehen wir großes Potenzial für eine erfolgreiche Zusammenarbeit. Unsere innovativen Lösungen bieten Ihren Kunden einen erheblichen Mehrwert und Ihnen attraktive Provisionen.

Gerne würden wir Ihnen unsere Kooperationsmodelle in einem kurzen Telefonat vorstellen. Bitte lassen Sie uns wissen, wann Sie für ein unverbindliches Erstgespräch verfügbar sind.

Mit freundlichen Grüßen,

Ihr B2B-Team
Alpha Energie GmbH`;
  return { subject, body };
}

// Send email campaign asynchronously
async function sendCampaign(campaignId, smtpSettings) {
  const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom } = smtpSettings;

  // Fetch campaign and its pending contacts
  const campaign = await prisma.campaign.findUnique({
    where: { id: parseInt(campaignId) },
    include: { contacts: { where: { status: 'PENDING' } } }
  });

  if (!campaign) {
    throw new Error(`Campaign with ID ${campaignId} not found`);
  }

  const contacts = campaign.contacts;
  let sentCount = 0;
  let failedCount = 0;

  // Configure Nodemailer Transporter
  let transporter;
  let useMock = false;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[Mailer] SMTP credentials missing or incomplete. Running in simulated/mock mailer mode.`);
    useMock = true;
  } else {
    try {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort) || 587,
        secure: parseInt(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        timeout: 10000 // 10s timeout
      });
    } catch (err) {
      console.error(`[Mailer] Failed to configure Nodemailer transporter: ${err.message}. Falling back to simulation.`);
      useMock = true;
    }
  }

  const imagePath = path.join(__dirname, '..', 'sales_partner_smooth.png');

  // Process contacts sequentially (or in chunks)
  for (const contact of contacts) {
    try {
      // 1. Generate Personalized AI template
      const { subject, body } = await generateAIEmail({
        contactName: contact.name,
        industry: campaign.industry,
        companySize: campaign.companySize
      });

      // 2. Prepare Mail Options
      const mailOptions = {
        from: smtpFrom || '"Alpha Energie B2B" <noreply@alpha-energie.de>',
        to: contact.email || 'info@alpha-energie.de',
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #0056b3; margin: 0;">Alpha Energie GmbH</h2>
              <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">Zukunftssichere Energielösungen</p>
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              ${body.replace(/\n/g, '<br>')}
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 120px; vertical-align: top; padding-right: 15px;">
                  <img src="cid:sales_partner_image" alt="Ihr Alpha Energie Ansprechpartner" style="width: 120px; height: auto; border-radius: 8px;" />
                </td>
                <td style="vertical-align: middle;">
                  <strong style="color: #0056b3; font-size: 16px;">Alpha Energie B2B Vertrieb</strong><br>
                  <span style="color: #555; font-size: 14px;">Partnerschafts- und Vertriebs-Service</span><br>
                  <a href="https://www.alpha-energie.de" style="color: #0056b3; text-decoration: none; font-size: 14px;">www.alpha-energie.de</a>
                </td>
              </tr>
            </table>
            <br>
            <div style="font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
              Sie erhalten diese B2B-Kooperationsanfrage als potenzieller Geschäftspartner. 
              <br>Wenn Sie keine weiteren E-Mails von uns wünschen, können Sie sich 
              <a href="mailto:unsubscribe@alpha-energie.de?subject=Unsubscribe%20Campaign%20${campaignId}" style="color: #666;">hier abmelden</a>.
            </div>
          </div>
        `,
        headers: {
          'Precedence': 'bulk',
          'List-Unsubscribe': `<mailto:unsubscribe@alpha-energie.de?subject=unsubscribe-campaign-${campaignId}>`,
          'X-Campaign-ID': campaignId.toString(),
          'X-Mailer': 'AlphaEnergieMailer'
        },
        attachments: []
      };

      if (fs.existsSync(imagePath)) {
        mailOptions.attachments.push({
          filename: 'sales_partner.png',
          path: imagePath,
          cid: 'sales_partner_image'
        });
      }

      // 3. Dispatch Email
      if (useMock) {
        console.log(`[Simulated Mailer] Sending email to ${contact.email} for Campaign ID ${campaignId}`);
        // Simulate minor async delay
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        await transporter.sendMail(mailOptions);
      }

      // 4. Update status and log success
      await prisma.$transaction([
        prisma.scrapedContact.update({
          where: { id: contact.id },
          data: { status: 'SENT' }
        }),
        prisma.emailLog.create({
          data: {
            scrapedContactId: contact.id,
            status: 'SUCCESS',
            subject: subject,
            body: body
          }
        })
      ]);

      sentCount++;

    } catch (err) {
      console.error(`[Mailer Error] Failed to send to ${contact.email || 'unknown'}: ${err.message}`);
      
      try {
        await prisma.$transaction([
          prisma.scrapedContact.update({
            where: { id: contact.id },
            data: { status: 'FAILED' }
          }),
          prisma.emailLog.create({
            data: {
              scrapedContactId: contact.id,
              status: 'FAILED',
              errorMessage: err.message,
              subject: 'Failed Campaign Send',
              body: ''
            }
          })
        ]);
      } catch (dbErr) {
        console.error(`[Mailer DB Error] Failed to write error log: ${dbErr.message}`);
      }

      failedCount++;
    }
  }

  return { sent: sentCount, failed: failedCount };
}

module.exports = {
  generateAIEmail,
  sendCampaign
};
