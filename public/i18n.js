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
            page_title: 'Alpha Energie | Ökostrom aus 100 % erneuerbaren Energien & Gastarife deutschlandweit',
            bento_card2_number: 'Bis zu 380 €',
            bento_card3_number: '24 Monate'
        },

        en: {
            page_title: 'Alpha Energie | Green Electricity from 100% Renewable Energy & Gas Tariffs Nationwide',

            // Toast
            toast_text: '<strong>Welcome!</strong> Green electricity from 100% renewable energy across Germany. Save <strong>up to €380/year</strong> with transparent energy tariffs.',

            // Topbar
            topbar_hours: 'Monday – Friday 8:00 AM – 6:00 PM | Nationwide Service & Customer Center Dortmund',

            // Navigation
            nav_tariffs: 'Green Electricity',
            nav_oekostrom: 'Electricity from 100% Renewables',
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
            hero_tag: 'Nationwide Energy Provider',
            hero_title: 'Simple. Transparent.<br><span class="text-orange-gradient">Guaranteed Affordable.</span>',
            hero_desc: 'Switch in just 3 minutes to green electricity from 100% renewable energy, reliable § 14a heat pump power, or natural gas with voluntary climate contribution. Available nationwide with up to 24 months full price guarantee, up to €380 annual savings, and personal customer service at the Dortmund headquarters.',
            hero_badge_price: '24-Month Price Protection',
            hero_badge_eco: 'Electricity from 100% Renewable Energy',
            hero_badge_switch: 'Free Switching Service',

            // Hero Floating Badges
            hero_float_badge1_title: 'Electricity from 100% Renewable Sources',
            hero_float_badge1_sub: 'Verified guarantees of origin (hydropower & wind)',
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
            notice_strom: 'Green electricity from 100% renewable energy • 24 months full price guarantee',
            notice_waerme: 'Heat pump power (§ 14a EnWG) • Up to 25% reduced grid fees for heat pumps',
            notice_gas: 'Natural gas with voluntary climate protection contribution • Support for selected climate projects',

            // Rechner Form
            calc_plz_label: 'Your Postal Code',
            calc_household_label: 'Household Size / Standard Consumption',
            calc_1pers: 'Low',
            calc_2pers: 'Medium',
            calc_3pers: 'High',
            calc_4pers: '4+ Persons',
            calc_kwh_unit: 'kWh / year',
            calc_abschlag_label: 'Current monthly payment (€ / month)',
            calc_savings_label: 'Your calculated savings potential:',
            calc_savings_text: 'Up to €320 / year!',
            calc_submit_btn: 'Find Tariff',
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
            modal_order_agb_checkbox: 'I accept the <a id="orderAgbInlineLink" href="/api/tarife/agb?branch=strom" target="_blank" rel="noopener" style="text-decoration: underline; color: #ff7a00; font-weight: 600;">Terms &amp; Conditions (AGB) incl. Right of Withdrawal (PDF)</a>, take note of the <a id="orderPrivacyPdfInlineLink" href="/api/tarife/datenschutz?branch=strom" target="_blank" rel="noopener" style="text-decoration: underline; color: #ff7a00; font-weight: 600;">Privacy Notice (PDF)</a> and <a href="datenschutz.html" target="_blank" style="text-decoration: underline; color: #ff7a00;">Privacy Policy</a>, grant the SEPA Direct Debit Mandate, and confirm the binding submission of the order.',
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
            octo_footer_news_p: 'Secure exclusive tariff benefits, energy-saving tips, and news about 100% green electricity and climate-neutral eco-gas from Alpha Energie GmbH.',
            nav_top_strom: "Green Electricity",
            nav_top_gas: "Natural Gas",
            nav_top_gewerbe: "Business",
            nav_top_about: "About Us",
            nav_top_contact: "Contact",
            nav_dd_basic: "ALPHA BASIC 24 (Price Guarantee)",
            nav_dd_time: "ALPHA TIME 24 (Bestseller)",
            nav_dd_premium: "ALPHA PREMIUM 24 (Top Price Protection)",
            nav_dd_oekostrom_ok: "100% Green Electricity (ok-power)",
            nav_dd_strommix: "Electricity Labeling (§ 42 EnWG)",
            nav_dd_gas_klima: "Natural Gas with Climate Contribution",
            nav_dd_gas_overview: "Natural Gas Tariff Overview",
            nav_dd_live_calc: "Live Tariff Calculator",
            nav_dd_gewerbe_rlm: "Commercial Power & RLM",
            nav_dd_co2: "Energy Audits & CO₂",
            nav_dd_pv: "Photovoltaics",
            nav_dd_sektor: "Sector Coupling",
            nav_dd_who: "Who We Are",
            nav_dd_vp: "Become a Sales Partner",
            nav_dd_jobs: "Careers & Jobs",
            nav_dd_help: "Customer Service & Help",
            nav_dd_meter: "Report Meter Reading Online",
            nav_dd_dortmund: "Customer Center Dortmund",
            nav_btn_login: "Log in",
            octo_hero_h1: "Green Electricity &amp; Natural Gas.<br>Simple. Transparent.<br><span class=\"highlight\">Guaranteed Affordable.</span>",
            octo_stage_pill_1: "Green Electricity & Gas",
            octo_stage_pill_2: "Nationwide Support",
            octo_stage_pill_3: "24M Guarantee",
            calc_tab_strom_sub: "100% Renewable (ok-power)",
            calc_tab_gas_sub: "With Climate Contribution",
            octo_unit_kwh: "kWh/year",
            octo_unit_eur: "€/month",
            calc_gas_1: "Apartment",
            calc_gas_2: "Townhouse",
            calc_gas_3: "Detached House",
            calc_gas_4: "Large House",
            ph_calc_plz: "Your ZIP",
            ph_calc_abschlag: "Your current payment",
            ph_calc_kwh_strom: "e.g. 2,500",
            ph_calc_kwh_gas: "e.g. 12,000",
            octo_tarife_h2: "Our Live Tariffs at a Glance",
            octo_tarife_sub: "Transparently calculated for your postal code – including full price guarantee and free switching service",
            octo_bento2_vis_1: "Save up to €380 / year",
            octo_bento2_vis_2: "Up to 24M Price Guarantee",
            octo_bento2_vis_3: "Fair Tariffs & Real Savings",
            octo_mehr_c1_h3: "Green Electricity & Gas Tariffs",
            octo_mehr_c1_p: "With our sustainable green electricity and natural gas tariffs, you save real money compared to basic supply while reducing your carbon footprint.",
            octo_mehr_c1_btn: "Find Tariff",
            octo_mehr_c2_vis_sub: "Full Price Protection until 2028",
            octo_mehr_c2_h3: "24-Month Price Protection Tariff",
            octo_mehr_c2_p: "Secure two full years of planning certainty without hidden price increases on energy and base prices.",
            octo_mehr_c2_btn: "View 24-Month Tariff",
            octo_biz_h3: "ALPHA BUSINESS ELECTRICITY TARIFF",
            octo_biz_li1: "100% green electricity with price guarantee for commerce, gastronomy, office & retail",
            octo_biz_li2: "Individual RLM load profile & SLP special conditions from 10,000 kWh",
            octo_biz_li3: "Personal B2B account manager in our Dortmund customer center",
            octo_biz_btn: "View Business Tariff",
            octo_rev_score_title: "Customer Score 4.9",
            octo_rev_score_badge: "Excellent",
            octo_rev_score_p: "Based on verified customer reviews for tariff switching, price transparency & customer service in Dortmund.",
            octo_rev_verified: "✓ Verified",
            octo_rev1_title: "Switch went completely smoothly",
            octo_rev1_quote: "“Switched online in 3 minutes, the old provider was automatically canceled and we save over €340 a year with 100% green electricity.”",
            octo_rev1_author: "Markus K. • Dortmund",
            octo_rev2_title: "Finally real telephone customer service!",
            octo_rev2_quote: "“No hold queues and no chatbot frustration. You immediately reach real staff in Dortmund who took care of my request right away.”",
            octo_rev2_author: "Sabine M. • Bochum",
            octo_rev3_title: "Top gas price & 24 months peace of mind",
            octo_rev3_quote: "“After our local utility raised prices, we switched both electricity and gas to Alpha Energie. Clear terms and fair monthly installments.”",
            octo_rev3_author: "Yilmaz Family • Essen",
            octo_smart_mascot_tag: "ok-power Certified",
            octo_smart_mascot_text: "100% genuine green energy for your home – with no hidden costs!",
            octo_smart_c1_h3: "Green Electricity from 100% Renewable Energy (ok-power)",
            octo_smart_c1_p: "With our household electricity tariffs, you receive certified green electricity from 100% renewable sources while our price guarantee reliably protects you against rising power prices.",
            octo_smart_c1_li1: "100% renewable energy with the official ok-power quality seal",
            octo_smart_c1_li2: "Up to 24 months full price guarantee with no hidden costs",
            octo_smart_c1_li3: "Seamless switching service incl. cancellation with your previous provider",
            octo_smart_c1_btn: "View Green Electricity Tariffs",
            octo_smart_c2_h3: "Natural Gas with Voluntary Climate Contribution",
            octo_smart_c2_p: "Heat and cook reliably at permanently affordable rates: our natural gas tariffs support certified climate protection projects (Gold Standard / VCS) and offer up to 24 months full price guarantee.",
            octo_smart_c2_btn: "View Natural Gas Tariffs",
            octo_smart_g1_h3: "Green Electricity (ok-power)",
            octo_smart_g1_p: "Electricity from 100% renewable energy (hydropower & wind) with official ok-power certification and zero coal or nuclear power.",
            octo_smart_g1_btn: "Discover Green Power",
            octo_smart_g2_h3: "Natural Gas with Climate Contribution",
            octo_smart_g2_p: "Natural gas tariffs with voluntary climate protection contribution to support certified climate projects and fair monthly installments.",
            octo_smart_g2_btn: "Discover Natural Gas",
            octo_smart_g3_h3: "12 & 24 Months Guarantee",
            octo_smart_g3_p: "Choose flexibly between 12 or 24 months price guarantee – full cost control without unexpected price hikes.",
            octo_smart_g3_btn: "Select Price Protection",
            octo_smart_g4_h3: "Commercial Power & Gas",
            octo_smart_g4_p: "Tailored SLP and RLM energy tariffs for businesses, retail, gastronomy, and property management.",
            octo_smart_g4_btn: "For Business Customers",
            octo_heizen_c1_h3: "Natural Gas with Voluntary Climate Contribution & Price Guarantee",
            octo_heizen_c1_p: "With Alpha Energie natural gas, you heat your home affordably and predictably. Through our voluntary climate contribution, we fund certified climate protection projects worldwide.",
            octo_heizen_c1_li1: "Voluntary climate contribution via verified Gold Standard & VCS projects",
            octo_heizen_c1_li2: "Up to 24 months full price guarantee on energy & base price",
            octo_heizen_c1_li3: "Automatic provider switch without any interruption to your gas supply",
            octo_heizen_c1_btn: "Secure Natural Gas Tariff Now",
            octo_heizen_c2_h3: "Green Electricity from 100% Renewable Energy with ok-power Seal",
            octo_heizen_c2_p: "Whether single household, family home, or business: our certified green electricity lowers your power bill immediately – with 100% supply security and personal service from Dortmund.",
            octo_heizen_c2_btn1: "For Private Customers",
            octo_heizen_c2_btn2: "For Business Customers",
            octo_inno_c1_h3: "ok-power Green Electricity",
            octo_inno_c1_p: "Certified green electricity from 100% renewable energy, cancelled directly in the register of guarantees of origin of the Federal Environment Agency.",
            octo_inno_c1_btn: "More on Green Power",
            octo_inno_c2_h3: "Natural Gas with Voluntary Climate Contribution",
            octo_inno_c2_p: "Natural gas supply with voluntary climate contribution to promote international Gold Standard climate protection projects.",
            octo_inno_c2_btn: "More on Natural Gas",
            octo_inno_c3_h3: "Business & Key Accounts",
            octo_inno_c3_p: "Individual SLP & RLM electricity and gas tariffs for businesses, chains, and property managers.",
            octo_inno_c3_btn: "To B2B Consulting",
            octo_sk_badge: "Mandatory Legal Disclosure under § 42 EnWG",
            octo_sk_h2: "Electricity Labeling & Power Mix Comparison",
            octo_sk_sub: "In accordance with § 42 of the German Energy Industry Act (EnWG), we transparently inform you about the composition of our electricity mix and its environmental impact compared to the German average (as of 03/2026).",
            octo_sk_left_h3: "Official Chart: Power Mix & Countries of Origin",
            octo_sk_left_btn: "Open chart in full size ↗",
            octo_sk_left_note: "Electricity labeling pursuant to § 42 of the German Energy Industry Act (EnWG). Source: own representation based on AG Energiebilanzen and Fraunhofer ISE (as of 03/2026).",
            octo_sk_right1_h3: "Energy Sources & Environmental Impact in Detail",
            octo_sk_th1: "Energy Source / Environmental Indicator",
            octo_sk_th2: "Alpha Energie",
            octo_sk_th3: "Germany Average",
            octo_sk_r1_c1: "Renewable energy with guarantees of origin (cancelled directly from the Federal Environment Agency register)",
            octo_sk_r2_c1: "Renewable energy, subsidized under the EEG",
            octo_sk_r3_c1: "Coal",
            octo_sk_r4_c1: "Natural Gas",
            octo_sk_r5_c1: "Mineral Oil & Other Fossil Fuels",
            octo_sk_r6_c1: "CO₂ Emissions / Radioactive Waste",
            octo_sk_right1_note: "Guarantees of origin by supplier country: 94.5% Norway (hydropower), 5.5% Sweden (wind power). Directly cancelled from the register of guarantees of origin of the Federal Environment Agency (UBA).",
            octo_sk_right2_h3: "Information on the Voluntary Climate Contribution (Natural Gas)",
            octo_sk_right2_p: "When burning natural gas, physical CO₂ emissions occur (approx. 201 g CO₂/kWh). Alpha Energie natural gas tariffs include a voluntary climate protection contribution supporting certified climate projects (Gold Standard / Verified Carbon Standard) for global greenhouse gas reduction.",
            octo_sk_right2_btn1: "Green Power Details",
            octo_sk_right2_btn2: "Climate Project Details",
            octo_about_h2: "About Us",
            octo_about_sub: "Energy supply rethought – honest, digital, and with personal service from Dortmund",
            octo_video_sound_on: "Turn sound on",
            octo_video_sound_off: "Turn sound off",
            octo_vstep1_title: "Calculate Tariff",
            octo_vstep1_sub: "Enter postal code & consumption",
            octo_vstep2_title: "Order Switch",
            octo_vstep2_sub: "Alpha Wolf handles the cancellation",
            octo_vstep3_title: "Save Permanently",
            octo_vstep3_sub: "100% green power & price guarantee",
            octo_video_hq_title: "Alpha Energie GmbH • Headquarters Dortmund",
            octo_video_hq_sub: "Alter Hellweg 50, 44379 Dortmund • Over 15 years of energy experience",
            octo_video_hq_link: "More about us →",
            octo_about_i1_h3: "Who We Are",
            octo_about_i1_p: "Alpha Energie GmbH, headquartered at Alter Hellweg 50 in Dortmund, supplies households and businesses across Germany with 100% green electricity and natural gas with a voluntary climate contribution.",
            octo_about_i2_h3: "Our Prices Are & Stay Fair",
            octo_about_i2_p: "Instead of non-transparent package tariffs, we rely on lean digital processes, clear working and base prices, and up to 24 months full price guarantee.",
            octo_about_i3_h3: "Customer Love & On-Site Service",
            octo_about_i3_p: "With us, you don’t talk to anonymous call center queues – our customer service team in Dortmund is personally available for you by phone, WhatsApp, and on site.",
            octo_about_more_link: "Learn more →",
            octo_alpha_c1_h3: "Service & Guide",
            octo_alpha_c1_p: "Answers to all questions about switching providers, meter readings, moving house, and energy-saving tips.",
            octo_alpha_c1_btn: "To Service Center",
            octo_alpha_c2_h3: "Partner Network (VP)",
            octo_alpha_c2_p: "Become part of our nationwide sales network with attractive commissions, a digital VP portal, and strong support.",
            octo_alpha_c2_btn: "Become a Partner",
            octo_alpha_c3_h3: "Careers",
            octo_alpha_c3_p: "Shape the energy transition with us at our Dortmund headquarters or in nationwide sales – discover open positions now.",
            octo_alpha_c3_btn: "View Jobs",
            octo_bottom_h2: "Switch once, fair prices forever",
            octo_bottom_sub: "Switch to Alpha Energie GmbH in 3 minutes now – with zero paperwork and zero supply interruption",
            octo_bottom_mascot_tag: "3-Minute Switch",
            octo_bottom_mascot_text: "We handle the cancellation with your old provider free of charge!",
            octo_bottom_box_h3: "Get your personal offer now",
            octo_bottom_box_p: "Enter your postal code and immediately see your savings for green electricity or natural gas.",
            octo_bottom_opt_strom: "Green Electricity",
            octo_bottom_opt_gas: "Natural Gas",
            ph_bottom_plz: "Your Postal Code (e.g. 44379)",
            octo_bottom_btn: "Get Offer",
            octo_footer_row1_label: "Call us • Monday to Friday, 08:00 to 18:00",
            octo_footer_row2_label: "Write to us anytime",
            octo_footer_row3_label: "Frequently Asked Questions (FAQ) & Customer Service",
            octo_footer_row3_link: "View answers →",
            octo_footer_row4_label: "Submit meter reading for electricity or gas?",
            octo_footer_row4_link: "Report meter reading online →",
            octo_footer_team_pill: "🎧 Team Dortmund",
            octo_footer_dortmund_p: "In person at our Customer Center Dortmund: <strong style=\"color:#e95e24;\">Alter Hellweg 50, 44379 Dortmund</strong>",
            ph_news_email: "Your email address *",
            ph_news_name: "Your first name (optional)",
            octo_news_consent: "Yes, I would like to receive exciting information about green electricity and natural gas tariffs as well as promotions from Alpha Energie GmbH by email. Unsubscribe anytime. More info in our <a href=\"datenschutz.html\" style=\"color:#e95e24;text-decoration:underline;\">Privacy Policy</a>.",
            octo_news_btn: "Subscribe Now",
            octo_news_success: "✓ Thank you! Your registration for Alpha Energie updates was successful.",
            octo_fc_impressum: "Imprint",
            octo_fc_datenschutz: "Privacy Policy",
            octo_fc_cookie_set: "Cookie Settings",
            octo_fc_cookie_pol: "Cookie Policy",
            octo_fc_cancel: "Cancel contracts here (§ 312k BGB)",
            octo_fc_revoke: "Revoke contracts here",
            octo_fc_strom: "100% Green Electricity",
            octo_fc_gas: "Natural Gas with Climate Contribution",
            octo_fc_b2b: "Business Customers (B2B)",
            octo_fc_calc: "Power & Gas Calculator",
            octo_fc_co2: "Energy Audits & CO₂ Path",
            octo_fc_who: "Who We Are",
            octo_fc_vp: "Become a Sales Partner",
            octo_fc_jobs: "Careers",
            octo_fc_faq: "Help & FAQ",
            octo_fc_contact: "Contact Dortmund",
            octo_fc_login: "VP Portal Login",
            octo_footer_copy: "© 2026 Alpha Energie GmbH, Alter Hellweg 50, 44379 Dortmund • Phone: 0231 39989390",
            octo_footer_firstcon: "Notice on the contractual partner: Energy supply (electricity &amp; natural gas), billing, and customer service are carried out under the brand <strong>Alpha Energie</strong> – a brand of <strong>Firstcon GmbH</strong>, <a href=\"https://www.firstcon.de\" target=\"_blank\" rel=\"noopener\">www.firstcon.de</a>.",
            modal_sum_monthly_label: "Monthly Installment:",
            modal_sum_kwh_label: "Annual Consumption:",
            modal_inline_plz_label: "Your Postal Code (Supply Address) *",
            modal_inline_kwh_label: "Annual Consumption (kWh/year) *",
            modal_inline_val_msg: "⚠️ Please enter your 5-digit postal code and estimated annual consumption (min. 500 kWh) to continue.",
            modal_order_custom_date: "Preferred Supply Start Date",
            modal_step2_intro: "For automatic registration with your local grid operator, we need your supply address.",
            modal_meter_hint: "Found on your last utility bill or directly on your electricity/gas meter. You can also submit it conveniently later.",
            modal_ssl_note: "🔒 256-bit SSL encrypted transmission • 14-day statutory right of withdrawal",
            cancel_tab_kuendigung: "Cancel Contract (§ 312k BGB)",
            cancel_tab_widerruf: "Revoke Contract (14 Days)",
            cancel_sec1_title: "1. Contract Details",
            cancel_sparte_label: "Energy Type *",
            cancel_opt_strom: "Electricity Contract",
            cancel_opt_gas: "Natural Gas Contract",
            cancel_opt_both: "Electricity & Natural Gas Contract",
            cancel_meter_opt_label: "Meter Number (optional)",
            cancel_sec2_title: "2. Type & Date of Cancellation (§ 312k BGB)",
            cancel_type_label: "Type of Cancellation *",
            cancel_type_ord: "Regular Cancellation (with notice period)",
            cancel_type_sonder: "Extraordinary / Special Cancellation",
            cancel_reason_sonder_label: "Reason for Extraordinary Cancellation *",
            cancel_reason_opt0: "Please select a reason...",
            cancel_reason_opt1: "Move / Abandonment of supply point",
            cancel_reason_opt2: "Price adjustment / Exercise of special right of termination",
            cancel_reason_opt3: "Death of the contracting party",
            cancel_reason_opt4: "Other important reason",
            cancel_when_label: "When would you like to cancel? *",
            cancel_when_soon: "At the earliest possible date",
            cancel_when_date: "On a specific preferred date",
            cancel_custom_date_label: "Preferred Termination Date *",
            revoke_sec2_title: "2. Contract Revocation Details",
            revoke_date_label: "Date of Contract Conclusion / Order *",
            revoke_reason_label: "Reason for Revocation (optional)",
            cancel_sec3_title: "3. Contracting Party & Address",
            cancel_street_label: "Street & House Number (Supply Address) *",
            cancel_plz_label: "Postal Code *",
            cancel_city_label: "City *",
            cancel_phone_label: "Phone Number (for queries, optional)",
            cancel_conf_title: "Confirmation of Receipt pursuant to § 312k BGB",
            cancel_conf_sub: "Your request has been recorded with a timestamp and sent to your email address.",
            cancel_btn_pdf: "Download Confirmation as PDF Now",
            cancel_btn_close: "Close Window",
            octo_sk_r7_c1: "Radioactive Waste",
            octo_sk_countries_box: "<strong>Countries of Origin for Guarantees of Origin (Alpha Energie):</strong><br>• <strong>Norway:</strong> 94.5% (electricity generation from hydropower)<br>• <strong>Sweden:</strong> 5.5% (electricity generation from wind power)",
            octo_about_vpill1: "<span style=\"background:#e95e24;color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;\">1</span> Choose tariff from home",
            octo_about_vpill2: "<span style=\"background:#e95e24;color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;\">2</span> Alpha Wolf handles cancellation",
            octo_about_vpill3: "<span style=\"background:#16a34a;color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;\">✓</span> Save up to 380 € / year",
            octo_fc_sk: "Electricity Labeling (§ 42 EnWG)",
            hero_trust_li1: "<strong>4.9 out of 5 stars</strong> in <a href=\"#bewertungen\">customer reviews</a> • 100% renewable electricity &amp; natural gas",
            hero_trust_li2: "<a href=\"#tarife\">Alpha Switch Guarantee</a> – Up to 24 months full price protection",
            hero_trust_li3: "Personal telephone service from Dortmund: <strong>0231 39989390</strong>"
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
            calc_1pers: 'Az',
            calc_2pers: 'Orta',
            calc_3pers: 'Çok',
            calc_4pers: '4+ Kişi',
            calc_kwh_unit: 'kWh / yıl',
            calc_abschlag_label: 'Mevcut aylık avans ödemesi (€ / ay)',
            calc_savings_label: 'Hesaplanan tasarruf fırsatınız:',
            calc_savings_text: 'Yılda 320 €\'ya varan!',
            calc_submit_btn: 'Tarife Bul',
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
            modal_order_agb_checkbox: '<a id="orderAgbInlineLink" href="/api/tarife/agb?branch=strom" target="_blank" rel="noopener" style="text-decoration: underline; color: #ff7a00; font-weight: 600;">Genel İşlem Koşullarını (AGB) ve Cayma Hakkı Bilgilendirmesini (PDF)</a> kabul ediyor, <a id="orderPrivacyPdfInlineLink" href="/api/tarife/datenschutz?branch=strom" target="_blank" rel="noopener" style="text-decoration: underline; color: #ff7a00; font-weight: 600;">Veri Koruma Bilgilendirmesini (PDF)</a> ve <a href="datenschutz.html" target="_blank" style="text-decoration: underline; color: #ff7a00;">Gizlilik Politikasını</a> onaylıyor, SEPA Otomatik Ödeme talimatı veriyor ve siparişi bağlayıcı olarak iletiyorum.',
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
            octo_footer_news_p: 'Alpha Energie GmbH\'nin %100 yeşil elektrik ve iklim nötr eko-gaz tarifeleri, enerji tasarrufu ipuçları ve özel avantajlarından haberdar olun.',
            nav_top_strom: "Yeşil Elektrik",
            nav_top_gas: "Doğal Gaz",
            nav_top_gewerbe: "Kurumsal",
            nav_top_about: "Hakkımızda",
            nav_top_contact: "İletişim",
            nav_dd_basic: "ALPHA BASIC 24 (Fiyat Garantisi)",
            nav_dd_time: "ALPHA TIME 24 (Çok Satan)",
            nav_dd_premium: "ALPHA PREMIUM 24 (Üstün Fiyat Koruması)",
            nav_dd_oekostrom_ok: "%100 Yeşil Elektrik (ok-power)",
            nav_dd_strommix: "Elektrik Kaynak Etiketi (§ 42 EnWG)",
            nav_dd_gas_klima: "İklim Katkılı Doğal Gaz",
            nav_dd_gas_overview: "Doğal Gaz Tarife Özeti",
            nav_dd_live_calc: "Canlı Tarife Hesaplayıcı",
            nav_dd_gewerbe_rlm: "Ticari Elektrik & RLM",
            nav_dd_co2: "Enerji Denetimleri & CO₂",
            nav_dd_pv: "Fotovoltaik (Güneş Enerjisi)",
            nav_dd_sektor: "Sektörel Entegrasyon",
            nav_dd_who: "Biz Kimiz",
            nav_dd_vp: "Satış Ortağı Olun",
            nav_dd_jobs: "Kariyer & İş İlanları",
            nav_dd_help: "Müşteri Hizmetleri & Yardım",
            nav_dd_meter: "Online Sayaç Bildirimi",
            nav_dd_dortmund: "Dortmund Müşteri Merkezi",
            nav_btn_login: "Giriş Yap",
            octo_hero_h1: "Yeşil Elektrik &amp; Doğal Gaz.<br>Basit. Şeffaf.<br><span class=\"highlight\">Garantili Uygun Fiyat.</span>",
            octo_stage_pill_1: "Yeşil Elektrik & Doğal Gaz",
            octo_stage_pill_2: "Almanya Genelinde Destek",
            octo_stage_pill_3: "24 Ay Garanti",
            calc_tab_strom_sub: "%100 Yenilenebilir (ok-power)",
            calc_tab_gas_sub: "İklim Koruma Katkılı",
            octo_unit_kwh: "kWh/yıl",
            octo_unit_eur: "€/ay",
            calc_gas_1: "Daire",
            calc_gas_2: "Sıra Ev",
            calc_gas_3: "Müstakil Ev",
            calc_gas_4: "Büyük Ev",
            ph_calc_plz: "Posta Kodu",
            ph_calc_abschlag: "Mevcut avansınız",
            ph_calc_kwh_strom: "örn. 2.500",
            ph_calc_kwh_gas: "örn. 12.000",
            octo_tarife_h2: "Canlı Tarifelerimize Genel Bakış",
            octo_tarife_sub: "Posta kodunuz için şeffaf hesaplama – tam fiyat garantisi ve ücretsiz geçiş hizmeti dahil",
            octo_bento2_vis_1: "Yılda 380 €'ya varan tasarruf",
            octo_bento2_vis_2: "24 Aya Varan Fiyat Garantisi",
            octo_bento2_vis_3: "Adil Tarifeler & Gerçek Tasarruf",
            octo_mehr_c1_h3: "Yeşil Elektrik & Doğal Gaz Tarifeleri",
            octo_mehr_c1_p: "Sürdürülebilir yeşil elektrik ve doğal gaz tarifelerimizle temel tedariğe kıyasla tasarruf ederken karbon ayak izinizi azaltırsınız.",
            octo_mehr_c1_btn: "Tarife Bul",
            octo_mehr_c2_vis_sub: "2028'e Kadar Tam Fiyat Koruması",
            octo_mehr_c2_h3: "24 Ay Fiyat Korumalı Tarife",
            octo_mehr_c2_p: "Enerji ve temel fiyatlarda gizli fiyat artışları olmadan tam iki yıl planlama güvencesi elde edin.",
            octo_mehr_c2_btn: "24 Aylık Tarifeye Git",
            octo_biz_h3: "ALPHA KURUMSAL ELEKTRİK TARİFESİ",
            octo_biz_li1: "Ticaret, gastronomi, ofis ve perakende için fiyat garantili %100 yeşil elektrik",
            octo_biz_li2: "10.000 kWh'den itibaren özel RLM yük profili ve SLP koşulları",
            octo_biz_li3: "Dortmund müşteri merkezimizde kişisel B2B müşteri temsilcisi",
            octo_biz_btn: "Kurumsal Tarifeye Git",
            octo_rev_score_title: "Müşteri Puanı 4.9",
            octo_rev_score_badge: "Mükemmel",
            octo_rev_score_p: "Tarife değişimi, fiyat şeffaflığı ve Dortmund müşteri hizmetleri için doğrulanmış müşteri yorumlarına dayanmaktadır.",
            octo_rev_verified: "✓ Doğrulanmış",
            octo_rev1_title: "Geçiş tamamen sorunsuz gerçekleşti",
            octo_rev1_quote: "“3 dakikada online geçiş yaptık, eski tedarikçi otomatik olarak iptal edildi ve %100 yeşil elektrikle yılda 340 €'dan fazla tasarruf ediyoruz.”",
            octo_rev1_author: "Markus K. • Dortmund",
            octo_rev2_title: "Sonunda gerçek telefonla müşteri hizmeti!",
            octo_rev2_quote: "“Bekleme hattı ve sohbet robotu hayal kırıklığı yok. Dortmund'da talebimle hemen ilgilenen gerçek çalışanlara anında ulaşıyorsunuz.”",
            octo_rev2_author: "Sabine M. • Bochum",
            octo_rev3_title: "Harika gaz fiyatı & 24 ay kafamız rahat",
            octo_rev3_quote: "“Yerel tedarikçimizin fiyat artışından sonra elektrik ve gazda Alpha Energie'ye geçtik. Net koşullar ve adil aylık ödemeler.”",
            octo_rev3_author: "Yılmaz Ailesi • Essen",
            octo_smart_mascot_tag: "ok-power Sertifikalı",
            octo_smart_mascot_text: "Eviniz için %100 gerçek yeşil enerji – gizli maliyet yok!",
            octo_smart_c1_h3: "%100 Yenilenebilir Enerjiden Yeşil Elektrik (ok-power)",
            octo_smart_c1_p: "Konut elektriği tarifelerimizle %100 yenilenebilir kaynaklardan sertifikalı yeşil elektrik alırken, fiyat garantimiz sizi artan elektrik fiyatlarına karşı güvenle korur.",
            octo_smart_c1_li1: "Resmi ok-power kalite mührü ile %100 yenilenebilir enerji",
            octo_smart_c1_li2: "Gizli maliyet olmadan 24 aya varan tam fiyat garantisi",
            octo_smart_c1_li3: "Mevcut tedarikçinizin iptali dahil kesintisiz geçiş hizmeti",
            octo_smart_c1_btn: "Yeşil Elektrik Tarifelerine Git",
            octo_smart_c2_h3: "Gönüllü İklim Koruma Katkılı Doğal Gaz",
            octo_smart_c2_p: "Sürekli uygun koşullarla güvenle ısının ve yemek pişirin: Doğal gaz tarifelerimiz sertifikalı iklim koruma projelerini (Gold Standard / VCS) destekler ve 24 aya varan tam fiyat garantisi sunar.",
            octo_smart_c2_btn: "Doğal Gaz Tarifelerine Git",
            octo_smart_g1_h3: "Yeşil Elektrik (ok-power)",
            octo_smart_g1_p: "Resmi ok-power sertifikalı, kömür ve nükleer içermeyen %100 yenilenebilir enerjiden (hidroelektrik ve rüzgar) elektrik.",
            octo_smart_g1_btn: "Yeşil Elektriği Keşfet",
            octo_smart_g2_h3: "İklim Katkılı Doğal Gaz",
            octo_smart_g2_p: "Sertifikalı iklim koruma projelerini destekleyen gönüllü iklim katkılı doğal gaz tarifeleri ve adil aylık ödemeler.",
            octo_smart_g2_btn: "Doğal Gazı Keşfet",
            octo_smart_g3_h3: "12 & 24 Ay Garanti",
            octo_smart_g3_p: "12 veya 24 ay fiyat garantisi arasında esnek seçim yapın – beklenmedik fiyat artışları olmadan tam maliyet kontrolü.",
            octo_smart_g3_btn: "Fiyat Koruması Seç",
            octo_smart_g4_h3: "Ticari Elektrik & Gaz",
            octo_smart_g4_p: "İşletmeler, perakende, gastronomi ve bina yönetimleri için özel SLP ve RLM enerji tarifeleri.",
            octo_smart_g4_btn: "Kurumsal Müşteriler İçin",
            octo_heizen_c1_h3: "Gönüllü İklim Koruma Katkılı & Fiyat Garantili Doğal Gaz",
            octo_heizen_c1_p: "Alpha Energie doğal gaz ile son derece uygun fiyatlı ve öngörülebilir şekilde ısınırsınız. Gönüllü iklim koruma katkımızla dünya çapında sertifikalı iklim projelerini destekliyoruz.",
            octo_heizen_c1_li1: "Doğrulanmış Gold Standard ve VCS projeleriyle gönüllü iklim koruma katkısı",
            octo_heizen_c1_li2: "Enerji ve temel fiyatta 24 aya varan tam fiyat garantisi",
            octo_heizen_c1_li3: "Gaz tedarikinizde kesinti olmadan otomatik tedarikçi değişimi",
            octo_heizen_c1_btn: "Doğal Gaz Tarifesini Şimdi Al",
            octo_heizen_c2_h3: "ok-power Kalite Mühürlü %100 Yenilenebilir Yeşil Elektrik",
            octo_heizen_c2_p: "İster tek kişilik hane, ister aile evi veya işletme olsun: Sertifikalı yeşil elektriğimiz, %100 tedarik güvenliği ve Dortmund'dan kişisel hizmetle elektrik faturanızı hemen düşürür.",
            octo_heizen_c2_btn1: "Bireysel Müşteriler İçin",
            octo_heizen_c2_btn2: "Kurumsal Müşteriler İçin",
            octo_inno_c1_h3: "ok-power Yeşil Elektrik",
            octo_inno_c1_p: "Federal Çevre Ajansı menşe şahadetnamesi sicilinden doğrudan iptal edilen %100 yenilenebilir enerjiden sertifikalı yeşil elektrik.",
            octo_inno_c1_btn: "Yeşil Elektrik Hakkında",
            octo_inno_c2_h3: "Gönüllü İklim Katkılı Doğal Gaz",
            octo_inno_c2_p: "Uluslararası Gold Standard iklim koruma projelerini destekleyen gönüllü iklim katkılı doğal gaz tedariki.",
            octo_inno_c2_btn: "Doğal Gaz Hakkında",
            octo_inno_c3_h3: "Ticari & Büyük Müşteriler",
            octo_inno_c3_p: "İşletmeler, şube ağları ve mülk yönetimleri için özel SLP ve RLM elektrik ve gaz tarifeleri.",
            octo_inno_c3_btn: "B2B Danışmanlığına Git",
            octo_sk_badge: "§ 42 EnWG Uyarınca Yasal Zorunlu Bilgi",
            octo_sk_h2: "Elektrik Kaynak Etiketi & Enerji Karışımı Karşılaştırması",
            octo_sk_sub: "Alman Enerji Ekonomisi Yasası (EnWG) § 42 uyarınca, elektrik karışımımızın bileşimi ve Almanya ortalamasına kıyasla çevresel etkileri hakkında şeffaf bilgi sunuyoruz (Durum: 03/2026).",
            octo_sk_left_h3: "Resmi Grafik: Enerji Karışımı & Menşe Ülkeler",
            octo_sk_left_btn: "Grafiği tam boyutta aç ↗",
            octo_sk_left_note: "Enerji Ekonomisi Yasası § 42 uyarınca elektrik etiketlemesi. Kaynak: AG Energiebilanzen ve Fraunhofer ISE verilerine dayalı kendi gösterimimiz (Durum 03/2026).",
            octo_sk_right1_h3: "Detaylı Enerji Kaynakları & Çevresel Etkiler",
            octo_sk_th1: "Enerji Kaynağı / Çevre Göstergesi",
            octo_sk_th2: "Alpha Energie",
            octo_sk_th3: "Almanya Ortalaması",
            octo_sk_r1_c1: "Menşe garantili yenilenebilir enerjiler (doğrudan Federal Çevre Ajansı sicilinden iptal edilmiştir)",
            octo_sk_r2_c1: "EEG kapsamında desteklenen yenilenebilir enerjiler",
            octo_sk_r3_c1: "Kömür",
            octo_sk_r4_c1: "Doğal Gaz",
            octo_sk_r5_c1: "Mineral Yağ & Diğer Fosil Yakıtlar",
            octo_sk_r6_c1: "CO₂ Emisyonları / Radyoaktif Atık",
            octo_sk_right1_note: "Tedarikçi ülkelere göre menşe garantileri: %94,5 Norveç (hidroelektrik), %5,5 İsveç (rüzgar enerjisi). Doğrudan Federal Çevre Ajansı (UBA) sicilinden iptal edilmiştir.",
            octo_sk_right2_h3: "Gönüllü İklim Koruma Katkısı Hakkında Bilgi (Doğal Gaz)",
            octo_sk_right2_p: "Doğal gazın yanması sırasında fiziksel olarak CO₂ emisyonları oluşur (yakl. 201 g CO₂/kWh). Alpha Energie doğal gaz tarifeleri, küresel sera gazı azaltımı için sertifikalı iklim koruma projelerini (Gold Standard / VCS) destekleyen gönüllü bir iklim koruma katkısı içerir.",
            octo_sk_right2_btn1: "Yeşil Elektrik Detayları",
            octo_sk_right2_btn2: "İklim Projeleri Detayları",
            octo_about_h2: "Hakkımızda",
            octo_about_sub: "Enerji tedariki yeniden düşünüldü – dürüst, dijital ve Dortmund'dan kişisel hizmetle",
            octo_video_sound_on: "Sesi aç",
            octo_video_sound_off: "Sesi kapat",
            octo_vstep1_title: "Tarife Hesapla",
            octo_vstep1_sub: "Posta kodu & tüketimi girin",
            octo_vstep2_title: "Geçiş Talimatı Ver",
            octo_vstep2_sub: "Alpha-Kurt iptal işlemini üstlenir",
            octo_vstep3_title: "Kalıcı Tasarruf Et",
            octo_vstep3_sub: "%100 yeşil elektrik & fiyat garantisi",
            octo_video_hq_title: "Alpha Energie GmbH • Dortmund Genel Merkez",
            octo_video_hq_sub: "Alter Hellweg 50, 44379 Dortmund • 15 yılı aşkın enerji deneyimi",
            octo_video_hq_link: "Hakkımızda daha fazlası →",
            octo_about_i1_h3: "Biz Kimiz",
            octo_about_i1_p: "Merkezi Dortmund Alter Hellweg 50'de bulunan Alpha Energie GmbH, Almanya genelinde hanelere ve işletmelere %100 yeşil elektrik ve gönüllü iklim katkılı doğal gaz tedarik etmektedir.",
            octo_about_i2_h3: "Fiyatlarımız Adildir ve Öyle Kalır",
            octo_about_i2_p: "Karmaşık paket tarifeler yerine yalın dijital süreçlere, net birim ve temel fiyatlara ve 24 aya varan tam fiyat garantisine güveniyoruz.",
            octo_about_i3_h3: "Müşteri Memnuniyeti & Yerinde Hizmet",
            octo_about_i3_p: "Bizde anonim çağrı merkezi kuyruklarında beklemezsiniz – Dortmund'daki müşteri hizmetleri ekibimiz telefon, WhatsApp ve yerinde kişisel olarak yanınızdadır.",
            octo_about_more_link: "Daha fazla bilgi →",
            octo_alpha_c1_h3: "Hizmet & Rehber",
            octo_alpha_c1_p: "Tedarikçi değişimi, sayaç bildirimi, taşınma ve enerji tasarrufu ipuçları hakkındaki tüm sorularınızın yanıtları.",
            octo_alpha_c1_btn: "Hizmet Merkezine Git",
            octo_alpha_c2_h3: "Ortaklık Ağı (VP)",
            octo_alpha_c2_p: "Cazip komisyonlar, dijital VP portalı ve güçlü destek ile ülke çapındaki satış ağımızın bir parçası olun.",
            octo_alpha_c2_btn: "İş Ortağı Olun",
            octo_alpha_c3_h3: "Kariyer",
            octo_alpha_c3_p: "Dortmund merkezimizde veya ülke çapındaki satış ekibimizde enerji dönüşümünü birlikte şekillendirelim – açık pozisyonları keşfedin.",
            octo_alpha_c3_btn: "İş İlanlarına Git",
            octo_bottom_h2: "Bir kez geçin, her zaman adil fiyatlardan yararlanın",
            octo_bottom_sub: "Evrak işleri ve tedarik kesintisi olmadan şimdi 3 dakikada Alpha Energie GmbH'ye geçin",
            octo_bottom_mascot_tag: "3 Dakikada Geçiş",
            octo_bottom_mascot_text: "Eski tedarikçinizdeki iptal işlemini ücretsiz üstleniyoruz!",
            octo_bottom_box_h3: "Şimdi kişisel teklifinizi alın",
            octo_bottom_box_p: "Posta kodunuzu girin ve yeşil elektrik veya doğal gaz için tasarrufunuzu hemen görün.",
            octo_bottom_opt_strom: "Yeşil Elektrik",
            octo_bottom_opt_gas: "Doğal Gaz",
            ph_bottom_plz: "Posta Kodunuz (örn. 44379)",
            octo_bottom_btn: "Teklif Al",
            octo_footer_row1_label: "Bizi arayın • Pazartesi – Cuma, 08:00 – 18:00",
            octo_footer_row2_label: "Bize istediğiniz zaman yazın",
            octo_footer_row3_label: "Sıkça Sorulan Sorular (SSS) & Müşteri Hizmetleri",
            octo_footer_row3_link: "Yanıtlara git →",
            octo_footer_row4_label: "Elektrik veya gaz sayaç değerini mi bildireceksiniz?",
            octo_footer_row4_link: "Sayaç değerini online bildir →",
            octo_footer_team_pill: "🎧 Dortmund Ekibi",
            octo_footer_dortmund_p: "Dortmund Müşteri Merkezimizde şahsen hizmetinizdeyiz: <strong style=\"color:#e95e24;\">Alter Hellweg 50, 44379 Dortmund</strong>",
            ph_news_email: "E-posta adresiniz *",
            ph_news_name: "Adınız (isteğe bağlı)",
            octo_news_consent: "Evet, Alpha Energie GmbH'den yeşil elektrik ve doğal gaz tarifeleri ile kampanyalar hakkında e-posta yoluyla bilgi almak istiyorum. İstediğiniz zaman abonelikten çıkabilirsiniz. Detaylı bilgi <a href=\"datenschutz.html\" style=\"color:#e95e24;text-decoration:underline;\">Gizlilik Politikası</a>'nda.",
            octo_news_btn: "Şimdi Kaydol",
            octo_news_success: "✓ Teşekkürler! Alpha Energie bülten kaydınız başarıyla tamamlandı.",
            octo_fc_impressum: "Künye",
            octo_fc_datenschutz: "Gizlilik Politikası",
            octo_fc_cookie_set: "Çerez Ayarları",
            octo_fc_cookie_pol: "Çerez Politikası",
            octo_fc_cancel: "Sözleşmeleri buradan feshedin (§ 312k BGB)",
            octo_fc_revoke: "Sözleşmelerden buradan cayın",
            octo_fc_strom: "%100 Yeşil Elektrik",
            octo_fc_gas: "İklim Katkılı Doğal Gaz",
            octo_fc_b2b: "Kurumsal Müşteriler (B2B)",
            octo_fc_calc: "Elektrik & Gaz Hesaplayıcı",
            octo_fc_co2: "Enerji Denetimleri & CO₂ Yolu",
            octo_fc_who: "Biz Kimiz",
            octo_fc_vp: "Satış Ortağı Olun",
            octo_fc_jobs: "Kariyer",
            octo_fc_faq: "Yardım & SSS",
            octo_fc_contact: "İletişim Dortmund",
            octo_fc_login: "VP Portalı Girişi",
            octo_footer_copy: "© 2026 Alpha Energie GmbH, Alter Hellweg 50, 44379 Dortmund (Almanya) • İletişim: 0231 39989390",
            octo_footer_firstcon: "Sözleşme ortağı hakkında bilgi: Enerji tedariki (elektrik ve doğal gaz), faturalandırma ve müşteri hizmetleri <strong>Firstcon GmbH</strong>'nin (<a href=\"https://www.firstcon.de\" target=\"_blank\" rel=\"noopener\">www.firstcon.de</a>) bir markası olan <strong>Alpha Energie</strong> markası altında yürütülmektedir.",
            modal_sum_monthly_label: "Aylık Ödeme:",
            modal_sum_kwh_label: "Yıllık Tüketim:",
            modal_inline_plz_label: "Posta Kodunuz (Teslimat Yeri) *",
            modal_inline_kwh_label: "Yıllık Tüketim (kWh/yıl) *",
            modal_inline_val_msg: "⚠️ Devam etmek için lütfen 5 haneli posta kodunuzu ve tahmini yıllık tüketiminizi (en az 500 kWh) girin.",
            modal_order_custom_date: "İstenen Teslimat Tarihi",
            modal_step2_intro: "Yerel şebeke operatörünüze otomatik kayıt için teslimat adresinize ihtiyacımız var.",
            modal_meter_hint: "Son faturanızda veya doğrudan elektrik/gaz sayacınızda bulabilirsiniz. Daha sonra da kolayca iletebilirsiniz.",
            modal_ssl_note: "🔒 256-Bit SSL şifreli veri iletimi • 14 gün yasal cayma hakkı",
            cancel_tab_kuendigung: "Sözleşmeyi Feshet (§ 312k BGB)",
            cancel_tab_widerruf: "Sözleşmeden Cay (14 Gün)",
            cancel_sec1_title: "1. Sözleşme Bilgileri",
            cancel_sparte_label: "Enerji Türü *",
            cancel_opt_strom: "Elektrik Sözleşmesi",
            cancel_opt_gas: "Doğal Gaz Sözleşmesi",
            cancel_opt_both: "Elektrik & Doğal Gaz Sözleşmesi",
            cancel_meter_opt_label: "Sayaç Numarası (isteğe bağlı)",
            cancel_sec2_title: "2. Fesih Türü ve Zamanı (§ 312k BGB)",
            cancel_type_label: "Fesih Türü *",
            cancel_type_ord: "Olağan Fesih (süresinde)",
            cancel_type_sonder: "Olağanüstü Fesih / Özel Fesih Hakkı",
            cancel_reason_sonder_label: "Olağanüstü Fesih Nedeni *",
            cancel_reason_opt0: "Lütfen bir neden seçin...",
            cancel_reason_opt1: "Taşınma / Teslimat noktasının terk edilmesi",
            cancel_reason_opt2: "Fiyat değişikliği / Özel fesih hakkının kullanılması",
            cancel_reason_opt3: "Sözleşme sahibinin vefatı",
            cancel_reason_opt4: "Diğer önemli neden",
            cancel_when_label: "Ne zaman feshetmek istiyorsunuz? *",
            cancel_when_soon: "Mümkün olan en erken tarihte",
            cancel_when_date: "Belirli bir tarihte",
            cancel_custom_date_label: "İstenen Bitiş Tarihi *",
            revoke_sec2_title: "2. Sözleşmeden Cayma Bilgileri",
            revoke_date_label: "Sözleşme / Sipariş Tarihi *",
            revoke_reason_label: "Cayma Nedeni (isteğe bağlı)",
            cancel_sec3_title: "3. Sözleşme Sahibi & Adres",
            cancel_street_label: "Sokak & Bina Numarası (Teslimat Adresi) *",
            cancel_plz_label: "Posta Kodu *",
            cancel_city_label: "Şehir *",
            cancel_phone_label: "Telefon Numarası (sorular için, isteğe bağlı)",
            cancel_conf_title: "§ 312k BGB Uyarınca Alındı Onayı",
            cancel_conf_sub: "Talebiniz zaman damgasıyla kaydedildi ve e-posta adresinize gönderildi.",
            cancel_btn_pdf: "Onayı Şimdi PDF Olarak İndir",
            cancel_btn_close: "Pencereyi Kapat",
            octo_sk_r7_c1: "Radyoaktif Atık",
            octo_sk_countries_box: "<strong>Menşe Garantilerinin Tedarikçi Ülkeleri (Alpha Energie):</strong><br>• <strong>Norveç:</strong> %94,5 (hidroelektrik ile elektrik üretimi)<br>• <strong>İsveç:</strong> %5,5 (rüzgar enerjisi ile elektrik üretimi)",
            octo_about_vpill1: "<span style=\"background:#e95e24;color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;\">1</span> Evden tarifenizi seçin",
            octo_about_vpill2: "<span style=\"background:#e95e24;color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;\">2</span> Alpha-Wolf feshi üstlenir",
            octo_about_vpill3: "<span style=\"background:#16a34a;color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;\">✓</span> Yılda 380 €'ya varan tasarruf",
            octo_fc_sk: "Elektrik Etiketlemesi (§ 42 EnWG)",
            hero_trust_li1: "<a href=\"#bewertungen\">Müşteri değerlendirmelerinde</a> <strong>5 üzerinden 4,9 yıldız</strong> • %100 yenilenebilir elektrik &amp; doğal gaz",
            hero_trust_li2: "<a href=\"#tarife\">Alpha Geçiş Garantisi</a> – 24 aya varan tam fiyat koruması",
            hero_trust_li3: "Dortmund'dan kişisel telefon hizmeti: <strong>0231 39989390</strong>"
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
            calc_2pers: 'متوسط',
            calc_3pers: 'كثير',
            calc_4pers: '4+ أشخاص',
            calc_kwh_unit: 'ك.و.س / سنة',
            calc_abschlag_label: 'الدفعة الشهرية الحالية (€ / شهر)',
            calc_savings_label: 'إمكانية التوفير المحسوبة لك:',
            calc_savings_text: 'حتى 320 € / سنة!',
            calc_submit_btn: 'ابحث عن تعريفة',
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
            modal_order_agb_checkbox: 'أوافق على <a id="orderAgbInlineLink" href="/api/tarife/agb?branch=strom" target="_blank" rel="noopener" style="text-decoration: underline; color: #ff7a00; font-weight: 600;">الشروط والأحكام العامة (AGB) وحق الانسحاب (PDF)</a>، وأقر بـ <a id="orderPrivacyPdfInlineLink" href="/api/tarife/datenschutz?branch=strom" target="_blank" rel="noopener" style="text-decoration: underline; color: #ff7a00; font-weight: 600;">معلومات حماية البيانات (PDF)</a> و<a href="datenschutz.html" target="_blank" style="text-decoration: underline; color: #ff7a00;">سياسة الخصوصية</a>، وأمنح تفويض الخصم المباشر SEPA وإرسال الطلب بشكل ملزم.',
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
            octo_footer_news_p: 'احصل على مزايا التعريفات الحصرية ونصائح توفير الطاقة وأخبار الكهرباء الخضراء 100% والغاز البيئي من Alpha Energie GmbH.',
            nav_top_strom: "كهرباء خضراء",
            nav_top_gas: "غاز طبيعي",
            nav_top_gewerbe: "الشركات والأعمال",
            nav_top_about: "من نحن",
            nav_top_contact: "اتصل بنا",
            nav_dd_basic: "ALPHA BASIC 24 (ضمان السعر)",
            nav_dd_time: "ALPHA TIME 24 (الأكثر مبيعاً)",
            nav_dd_premium: "ALPHA PREMIUM 24 (أفضل حماية للسعر)",
            nav_dd_oekostrom_ok: "كهرباء خضراء 100% (ok-power)",
            nav_dd_strommix: "تصنيف مصادر الكهرباء (§ 42 EnWG)",
            nav_dd_gas_klima: "غاز طبيعي مع مساهمة مناخية",
            nav_dd_gas_overview: "نظرة عامة على تعريفات الغاز الطبيعي",
            nav_dd_live_calc: "حاسبة التعريفات المباشرة",
            nav_dd_gewerbe_rlm: "كهرباء تجارية و RLM",
            nav_dd_co2: "تدقيق الطاقة و CO₂",
            nav_dd_pv: "الطاقة الشمسية الكهروضوئية",
            nav_dd_sektor: "الربط القطاعي للطاقة",
            nav_dd_who: "من نحن",
            nav_dd_vp: "كن شريك مبيعات",
            nav_dd_jobs: "الوظائف والمسار المهني",
            nav_dd_help: "خدمة العملاء والمساعدة",
            nav_dd_meter: "إبلاغ قراءة العداد عبر الإنترنت",
            nav_dd_dortmund: "مركز خدمة العملاء في دورتموند",
            nav_btn_login: "تسجيل الدخول",
            octo_hero_h1: "كهرباء خضراء وغاز طبيعي.<br>بسيط. شفاف.<br><span class=\"highlight\">مضمون بأفضل الأسعار.</span>",
            octo_stage_pill_1: "كهرباء خضراء وغاز طبيعي",
            octo_stage_pill_2: "دعم في جميع أنحاء ألمانيا",
            octo_stage_pill_3: "ضمان 24 شهراً",
            calc_tab_strom_sub: "100% طاقة متجددة (ok-power)",
            calc_tab_gas_sub: "مع مساهمة في حماية المناخ",
            octo_unit_kwh: "ك.و.س/سنة",
            octo_unit_eur: "€/شهر",
            calc_gas_1: "شقة سكنية",
            calc_gas_2: "منزل متلاصق",
            calc_gas_3: "منزل مستقل",
            calc_gas_4: "منزل كبير",
            ph_calc_plz: "الرمز البريدي",
            ph_calc_abschlag: "دفعتك الحالية",
            ph_calc_kwh_strom: "مثلاً 2500",
            ph_calc_kwh_gas: "مثلاً 12000",
            octo_tarife_h2: "نظرة عامة على تعريفاتنا المباشرة",
            octo_tarife_sub: "محسوبة بشفافية لرمزك البريدي – شاملة ضمان السعر الكامل وخدمة الانتقال المجانية",
            octo_bento2_vis_1: "وفّر حتى 380 € / سنة",
            octo_bento2_vis_2: "ضمان سعر حتى 24 شهراً",
            octo_bento2_vis_3: "تعريفات عادلة وتوفير حقيقي",
            octo_mehr_c1_h3: "تعريفات الكهرباء الخضراء والغاز",
            octo_mehr_c1_p: "مع تعريفاتنا المستدامة للكهرباء الخضراء والغاز الطبيعي، توفّر المال مقارنة بالتعريفة الأساسية وتقلل بصمتك الكربونية في نفس الوقت.",
            octo_mehr_c1_btn: "ابحث عن التعريفة",
            octo_mehr_c2_vis_sub: "حماية كاملة للسعر حتى 2028",
            octo_mehr_c2_h3: "تعريفة حماية السعر لمدة 24 شهراً",
            octo_mehr_c2_p: "اضمن عامين كاملين من الأمان التخطيطي دون أي زيادات خفية في أسعار الطاقة أو السعر الأساسي.",
            octo_mehr_c2_btn: "إلى تعريفة 24 شهراً",
            octo_biz_h3: "تعريفة كهرباء الأعمال ALPHA BUSINESS",
            octo_biz_li1: "كهرباء خضراء 100% مع ضمان السعر للشركات والمطاعم والمكاتب والتجارة",
            octo_biz_li2: "شروط خاصة فردية لملفات أحمال RLM و SLP ابتداءً من 10,000 ك.و.س",
            octo_biz_li3: "مسؤول حسابات شركات شخصي في مركز خدمة العملاء في دورتموند",
            octo_biz_btn: "إلى تعريفة الأعمال",
            octo_rev_score_title: "تقييم العملاء 4.9",
            octo_rev_score_badge: "ممتاز",
            octo_rev_score_p: "استناداً إلى تقييمات العملاء الموثقة لتغيير التعريفة وشفافية الأسعار وخدمة العملاء في دورتموند.",
            octo_rev_verified: "✓ موثّق",
            octo_rev1_title: "تم الانتقال بسلاسة تامة",
            octo_rev1_quote: "«انتقلنا عبر الإنترنت في 3 دقائق، وتم إلغاء العقد مع المزود السابق تلقائياً ونوفر أكثر من 340 € سنوياً مع كهرباء خضراء 100%.»",
            octo_rev1_author: "ماركوس ك. • دورتموند",
            octo_rev2_title: "أخيراً خدمة عملاء هاتفية حقيقية!",
            octo_rev2_quote: "«لا انتظار على الهاتف ولا إحباط من الردود الآلية. تتواصل فوراً مع موظفين حقيقيين في دورتموند اهتموا بطلبي على الفور.»",
            octo_rev2_author: "سابين م. • بوخوم",
            octo_rev3_title: "أفضل سعر للغاز وراحة بال لمدة 24 شهراً",
            octo_rev3_quote: "«بعد رفع الأسعار من شركة الطاقة المحلية، انتقلنا في الكهرباء والغاز إلى Alpha Energie. شروط واضحة ودفعات شهرية عادلة.»",
            octo_rev3_author: "عائلة يلماز • إيسن",
            octo_smart_mascot_tag: "معتمد بختم ok-power",
            octo_smart_mascot_text: "طاقة خضراء حقيقية 100% لمنزلك – بدون أي تكاليف خفية!",
            octo_smart_c1_h3: "كهرباء خضراء من طاقة متجددة 100% (ok-power)",
            octo_smart_c1_p: "مع تعريفات الكهرباء المنزلية لدينا، تحصل على كهرباء خضراء معتمدة من مصادر متجددة 100%، بينما يحميك ضمان السعر لدينا بموثوقية من ارتفاع أسعار الكهرباء.",
            octo_smart_c1_li1: "طاقة متجددة 100% مع ختم الجودة الرسمي ok-power",
            octo_smart_c1_li2: "ضمان سعر كامل حتى 24 شهراً بدون تكاليف خفية",
            octo_smart_c1_li3: "خدمة انتقال سلسة تشمل إلغاء العقد مع مزودك السابق",
            octo_smart_c1_btn: "إلى تعريفات الكهرباء الخضراء",
            octo_smart_c2_h3: "غاز طبيعي مع مساهمة طوعية في حماية المناخ",
            octo_smart_c2_p: "تدفئة وطهي بموثوقية وبأسعار منخفضة دائماً: تدعم تعريفات الغاز الطبيعي لدينا مشاريع حماية المناخ المعتمدة (Gold Standard / VCS) وتمنحك ضمان سعر كامل حتى 24 شهراً.",
            octo_smart_c2_btn: "إلى تعريفات الغاز الطبيعي",
            octo_smart_g1_h3: "كهرباء خضراء (ok-power)",
            octo_smart_g1_p: "كهرباء من طاقة متجددة 100% (طاقة مائية ورياح) مع شهادة ok-power الرسمية وبدون فحم أو طاقة نووية.",
            octo_smart_g1_btn: "اكتشف الكهرباء الخضراء",
            octo_smart_g2_h3: "غاز طبيعي بمساهمة مناخية",
            octo_smart_g2_p: "تعريفات غاز طبيعي مع مساهمة طوعية في حماية المناخ لدعم مشاريع المناخ المعتمدة ودفعات شهرية عادلة.",
            octo_smart_g2_btn: "اكتشف الغاز الطبيعي",
            octo_smart_g3_h3: "ضمان 12 و 24 شهراً",
            octo_smart_g3_p: "اختر بمرونة بين ضمان سعر لمدة 12 أو 24 شهراً – تحكم كامل في التكاليف دون زيادات مفاجئة في الأسعار.",
            octo_smart_g3_btn: "اختر حماية السعر",
            octo_smart_g4_h3: "كهرباء وغاز للشركات",
            octo_smart_g4_p: "تعريفات طاقة SLP و RLM مخصصة للشركات وتجارة التجزئة والمطاعم وإدارة العقارات.",
            octo_smart_g4_btn: "لعملاء الشركات",
            octo_heizen_c1_h3: "غاز طبيعي مع مساهمة طوعية في حماية المناخ وضمان السعر",
            octo_heizen_c1_p: "مع الغاز الطبيعي من Alpha Energie يمكنك التدفئة بتكلفة اقتصادية وقابلة للتخطيط. ومن خلال مساهمتنا الطوعية في حماية المناخ ندعم مشاريع مناخية معتمدة حول العالم.",
            octo_heizen_c1_li1: "مساهمة طوعية في حماية المناخ عبر مشاريع Gold Standard و VCS الموثقة",
            octo_heizen_c1_li2: "ضمان سعر كامل حتى 24 شهراً على سعر الطاقة والسعر الأساسي",
            octo_heizen_c1_li3: "انتقال تلقائي للمزود دون أي انقطاع في إمدادات الغاز",
            octo_heizen_c1_btn: "احصل على تعريفة الغاز الآن",
            octo_heizen_c2_h3: "كهرباء خضراء من طاقة متجددة 100% بختم الجودة ok-power",
            octo_heizen_c2_p: "سواء كنت فرداً أو عائلة أو شركة: كهرباؤنا الخضراء المعتمدة تخفض فاتورة الكهرباء فوراً – مع أمان إمداد 100% وخدمة شخصية من دورتموند.",
            octo_heizen_c2_btn1: "للعملاء الأفراد",
            octo_heizen_c2_btn2: "لعملاء الشركات",
            octo_inno_c1_h3: "كهرباء خضراء ok-power",
            octo_inno_c1_p: "كهرباء خضراء معتمدة من طاقة متجددة 100%، يتم إلغاؤها مباشرة في سجل ضمانات المصدر التابع للهيئة الفيدرالية للبيئة.",
            octo_inno_c1_btn: "المزيد عن الكهرباء الخضراء",
            octo_inno_c2_h3: "غاز طبيعي بمساهمة مناخية طوعية",
            octo_inno_c2_p: "إمدادات غاز طبيعي مع مساهمة طوعية في حماية المناخ لدعم مشاريع Gold Standard الدولية لحماية المناخ.",
            octo_inno_c2_btn: "المزيد عن الغاز الطبيعي",
            octo_inno_c3_h3: "الشركات وكبار العملاء",
            octo_inno_c3_p: "تعريفات كهرباء وغاز SLP و RLM فردية للشركات والفروع وإدارات العقارات.",
            octo_inno_c3_btn: "إلى استشارات الشركات B2B",
            octo_sk_badge: "بيان قانوني إلزامي وفق المادة § 42 EnWG",
            octo_sk_h2: "تصنيف الكهرباء ومقارنة مزيج الطاقة",
            octo_sk_sub: "وفقاً للمادة § 42 من قانون صناعة الطاقة الألماني (EnWG)، نقدم لك معلومات شفافة حول تركيبة مزيج الكهرباء لدينا والتأثيرات البيئية مقارنة بالمتوسط الألماني (تحديث: 03/2026).",
            octo_sk_left_h3: "الرسم البياني الرسمي: مزيج الكهرباء ودول المصدر",
            octo_sk_left_btn: "فتح الرسم البياني بالحجم الكامل ↗",
            octo_sk_left_note: "تصنيف الكهرباء وفقاً للمادة § 42 من قانون صناعة الطاقة الألماني. المصدر: عرض خاص بناءً على بيانات AG Energiebilanzen ومعهد Fraunhofer ISE (تحديث 03/2026).",
            octo_sk_right1_h3: "مصادر الطاقة والتأثيرات البيئية بالتفصيل",
            octo_sk_th1: "مصدر الطاقة / المؤشر البيئي",
            octo_sk_th2: "Alpha Energie",
            octo_sk_th3: "متوسط ألمانيا",
            octo_sk_r1_c1: "طاقات متجددة بضمانات مصدر (ملغاة مباشرة من سجل الهيئة الفيدرالية للبيئة)",
            octo_sk_r2_c1: "طاقات متجددة مدعومة وفق قانون EEG",
            octo_sk_r3_c1: "الفحم",
            octo_sk_r4_c1: "الغاز الطبيعي",
            octo_sk_r5_c1: "الزيوت المعدنية ومصادر الطاقة الأحفورية الأخرى",
            octo_sk_r6_c1: "انبعاثات CO₂ / النفايات المشعة",
            octo_sk_right1_note: "ضمانات المصدر حسب دول التوريد: 94.5% النرويج (طاقة مائية)، 5.5% السويد (طاقة رياح). ملغاة مباشرة من سجل ضمانات المصدر في الهيئة الفيدرالية للبيئة (UBA).",
            octo_sk_right2_h3: "معلومات حول المساهمة الطوعية في حماية المناخ (الغاز الطبيعي)",
            octo_sk_right2_p: "عند احتراق الغاز الطبيعي تنشأ فيزيائياً انبعاثات CO₂ (حوالي 201 غرام CO₂/ك.و.س). تتضمن تعريفات الغاز الطبيعي من Alpha Energie مساهمة طوعية في حماية المناخ تدعم مشاريع مناخية معتمدة (Gold Standard / VCS) لخفض غازات الاحتباس الحراري عالمياً.",
            octo_sk_right2_btn1: "تفاصيل الكهرباء الخضراء",
            octo_sk_right2_btn2: "تفاصيل مشاريع حماية المناخ",
            octo_about_h2: "من نحن",
            octo_about_sub: "إمدادات الطاقة برؤية جديدة – صادقة ورقمية ومع خدمة شخصية من دورتموند",
            octo_video_sound_on: "تشغيل الصوت",
            octo_video_sound_off: "كتم الصوت",
            octo_vstep1_title: "احسب التعريفة",
            octo_vstep1_sub: "أدخل الرمز البريدي والاستهلاك",
            octo_vstep2_title: "اطلب الانتقال",
            octo_vstep2_sub: "ذئب ألفا يتولى إلغاء العقد السابق",
            octo_vstep3_title: "وفّر بشكل دائم",
            octo_vstep3_sub: "كهرباء خضراء 100% وضمان السعر",
            octo_video_hq_title: "Alpha Energie GmbH • المقر الرئيسي دورتموند",
            octo_video_hq_sub: "Alter Hellweg 50, 44379 Dortmund • أكثر من 15 عاماً من الخبرة في قطاع الطاقة",
            octo_video_hq_link: "المزيد عنا →",
            octo_about_i1_h3: "من نحن",
            octo_about_i1_p: "تقوم شركة Alpha Energie GmbH، ومقرها الرئيسي في Alter Hellweg 50 بمدينة دورتموند، بتزويد المنازل والشركات في جميع أنحاء ألمانيا بكهرباء خضراء 100% وغاز طبيعي مع مساهمة طوعية في حماية المناخ.",
            octo_about_i2_h3: "أسعارنا عادلة وستبقى كذلك",
            octo_about_i2_p: "بدلاً من تعريفات الحزم غير الشفافة، نعتمد على عمليات رقمية مرنة وأسعار استهلاك وأسعار أساسية واضحة وضمان سعر كامل يصل إلى 24 شهراً.",
            octo_about_i3_h3: "رضا العملاء والخدمة الميدانية",
            octo_about_i3_p: "معنا لن تنتظر في طوابير مراكز الاتصال المجهولة – فريق خدمة العملاء لدينا في دورتموند متاح لك شخصياً عبر الهاتف وواتساب وفي الموقع.",
            octo_about_more_link: "اعرف المزيد →",
            octo_alpha_c1_h3: "الخدمة والدليل الإرشادي",
            octo_alpha_c1_p: "إجابات على جميع الأسئلة حول تغيير المزود، إبلاغ قراءة العداد، الانتقال، ونصائح توفير الطاقة.",
            octo_alpha_c1_btn: "إلى مركز الخدمة",
            octo_alpha_c2_h3: "شبكة الشركاء (VP)",
            octo_alpha_c2_p: "كن جزءاً من شبكة مبيعاتنا في جميع أنحاء ألمانيا بعمولات مجزية وبوابة شركاء رقمية ودعم قوي.",
            octo_alpha_c2_btn: "كن شريكاً",
            octo_alpha_c3_h3: "الوظائف",
            octo_alpha_c3_p: "ساهم معنا في تشكيل تحول الطاقة في مقرنا الرئيسي في دورتموند أو في المبيعات بجميع أنحاء ألمانيا – اكتشف الوظائف الشاغرة الآن.",
            octo_alpha_c3_btn: "إلى الوظائف",
            octo_bottom_h2: "انتقل مرة واحدة، واستمتع بأسعار عادلة دائماً",
            octo_bottom_sub: "انتقل الآن في 3 دقائق إلى Alpha Energie GmbH – بدون أوراق وبدون انقطاع في الإمداد",
            octo_bottom_mascot_tag: "انتقال في 3 دقائق",
            octo_bottom_mascot_text: "نتولى إلغاء العقد مع مزودك السابق مجاناً!",
            octo_bottom_box_h3: "احصل على عرضك الشخصي الآن",
            octo_bottom_box_p: "أدخل رمزك البريدي وشاهد فوراً قيمة توفيرك للكهرباء الخضراء أو الغاز الطبيعي.",
            octo_bottom_opt_strom: "كهرباء خضراء",
            octo_bottom_opt_gas: "غاز طبيعي",
            ph_bottom_plz: "رمزك البريدي (مثلاً 44379)",
            octo_bottom_btn: "احصل على العرض",
            octo_footer_row1_label: "اتصل بنا • من الإثنين إلى الجمعة، 08:00 إلى 18:00",
            octo_footer_row2_label: "راسلنا في أي وقت",
            octo_footer_row3_label: "الأسئلة الشائعة (FAQ) وخدمة العملاء",
            octo_footer_row3_link: "إلى الإجابات →",
            octo_footer_row4_label: "هل تريد إرسال قراءة عداد الكهرباء أو الغاز؟",
            octo_footer_row4_link: "إبلاغ قراءة العداد عبر الإنترنت →",
            octo_footer_team_pill: "🎧 فريق دورتموند",
            octo_footer_dortmund_p: "شخصياً في مركز خدمة العملاء في دورتموند: <strong style=\"color:#e95e24;\">Alter Hellweg 50, 44379 Dortmund</strong>",
            ph_news_email: "عنوان بريدك الإلكتروني *",
            ph_news_name: "اسمك الأول (اختياري)",
            octo_news_consent: "نعم، أود تلقي معلومات مميزة حول تعريفات الكهرباء الخضراء والغاز الطبيعي والعروض من شركة Alpha Energie GmbH عبر البريد الإلكتروني. يمكن إلغاء الاشتراك في أي وقت. مزيد من المعلومات في <a href=\"datenschutz.html\" style=\"color:#e95e24;text-decoration:underline;\">سياسة الخصوصية</a>.",
            octo_news_btn: "اشترك الآن",
            octo_news_success: "✓ شكراً لك! تم تسجيلك في تحديثات Alpha Energie بنجاح.",
            octo_fc_impressum: "بيانات النشر",
            octo_fc_datenschutz: "سياسة الخصوصية",
            octo_fc_cookie_set: "إعدادات ملفات تعريف الارتباط",
            octo_fc_cookie_pol: "سياسة ملفات تعريف الارتباط",
            octo_fc_cancel: "إلغاء العقود هنا (§ 312k BGB)",
            octo_fc_revoke: "التراجع عن العقود هنا",
            octo_fc_strom: "كهرباء خضراء 100%",
            octo_fc_gas: "غاز طبيعي مع مساهمة مناخية",
            octo_fc_b2b: "عملاء الشركات (B2B)",
            octo_fc_calc: "حاسبة الكهرباء والغاز",
            octo_fc_co2: "تدقيق الطاقة ومسار CO₂",
            octo_fc_who: "من نحن",
            octo_fc_vp: "كن شريك مبيعات",
            octo_fc_jobs: "الوظائف",
            octo_fc_faq: "المساعدة والأسئلة الشائعة",
            octo_fc_contact: "اتصل بنا في دورتموند",
            octo_fc_login: "دخول بوابة الشركاء",
            octo_footer_copy: "© 2026 Alpha Energie GmbH, Alter Hellweg 50, 44379 Dortmund • هاتف: 0231 39989390",
            octo_footer_firstcon: "ملاحظة حول الشريك التعاقدي: يتم تزويد الطاقة (الكهرباء والغاز الطبيعي) والفوترة وخدمة العملاء تحت العلامة التجارية <strong>Alpha Energie</strong> – وهي علامة تجارية تابعة لشركة <strong>Firstcon GmbH</strong>، <a href=\"https://www.firstcon.de\" target=\"_blank\" rel=\"noopener\">www.firstcon.de</a>.",
            modal_sum_monthly_label: "الدفعة الشهرية:",
            modal_sum_kwh_label: "الاستهلاك السنوي:",
            modal_inline_plz_label: "رمزك البريدي (موقع التوريد) *",
            modal_inline_kwh_label: "الاستهلاك السنوي (ك.و.س/سنة) *",
            modal_inline_val_msg: "⚠️ يرجى إدخال رمزك البريدي المكون من 5 أرقام واستهلاكك السنوي المقدر (500 ك.و.س على الأقل) للمتابعة.",
            modal_order_custom_date: "تاريخ بدء التوريد المطلوب",
            modal_step2_intro: "للتسجيل التلقائي لدى مشغل الشبكة المحلي، نحتاج إلى عنوان التوريد الخاص بك.",
            modal_meter_hint: "تجدها في فاتورتك الأخيرة أو مباشرة على عداد الكهرباء/الغاز. يمكنك أيضاً إرسالها لاحقاً بكل سهولة.",
            modal_ssl_note: "🔒 نقل بيانات مشفر بتقنية 256-Bit SSL • حق تراجع قانوني لمدة 14 يوماً",
            cancel_tab_kuendigung: "إلغاء العقد (§ 312k BGB)",
            cancel_tab_widerruf: "التراجع عن العقد (14 يوماً)",
            cancel_sec1_title: "1. بيانات العقد",
            cancel_sparte_label: "نوع الطاقة *",
            cancel_opt_strom: "عقد كهرباء",
            cancel_opt_gas: "عقد غاز طبيعي",
            cancel_opt_both: "عقد كهرباء وغاز طبيعي",
            cancel_meter_opt_label: "رقم العداد (اختياري)",
            cancel_sec2_title: "2. نوع وموعد الإلغاء (§ 312k BGB)",
            cancel_type_label: "نوع الإلغاء *",
            cancel_type_ord: "إلغاء عادي (ضمن المهلة)",
            cancel_type_sonder: "إلغاء استثنائي / حق إلغاء خاص",
            cancel_reason_sonder_label: "سبب الإلغاء الاستثنائي *",
            cancel_reason_opt0: "يرجى اختيار السبب...",
            cancel_reason_opt1: "الانتقال / إخلاء نقطة التوريد",
            cancel_reason_opt2: "تعديل الأسعار / ممارسة حق الإلغاء الخاص",
            cancel_reason_opt3: "وفاة المتعاقد",
            cancel_reason_opt4: "سبب مهم آخر",
            cancel_when_label: "متى ترغب في إنهاء العقد؟ *",
            cancel_when_soon: "في أقرب موعد ممكن",
            cancel_when_date: "في تاريخ محدد مطلوب",
            cancel_custom_date_label: "تاريخ الإنهاء المطلوب *",
            revoke_sec2_title: "2. بيانات التراجع عن العقد",
            revoke_date_label: "تاريخ إبرام العقد / الطلب *",
            revoke_reason_label: "سبب التراجع (اختياري)",
            cancel_sec3_title: "3. المتعاقد والعنوان",
            cancel_street_label: "الشارع ورقم المنزل (عنوان التوريد) *",
            cancel_plz_label: "الرمز البريدي *",
            cancel_city_label: "المدينة *",
            cancel_phone_label: "رقم الهاتف (للاستفسارات، اختياري)",
            cancel_conf_title: "تأكيد الاستلام وفقاً للمادة § 312k BGB",
            cancel_conf_sub: "تم تسجيل طلبك بختم زمني وإرساله إلى بريدك الإلكتروني.",
            cancel_btn_pdf: "تحميل التأكيد كملف PDF الآن",
            cancel_btn_close: "إغلاق النافذة",
            octo_sk_r7_c1: "النفايات المشعة",
            octo_sk_countries_box: "<strong>دول مصدر شهادات المنشأ (Alpha Energie):</strong><br>• <strong>النرويج:</strong> 94.5% (توليد الكهرباء من الطاقة المائية)<br>• <strong>السويد:</strong> 5.5% (توليد الكهرباء من طاقة الرياح)",
            octo_about_vpill1: "<span style=\"background:#e95e24;color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;\">1</span> اختر التعريفة من منزلك",
            octo_about_vpill2: "<span style=\"background:#e95e24;color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;\">2</span> ذئب ألفا يتولى إلغاء عقدك القديم",
            octo_about_vpill3: "<span style=\"background:#16a34a;color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;\">✓</span> وفّر حتى 380 € / سنة",
            octo_fc_sk: "تصنيف مصادر الكهرباء (§ 42 EnWG)",
            hero_trust_li1: "<strong>4.9 من 5 نجوم</strong> في <a href=\"#bewertungen\">تقييمات العملاء</a> • كهرباء متجددة 100% وغاز طبيعي",
            hero_trust_li2: "<a href=\"#tarife\">ضمان الانتقال من Alpha</a> – حماية كاملة للسعر حتى 24 شهراً",
            hero_trust_li3: "خدمة هاتفية شخصية من دورتموند: <strong>0231 39989390</strong>"
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
        { selector: '#rechnerForm .calc-submit-btn span', key: 'calc_submit_btn' },
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
        { selector: '#btnOpenCancelModal', key: 'footer_btn_cancel', hasSvgPrefix: true },
        { selector: '#btnOpenRevokeModal', key: 'footer_btn_revoke', hasSvgPrefix: true },
        { selector: '#main-footer .footer-bottom .copyright', key: 'footer_copyright' },
        { selector: '#main-footer .cookie-settings .cookie-link', key: 'footer_cookie_manage' },
        {"selector":"#main-nav .nav-list > li:nth-child(1) > a[href=\"oekostrom.html\"]","key":"nav_top_strom"},
        {"selector":"#main-nav .nav-list > li:nth-child(2) > a[href=\"oekogas.html\"]","key":"nav_top_gas"},
        {"selector":"#main-nav .nav-list > li:nth-child(3) > a[href=\"gewerbekunden.html\"]","key":"nav_top_gewerbe"},
        {"selector":"#main-nav .nav-list > li:nth-child(4) > a[href=\"ueber-uns.html\"]","key":"nav_top_about"},
        {"selector":"#main-nav .nav-list > li:nth-child(5) > a","key":"nav_top_contact"},
        {"selector":"#main-nav .nav-list > li:nth-child(1) .dropdown li:nth-child(1) a","key":"nav_dd_oekostrom_ok"},
        {"selector":"#main-nav .nav-list > li:nth-child(1) .dropdown li:nth-child(2) a","key":"nav_dd_basic"},
        {"selector":"#main-nav .nav-list > li:nth-child(1) .dropdown li:nth-child(3) a","key":"nav_dd_time"},
        {"selector":"#main-nav .nav-list > li:nth-child(1) .dropdown li:nth-child(4) a","key":"nav_dd_premium"},
        {"selector":"#main-nav .nav-list > li:nth-child(1) .dropdown li:nth-child(5) a","key":"nav_dd_strommix"},
        {"selector":"#main-nav .nav-list > li:nth-child(2) .dropdown li:nth-child(1) a","key":"nav_dd_gas_klima"},
        {"selector":"#main-nav .nav-list > li:nth-child(2) .dropdown li:nth-child(2) a","key":"nav_dd_gas_overview"},
        {"selector":"#main-nav .nav-list > li:nth-child(2) .dropdown li:nth-child(3) a","key":"nav_dd_live_calc"},
        {"selector":".header-actions a[href*=\"versorger.html#rechner\"]","key":"nav_btn_calc"},
        {"selector":".header-actions a[href=\"vertriebspartner-portal.html\"], .header-actions a[href=\"https://vp.alpha-energie.de\"]","key":"nav_btn_login","hasSvgPrefix":true},
        {"selector":"h1.octo-hero-h1.hero-versorger-title","key":"octo_hero_h1","isHtml":true},
        {"selector":".octo-stage-overlay-pill > div > div:nth-child(1), .octo-stage-overlay-pill > span:nth-child(1)","key":"octo_stage_pill_1"},
        {"selector":".octo-stage-overlay-pill > div > div:nth-child(2), .octo-stage-overlay-pill > span:nth-child(3)","key":"octo_stage_pill_2"},
        {"selector":".octo-stage-overlay-pill > span:last-child, .octo-stage-overlay-pill > span:nth-child(5)","key":"octo_stage_pill_3"},
        {"selector":"#calcKwh + .octo-unit-tag, .octo-calc-col-kwh .octo-unit-tag","key":"octo_unit_kwh","all":true},
        {"selector":"#calcAbschlag + .octo-unit-tag, .octo-calc-col-abschlag .octo-unit-tag","key":"octo_unit_eur","all":true},
        {"selector":"#tarife .octo-section-h2","key":"octo_tarife_h2"},
        {"selector":"#tarife .octo-section-sub","key":"octo_tarife_sub"},
        {"selector":".octo-bento-1-2 > .octo-card:nth-child(2) .octo-card-visual > div:nth-child(1) > span:nth-child(1), .octo-bento-1-2 > .octo-card:nth-child(2) .octo-card-visual > div:nth-child(2) > span:nth-child(1)","key":"octo_bento2_vis_1"},
        {"selector":".octo-bento-1-2 > .octo-card:nth-child(2) .octo-card-visual > div:nth-child(1) > span:nth-child(2), .octo-bento-1-2 > .octo-card:nth-child(2) .octo-card-visual > div:nth-child(2) > span:nth-child(2)","key":"octo_bento2_vis_2"},
        {"selector":".octo-bento-1-2 > .octo-card:nth-child(2) .octo-card-visual > div:nth-child(3)","key":"octo_bento2_vis_3"},
        {"selector":"#mehr-energie .octo-bento-2-1 > .octo-card:nth-child(1) .octo-card-h3","key":"octo_mehr_c1_h3"},
        {"selector":"#mehr-energie .octo-bento-2-1 > .octo-card:nth-child(1) .octo-card-p","key":"octo_mehr_c1_p"},
        {"selector":"#mehr-energie .octo-bento-2-1 > .octo-card:nth-child(1) .octo-btn-cta","key":"octo_mehr_c1_btn"},
        {"selector":"#mehr-energie .octo-bento-2-1 > .octo-card:nth-child(2) > div:first-child > div:first-child > span:nth-child(2), #mehr-energie .octo-bento-2-1 > .octo-card:nth-child(2) .octo-card-visual > div > div:nth-child(2)","key":"octo_mehr_c2_vis_sub"},
        {"selector":"#mehr-energie .octo-bento-2-1 > .octo-card:nth-child(2) .octo-card-h3","key":"octo_mehr_c2_h3"},
        {"selector":"#mehr-energie .octo-bento-2-1 > .octo-card:nth-child(2) .octo-card-p","key":"octo_mehr_c2_p"},
        {"selector":"#mehr-energie .octo-bento-2-1 > .octo-card:nth-child(2) .octo-btn-outline","key":"octo_mehr_c2_btn"},
        {"selector":".octo-business-banner .octo-business-tag > span, .octo-business-banner .octo-card-h3","key":"octo_biz_h3","all":true},
        {"selector":".octo-business-banner .octo-check-list li:nth-child(1) > span:last-child","key":"octo_biz_li1"},
        {"selector":".octo-business-banner .octo-check-list li:nth-child(2) > span:last-child","key":"octo_biz_li2"},
        {"selector":".octo-business-banner .octo-check-list li:nth-child(3) > span:last-child","key":"octo_biz_li3"},
        {"selector":".octo-business-banner .octo-btn-outline, .octo-business-banner .octo-btn-cta","key":"octo_biz_btn","all":true},
        {"selector":"#bewertungen .octo-review-card:nth-child(1) > div:nth-child(1)","key":"octo_rev_score_title"},
        {"selector":"#bewertungen .octo-review-card:nth-child(1) > div:nth-child(2)","key":"octo_rev_score_badge"},
        {"selector":"#bewertungen .octo-review-card:nth-child(1) > p","key":"octo_rev_score_p"},
        {"selector":"#bewertungen .octo-review-card .octo-verified-tag, #bewertungen .octo-review-card .octo-review-meta > span:nth-child(2)","key":"octo_rev_verified","all":true},
        {"selector":"#bewertungen .octo-review-card:nth-child(2) h4, #bewertungen .octo-review-card:nth-child(2) .octo-review-title","key":"octo_rev1_title"},
        {"selector":"#bewertungen .octo-review-card:nth-child(2) p, #bewertungen .octo-review-card:nth-child(2) .octo-review-quote","key":"octo_rev1_quote"},
        {"selector":"#bewertungen .octo-review-card:nth-child(2) > div:nth-child(2), #bewertungen .octo-review-card:nth-child(2) .octo-review-author","key":"octo_rev1_author"},
        {"selector":"#bewertungen .octo-review-card:nth-child(3) h4, #bewertungen .octo-review-card:nth-child(3) .octo-review-title","key":"octo_rev2_title"},
        {"selector":"#bewertungen .octo-review-card:nth-child(3) p, #bewertungen .octo-review-card:nth-child(3) .octo-review-quote","key":"octo_rev2_quote"},
        {"selector":"#bewertungen .octo-review-card:nth-child(3) > div:nth-child(2), #bewertungen .octo-review-card:nth-child(3) .octo-review-author","key":"octo_rev2_author"},
        {"selector":"#bewertungen .octo-review-card:nth-child(4) h4, #bewertungen .octo-review-card:nth-child(4) .octo-review-title","key":"octo_rev3_title"},
        {"selector":"#bewertungen .octo-review-card:nth-child(4) p, #bewertungen .octo-review-card:nth-child(4) .octo-review-quote","key":"octo_rev3_quote"},
        {"selector":"#bewertungen .octo-review-card:nth-child(4) > div:nth-child(2), #bewertungen .octo-review-card:nth-child(4) .octo-review-author","key":"octo_rev3_author"},
        {"selector":"#smarte-tarife .octo-mascot-speech-tag","key":"octo_smart_mascot_tag"},
        {"selector":"#smarte-tarife .octo-mascot-speech-text","key":"octo_smart_mascot_text"},
        {"selector":"#smarte-tarife .octo-bento-2-1 > .octo-card:nth-child(1) .octo-card-h3","key":"octo_smart_c1_h3"},
        {"selector":"#smarte-tarife .octo-bento-2-1 > .octo-card:nth-child(1) .octo-card-p","key":"octo_smart_c1_p"},
        {"selector":"#smarte-tarife .octo-bento-2-1 > .octo-card:nth-child(1) .octo-check-list li:nth-child(1) > span:last-child","key":"octo_smart_c1_li1"},
        {"selector":"#smarte-tarife .octo-bento-2-1 > .octo-card:nth-child(1) .octo-check-list li:nth-child(2) > span:last-child","key":"octo_smart_c1_li2"},
        {"selector":"#smarte-tarife .octo-bento-2-1 > .octo-card:nth-child(1) .octo-check-list li:nth-child(3) > span:last-child","key":"octo_smart_c1_li3"},
        {"selector":"#smarte-tarife .octo-bento-2-1 > .octo-card:nth-child(1) .octo-btn-cta","key":"octo_smart_c1_btn"},
        {"selector":"#smarte-tarife .octo-bento-2-1 > .octo-card:nth-child(2) .octo-card-h3","key":"octo_smart_c2_h3"},
        {"selector":"#smarte-tarife .octo-bento-2-1 > .octo-card:nth-child(2) .octo-card-p","key":"octo_smart_c2_p"},
        {"selector":"#smarte-tarife .octo-bento-2-1 > .octo-card:nth-child(2) .octo-btn-cta","key":"octo_smart_c2_btn"},
        {"selector":"#smarte-tarife .octo-grid-4 > .octo-card:nth-child(1) .octo-card-h3","key":"octo_smart_g1_h3"},
        {"selector":"#smarte-tarife .octo-grid-4 > .octo-card:nth-child(1) .octo-card-p","key":"octo_smart_g1_p"},
        {"selector":"#smarte-tarife .octo-grid-4 > .octo-card:nth-child(1) .octo-btn-outline","key":"octo_smart_g1_btn"},
        {"selector":"#smarte-tarife .octo-grid-4 > .octo-card:nth-child(2) .octo-card-h3","key":"octo_smart_g2_h3"},
        {"selector":"#smarte-tarife .octo-grid-4 > .octo-card:nth-child(2) .octo-card-p","key":"octo_smart_g2_p"},
        {"selector":"#smarte-tarife .octo-grid-4 > .octo-card:nth-child(2) .octo-btn-outline","key":"octo_smart_g2_btn"},
        {"selector":"#smarte-tarife .octo-grid-4 > .octo-card:nth-child(3) .octo-card-h3","key":"octo_smart_g3_h3"},
        {"selector":"#smarte-tarife .octo-grid-4 > .octo-card:nth-child(3) .octo-card-p","key":"octo_smart_g3_p"},
        {"selector":"#smarte-tarife .octo-grid-4 > .octo-card:nth-child(3) .octo-btn-outline","key":"octo_smart_g3_btn"},
        {"selector":"#smarte-tarife .octo-grid-4 > .octo-card:nth-child(4) .octo-card-h3","key":"octo_smart_g4_h3"},
        {"selector":"#smarte-tarife .octo-grid-4 > .octo-card:nth-child(4) .octo-card-p","key":"octo_smart_g4_p"},
        {"selector":"#smarte-tarife .octo-grid-4 > .octo-card:nth-child(4) .octo-btn-outline","key":"octo_smart_g4_btn"},
        {"selector":"#heizen-speichern .octo-split-device-card:not(.reverse) .octo-card-h3, #heizen-speichern .octo-split-card:nth-of-type(1) .octo-card-h3","key":"octo_heizen_c1_h3"},
        {"selector":"#heizen-speichern .octo-split-device-card:not(.reverse) .octo-card-p, #heizen-speichern .octo-split-card:nth-of-type(1) .octo-card-p","key":"octo_heizen_c1_p"},
        {"selector":"#heizen-speichern .octo-split-device-card:not(.reverse) .octo-check-list li:nth-child(1) > span:last-child, #heizen-speichern .octo-split-card:nth-of-type(1) .octo-check-list li:nth-child(1) > span:last-child","key":"octo_heizen_c1_li1"},
        {"selector":"#heizen-speichern .octo-split-device-card:not(.reverse) .octo-check-list li:nth-child(2) > span:last-child, #heizen-speichern .octo-split-card:nth-of-type(1) .octo-check-list li:nth-child(2) > span:last-child","key":"octo_heizen_c1_li2"},
        {"selector":"#heizen-speichern .octo-split-device-card:not(.reverse) .octo-check-list li:nth-child(3) > span:last-child, #heizen-speichern .octo-split-card:nth-of-type(1) .octo-check-list li:nth-child(3) > span:last-child","key":"octo_heizen_c1_li3"},
        {"selector":"#heizen-speichern .octo-split-device-card:not(.reverse) .octo-btn-cta, #heizen-speichern .octo-split-card:nth-of-type(1) .octo-btn-cta","key":"octo_heizen_c1_btn"},
        {"selector":"#heizen-speichern .octo-split-device-card.reverse .octo-card-h3, #heizen-speichern .octo-split-card:nth-of-type(2) .octo-card-h3","key":"octo_heizen_c2_h3"},
        {"selector":"#heizen-speichern .octo-split-device-card.reverse .octo-card-p, #heizen-speichern .octo-split-card:nth-of-type(2) .octo-card-p","key":"octo_heizen_c2_p"},
        {"selector":"#heizen-speichern .octo-split-device-card.reverse .octo-btn-cta, #heizen-speichern .octo-split-card:nth-of-type(2) .octo-btn-cta","key":"octo_heizen_c2_btn1"},
        {"selector":"#heizen-speichern .octo-split-device-card.reverse .octo-btn-outline, #heizen-speichern .octo-split-card:nth-of-type(2) .octo-btn-outline","key":"octo_heizen_c2_btn2"},
        {"selector":"#innovation .octo-grid-3 > .octo-card:nth-child(1) .octo-card-h3","key":"octo_inno_c1_h3"},
        {"selector":"#innovation .octo-grid-3 > .octo-card:nth-child(1) .octo-card-p","key":"octo_inno_c1_p"},
        {"selector":"#innovation .octo-grid-3 > .octo-card:nth-child(1) .octo-btn-cta","key":"octo_inno_c1_btn"},
        {"selector":"#innovation .octo-grid-3 > .octo-card:nth-child(2) .octo-card-h3","key":"octo_inno_c2_h3"},
        {"selector":"#innovation .octo-grid-3 > .octo-card:nth-child(2) .octo-card-p","key":"octo_inno_c2_p"},
        {"selector":"#innovation .octo-grid-3 > .octo-card:nth-child(2) .octo-btn-cta","key":"octo_inno_c2_btn"},
        {"selector":"#innovation .octo-grid-3 > .octo-card:nth-child(3) .octo-card-h3","key":"octo_inno_c3_h3"},
        {"selector":"#innovation .octo-grid-3 > .octo-card:nth-child(3) .octo-card-p","key":"octo_inno_c3_p"},
        {"selector":"#innovation .octo-grid-3 > .octo-card:nth-child(3) .octo-btn-cta","key":"octo_inno_c3_btn"},
        {"selector":"#stromkennzeichnung > .octo-container > div:nth-child(1) > span","key":"octo_sk_badge"},
        {"selector":"#stromkennzeichnung > .octo-container > div:nth-child(1) > .octo-section-h2","key":"octo_sk_h2"},
        {"selector":"#stromkennzeichnung > .octo-container > div:nth-child(1) > .octo-section-sub","key":"octo_sk_sub"},
        {"selector":"#stromkennzeichnung .octo-bento-2-1 > .octo-card:nth-child(1) .octo-card-h3, #stromkennzeichnung .octo-bento-1-2 > .octo-card:nth-child(1) .octo-card-h3","key":"octo_sk_left_h3"},
        {"selector":"#stromkennzeichnung button[onclick*=\"openStromkennzeichnungCanvasPng\"]","key":"octo_sk_left_btn"},
        {"selector":"#stromkennzeichnung .octo-bento-2-1 > .octo-card:nth-child(1) p, #stromkennzeichnung .octo-bento-1-2 > .octo-card:nth-child(1) p","key":"octo_sk_left_note"},
        {"selector":"#stromkennzeichnung .octo-bento-2-1 > div:nth-child(2) > .octo-card:nth-child(1) .octo-card-h3, #stromkennzeichnung .octo-bento-1-2 > div:nth-child(2) > .octo-card:nth-child(1) .octo-card-h3","key":"octo_sk_right1_h3"},
        {"selector":"#stromkennzeichnung table thead th:nth-child(1)","key":"octo_sk_th1"},
        {"selector":"#stromkennzeichnung table thead th:nth-child(2)","key":"octo_sk_th2"},
        {"selector":"#stromkennzeichnung table thead th:nth-child(3)","key":"octo_sk_th3"},
        {"selector":"#stromkennzeichnung table tbody tr:nth-child(1) td:nth-child(1)","key":"octo_sk_r1_c1"},
        {"selector":"#stromkennzeichnung table tbody tr:nth-child(2) td:nth-child(1)","key":"octo_sk_r2_c1"},
        {"selector":"#stromkennzeichnung table tbody tr:nth-child(3) td:nth-child(1)","key":"octo_sk_r3_c1"},
        {"selector":"#stromkennzeichnung table tbody tr:nth-child(4) td:nth-child(1)","key":"octo_sk_r4_c1"},
        {"selector":"#stromkennzeichnung table tbody tr:nth-child(5) td:nth-child(1)","key":"octo_sk_r5_c1"},
        {"selector":"#stromkennzeichnung table tbody tr:nth-child(7) td:nth-child(1)","key":"octo_sk_r7_c1"},
        {"selector":"#stromkennzeichnung .octo-bento-2-1 > div:nth-child(2) > .octo-card:nth-child(1) > div:nth-child(3)","key":"octo_sk_countries_box","isHtml":true},
        {"selector":"#about .octo-about-media-card > div:nth-child(2) > span:nth-child(1)","key":"octo_about_vpill1","isHtml":true},
        {"selector":"#about .octo-about-media-card > div:nth-child(2) > span:nth-child(2)","key":"octo_about_vpill2","isHtml":true},
        {"selector":"#about .octo-about-media-card > div:nth-child(2) > span:nth-child(3)","key":"octo_about_vpill3","isHtml":true},
        {"selector":".octo-footer-links-cloud a[href=\"#stromkennzeichnung\"]","key":"octo_fc_sk"},
        {"selector":".octo-hero-trust-list .octo-hero-trust-item:nth-child(1) > span:nth-child(2)","key":"hero_trust_li1","isHtml":true},
        {"selector":".octo-hero-trust-list .octo-hero-trust-item:nth-child(2) > span:nth-child(2)","key":"hero_trust_li2","isHtml":true},
        {"selector":".octo-hero-trust-list .octo-hero-trust-item:nth-child(3) > span:nth-child(2)","key":"hero_trust_li3","isHtml":true},
        {"selector":"#stromkennzeichnung table tbody tr:nth-child(6) td:nth-child(1)","key":"octo_sk_r6_c1"},
        {"selector":"#stromkennzeichnung .octo-bento-2-1 > div:nth-child(2) > .octo-card:nth-child(1) p, #stromkennzeichnung .octo-bento-1-2 > div:nth-child(2) > .octo-card:nth-child(1) p","key":"octo_sk_right1_note"},
        {"selector":"#stromkennzeichnung .octo-bento-2-1 > div:nth-child(2) > .octo-card:nth-child(2) .octo-card-h3, #stromkennzeichnung .octo-bento-1-2 > div:nth-child(2) > .octo-card:nth-child(2) .octo-card-h3","key":"octo_sk_right2_h3"},
        {"selector":"#stromkennzeichnung .octo-bento-2-1 > div:nth-child(2) > .octo-card:nth-child(2) .octo-card-p, #stromkennzeichnung .octo-bento-1-2 > div:nth-child(2) > .octo-card:nth-child(2) .octo-card-p","key":"octo_sk_right2_p"},
        {"selector":"#stromkennzeichnung a[href*=\"oekostrom.html\"]","key":"octo_sk_right2_btn1"},
        {"selector":"#stromkennzeichnung a[href*=\"oekogas.html\"]","key":"octo_sk_right2_btn2"},
        {"selector":"#about .octo-section-h2","key":"octo_about_h2"},
        {"selector":"#about .octo-section-sub","key":"octo_about_sub"},
        {"selector":"#introVideoSoundLabel","key":"octo_video_sound_on"},
        {"selector":".video-flow-steps-bar .video-step-item[data-video-step=\"1\"] .video-step-title","key":"octo_vstep1_title"},
        {"selector":".video-flow-steps-bar .video-step-item[data-video-step=\"1\"] .video-step-sub","key":"octo_vstep1_sub"},
        {"selector":".video-flow-steps-bar .video-step-item[data-video-step=\"2\"] .video-step-title","key":"octo_vstep2_title"},
        {"selector":".video-flow-steps-bar .video-step-item[data-video-step=\"2\"] .video-step-sub","key":"octo_vstep2_sub"},
        {"selector":".video-flow-steps-bar .video-step-item[data-video-step=\"3\"] .video-step-title","key":"octo_vstep3_title"},
        {"selector":".video-flow-steps-bar .video-step-item[data-video-step=\"3\"] .video-step-sub","key":"octo_vstep3_sub"},
        {"selector":"#about .octo-about-media-card > div:nth-child(3) > div:first-child > div:nth-child(1), #about .octo-bento-1-2 > .octo-card:nth-child(1) > div:last-child > div:first-child > div:nth-child(1)","key":"octo_video_hq_title"},
        {"selector":"#about .octo-about-media-card > div:nth-child(3) > div:first-child > div:nth-child(2), #about .octo-bento-1-2 > .octo-card:nth-child(1) > div:last-child > div:first-child > div:nth-child(2)","key":"octo_video_hq_sub"},
        {"selector":"#about .octo-about-media-card > div:nth-child(3) > a, #about .octo-bento-1-2 > .octo-card:nth-child(1) > div:last-child > a","key":"octo_video_hq_link"},
        {"selector":".octo-about-stack .octo-about-item:nth-child(1) .octo-card-h3, .octo-about-stack .octo-about-item:nth-child(1) .octo-about-h3","key":"octo_about_i1_h3"},
        {"selector":".octo-about-stack .octo-about-item:nth-child(1) .octo-card-p, .octo-about-stack .octo-about-item:nth-child(1) .octo-about-p","key":"octo_about_i1_p"},
        {"selector":".octo-about-stack .octo-about-item:nth-child(2) .octo-card-h3, .octo-about-stack .octo-about-item:nth-child(2) .octo-about-h3","key":"octo_about_i2_h3"},
        {"selector":".octo-about-stack .octo-about-item:nth-child(2) .octo-card-p, .octo-about-stack .octo-about-item:nth-child(2) .octo-about-p","key":"octo_about_i2_p"},
        {"selector":".octo-about-stack .octo-about-item:nth-child(3) .octo-card-h3, .octo-about-stack .octo-about-item:nth-child(3) .octo-about-h3","key":"octo_about_i3_h3"},
        {"selector":".octo-about-stack .octo-about-item:nth-child(3) .octo-card-p, .octo-about-stack .octo-about-item:nth-child(3) .octo-about-p","key":"octo_about_i3_p"},
        {"selector":".octo-about-stack .octo-about-item .octo-about-link","key":"octo_about_more_link","all":true},
        {"selector":"#alphaversum .octo-grid-3 > .octo-card:nth-child(1) .octo-card-h3","key":"octo_alpha_c1_h3"},
        {"selector":"#alphaversum .octo-grid-3 > .octo-card:nth-child(1) .octo-card-p","key":"octo_alpha_c1_p"},
        {"selector":"#alphaversum .octo-grid-3 > .octo-card:nth-child(1) .octo-btn-solid-orange, #alphaversum .octo-grid-3 > .octo-card:nth-child(1) .octo-btn-cta","key":"octo_alpha_c1_btn"},
        {"selector":"#alphaversum .octo-grid-3 > .octo-card:nth-child(2) .octo-card-h3","key":"octo_alpha_c2_h3"},
        {"selector":"#alphaversum .octo-grid-3 > .octo-card:nth-child(2) .octo-card-p","key":"octo_alpha_c2_p"},
        {"selector":"#alphaversum .octo-grid-3 > .octo-card:nth-child(2) .octo-btn-solid-orange, #alphaversum .octo-grid-3 > .octo-card:nth-child(2) .octo-btn-cta","key":"octo_alpha_c2_btn"},
        {"selector":"#alphaversum .octo-grid-3 > .octo-card:nth-child(3) .octo-card-h3","key":"octo_alpha_c3_h3"},
        {"selector":"#alphaversum .octo-grid-3 > .octo-card:nth-child(3) .octo-card-p","key":"octo_alpha_c3_p"},
        {"selector":"#alphaversum .octo-grid-3 > .octo-card:nth-child(3) .octo-btn-solid-orange, #alphaversum .octo-grid-3 > .octo-card:nth-child(3) .octo-btn-cta","key":"octo_alpha_c3_btn"},
        {"selector":"section.octo-band-mid:last-of-type .octo-section-h2","key":"octo_bottom_h2"},
        {"selector":"section.octo-band-mid:last-of-type .octo-section-sub","key":"octo_bottom_sub"},
        {"selector":"section.octo-band-mid:last-of-type .octo-mascot-speech-tag","key":"octo_bottom_mascot_tag"},
        {"selector":"section.octo-band-mid:last-of-type .octo-mascot-speech-text","key":"octo_bottom_mascot_text"},
        {"selector":".octo-bottom-offer-box .octo-card-h3","key":"octo_bottom_box_h3"},
        {"selector":".octo-bottom-offer-box .octo-card-p","key":"octo_bottom_box_p"},
        {"selector":"#bottomOfferBranch option[value=\"strom\"], #subOfferBranch option[value=\"strom\"]","key":"octo_bottom_opt_strom","all":true},
        {"selector":"#bottomOfferBranch option[value=\"gas\"], #subOfferBranch option[value=\"gas\"]","key":"octo_bottom_opt_gas","all":true},
        {"selector":".octo-bottom-offer-btn","key":"octo_bottom_btn","all":true},
        {"selector":"#main-footer .octo-contact-row:nth-child(1) > div:nth-child(2) > div:first-child","key":"octo_footer_row1_label"},
        {"selector":"#main-footer .octo-contact-row:nth-child(2) > div:nth-child(2) > div:first-child","key":"octo_footer_row2_label"},
        {"selector":"#main-footer .octo-contact-row:nth-child(3) > div:nth-child(2) > div:first-child","key":"octo_footer_row3_label"},
        {"selector":"#main-footer .octo-contact-row:nth-child(3) .octo-contact-link","key":"octo_footer_row3_link"},
        {"selector":"#main-footer .octo-contact-row:nth-child(4) > div:nth-child(2) > div:first-child","key":"octo_footer_row4_label"},
        {"selector":"#main-footer .octo-contact-row:nth-child(4) .octo-contact-link","key":"octo_footer_row4_link"},
        {"selector":".octo-footer-mascot-aside .octo-mascot-pill","key":"octo_footer_team_pill"},
        {"selector":"#main-footer .octo-footer-card:nth-child(1) > p","key":"octo_footer_dortmund_p","isHtml":true},
        {"selector":"#octoNewsletterForm label > span","key":"octo_news_consent","isHtml":true},
        {"selector":"#octoNewsletterForm button[type=\"submit\"]","key":"octo_news_btn"},
        {"selector":"#octoNewsSuccess","key":"octo_news_success"},
        {"selector":".octo-footer-links-cloud a[href=\"impressum.html\"]","key":"octo_fc_impressum"},
        {"selector":".octo-footer-links-cloud a[href=\"datenschutz.html\"]","key":"octo_fc_datenschutz"},
        {"selector":".octo-footer-links-cloud a[href=\"cookie-einstellungen.html\"]","key":"octo_fc_cookie_set"},
        {"selector":".octo-footer-links-cloud a[href=\"cookie-richtlinie.html\"]","key":"octo_fc_cookie_pol"},
        {"selector":".octo-footer-links-cloud a[href=\"oekostrom.html\"]","key":"octo_fc_strom"},
        {"selector":".octo-footer-links-cloud a[href=\"oekogas.html\"]","key":"octo_fc_gas"},
        {"selector":".octo-footer-links-cloud a[href=\"gewerbekunden.html\"]","key":"octo_fc_b2b"},
        {"selector":".octo-footer-links-cloud a[href*=\"#rechner\"]","key":"octo_fc_calc"},
        {"selector":".octo-footer-links-cloud a[href=\"nachhaltigkeit-co2.html\"]","key":"octo_fc_co2"},
        {"selector":".octo-footer-links-cloud a[href=\"ueber-uns.html\"]","key":"octo_fc_who"},
        {"selector":".octo-footer-links-cloud a[href=\"partner-werden.html\"]","key":"octo_fc_vp"},
        {"selector":".octo-footer-links-cloud a[href=\"karriere.html\"]","key":"octo_fc_jobs"},
        {"selector":".octo-footer-links-cloud a[href=\"service.html\"]","key":"octo_fc_faq"},
        {"selector":".octo-footer-links-cloud a[href=\"kontakt.html\"]","key":"octo_fc_contact"},
        {"selector":".octo-footer-links-cloud a[href=\"vertriebspartner-portal.html\"], .octo-footer-links-cloud a[href=\"https://vp.alpha-energie.de\"]","key":"octo_fc_login"},
        {"selector":".octo-footer-bottom > div:first-child > div:nth-child(1) > span, .octo-footer-bottom > div:first-child > span","key":"octo_footer_copy"},
        {"selector":".octo-footer-bottom > div:first-child > div:nth-child(2)","key":"octo_footer_firstcon","isHtml":true},
        {"selector":"#modalStep1 > div:first-child > div:last-child > div:nth-child(1) > span:first-child","key":"modal_sum_monthly_label"},
        {"selector":"#modalStep1 > div:first-child > div:last-child > div:nth-child(2) > span:first-child","key":"modal_sum_kwh_label"},
        {"selector":"label[for=\"modalCalcPlz\"]","key":"modal_inline_plz_label"},
        {"selector":"label[for=\"modalCalcKwh\"]","key":"modal_inline_kwh_label"},
        {"selector":"#modalStep1ValidationMsg","key":"modal_inline_val_msg"},
        {"selector":"label[for=\"orderCustomDate\"]","key":"modal_order_custom_date"},
        {"selector":"#modalStep2 > div:first-child > p","key":"modal_step2_intro"},
        {"selector":"#orderMeterNumber + span","key":"modal_meter_hint"},
        {"selector":"#modalStep3 > div:last-child","key":"modal_ssl_note"},
        {"selector":"#cancelModeTabKuendigung","key":"cancel_tab_kuendigung"},
        {"selector":"#cancelModeTabWiderruf","key":"cancel_tab_widerruf"},
        {"selector":"#formLegalCancel > div:nth-of-type(1) > div:first-child","key":"cancel_sec1_title"},
        {"selector":"label[for=\"cancelSparenType\"]","key":"cancel_sparte_label"},
        {"selector":"#cancelSparenType option[value=\"Strom\"]","key":"cancel_opt_strom"},
        {"selector":"#cancelSparenType option[value=\"Erdgas\"]","key":"cancel_opt_gas"},
        {"selector":"#cancelSparenType option[value=\"Strom & Erdgas\"]","key":"cancel_opt_both"},
        {"selector":"label[for=\"cancelMeterNumber\"]","key":"cancel_meter_opt_label"},
        {"selector":"#cancelOnlyFields > div:first-child","key":"cancel_sec2_title"},
        {"selector":"label[for=\"cancelTerminationType\"]","key":"cancel_type_label"},
        {"selector":"#cancelTerminationType option[value=\"ordentlich\"]","key":"cancel_type_ord"},
        {"selector":"#cancelTerminationType option[value=\"sonderkuendigung\"]","key":"cancel_type_sonder"},
        {"selector":"label[for=\"cancelReason\"]","key":"cancel_reason_sonder_label"},
        {"selector":"#cancelReason option[value=\"\"]","key":"cancel_reason_opt0"},
        {"selector":"#cancelReason option[value*=\"Umzug\"]","key":"cancel_reason_opt1"},
        {"selector":"#cancelReason option[value*=\"Preisanpassung\"]","key":"cancel_reason_opt2"},
        {"selector":"#cancelReason option[value*=\"Todesfall\"]","key":"cancel_reason_opt3"},
        {"selector":"#cancelReason option[value*=\"Sonstiger\"]","key":"cancel_reason_opt4"},
        {"selector":"label[for=\"cancelDateType\"]","key":"cancel_when_label"},
        {"selector":"#cancelDateType option[value=\"naechstmoeglich\"]","key":"cancel_when_soon"},
        {"selector":"#cancelDateType option[value=\"wunschdatum\"]","key":"cancel_when_date"},
        {"selector":"label[for=\"cancelCustomDate\"]","key":"cancel_custom_date_label"},
        {"selector":"#revokeOnlyFields > div:first-child","key":"revoke_sec2_title"},
        {"selector":"label[for=\"revokeOrderDate\"]","key":"revoke_date_label"},
        {"selector":"label[for=\"revokeReason\"]","key":"revoke_reason_label"},
        {"selector":"#formLegalCancel > div:nth-of-type(4) > div:first-child","key":"cancel_sec3_title"},
        {"selector":"label[for=\"cancelStreet\"]","key":"cancel_street_label"},
        {"selector":"label[for=\"cancelPlz\"]","key":"cancel_plz_label"},
        {"selector":"label[for=\"cancelCity\"]","key":"cancel_city_label"},
        {"selector":"label[for=\"cancelPhone\"]","key":"cancel_phone_label"},
        {"selector":"#cancelConfirmationTitle","key":"cancel_conf_title"},
        {"selector":"#cancelConfirmationSub","key":"cancel_conf_sub"},
        {"selector":"#btnDownloadCancelPdf","key":"cancel_btn_pdf","hasSvgPrefix":true},
        {"selector":"#btnCloseCancelConfirmation","key":"cancel_btn_close"}
    ];

    const PLACEHOLDER_MAPPINGS = [
        {
                "selector": "#calcPlz",
                "key": "ph_calc_plz"
        },
        {
                "selector": "#calcAbschlag",
                "key": "ph_calc_abschlag"
        },
        {
                "selector": "#bottomOfferPlz, #subOfferPlz",
                "key": "ph_bottom_plz"
        },
        {
                "selector": "#octoNewsEmail",
                "key": "ph_news_email"
        },
        {
                "selector": "#octoNewsName",
                "key": "ph_news_name"
        }
];

    let currentLang = 'de';
    let originalDocumentTitle = '';

    /**
     * Cache the original German text or innerHTML of an element
     * Preserves leading <svg> icons and any .ai-media-info-btn badge child.
     */
    function cacheOriginal(el, hasSvgPrefix) {
        if (!el) return;
        if (el.dataset.i18nOriginal === undefined) {
            const clone = el.cloneNode(true);
            const aiBtn = clone.querySelector('.ai-media-info-btn');
            if (aiBtn) aiBtn.remove();

            if (hasSvgPrefix) {
                const svg = clone.querySelector('svg');
                if (svg) {
                    el.dataset.i18nSvgHtml = svg.outerHTML;
                    svg.remove();
                    const spanChild = clone.querySelector('span');
                    el.dataset.i18nHasSpanWrap = spanChild ? 'true' : 'false';
                    el.dataset.i18nOriginal = clone.textContent.trim();
                } else {
                    el.dataset.i18nOriginal = clone.innerHTML;
                }
            } else {
                el.dataset.i18nOriginal = clone.innerHTML;
            }
        }
    }

    /**
     * Apply translation or restore German original to a single DOM element
     */
    function applyMappingToElement(el, mapping, lang) {
        if (!el) return;
        cacheOriginal(el, mapping.hasSvgPrefix);

        // Preserve any attached AI transparency button inside the element
        const liveAiBtn = el.querySelector('.ai-media-info-btn');

        if (lang === 'de') {
            if (mapping.hasSvgPrefix && el.dataset.i18nSvgHtml) {
                if (el.dataset.i18nHasSpanWrap === 'true') {
                    el.innerHTML = el.dataset.i18nSvgHtml + ' <span>' + (el.dataset.i18nOriginal || '') + '</span>';
                } else {
                    el.innerHTML = el.dataset.i18nSvgHtml + ' ' + (el.dataset.i18nOriginal || '');
                }
            } else {
                el.innerHTML = el.dataset.i18nOriginal;
            }
        } else {
            const trans = I18N_DATA[lang] ? I18N_DATA[lang][mapping.key] : undefined;
            if (trans !== undefined) {
                if (mapping.hasSvgPrefix && el.dataset.i18nSvgHtml) {
                    if (el.dataset.i18nHasSpanWrap === 'true') {
                        el.innerHTML = el.dataset.i18nSvgHtml + ' <span>' + trans + '</span>';
                    } else {
                        el.innerHTML = el.dataset.i18nSvgHtml + ' ' + trans;
                    }
                } else if (mapping.isHtml) {
                    el.innerHTML = trans;
                } else {
                    el.textContent = trans;
                }
            }
        }

        if (liveAiBtn && !el.contains(liveAiBtn)) {
            el.appendChild(liveAiBtn);
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

        if (!originalDocumentTitle && document.title) {
            originalDocumentTitle = document.title;
        }

        // 1. Update HTML lang attribute & document title
        document.documentElement.lang = lang;
        if (lang === 'de') {
            document.title = originalDocumentTitle || 'Alpha Energie | 100% Ökostrom & Gastarife deutschlandweit';
        } else if (I18N_DATA[lang] && I18N_DATA[lang].page_title) {
            document.title = I18N_DATA[lang].page_title;
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

        // 4. Apply translations to all mapped selectors (supports single or all matches)
        SELECTOR_MAPPINGS.forEach(mapping => {
            if (mapping.all) {
                document.querySelectorAll(mapping.selector).forEach(el => applyMappingToElement(el, mapping, lang));
            } else {
                const el = document.querySelector(mapping.selector);
                if (el) applyMappingToElement(el, mapping, lang);
            }
        });

        // 5. Apply mapped input placeholders
        PLACEHOLDER_MAPPINGS.forEach(pm => {
            document.querySelectorAll(pm.selector).forEach(el => {
                if (el.dataset.i18nOriginalPlaceholder === undefined) {
                    el.dataset.i18nOriginalPlaceholder = el.placeholder || '';
                }
                if (lang === 'de') {
                    el.placeholder = el.dataset.i18nOriginalPlaceholder;
                } else if (I18N_DATA[lang] && I18N_DATA[lang][pm.key] !== undefined) {
                    el.placeholder = I18N_DATA[lang][pm.key];
                }
            });
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

        // 7. Support input placeholders via data-i18n-placeholder
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

        // 10. Re-ensure AI transparency info badges if present
        if (typeof window.initAiMediaInfoBadges === 'function') {
            window.initAiMediaInfoBadges();
        }

        // 11. Dispatch languageChanged custom event
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
                    noticeEl.textContent = 'Wärmepumpe (§ 14a EnWG) & Nachtspeicherheizung (HT/NT) • 100 % Ökostrom mit bis zu 24M Preisgarantie';
                } else if (branch === 'gas') {
                    noticeEl.textContent = 'Erdgas mit freiwilligem Klimaschutzbeitrag • 24 Monate volle Preisgarantie';
                } else {
                    noticeEl.textContent = noticeEl.dataset.i18nOriginal || 'Ökostrom aus 100 % erneuerbaren Energien • Geprüft nach ok-power Kriterien';
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
            if (branch === 'waerme') return 'Wärmepumpe (§ 14a EnWG) & Nachtspeicherheizung (HT/NT) • 100 % Ökostrom mit bis zu 24M Preisgarantie';
            if (branch === 'gas') return 'Erdgas mit freiwilligem Klimaschutzbeitrag • 24 Monate volle Preisgarantie';
            return 'Ökostrom aus 100 % erneuerbaren Energien • 24 Monate volle Preisgarantie';
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
    function formatKwhDesc(kwh, ctPerKwh, basePriceEur, lang) {
        const l = lang || currentLang;
        const locale = l === 'en' ? 'en-US' : (l === 'tr' ? 'tr-TR' : 'de-DE');
        const kwhFormatted = Number(kwh).toLocaleString(locale);
        const ctFormatted = l === 'en' ? ctPerKwh.toFixed(2) : ctPerKwh.toFixed(2).replace('.', ',');
        const unit = l === 'en' ? 'kWh/year' : (l === 'tr' ? 'kWh/yıl' : (l === 'ar' ? 'ك.و.س/سنة' : 'kWh/Jahr'));
        if (typeof basePriceEur === 'number' && !isNaN(basePriceEur)) {
            const baseFormatted = l === 'en' ? basePriceEur.toFixed(2) : basePriceEur.toFixed(2).replace('.', ',');
            const baseLabel = l === 'en' ? '€/mo base price' : (l === 'tr' ? '€/ay sabit ücret' : (l === 'ar' ? '€ رسوم أساسية/شهر' : '€ Grundpreis'));
            return `${kwhFormatted} ${unit} • ${ctFormatted} ct/kWh • ${baseFormatted} ${baseLabel}`;
        }
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
            if (mapping.all) {
                document.querySelectorAll(mapping.selector).forEach(el => cacheOriginal(el, mapping.hasSvgPrefix));
            } else {
                const el = document.querySelector(mapping.selector);
                if (el) cacheOriginal(el, mapping.hasSvgPrefix);
            }
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
