const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

test.describe('Telefonnummern-Trennung (Versorger 0231 39989390 vs. Vertrieb 0231 39989392)', () => {
    const versorgerFiles = [
        'versorger.html',
        'oekostrom.html',
        'waermestrom.html',
        'oekogas.html',
        'photovoltaik.html',
        'sektorenkopplung.html',
        'service.html',
        'nachhaltigkeit-co2.html'
    ];

    const vertriebFiles = [
        'index.html',
        'vertriebspartner.html',
        'partner-werden.html',
        'agenturen.html',
        'produktgeber.html',
        'gewerbekunden.html',
        'b2b-portal.html',
        'vertriebspartner-portal.html',
        'karriere.html',
        'ueber-uns.html',
        'onboarding.html'
    ];

    test('1. Versorgerseiten & Unterseiten nutzen konsequent 0231 39989390 und niemals 0231 39989392', () => {
        versorgerFiles.forEach(file => {
            const filePath = path.join(rootDir, file);
            expect(fs.existsSync(filePath), `File ${file} exists`).toBe(true);
            const content = fs.readFileSync(filePath, 'utf8');

            // Must contain Versorger phone number
            expect(content).toContain('0231 39989390');
            expect(content).toContain('tel:023139989390');

            // Must NOT contain Vertrieb phone number
            expect(content).not.toContain('39989392');
        });
    });

    test('2. i18n Translations (i18n.js & public/i18n.js) enthalten Versorger-Nummer 0231 39989390', () => {
        ['i18n.js', 'public/i18n.js'].forEach(file => {
            const filePath = path.join(rootDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            expect(content).toContain('0231 39989390');
            expect(content).not.toContain('39989392');
        });
    });

    test('3. Vertriebsseiten (index.html, B2B-Unterseiten) nutzen 0231 39989392 in Topbar / Schema / FAB', () => {
        vertriebFiles.forEach(file => {
            const filePath = path.join(rootDir, file);
            expect(fs.existsSync(filePath), `File ${file} exists`).toBe(true);
            const content = fs.readFileSync(filePath, 'utf8');

            // Topbar must contain Vertrieb phone
            expect(content).toContain('tel:023139989392');
            expect(content).toContain('0231 39989392');
        });
    });

    test('4. index.html hat 0231 39989392 in Schema, Topbar und FAB (inkl. WhatsApp)', () => {
        const content = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
        expect(content).toContain('"telephone": "0231 39989392"');
        expect(content).toContain('<a href="tel:023139989392" class="topbar-contact">T 0231 39989392</a>');
        expect(content).toContain('<span class="fab-tooltip">0231 39989392</span>');
        expect(content).toContain('href="https://wa.me/4923139989392"');
        expect(content).not.toContain('39989390');
    });

    test('5. kontakt.html & impressum.html haben saubere Trennung von Vertrieb und Versorger', () => {
        // kontakt.html
        const kontakt = fs.readFileSync(path.join(rootDir, 'kontakt.html'), 'utf8');
        expect(kontakt).toContain('<a href="tel:023139989392" class="topbar-contact">T 0231 39989392</a>');
        expect(kontakt).toContain('0231 39989392');
        expect(kontakt).toContain('Vertrieb &amp; Zentrale');
        expect(kontakt).toContain('0231 39989390');
        expect(kontakt).toContain('Kundenservice Versorger');

        // impressum.html
        const impressum = fs.readFileSync(path.join(rootDir, 'impressum.html'), 'utf8');
        expect(impressum).toContain('<a href="tel:023139989392" class="topbar-contact">T 0231 39989392</a>');
        expect(impressum).toContain('"telephone": "0231 39989392"');
        expect(impressum).toContain('Telefon: 0231 39989392 (Vertrieb &amp; Zentrale) | 0231 39989390 (Kundenservice Versorger)');
    });
});
