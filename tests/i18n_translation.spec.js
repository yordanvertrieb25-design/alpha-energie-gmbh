const { test, expect } = require('@playwright/test');

test.describe('Multi-Language Translation System Verification (DE | EN | TR)', () => {

    test.beforeEach(async ({ page }) => {
        // Pre-seed consent so cookie banner does not interfere
        await page.addInitScript(() => {
            try {
                localStorage.setItem('alpha_consent_status', 'all');
                localStorage.setItem('cookieConsent', 'all');
            } catch (e) {}
        });
    });

    test('1. Switching to English (EN) translates Navigation, Hero, Rechner, Badges, Tariffs, and Footer', async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });
        await page.evaluate(() => localStorage.removeItem('alpha_lang'));
        await page.waitForTimeout(300);

        // Click English language button
        const btnEn = page.locator('.lang-btn[data-lang="en"]').first();
        await btnEn.click();

        // 1. Check HTML lang attribute, title and button state
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page).toHaveTitle('Alpha Energie | 100% Green Electricity & Energy Nationwide');
        await expect(btnEn).toHaveClass(/active/);

        // 2. Check Welcome Toast banner is removed
        await expect(page.locator('#langToastBanner')).toHaveCount(0);

        // 3. Navigation
        const navTariffs = page.locator('#main-nav .nav-list > li:nth-child(1) > a');
        await expect(navTariffs).toHaveText('Electricity & Tariffs');
        const calcCta = page.locator('.header-actions a[href="#rechner"]');
        await expect(calcCta).toHaveText('Calculate Tariff');
        const partnerBtn = page.locator('.header-actions a[href="/"], .header-actions a[href="partner-werden.html"]');
        await expect(partnerBtn).toBeVisible();
        await expect(partnerBtn).toHaveText('Become a Partner');
        await expect(page.locator('.header-actions')).not.toContainText('VP-Portal');

        // 4. Hero Section
        const heroTag = page.locator('.hero-versorger-content .versorger-tag');
        await expect(heroTag).toContainText('Nationwide Green Electricity & Energy Provider');
        const heroTitle = page.locator('.hero-versorger-title');
        await expect(heroTitle).toContainText('Simple. Transparent.');
        await expect(heroTitle).toContainText('Guaranteed Affordable.');
        const heroDesc = page.locator('.hero-versorger-desc');
        await expect(heroDesc).toContainText('green electricity from 100% renewable energy');

        // Hero Badges
        const heroBadges = page.locator('.versorger-hero-badges');
        await expect(heroBadges).toContainText('24-Month Price Protection');
        await expect(heroBadges).toContainText('100% Renewable Energy (ok-power)');
        await expect(heroBadges).toContainText('Free Switching Service');

        // Floating Badges in Hero frame
        const visualBadges = page.locator('.hero-visual-frame');
        await expect(visualBadges).toContainText('100% Electricity from Renewable Sources');
        await expect(visualBadges).toContainText('Up to €380 / Year Savings');
        await expect(visualBadges).toContainText('Local Customer Service in Dortmund');

        // 5. Live-Tarifrechner
        const rechnerTitle = page.locator('#rechner .rechner-header-title');
        await expect(rechnerTitle).toHaveText('Live Tariff Calculator');
        const rechnerSubtitle = page.locator('#rechner .rechner-header-subtitle');
        await expect(rechnerSubtitle).toContainText('Compare our tariffs for your postal code in real time:');

        // Calculator Tabs
        await expect(page.locator('.calc-tab-btn[data-branch="strom"] .calc-tab-title')).toHaveText('Green Electricity');
        await expect(page.locator('.calc-tab-btn[data-branch="waerme"] .calc-tab-title')).toHaveText('Heat Pump Power');
        await expect(page.locator('.calc-tab-btn[data-branch="gas"] .calc-tab-title')).toHaveText('Natural Gas');

        // Notice Bar
        const noticeBar = page.locator('#calcBranchNoticeText');
        await expect(noticeBar).toHaveText('Green electricity from 100% renewable energy • Certified according to ok-power criteria');

        // Form elements
        await expect(page.locator('label[for="calcPlz"]')).toHaveText('Your Postal Code');
        await expect(page.locator('#rechnerForm .calc-submit-btn')).toContainText('Calculate & Compare Tariffs');

        // 6. Bento Metric Cards
        const trustBar = page.locator('#trust');
        await expect(trustBar).toContainText('Green electricity from 100% renewable energy');
        await expect(trustBar).toContainText('Savings per year');
        await expect(trustBar).toContainText('Fixed price guarantee');
        await expect(trustBar).toContainText('Seamless switching service');

        // 7. Tariff Cards
        const cardBasic = page.locator('#card-alpha-basic');
        await expect(cardBasic).toContainText('Flexible & Affordable');
        await expect(cardBasic.locator('.tariff-action-btn')).toContainText('Select Tariff');

        const cardTime = page.locator('#card-alpha-time');
        await expect(cardTime.locator('.tariff-ribbon')).toContainText('Bestseller & Smart Energy');
        await expect(cardTime.locator('.tariff-action-btn')).toContainText('Select Bestseller');

        const cardPremium = page.locator('#card-alpha-premium');
        await expect(cardPremium).toContainText('24-Month Price Protection & VIP');
        await expect(cardPremium.locator('.tariff-action-btn')).toContainText('Select Tariff');

        // 8. Advantages (Warum wir)
        const vorteileSection = page.locator('#warum-wir');
        await expect(vorteileSection.locator('.section-title')).toContainText('Why We Are the Best: 5 Decisive Advantages Over Basic Supply');
        await expect(vorteileSection).toContainText('Energy & Base Price: Permanently Fair & Affordable');
        await expect(vorteileSection).toContainText('Price Guarantee: Up to 24 Months Full Predictability');

        // 9. Comparison Matrix
        const matrixSection = page.locator('#vergleich');
        await expect(matrixSection.locator('.section-title')).toContainText('Alpha Energie vs. Local Basic Provider');
        await expect(matrixSection.locator('.matrix-th-feature')).toContainText('Performance Feature & Criterion');

        // 10. Sektorenkopplung
        const sektorSection = page.locator('#sektorenkopplung');
        await expect(sektorSection.locator('.section-title')).toContainText('Sector Coupling: PV + Heat Pump + Wallbox');

        // 11. Footer
        const footer = page.locator('#main-footer');
        await expect(footer).toContainText('Tariffs & Electricity');
        await expect(footer).toContainText('Service & Solutions');
        await expect(footer).toContainText('Legal');
        await expect(footer).toContainText('Cancel contract online');
        await expect(footer).toContainText('All rights reserved');
    });

    test('2. Switching to Turkish (TR) translates Navigation, Hero, Rechner, Badges, Tariffs, and Footer', async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });
        await page.evaluate(() => localStorage.removeItem('alpha_lang'));
        await page.waitForTimeout(300);

        // Click Turkish language button
        const btnTr = page.locator('.lang-btn[data-lang="tr"]').first();
        await btnTr.click();

        // 1. Check HTML lang attribute, title and button state
        await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
        await expect(page).toHaveTitle('Alpha Energie | Almanya Genelinde %100 Yeşil Elektrik & Enerji');
        await expect(btnTr).toHaveClass(/active/);

        // 2. Check Welcome Toast banner is removed
        await expect(page.locator('#langToastBanner')).toHaveCount(0);

        // 3. Navigation
        const navTariffs = page.locator('#main-nav .nav-list > li:nth-child(1) > a');
        await expect(navTariffs).toHaveText('Elektrik & Tarifeler');
        const calcCta = page.locator('.header-actions a[href="#rechner"]');
        await expect(calcCta).toHaveText('Tarife Hesapla');
        const partnerBtn = page.locator('.header-actions a[href="/"], .header-actions a[href="partner-werden.html"]');
        await expect(partnerBtn).toBeVisible();
        await expect(partnerBtn).toHaveText('İş Ortağı Olun');
        await expect(page.locator('.header-actions')).not.toContainText('VP-Portal');

        // 4. Hero Section
        const heroTag = page.locator('.hero-versorger-content .versorger-tag');
        await expect(heroTag).toContainText('Almanya Genelinde %100 Yeşil Elektrik ve Enerji Sağlayıcısı');
        const heroTitle = page.locator('.hero-versorger-title');
        await expect(heroTitle).toContainText('Basit. Şeffaf.');
        await expect(heroTitle).toContainText('Garantili Uygun Fiyat.');
        const heroDesc = page.locator('.hero-versorger-desc');
        await expect(heroDesc).toContainText('yeşil elektriğe, güvenilir § 14a ısı pompası elektriğine veya iklim katkılı doğal gaza geçin');

        // Hero Badges
        const heroBadges = page.locator('.versorger-hero-badges');
        await expect(heroBadges).toContainText('24 Ay Fiyat Koruması');
        await expect(heroBadges).toContainText('%100 Yenilenebilir Enerji (ok-power)');
        await expect(heroBadges).toContainText('Ücretsiz Geçiş Hizmeti');

        // Floating Badges in Hero frame
        const visualBadges = page.locator('.hero-visual-frame');
        await expect(visualBadges).toContainText('%100 Yenilenebilir Kaynaklı Elektrik');
        await expect(visualBadges).toContainText("Yılda 380 €'ya Varan Tasarruf");
        await expect(visualBadges).toContainText("Dortmund'da Yerinde Müşteri Hizmetleri");

        // 5. Live-Tarifrechner
        const rechnerTitle = page.locator('#rechner .rechner-header-title');
        await expect(rechnerTitle).toHaveText('Canlı Tarife Hesaplayıcı');
        const rechnerSubtitle = page.locator('#rechner .rechner-header-subtitle');
        await expect(rechnerSubtitle).toContainText('Posta kodunuz için tarifelerimizi gerçek zamanlı karşılaştırın:');

        // Calculator Tabs
        await expect(page.locator('.calc-tab-btn[data-branch="strom"] .calc-tab-title')).toHaveText('Yeşil Elektrik');
        await expect(page.locator('.calc-tab-btn[data-branch="waerme"] .calc-tab-title')).toHaveText('Isı Pompası');
        await expect(page.locator('.calc-tab-btn[data-branch="gas"] .calc-tab-title')).toHaveText('Doğal Gaz');

        // Notice Bar
        const noticeBar = page.locator('#calcBranchNoticeText');
        await expect(noticeBar).toHaveText('%100 Yenilenebilir Enerji Kaynaklarından Yeşil Elektrik • ok-power kriterlerine göre onaylı');

        // Form elements
        await expect(page.locator('label[for="calcPlz"]')).toHaveText('Posta Kodunuz');
        await expect(page.locator('#rechnerForm .calc-submit-btn')).toContainText('Tarifeleri Hesapla & Karşılaştır');

        // 6. Bento Metric Cards
        const trustBar = page.locator('#trust');
        await expect(trustBar).toContainText('%100 Yenilenebilir Enerji Kaynaklarından Yeşil Elektrik');
        await expect(trustBar).toContainText('Yıllık tasarruf');
        await expect(trustBar).toContainText('Sabit fiyat garantisi');
        await expect(trustBar).toContainText('Kesintisiz geçiş hizmeti');

        // 7. Tariff Cards
        const cardBasic = page.locator('#card-alpha-basic');
        await expect(cardBasic).toContainText('Esnek & Uygun Fiyatlı');
        await expect(cardBasic.locator('.tariff-action-btn')).toContainText('Tarifeyi Seç');

        const cardTime = page.locator('#card-alpha-time');
        await expect(cardTime.locator('.tariff-ribbon')).toContainText('Çok Satan & Akıllı Enerji');
        await expect(cardTime.locator('.tariff-action-btn')).toContainText('Çok Satanı Seç');

        const cardPremium = page.locator('#card-alpha-premium');
        await expect(cardPremium).toContainText('24 Ay Fiyat Koruması & VIP');
        await expect(cardPremium.locator('.tariff-action-btn')).toContainText('Tarifeyi Seç');

        // 8. Advantages (Warum wir)
        const vorteileSection = page.locator('#warum-wir');
        await expect(vorteileSection.locator('.section-title')).toContainText('Neden En İyisiyiz: Temel Tedariğe Göre 5 Belirleyici Avantaj');
        await expect(vorteileSection).toContainText('Birim & Temel Fiyat: Sürekli Adil & Uygun');
        await expect(vorteileSection).toContainText('Fiyat Garantisi: 24 Aya Varan Tam Öngörülebilirlik');

        // 9. Comparison Matrix
        const matrixSection = page.locator('#vergleich');
        await expect(matrixSection.locator('.section-title')).toContainText('Alpha Energie vs. Yerel Temel Tedarikçi');
        await expect(matrixSection.locator('.matrix-th-feature')).toContainText('Hizmet Özelliği & Kriter');

        // 10. Sektorenkopplung
        const sektorSection = page.locator('#sektorenkopplung');
        await expect(sektorSection.locator('.section-title')).toContainText('Sektörel Entegrasyon: PV + Isı Pompası + Wallbox');

        // 11. Footer
        const footer = page.locator('#main-footer');
        await expect(footer).toContainText('Tarifeler & Elektrik');
        await expect(footer).toContainText('Hizmet & Çözümler');
        await expect(footer).toContainText('Yasal Bilgiler');
        await expect(footer).toContainText('Sözleşmeyi online feshet');
        await expect(footer).toContainText('Tüm hakları saklıdır');
    });

    test('3. Switching back to German (DE) completely restores original German texts', async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });
        await page.evaluate(() => localStorage.removeItem('alpha_lang'));
        await page.waitForTimeout(300);

        // Switch to English first
        const btnEn = page.locator('.lang-btn[data-lang="en"]').first();
        await btnEn.click();
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');

        // Now switch back to German
        const btnDe = page.locator('.lang-btn[data-lang="de"]').first();
        await btnDe.click();

        // 1. Check HTML lang attribute, title and button state
        await expect(page.locator('html')).toHaveAttribute('lang', 'de');
        await expect(page).toHaveTitle('Alpha Energie | 100% Ökostrom & Gastarife deutschlandweit');
        await expect(btnDe).toHaveClass(/active/);

        // 2. Confirm Welcome Toast banner is removed
        await expect(page.locator('#langToastBanner')).toHaveCount(0);

        // 3. Navigation
        const navTariffs = page.locator('#main-nav .nav-list > li:nth-child(1) > a');
        await expect(navTariffs).toHaveText('Strom & Tarife');
        const calcCta = page.locator('.header-actions a[href="#rechner"]');
        await expect(calcCta).toHaveText('Tarif berechnen');
        const partnerBtn = page.locator('.header-actions a[href="/"], .header-actions a[href="partner-werden.html"]');
        await expect(partnerBtn).toBeVisible();
        await expect(partnerBtn).toHaveText('Partner werden');
        await expect(page.locator('.header-actions')).not.toContainText('VP-Portal');

        // 4. Hero Section
        const heroTag = page.locator('.hero-versorger-content .versorger-tag');
        await expect(heroTag).toContainText('Deutschlandweiter Ökostrom- & Energieversorger');
        const heroTitle = page.locator('.hero-versorger-title');
        await expect(heroTitle).toContainText('Einfach. Transparent.');
        await expect(heroTitle).toContainText('Garantiert günstig.');

        // Hero Badges
        const heroBadges = page.locator('.versorger-hero-badges');
        await expect(heroBadges).toContainText('24 Monate Preisschutz');
        await expect(heroBadges).toContainText('100 % erneuerbare Energien (ok-power)');
        await expect(heroBadges).toContainText('Kostenloser Wechselservice');

        // Floating Badges in Hero frame
        const visualBadges = page.locator('.hero-visual-frame');
        await expect(visualBadges).toContainText('100 % Strom aus erneuerbaren Quellen');
        await expect(visualBadges).toContainText('Bis zu 380 € / Jahr Ersparnis');
        await expect(visualBadges).toContainText('Vor-Ort-Kundenservice in Dortmund');

        // 5. Live-Tarifrechner
        const rechnerTitle = page.locator('#rechner .rechner-header-title');
        await expect(rechnerTitle).toHaveText('Live-Tarifrechner');
        await expect(page.locator('.calc-tab-btn[data-branch="strom"] .calc-tab-title')).toHaveText('Ökostrom');
        await expect(page.locator('.calc-tab-btn[data-branch="waerme"] .calc-tab-title')).toHaveText('Wärmestrom');
        await expect(page.locator('.calc-tab-btn[data-branch="gas"] .calc-tab-title')).toHaveText('Erdgas');

        const noticeBar = page.locator('#calcBranchNoticeText');
        await expect(noticeBar).toHaveText('Ökostrom aus 100 % erneuerbaren Energien • Geprüft nach ok-power Kriterien');

        await expect(page.locator('label[for="calcPlz"]')).toHaveText('Ihre Postleitzahl');
        await expect(page.locator('#rechnerForm .calc-submit-btn')).toContainText('Tarife berechnen & vergleichen');

        // 6. Bento Metric Cards
        const trustBar = page.locator('#trust');
        await expect(trustBar).toContainText('Ökostrom aus 100 % erneuerbaren Energien');
        await expect(trustBar).toContainText('Ersparnis pro Jahr');
        await expect(trustBar).toContainText('Feste Preisgarantie');
        await expect(trustBar).toContainText('Digitaler Wechselservice');

        // 7. Tariff Cards
        const cardBasic = page.locator('#card-alpha-basic');
        await expect(cardBasic).toContainText('Flexibel & Günstig');
        await expect(cardBasic.locator('.tariff-action-btn')).toContainText('Tarif wählen');

        const cardTime = page.locator('#card-alpha-time');
        await expect(cardTime.locator('.tariff-ribbon')).toContainText('Bestseller & Smart Energy');
        await expect(cardTime.locator('.tariff-action-btn')).toContainText('Bestseller wählen');

        const cardPremium = page.locator('#card-alpha-premium');
        await expect(cardPremium).toContainText('24 Monate Preisschutz & VIP');
        await expect(cardPremium.locator('.tariff-action-btn')).toContainText('Tarif wählen');

        // 8. Advantages
        const vorteileSection = page.locator('#warum-wir');
        await expect(vorteileSection.locator('.section-title')).toContainText('Warum wir die Besten sind: 5 entscheidende Vorteile gegenüber der Grundversorgung');

        // 9. Comparison Matrix
        const matrixSection = page.locator('#vergleich');
        await expect(matrixSection.locator('.section-title')).toContainText('Alpha Energie vs. Lokaler Grundversorger');

        // 10. Sektorenkopplung
        const sektorSection = page.locator('#sektorenkopplung');
        await expect(sektorSection.locator('.section-title')).toContainText('Sektorenkopplung: PV + Wärmepumpe + Wallbox');

        // 11. Footer
        const footer = page.locator('#main-footer');
        await expect(footer).toContainText('Tarife & Strom');
        await expect(footer).toContainText('Service & Lösungen');
        await expect(footer).toContainText('Vertrag online kündigen');
        await expect(footer).toContainText('Alle Rechte vorbehalten');
    });

    test('4. Persistence across page reload via localStorage and URL parameter', async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });
        await page.evaluate(() => localStorage.removeItem('alpha_lang'));
        await page.waitForTimeout(300);

        // Click Turkish
        const btnTr = page.locator('.lang-btn[data-lang="tr"]').first();
        await btnTr.click();
        await expect(page.locator('html')).toHaveAttribute('lang', 'tr');

        // Verify stored in localStorage
        const storedLang = await page.evaluate(() => localStorage.getItem('alpha_lang'));
        expect(storedLang).toBe('tr');

        // Reload page
        await page.reload({ waitUntil: 'load' });
        await page.waitForTimeout(500);

        // Lang should still be Turkish
        await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
        await expect(page.locator('.lang-btn[data-lang="tr"]').first()).toHaveClass(/active/);
        await expect(page.locator('.hero-versorger-title')).toContainText('Basit. Şeffaf.');

        // Test URL parameter initialization ?lang=en
        await page.goto('/versorger?lang=en', { waitUntil: 'load' });
        await page.waitForTimeout(500);

        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page.locator('.lang-btn[data-lang="en"]').first()).toHaveClass(/active/);
        await expect(page.locator('.hero-versorger-title')).toContainText('Simple. Transparent.');
    });

    test('5. Translation of Modals: #meterModal and #orderModal in EN and TR', async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });
        await page.evaluate(() => localStorage.removeItem('alpha_lang'));
        await page.waitForTimeout(300);

        // 1. Switch to English
        await page.locator('.lang-btn[data-lang="en"]').first().click();

        // Open Meter Modal
        const btnMeter = page.locator('#btnOpenMeterModal');
        await btnMeter.click();
        const meterModal = page.locator('#meterModal');
        await expect(meterModal).toBeVisible();
        await expect(meterModal.locator('.modal-header-title')).toHaveText('Report Meter Reading Online');
        await expect(meterModal.locator('button[type="submit"]')).toHaveText('Submit meter reading now');

        // Close Meter Modal
        await meterModal.locator('.modal-close-btn').click();
        await expect(meterModal).not.toBeVisible();

        // Open Order Modal via Tariff Action button
        const btnOrder = page.locator('#card-alpha-basic .tariff-action-btn');
        await btnOrder.click();
        const orderModal = page.locator('#orderModal');
        await expect(orderModal).toBeVisible();
        await expect(orderModal.locator('.modal-header-title')).toHaveText('Online Order & Provider Switch');
        await expect(orderModal.locator('#progStep1')).toHaveText('1. Tariff & Date');
        await expect(orderModal.locator('#progStep2')).toHaveText('2. Meter & Address');
        await expect(orderModal.locator('#progStep3')).toHaveText('3. Personal Data');
        await expect(orderModal.locator('#btnStep1Next')).toHaveText('Continue to Step 2: Meter Data →');

        // Close Order Modal
        await orderModal.locator('.modal-close-btn').click();
        await expect(orderModal).not.toBeVisible();

        // 2. Switch to Turkish
        await page.locator('.lang-btn[data-lang="tr"]').first().click();

        // Open Meter Modal in Turkish
        await btnMeter.click();
        await expect(meterModal).toBeVisible();
        await expect(meterModal.locator('.modal-header-title')).toHaveText('Online Sayaç Bildirimi');
        await expect(meterModal.locator('button[type="submit"]')).toHaveText('Sayaç değerini şimdi ilet');

        // Close Meter Modal
        await meterModal.locator('.modal-close-btn').click();
        await expect(meterModal).not.toBeVisible();

        // Open Order Modal in Turkish
        await btnOrder.click();
        await expect(orderModal).toBeVisible();
        await expect(orderModal.locator('.modal-header-title')).toHaveText('Online Sipariş & Tedarikçi Değişimi');
        await expect(orderModal.locator('#progStep1')).toHaveText('1. Tarife & Tarih');
        await expect(orderModal.locator('#progStep2')).toHaveText('2. Sayaç & Adres');
        await expect(orderModal.locator('#progStep3')).toHaveText('3. Kişisel Bilgiler');
        await expect(orderModal.locator('#btnStep1Next')).toHaveText("Adım 2'ye Devam Et: Sayaç Bilgileri →");

        // Close Order Modal
        await orderModal.locator('.modal-close-btn').click();
        await expect(orderModal).not.toBeVisible();
    });

    test('6. Turkish Language (TR) Bento Metric Card 2 bounds and overflow check across all viewports (375px, 768px, 1024px, 1280px, 1440px)', async ({ page }) => {
        const viewports = [375, 768, 1024, 1280, 1440];

        for (const width of viewports) {
            await page.setViewportSize({ width, height: 900 });
            await page.goto('/versorger?lang=tr', { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(150);

            await expect(page.locator('html')).toHaveAttribute('lang', 'tr');

            const card = page.locator('.section-trust-metrics .trust-stat-card:nth-child(2)');
            const numEl = card.locator('.stat-number');

            await expect(numEl).toBeVisible();
            await expect(numEl).toHaveText("380 €'ya varan");

            const cardBox = await card.boundingBox();
            const numBox = await numEl.boundingBox();

            expect(cardBox).not.toBeNull();
            expect(numBox).not.toBeNull();

            // Check bounding box containment: numBox must be completely within cardBox
            expect(numBox.x + numBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 0.5);
            expect(numBox.x).toBeGreaterThanOrEqual(cardBox.x - 0.5);

            // Check element horizontal overflow (scrollWidth vs clientWidth)
            const numOverflow = await numEl.evaluate((el) => el.scrollWidth > el.clientWidth);
            expect(numOverflow).toBe(false);

            // Check card horizontal overflow
            const cardOverflow = await card.evaluate((el) => el.scrollWidth > el.clientWidth);
            expect(cardOverflow).toBe(false);

            // Check document-level horizontal overflow (0px horizontal overflow)
            const docOverflow = await page.evaluate((w) => {
                return document.documentElement.scrollWidth > w;
            }, width);
            expect(docOverflow).toBe(false);

            // Switch back to German to ensure lossless roundtrip and no layout shifts
            await page.evaluate(() => window.i18n.setLanguage('de'));
            await expect(page.locator('html')).toHaveAttribute('lang', 'de');
            await expect(numEl).toHaveText("Bis zu 380 €");

            const deCardBox = await card.boundingBox();
            const deNumBox = await numEl.boundingBox();
            expect(deNumBox.x + deNumBox.width).toBeLessThanOrEqual(deCardBox.x + deCardBox.width + 0.5);
            expect(deNumBox.x).toBeGreaterThanOrEqual(deCardBox.x - 0.5);
        }
    });

});
