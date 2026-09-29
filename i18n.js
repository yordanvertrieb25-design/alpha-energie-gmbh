/**
 * Alpha Energie GmbH - Multi-Language Translation System (i18n)
 * Supports: German (DE), English (EN), Turkish (TR)
 * Idiomatic utility & renewable energy terminology.
 * Lossless roundtrip restoration to German via dataset.i18nOriginal.
 * 0 Emojis, 100% Vector SVGs, 0 Firstcon visible frontend mentions.
 */

(function (window, document) {
    'use strict';

    const I18N_DATA = {
        de: {
            page_title: 'Alpha Energie | 100% Ökostrom & Gastarife deutschlandweit'
        },

        en: {
            page_title: 'Alpha Energie | 100% Green Electricity & Energy Nationwide',

            // Toast
            toast_text: '<strong>Welcome!</strong> 100% clean green electricity across Germany. Save <strong>up to €380/year</strong> with certified ok-power energy.',

            // Topbar
            topbar_hours: 'Monday – Friday 8:00 AM – 6:00 PM | Nationwide Service & Customer Center Dortmund',

            // Navigation
            nav_tariffs: 'Electricity & Tariffs',
            nav_oekostrom: '100% Green Electricity',
            nav_waermestrom: 'Heat Pump Power (§ 14a EnWG)',
            nav_oekogas: 'Natural Gas with Climate Contribution',
            nav_gewerbe: 'Commercial Power & SME',
            nav_solutions: 'Energy Solutions',
            nav_photovoltaik: 'Photovoltaics & Storage',
            nav_sektorenkopplung: 'Sector Coupling',
            nav_co2_audits: 'Energy Audits & CO2 Path',
            nav_service: 'Service & Help',
            nav_calculator: 'Online Tariff Calculator',
            nav_customer_service: 'Customer Service & Portal',
            nav_meter_report: 'Submit Meter Reading Online',
            nav_relocation: 'Relocation Service',
            nav_company: 'Company & Partners',
            nav_about: 'About Alpha Energie',
            nav_partner: 'Become a Partner (Sales)',
            nav_careers: 'Careers',
            nav_contact: 'Contact',
            nav_btn_calc: 'Calculate Tariff',
            nav_btn_partner: 'Become a Partner',

            // Hero
            hero_tag: 'Nationwide Green Electricity & Energy Provider',
            hero_title: 'Simple. Transparent.<br><span class="text-orange-gradient">Guaranteed Affordable.</span>',
            hero_desc: 'Switch in just 3 minutes to green electricity from 100% renewable energy, reliable § 14a heat pump power, or natural gas with voluntary climate contribution. Available nationwide with up to 24 months full price guarantee, new customer bonus, and personal customer service at the Dortmund headquarters.',
            hero_badge_price: '24-Month Price Protection',
            hero_badge_eco: '100% Renewable Energy (ok-power)',
            hero_badge_switch: 'Free Switching Service',

            // Hero Floating Badges
            hero_float_badge1_title: '100% Electricity from Renewable Sources',
            hero_float_badge1_sub: 'Certified according to ok-power criteria',
            hero_float_badge2_title: 'Up to €380 / Year Savings',
            hero_float_badge2_sub: 'Compared to basic supply',
            hero_float_badge3_title: 'Local Customer Service in Dortmund',
            hero_float_badge3_sub: 'Alter Hellweg 50 • 0231 39989390',

            // Rechner
            calc_title: 'Live Tariff Calculator',
            calc_subtitle: 'Compare our tariffs for your postal code in real time:',
            calc_tab_strom_title: 'Green Electricity',
            calc_tab_strom_sub: '100% renewable',
            calc_tab_waerme_title: 'Heat Pump Power',
            calc_tab_waerme_sub: '§ 14a EnWG',
            calc_tab_gas_title: 'Natural Gas',
            calc_tab_gas_sub: 'Climate contribution',

            // Rechner Dynamic Notices
            notice_strom: 'Green electricity from 100% renewable energy • Certified according to ok-power criteria',
            notice_waerme: 'Heat pump power (§ 14a EnWG) • Up to 25% reduced grid fees for heat pumps',
            notice_gas: 'Natural gas with voluntary climate protection contribution • Certified CO2 compensation',

            // Rechner Form
            calc_plz_label: 'Your Postal Code',
            calc_household_label: 'Household Size / Standard Consumption',
            calc_1pers: '1 Person',
            calc_2pers: '2 Persons',
            calc_3pers: '3 Persons',
            calc_4pers: '4+ Persons',
            calc_kwh_unit: 'kWh / year',
            calc_abschlag_label: 'Current monthly payment (€ / month)',
            calc_savings_label: 'Your calculated savings potential:',
            calc_savings_text: 'Up to €320 / year!',
            calc_submit_btn: 'Calculate & Compare Tariffs ↓',
            calc_guarantee_note: 'Free, non-binding & certified switching',

            // Bento Metric Cards
            bento_pill_eco: 'ok-power',
            bento_card1_label: 'Green electricity from 100% renewable energy',
            bento_card1_desc: 'Certified hydro & wind power, verified under strict ok-power criteria with zero nuclear or coal power.',
            bento_pill_savings: 'Savings',
            bento_card2_number: 'Up to €380',
            bento_card2_label: 'Savings per year',
            bento_card2_desc: 'Average annual savings advantage compared to the local basic provider tariffs.',
            bento_pill_guarantee: 'Guarantee',
            bento_card3_number: '24 Months',
            bento_card3_label: 'Fixed price guarantee',
            bento_card3_desc: 'Full cost certainty and long-term protection against rising taxes, levies, and grid fees.',
            bento_pill_service: 'Free',
            bento_card4_label: 'Seamless switching service',
            bento_card4_desc: 'We cancel your old contract with your previous provider automatically – guaranteed seamless with zero power interruption.',

            // Tariff Cards
            tariffs_tag: 'Our Tariffs at a Glance',
            tariffs_title: 'Transparent Electricity Tariffs for Home & Business',
            tariffs_subtitle: 'Green electricity from 100% renewable energy, full price guarantee, and free switching service without bureaucracy.',

            tariff_basic_badge: 'Flexible & Affordable',
            tariff_basic_bonus: 'Incl. €100 instant bonus',
            tariff_basic_savings: 'Save up to €320 / year',
            tariff_basic_b1: '12 months full price guarantee',
            tariff_basic_b2: '€100 new customer instant bonus',
            tariff_basic_b3: 'Green electricity from 100% renewable energy (hydropower)',
            tariff_basic_b4: 'Monthly cancelable after 1st year',
            tariff_basic_b5: 'Free switching service & deregistration',
            tariff_basic_btn: 'Select Tariff →',

            tariff_time_ribbon: 'Bestseller & Smart Energy',
            tariff_time_badge: 'Smart Energy & § 14a',
            tariff_time_bonus: 'Incl. €150 smart bonus',
            tariff_time_savings: 'Save up to €380 / year',
            tariff_time_b1: 'Time-variable dynamic smart tariff',
            tariff_time_b2: 'Optimized for heat pump, wallbox & storage',
            tariff_time_b3: 'Up to 25% reduced grid fees (§ 14a EnWG)',
            tariff_time_b4: '€150 Smart Energy instant bonus',
            tariff_time_b5: 'Transparent app insights & live control',
            tariff_time_btn: 'Select Bestseller →',

            tariff_premium_badge: '24-Month Price Protection & VIP',
            tariff_premium_bonus: 'Incl. €180 loyalty bonus',
            tariff_premium_savings: 'Save up to €290 / year',
            tariff_premium_b1: '24 months full price stability until 2028',
            tariff_premium_b2: '€180 loyalty & new customer reward',
            tariff_premium_b3: 'Green electricity from 100% renewable energy (ok-power)',
            tariff_premium_b4: 'Priority customer service from Dortmund',
            tariff_premium_b5: 'Protection against rising taxes & grid fees',
            tariff_premium_btn: 'Select Tariff →',

            // Advantages Section (Warum wir)
            vorteile_tag: 'Your Unbeatable Advantages',
            vorteile_title: 'Why We Are the Best: 5 Decisive Advantages Over Basic Supply',
            vorteile_subtitle: 'Save real money with 100% nationwide supply security, transparent price guarantee, and personal on-site service in Dortmund.',

            vorteil1_title: 'Energy & Base Price: Permanently Fair & Affordable',
            vorteil1_desc: 'Save up to <strong>€380 per year</strong> compared to basic supply, which is often 30–45% overpriced. No hidden costs, just transparent, fair conditions from day one.',
            vorteil2_title: 'Price Guarantee: Up to 24 Months Full Predictability',
            vorteil2_desc: 'While the basic supplier can raise prices with just 6 weeks notice, our fixed price guarantees of <strong>12 to 24 months</strong> reliably protect you from market spikes.',
            vorteil3_title: 'Energy Origin: Green Electricity from 100% Renewable Energy',
            vorteil3_desc: 'Strictly certified under <strong>ok-power criteria</strong> and redeemed in the German Environment Agency\'s guarantee of origin register (HKNR) – rather than opaque coal or gas power mixes.',
            vorteil4_title: 'Nationwide Supply & Customer Service on Site',
            vorteil4_desc: 'Nationwide energy supply with personal customer service: No call center ping-pong or endless queues. Dedicated local advisors at the Dortmund Customer Center (Alter Hellweg 50) are at your side by phone and in person.',
            vorteil5_title: '100% Digital Switching Service: Automatic & Seamless',
            vorteil5_desc: 'We cancel with your previous provider completely paperlessly and on time. Uninterrupted power supply is legally guaranteed under § 20 EnWG – switched in just 3 minutes.',

            // ok-power Explainer
            ok_power_sub: 'QUALITY SEAL',
            ok_power_title: 'Genuine ok-power Quality Seal: The 4 Pillars for a Guaranteed Energy Transition',
            ok_power_desc: 'The leading independent quality seal ok-power is backed by <strong>EnergieVision e.V.</strong>, jointly established by the <strong>Consumer Association NRW</strong> and the renowned <strong>Öko-Institut e.V.</strong> It guarantees that your tariff delivers genuine, verifiable added value for renewable energy expansion.',
            ok_power_p1: '<strong>100% HKNR at the Federal Environment Agency:</strong> Cancellation of all certificates in the official German register.',
            ok_power_p2: '<strong>Fixed new installation subsidy:</strong> Mandatory cent amounts per kilowatt hour flow directly into building new generation plants.',
            ok_power_p3: '<strong>No corporate ties:</strong> Consistent exclusion of providers with stakes in coal or nuclear power plants.',
            ok_power_p4: '<strong>Annual auditing:</strong> Regular verification of all electricity volumes by independent auditors.',

            // Comparison Matrix
            matrix_tag: 'Transparent Tariff Comparison',
            matrix_title: 'Alpha Energie vs. Local Basic Provider',
            matrix_subtitle: 'See at a glance how switching from basic supply to Alpha Energie pays off.',
            matrix_th_feature: 'Performance Feature & Criterion',
            matrix_th_alpha_badge: 'Recommended',
            matrix_th_alpha_title: 'Alpha Energie GmbH',
            matrix_th_alpha_sub: 'Certified Tariffs',
            matrix_th_standard_title: 'Local Basic Provider',
            matrix_th_standard_sub: 'Standard Tariff',

            matrix_r1_feature: 'Electricity Origin & Certification',
            matrix_r1_hint: 'Guarantees of origin & criteria',
            matrix_r1_alpha: '<strong>100% renewable energy</strong> (ok-power criteria, HKNR UBA)',
            matrix_r1_standard: 'Conventional gray power mix (incl. coal & nuclear)',

            matrix_r2_feature: 'Price Stability & Price Protection',
            matrix_r2_hint: 'Contractual planning security',
            matrix_r2_alpha: '<strong>Up to 24 months price protection</strong> on energy & grid costs',
            matrix_r2_standard: 'Variable prices, price adjustments often after a few months',

            matrix_r3_feature: 'Savings & New Customer Bonuses',
            matrix_r3_hint: 'Monthly payment & bonuses',
            matrix_r3_alpha: '<strong>Up to €380 savings / year</strong> + up to €180 new customer bonus',
            matrix_r3_standard: 'Significantly higher basic supply rate, no bonuses at all',

            matrix_r4_feature: 'Grid Fees § 14a EnWG',
            matrix_r4_hint: 'Heat pump & wallbox discount',
            matrix_r4_alpha: '<strong>Up to 25% grid fee discount</strong> optimized via ALPHA TIME',
            matrix_r4_standard: 'Standard tariff without automatic § 14a grid fee reduction',

            matrix_r5_feature: 'Customer Service & Consultation',
            matrix_r5_hint: 'Local availability',
            matrix_r5_alpha: '<strong>Personal in Dortmund</strong> (0231 39989390, WhatsApp & Alter Hellweg 50)',
            matrix_r5_standard: 'Often long wait times in outsourced call centers',

            matrix_r6_feature: 'Switching Service & Formalities',
            matrix_r6_hint: 'Cancellation with previous supplier',
            matrix_r6_alpha: '<strong>100% free & uninterrupted</strong> (incl. cancellation)',
            matrix_r6_standard: 'No support when switching to cheaper tariffs',

            matrix_cta_btn: 'Calculate Savings & Switch Now →',

            // Sektorenkopplung
            sektor_tag: 'Alpha Energie USP',
            sektor_title: 'Sector Coupling: PV + Heat Pump + Wallbox',
            sektor_subtitle: 'Network power, heat, and mobility into an intelligent total system. Lower your energy costs by up to 80%.',
            sektor1_title: 'Photovoltaics & Storage',
            sektor1_desc: 'Generate your own green electricity on the roof, stored directly in modern LFP batteries. Maximum independence from rising electricity prices.',
            sektor1_btn: 'Discover Photovoltaics',
            sektor2_title: 'Heat Pump Power § 14a',
            sektor2_desc: 'Heating with government-reduced grid fees. Intelligent SG-Ready control converts solar surpluses into heat.',
            sektor2_btn: 'View Heat Pump Power',
            sektor3_title: 'Wallbox & E-Mobility',
            sektor3_desc: 'Intelligent surplus charging for electric vehicles. Use affordable off-peak power or 100% solar energy.',
            sektor3_btn: 'Explore Sector Coupling',

            // Solutions
            sol_b2b_tag: 'Commercial & Industry',
            sol_b2b_title: 'For Commercial Customers (B2B)',
            sol_b2b_desc: 'Protect your business from price volatility. With DIN EN 16247-1 energy audits, PV self-supply, and peak shaving, we sustainably lower your operating costs and secure your ESG compliance.',
            sol_b2b_btn: 'To Our B2B Solutions',
            sol_vp_tag: 'Sales & Agencies',
            sol_vp_title: 'For Sales Partners',
            sol_vp_desc: 'Use our digital partner portal for power, gas, and telecommunications. Benefit from top commissions, weekly payouts, real-time tracking, and personal support.',
            sol_vp_btn: 'Become a Sales Partner',

            // Mission
            mission_ai_badge: 'AI-generated',
            mission_tag: 'Our Mission',
            mission_title: 'Energy Supply Reimagined',
            mission_desc: 'At Alpha Energie GmbH in Dortmund, we combine decades of industry experience with modern digital infrastructure. As a fair energy supplier, we focus on transparency, certified green electricity quality, and dedicated personal support.',
            mission_btn: 'Learn More About Us',

            // Timeline
            timeline_tag: 'Our History',
            timeline_title: 'Our Journey in Fast Forward',
            timeline_subtitle: 'From Dortmund energy pioneer to leading partner for 100% renewable energy solutions.',
            milestone_2021_title: '2021 – Founding in Dortmund',
            milestone_2021_desc: 'Founding of Alpha Energie GmbH in Dortmund (Alter Hellweg 50). Launched with over 15 years of executive experience in the German energy market to combine genuine green electricity with transparent customer service.',
            milestone_2023_title: '2023 – Scaling & Portal Technology',
            milestone_2023_desc: 'Establishment of a nationwide network and launch of fully digital customer and partner portals for fast, paperless provider switching.',
            milestone_2024_title: '2024 – Sector Coupling & § 14a EnWG',
            milestone_2024_desc: 'Expansion to controllable consumption devices: Heat pump power under § 14a EnWG with up to 25% reduced grid fees, photovoltaic storage systems, and smart wallbox charging solutions.',
            milestone_2026_title: '2026 – New Green Power Offensive',
            milestone_2026_desc: 'Certification according to strict ok-power criteria, 100% guarantees of origin in the UBA HKNR, and introduction of ALPHA BASIC, ALPHA TIME, and ALPHA PREMIUM.',

            // FAQ
            faq_tag: 'Questions & Answers',
            faq_title: 'Frequently Asked Questions',
            faq_subtitle: 'Everything you need to know about switching, price guarantee, and billing.',
            faq_q1: 'How does switching electricity to Alpha Energie work?',
            faq_a1: 'In 3 simple steps: 1. Select tariff in calculator. 2. Enter meter number and address. 3. Sit back – we cancel your old contract and ensure uninterrupted supply.',
            faq_q2: 'Is the electricity supply guaranteed during the switch?',
            faq_a2: 'Yes, 100%. Under German law, electricity is never interrupted. The switch takes place purely administratively in the background.',
            faq_q3: 'What does the 24-month price guarantee mean?',
            faq_a3: 'With our full price guarantee, you lock in your energy price against any market fluctuations and price hikes for a full 24 months.',

            // Order Modal
            modal_order_title: 'Online Order & Provider Switch',
            modal_step1_prog: '1. Tariff & Date',
            modal_step2_prog: '2. Meter & Address',
            modal_step3_prog: '3. Personal Data',
            modal_order_selected_label: 'Selected Tariff:',
            modal_order_monthly_label: 'Monthly payment:',
            modal_order_kwh_label: 'Annual consumption:',
            modal_order_savings_prefix: 'Save up to €',
            modal_order_savings_suffix: ' / year',
            modal_order_start_label: 'Desired Start Date',
            modal_order_opt_soon: 'As soon as possible (earliest available date)',
            modal_order_opt_expire: 'Upon expiry of current contract with previous provider',
            modal_order_opt_date: 'On a specific desired date (e.g. moving in)',
            modal_order_btn_to_step2: 'Continue to Step 2: Meter Data →',

            modal_order_street: 'Street *',
            modal_order_house_nr: 'House number *',
            modal_order_plz: 'Postal code *',
            modal_order_city: 'City *',
            modal_order_meter_number: 'Meter number * (on electricity or gas meter)',
            modal_order_prev_provider: 'Previous energy provider (optional)',
            modal_order_cancel_checkbox: 'Alpha Energie shall cancel my previous provider free of charge and on time.',
            modal_order_btn_back: '← Back',
            modal_order_btn_to_step3: 'Continue to Step 3 →',

            modal_order_salutation: 'Salutation',
            modal_order_salutation_mr: 'Mr.',
            modal_order_salutation_ms: 'Ms.',
            modal_order_salutation_company: 'Company',
            modal_order_birthdate: 'Date of birth (optional)',
            modal_order_first_name: 'First name *',
            modal_order_last_name: 'Last name *',
            modal_order_email: 'Email address *',
            modal_order_phone: 'Phone number *',
            modal_order_iban: 'IBAN for SEPA Direct Debit *',
            modal_order_agb_checkbox: 'I agree to the <a href="datenschutz.html" target="_blank" style="text-decoration: underline; color: #ff7a00;">Privacy Policy</a> and binding submission of the order.',
            modal_order_btn_submit: 'Complete binding order now',

            modal_order_success_title: 'Thank you for your order!',
            modal_order_success_desc: 'Your switching order has been successfully recorded. We have sent a confirmation to your email address.',
            modal_order_number_label: 'Order number: ',
            modal_order_btn_close: 'Close window',

            // Meter Modal
            modal_meter_title: 'Report Meter Reading Online',
            modal_meter_number: 'Meter number *',
            modal_meter_reading: 'Current meter reading (kWh) *',
            modal_meter_name: 'Your first and last name *',
            modal_meter_email: 'Your email address *',
            modal_meter_btn_submit: 'Submit meter reading now',

            // Legal Cancellation Modal
            modal_cancel_title: 'Cancel Contract (§ 312k BGB)',
            modal_cancel_title_revoke: 'Revoke Order (Cancellation Policy)',
            modal_cancel_contract_nr: 'Contract or customer number *',
            modal_cancel_name: 'First and last name of contracting party *',
            modal_cancel_email: 'Your email address for confirmation *',
            modal_cancel_reason: 'Reason (optional)',
            modal_cancel_btn_submit: 'Submit legally binding declaration',

            // Floating Action Bar (FAB)
            fab_whatsapp: 'WhatsApp Consultation',
            fab_meter: 'Report meter reading',
            fab_faq: 'FAQ & Help',

            // Footer
            footer_desc: 'Alpha Energie GmbH provides nationwide transparent energy solutions: Green electricity from 100% renewable energy, heat pump power under § 14a EnWG, and natural gas with voluntary climate protection contribution.',
            footer_address: 'Alter Hellweg 50, 44379 Dortmund',
            footer_title_tariffs: 'Tariffs & Electricity',
            footer_title_service: 'Service & Solutions',
            footer_title_legal: 'Legal',

            footer_link_oekostrom: '100% Green Electricity',
            footer_link_waermestrom: 'Heat Pump Power (§ 14a)',
            footer_link_oekogas: 'Natural Gas with Climate Contribution',
            footer_link_gewerbestrom: 'Commercial Electricity',
            footer_link_rechner: 'Tariff Calculator',
            footer_link_kundenservice: 'Customer Service',
            footer_link_zaehler: 'Report meter reading online',
            footer_link_sektorenkopplung: 'Sector Coupling PV+Heat',
            footer_link_pv: 'Photovoltaics',
            footer_link_partner: 'Become a Partner',
            footer_link_datenschutz: 'Privacy Policy',
            footer_link_impressum: 'Imprint',
            footer_link_cookie_settings: 'Cookie Settings',
            footer_link_cookie_policy: 'Cookie Policy',
            footer_link_vp_portal: 'Partner Portal Login',

            footer_legal_cancel_text: '<strong>Statutory Cancellation & Revocation Service (§ 312k BGB):</strong> You can cancel your existing contract or revoke your order with Alpha Energie GmbH directly online here without registration.',
            footer_btn_cancel: 'Cancel contract online',
            footer_btn_revoke: 'Revoke order',
            footer_copyright: '© Copyright 2026. All rights reserved. Alpha Energie GmbH',
            footer_cookie_manage: 'Manage cookie settings',

            // Dynamic format helpers
            per_month: '/ month',
            kwh_year: 'kWh/year',
            savings_format: 'Save up to €{val} / year',
            guarantee_format: 'Fair {val} months price guarantee',
            max_savings_format: 'Up to €{val} / year!'
        },

        tr: {
            page_title: 'Alpha Energie | Almanya Genelinde %100 Yeşil Elektrik & Enerji',

            // Toast
            toast_text: '<strong>Hoş geldiniz!</strong> Almanya genelinde %100 temiz yeşil elektrik. ok-power güvencesiyle <strong>yılda 380 €\'ya varan</strong> tasarruf edin.',

            // Topbar
            topbar_hours: 'Pazartesi – Cuma 08:00 – 18:00 | Almanya Genelinde Hizmet & Dortmund Müşteri Merkezi',

            // Navigation
            nav_tariffs: 'Elektrik & Tarifeler',
            nav_oekostrom: '%100 Yeşil Elektrik',
            nav_waermestrom: 'Isı Pompası Elektriği (§ 14a EnWG)',
            nav_oekogas: 'İklim Koruma Katkılı Doğal Gaz',
            nav_gewerbe: 'Ticari Elektrik & KOBİ',
            nav_solutions: 'Enerji Çözümleri',
            nav_photovoltaik: 'Fotovoltaik & Depolama',
            nav_sektorenkopplung: 'Sektörel Entegrasyon',
            nav_co2_audits: 'Enerji Denetimleri & CO2 Yol Haritası',
            nav_service: 'Hizmet & Yardım',
            nav_calculator: 'Online Tarife Hesaplayıcı',
            nav_customer_service: 'Müşteri Hizmetleri & Portal',
            nav_meter_report: 'Online Sayaç Bildirimi',
            nav_relocation: 'Taşınma Hizmeti',
            nav_company: 'Şirket & Ortaklar',
            nav_about: 'Alpha Energie Hakkında',
            nav_partner: 'İş Ortağı Olun (Satış)',
            nav_careers: 'Kariyer',
            nav_contact: 'İletişim',
            nav_btn_calc: 'Tarife Hesapla',
            nav_btn_partner: 'İş Ortağı Olun',

            // Hero
            hero_tag: 'Almanya Genelinde %100 Yeşil Elektrik ve Enerji Sağlayıcısı',
            hero_title: 'Basit. Şeffaf.<br><span class="text-orange-gradient">Garantili Uygun Fiyat.</span>',
            hero_desc: 'Sadece 3 dakikada %100 yenilenebilir enerjiden yeşil elektriğe, güvenilir § 14a ısı pompası elektriğine veya iklim katkılı doğal gaza geçin. 24 aya varan tam fiyat garantisi, yeni müşteri bonusu ve Dortmund merkezindeki kişisel müşteri hizmetleriyle tüm Almanya genelinde.',
            hero_badge_price: '24 Ay Fiyat Koruması',
            hero_badge_eco: '%100 Yenilenebilir Enerji (ok-power)',
            hero_badge_switch: 'Ücretsiz Geçiş Hizmeti',

            // Hero Floating Badges
            hero_float_badge1_title: '%100 Yenilenebilir Kaynaklı Elektrik',
            hero_float_badge1_sub: 'ok-power kriterlerine göre onaylı',
            hero_float_badge2_title: 'Yılda 380 €\'ya Varan Tasarruf',
            hero_float_badge2_sub: 'Temel tarifeye kıyasla',
            hero_float_badge3_title: 'Dortmund\'da Yerinde Müşteri Hizmetleri',
            hero_float_badge3_sub: 'Alter Hellweg 50 • 0231 39989390',

            // Rechner
            calc_title: 'Canlı Tarife Hesaplayıcı',
            calc_subtitle: 'Posta kodunuz için tarifelerimizi gerçek zamanlı karşılaştırın:',
            calc_tab_strom_title: 'Yeşil Elektrik',
            calc_tab_strom_sub: '%100 yenilenebilir',
            calc_tab_waerme_title: 'Isı Pompası',
            calc_tab_waerme_sub: '§ 14a EnWG',
            calc_tab_gas_title: 'Doğal Gaz',
            calc_tab_gas_sub: 'İklim katkısı',

            // Rechner Dynamic Notices
            notice_strom: '%100 Yenilenebilir Enerji Kaynaklarından Yeşil Elektrik • ok-power kriterlerine göre onaylı',
            notice_waerme: 'Isı Pompası Elektriği (§ 14a EnWG) • Isı pompaları için %25\'e varan indirimli şebeke bedeli',
            notice_gas: 'İklim Koruma Katkılı Doğal Gaz • Sertifikalı CO2 dengelemesi',

            // Rechner Form
            calc_plz_label: 'Posta Kodunuz',
            calc_household_label: 'Hanedeki Kişi Sayısı / Standart Tüketim',
            calc_1pers: '1 Kişi',
            calc_2pers: '2 Kişi',
            calc_3pers: '3 Kişi',
            calc_4pers: '4+ Kişi',
            calc_kwh_unit: 'kWh / yıl',
            calc_abschlag_label: 'Mevcut aylık avans ödemesi (€ / ay)',
            calc_savings_label: 'Hesaplanan tasarruf fırsatınız:',
            calc_savings_text: 'Yılda 320 €\'ya varan!',
            calc_submit_btn: 'Tarifeleri Hesapla & Karşılaştır ↓',
            calc_guarantee_note: 'Ücretsiz, bağlayıcı olmayan & onaylı geçiş',

            // Bento Metric Cards
            bento_pill_eco: 'ok-power',
            bento_card1_label: '%100 Yenilenebilir Enerji Kaynaklarından Yeşil Elektrik',
            bento_card1_desc: 'Nükleer ve kömür içermeyen, sıkı ok-power kriterlerine göre onaylı hidro ve rüzgar enerjisi.',
            bento_pill_savings: 'Tasarruf',
            bento_card2_number: '380 €\'ya varan',
            bento_card2_label: 'Yıllık tasarruf',
            bento_card2_desc: 'Yerel temel tedarikçi tarifelerine kıyasla ortalama yıllık tasarruf avantajı.',
            bento_pill_guarantee: 'Garanti',
            bento_card3_number: '24 Ay',
            bento_card3_label: 'Sabit fiyat garantisi',
            bento_card3_desc: 'Artan vergilere, harçlara ve şebeke bedellerine karşı tam maliyet güvencesi ve uzun vadeli koruma.',
            bento_pill_service: 'Ücretsiz',
            bento_card4_label: 'Kesintisiz geçiş hizmeti',
            bento_card4_desc: 'Eski sözleşmenizi önceki tedarikçinizden otomatik olarak feshediyoruz – kesintisiz ve elektrik kesintisi olmadan.',

            // Tariff Cards
            tariffs_tag: 'Tarifelerimize Genel Bakış',
            tariffs_title: 'Eviniz ve İş Yeriniz İçin Şeffaf Elektrik Tarifeleri',
            tariffs_subtitle: '%100 yenilenebilir enerjiden yeşil elektrik, tam fiyat garantisi ve bürokratik işlem gerektirmeyen ücretsiz geçiş hizmeti.',

            tariff_basic_badge: 'Esnek & Uygun Fiyatlı',
            tariff_basic_bonus: '100 € anında bonus dahil',
            tariff_basic_savings: 'Yılda 320 €\'ya varan tasarruf',
            tariff_basic_b1: '12 ay tam sabit fiyat garantisi',
            tariff_basic_b2: '100 € yeni müşteri anında bonusu',
            tariff_basic_b3: '%100 yenilenebilir enerjiden yeşil elektrik (hidroelektrik)',
            tariff_basic_b4: '1. yıldan sonra aylık fesih imkânı',
            tariff_basic_b5: 'Ücretsiz geçiş hizmeti & önceki sözleşme iptali',
            tariff_basic_btn: 'Tarifeyi Seç →',

            tariff_time_ribbon: 'Çok Satan & Akıllı Enerji',
            tariff_time_badge: 'Akıllı Enerji & § 14a',
            tariff_time_bonus: '150 € akıllı bonus dahil',
            tariff_time_savings: 'Yılda 380 €\'ya varan tasarruf',
            tariff_time_b1: 'Zamana göre değişken dinamik akıllı tarife',
            tariff_time_b2: 'Isı pompası, wallbox ve depolama için optimize edilmiş',
            tariff_time_b3: '%25\'e varan indirimli şebeke bedeli (§ 14a EnWG)',
            tariff_time_b4: '150 € Akıllı Enerji anında bonusu',
            tariff_time_b5: 'Şeffaf mobil uygulama takibi & canlı kontrol',
            tariff_time_btn: 'Çok Satanı Seç →',

            tariff_premium_badge: '24 Ay Fiyat Koruması & VIP',
            tariff_premium_bonus: '180 € sadakat bonusu dahil',
            tariff_premium_savings: 'Yılda 290 €\'ya varan tasarruf',
            tariff_premium_b1: '2028\'e kadar 24 ay tam fiyat istikrarı',
            tariff_premium_b2: '180 € sadakat & yeni müşteri ödülü',
            tariff_premium_b3: '%100 yenilenebilir enerjiden yeşil elektrik (ok-power)',
            tariff_premium_b4: 'Dortmund merkezli öncelikli müşteri hizmetleri',
            tariff_premium_b5: 'Artan vergilere ve şebeke bedellerine karşı koruma',
            tariff_premium_btn: 'Tarifeyi Seç →',

            // Advantages Section (Warum wir)
            vorteile_tag: 'Yenilmez Avantajlarınız',
            vorteile_title: 'Neden En İyisiyiz: Temel Tedariğe Göre 5 Belirleyici Avantaj',
            vorteile_subtitle: '%100 ülke çapında tedarik güvenliği, şeffaf fiyat garantisi ve Dortmund\'da yerinde kişisel hizmetle tasarruf edin.',

            vorteil1_title: 'Birim & Temel Fiyat: Sürekli Adil & Uygun',
            vorteil1_desc: 'Genellikle %30-45 daha pahalı olan temel tedariğe göre <strong>yılda 380 €\'ya kadar</strong> tasarruf edin. Gizli maliyet yok, ilk günden itibaren şeffaf ve adil koşullar.',
            vorteil2_title: 'Fiyat Garantisi: 24 Aya Varan Tam Öngörülebilirlik',
            vorteil2_desc: 'Temel tedarikçi sadece 6 hafta önceden fiyatları keyfi olarak artırabilirken, <strong>12 ila 24 aylık</strong> sabit fiyat garantilerimiz piyasa dalgalanmalarına karşı güvenilir koruma sağlar.',
            vorteil3_title: 'Enerji Menşei: %100 Yenilenebilir Enerji Kaynaklı Yeşil Elektrik',
            vorteil3_desc: 'Kömür veya gaz santralleri içeren şeffaf olmayan gri elektrik karışımları yerine, <strong>ok-power kriterlerine</strong> göre sıkı bir şekilde onaylanmış ve Federal Çevre Ajansı (HKNR) menşe sicilinde tescil edilmiştir.',
            vorteil4_title: 'Almanya Genelinde Tedarik & Yerinde Müşteri Hizmetleri',
            vorteil4_desc: 'Kişisel müşteri hizmetleriyle Almanya çapında enerji tedariği: Çağrı merkezi karmaşası ve bitmeyen bekleme süreleri yok. Dortmund Müşteri Merkezi\'ndeki (Alter Hellweg 50) yerel temsilciler telefonla ve yüz yüze yanınızda.',
            vorteil5_title: '%100 Dijital Geçiş Hizmeti: Otomatik & Kesintisiz',
            vorteil5_desc: 'Önceki tedarikçinizdeki sözleşmeyi tamamen kağıtsız ve zamanında feshediyoruz. § 20 EnWG uyarınca kesintisiz enerji arzı yasal güvence altındadır – 3 dakikada tamamlanan geçiş.',

            // ok-power Explainer
            ok_power_sub: 'KALİTE MÜHRÜ',
            ok_power_title: 'Gerçek ok-power Kalite Mührü: Garantili Enerji Dönüşümünün 4 Temel Direği',
            ok_power_desc: 'Önde gelen bağımsız kalite mührü ok-power, <strong>NRW Tüketici Danışma Merkezi</strong> ve saygın <strong>Öko-Institut e.V.</strong> tarafından ortaklaşa kurulan <strong>EnergieVision e.V.</strong> derneği tarafından desteklenmektedir. Tarifenizin yenilenebilir enerjinin yaygınlaşması için gerçek ve kanıtlanabilir bir katma değer sağlamasını garanti eder.',
            ok_power_p1: '<strong>Federal Çevre Ajansı\'nda %100 Menşe Kaydı:</strong> Resmi Alman menşe kayıt defterinde tüm sertifikaların iptali.',
            ok_power_p2: '<strong>Sabit yeni tesis teşviki:</strong> Kilovatsaat başına bağlayıcı sent tutarları doğrudan modern üretim tesislerinin inşasına aktarılır.',
            ok_power_p3: '<strong>Holding bağlantısı yok:</strong> Kömür veya nükleer santrallerde payı olan tedarikçilerin tutarlı bir şekilde hariç tutulması.',
            ok_power_p4: '<strong>Yıllık denetim:</strong> Bağımsız uzmanlar tarafından tüm elektrik miktarlarının düzenli olarak denetlenmesi.',

            // Comparison Matrix
            matrix_tag: 'Şeffaf Tarife Karşılaştırması',
            matrix_title: 'Alpha Energie vs. Yerel Temel Tedarikçi',
            matrix_subtitle: 'Temel tedarikten Alpha Energie\'ye geçişin nasıl kazanç sağladığını bir bakışta görün.',
            matrix_th_feature: 'Hizmet Özelliği & Kriter',
            matrix_th_alpha_badge: 'Tavsiye Edilen',
            matrix_th_alpha_title: 'Alpha Energie GmbH',
            matrix_th_alpha_sub: 'Sertifikalı Tarifeler',
            matrix_th_standard_title: 'Yerel Temel Tedarikçi',
            matrix_th_standard_sub: 'Standart Tarife',

            matrix_r1_feature: 'Elektrik Menşei & Sertifikasyon',
            matrix_r1_hint: 'Menşe belgeleri & kriterler',
            matrix_r1_alpha: '<strong>%100 yenilenebilir enerji</strong> (ok-power kriterleri, HKNR UBA)',
            matrix_r1_standard: 'Geleneksel gri elektrik karışımı (kömür ve nükleer dahil)',

            matrix_r2_feature: 'Fiyat İstikrarı & Fiyat Koruması',
            matrix_r2_hint: 'Sözleşmesel planlama güvenliği',
            matrix_r2_alpha: '<strong>24 aya varan fiyat koruması</strong> enerji & şebeke maliyetlerinde',
            matrix_r2_standard: 'Değişken fiyatlar, birkaç ay sonra sık sık fiyat artışı',

            matrix_r3_feature: 'Tasarruf & Yeni Müşteri Bonusları',
            matrix_r3_hint: 'Aylık avans & bonuslar',
            matrix_r3_alpha: '<strong>Yılda 380 €\'ya varan tasarruf</strong> + 180 €\'ya varan yeni müşteri primi',
            matrix_r3_standard: 'Belirgin şekilde daha yüksek temel tarife, hiçbir bonus yok',

            matrix_r4_feature: 'Şebeke Bedelleri § 14a EnWG',
            matrix_r4_hint: 'Isı pompası & wallbox indirimi',
            matrix_r4_alpha: '<strong>%25\'e varan şebeke bedeli indirimi</strong> ALPHA TIME ile optimize edilmiş',
            matrix_r4_standard: 'Otomatik § 14a şebeke indirimi olmayan standart tarife',

            matrix_r5_feature: 'Müşteri Hizmetleri & Danışmanlık',
            matrix_r5_hint: 'Yerel ulaşılabilirlik',
            matrix_r5_alpha: '<strong>Dortmund\'da kişisel</strong> (0231 39989390, WhatsApp & Alter Hellweg 50)',
            matrix_r5_standard: 'Dış kaynaklı çağrı merkezlerinde uzun bekleme süreleri',

            matrix_r6_feature: 'Geçiş Hizmeti & Formaliteler',
            matrix_r6_hint: 'Önceki tedarikçiden fesih',
            matrix_r6_alpha: '<strong>%100 ücretsiz & kesintisiz</strong> (iptal dahil)',
            matrix_r6_standard: 'Daha ucuz tarifelere geçişte hiçbir destek yok',

            matrix_cta_btn: 'Tasarrufu Hesapla & Hemen Geç →',

            // Sektorenkopplung
            sektor_tag: 'Alpha Energie USP',
            sektor_title: 'Sektörel Entegrasyon: PV + Isı Pompası + Wallbox',
            sektor_subtitle: 'Elektrik, ısı ve mobiliteyi akıllı bir entegre sistemde birleştirin. Enerji maliyetlerinizi %80\'e kadar düşürün.',
            sektor1_title: 'Fotovoltaik & Depolama',
            sektor1_desc: 'Çatınızdan kendi yeşil elektriğinizi üretin, doğrudan modern LFP bataryalarda depolayın. Artan elektrik fiyatlarına karşı maksimum bağımsızlık.',
            sektor1_btn: 'Fotovoltaik Çözümlerini Keşfedin',
            sektor2_title: 'Isı Pompası Elektriği § 14a',
            sektor2_desc: 'Devlet indirimli şebeke bedelleriyle ısınma. Akıllı SG-Ready kontrolü güneş enerjisi fazlasını ısıya dönüştürür.',
            sektor2_btn: 'Isı Pompası Tarifesini Gör',
            sektor3_title: 'Wallbox & E-Mobilite',
            sektor3_desc: 'Elektrikli araçlar için akıllı fazla enerji şarjı. Uygun fiyatlı gece tarifesinden veya %100 kendi güneş enerjinizden yararlanın.',
            sektor3_btn: 'Sektörel Entegrasyonu İncele',

            // Solutions
            sol_b2b_tag: 'Ticaret & Sanayi',
            sol_b2b_title: 'Ticari Müşteriler İçin (B2B)',
            sol_b2b_desc: 'İşletmenizi fiyat dalgalanmalarına karşı koruyun. DIN EN 16247-1 enerji denetimleri, fotovoltaik öz tüketim ve tepe yük tıraşlama ile işletme maliyetlerinizi sürdürülebilir şekilde düşürüyor ve ESG uyumluluğunuzu sağlıyoruz.',
            sol_b2b_btn: 'B2B Çözümlerimiz',
            sol_vp_tag: 'Satış & Acenteler',
            sol_vp_title: 'Satış Ortakları İçin',
            sol_vp_desc: 'Elektrik, gaz ve telekomünikasyon için dijital ortak portalımızı kullanın. En yüksek komisyonlardan, haftalık ödemelerden, gerçek zamanlı takipten ve kişisel destekten yararlanın.',
            sol_vp_btn: 'Satış Ortağı Olun',

            // Mission
            mission_ai_badge: 'Yapay zeka üretimi',
            mission_tag: 'Misyonumuz',
            mission_title: 'Yeniden Düşünülen Enerji Tedariği',
            mission_desc: 'Dortmund\'daki Alpha Energie GmbH olarak uzun yıllara dayanan sektör tecrübemizi modern dijital altyapıyla buluşturuyoruz. Güvenilir ve adil bir enerji tedarikçisi olarak şeffaflık, gerçek yeşil enerji kalitesi ve samimi kişisel desteğe odaklanıyoruz.',
            mission_btn: 'Hakkımızda Daha Fazla Bilgi',

            // Timeline
            timeline_tag: 'Tarihçemiz',
            timeline_title: 'Zaman Tünelinde Yolculuğumuz',
            timeline_subtitle: 'Dortmund enerji öncüsünden %100 yenilenebilir enerji çözümlerinde lider iş ortağına.',
            milestone_2021_title: '2021 – Dortmund\'da Kuruluş',
            milestone_2021_desc: 'Dortmund lokasyonunda (Alter Hellweg 50) Alpha Energie GmbH\'nin kuruluşu. Gerçek yeşil enerjiyi şeffaf müşteri hizmetleriyle birleştirmek üzere Alman enerji piyasasında 15 yılı aşkın yönetim tecrübesiyle yola çıkıldı.',
            milestone_2023_title: '2023 – Büyüme & Portal Teknolojisi',
            milestone_2023_desc: 'Ülke çapında bir ağ kurulması ve hızlı, kağıtsız enerji sağlayıcı değişimi için tam dijital müşteri ve ortak portallarının kullanıma sunulması.',
            milestone_2024_title: '2024 – Sektörel Entegrasyon & § 14a EnWG',
            milestone_2024_desc: 'Yönetilebilir tüketim cihazlarıyla genişleme: %25\'e varan indirimli şebeke bedeliyle § 14a EnWG ısı pompası elektriği, fotovoltaik depolama sistemleri ve akıllı wallbox şarj çözümleri.',
            milestone_2026_title: '2026 – Yeni Yeşil Enerji Atılımı',
            milestone_2026_desc: 'En sıkı ok-power kriterlerine göre sertifikasyon, Federal Çevre Ajansı HKNR\'sinde %100 menşe tescili ve ALPHA BASIC, ALPHA TIME ve ALPHA PREMIUM tarifelerinin tanıtımı.',

            // FAQ
            faq_tag: 'Sorular & Cevaplar',
            faq_title: 'Sıkça Sorulan Sorular',
            faq_subtitle: 'Geçiş, fiyat garantisi ve faturalandırma hakkında bilmeniz gereken her şey.',
            faq_q1: 'Alpha Energie\'ye elektrik geçişi nasıl işler?',
            faq_a1: '3 basit adımda: 1. Hesaplayıcıda tarifeyi seçin. 2. Sayaç numarasını ve adresi girin. 3. Rahatınıza bakın – eski sözleşmenizi feshedip kesintisiz elektrik tedariğini sağlıyoruz.',
            faq_q2: 'Geçiş sırasında elektrik tedariği garantili mi?',
            faq_a2: 'Evet, %100. Almanya yasalarına göre elektrik akışı asla kesintiye uğramaz. Değişim tamamen arka planda idari olarak gerçekleşir.',
            faq_q3: '24 ay fiyat garantisi ne anlama geliyor?',
            faq_a3: 'Tam fiyat garantimizle enerji fiyatınızı piyasa dalgalanmalarına ve fiyat artışlarına karşı tam 24 ay boyunca güvence altına alırsınız.',

            // Order Modal
            modal_order_title: 'Online Sipariş & Tedarikçi Değişimi',
            modal_step1_prog: '1. Tarife & Tarih',
            modal_step2_prog: '2. Sayaç & Adres',
            modal_step3_prog: '3. Kişisel Bilgiler',
            modal_order_selected_label: 'Seçilen Tarife:',
            modal_order_monthly_label: 'Aylık ödeme:',
            modal_order_kwh_label: 'Yıllık tüketim:',
            modal_order_savings_prefix: 'Yılda ',
            modal_order_savings_suffix: ' €\'ya varan tasarruf',
            modal_order_start_label: 'Talep Edilen Başlangıç Tarihi',
            modal_order_opt_soon: 'En kısa sürede (mümkün olan en erken tarihte)',
            modal_order_opt_expire: 'Önceki tedarikçiyle olan mevcut sözleşmenin bitiminde',
            modal_order_opt_date: 'Belirli bir tarihte (ör. taşınma)',
            modal_order_btn_to_step2: 'Adım 2\'ye Devam Et: Sayaç Bilgileri →',

            modal_order_street: 'Cadde / Sokak *',
            modal_order_house_nr: 'Bina No *',
            modal_order_plz: 'Posta Kodu *',
            modal_order_city: 'Şehir *',
            modal_order_meter_number: 'Sayaç Numarası * (elektrik veya gaz sayacında)',
            modal_order_prev_provider: 'Önceki enerji sağlayıcısı (isteğe bağlı)',
            modal_order_cancel_checkbox: 'Alpha Energie önceki tedarikçimi ücretsiz ve zamanında feshetsin.',
            modal_order_btn_back: '← Geri',
            modal_order_btn_to_step3: 'Adım 3\'e Devam Et →',

            modal_order_salutation: 'Hitap',
            modal_order_salutation_mr: 'Bey',
            modal_order_salutation_ms: 'Hanım',
            modal_order_salutation_company: 'Şirket',
            modal_order_birthdate: 'Doğum tarihi (isteğe bağlı)',
            modal_order_first_name: 'Ad *',
            modal_order_last_name: 'Soyad *',
            modal_order_email: 'E-posta adresi *',
            modal_order_phone: 'Telefon numarası *',
            modal_order_iban: 'SEPA Otomatik Ödeme için IBAN *',
            modal_order_agb_checkbox: '<a href="datenschutz.html" target="_blank" style="text-decoration: underline; color: #ff7a00;">Gizlilik politikasını</a> ve siparişin bağlayıcı olarak iletilmesini onaylıyorum.',
            modal_order_btn_submit: 'Siparişi şimdi bağlayıcı olarak tamamla',

            modal_order_success_title: 'Siparişiniz için teşekkür ederiz!',
            modal_order_success_desc: 'Geçiş siparişiniz başarıyla kaydedildi. E-posta adresinize bir onay gönderdik.',
            modal_order_number_label: 'Sipariş numarası: ',
            modal_order_btn_close: 'Pencereyi kapat',

            // Meter Modal
            modal_meter_title: 'Online Sayaç Bildirimi',
            modal_meter_number: 'Sayaç numarası *',
            modal_meter_reading: 'Mevcut sayaç değeri (kWh) *',
            modal_meter_name: 'Adınız ve soyadınız *',
            modal_meter_email: 'E-posta adresiniz *',
            modal_meter_btn_submit: 'Sayaç değerini şimdi ilet',

            // Legal Cancellation Modal
            modal_cancel_title: 'Sözleşmeyi Feshet (§ 312k BGB)',
            modal_cancel_title_revoke: 'Siparişi İptal Et (Cayma Hakkı)',
            modal_cancel_contract_nr: 'Sözleşme veya müşteri numarası *',
            modal_cancel_name: 'Sözleşme sahibinin adı ve soyadı *',
            modal_cancel_email: 'Onay için e-posta adresiniz *',
            modal_cancel_reason: 'Neden (isteğe bağlı)',
            modal_cancel_btn_submit: 'Bağlayıcı bildirimi gönder',

            // Floating Action Bar (FAB)
            fab_whatsapp: 'WhatsApp Danışma',
            fab_meter: 'Sayaç bildir',
            fab_faq: 'SSS & Yardım',

            // Footer
            footer_desc: 'Alpha Energie GmbH ülke çapında şeffaf enerji çözümleri sunar: %100 yenilenebilir enerjiden yeşil elektrik, § 14a EnWG uyarınca ısı pompası elektriği ve iklim koruma katkılı doğal gaz.',
            footer_address: 'Alter Hellweg 50, 44379 Dortmund',
            footer_title_tariffs: 'Tarifeler & Elektrik',
            footer_title_service: 'Hizmet & Çözümler',
            footer_title_legal: 'Yasal Bilgiler',

            footer_link_oekostrom: '%100 Yeşil Elektrik',
            footer_link_waermestrom: 'Isı Pompası Elektriği (§ 14a)',
            footer_link_oekogas: 'İklim Katkılı Doğal Gaz',
            footer_link_gewerbestrom: 'Ticari Elektrik',
            footer_link_rechner: 'Tarife Hesaplayıcı',
            footer_link_kundenservice: 'Müşteri Hizmetleri',
            footer_link_zaehler: 'Online sayaç bildirimi',
            footer_link_sektorenkopplung: 'Sektörel Entegrasyon PV+Isı',
            footer_link_pv: 'Fotovoltaik',
            footer_link_partner: 'İş Ortağı Olun',
            footer_link_datenschutz: 'Gizlilik Politikası',
            footer_link_impressum: 'Künye',
            footer_link_cookie_settings: 'Çerez Ayarları',
            footer_link_cookie_policy: 'Çerez Politikası',
            footer_link_vp_portal: 'Ortak Portalı Girişi',

            footer_legal_cancel_text: '<strong>Yasal Fesih ve Cayma Hizmeti (§ 312k BGB):</strong> Alpha Energie GmbH bünyesindeki mevcut sözleşmenizi veya siparişinizi kayıt olmadan doğrudan buradan online olarak feshedebilir veya iptal edebilirsiniz.',
            footer_btn_cancel: 'Sözleşmeyi online feshet',
            footer_btn_revoke: 'Siparişi iptal et',
            footer_copyright: '© Telif Hakkı 2026. Tüm hakları saklıdır. Alpha Energie GmbH',
            footer_cookie_manage: 'Çerez ayarlarını yönet',

            // Dynamic format helpers
            per_month: '/ ay',
            kwh_year: 'kWh/yıl',
            savings_format: 'Yılda {val} €\'ya varan tasarruf',
            guarantee_format: 'Adil {val} ay sabit fiyat garantisi',
            max_savings_format: 'Yılda {val} €\'ya varan!'
        }
    };

    // Mapping of DOM selectors to translation keys.
    // Handles plain text or innerHTML depending on presence of HTML tags.
    const SELECTOR_MAPPINGS = [
        // Topbar
        { selector: '#topbar .topbar-left span', key: 'topbar_hours' },

        // Navigation
        { selector: '#main-nav .nav-list > li:nth-child(1) > a', key: 'nav_tariffs' },
        { selector: '#main-nav .dropdown a[href="oekostrom.html"]', key: 'nav_oekostrom' },
        { selector: '#main-nav .dropdown a[href="waermestrom.html"]', key: 'nav_waermestrom' },
        { selector: '#main-nav .dropdown a[href="oekogas.html"]', key: 'nav_oekogas' },
        { selector: '#main-nav .dropdown a[href="gewerbekunden.html"]', key: 'nav_gewerbe' },
        { selector: '#main-nav .nav-list > li:nth-child(2) > a', key: 'nav_solutions' },
        { selector: '#main-nav .dropdown a[href="photovoltaik.html"]', key: 'nav_photovoltaik' },
        { selector: '#main-nav .dropdown a[href="sektorenkopplung.html"]', key: 'nav_sektorenkopplung' },
        { selector: '#main-nav .dropdown a[href="nachhaltigkeit-co2.html"]', key: 'nav_co2_audits' },
        { selector: '#main-nav .nav-list > li:nth-child(3) > a', key: 'nav_service' },
        { selector: '#main-nav .dropdown a[href="#rechner"]', key: 'nav_calculator' },
        { selector: '#main-nav .dropdown a[href="service.html"]', key: 'nav_customer_service' },
        { selector: '#main-nav .dropdown a[href="service.html#zaehler"]', key: 'nav_meter_report' },
        { selector: '#main-nav .dropdown a[href="service.html#umzug"]', key: 'nav_relocation' },
        { selector: '#main-nav .nav-list > li:nth-child(4) > a', key: 'nav_company' },
        { selector: '#main-nav .dropdown a[href="ueber-uns.html"]', key: 'nav_about' },
        { selector: '#main-nav .dropdown a[href="partner-werden.html"]', key: 'nav_partner' },
        { selector: '#main-nav .dropdown a[href="karriere.html"]', key: 'nav_careers' },
        { selector: '#main-nav .dropdown a[href="kontakt.html"]', key: 'nav_contact' },
        { selector: '.header-actions a[href="#rechner"]', key: 'nav_btn_calc' },
        { selector: '.header-actions a[href="partner-werden.html"], .header-actions a[href="/"]', key: 'nav_btn_partner' },

        // Hero
        { selector: '.hero-versorger-content .versorger-tag', key: 'hero_tag', hasSvgPrefix: true },
        { selector: '.hero-versorger-title', key: 'hero_title', isHtml: true },
        { selector: '.hero-versorger-desc', key: 'hero_desc' },
        { selector: '.versorger-hero-badges .versorger-hero-badge-item:nth-child(1)', key: 'hero_badge_price', hasSvgPrefix: true },
        { selector: '.versorger-hero-badges .versorger-hero-badge-item:nth-child(2)', key: 'hero_badge_eco', hasSvgPrefix: true },
        { selector: '.versorger-hero-badges .versorger-hero-badge-item:nth-child(3)', key: 'hero_badge_switch', hasSvgPrefix: true },

        // Hero Visual Badges
        { selector: '.badge-top-right .badge-title', key: 'hero_float_badge1_title' },
        { selector: '.badge-top-right .badge-sub', key: 'hero_float_badge1_sub' },
        { selector: '.hero-badges-stack-left .hero-floating-glass-badge:nth-child(1) .badge-title', key: 'hero_float_badge2_title' },
        { selector: '.hero-badges-stack-left .hero-floating-glass-badge:nth-child(1) .badge-sub', key: 'hero_float_badge2_sub' },
        { selector: '.hero-badges-stack-left .hero-floating-glass-badge:nth-child(2) .badge-title', key: 'hero_float_badge3_title' },
        { selector: '.hero-badges-stack-left .hero-floating-glass-badge:nth-child(2) .badge-sub', key: 'hero_float_badge3_sub' },

        // Rechner Header & Tabs
        { selector: '#rechner .rechner-header-title', key: 'calc_title' },
        { selector: '#rechner .rechner-header-subtitle', key: 'calc_subtitle' },
        { selector: '.calc-tab-btn[data-branch="strom"] .calc-tab-title', key: 'calc_tab_strom_title' },
        { selector: '.calc-tab-btn[data-branch="strom"] .calc-tab-subtitle', key: 'calc_tab_strom_sub' },
        { selector: '.calc-tab-btn[data-branch="waerme"] .calc-tab-title', key: 'calc_tab_waerme_title' },
        { selector: '.calc-tab-btn[data-branch="waerme"] .calc-tab-subtitle', key: 'calc_tab_waerme_sub' },
        { selector: '.calc-tab-btn[data-branch="gas"] .calc-tab-title', key: 'calc_tab_gas_title' },
        { selector: '.calc-tab-btn[data-branch="gas"] .calc-tab-subtitle', key: 'calc_tab_gas_sub' },

        // Rechner Fields & Buttons
        { selector: 'label[for="calcPlz"]', key: 'calc_plz_label' },
        { selector: '#rechnerForm .calc-field-group:nth-child(2) > .calc-label', key: 'calc_household_label' },
        { selector: '.household-btn[data-kwh="1500"] .household-btn-label', key: 'calc_1pers' },
        { selector: '.household-btn[data-kwh="2500"] .household-btn-label', key: 'calc_2pers' },
        { selector: '.household-btn[data-kwh="3500"] .household-btn-label', key: 'calc_3pers' },
        { selector: '.household-btn[data-kwh="4500"] .household-btn-label', key: 'calc_4pers' },
        { selector: 'label[for="calcAbschlag"]', key: 'calc_abschlag_label' },
        { selector: '.savings-banner-box .savings-label', key: 'calc_savings_label' },
        { selector: '.calc-submit-btn', key: 'calc_submit_btn', isHtml: true },
        { selector: '.calc-guarantee-note', key: 'calc_guarantee_note', hasSvgPrefix: true },

        // Trust Bento Cards
        { selector: '.section-trust-metrics .trust-stat-card:nth-child(1) .stat-label', key: 'bento_card1_label' },
        { selector: '.section-trust-metrics .trust-stat-card:nth-child(1) .stat-desc', key: 'bento_card1_desc' },
        { selector: '.section-trust-metrics .trust-stat-card:nth-child(2) .stat-badge-pill', key: 'bento_pill_savings' },
        { selector: '.section-trust-metrics .trust-stat-card:nth-child(2) .stat-label', key: 'bento_card2_label' },
        { selector: '.section-trust-metrics .trust-stat-card:nth-child(2) .stat-desc', key: 'bento_card2_desc' },
        { selector: '.section-trust-metrics .trust-stat-card:nth-child(3) .stat-badge-pill', key: 'bento_pill_guarantee' },
        { selector: '.section-trust-metrics .trust-stat-card:nth-child(3) .stat-label', key: 'bento_card3_label' },
        { selector: '.section-trust-metrics .trust-stat-card:nth-child(3) .stat-desc', key: 'bento_card3_desc' },
        { selector: '.section-trust-metrics .trust-stat-card:nth-child(4) .stat-badge-pill', key: 'bento_pill_service' },
        { selector: '.section-trust-metrics .trust-stat-card:nth-child(4) .stat-label', key: 'bento_card4_label' },
        { selector: '.section-trust-metrics .trust-stat-card:nth-child(4) .stat-desc', key: 'bento_card4_desc' },

        // Tariff Section Header
        { selector: '#tarife .section-header .versorger-tag', key: 'tariffs_tag' },
        { selector: '#tarife .section-header .section-title', key: 'tariffs_title', isHtml: true },
        { selector: '#tarife .section-header .section-subtitle', key: 'tariffs_subtitle' },

        // Tariff Card 1: ALPHA BASIC
        { selector: '#card-alpha-basic .tariff-badge', key: 'tariff_basic_badge', isHtml: true },
        { selector: '#card-alpha-basic .tariff-bonus-pill', key: 'tariff_basic_bonus' },
        { selector: '#card-alpha-basic .tariff-feature-list .tariff-feature-item:nth-child(1) span', key: 'tariff_basic_b1' },
        { selector: '#card-alpha-basic .tariff-feature-list .tariff-feature-item:nth-child(2) span', key: 'tariff_basic_b2' },
        { selector: '#card-alpha-basic .tariff-feature-list .tariff-feature-item:nth-child(3) span', key: 'tariff_basic_b3' },
        { selector: '#card-alpha-basic .tariff-feature-list .tariff-feature-item:nth-child(4) span', key: 'tariff_basic_b4' },
        { selector: '#card-alpha-basic .tariff-feature-list .tariff-feature-item:nth-child(5) span', key: 'tariff_basic_b5' },
        { selector: '#card-alpha-basic .tariff-action-btn', key: 'tariff_basic_btn', isHtml: true },

        // Tariff Card 2: ALPHA TIME
        { selector: '#card-alpha-time .tariff-ribbon span', key: 'tariff_time_ribbon', isHtml: true },
        { selector: '#card-alpha-time .tariff-badge', key: 'tariff_time_badge', isHtml: true },
        { selector: '#card-alpha-time .tariff-bonus-pill', key: 'tariff_time_bonus' },
        { selector: '#card-alpha-time .tariff-feature-list .tariff-feature-item:nth-child(1) span', key: 'tariff_time_b1' },
        { selector: '#card-alpha-time .tariff-feature-list .tariff-feature-item:nth-child(2) span', key: 'tariff_time_b2' },
        { selector: '#card-alpha-time .tariff-feature-list .tariff-feature-item:nth-child(3) span', key: 'tariff_time_b3' },
        { selector: '#card-alpha-time .tariff-feature-list .tariff-feature-item:nth-child(4) span', key: 'tariff_time_b4' },
        { selector: '#card-alpha-time .tariff-feature-list .tariff-feature-item:nth-child(5) span', key: 'tariff_time_b5' },
        { selector: '#card-alpha-time .tariff-action-btn', key: 'tariff_time_btn', isHtml: true },

        // Tariff Card 3: ALPHA PREMIUM
        { selector: '#card-alpha-premium .tariff-badge', key: 'tariff_premium_badge', isHtml: true },
        { selector: '#card-alpha-premium .tariff-bonus-pill', key: 'tariff_premium_bonus' },
        { selector: '#card-alpha-premium .tariff-feature-list .tariff-feature-item:nth-child(1) span', key: 'tariff_premium_b1' },
        { selector: '#card-alpha-premium .tariff-feature-list .tariff-feature-item:nth-child(2) span', key: 'tariff_premium_b2' },
        { selector: '#card-alpha-premium .tariff-feature-list .tariff-feature-item:nth-child(3) span', key: 'tariff_premium_b3' },
        { selector: '#card-alpha-premium .tariff-feature-list .tariff-feature-item:nth-child(4) span', key: 'tariff_premium_b4' },
        { selector: '#card-alpha-premium .tariff-feature-list .tariff-feature-item:nth-child(5) span', key: 'tariff_premium_b5' },
        { selector: '#card-alpha-premium .tariff-action-btn', key: 'tariff_premium_btn', isHtml: true },

        // Advantages (Warum wir)
        { selector: '#warum-wir .section-header .versorger-tag', key: 'vorteile_tag' },
        { selector: '#warum-wir .section-header .section-title', key: 'vorteile_title' },
        { selector: '#warum-wir .section-header .section-subtitle', key: 'vorteile_subtitle' },
        { selector: '.vorteile-grid-5 .vorteil-card:nth-child(1) .vorteil-title', key: 'vorteil1_title', isHtml: true },
        { selector: '.vorteile-grid-5 .vorteil-card:nth-child(1) .vorteil-desc', key: 'vorteil1_desc', isHtml: true },
        { selector: '.vorteile-grid-5 .vorteil-card:nth-child(2) .vorteil-title', key: 'vorteil2_title', isHtml: true },
        { selector: '.vorteile-grid-5 .vorteil-card:nth-child(2) .vorteil-desc', key: 'vorteil2_desc', isHtml: true },
        { selector: '.vorteile-grid-5 .vorteil-card:nth-child(3) .vorteil-title', key: 'vorteil3_title', isHtml: true },
        { selector: '.vorteile-grid-5 .vorteil-card:nth-child(3) .vorteil-desc', key: 'vorteil3_desc', isHtml: true },
        { selector: '.vorteile-grid-5 .vorteil-card:nth-child(4) .vorteil-title', key: 'vorteil4_title', isHtml: true },
        { selector: '.vorteile-grid-5 .vorteil-card:nth-child(4) .vorteil-desc', key: 'vorteil4_desc', isHtml: true },
        { selector: '.vorteile-grid-5 .vorteil-card:nth-child(5) .vorteil-title', key: 'vorteil5_title', isHtml: true },
        { selector: '.vorteile-grid-5 .vorteil-card:nth-child(5) .vorteil-desc', key: 'vorteil5_desc', isHtml: true },

        // ok-power Box
        { selector: '.ok-power-logo-badge .ok-sub', key: 'ok_power_sub' },
        { selector: '.ok-power-text-col .ok-power-title', key: 'ok_power_title' },
        { selector: '.ok-power-text-col .ok-power-desc', key: 'ok_power_desc', isHtml: true },
        { selector: '.ok-pillar-item:nth-child(1) div:last-child', key: 'ok_power_p1', isHtml: true },
        { selector: '.ok-pillar-item:nth-child(2) div:last-child', key: 'ok_power_p2', isHtml: true },
        { selector: '.ok-pillar-item:nth-child(3) div:last-child', key: 'ok_power_p3', isHtml: true },
        { selector: '.ok-pillar-item:nth-child(4) div:last-child', key: 'ok_power_p4', isHtml: true },

        // Comparison Matrix
        { selector: '#vergleich .section-header .versorger-tag', key: 'matrix_tag' },
        { selector: '#vergleich .section-header .section-title', key: 'matrix_title' },
        { selector: '#vergleich .section-header .section-subtitle', key: 'matrix_subtitle' },
        { selector: '.matrix-th-feature', key: 'matrix_th_feature', isHtml: true },
        { selector: '.th-alpha-badge', key: 'matrix_th_alpha_badge' },
        { selector: '.th-alpha-title', key: 'matrix_th_alpha_title' },
        { selector: '.th-alpha-sub', key: 'matrix_th_alpha_sub' },
        { selector: '.th-standard-title', key: 'matrix_th_standard_title' },
        { selector: '.th-standard-sub', key: 'matrix_th_standard_sub' },

        { selector: '.comparison-matrix-table tbody tr:nth-child(1) td.matrix-td-feature strong', key: 'matrix_r1_feature', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(1) td.matrix-td-feature .matrix-hint', key: 'matrix_r1_hint', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(1) td.matrix-td-alpha span', key: 'matrix_r1_alpha', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(1) td.matrix-td-standard span', key: 'matrix_r1_standard', isHtml: true },

        { selector: '.comparison-matrix-table tbody tr:nth-child(2) td.matrix-td-feature strong', key: 'matrix_r2_feature', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(2) td.matrix-td-feature .matrix-hint', key: 'matrix_r2_hint', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(2) td.matrix-td-alpha span', key: 'matrix_r2_alpha', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(2) td.matrix-td-standard span', key: 'matrix_r2_standard', isHtml: true },

        { selector: '.comparison-matrix-table tbody tr:nth-child(3) td.matrix-td-feature strong', key: 'matrix_r3_feature', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(3) td.matrix-td-feature .matrix-hint', key: 'matrix_r3_hint', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(3) td.matrix-td-alpha span', key: 'matrix_r3_alpha', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(3) td.matrix-td-standard span', key: 'matrix_r3_standard', isHtml: true },

        { selector: '.comparison-matrix-table tbody tr:nth-child(4) td.matrix-td-feature strong', key: 'matrix_r4_feature', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(4) td.matrix-td-feature .matrix-hint', key: 'matrix_r4_hint', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(4) td.matrix-td-alpha span', key: 'matrix_r4_alpha', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(4) td.matrix-td-standard span', key: 'matrix_r4_standard', isHtml: true },

        { selector: '.comparison-matrix-table tbody tr:nth-child(5) td.matrix-td-feature strong', key: 'matrix_r5_feature', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(5) td.matrix-td-feature .matrix-hint', key: 'matrix_r5_hint', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(5) td.matrix-td-alpha span', key: 'matrix_r5_alpha', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(5) td.matrix-td-standard span', key: 'matrix_r5_standard', isHtml: true },

        { selector: '.comparison-matrix-table tbody tr:nth-child(6) td.matrix-td-feature strong', key: 'matrix_r6_feature', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(6) td.matrix-td-feature .matrix-hint', key: 'matrix_r6_hint', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(6) td.matrix-td-alpha span', key: 'matrix_r6_alpha', isHtml: true },
        { selector: '.comparison-matrix-table tbody tr:nth-child(6) td.matrix-td-standard span', key: 'matrix_r6_standard', isHtml: true },

        { selector: '#vergleich a.btn-primary', key: 'matrix_cta_btn', isHtml: true },

        // Sektorenkopplung
        { selector: '#sektorenkopplung .section-header .versorger-tag', key: 'sektor_tag' },
        { selector: '#sektorenkopplung .section-header .section-title', key: 'sektor_title' },
        { selector: '#sektorenkopplung .section-header .section-subtitle', key: 'sektor_subtitle' },
        { selector: '.sektor-grid-3 .sektor-card:nth-child(1) .sektor-title', key: 'sektor1_title', isHtml: true },
        { selector: '.sektor-grid-3 .sektor-card:nth-child(1) .sektor-text', key: 'sektor1_desc' },
        { selector: '.sektor-grid-3 .sektor-card:nth-child(1) a.btn-secondary', key: 'sektor1_btn' },
        { selector: '.sektor-grid-3 .sektor-card:nth-child(2) .sektor-title', key: 'sektor2_title' },
        { selector: '.sektor-grid-3 .sektor-card:nth-child(2) .sektor-text', key: 'sektor2_desc' },
        { selector: '.sektor-grid-3 .sektor-card:nth-child(2) a.btn-secondary', key: 'sektor2_btn' },
        { selector: '.sektor-grid-3 .sektor-card:nth-child(3) .sektor-title', key: 'sektor3_title', isHtml: true },
        { selector: '.sektor-grid-3 .sektor-card:nth-child(3) .sektor-text', key: 'sektor3_desc' },
        { selector: '.sektor-grid-3 .sektor-card:nth-child(3) a.btn-secondary', key: 'sektor3_btn' },

        // Solutions (B2B & VP)
        { selector: '#solutions .solution-card:nth-child(1) .versorger-tag', key: 'sol_b2b_tag', isHtml: true },
        { selector: '#solutions .solution-card:nth-child(1) .card-title', key: 'sol_b2b_title' },
        { selector: '#solutions .solution-card:nth-child(1) .card-text', key: 'sol_b2b_desc' },
        { selector: '#solutions .solution-card:nth-child(1) a.btn-primary', key: 'sol_b2b_btn' },
        { selector: '#solutions .solution-card:nth-child(2) .versorger-tag', key: 'sol_vp_tag', isHtml: true },
        { selector: '#solutions .solution-card:nth-child(2) .card-title', key: 'sol_vp_title' },
        { selector: '#solutions .solution-card:nth-child(2) .card-text', key: 'sol_vp_desc' },
        { selector: '#solutions .solution-card:nth-child(2) a.btn-secondary', key: 'sol_vp_btn' },

        // Mission / Video Intro
        { selector: '.ai-video-badge', key: 'mission_ai_badge' },
        { selector: '#video-intro .versorger-tag', key: 'mission_tag' },
        { selector: '#video-intro .section-title', key: 'mission_title' },
        { selector: '#video-intro .video-intro-text p', key: 'mission_desc' },
        { selector: '#video-intro a.btn-primary', key: 'mission_btn' },

        // Timeline
        { selector: '#about .section-header .versorger-tag', key: 'timeline_tag' },
        { selector: '#about .section-header .section-title', key: 'timeline_title' },
        { selector: '#about .section-header .section-subtitle', key: 'timeline_subtitle' },
        { selector: '[data-year="2021"] .milestone-title', key: 'milestone_2021_title' },
        { selector: '[data-year="2021"] .milestone-text', key: 'milestone_2021_desc' },
        { selector: '[data-year="2023"] .milestone-title', key: 'milestone_2023_title', isHtml: true },
        { selector: '[data-year="2023"] .milestone-text', key: 'milestone_2023_desc' },
        { selector: '[data-year="2024"] .milestone-title', key: 'milestone_2024_title', isHtml: true },
        { selector: '[data-year="2024"] .milestone-text', key: 'milestone_2024_desc' },
        { selector: '[data-year="2026"] .milestone-title', key: 'milestone_2026_title' },
        { selector: '[data-year="2026"] .milestone-text', key: 'milestone_2026_desc' },

        // FAQ
        { selector: '#faq .section-header .versorger-tag', key: 'faq_tag', isHtml: true },
        { selector: '#faq .section-header .section-title', key: 'faq_title' },
        { selector: '#faq .section-header .section-subtitle', key: 'faq_subtitle' },
        { selector: '.faq-list .faq-accordion-item:nth-child(1) .faq-question-btn span:first-child', key: 'faq_q1' },
        { selector: '.faq-list .faq-accordion-item:nth-child(1) .faq-answer-content', key: 'faq_a1' },
        { selector: '.faq-list .faq-accordion-item:nth-child(2) .faq-question-btn span:first-child', key: 'faq_q2' },
        { selector: '.faq-list .faq-accordion-item:nth-child(2) .faq-answer-content', key: 'faq_a2' },
        { selector: '.faq-list .faq-accordion-item:nth-child(3) .faq-question-btn span:first-child', key: 'faq_q3' },
        { selector: '.faq-list .faq-accordion-item:nth-child(3) .faq-answer-content', key: 'faq_a3' },

        // Order Modal
        { selector: '#orderModal .modal-header-title', key: 'modal_order_title', isHtml: true },
        { selector: '#progStep1', key: 'modal_step1_prog', isHtml: true },
        { selector: '#progStep2', key: 'modal_step2_prog', isHtml: true },
        { selector: '#progStep3', key: 'modal_step3_prog' },
        { selector: '#modalStep1 > div:first-child > div:nth-child(1)', key: 'modal_order_selected_label' },
        { selector: 'label[for="orderStartDate"]', key: 'modal_order_start_label' },
        { selector: '#orderStartDate option[value="schnellstmoeglich"]', key: 'modal_order_opt_soon' },
        { selector: '#orderStartDate option[value="ablauf"]', key: 'modal_order_opt_expire' },
        { selector: '#orderStartDate option[value="wunschtermin"]', key: 'modal_order_opt_date' },
        { selector: '#btnStep1Next', key: 'modal_order_btn_to_step2', isHtml: true },

        { selector: 'label[for="orderStreet"]', key: 'modal_order_street' },
        { selector: 'label[for="orderHouseNr"]', key: 'modal_order_house_nr' },
        { selector: 'label[for="orderPlz"]', key: 'modal_order_plz' },
        { selector: 'label[for="orderCity"]', key: 'modal_order_city' },
        { selector: 'label[for="orderMeterNumber"]', key: 'modal_order_meter_number' },
        { selector: 'label[for="orderPrevProvider"]', key: 'modal_order_prev_provider' },
        { selector: 'label[for="orderCancelOld"]', key: 'modal_order_cancel_checkbox' },
        { selector: '#btnStep2Back', key: 'modal_order_btn_back', isHtml: true },
        { selector: '#btnStep2Next', key: 'modal_order_btn_to_step3', isHtml: true },

        { selector: 'label[for="orderSalutation"]', key: 'modal_order_salutation' },
        { selector: '#orderSalutation option[value="Herr"]', key: 'modal_order_salutation_mr' },
        { selector: '#orderSalutation option[value="Frau"]', key: 'modal_order_salutation_ms' },
        { selector: '#orderSalutation option[value="Firma"]', key: 'modal_order_salutation_company' },
        { selector: 'label[for="orderBirthDate"]', key: 'modal_order_birthdate' },
        { selector: 'label[for="orderFirstName"]', key: 'modal_order_first_name' },
        { selector: 'label[for="orderLastName"]', key: 'modal_order_last_name' },
        { selector: 'label[for="orderEmail"]', key: 'modal_order_email' },
        { selector: 'label[for="orderPhone"]', key: 'modal_order_phone' },
        { selector: 'label[for="orderIban"]', key: 'modal_order_iban' },
        { selector: 'label[for="orderAgb"]', key: 'modal_order_agb_checkbox', isHtml: true },
        { selector: '#btnStep3Back', key: 'modal_order_btn_back', isHtml: true },
        { selector: '#btnStep3Submit', key: 'modal_order_btn_submit' },

        { selector: '#modalStep4 h3', key: 'modal_order_success_title' },
        { selector: '#modalStep4 p', key: 'modal_order_success_desc' },
        { selector: '#modalStep4 button', key: 'modal_order_btn_close' },

        // Meter Reading Modal
        { selector: '#meterModal .modal-header-title', key: 'modal_meter_title' },
        { selector: 'label[for="meterNumberInput"]', key: 'modal_meter_number' },
        { selector: 'label[for="meterReadingInput"]', key: 'modal_meter_reading' },
        { selector: 'label[for="meterNameInput"]', key: 'modal_meter_name' },
        { selector: 'label[for="meterEmailInput"]', key: 'modal_meter_email' },
        { selector: '#formMeterReading button[type="submit"]', key: 'modal_meter_btn_submit' },

        // Legal Cancellation Modal
        { selector: '#legalCancelModal #cancelModalTitle', key: 'modal_cancel_title' },
        { selector: 'label[for="cancelContractNumber"]', key: 'modal_cancel_contract_nr' },
        { selector: 'label[for="cancelCustomerName"]', key: 'modal_cancel_name' },
        { selector: 'label[for="cancelEmail"]', key: 'modal_cancel_email' },
        { selector: 'label[for="cancelReason"]', key: 'modal_cancel_reason' },
        { selector: '#formLegalCancel button[type="submit"]', key: 'modal_cancel_btn_submit' },

        // Floating Action Bar (FAB) Tooltips
        { selector: 'a.fab-whatsapp .fab-tooltip', key: 'fab_whatsapp' },
        { selector: '#btnOpenMeterModal .fab-tooltip', key: 'fab_meter' },
        { selector: 'a[href="service.html#faq"] .fab-tooltip', key: 'fab_faq', isHtml: true },

        // Footer
        { selector: '#main-footer .footer-desc', key: 'footer_desc' },
        { selector: '#main-footer .footer-address', key: 'footer_address' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(2) .widget-title', key: 'footer_title_tariffs', isHtml: true },
        { selector: '#main-footer .footer-top .links-widget:nth-child(2) .footer-links li:nth-child(1) a', key: 'footer_link_oekostrom' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(2) .footer-links li:nth-child(2) a', key: 'footer_link_waermestrom' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(2) .footer-links li:nth-child(3) a', key: 'footer_link_oekogas' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(2) .footer-links li:nth-child(4) a', key: 'footer_link_gewerbestrom' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(2) .footer-links li:nth-child(5) a', key: 'footer_link_rechner' },

        { selector: '#main-footer .footer-top .links-widget:nth-child(3) .widget-title', key: 'footer_title_service', isHtml: true },
        { selector: '#main-footer .footer-top .links-widget:nth-child(3) .footer-links li:nth-child(1) a', key: 'footer_link_kundenservice' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(3) .footer-links li:nth-child(2) a', key: 'footer_link_zaehler' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(3) .footer-links li:nth-child(3) a', key: 'footer_link_sektorenkopplung' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(3) .footer-links li:nth-child(4) a', key: 'footer_link_pv' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(3) .footer-links li:nth-child(5) a', key: 'footer_link_partner' },

        { selector: '#main-footer .footer-top .links-widget:nth-child(4) .widget-title', key: 'footer_title_legal' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(4) .footer-links li:nth-child(1) a', key: 'footer_link_datenschutz' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(4) .footer-links li:nth-child(2) a', key: 'footer_link_impressum' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(4) .footer-links li:nth-child(3) a', key: 'footer_link_cookie_settings' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(4) .footer-links li:nth-child(4) a', key: 'footer_link_cookie_policy' },
        { selector: '#main-footer .footer-top .links-widget:nth-child(4) .footer-links li:nth-child(5) a', key: 'footer_link_vp_portal' },

        { selector: '.legal-cancellation-box .legal-cancel-text', key: 'footer_legal_cancel_text', isHtml: true },
        { selector: '#btnOpenCancelModal', key: 'footer_btn_cancel' },
        { selector: '#btnOpenRevokeModal', key: 'footer_btn_revoke' },
        { selector: '#main-footer .footer-bottom .copyright', key: 'footer_copyright' },
        { selector: '#main-footer .cookie-settings .cookie-link', key: 'footer_cookie_manage' }
    ];

    let currentLang = 'de';

    /**
     * Cache the original German text or innerHTML of an element
     */
    function cacheOriginal(el, hasSvgPrefix) {
        if (!el) return;
        if (el.dataset.i18nOriginal === undefined) {
            if (hasSvgPrefix) {
                // If it starts with an SVG, preserve SVG node and text separately
                const svg = el.querySelector('svg');
                if (svg) {
                    el.dataset.i18nSvgHtml = svg.outerHTML;
                    // Extract text content after svg
                    const clone = el.cloneNode(true);
                    const cloneSvg = clone.querySelector('svg');
                    if (cloneSvg) cloneSvg.remove();
                    el.dataset.i18nOriginal = clone.textContent.trim();
                } else {
                    el.dataset.i18nOriginal = el.innerHTML;
                }
            } else {
                el.dataset.i18nOriginal = el.innerHTML;
            }
        }
    }

    /**
     * Set language across the entire application
     * @param {string} lang - 'de', 'en', or 'tr'
     */
    function setLanguage(lang) {
        if (!['de', 'en', 'tr'].includes(lang)) {
            lang = 'de';
        }
        currentLang = lang;

        // 1. Update HTML lang attribute & document title
        document.documentElement.lang = lang;
        if (I18N_DATA[lang] && I18N_DATA[lang].page_title) {
            document.title = I18N_DATA[lang].page_title;
        } else if (lang === 'de') {
            document.title = (I18N_DATA.de && I18N_DATA.de.page_title) || 'Alpha Energie | 100% Ökostrom & Gastarife deutschlandweit';
        }

        // 2. Persist in localStorage
        try {
            localStorage.setItem('alpha_lang', lang);
        } catch (e) {}

        // 3. Update active classes on language buttons
        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 4. Update Welcome Toast Banner
        const langToast = document.getElementById('langToastBanner');
        const langToastText = document.getElementById('langToastText');
        if (langToast && langToastText) {
            if (lang === 'de') {
                langToast.style.display = 'none';
            } else if (I18N_DATA[lang] && I18N_DATA[lang].toast_text) {
                langToastText.innerHTML = I18N_DATA[lang].toast_text;
                langToast.style.display = 'block';
            }
        }

        // 5. Apply translations to all mapped selectors
        SELECTOR_MAPPINGS.forEach(mapping => {
            const el = document.querySelector(mapping.selector);
            if (!el) return;

            // Cache German original if not yet stored
            cacheOriginal(el, mapping.hasSvgPrefix);

            if (lang === 'de') {
                // Restore exact original
                if (mapping.hasSvgPrefix && el.dataset.i18nSvgHtml) {
                    el.innerHTML = el.dataset.i18nSvgHtml + ' ' + (el.dataset.i18nOriginal || '');
                } else {
                    el.innerHTML = el.dataset.i18nOriginal;
                }
            } else {
                const trans = I18N_DATA[lang][mapping.key];
                if (trans !== undefined) {
                    if (mapping.hasSvgPrefix && el.dataset.i18nSvgHtml) {
                        el.innerHTML = el.dataset.i18nSvgHtml + ' ' + trans;
                    } else if (mapping.isHtml) {
                        el.innerHTML = trans;
                    } else {
                        el.textContent = trans;
                    }
                }
            }
        });

        // 6. Support any element with explicit data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.dataset.i18nOriginal === undefined) {
                el.dataset.i18nOriginal = el.innerHTML;
            }
            if (lang === 'de') {
                el.innerHTML = el.dataset.i18nOriginal;
            } else if (I18N_DATA[lang] && I18N_DATA[lang][key] !== undefined) {
                el.innerHTML = I18N_DATA[lang][key];
            }
        });

        // 7. Support input placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (el.dataset.i18nOriginalPlaceholder === undefined) {
                el.dataset.i18nOriginalPlaceholder = el.placeholder;
            }
            if (lang === 'de') {
                el.placeholder = el.dataset.i18nOriginalPlaceholder;
            } else if (I18N_DATA[lang] && I18N_DATA[lang][key] !== undefined) {
                el.placeholder = I18N_DATA[lang][key];
            }
        });

        // 8. Update Bento Metric Counters prefix/suffix according to language
        updateBentoMetrics(lang);

        // 9. Update dynamic calculator elements and trigger recalculation
        updateCalculatorDynamicTexts(lang);

        // 10. Dispatch languageChanged custom event
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
    }

    /**
     * Update Bento Cards counters (e.g. prefix "Bis zu" / "Up to", suffix "Monate" / "Months")
     */
    function updateBentoMetrics(lang) {
        const card2Number = document.querySelector('.section-trust-metrics .trust-stat-card:nth-child(2) .stat-number');
        if (card2Number) {
            if (card2Number.dataset.i18nOriginal === undefined) {
                card2Number.dataset.i18nOriginal = card2Number.textContent;
            }
            if (lang === 'de') {
                card2Number.setAttribute('data-counter-prefix', 'Bis zu ');
                card2Number.setAttribute('data-counter-suffix', ' €');
                card2Number.textContent = card2Number.dataset.i18nOriginal;
            } else if (lang === 'en') {
                card2Number.setAttribute('data-counter-prefix', 'Up to €');
                card2Number.setAttribute('data-counter-suffix', '');
                card2Number.textContent = 'Up to €380';
            } else if (lang === 'tr') {
                card2Number.setAttribute('data-counter-prefix', '');
                card2Number.setAttribute('data-counter-suffix', " €'ya varan");
                card2Number.textContent = "380 €'ya varan";
            }
        }

        const card3Number = document.querySelector('.section-trust-metrics .trust-stat-card:nth-child(3) .stat-number');
        if (card3Number) {
            if (card3Number.dataset.i18nOriginal === undefined) {
                card3Number.dataset.i18nOriginal = card3Number.textContent;
            }
            if (lang === 'de') {
                card3Number.setAttribute('data-counter-suffix', ' Monate');
                card3Number.textContent = card3Number.dataset.i18nOriginal;
            } else if (lang === 'en') {
                card3Number.setAttribute('data-counter-suffix', ' Months');
                card3Number.textContent = '24 Months';
            } else if (lang === 'tr') {
                card3Number.setAttribute('data-counter-suffix', ' Ay');
                card3Number.textContent = '24 Ay';
            }
        }
    }

    /**
     * Update dynamic branch notice & trigger tariff recalculation
     */
    function updateCalculatorDynamicTexts(lang) {
        const activeTab = document.querySelector('.calc-tab-btn.active');
        const branch = activeTab ? activeTab.getAttribute('data-branch') || 'strom' : 'strom';
        const noticeEl = document.getElementById('calcBranchNoticeText');
        if (noticeEl) {
            if (noticeEl.dataset.i18nOriginal === undefined) {
                noticeEl.dataset.i18nOriginal = noticeEl.textContent;
            }
            if (lang === 'de') {
                if (branch === 'waerme') {
                    noticeEl.textContent = 'Wärmestrom nach § 14a EnWG • Bis zu 25 % reduzierte Netzentgelte für Wärmepumpen';
                } else if (branch === 'gas') {
                    noticeEl.textContent = 'Erdgas mit freiwilligem Klimaschutzbeitrag • Zertifizierte CO2-Kompensation';
                } else {
                    noticeEl.textContent = 'Ökostrom aus 100 % erneuerbaren Energien • Geprüft nach ok-power Kriterien';
                }
            } else {
                noticeEl.textContent = getBranchNotice(branch, lang);
            }
        }

        // Trigger recalculation if main.js calculator engine is present
        if (typeof window.recalculateTariffs === 'function') {
            window.recalculateTariffs();
        }
    }

    /**
     * Get branch notice string for the active or given language
     */
    function getBranchNotice(branch, lang) {
        const l = lang || currentLang;
        if (l === 'de') {
            if (branch === 'waerme') return 'Wärmestrom nach § 14a EnWG • Bis zu 25 % reduzierte Netzentgelte für Wärmepumpen';
            if (branch === 'gas') return 'Erdgas mit freiwilligem Klimaschutzbeitrag • Zertifizierte CO2-Kompensation';
            return 'Ökostrom aus 100 % erneuerbaren Energien • Geprüft nach ok-power Kriterien';
        }
        const data = I18N_DATA[l] || I18N_DATA.en;
        if (branch === 'waerme') return data.notice_waerme;
        if (branch === 'gas') return data.notice_gas;
        return data.notice_strom;
    }

    /**
     * Format monthly price badge
     */
    function formatMonthlyPrice(amount, lang) {
        const l = lang || currentLang;
        if (l === 'de') return `${amount} €<span> / Monat</span>`;
        if (l === 'tr') return `${amount} €<span> / ay</span>`;
        return `€${amount}<span> / month</span>`;
    }

    /**
     * Format tariff savings
     */
    function formatSavings(amount, lang) {
        const l = lang || currentLang;
        if (l === 'de') return `Bis zu ${amount} € / Jahr sparen`;
        if (l === 'tr') return `Yılda ${amount} €'ya varan tasarruf`;
        return `Save up to €${amount} / year`;
    }

    /**
     * Format tariff guarantee
     */
    function formatGuarantee(months, lang) {
        const l = lang || currentLang;
        if (l === 'de') return `Faire ${months} Monate Preisgarantie`;
        if (l === 'tr') return `Adil ${months} ay sabit fiyat garantisi`;
        return `Fair ${months} months price guarantee`;
    }

    /**
     * Format maximum calculator savings
     */
    function formatMaxSavings(amount, lang) {
        const l = lang || currentLang;
        if (l === 'de') return `Bis zu ${amount} € / Jahr!`;
        if (l === 'tr') return `Yılda ${amount} €'ya varan!`;
        return `Up to €${amount} / year!`;
    }

    /**
     * Format kWh and ct/kWh description
     */
    function formatKwhDesc(kwh, ctPerKwh, lang) {
        const l = lang || currentLang;
        const locale = l === 'en' ? 'en-US' : (l === 'tr' ? 'tr-TR' : 'de-DE');
        const kwhFormatted = Number(kwh).toLocaleString(locale);
        const ctFormatted = l === 'en' ? ctPerKwh.toFixed(2) : ctPerKwh.toFixed(2).replace('.', ',');
        const unit = l === 'en' ? 'kWh/year' : (l === 'tr' ? 'kWh/yıl' : 'kWh/Jahr');
        return `${kwhFormatted} ${unit} • ${ctFormatted} ct/kWh`;
    }

    /**
     * General string lookup
     */
    function t(key, fallback = '') {
        if (currentLang === 'de') return fallback;
        const data = I18N_DATA[currentLang];
        return (data && data[key] !== undefined) ? data[key] : fallback;
    }

    /**
     * Initialization routine
     */
    function init() {
        // Detect initial language: URL query parameter (?lang=...) takes precedence, then localStorage, default 'de'
        let initialLang = 'de';
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const queryLang = urlParams.get('lang');
            if (queryLang && ['de', 'en', 'tr'].includes(queryLang.toLowerCase())) {
                initialLang = queryLang.toLowerCase();
            } else {
                const storedLang = localStorage.getItem('alpha_lang');
                if (storedLang && ['de', 'en', 'tr'].includes(storedLang.toLowerCase())) {
                    initialLang = storedLang.toLowerCase();
                }
            }
        } catch (e) {}

        // Bind click events on all .lang-btn elements
        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetLang = btn.getAttribute('data-lang');
                if (targetLang) {
                    setLanguage(targetLang);
                }
            });
        });

        // Close toast button
        const langToastClose = document.getElementById('langToastClose');
        const langToast = document.getElementById('langToastBanner');
        if (langToastClose && langToast) {
            langToastClose.addEventListener('click', () => {
                langToast.style.display = 'none';
            });
        }

        // Pre-cache German original values immediately
        SELECTOR_MAPPINGS.forEach(mapping => {
            const el = document.querySelector(mapping.selector);
            if (el) cacheOriginal(el, mapping.hasSvgPrefix);
        });

        // If stored language is EN or TR, switch now!
        if (initialLang !== 'de') {
            setLanguage(initialLang);
        }
    }

    // Expose public API
    window.i18n = {
        I18N_DATA: I18N_DATA,
        setLanguage: setLanguage,
        getLanguage: function () { return currentLang; },
        t: t,
        getBranchNotice: getBranchNotice,
        formatMonthlyPrice: formatMonthlyPrice,
        formatSavings: formatSavings,
        formatGuarantee: formatGuarantee,
        formatMaxSavings: formatMaxSavings,
        formatKwhDesc: formatKwhDesc,
        init: init
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window, document);
