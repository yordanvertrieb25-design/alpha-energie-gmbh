const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;
const htmlFiles = fs.readdirSync(directoryPath).filter(file => file.endsWith('.html'));

const trustBadgesImageHTML = `                    <div class="footer-trust-badges" style="display: flex; flex-wrap: wrap; justify-content: flex-start; gap: 1rem; margin-top: 2rem;">
                        <img src="badge_oekostrom_1783546763221.png" alt="100% Ökostrom" style="height: 40px; width: auto; object-fit: contain;">
                        <img src="badge_dsgvo_1783546775437.png" alt="DSGVO konform" style="height: 40px; width: auto; object-fit: contain;">
                        <img src="badge_ssl_1783546786463.png" alt="SSL gesichert" style="height: 40px; width: auto; object-fit: contain;">
                        <img src="badge_germany_1783546798745.png" alt="Sitz in Deutschland" style="height: 40px; width: auto; object-fit: contain;">
                    </div>`;

const extractRegex = /<div class="footer-trust-badges"[\s\S]*?<\/div>\s*<\/div>\s*<div class="footer-bottom flex-between">/;
const socialLinksRegex = /(<div class="social-links">[\s\S]*?<\/div>)/;

htmlFiles.forEach(file => {
    const filePath = path.join(directoryPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the old block is there
    if (content.includes('footer-trust-badges')) {
        // Remove old block
        content = content.replace(/<div class="footer-trust-badges"[\s\S]*?<\/div>\s*<\/div>\s*<div class="footer-bottom flex-between">/, '</div>\n            <div class="footer-bottom flex-between">');
        
        // Insert new block under social links
        content = content.replace(socialLinksRegex, `$1\n${trustBadgesImageHTML}`);
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Moved images in ${file}`);
    }
});
