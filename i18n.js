/**
 * Alpha Energie GmbH - Multi-Language Translation System (i18n)
 * Supports: German (DE), English (EN), Turkish (TR), Arabic (AR)
 * Idiomatic utility & renewable energy terminology.
 * Lossless roundtrip restoration to German via dataset.i18nOriginal.
 * 0 Emojis, 100% Vector SVGs, 0 Firstcon visible frontend mentions.
 */

(function (window, document) {
    'use strict';

    const I18N_DATA = {
        de: {
            page_title: 'Alpha Energie | 100% Ökostrom & Gastarife deutschlandweit',
            bento_card2_number: 'Bis zu 380 €',
            bento_card3_number: '24 Monate'
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
            hero_desc: 'Switch in just 3 minutes to green electricity from 100% renewable energy, reliable § 14a heat pump power, or natural gas with voluntary climate contribution. Available nationwide with up to 24 months full price guarantee, up to €380 annual savings, and personal customer service at the Dortmund headquarters.',
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
            tariff_basic_savings: 'Save up to €300 / year',
            tariff_basic_b1: '12 months full price guarantee',
            tariff_basic_b2: 'Green electricity from 100% renewable energy (hydropower)',
            tariff_basic_b3: 'Monthly cancelable after 1st year',
            tariff_basic_b4: 'Free switching service & deregistration',
            tariff_basic_btn: 'Select Tariff →',

            tariff_time_ribbon: 'Best Value & Bestseller',
            tariff_time_badge: 'Bestseller & Savings Advantage',
            tariff_time_savings: 'Save up to €380 / year',
            tariff_time_b1: 'Extra low energy working price (24.50 ct/kWh)',
            tariff_time_b2: '12 months full price guarantee without price hikes',
            tariff_time_b3: '100% certified green electricity (ok-power seal)',
            tariff_time_b4: 'Free switching service incl. old contract cancellation',
            tariff_time_btn: 'Select Bestseller →',

            tariff_premium_badge: '24-Month Price Protection & VIP',
            tariff_premium_savings: 'Save up to €280 / year',
            tariff_premium_b1: '24 months full price stability until 2028',
            tariff_premium_b2: 'Green electricity from 100% renewable energy (ok-power)',
            tariff_premium_b3: 'Priority customer service from Dortmund',
            tariff_premium_b4: 'Protection against rising taxes & grid fees',
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

            matrix_r3_feature: 'Savings & Fair Tariffs',
            matrix_r3_hint: 'Monthly payment & conditions',
            matrix_r3_alpha: '<strong>Up to €380 savings / year</strong> through fair transparent conditions',
            matrix_r3_standard: 'Significantly higher basic supply rate, no savings',

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
            max_savings_format: 'Up to €{val} / year!',

            // Octopus-Style Sections (versorger.html)
            octo_promo_bar: '<strong>Up to €380 annual savings</strong> compared to basic supply &amp; up to <strong>24 months full price guarantee</strong>. <a href="#rechner" class="octo-promo-code">Calculate savings now &rarr;</a>',
            octo_hero_pre: 'Switch now to',
            octo_hero_trust_1: '<strong>4.9 out of 5 stars</strong> in <a href="#bewertungen">customer reviews</a> • 100% ok-power green electricity &amp; eco-gas',
            octo_hero_trust_2: '<a href="#tarife">Alpha Switching Guarantee</a> – Up to 24 months full price protection',
            octo_hero_trust_3: 'Personal phone service from Dortmund: <strong>0231 39989390</strong>',
            octo_wolf_pill: '⚡ Your Alpha-Wolf',
            octo_stage_badge_top: 'Save up to €380 / year',
            octo_calc_kwh_label: 'Annual Consumption',
            octo_award1_title: 'Alpha Switching Guarantee',
            octo_award1_sub: 'Never without power (§ 20 EnWG) & €0 switching costs',
            octo_award2_title: 'Top Service Germany',
            octo_award2_sub: 'Personal customer center on site in Dortmund',
            octo_award3_title: 'ok-power Certified',
            octo_award3_sub: '100% genuine green electricity in the UBA HKNR register',
            octo_award4_title: 'Best Value Winner',
            octo_award4_sub: 'Official BDEB member & up to 24M price protection',
            octo_mascot_tarife_tag: 'Alpha-Wolf Tip',
            octo_mascot_tarife_text: 'Lock in your preferred tariff with price guarantee right here!',
            octo_bento1_h3: 'Find out which tariff fits you best!',
            octo_bento1_p: 'Tell us how you use energy – we find the right Alpha Energie tariff for your home in seconds.',
            octo_bento1_btn: 'Find Tariff',
            octo_bento2_h3: 'Save permanently – with zero hidden costs',
            octo_bento2_p: 'We rely on permanently low working and base prices instead of short-term teaser offers. Secure <strong>up to €380 annual savings</strong> compared to basic supply and <strong>up to 24 months full price guarantee</strong>.',
            octo_bento2_btn: 'Calculate Savings Now',
            octo_mehr_h2: 'More energy for your money.',
            octo_mehr_sub: 'Secure affordable green electricity & gas tariffs for yourself or your business',
            octo_smart_h2: '100% green electricity & climate-neutral eco-gas for your home.',
            octo_smart_sub: 'Whether affordable green power for your home or reliable eco-gas for your heating – find the tariff that fits you perfectly',
            octo_heizen_h2: 'Green Electricity & Eco-Gas – Switch easily, save permanently',
            octo_heizen_sub: 'Transparent conditions, legally guaranteed supply security, and €0 switching costs.',
            octo_inno_h2: 'Clean Energy. Fair Prices. Genuine Service.',
            octo_inno_sub: 'Become part of the energy transition with Alpha Energie GmbH',
            octo_alpha_h2: 'Highlights & Insights from the Alphaverse',
            octo_alpha_sub: 'Dive into our world – from digital customer service and partner stories to career opportunities',
            octo_footer_q_h3: 'Do you have questions about your electricity or gas contract?',
            octo_footer_news_h3: 'Positive energy straight to your inbox',
            octo_footer_news_p: 'Secure exclusive tariff benefits, energy-saving tips, and news about 100% green electricity and climate-neutral eco-gas from Alpha Energie GmbH.'
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
            hero_desc: 'Sadece 3 dakikada %100 yenilenebilir enerjiden yeşil elektriğe, güvenilir § 14a ısı pompası elektriğine veya iklim katkılı doğal gaza geçin. 24 aya varan tam fiyat garantisi, yılda 380 €\'ya varan tasarruf ve Dortmund merkezindeki kişisel müşteri hizmetleriyle tüm Almanya genelinde.',
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
            tariff_basic_savings: 'Yılda 300 €\'ya varan tasarruf',
            tariff_basic_b1: '12 ay tam sabit fiyat garantisi',
            tariff_basic_b2: '%100 yenilenebilir enerjiden yeşil elektrik (hidroelektrik)',
            tariff_basic_b3: '1. yıldan sonra aylık fesih imkânı',
            tariff_basic_b4: 'Ücretsiz geçiş hizmeti & önceki sözleşme iptali',
            tariff_basic_btn: 'Tarifeyi Seç →',

            tariff_time_ribbon: 'Fiyat-Performans Lideri',
            tariff_time_badge: 'Çok Satan & Tasarruf Avantajı',
            tariff_time_savings: 'Yılda 380 €\'ya varan tasarruf',
            tariff_time_b1: 'Özellikle uygun birim fiyat (24,50 ct/kWh)',
            tariff_time_b2: 'Fiyat artışlarına karşı 12 ay tam fiyat garantisi',
            tariff_time_b3: '%100 sertifikalı yeşil elektrik (ok-power mührü)',
            tariff_time_b4: 'Eski sözleşme iptali dahil ücretsiz geçiş hizmeti',
            tariff_time_btn: 'Çok Satanı Seç →',

            tariff_premium_badge: '24 Ay Fiyat Koruması & VIP',
            tariff_premium_savings: 'Yılda 280 €\'ya varan tasarruf',
            tariff_premium_b1: '2028\'e kadar 24 ay tam fiyat istikrarı',
            tariff_premium_b2: '%100 yenilenebilir enerjiden yeşil elektrik (ok-power)',
            tariff_premium_b3: 'Dortmund merkezli öncelikli müşteri hizmetleri',
            tariff_premium_b4: 'Artan vergilere ve şebeke bedellerine karşı koruma',
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

            matrix_r3_feature: 'Tasarruf & Adil Tarifeler',
            matrix_r3_hint: 'Aylık avans & şeffaf fiyatlar',
            matrix_r3_alpha: '<strong>Yılda 380 €\'ya varan tasarruf</strong> adil ve şeffaf şartlar ile',
            matrix_r3_standard: 'Belirgin şekilde daha yüksek temel tarife, hiçbir tasarruf yok',

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
            max_savings_format: 'Yılda {val} €\'ya varan!',

            // Octopus-Style Sections (versorger.html)
            octo_promo_bar: 'Temel tedariğe kıyasla <strong>yılda 380 €\'ya varan tasarruf</strong> &amp; <strong>24 aya varan tam fiyat garantisi</strong>. <a href="#rechner" class="octo-promo-code">Şimdi tasarrufu hesapla &rarr;</a>',
            octo_hero_pre: 'Şimdi geçin:',
            octo_hero_trust_1: '<a href="#bewertungen">Müşteri değerlendirmelerinde</a> <strong>5 üzerinden 4.9 yıldız</strong> • %100 ok-power yeşil elektrik &amp; eko-gaz',
            octo_hero_trust_2: '<a href="#tarife">Alpha Geçiş Garantisi</a> – 24 aya varan tam fiyat koruması',
            octo_hero_trust_3: 'Dortmund\'dan kişisel telefon hizmeti: <strong>0231 39989390</strong>',
            octo_wolf_pill: '⚡ Senin Alpha-Kurdu',
            octo_stage_badge_top: 'Yılda 380 €\'ya varan tasarruf',
            octo_calc_kwh_label: 'Yıllık Tüketim',
            octo_award1_title: 'Alpha Geçiş Garantisi',
            octo_award1_sub: 'Kesintisiz elektrik (§ 20 EnWG) & 0 € geçiş ücreti',
            octo_award2_title: 'Almanya En İyi Hizmet',
            octo_award2_sub: 'Dortmund\'da yerinde kişisel müşteri merkezi',
            octo_award3_title: 'ok-power Sertifikalı',
            octo_award3_sub: 'Federal Çevre Ajansı HKNR sicilinde %100 gerçek yeşil elektrik',
            octo_award4_title: 'Fiyat-Performans Lideri',
            octo_award4_sub: 'Resmi BDEB üyesi & 24 aya varan fiyat koruması',
            octo_mascot_tarife_tag: 'Alpha-Kurdu İpucu',
            octo_mascot_tarife_text: 'Fiyat garantili tarifenizi hemen buradan güvence altına alın!',
            octo_bento1_h3: 'Size en uygun tarifeyi hemen keşfedin!',
            octo_bento1_p: 'Enerjiyi nasıl kullandığınızı söyleyin – eviniz için en uygun Alpha Energie tarifesini saniyeler içinde bulalım.',
            octo_bento1_btn: 'Tarife Bul',
            octo_bento2_h3: 'Gizli maliyet olmadan kalıcı tasarruf edin',
            octo_bento2_p: 'Kısa vadeli kampanyalar yerine kalıcı olarak uygun birim ve sabit fiyatlar sunuyoruz. Temel tedariğe kıyasla <strong>yılda 380 €\'ya varan tasarruf</strong> ve <strong>24 aya varan tam fiyat garantisi</strong> elde edin.',
            octo_bento2_btn: 'Şimdi Tasarrufu Hesapla',
            octo_mehr_h2: 'Paranızın karşılığında daha fazla enerji.',
            octo_mehr_sub: 'Kendiniz veya işletmeniz için uygun fiyatlı yeşil elektrik ve gaz tarifelerini güvenceye alın',
            octo_smart_h2: 'Eviniz için %100 yeşil elektrik ve iklim nötr eko-gaz.',
            octo_smart_sub: 'İster eviniz için uygun fiyatlı yeşil elektrik ister ısıtmanız için güvenilir eko-gaz – size en uygun tarifeyi bulun',
            octo_heizen_h2: 'Yeşil Elektrik & Eko-Gaz – Kolayca geçin, kalıcı tasarruf edin',
            octo_heizen_sub: 'Şeffaf koşullar, yasal garantili tedarik güvenliği ve 0 € geçiş maliyeti.',
            octo_inno_h2: 'Temiz Enerji. Adil Fiyatlar. Gerçek Hizmet.',
            octo_inno_sub: 'Alpha Energie GmbH ile enerji dönüşümünün bir parçası olun',
            octo_alpha_h2: 'Alphaversum\'dan Öne Çıkanlar & İçgörüler',
            octo_alpha_sub: 'Dijital müşteri hizmetlerinden iş ortağı hikayelerine ve kariyer fırsatlarına kadar dünyamızı keşfedin',
            octo_footer_q_h3: 'Elektrik veya gaz sözleşmeniz hakkında sorularınız mı var?',
            octo_footer_news_h3: 'Pozitif enerji doğrudan e-posta kutunuzda',
            octo_footer_news_p: 'Alpha Energie GmbH\'nin %100 yeşil elektrik ve iklim nötr eko-gaz tarifeleri, enerji tasarrufu ipuçları ve özel avantajlarından haberdar olun.'
        },

        ar: {
            page_title: 'Alpha Energie | كهرباء خضراء 100% وتعريفات غاز في جميع أنحاء ألمانيا',

            // Toast
            toast_text: '<strong>مرحباً بكم!</strong> كهرباء خضراء نظيفة 100% في جميع أنحاء ألمانيا. وفّر <strong>حتى 380 € سنوياً</strong> مع طاقة ok-power المعتمدة.',

            // Topbar
            topbar_hours: 'الإثنين – الجمعة 08:00 – 18:00 | خدمة في جميع أنحاء ألمانيا ومركز خدمة العملاء في دورتموند',

            // Navigation
            nav_tariffs: 'الكهرباء والتعريفات',
            nav_oekostrom: 'كهرباء خضراء 100%',
            nav_waermestrom: 'كهرباء المضخات الحرارية (§ 14a EnWG)',
            nav_oekogas: 'غاز طبيعي مع مساهمة مناخية',
            nav_gewerbe: 'كهرباء تجارية وللشركات',
            nav_solutions: 'حلول الطاقة',
            nav_photovoltaik: 'الطاقة الشمسية والتخزين',
            nav_sektorenkopplung: 'الربط القطاعي للطاقة',
            nav_co2_audits: 'تدقيق الطاقة ومسار CO2',
            nav_service: 'الخدمة والمساعدة',
            nav_calculator: 'حاسبة التعريفات عبر الإنترنت',
            nav_customer_service: 'خدمة العملاء والبوابة',
            nav_meter_report: 'إبلاغ قراءة العداد عبر الإنترنت',
            nav_relocation: 'خدمة الانتقال وتغيير السكن',
            nav_company: 'الشركة والشركاء',
            nav_about: 'عن Alpha Energie',
            nav_partner: 'كن شريكاً (المبيعات)',
            nav_careers: 'الوظائف',
            nav_contact: 'اتصل بنا',
            nav_btn_calc: 'احسب التعريفة',
            nav_btn_partner: 'كن شريكاً',

            // Hero
            hero_tag: 'مزود الكهرباء الخضراء والطاقة في جميع أنحاء ألمانيا',
            hero_title: 'بسيط. شفاف.<br><span class="text-orange-gradient">مضمون بأفضل الأسعار.</span>',
            hero_desc: 'انتقل في 3 دقائق فقط إلى كهرباء خضراء من مصادر متجددة بنسبة 100%، أو كهرباء مضخات حرارية موثوقة وفق § 14a، أو غاز طبيعي مع مساهمة طوعية في حماية المناخ. متاح في جميع أنحاء ألمانيا مع ضمان سعر كامل يصل إلى 24 شهراً، ومكافأة للعملاء الجدد، وخدمة عملاء شخصية في المقر الرئيسي في دورتموند.',
            hero_badge_price: 'حماية السعر لمدة 24 شهراً',
            hero_badge_eco: 'طاقة متجددة 100% (ok-power)',
            hero_badge_switch: 'خدمة انتقال مجانية',

            // Hero Floating Badges
            hero_float_badge1_title: 'كهرباء 100% من مصادر متجددة',
            hero_float_badge1_sub: 'معتمدة وفق معايير ok-power',
            hero_float_badge2_title: 'توفير يصل إلى 380 € / سنة',
            hero_float_badge2_sub: 'مقارنة بالتعريفة الأساسية',
            hero_float_badge3_title: 'خدمة عملاء محلية في دورتموند',
            hero_float_badge3_sub: 'Alter Hellweg 50 • 0231 39989390',

            // Rechner
            calc_title: 'حاسبة التعريفات المباشرة',
            calc_subtitle: 'قارن تعريفاتنا لرمزك البريدي في الوقت الفعلي:',
            calc_tab_strom_title: 'كهرباء خضراء',
            calc_tab_strom_sub: '100% متجددة',
            calc_tab_waerme_title: 'كهرباء تدفئة',
            calc_tab_waerme_sub: '§ 14a EnWG',
            calc_tab_gas_title: 'غاز طبيعي',
            calc_tab_gas_sub: 'مساهمة مناخية',

            // Rechner Dynamic Notices
            notice_strom: 'كهرباء خضراء من مصادر متجددة 100% • معتمدة وفق معايير ok-power',
            notice_waerme: 'كهرباء المضخات الحرارية (§ 14a EnWG) • خصم يصل إلى 25% على رسوم الشبكة للمضخات الحرارية',
            notice_gas: 'غاز طبيعي مع مساهمة طوعية في حماية المناخ • تعويض معتمد لانبعاثات CO2',

            // Rechner Form
            calc_plz_label: 'الرمز البريدي الخاص بك',
            calc_household_label: 'حجم الأسرة / الاستهلاك القياسي',
            calc_1pers: 'شخص واحد',
            calc_2pers: 'شخصان',
            calc_3pers: '3 أشخاص',
            calc_4pers: '4+ أشخاص',
            calc_kwh_unit: 'ك.و.س / سنة',
            calc_abschlag_label: 'الدفعة الشهرية الحالية (€ / شهر)',
            calc_savings_label: 'إمكانية التوفير المحسوبة لك:',
            calc_savings_text: 'حتى 320 € / سنة!',
            calc_submit_btn: 'احسب وقارن التعريفات ↓',
            calc_guarantee_note: 'انتقال مجاني، غير ملزم ومعتمد',

            // Bento Metric Cards
            bento_pill_eco: 'ok-power',
            bento_card1_label: 'كهرباء خضراء من طاقة متجددة 100%',
            bento_card1_desc: 'طاقة مائية ورياح معتمدة ومفحوصة وفق معايير ok-power الصارمة، خالية تماماً من الطاقة النووية والفحم.',
            bento_pill_savings: 'التوفير',
            bento_card2_number: 'حتى 380 €',
            bento_card2_label: 'توفير سنوي',
            bento_card2_desc: 'متوسط ميزة التوفير السنوي مقارنة بتعريفات المزود الأساسي المحلي.',
            bento_pill_guarantee: 'الضمان',
            bento_card3_number: '24 شهراً',
            bento_card3_label: 'ضمان سعر ثابت',
            bento_card3_desc: 'أمان كامل في التكاليف وحماية طويلة الأمد ضد ارتفاع الضرائب والرسوم وتكاليف الشبكة.',
            bento_pill_service: 'مجاناً',
            bento_card4_label: 'خدمة انتقال رقمية سلسة',
            bento_card4_desc: 'نقوم بإلغاء عقدك القديم لدى مزودك السابق تلقائياً – انتقال مضمون وسلس دون أي انقطاع في التيار.',

            // Tariff Cards
            tariffs_tag: 'نظرة عامة على تعريفاتنا',
            tariffs_title: 'تعريفات كهرباء شفافة للمنزل والشركات',
            tariffs_subtitle: 'كهرباء خضراء من مصادر متجددة 100%، ضمان سعر كامل وخدمة انتقال مجانية بدون تعقيدات إدارية.',

            tariff_basic_badge: 'مرن واقتصادي',
            tariff_basic_savings: 'وفّر حتى 300 € / سنة',
            tariff_basic_b1: 'ضمان سعر كامل لمدة 12 شهراً',
            tariff_basic_b2: 'كهرباء خضراء من مصادر متجددة 100% (طاقة مائية)',
            tariff_basic_b3: 'قابل للإلغاء شهرياً بعد السنة الأولى',
            tariff_basic_b4: 'خدمة انتقال مجانية وإلغاء العقد السابق',
            tariff_basic_btn: 'اختر التعريفة ←',

            tariff_time_ribbon: 'الأكثر مبيعاً وطاقة ذكية',
            tariff_time_badge: 'طاقة ذكية و § 14a',
            tariff_time_savings: 'وفّر حتى 380 € / سنة',
            tariff_time_b1: 'تعريفة ذكية ديناميكية متغيرة حسب الوقت',
            tariff_time_b2: 'محسّنة للمضخات الحرارية، شواحن السيارات والتخزين',
            tariff_time_b3: 'خصم يصل إلى 25% على رسوم الشبكة (§ 14a EnWG)',
            tariff_time_b4: 'متابعة شفافة عبر التطبيق وتحكم مباشر',
            tariff_time_btn: 'اختر الأكثر مبيعاً ←',

            tariff_premium_badge: 'حماية سعر 24 شهراً وخدمة VIP',
            tariff_premium_savings: 'وفّر حتى 280 € / سنة',
            tariff_premium_b1: 'استقرار كامل في السعر لمدة 24 شهراً حتى 2028',
            tariff_premium_b2: 'كهرباء خضراء من مصادر متجددة 100% (ok-power)',
            tariff_premium_b3: 'خدمة عملاء ذات أولوية من دورتموند',
            tariff_premium_b4: 'حماية ضد ارتفاع الضرائب ورسوم الشبكة',
            tariff_premium_btn: 'اختر التعريفة ←',

            // Advantages Section (Warum wir)
            vorteile_tag: 'مزاياك التي لا تقبل المنافسة',
            vorteile_title: 'لماذا نحن الأفضل: 5 مزايا حاسمة مقارنة بالتعريفة الأساسية',
            vorteile_subtitle: 'وفّر أموالاً حقيقية مع أمان إمداد 100% في جميع أنحاء ألمانيا، وضمان سعر شفاف، وخدمة شخصية في دورتموند.',

            vorteil1_title: 'سعر الاستهلاك والسعر الأساسي: عادل واقتصادي دائماً',
            vorteil1_desc: 'وفّر حتى <strong>380 € سنوياً</strong> مقارنة بالتعريفة الأساسية التي غالباً ما تكون أغلى بنسبة 30–45%. لا توجد تكاليف خفية، بل شروط شفافة وعادلة منذ اليوم الأول.',
            vorteil2_title: 'ضمان السعر: قابلية تخطيط كاملة تصل إلى 24 شهراً',
            vorteil2_desc: 'بينما يمكن للمزود الأساسي رفع الأسعار بإشعار مدته 6 أسابيع فقط، تحميك ضمانات الأسعار الثابتة لدينا لمدة <strong>12 إلى 24 شهراً</strong> بشكل موثوق من تقلبات السوق.',
            vorteil3_title: 'مصدر الطاقة: كهرباء خضراء من مصادر متجددة 100%',
            vorteil3_desc: 'معتمدة بصرامة وفق <strong>معايير ok-power</strong> ومسجلة في سجل ضمانات المنشأ بالهيئة الفيدرالية للبيئة (HKNR) – بدلاً من مزيج الكهرباء الرمادي غير الشفاف.',
            vorteil4_title: 'إمداد في جميع أنحاء ألمانيا وخدمة عملاء محلية',
            vorteil4_desc: 'إمداد بالطاقة في كافة أنحاء ألمانيا مع خدمة عملاء شخصية: بدون تحويلات مراكز الاتصال أو فترات انتظار طويلة. مستشارون محليون في مركز عملاء دورتموند (Alter Hellweg 50) بخدمتكم هاتفياً وشخصياً.',
            vorteil5_title: 'خدمة انتقال رقمية 100%: تلقائية وسلسة',
            vorteil5_desc: 'نقوم بإلغاء عقدك لدى مزودك السابق بالكامل بدون أوراق وفي الوقت المحدد. استمرار إمداد الكهرباء دون انقطاع مضمون قانونياً وفق § 20 EnWG – يتم الانتقال في 3 دقائق فقط.',

            // ok-power Explainer
            ok_power_sub: 'ختم الجودة',
            ok_power_title: 'ختم الجودة الأصلي ok-power: الركائز الأربع لتحول مضمون في الطاقة',
            ok_power_desc: 'يدعم ختم الجودة المستقل الرائد ok-power جمعية <strong>EnergieVision e.V.</strong>، التي تأسست بشكل مشترك من قبل <strong>مركز حماية المستهلك NRW</strong> ومعهد <strong>Öko-Institut e.V.</strong> المرموق. وهو يضمن أن تعريفتك تقدم قيمة مضافة حقيقية ومثبتة لتوسيع الطاقة المتجددة.',
            ok_power_p1: '<strong>تسجيل منشأ 100% لدى الهيئة الفيدرالية للبيئة:</strong> إلغاء جميع الشهادات في السجل الألماني الرسمي لضمانات المنشأ.',
            ok_power_p2: '<strong>دعم ثابت للمحطات الجديدة:</strong> مبالغ محددة بالسنت لكل كيلوواط ساعة تتدفق مباشرة لبناء محطات توليد حديثة.',
            ok_power_p3: '<strong>عدم الارتباط بشركات الفحم أو الطاقة النووية:</strong> استبعاد صارم للمزودين الذين يمتلكون حصصاً في محطات الفحم أو الطاقة النووية.',
            ok_power_p4: '<strong>تدقيق سنوي مستقل:</strong> فحص منتظم لجميع كميات الكهرباء من قبل مدققين مستقلين معتمدين.',

            // Comparison Matrix
            matrix_tag: 'مقارنة شفافة للتعريفات',
            matrix_title: 'Alpha Energie مقابل المزود الأساسي المحلي',
            matrix_subtitle: 'شاهد بنظرة سريعة كيف يعود الانتقال من التعريفة الأساسية إلى Alpha Energie بالنفع المباشر عليك.',
            matrix_th_feature: 'ميزة الأداء والمعيار',
            matrix_th_alpha_badge: 'موصى به',
            matrix_th_alpha_title: 'Alpha Energie GmbH',
            matrix_th_alpha_sub: 'تعريفات معتمدة',
            matrix_th_standard_title: 'المزود الأساسي المحلي',
            matrix_th_standard_sub: 'التعريفة القياسية',

            matrix_r1_feature: 'مصدر الكهرباء والاعتماد',
            matrix_r1_hint: 'شهادات المنشأ والمعايير',
            matrix_r1_alpha: '<strong>طاقة متجددة 100%</strong> (معايير ok-power، سجل HKNR UBA)',
            matrix_r1_standard: 'مزيج كهرباء رمادي تقليدي (يشمل الفحم والطاقة النووية)',

            matrix_r2_feature: 'استقرار السعر وحمايته',
            matrix_r2_hint: 'أمان التخطيط التعاقدي',
            matrix_r2_alpha: '<strong>حماية سعر تصل إلى 24 شهراً</strong> على تكاليف الطاقة والشبكة',
            matrix_r2_standard: 'أسعار متغيرة، زيادات متكررة في الأسعار بعد بضعة أشهر',

            matrix_r3_feature: 'التوفير والتعريفات العادلة',
            matrix_r3_hint: 'الدفعة الشهرية والشروط',
            matrix_r3_alpha: '<strong>توفير يصل إلى 380 € / سنة</strong> من خلال شروط عادلة وشفافة',
            matrix_r3_standard: 'تعريفة أساسية مرتفعة بشكل ملحوظ، بدون أي توفير',

            matrix_r4_feature: 'رسوم الشبكة § 14a EnWG',
            matrix_r4_hint: 'خصم المضخة الحرارية وشاحن السيارة',
            matrix_r4_alpha: '<strong>خصم يصل إلى 25% على رسوم الشبكة</strong> محسّن عبر ALPHA TIME',
            matrix_r4_standard: 'تعريفة قياسية بدون تخفيض تلقائي لرسوم الشبكة § 14a',

            matrix_r5_feature: 'خدمة العملاء والاستشارة',
            matrix_r5_hint: 'التواجد المحلي',
            matrix_r5_alpha: '<strong>شخصياً في دورتموند</strong> (0231 39989390، واتساب و Alter Hellweg 50)',
            matrix_r5_standard: 'فترات انتظار طويلة في مراكز اتصال خارجية',

            matrix_r6_feature: 'خدمة الانتقال والإجراءات',
            matrix_r6_hint: 'إلغاء العقد لدى المزود السابق',
            matrix_r6_alpha: '<strong>مجانية 100% وبدون انقطاع</strong> (شاملة إلغاء العقد القديم)',
            matrix_r6_standard: 'لا يوجد دعم عند الانتقال إلى تعريفات أرخص',

            matrix_cta_btn: 'احسب التوفير وانتقل الآن ←',

            // Sektorenkopplung
            sektor_tag: 'ميزة Alpha Energie الفريدة',
            sektor_title: 'الربط القطاعي: الطاقة الشمسية + المضخة الحرارية + شاحن السيارة',
            sektor_subtitle: 'اربط الكهرباء والتدفئة والتنقل الكهربائي في نظام ذكي متكامل، وخفّض تكاليف الطاقة بنسبة تصل إلى 80%.',
            sektor1_title: 'الطاقة الشمسية والتخزين',
            sektor1_desc: 'ولّد كهرباءك الخضراء من سطح منزلك وخزّنها مباشرة في بطاريات LFP الحديثة لتحقيق أقصى قدر من الاستقلالية.',
            sektor1_btn: 'اكتشف الطاقة الشمسية',
            sektor2_title: 'كهرباء المضخات الحرارية § 14a',
            sektor2_desc: 'تدفئة برسوم شبكة مخفضة حكومياً. يحول التحكم الذكي SG-Ready فائض الطاقة الشمسية إلى حرارة.',
            sektor2_btn: 'عرض كهرباء التدفئة',
            sektor3_title: 'شاحن الحائط والتنقل الكهربائي',
            sektor3_desc: 'شحن ذكي بفائض الطاقة للسيارات الكهربائية. استفد من كهرباء الأوقات المنخفضة أو الطاقة الشمسية بنسبة 100%.',
            sektor3_btn: 'استكشف الربط القطاعي',

            // Solutions
            sol_b2b_tag: 'التجارة والصناعة',
            sol_b2b_title: 'للعملاء التجاريين والشركات (B2B)',
            sol_b2b_desc: 'احمِ شركتك من تقلبات الأسعار. من خلال تدقيق الطاقة وفق DIN EN 16247-1، والتزود الذاتي بالطاقة الشمسية، وتقليل ذروة الأحمال، نخفض تكاليف التشغيل بشكل مستدام ونضمن توافق ESG.',
            sol_b2b_btn: 'إلى حلول الشركات B2B',
            sol_vp_tag: 'المبيعات والوكالات',
            sol_vp_title: 'لشركاء المبيعات',
            sol_vp_desc: 'استخدم بوابة الشركاء الرقمية للكهرباء والغاز والاتصالات. استفد من أعلى العمولات، والدفعات الأسبوعية، والتتبع الفوري، والدعم الشخصي.',
            sol_vp_btn: 'كن شريك مبيعات',

            // Mission
            mission_ai_badge: 'مُولّد بالذكاء الاصطناعي',
            mission_tag: 'مهمتنا',
            mission_title: 'إمداد الطاقة برؤية جديدة',
            mission_desc: 'في شركة Alpha Energie GmbH في دورتموند، نجمع بين عقود من الخبرة في قطاع الطاقة والبنية التحتية الرقمية الحديثة. كمزود طاقة عادل، نركز على الشفافية، وجودة الكهرباء الخضراء المعتمدة، والدعم الشخصي المباشر.',
            mission_btn: 'تعرّف على المزيد عنا',

            // Timeline
            timeline_tag: 'تاريخنا',
            timeline_title: 'رحلتنا في لمحة سريعة',
            timeline_subtitle: 'من رائد للطاقة في دورتموند إلى شريك رائد لحلول الطاقة المتجددة بنسبة 100%.',
            milestone_2021_title: '2021 – التأسيس في دورتموند',
            milestone_2021_desc: 'تأسيس شركة Alpha Energie GmbH في دورتموند (Alter Hellweg 50) بخبرة إدارية تزيد عن 15 عاماً في سوق الطاقة الألماني للجمع بين الكهرباء الخضراء الحقيقية وخدمة العملاء الشفافة.',
            milestone_2023_title: '2023 – التوسع وتقنية البوابات الرقمية',
            milestone_2023_desc: 'بناء شبكة على مستوى ألمانيا وإطلاق بوابات رقمية بالكامل للعملاء والشركاء لتغيير المزود بسرعة وبدون أوراق.',
            milestone_2024_title: '2024 – الربط القطاعي و § 14a EnWG',
            milestone_2024_desc: 'التوسع في أجهزة الاستهلاك القابلة للتحكم: كهرباء المضخات الحرارية وفق § 14a EnWG بخصم يصل إلى 25% على رسوم الشبكة، وأنظمة تخزين الطاقة الشمسية، وحلول الشحن الذكية.',
            milestone_2026_title: '2026 – مبادرة الطاقة الخضراء الجديدة',
            milestone_2026_desc: 'الاعتماد وفق معايير ok-power الصارمة، وتسجيل ضمانات المنشأ بنسبة 100% لدى الهيئة الفيدرالية للبيئة (HKNR)، وإطلاق تعريفات ALPHA BASIC و ALPHA TIME و ALPHA PREMIUM.',

            // FAQ
            faq_tag: 'أسئلة وأجوبة',
            faq_title: 'الأسئلة الشائعة',
            faq_subtitle: 'كل ما تحتاج معرفته حول الانتقال، وضمان السعر، والفوترة.',
            faq_q1: 'كيف يتم الانتقال في الكهرباء إلى Alpha Energie؟',
            faq_a1: 'في 3 خطوات بسيطة: 1. اختر التعريفة في الحاسبة. 2. أدخل رقم العداد والعنوان. 3. استرخِ – نحن نلغي عقدك القديم ونضمن استمرار الإمداد دون انقطاع.',
            faq_q2: 'هل إمداد الكهرباء مضمون أثناء عملية الانتقال؟',
            faq_a2: 'نعم، بنسبة 100%. بموجب القانون الألماني، لا ينقطع التيار الكهربائي أبداً. تتم عملية الانتقال إدارياً بالكامل في الخلفية.',
            faq_q3: 'ماذا يعني ضمان السعر لمدة 24 شهراً؟',
            faq_a3: 'مع ضمان السعر الكامل لدينا، تثبّت سعر الطاقة الخاص بك ضد أي تقلبات في السوق أو زيادات في الأسعار لمدة 24 شهراً كاملة.',

            // Order Modal
            modal_order_title: 'الطلب عبر الإنترنت وتغيير المزود',
            modal_step1_prog: '1. التعريفة والتاريخ',
            modal_step2_prog: '2. العداد والعنوان',
            modal_step3_prog: '3. البيانات الشخصية',
            modal_order_selected_label: 'التعريفة المختارة:',
            modal_order_monthly_label: 'الدفعة الشهرية:',
            modal_order_kwh_label: 'الاستهلاك السنوي:',
            modal_order_savings_prefix: 'وفّر حتى ',
            modal_order_savings_suffix: ' € / سنة',
            modal_order_start_label: 'تاريخ البدء المطلوب',
            modal_order_opt_soon: 'في أقرب وقت ممكن (أقرب موعد متاح)',
            modal_order_opt_expire: 'عند انتهاء العقد الحالي مع المزود السابق',
            modal_order_opt_date: 'في تاريخ محدد مطلوب (مثل الانتقال لسكن جديد)',
            modal_order_btn_to_step2: 'المتابعة إلى الخطوة 2: بيانات العداد ←',

            modal_order_street: 'الشارع *',
            modal_order_house_nr: 'رقم المبنى *',
            modal_order_plz: 'الرمز البريدي *',
            modal_order_city: 'المدينة *',
            modal_order_meter_number: 'رقم العداد * (على عداد الكهرباء أو الغاز)',
            modal_order_prev_provider: 'مزود الطاقة السابق (اختياري)',
            modal_order_cancel_checkbox: 'تفويض Alpha Energie بإلغاء عقدي لدى مزودي السابق مجاناً وفي الوقت المحدد.',
            modal_order_btn_back: '→ رجوع',
            modal_order_btn_to_step3: 'المتابعة إلى الخطوة 3 ←',

            modal_order_salutation: 'اللقب',
            modal_order_salutation_mr: 'السيد',
            modal_order_salutation_ms: 'السيدة',
            modal_order_salutation_company: 'شركة',
            modal_order_birthdate: 'تاريخ الميلاد (اختياري)',
            modal_order_first_name: 'الاسم الأول *',
            modal_order_last_name: 'اسم العائلة *',
            modal_order_email: 'البريد الإلكتروني *',
            modal_order_phone: 'رقم الهاتف *',
            modal_order_iban: 'رقم الآيبان (IBAN) للخصم المباشر SEPA *',
            modal_order_agb_checkbox: 'أوافق على <a href="datenschutz.html" target="_blank" style="text-decoration: underline; color: #ff7a00;">سياسة الخصوصية</a> وإرسال الطلب بشكل ملزم.',
            modal_order_btn_submit: 'إتمام الطلب الملزم الآن',

            modal_order_success_title: 'شكراً لطلبك!',
            modal_order_success_desc: 'تم تسجيل طلب الانتقال الخاص بك بنجاح. لقد أرسلنا تأكيداً إلى بريدك الإلكتروني.',
            modal_order_number_label: 'رقم الطلب: ',
            modal_order_btn_close: 'إغلاق النافذة',

            // Meter Modal
            modal_meter_title: 'إبلاغ قراءة العداد عبر الإنترنت',
            modal_meter_number: 'رقم العداد *',
            modal_meter_reading: 'قراءة العداد الحالية (kWh) *',
            modal_meter_name: 'الاسم الكامل *',
            modal_meter_email: 'بريدك الإلكتروني *',
            modal_meter_btn_submit: 'إرسال قراءة العداد الآن',

            // Legal Cancellation Modal
            modal_cancel_title: 'إلغاء العقد (§ 312k BGB)',
            modal_cancel_title_revoke: 'التراجع عن الطلب (حق الإلغاء)',
            modal_cancel_contract_nr: 'رقم العقد أو رقم العميل *',
            modal_cancel_name: 'الاسم الكامل لصاحب العقد *',
            modal_cancel_email: 'بريدك الإلكتروني للتأكيد *',
            modal_cancel_reason: 'السبب (اختياري)',
            modal_cancel_btn_submit: 'إرسال الإقرار الملزم قانونياً',

            // Floating Action Bar (FAB)
            fab_whatsapp: 'استشارة عبر واتساب',
            fab_meter: 'إبلاغ قراءة العداد',
            fab_faq: 'الأسئلة والمساعدة',

            // Footer
            footer_desc: 'تقدم شركة Alpha Energie GmbH حلول طاقة شفافة في جميع أنحاء ألمانيا: كهرباء خضراء من مصادر متجددة 100%، وكهرباء مضخات حرارية وفق § 14a EnWG، وغاز طبيعي مع مساهمة طوعية في حماية المناخ.',
            footer_address: 'Alter Hellweg 50, 44379 Dortmund',
            footer_title_tariffs: 'التعريفات والكهرباء',
            footer_title_service: 'الخدمة والحلول',
            footer_title_legal: 'معلومات قانونية',

            footer_link_oekostrom: 'كهرباء خضراء 100%',
            footer_link_waermestrom: 'كهرباء المضخات الحرارية (§ 14a)',
            footer_link_oekogas: 'غاز طبيعي مع مساهمة مناخية',
            footer_link_gewerbestrom: 'كهرباء تجارية',
            footer_link_rechner: 'حاسبة التعريفات',
            footer_link_kundenservice: 'خدمة العملاء',
            footer_link_zaehler: 'إبلاغ قراءة العداد عبر الإنترنت',
            footer_link_sektorenkopplung: 'الربط القطاعي طاقة شمسية+تدفئة',
            footer_link_pv: 'الطاقة الشمسية',
            footer_link_partner: 'كن شريكاً',
            footer_link_datenschutz: 'سياسة الخصوصية',
            footer_link_impressum: 'بيانات النشر',
            footer_link_cookie_settings: 'إعدادات ملفات تعريف الارتباط',
            footer_link_cookie_policy: 'سياسة ملفات تعريف الارتباط',
            footer_link_vp_portal: 'دخول بوابة الشركاء',

            footer_legal_cancel_text: '<strong>خدمة الإلغاء والتراجع القانونية (§ 312k BGB):</strong> يمكنك إلغاء عقدك الحالي أو التراجع عن طلبك لدى Alpha Energie GmbH مباشرة عبر الإنترنت هنا دون الحاجة إلى تسجيل.',
            footer_btn_cancel: 'إلغاء العقد عبر الإنترنت',
            footer_btn_revoke: 'التراجع عن الطلب',
            footer_copyright: '© حقوق النشر 2026. جميع الحقوق محفوظة. Alpha Energie GmbH',
            footer_cookie_manage: 'إدارة إعدادات ملفات تعريف الارتباط',

            // Dynamic format helpers
            per_month: '/ شهر',
            kwh_year: 'ك.و.س/سنة',
            savings_format: 'وفّر حتى {val} € / سنة',
            guarantee_format: 'ضمان سعر ثابت وعادل لمدة {val} شهراً',
            max_savings_format: 'حتى {val} € / سنة!',

            // Octopus-Style Sections (versorger.html)
            octo_promo_bar: '<strong>توفير سنوي يصل إلى 380 €</strong> مقارنة بالتعريفة الأساسية و<strong>ضمان سعر كامل حتى 24 شهراً</strong>. <a href="#rechner" class="octo-promo-code">احسب التوفير الآن &larr;</a>',
            octo_hero_pre: 'انتقل الآن إلى',
            octo_hero_trust_1: '<strong>4.9 من 5 نجوم</strong> في <a href="#bewertungen">تقييمات العملاء</a> • كهرباء خضراء وغاز بيئي 100% بمعيار ok-power',
            octo_hero_trust_2: '<a href="#tarife">ضمان الانتقال من Alpha</a> – حماية كاملة للسعر تصل إلى 24 شهراً',
            octo_hero_trust_3: 'خدمة هاتفية شخصية من دورتموند: <strong>0231 39989390</strong>',
            octo_wolf_pill: '⚡ ذئب ألفا الخاص بك',
            octo_stage_badge_top: 'وفّر حتى 380 € / سنة',
            octo_calc_kwh_label: 'الاستهلاك السنوي',
            octo_award1_title: 'ضمان الانتقال من Alpha',
            octo_award1_sub: 'كهرباء دون انقطاع (§ 20 EnWG) و 0 € رسوم انتقال',
            octo_award2_title: 'أفضل خدمة في ألمانيا',
            octo_award2_sub: 'مركز خدمة عملاء شخصي في دورتموند',
            octo_award3_title: 'معتمد بختم ok-power',
            octo_award3_sub: 'كهرباء خضراء حقيقية 100% في سجل الهيئة الفيدرالية للبيئة HKNR',
            octo_award4_title: 'الفائز بأفضل قيمة مقابل السعر',
            octo_award4_sub: 'عضو رسمي في BDEB وحماية سعر حتى 24 شهراً',
            octo_mascot_tarife_tag: 'نصيحة ذئب ألفا',
            octo_mascot_tarife_text: 'احصل على تعريفتك المفضلة مع ضمان السعر مباشرة من هنا!',
            octo_bento1_h3: 'اكتشف التعريفة الأنسب لك!',
            octo_bento1_p: 'أخبرنا كيف تستهلك الطاقة – وسنجد لك تعريفة Alpha Energie المناسبة لمنزلك في ثوانٍ.',
            octo_bento1_btn: 'ابحث عن التعريفة',
            octo_bento2_h3: 'وفّر بشكل دائم – بدون أي تكاليف خفية',
            octo_bento2_p: 'نعتمد على أسعار استهلاك وأسعار أساسية منخفضة بشكل دائم بدلاً من العروض المؤقتة. احصل على <strong>توفير سنوي يصل إلى 380 €</strong> مقارنة بالتعريفة الأساسية و<strong>ضمان سعر كامل حتى 24 شهراً</strong>.',
            octo_bento2_btn: 'احسب التوفير الآن',
            octo_mehr_h2: 'طاقة أكبر مقابل أموالك.',
            octo_mehr_sub: 'احصل على تعريفات كهرباء خضراء وغاز بأسعار مناسبة لك أو لشركتك',
            octo_smart_h2: 'كهرباء خضراء 100% وغاز بيئي محايد مناخياً لمنزلك.',
            octo_smart_sub: 'سواء كنت تبحث عن كهرباء خضراء اقتصادية لمنزلك أو غاز بيئي موثوق للتدفئة – اعثر على التعريفة المثالية لك',
            octo_heizen_h2: 'كهرباء خضراء وغاز بيئي – انتقل بسهولة ووفّر دائماً',
            octo_heizen_sub: 'شروط شفافة، أمان إمداد مضمون قانونياً، و 0 € تكاليف انتقال.',
            octo_inno_h2: 'طاقة نظيفة. أسعار عادلة. خدمة حقيقية.',
            octo_inno_sub: 'كن جزءاً من تحول الطاقة مع شركة Alpha Energie GmbH',
            octo_alpha_h2: 'أبرز المزايا واللمحات من عالم ألفا',
            octo_alpha_sub: 'اكتشف عالمنا – من خدمة العملاء الرقمية وقصص الشركاء إلى فرص العمل',
            octo_footer_q_h3: 'هل لديك أسئلة حول عقد الكهرباء أو الغاز الخاص بك؟',
            octo_footer_news_h3: 'طاقة إيجابية مباشرة إلى بريدك الإلكتروني',
            octo_footer_news_p: 'احصل على مزايا التعريفات الحصرية ونصائح توفير الطاقة وأخبار الكهرباء الخضراء 100% والغاز البيئي من Alpha Energie GmbH.'
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
        { selector: '#main-nav .dropdown a[href="#rechner"], #main-nav .dropdown a[href="/#rechner"]', key: 'nav_calculator' },
        { selector: '#main-nav .dropdown a[href="service.html"]', key: 'nav_customer_service' },
        { selector: '#main-nav .dropdown a[href="service.html#zaehler"]', key: 'nav_meter_report' },
        { selector: '#main-nav .dropdown a[href="service.html#umzug"]', key: 'nav_relocation' },
        { selector: '#main-nav .nav-list > li:nth-child(4) > a', key: 'nav_company' },
        { selector: '#main-nav .dropdown a[href="ueber-uns.html"]', key: 'nav_about' },
        { selector: '#main-nav .dropdown a[href="partner-werden.html"]', key: 'nav_partner' },
        { selector: '#main-nav .dropdown a[href="karriere.html"]', key: 'nav_careers' },
        { selector: '#main-nav .dropdown a[href="kontakt.html"]', key: 'nav_contact' },
        { selector: '.header-actions a[href="#rechner"], .header-actions a[href="/#rechner"]', key: 'nav_btn_calc' },
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
        { selector: '#card-alpha-basic .tariff-feature-list .tariff-feature-item:nth-child(1) span', key: 'tariff_basic_b1' },
        { selector: '#card-alpha-basic .tariff-feature-list .tariff-feature-item:nth-child(2) span', key: 'tariff_basic_b2' },
        { selector: '#card-alpha-basic .tariff-feature-list .tariff-feature-item:nth-child(3) span', key: 'tariff_basic_b3' },
        { selector: '#card-alpha-basic .tariff-feature-list .tariff-feature-item:nth-child(4) span', key: 'tariff_basic_b4' },
        { selector: '#card-alpha-basic .tariff-action-btn', key: 'tariff_basic_btn', isHtml: true },

        // Tariff Card 2: ALPHA TIME
        { selector: '#card-alpha-time .tariff-ribbon span', key: 'tariff_time_ribbon', isHtml: true },
        { selector: '#card-alpha-time .tariff-badge', key: 'tariff_time_badge', isHtml: true },
        { selector: '#card-alpha-time .tariff-feature-list .tariff-feature-item:nth-child(1) span', key: 'tariff_time_b1' },
        { selector: '#card-alpha-time .tariff-feature-list .tariff-feature-item:nth-child(2) span', key: 'tariff_time_b2' },
        { selector: '#card-alpha-time .tariff-feature-list .tariff-feature-item:nth-child(3) span', key: 'tariff_time_b3' },
        { selector: '#card-alpha-time .tariff-feature-list .tariff-feature-item:nth-child(4) span', key: 'tariff_time_b4' },
        { selector: '#card-alpha-time .tariff-action-btn', key: 'tariff_time_btn', isHtml: true },

        // Tariff Card 3: ALPHA PREMIUM
        { selector: '#card-alpha-premium .tariff-badge', key: 'tariff_premium_badge', isHtml: true },
        { selector: '#card-alpha-premium .tariff-feature-list .tariff-feature-item:nth-child(1) span', key: 'tariff_premium_b1' },
        { selector: '#card-alpha-premium .tariff-feature-list .tariff-feature-item:nth-child(2) span', key: 'tariff_premium_b2' },
        { selector: '#card-alpha-premium .tariff-feature-list .tariff-feature-item:nth-child(3) span', key: 'tariff_premium_b3' },
        { selector: '#card-alpha-premium .tariff-feature-list .tariff-feature-item:nth-child(4) span', key: 'tariff_premium_b4' },
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

        // Octopus-Style Sections (versorger.html)
        { selector: '.octo-promo-inner > span:nth-child(2)', key: 'octo_promo_bar', isHtml: true },
        { selector: '.octo-hero-pre', key: 'octo_hero_pre' },
        { selector: '.octo-hero-trust-list .octo-hero-trust-item:nth-child(1) > span:last-child', key: 'octo_hero_trust_1', isHtml: true },
        { selector: '.octo-hero-trust-list .octo-hero-trust-item:nth-child(2) > span:last-child', key: 'octo_hero_trust_2', isHtml: true },
        { selector: '.octo-hero-trust-list .octo-hero-trust-item:nth-child(3) > span:last-child', key: 'octo_hero_trust_3', isHtml: true },
        { selector: '.octo-peeking-wolf-pill', key: 'octo_wolf_pill' },
        { selector: '.octo-stage-badge-top', key: 'octo_stage_badge_top' },
        { selector: 'label.octo-calc-col-label[for="calcKwh"]', key: 'octo_calc_kwh_label' },
        { selector: '.octo-savings-pill > span', key: 'calc_savings_label' },
        { selector: '.octo-awards-row .octo-award-badge-card:nth-child(1) .octo-award-title', key: 'octo_award1_title' },
        { selector: '.octo-awards-row .octo-award-badge-card:nth-child(1) .octo-award-sub', key: 'octo_award1_sub' },
        { selector: '.octo-awards-row .octo-award-badge-card:nth-child(2) .octo-award-title', key: 'octo_award2_title' },
        { selector: '.octo-awards-row .octo-award-badge-card:nth-child(2) .octo-award-sub', key: 'octo_award2_sub' },
        { selector: '.octo-awards-row .octo-award-badge-card:nth-child(3) .octo-award-title', key: 'octo_award3_title' },
        { selector: '.octo-awards-row .octo-award-badge-card:nth-child(3) .octo-award-sub', key: 'octo_award3_sub' },
        { selector: '.octo-awards-row .octo-award-badge-card:nth-child(4) .octo-award-title', key: 'octo_award4_title' },
        { selector: '.octo-awards-row .octo-award-badge-card:nth-child(4) .octo-award-sub', key: 'octo_award4_sub' },
        { selector: '#tarife .octo-mascot-speech-tag', key: 'octo_mascot_tarife_tag' },
        { selector: '#tarife .octo-mascot-speech-text', key: 'octo_mascot_tarife_text' },
        { selector: '.octo-bento-1-2 > .octo-card:nth-child(1) .octo-card-h3', key: 'octo_bento1_h3' },
        { selector: '.octo-bento-1-2 > .octo-card:nth-child(1) .octo-card-p', key: 'octo_bento1_p' },
        { selector: '.octo-bento-1-2 > .octo-card:nth-child(1) .octo-btn-cta', key: 'octo_bento1_btn' },
        { selector: '.octo-bento-1-2 > .octo-card:nth-child(2) .octo-card-h3', key: 'octo_bento2_h3' },
        { selector: '.octo-bento-1-2 > .octo-card:nth-child(2) .octo-card-p', key: 'octo_bento2_p', isHtml: true },
        { selector: '.octo-bento-1-2 > .octo-card:nth-child(2) .octo-btn-cta', key: 'octo_bento2_btn' },
        { selector: '#mehr-energie > .octo-container > .octo-section-h2', key: 'octo_mehr_h2' },
        { selector: '#mehr-energie > .octo-container > .octo-section-sub', key: 'octo_mehr_sub' },
        { selector: '#smarte-tarife .octo-section-h2', key: 'octo_smart_h2' },
        { selector: '#smarte-tarife .octo-section-sub', key: 'octo_smart_sub' },
        { selector: '#heizen-speichern .octo-section-h2', key: 'octo_heizen_h2' },
        { selector: '#heizen-speichern .octo-section-sub', key: 'octo_heizen_sub' },
        { selector: '#innovation .octo-section-h2', key: 'octo_inno_h2' },
        { selector: '#innovation .octo-section-sub', key: 'octo_inno_sub' },
        { selector: '#alphaversum .octo-section-h2', key: 'octo_alpha_h2' },
        { selector: '#alphaversum .octo-section-sub', key: 'octo_alpha_sub' },
        { selector: '#main-footer .octo-footer-card:nth-child(1) .octo-card-h3', key: 'octo_footer_q_h3' },
        { selector: '#main-footer .octo-footer-card:nth-child(2) .octo-card-h3', key: 'octo_footer_news_h3' },
        { selector: '#main-footer .octo-footer-card:nth-child(2) .octo-card-p', key: 'octo_footer_news_p' },

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
     * @param {string} lang - 'de', 'en', 'tr', or 'ar'
     */
    function setLanguage(lang) {
        if (!['de', 'en', 'tr', 'ar'].includes(lang)) {
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

        // 4. Apply translations to all mapped selectors
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
            if (!card2Number.dataset.i18nOriginal) {
                card2Number.dataset.i18nOriginal = card2Number.textContent.trim() || 'Bis zu 380 €';
            }
            if (lang === 'de') {
                card2Number.setAttribute('data-counter-prefix', 'Bis zu ');
                card2Number.setAttribute('data-counter-suffix', ' €');
                card2Number.textContent = card2Number.dataset.i18nOriginal || 'Bis zu 380 €';
            } else if (lang === 'en') {
                card2Number.setAttribute('data-counter-prefix', 'Up to €');
                card2Number.setAttribute('data-counter-suffix', '');
                card2Number.textContent = 'Up to €380';
            } else if (lang === 'tr') {
                card2Number.setAttribute('data-counter-prefix', '');
                card2Number.setAttribute('data-counter-suffix', " €'ya varan");
                card2Number.textContent = "380 €'ya varan";
            } else if (lang === 'ar') {
                card2Number.setAttribute('data-counter-prefix', 'حتى ');
                card2Number.setAttribute('data-counter-suffix', ' €');
                card2Number.textContent = 'حتى 380 €';
            }
        }

        const card3Number = document.querySelector('.section-trust-metrics .trust-stat-card:nth-child(3) .stat-number');
        if (card3Number) {
            if (!card3Number.dataset.i18nOriginal) {
                card3Number.dataset.i18nOriginal = card3Number.textContent.trim() || '24 Monate';
            }
            if (lang === 'de') {
                card3Number.setAttribute('data-counter-suffix', ' Monate');
                card3Number.textContent = card3Number.dataset.i18nOriginal || '24 Monate';
            } else if (lang === 'en') {
                card3Number.setAttribute('data-counter-suffix', ' Months');
                card3Number.textContent = '24 Months';
            } else if (lang === 'tr') {
                card3Number.setAttribute('data-counter-suffix', ' Ay');
                card3Number.textContent = '24 Ay';
            } else if (lang === 'ar') {
                card3Number.setAttribute('data-counter-suffix', ' شهراً');
                card3Number.textContent = '24 شهراً';
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
        if (l === 'ar') return `${amount} €<span> / شهر</span>`;
        return `€${amount}<span> / month</span>`;
    }

    /**
     * Format tariff savings
     */
    function formatSavings(amount, lang) {
        const l = lang || currentLang;
        if (l === 'de') return `Bis zu ${amount} € / Jahr sparen`;
        if (l === 'tr') return `Yılda ${amount} €'ya varan tasarruf`;
        if (l === 'ar') return `وفّر حتى ${amount} € / سنة`;
        return `Save up to €${amount} / year`;
    }

    /**
     * Format tariff guarantee
     */
    function formatGuarantee(months, lang) {
        const l = lang || currentLang;
        if (l === 'de') return `Faire ${months} Monate Preisgarantie`;
        if (l === 'tr') return `Adil ${months} ay sabit fiyat garantisi`;
        if (l === 'ar') return `ضمان سعر ثابت وعادل لمدة ${months} شهراً`;
        return `Fair ${months} months price guarantee`;
    }

    /**
     * Format maximum calculator savings
     */
    function formatMaxSavings(amount, lang) {
        const l = lang || currentLang;
        if (l === 'de') return `Bis zu ${amount} € / Jahr!`;
        if (l === 'tr') return `Yılda ${amount} €'ya varan!`;
        if (l === 'ar') return `حتى ${amount} € / سنة!`;
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
        const unit = l === 'en' ? 'kWh/year' : (l === 'tr' ? 'kWh/yıl' : (l === 'ar' ? 'ك.و.س/سنة' : 'kWh/Jahr'));
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
            if (queryLang && ['de', 'en', 'tr', 'ar'].includes(queryLang.toLowerCase())) {
                initialLang = queryLang.toLowerCase();
            } else {
                const storedLang = localStorage.getItem('alpha_lang');
                if (storedLang && ['de', 'en', 'tr', 'ar'].includes(storedLang.toLowerCase())) {
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

        // Pre-cache German original values immediately
        SELECTOR_MAPPINGS.forEach(mapping => {
            const el = document.querySelector(mapping.selector);
            if (el) cacheOriginal(el, mapping.hasSvgPrefix);
        });

        // If stored language is EN, TR, or AR, switch now!
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
