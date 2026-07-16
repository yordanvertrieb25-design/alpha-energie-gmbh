function getVertriebspartnerWelcomeTemplate(name) {
  return {
    subject: 'Willkommen bei Alpha Energie GmbH – Ihre Registrierung als Vertriebspartner',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0056b3; margin: 0;">Alpha Energie GmbH</h2>
          <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">Zukunftssichere Energielösungen für den Mittelstand</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Herzlich willkommen, ${name}!</h3>
          <p>Vielen Dank für Ihr Interesse und Ihre Registrierung als Vertriebspartner bei der Alpha Energie GmbH.</p>
          <p>Wir freuen uns sehr über Ihre Bewerbung und darauf, gemeinsam mit Ihnen den B2B-Energiemarkt zu revolutionieren.</p>
          
          <h4 style="color: #0056b3; margin-bottom: 5px;">Wie geht es nun weiter?</h4>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Wir prüfen aktuell Ihre Angaben.</li>
            <li>Einer unserer B2B-Partnerbetreuer wird sich in Kürze (in der Regel innerhalb von 24–48 Stunden) telefonisch oder per E-Mail bei Ihnen melden.</li>
            <li>In einem kurzen Kennenlerngespräch besprechen wir die Details, das attraktive Provisionsmodell und richten gemeinsam Ihren Zugang zum Partnerportal ein.</li>
          </ul>
          
          <p>Sollten Sie in der Zwischenzeit Fragen haben, können Sie auf diese E-Mail antworten oder uns telefonisch erreichen.</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: middle;">
              <strong style="color: #0056b3; font-size: 14px;">Alpha Energie GmbH</strong><br>
              <span style="color: #555; font-size: 12px;">Partnerbetreuung</span><br>
              <span style="color: #555; font-size: 12px;">E-Mail: <a href="mailto:info@alpha-energy.network" style="color: #0056b3; text-decoration: none;">info@alpha-energy.network</a></span><br>
              <span style="color: #555; font-size: 12px;">Web: <a href="https://www.alpha-energie.de" style="color: #0056b3; text-decoration: none;">www.alpha-energie.de</a></span>
            </td>
          </tr>
        </table>
        
        <div style="font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
          Alpha Energie GmbH | Alter Hellweg 50 | 44379 Dortmund<br>
          Telefon: 0231 39989390 | E-Mail: info@alpha-energy.network<br>
          Geschäftsführer: Tolga Canga<br>
          Registergericht: Amtsgericht Dortmund, HRB 754321
        </div>
      </div>
    `
  };
}

function getAgenturWelcomeTemplate(name) {
  return {
    subject: 'Willkommen bei Alpha Energie GmbH – Ihre Registrierung als Agentur-Partner',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0056b3; margin: 0;">Alpha Energie GmbH</h2>
          <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">Zukunftssichere Energielösungen für den Mittelstand</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Herzlich willkommen, ${name}!</h3>
          <p>Vielen Dank für Ihre Registrierung. Es ist uns eine Freude, Ihre Agentur im Partnernetzwerk der Alpha Energie GmbH willkommen zu heißen.</p>
          <p>Als Agentur-Partner profitieren Sie von unseren exklusiven B2B-Tarifen, speziellen Volumen-Provisionen und einer reibungslosen Backoffice-Abwicklung für Ihre gewerblichen Mandanten.</p>
          
          <h4 style="color: #0056b3; margin-bottom: 5px;">Die nächsten Schritte:</h4>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li>Ihre Registrierungsdaten liegen uns vor und werden priorisiert geprüft.</li>
            <li>Ein Key Account Manager wird sich zeitnah mit Ihnen in Verbindung setzen.</li>
            <li>Wir besprechen gemeinsam maßgeschneiderte Lösungen für Ihre Agentur, unsere Whitelabel-Optionen sowie die API- bzw. Portal-Anbindung für Ihr Team.</li>
          </ul>
          
          <p>Wir freuen uns auf eine erfolgreiche und langfristige Partnerschaft mit Ihnen.</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: middle;">
              <strong style="color: #0056b3; font-size: 14px;">Alpha Energie GmbH</strong><br>
              <span style="color: #555; font-size: 12px;">Key Account Management / Agenturbetreuung</span><br>
              <span style="color: #555; font-size: 12px;">E-Mail: <a href="mailto:info@alpha-energy.network" style="color: #0056b3; text-decoration: none;">info@alpha-energy.network</a></span><br>
              <span style="color: #555; font-size: 12px;">Web: <a href="https://www.alpha-energie.de" style="color: #0056b3; text-decoration: none;">www.alpha-energie.de</a></span>
            </td>
          </tr>
        </table>
        
        <div style="font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
          Alpha Energie GmbH | Alter Hellweg 50 | 44379 Dortmund<br>
          Telefon: 0231 39989390 | E-Mail: info@alpha-energy.network<br>
          Geschäftsführer: Tolga Canga<br>
          Registergericht: Amtsgericht Dortmund, HRB 754321
        </div>
      </div>
    `
  };
}

module.exports = {
  getVertriebspartnerWelcomeTemplate,
  getAgenturWelcomeTemplate
};
