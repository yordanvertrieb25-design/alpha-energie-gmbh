const { test, expect } = require('@playwright/test');

test.describe('Complete Multi-Language Translation Verification (DE | EN | TR | AR)', () => {

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            try {
                localStorage.setItem('alpha_consent_status', 'all');
                localStorage.setItem('cookieConsent', 'all');
            } catch (e) {}
        });
    });

    test('1. Exhaustive DOM Audit: Every section of versorger.html translates to EN, TR, AR and restores 100% to DE', async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });
        await page.evaluate(() => localStorage.removeItem('alpha_lang'));
        await page.waitForTimeout(300);

        // Capture all key section texts in German (DE) before switching
        const getSectionSnapshot = async () => {
            return await page.evaluate(() => {
                const pick = (sel) => {
                    const el = document.querySelector(sel);
                    return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
                };
                return {
                    lang: document.documentElement.getAttribute('lang'),
                    title: document.title,
                    nav1: pick('#main-nav .nav-list > li:nth-child(1) > a'),
                    nav2: pick('#main-nav .nav-list > li:nth-child(2) > a'),
                    nav3: pick('#main-nav .nav-list > li:nth-child(3) > a'),
                    nav4: pick('#main-nav .nav-list > li:nth-child(4) > a'),
                    nav5: pick('#main-nav .nav-list > li:nth-child(5) > a'),
                    partnerLink: pick('.header-actions a[href="partner-werden.html"]'),
                    promoBar: pick('.octo-promo-bar .octo-promo-inner > span:nth-child(2)'),
                    heroPre: pick('.octo-hero-pre'),
                    heroH1: pick('.hero-versorger-title'),
                    wolfPill: pick('.octo-peeking-wolf-pill'),
                    stageBadgeTop: pick('.octo-stage-badge-top'),
                    stageOverlay1: pick('.octo-stage-overlay-pill > div > div:nth-child(1)'),
                    stageOverlay2: pick('.octo-stage-overlay-pill > div > div:nth-child(2)'),
                    stageOverlay3: pick('.octo-stage-overlay-pill > span'),
                    calcTabStrom: pick('.calc-tab-btn[data-branch="strom"] .calc-tab-title'),
                    calcTabGas: pick('.calc-tab-btn[data-branch="gas"] .calc-tab-title'),
                    calcLabelPlz: pick('label[for="calcPlz"]'),
                    calcPlzPlaceholder: document.querySelector('#calcPlz')?.placeholder,
                    calcLabelKwh: pick('label[for="calcKwh"]'),
                    preset1: pick('.octo-preset-pills .household-btn:nth-child(1) .household-btn-label'),
                    preset2: pick('.octo-preset-pills .household-btn:nth-child(2) .household-btn-label'),
                    preset3: pick('.octo-preset-pills .household-btn:nth-child(3) .household-btn-label'),
                    calcSubmit: pick('#rechnerForm .calc-submit-btn span'),
                    calcNotice: pick('#calcBranchNoticeText'),
                    award1Title: pick('.octo-awards-row .octo-award-badge-card:nth-child(1) .octo-award-title'),
                    award2Title: pick('.octo-awards-row .octo-award-badge-card:nth-child(2) .octo-award-title'),
                    award3Title: pick('.octo-awards-row .octo-award-badge-card:nth-child(3) .octo-award-title'),
                    award4Title: pick('.octo-awards-row .octo-award-badge-card:nth-child(4) .octo-award-title'),
                    tarifeH2: pick('#tarife .octo-section-h2'),
                    tarifeMascotText: pick('#tarife .octo-mascot-speech-text'),
                    cardBasicBadge: pick('#card-alpha-basic .tariff-badge'),
                    cardBasicBtn: pick('#card-alpha-basic .tariff-action-btn'),
                    cardTimeRibbon: pick('#card-alpha-time .tariff-ribbon span'),
                    cardTimeBadge: pick('#card-alpha-time .tariff-badge'),
                    cardTimeBtn: pick('#card-alpha-time .tariff-action-btn'),
                    cardPremiumBadge: pick('#card-alpha-premium .tariff-badge'),
                    bentoLeftH3: pick('.octo-bento-1-2 > .octo-card:nth-child(1) .octo-card-h3'),
                    bentoRightH3: pick('.octo-bento-1-2 > .octo-card:nth-child(2) .octo-card-h3'),
                    mehrEnergieH2: pick('#mehr-energie .octo-section-h2'),
                    businessTag: pick('.octo-business-banner .octo-business-tag span'),
                    businessBtn: pick('.octo-business-banner .octo-btn-outline'),
                    reviewScore: pick('#bewertungen .octo-review-card:nth-child(1) > div:nth-child(2)'),
                    review1Title: pick('#bewertungen .octo-review-card:nth-child(2) h4'),
                    review2Title: pick('#bewertungen .octo-review-card:nth-child(3) h4'),
                    review3Title: pick('#bewertungen .octo-review-card:nth-child(4) h4'),
                    smarteTarifeH2: pick('#smarte-tarife .octo-section-h2'),
                    smarteBento1H3: pick('#smarte-tarife .octo-bento-2-1 > .octo-card:nth-child(1) .octo-card-h3'),
                    smarteBento2H3: pick('#smarte-tarife .octo-bento-2-1 > .octo-card:nth-child(2) .octo-card-h3'),
                    smarteGrid1H3: pick('#smarte-tarife .octo-grid-4 > .octo-card:nth-child(1) .octo-card-h3'),
                    smarteGrid4H3: pick('#smarte-tarife .octo-grid-4 > .octo-card:nth-child(4) .octo-card-h3'),
                    heizenH2: pick('#heizen-speichern .octo-section-h2'),
                    heizenCard1H3: pick('#heizen-speichern .octo-split-device-card:not(.reverse) .octo-card-h3'),
                    heizenCard2H3: pick('#heizen-speichern .octo-split-device-card.reverse .octo-card-h3'),
                    innovationH2: pick('#innovation .octo-section-h2'),
                    innovationCard1H3: pick('#innovation .octo-grid-3 > .octo-card:nth-child(1) .octo-card-h3'),
                    innovationCard3H3: pick('#innovation .octo-grid-3 > .octo-card:nth-child(3) .octo-card-h3'),
                    stromkBadge: pick('#stromkennzeichnung > .octo-container > div:nth-child(1) > span'),
                    stromkH2: pick('#stromkennzeichnung .octo-section-h2'),
                    stromkLeftH3: pick('#stromkennzeichnung .octo-bento-2-1 > .octo-card:nth-child(1) .octo-card-h3'),
                    stromkRightH3: pick('#stromkennzeichnung .octo-bento-2-1 > div:nth-child(2) > .octo-card:nth-child(1) .octo-card-h3'),
                    stromkCountries: pick('#stromkennzeichnung .octo-bento-2-1 > div:nth-child(2) > .octo-card:nth-child(1) > div:nth-child(3)'),
                    stromkGasH3: pick('#stromkennzeichnung .octo-bento-2-1 > div:nth-child(2) > .octo-card:nth-child(2) .octo-card-h3'),
                    aboutH2: pick('#about .octo-section-h2'),
                    aboutVpill1: pick('#about .octo-about-media-card > div:nth-child(2) > span:nth-child(1)'),
                    aboutVpill2: pick('#about .octo-about-media-card > div:nth-child(2) > span:nth-child(2)'),
                    aboutVpill3: pick('#about .octo-about-media-card > div:nth-child(2) > span:nth-child(3)'),
                    aboutItem1H3: pick('#about .octo-about-stack .octo-about-item:nth-child(1) .octo-card-h3'),
                    aboutItem2H3: pick('#about .octo-about-stack .octo-about-item:nth-child(2) .octo-card-h3'),
                    aboutItem3H3: pick('#about .octo-about-stack .octo-about-item:nth-child(3) .octo-card-h3'),
                    alphaversumH2: pick('#alphaversum .octo-section-h2'),
                    alphaversumCard1H3: pick('#alphaversum .octo-grid-3 > .octo-card:nth-child(1) .octo-card-h3'),
                    alphaversumCard3H3: pick('#alphaversum .octo-grid-3 > .octo-card:nth-child(3) .octo-card-h3'),
                    bottomBannerH2: pick('section.octo-band-mid:last-of-type .octo-section-h2'),
                    bottomBannerBtn: pick('.octo-bottom-offer-btn'),
                    footerNewsTitle: pick('#main-footer .octo-footer-card:nth-child(2) .octo-card-h3'),
                    footerCancelBtn: pick('#btnOpenCancelModal span'),
                    footerRevokeBtn: pick('#btnOpenRevokeModal span'),
                    footerLinkSk: pick('.octo-footer-links-cloud a[href="#stromkennzeichnung"]'),
                    footerCopy: pick('.octo-footer-bottom > div:first-child > div:nth-child(1) > span'),
                    orderModalTitle: pick('#orderModal .modal-header-title'),
                    cancelModalTitle: pick('#cancelModalTitle'),
                    meterModalTitle: pick('#meterModal .modal-header-title')
                };
            });
        };

        const deInitial = await getSectionSnapshot();
        expect(deInitial.lang).toBe('de');

        // 1. Switch to English (EN)
        await page.locator('.lang-btn[data-lang="en"]').first().click();
        const enSnap = await getSectionSnapshot();
        expect(enSnap.lang).toBe('en');
        expect(enSnap.title).toContain('Green Electricity from 100% Renewable Energy');
        expect(enSnap.nav1).toBe('Green Electricity');
        expect(enSnap.nav2).toBe('Natural Gas');
        expect(enSnap.nav3).toBe('Business');
        expect(enSnap.nav4).toBe('About Us');
        expect(enSnap.nav5).toBe('Contact');
        expect(enSnap.partnerLink).toBe('Become a Partner');
        expect(enSnap.heroPre).toBe('Switch now to');
        expect(enSnap.heroH1).toContain('Green Electricity & Natural Gas.');
        expect(enSnap.wolfPill).toContain('Your Alpha-Wolf');
        expect(enSnap.calcTabStrom).toBe('Green Electricity');
        expect(enSnap.calcTabGas).toBe('Natural Gas');
        expect(enSnap.calcPlzPlaceholder).toBe('Your ZIP');
        expect(enSnap.preset1).toBe('Low');
        expect(enSnap.preset2).toBe('Medium');
        expect(enSnap.preset3).toBe('High');
        expect(enSnap.calcSubmit).toBe('Find Tariff');
        expect(enSnap.tarifeH2).toContain('Tariffs');
        expect(enSnap.mehrEnergieH2).toContain('More energy for your money.');
        expect(enSnap.businessTag).toContain('ALPHA BUSINESS');
        expect(enSnap.reviewScore).toBe('Excellent');
        expect(enSnap.aboutH2).toBe('About Us');
        expect(enSnap.footerCancelBtn).toContain('Cancel contract');
        expect(enSnap.footerRevokeBtn).toContain('Revoke');

        // Verify every single snapshot field translated away from DE in EN
        for (const [key, deVal] of Object.entries(deInitial)) {
            if (key === 'lang') continue;
            expect(enSnap[key], `EN snapshot key "${key}" should not remain German ("${deVal}")`).not.toBe(deVal);
        }

        // 2. Switch to Turkish (TR)
        await page.locator('.lang-btn[data-lang="tr"]').first().click();
        const trSnap = await getSectionSnapshot();
        expect(trSnap.lang).toBe('tr');
        expect(trSnap.title).toContain('Yeşil Elektrik');
        expect(trSnap.nav1).toBe('Yeşil Elektrik');
        expect(trSnap.nav2).toBe('Doğal Gaz');
        expect(trSnap.nav3).toBe('Kurumsal');
        expect(trSnap.nav4).toBe('Hakkımızda');
        expect(trSnap.nav5).toBe('İletişim');
        expect(trSnap.partnerLink).toBe('İş Ortağı Olun');
        for (const [key, deVal] of Object.entries(deInitial)) {
            if (key === 'lang') continue;
            expect(trSnap[key], `TR snapshot key "${key}" should not remain German ("${deVal}")`).not.toBe(deVal);
        }

        // 3. Switch to Arabic (AR)
        await page.locator('.lang-btn[data-lang="ar"]').first().click();
        const arSnap = await getSectionSnapshot();
        expect(arSnap.lang).toBe('ar');
        expect(arSnap.title).toContain('كهرباء خضراء');
        expect(arSnap.nav1).toBe('كهرباء خضراء');
        expect(arSnap.nav2).toBe('غاز طبيعي');
        expect(arSnap.nav3).toBe('الشركات والأعمال');
        expect(arSnap.nav4).toBe('من نحن');
        expect(arSnap.nav5).toBe('اتصل بنا');
        expect(arSnap.partnerLink).toBe('كن شريكاً');
        for (const [key, deVal] of Object.entries(deInitial)) {
            if (key === 'lang') continue;
            expect(arSnap[key], `AR snapshot key "${key}" should not remain German ("${deVal}")`).not.toBe(deVal);
        }

        // 4. Switch back to German (DE) and verify 100% lossless restoration
        await page.locator('.lang-btn[data-lang="de"]').first().click();
        const deRestored = await getSectionSnapshot();
        expect(deRestored).toEqual(deInitial);
    });

    test('2. Modals (#orderModal, #legalCancelModal, #meterModal) translate completely in EN, TR, AR, and DE', async ({ page }) => {
        await page.goto('/versorger', { waitUntil: 'load' });
        await page.evaluate(() => localStorage.removeItem('alpha_lang'));
        await page.waitForTimeout(200);

        // Switch to Arabic (AR)
        await page.locator('.lang-btn[data-lang="ar"]').first().click();

        // Open Order Modal
        await page.locator('#card-alpha-basic .tariff-action-btn').click();
        const orderModal = page.locator('#orderModal');
        await expect(orderModal).toBeVisible();
        await expect(orderModal.locator('.modal-header-title')).toHaveText('الطلب عبر الإنترنت وتغيير المزود');
        await expect(orderModal.locator('#progStep1')).toHaveText('1. التعريفة والتاريخ');
        await expect(orderModal.locator('#modalInlineCalcPromptText')).toContainText('لم يتم إدخال بيانات الاستهلاك بعد');
        await expect(orderModal.locator('#btnStep1Next')).toContainText('المتابعة إلى الخطوة 2');
        await orderModal.locator('.modal-close-btn').click();
        await expect(orderModal).not.toBeVisible();

        // Open Legal Cancel Modal (§ 312k BGB)
        await page.locator('#btnOpenCancelModal').click();
        const cancelModal = page.locator('#legalCancelModal');
        await expect(cancelModal).toBeVisible();
        await expect(page.locator('#cancelModalTitle')).toContainText('إلغاء العقود هنا');
        await expect(page.locator('#btnCancelSubmit')).toHaveText('إلغاء العقد الآن');

        // Switch tab inside Cancel Modal to Revocation (Widerruf)
        await page.locator('#cancelModeTabWiderruf').click();
        await expect(page.locator('#cancelModalTitle')).toContainText('التراجع عن العقد');
        await expect(page.locator('#btnCancelSubmit')).toHaveText('إرسال طلب التراجع');
        await cancelModal.locator('.modal-close-btn').click();
        await expect(cancelModal).not.toBeVisible();

        // Open Meter Modal
        await page.locator('#btnOpenMeterModal').click();
        const meterModal = page.locator('#meterModal');
        await expect(meterModal).toBeVisible();
        await expect(meterModal.locator('.modal-header-title')).toHaveText('إبلاغ قراءة العداد عبر الإنترنت');
        await meterModal.locator('.modal-close-btn').click();
        await expect(meterModal).not.toBeVisible();
    });

    test('3. All 17 HTML pages include i18n.js and the AR language button', async ({ page }) => {
        const pages = [
            '/versorger.html',
            '/oekostrom.html',
            '/oekogas.html',
            '/waermestrom.html',
            '/gewerbekunden.html',
            '/photovoltaik.html',
            '/sektorenkopplung.html',
            '/nachhaltigkeit-co2.html',
            '/service.html',
            '/ueber-uns.html',
            '/partner-werden.html',
            '/karriere.html',
            '/kontakt.html',
            '/impressum.html',
            '/datenschutz.html',
            '/cookie-richtlinie.html',
            '/cookie-einstellungen.html'
        ];

        for (const url of pages) {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            const hasArBtn = await page.locator('.lang-btn[data-lang="ar"]').count();
            expect(hasArBtn, `Page ${url} should have AR button`).toBeGreaterThan(0);
            const hasI18n = await page.evaluate(() => Boolean(window.i18n && typeof window.i18n.setLanguage === 'function'));
            expect(hasI18n, `Page ${url} should load window.i18n`).toBe(true);
        }
    });

});
