/**
 * AlphaTarife In-House Partner Portal (partner-portal.js)
 * Supports D2D Sales Reps, Affiliate Marketers, Tippgeber, and Agencies/Downlines
 * Plus Remote Customer eSign (?sign=TOKEN)
 */
(function () {
    'use strict';

    const STORAGE_TOKEN_KEY = 'alpha_partner_jwt';
    const STORAGE_USER_KEY = 'alpha_partner_user';

    let currentToken = localStorage.getItem(STORAGE_TOKEN_KEY) || null;
    let currentPartner = null;
    let dashboardData = null;
    let d2dCalculatedTariffs = [];
    let selectedD2dTariff = null;

    try {
        const savedUser = localStorage.getItem(STORAGE_USER_KEY);
        if (savedUser) currentPartner = JSON.parse(savedUser);
    } catch (e) {}

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatEur(val) {
        const num = Number(val || 0);
        return num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }

    function formatDate(d) {
        if (!d) return '-';
        try {
            return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (e) {
            return '-';
        }
    }

    function roleLabel(role) {
        const map = {
            D2D: 'D2D Außendienst',
            AFFILIATE: 'Affiliate / Online',
            TIPPGEBER: 'Tippgeber',
            AGENCY: 'Vertriebsagentur'
        };
        return map[String(role || '').toUpperCase()] || role || 'Partner';
    }

    function statusBadgeHtml(status) {
        const s = String(status || '').toUpperCase();
        const map = {
            RECEIVED: { bg: '#e0f2fe', color: '#0369a1', label: 'Eingegangen' },
            PENDING_SIGNATURE: { bg: '#fef3c7', color: '#b45309', label: 'Wartet auf eSign' },
            AWAITING_SIGNATURE: { bg: '#fef3c7', color: '#b45309', label: 'Wartet auf eSign' },
            PROCESSING: { bg: '#ede9fe', color: '#6d28d9', label: 'In Bearbeitung' },
            CONFIRMED: { bg: '#dcfce7', color: '#15803d', label: 'VNB Bestätigt' },
            IN_DELIVERY: { bg: '#d1fae5', color: '#047857', label: '⚡ In Belieferung' },
            CLARIFICATION: { bg: '#fef3c7', color: '#b45309', label: '⚠️ Klärfall' },
            PAID: { bg: '#d1fae5', color: '#047857', label: 'Abgerechnet / Bezahlt' },
            APPROVED: { bg: '#dcfce7', color: '#15803d', label: 'Freigegeben' },
            PENDING: { bg: '#fef3c7', color: '#b45309', label: 'Vorgemerkt' },
            CANCELLED: { bg: '#fee2e2', color: '#b91c1c', label: 'Storniert' },
            NEW: { bg: '#e0f2fe', color: '#0369a1', label: 'Neu' },
            CONTACTED: { bg: '#fef3c7', color: '#b45309', label: 'Kontaktiert' },
            QUALIFIED: { bg: '#dcfce7', color: '#15803d', label: 'Qualifiziert' },
            CONVERTED: { bg: '#d1fae5', color: '#047857', label: 'Abgeschlossen' }
        };
        const item = map[s] || { bg: '#f1f5f9', color: '#475569', label: s || '-' };
        return `<span style="display:inline-block;padding:3px 9px;border-radius:999px;font-size:0.76rem;font-weight:700;background:${item.bg};color:${item.color};white-space:nowrap;">${escapeHtml(item.label)}</span>`;
    }

    // Interactive Signature Pad Helper (Mouse + Touch)
    function createSignaturePad(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        let drawing = false;
        let hasStrokes = false;

        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            const width = Math.max(260, Math.floor(rect.width || 420));
            const height = 160;
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = '#0a1f44';
                ctx.lineWidth = 2.4;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                hasStrokes = false;
            }
        }
        resizeCanvas();

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (canvas.width / (rect.width || canvas.width)),
                y: (clientY - rect.top) * (canvas.height / (rect.height || canvas.height))
            };
        }

        function start(e) {
            e.preventDefault();
            drawing = true;
            hasStrokes = true;
            const p = getPos(e);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
        }

        function move(e) {
            if (!drawing) return;
            e.preventDefault();
            const p = getPos(e);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        }

        function stop() {
            drawing = false;
        }

        canvas.addEventListener('mousedown', start);
        canvas.addEventListener('mousemove', move);
        window.addEventListener('mouseup', stop);
        canvas.addEventListener('touchstart', start, { passive: false });
        canvas.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('touchend', stop);

        return {
            clear() {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = '#0a1f44';
                ctx.lineWidth = 2.4;
                hasStrokes = false;
            },
            isEmpty() {
                return !hasStrokes;
            },
            toDataURL() {
                if (!hasStrokes) return null;
                return canvas.toDataURL('image/png');
            },
            markSignedForTest() {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = '#0a1f44';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(25, 95);
                ctx.quadraticCurveTo(95, 35, 175, 95);
                ctx.stroke();
                hasStrokes = true;
            }
        };
    }

    // Visual QR-Code Generator on Canvas (Deterministic visual pattern + label)
    function renderQrCanvas(canvasEl, urlText, partnerCode) {
        if (!canvasEl) return;
        const size = 180;
        canvasEl.width = size;
        canvasEl.height = size;
        const ctx = canvasEl.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        const cells = 21;
        const pad = 12;
        const cellSize = Math.floor((size - pad * 2) / cells);

        function drawFinder(r0, c0) {
            ctx.fillStyle = '#0a1f44';
            ctx.fillRect(pad + c0 * cellSize, pad + r0 * cellSize, 7 * cellSize, 7 * cellSize);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(pad + (c0 + 1) * cellSize, pad + (r0 + 1) * cellSize, 5 * cellSize, 5 * cellSize);
            ctx.fillStyle = '#ff7a00';
            ctx.fillRect(pad + (c0 + 2) * cellSize, pad + (r0 + 2) * cellSize, 3 * cellSize, 3 * cellSize);
        }

        drawFinder(0, 0);
        drawFinder(0, cells - 7);
        drawFinder(cells - 7, 0);

        let hash = 2166136261;
        const str = String(urlText || partnerCode || 'ALPHA');
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }

        ctx.fillStyle = '#0a1f44';
        for (let r = 0; r < cells; r++) {
            for (let c = 0; c < cells; c++) {
                const inTopLeft = r < 8 && c < 8;
                const inTopRight = r < 8 && c >= cells - 8;
                const inBotLeft = r >= cells - 8 && c < 8;
                if (inTopLeft || inTopRight || inBotLeft) continue;
                const bit = ((hash >>> ((r * 7 + c * 13) % 28)) ^ (r * 31 + c * 17)) & 1;
                if (bit) {
                    ctx.fillRect(pad + c * cellSize, pad + r * cellSize, cellSize - 0.5, cellSize - 0.5);
                }
            }
        }
    }

    // Live IBAN Input Validator binding
    function bindLiveIbanCheck(inputId, badgeId, bicInputId, bankInputId) {
        const input = document.getElementById(inputId);
        const badge = document.getElementById(badgeId);
        if (!input) return;
        let timer = null;
        input.addEventListener('input', () => {
            clearTimeout(timer);
            const raw = input.value.replace(/\s+/g, '').toUpperCase();
            if (raw.length < 15) {
                if (badge) {
                    badge.textContent = '';
                    badge.style.display = 'none';
                }
                input.style.borderColor = '';
                return;
            }
            timer = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/verify-iban?iban=${encodeURIComponent(raw)}`);
                    const data = await res.json();
                    if (data && data.valid) {
                        input.style.borderColor = '#16a34a';
                        if (badge) {
                            badge.style.display = 'block';
                            badge.style.color = '#15803d';
                            badge.textContent = `✓ IBAN gültig${data.bankName ? ' • ' + data.bankName : ''}${data.bic ? ' (' + data.bic + ')' : ''}`;
                        }
                        if (bicInputId && data.bic) {
                            const bicEl = document.getElementById(bicInputId);
                            if (bicEl && !bicEl.value) bicEl.value = data.bic;
                        }
                        if (bankInputId && data.bankName) {
                            const bankEl = document.getElementById(bankInputId);
                            if (bankEl && !bankEl.value) bankEl.value = data.bankName;
                        }
                    } else {
                        input.style.borderColor = '#dc2626';
                        if (badge) {
                            badge.style.display = 'block';
                            badge.style.color = '#dc2626';
                            badge.textContent = `✗ ${(data && data.reason) || 'Ungültige IBAN-Prüfsumme'}`;
                        }
                    }
                } catch (err) {}
            }, 250);
        });
    }

    // =========================================================================
    // 1. REMOTE CUSTOMER eSIGN MODE (?sign=TOKEN)
    // =========================================================================
    async function initRemoteCustomerSignFlow(signToken) {
        const remoteSection = document.getElementById('remoteSignSection');
        const publicSection = document.getElementById('publicPortalAuthSection');
        const cockpitSection = document.getElementById('partnerCockpitSection');
        if (!remoteSection) return;

        if (publicSection) publicSection.style.display = 'none';
        if (cockpitSection) cockpitSection.style.display = 'none';
        remoteSection.style.display = 'block';

        const infoBox = document.getElementById('remoteSignOrderSummary');
        const statusMsg = document.getElementById('remoteSignStatusMsg');
        const pad = createSignaturePad('remoteSignCanvas');

        const clearBtn = document.getElementById('btnRemoteSignClear');
        if (clearBtn && pad) clearBtn.addEventListener('click', () => pad.clear());

        try {
            const res = await fetch(`/api/order/remote-sign/${encodeURIComponent(signToken)}`);
            const data = await res.json();
            if (!data.success || !data.order) {
                if (infoBox) infoBox.innerHTML = `<div style="color:#dc2626;font-weight:700;">${escapeHtml(data.error || 'Auftrag nicht gefunden.')}</div>`;
                return;
            }
            const o = data.order;
            if (infoBox) {
                infoBox.innerHTML = `
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
                        <div><strong>Auftrags-Nr.:</strong> ${escapeHtml(o.orderNumber)}</div>
                        <div><strong>Tarif:</strong> ${escapeHtml(o.tariffName)} (${escapeHtml(String(o.branch || '').toUpperCase())})</div>
                        <div><strong>Jahresverbrauch:</strong> ${Number(o.consumption || 0).toLocaleString('de-DE')} kWh</div>
                        <div><strong>Monatl. Abschlag:</strong> ${formatEur(o.monthlyPayment)}</div>
                        <div><strong>Kunde:</strong> ${escapeHtml(o.salutation || '')} ${escapeHtml(o.firstName)} ${escapeHtml(o.lastName)}</div>
                        <div><strong>Lieferstelle:</strong> ${escapeHtml(o.street)} ${escapeHtml(o.houseNr)}, ${escapeHtml(o.plz)} ${escapeHtml(o.city)}</div>
                        <div><strong>Zählernummer:</strong> ${escapeHtml(o.meterNumber)}</div>
                        <div><strong>IBAN:</strong> ${escapeHtml(o.ibanMasked)}</div>
                    </div>
                `;
            }

            const submitBtn = document.getElementById('btnRemoteSignSubmit');
            if (o.signedAt) {
                if (statusMsg) {
                    statusMsg.style.display = 'block';
                    statusMsg.style.color = '#15803d';
                    statusMsg.innerHTML = `✓ Dieser Energieauftrag (<strong>${escapeHtml(o.orderNumber)}</strong>) wurde bereits rechtsgültig digital unterschrieben.`;
                }
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Bereits unterschrieben ✓';
                }
                return;
            }
            if (submitBtn) {
                submitBtn.addEventListener('click', async () => {
                    const sigData = pad ? pad.toDataURL() : null;
                    if (!sigData) {
                        if (statusMsg) {
                            statusMsg.style.display = 'block';
                            statusMsg.style.color = '#dc2626';
                            statusMsg.textContent = 'Bitte unterschreiben Sie zuerst im Unterschriftsfeld.';
                        }
                        return;
                    }
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Wird übertragen...';
                    try {
                        const r = await fetch(`/api/order/remote-sign/${encodeURIComponent(signToken)}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ signatureData: sigData })
                        });
                        const resData = await r.json();
                        if (resData.success) {
                            if (statusMsg) {
                                statusMsg.style.display = 'block';
                                statusMsg.style.color = '#15803d';
                                statusMsg.innerHTML = `✓ Vielen Dank! Ihr Energieauftrag <strong>${escapeHtml(resData.orderNumber)}</strong> wurde rechtsgültig digital unterschrieben.`;
                            }
                            submitBtn.textContent = 'Erfolgreich unterschrieben ✓';
                        } else {
                            throw new Error(resData.error || 'Fehler beim Speichern');
                        }
                    } catch (err) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Jetzt rechtsverbindlich unterschreiben';
                        if (statusMsg) {
                            statusMsg.style.display = 'block';
                            statusMsg.style.color = '#dc2626';
                            statusMsg.textContent = err.message;
                        }
                    }
                });
            }
        } catch (err) {
            if (infoBox) infoBox.textContent = 'Fehler beim Laden des Auftrags.';
        }
    }

    // =========================================================================
    // 2. PUBLIC AUTH & INTERACTIVE COMMISSION CALCULATOR
    // =========================================================================
    function initPublicCommissionCalculator() {
        const slider = document.getElementById('commCalcDealsSlider');
        const roleSelect = document.getElementById('commCalcRoleSelect');
        const dealsOut = document.getElementById('commCalcDealsValue');
        const monthlyOut = document.getElementById('commCalcMonthlyEur');
        const yearlyOut = document.getElementById('commCalcYearlyEur');
        const rateOut = document.getElementById('commCalcRateHint');
        if (!slider || !roleSelect) return;

        function updateCalc() {
            const deals = parseInt(slider.value, 10) || 25;
            const role = roleSelect.value || 'D2D';
            const rateMap = {
                TIPPGEBER: { base: 35, override: 0, label: '35 € Prämie pro erfolgreichem Tipp' },
                AFFILIATE: { base: 55, override: 0, label: '55 € Online-Provision pro Abschluss (90 Tage Cookie)' },
                D2D: { base: 65, override: 0, label: '65 € Direktprovision pro Strom-/Gasvertrag' },
                AGENCY: { base: 75, override: 15, label: '75 € Eigenprovision + 15 € Override auf Team-Umsätze' }
            };
            const cfg = rateMap[role] || rateMap.D2D;
            const monthly = deals * (cfg.base + cfg.override);
            const yearly = monthly * 12;

            if (dealsOut) dealsOut.textContent = `${deals} Verträge / Monat`;
            if (monthlyOut) monthlyOut.textContent = formatEur(monthly);
            if (yearlyOut) yearlyOut.textContent = formatEur(yearly);
            if (rateOut) rateOut.textContent = cfg.label;
        }

        slider.addEventListener('input', updateCalc);
        roleSelect.addEventListener('change', updateCalc);
        updateCalc();
    }

    async function performLogin(payload) {
        const errEl = document.getElementById('portalLoginError');
        if (errEl) errEl.style.display = 'none';
        try {
            const res = await fetch('/api/partner/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Anmeldung fehlgeschlagen.');
            }
            currentToken = data.token;
            currentPartner = data.partner;
            localStorage.setItem(STORAGE_TOKEN_KEY, currentToken);
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(currentPartner));
            if (data.adminToken) {
                localStorage.setItem('adminToken', data.adminToken);
            } else {
                localStorage.removeItem('adminToken');
            }
            await loadPartnerCockpit();
        } catch (err) {
            if (errEl) {
                errEl.textContent = err.message;
                errEl.style.display = 'block';
            }
        }
    }

    function initAuthForms() {
        // Login Form
        const loginForm = document.getElementById('partnerLoginFormEl');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const identifier = document.getElementById('login-email')?.value.trim() || '';
                const password = document.getElementById('login-password')?.value || '';
                performLogin({ identifier, password });
            });
        }

        // Self-Registration Form
        bindLiveIbanCheck('reg-iban', 'regIbanStatusBadge', null, null);
        const regForm = document.getElementById('partnerRegisterFormEl');
        if (regForm) {
            regForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const errEl = document.getElementById('portalRegisterError');
                if (errEl) errEl.style.display = 'none';

                const fullName = document.getElementById('reg-name')?.value.trim() || '';
                const email = document.getElementById('reg-email')?.value.trim() || '';
                const phone = document.getElementById('reg-tel')?.value.trim() || '';
                const role = document.getElementById('reg-role')?.value || 'D2D';
                const companyName = document.getElementById('reg-company')?.value.trim() || '';
                const password = document.getElementById('reg-password')?.value || '';
                const iban = document.getElementById('reg-iban')?.value.trim() || '';
                const parentPartnerCode = document.getElementById('reg-parent-code')?.value.trim() || localStorage.getItem('affiliate_ref') || '';

                const parts = fullName.split(/\s+/);
                const firstName = parts[0] || fullName;
                const lastName = parts.slice(1).join(' ') || '';

                try {
                    const res = await fetch('/api/partner/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            firstName,
                            lastName,
                            fullName,
                            email,
                            phone,
                            role,
                            companyName,
                            password,
                            iban,
                            parentPartnerCode
                        })
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                        throw new Error(data.error || 'Registrierung fehlgeschlagen.');
                    }
                    currentToken = data.token;
                    currentPartner = data.partner;
                    localStorage.setItem(STORAGE_TOKEN_KEY, currentToken);
                    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(currentPartner));
                    localStorage.removeItem('adminToken');
                    await loadPartnerCockpit();
                } catch (err) {
                    if (errEl) {
                        errEl.textContent = err.message;
                        errEl.style.display = 'block';
                    }
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('btnPartnerLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                currentToken = null;
                currentPartner = null;
                dashboardData = null;
                isAdminInVp = false;
                window.__adminAutoImpersonated = false;
                window.__adminTabSwitched = false;
                localStorage.removeItem(STORAGE_TOKEN_KEY);
                localStorage.removeItem(STORAGE_USER_KEY);
                localStorage.removeItem('adminToken');
                const publicSec = document.getElementById('publicPortalAuthSection');
                const cockpitSec = document.getElementById('partnerCockpitSection');
                const adminBanner = document.getElementById('vpAdminModeBanner');
                if (adminBanner) adminBanner.style.display = 'none';
                document.querySelectorAll('.admin-only-vp-tab').forEach(b => { b.style.display = 'none'; });
                if (cockpitSec) cockpitSec.style.display = 'none';
                if (publicSec) publicSec.style.display = 'flex';
            });
        }
    }

    // =========================================================================
    // 3. LOGGED-IN PARTNER & ADMIN COCKPIT (/vp)
    // =========================================================================
    let adminPortalData = null;
    let isAdminInVp = false;
    let lastFocusedStatusInput = null;

    function switchCockpitTab(tabId) {
        document.querySelectorAll('[data-cockpit-tab]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-cockpit-tab') === tabId);
        });
        document.querySelectorAll('.cockpit-tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `cockpit-pane-${tabId}`);
        });
    }

    async function loadPartnerCockpit() {
        const adminToken = localStorage.getItem('adminToken');
        if (!currentToken && !adminToken) return;
        const publicSec = document.getElementById('publicPortalAuthSection');
        const cockpitSec = document.getElementById('partnerCockpitSection');

        try {
            // If Admin enters /vp from /admin without a separate VP token, auto-impersonate ALPHAADMIN
            if (!currentToken && adminToken) {
                const impRes = await fetch('/api/admin/impersonate-partner', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({ partnerCode: 'ALPHAADMIN' })
                }).catch(() => null);
                if (impRes && impRes.ok) {
                    const impData = await impRes.json();
                    if (impData.success && impData.token) {
                        currentToken = impData.token;
                        localStorage.setItem(STORAGE_TOKEN_KEY, currentToken);
                    }
                }
            }

            if (currentToken) {
                const res = await fetch('/api/partner/dashboard', {
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                });
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem(STORAGE_TOKEN_KEY);
                    currentToken = null;
                    if (!adminToken) {
                        if (cockpitSec) cockpitSec.style.display = 'none';
                        if (publicSec) publicSec.style.display = 'flex';
                        return;
                    }
                } else {
                    const data = await res.json();
                    if (data.success) {
                        dashboardData = data;
                        currentPartner = data.partner;
                        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(currentPartner));

                        if (publicSec) publicSec.style.display = 'none';
                        if (cockpitSec) cockpitSec.style.display = 'block';

                        renderCockpitHeader(data.partner);
                        renderOverviewTab(data);
                        renderAffiliateTab(data);
                        renderTippgeberTab(data);
                        renderOrdersTab(data);
                        renderDownlineTab(data);
                        renderPayoutsAndProfileTab(data);
                    }
                }
            }

            // Check if user is logged in as Admin (alphaadmin or via /admin)
            await checkAndLoadAdminModeInVp();
        } catch (err) {
            console.error('[PartnerPortal] Error loading cockpit:', err);
        }
    }

    function renderCockpitHeader(partner) {
        const nameEl = document.getElementById('cockpitPartnerName');
        const roleEl = document.getElementById('cockpitPartnerRole');
        const codeEl = document.getElementById('cockpitPartnerCode');
        const ratesEl = document.getElementById('cockpitPartnerRates');

        if (nameEl) nameEl.textContent = partner.companyName ? `${partner.fullName} (${partner.companyName})` : partner.fullName;
        if (roleEl) roleEl.textContent = roleLabel(partner.role);
        if (codeEl) codeEl.textContent = partner.partnerCode;
        if (ratesEl) {
            const ladeEur = partner.ladestromCommissionEur || partner.stromCommissionEur || 55;
            ratesEl.textContent = `Strom: ${partner.stromCommissionEur} € | Gas: ${partner.gasCommissionEur} € | Wärme: ${partner.waermeCommissionEur} € | Ladestrom: ${ladeEur} €${partner.overrideCommissionEur > 0 ? ' | Override: ' + partner.overrideCommissionEur + ' €' : ''} | Stornoreserve: ${partner.stornoReservePct ?? 10}%`;
        }

        // Update Top Dedicated Versorgerseite Affiliate Hero
        const origin = window.location.origin || 'https://alpha-energie.de';
        const versorgerUrl = `${origin}/versorger?ref=${encodeURIComponent(partner.partnerCode)}`;
        const heroInput = document.getElementById('heroVersorgerAffiliateInput');
        const heroCodeLbl = document.getElementById('heroAffPartnerCodeLabel');
        const heroOpenLink = document.getElementById('btnHeroOpenVersorger');
        if (heroInput) heroInput.value = versorgerUrl;
        if (heroCodeLbl) heroCodeLbl.textContent = partner.partnerCode;
        if (heroOpenLink) heroOpenLink.href = `/versorger?ref=${encodeURIComponent(partner.partnerCode)}`;

        const copyHeroBtn = document.getElementById('btnHeroCopyVersorgerLink');
        if (copyHeroBtn && !copyHeroBtn.dataset.bound) {
            copyHeroBtn.dataset.bound = '1';
            copyHeroBtn.addEventListener('click', () => {
                const val = document.getElementById('heroVersorgerAffiliateInput')?.value || versorgerUrl;
                navigator.clipboard?.writeText(val).catch(() => {});
                copyHeroBtn.textContent = '✓ Kopiert!';
                setTimeout(() => { copyHeroBtn.textContent = '📋 Link kopieren'; }, 1800);
            });
        }

        const waHeroBtn = document.getElementById('btnHeroWhatsappShare');
        if (waHeroBtn && !waHeroBtn.dataset.bound) {
            waHeroBtn.dataset.bound = '1';
            waHeroBtn.addEventListener('click', () => {
                const val = document.getElementById('heroVersorgerAffiliateInput')?.value || versorgerUrl;
                const txt = `Jetzt Strom- & Gaskosten bei Alpha Energie senken und direkt im Live-Tarifrechner wechseln: ${val}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
            });
        }

        const mailHeroBtn = document.getElementById('btnHeroEmailShare');
        if (mailHeroBtn && !mailHeroBtn.dataset.bound) {
            mailHeroBtn.dataset.bound = '1';
            mailHeroBtn.addEventListener('click', () => {
                const val = document.getElementById('heroVersorgerAffiliateInput')?.value || versorgerUrl;
                const subj = 'Empfehlung: Günstige Ökostrom- & Erdgastarife bei Alpha Energie';
                const body = `Hallo,\n\nhier ist mein direkter Empfehlungslink zur Versorgerseite der Alpha Energie GmbH:\n${val}\n\nEinfach Postleitzahl und Jahresverbrauch eingeben und direkt online wechseln.\n\nViele Grüße`;
                window.location.href = `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
            });
        }

        const deepLinkJumpBtn = document.getElementById('btnHeroOpenDeepLinkTab');
        if (deepLinkJumpBtn && !deepLinkJumpBtn.dataset.bound) {
            deepLinkJumpBtn.dataset.bound = '1';
            deepLinkJumpBtn.addEventListener('click', () => {
                switchCockpitTab('affiliate');
            });
        }
    }

    function renderStatusWithMessageHtml(o) {
        const msg = o.statusMessage || 'Auftrag in Bearbeitung';
        const isClarification = o.status === 'CLARIFICATION' || msg.includes('Klärfall');
        const borderCol = isClarification ? '#f59e0b' : (o.status === 'CANCELLED' ? '#ef4444' : '#ff7a00');
        const bgCol = isClarification ? '#fffbeb' : '#f8fafc';
        return `
            <div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    ${statusBadgeHtml(o.status)}
                    ${o.supplyStartDate ? `<span style="font-size:0.72rem;background:#e0f2fe;color:#0369a1;padding:2px 7px;border-radius:6px;font-weight:700;">Lieferbeginn: ${escapeHtml(o.supplyStartDate)}</span>` : ''}
                    ${o.payoutNumber ? `<span style="font-size:0.72rem;background:#dcfce7;color:#15803d;padding:2px 7px;border-radius:6px;font-weight:700;">Beleg: ${escapeHtml(o.payoutNumber)}</span>` : ''}
                </div>
                <div class="status-msg-box" style="border-left-color:${borderCol};background:${bgCol};">
                    <strong>Statusmeldung:</strong> ${escapeHtml(msg)}
                </div>
            </div>
        `;
    }

    function renderOverviewTab(data) {
        const k = data.kpis || {};
        const setTxt = (id, txt) => {
            const el = document.getElementById(id);
            if (el) el.textContent = txt;
        };
        setTxt('kpiTotalEarned', formatEur(k.totalEarnedEur));
        setTxt('kpiPendingComm', formatEur(k.pendingCommission));
        setTxt('kpiPaidComm', formatEur((k.approvedCommission || 0) + (k.paidCommission || 0)));
        setTxt('kpiTotalOrders', String(k.totalOrders || 0));
        setTxt('kpiTotalClicks', `${k.totalClicks || 0} Klicks (${k.conversionRate || 0}% CR)`);
        setTxt('kpiDownlineOverride', `${formatEur(k.overrideCommissionTotal)} (${k.subPartnersCount || 0} VP)`);

        const recentTbody = document.getElementById('overviewRecentOrdersBody');
        if (recentTbody) {
            const recent = (data.orders || []).slice(0, 8);
            if (recent.length === 0) {
                recentTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:18px;color:#64748b;">Noch keine eigenen Verträge eingereicht. Teilen Sie oben Ihren Versorgerseite-Affiliate-Link oder nutzen Sie den D2D-Tarifrechner.</td></tr>`;
            } else {
                recentTbody.innerHTML = recent.map(o => `
                    <tr>
                        <td><strong>${escapeHtml(o.orderNumber)}</strong><div style="font-size:0.75rem;color:#64748b;">${formatDate(o.createdAt)}</div></td>
                        <td>${escapeHtml(o.firstName)} ${escapeHtml(o.lastName)}<div style="font-size:0.75rem;color:#64748b;">${escapeHtml(o.plz)} ${escapeHtml(o.city)}</div></td>
                        <td>${escapeHtml(o.tariffName)}<div style="font-size:0.75rem;color:#64748b;">${Number(o.consumption || 0).toLocaleString('de-DE')} kWh</div></td>
                        <td><span style="font-size:0.78rem;font-weight:700;color:#0a1f44;">${escapeHtml(o.orderSource || 'ONLINE')}</span>${o.subId ? `<div style="font-size:0.72rem;color:#64748b;">Sub: ${escapeHtml(o.subId)}</div>` : ''}</td>
                        <td>${renderStatusWithMessageHtml(o)}</td>
                        <td style="font-weight:700;color:#0a1f44;">${formatEur(o.commissionAmount)}<div style="margin-top:4px;">${statusBadgeHtml(o.commissionStatus)}</div></td>
                    </tr>
                `).join('');
            }
        }
    }

    // D2D Tariff Calculator + Direct Order Submission + Canvas eSign
    function initD2dTabInteractions() {
        const calcBtn = document.getElementById('btnD2dCalculate');
        const branchSel = document.getElementById('d2dCalcBranch');
        const plzInput = document.getElementById('d2dCalcPlz');
        const kwhInput = document.getElementById('d2dCalcKwh');
        const resultsGrid = document.getElementById('d2dTariffResultsGrid');

        async function runD2dCalculation() {
            const plz = (plzInput?.value || '').replace(/\D/g, '').slice(0, 5);
            if (!/^\d{5}$/.test(plz)) {
                if (resultsGrid) {
                    resultsGrid.innerHTML = `<div style="padding:16px;color:#b91c1c;font-weight:700;">Bitte gib zuerst eine gültige 5-stellige Postleitzahl (Lieferstelle) ein, um die Tarifpreise zu berechnen.</div>`;
                }
                if (plzInput) plzInput.focus();
                return;
            }
            const branch = branchSel?.value || 'strom';
            const defaultBranchKwh = branch === 'gas' ? 12000 : (branch === 'waerme' ? 6000 : (branch === 'ladestrom' ? 2500 : 3000));
            const kwh = parseInt(kwhInput?.value, 10) || defaultBranchKwh;

            if (resultsGrid) {
                resultsGrid.innerHTML = `<div style="padding:16px;color:#475569;">Lade tagesaktuelle Firstcon-Tarife für PLZ ${escapeHtml(plz)} (${kwh.toLocaleString('de-DE')} kWh)...</div>`;
            }

            try {
                const res = await fetch('/api/tarife/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plz, consumption: kwh, branch })
                });
                const data = await res.json();
                d2dCalculatedTariffs = Array.isArray(data.tariffs) ? data.tariffs : [];

                const orderPlz = document.getElementById('d2dOrderPlz');
                const orderCity = document.getElementById('d2dOrderCity');
                if (orderPlz) orderPlz.value = plz;
                if (orderCity && data.city) orderCity.value = data.city;

                if (d2dCalculatedTariffs.length === 0) {
                    if (resultsGrid) resultsGrid.innerHTML = `<div style="padding:16px;color:#dc2626;">Keine Tarife gefunden.</div>`;
                    return;
                }

                selectedD2dTariff = d2dCalculatedTariffs[0];
                syncSelectedD2dTariffToForm(selectedD2dTariff, branch, kwh);
                renderD2dTariffCards(d2dCalculatedTariffs, branch, kwh);
            } catch (err) {
                if (resultsGrid) resultsGrid.innerHTML = `<div style="padding:16px;color:#dc2626;">Fehler bei der Tarifberechnung: ${escapeHtml(err.message)}</div>`;
            }
        }

        function renderD2dTariffCards(tariffs, branch, kwh) {
            if (!resultsGrid) return;
            const partnerComm = currentPartner
                ? (branch === 'gas' ? currentPartner.gasCommissionEur : ((branch === 'waerme' || branch === 'ladestrom') ? currentPartner.waermeCommissionEur : currentPartner.stromCommissionEur))
                : 65;

            resultsGrid.innerHTML = tariffs.map((t, idx) => {
                const isSel = selectedD2dTariff && selectedD2dTariff.id === t.id;
                const workCt = Number(t.workingPriceCt || 0).toFixed(2).replace('.', ',');
                const baseEur = Number(t.basePriceEurMonth || t.basePriceEur || 0).toFixed(2).replace('.', ',');
                let rateDetail = `Arbeitspreis: <strong>${workCt} ct/kWh</strong> · Grundpreis: <strong>${baseEur} €/Mon.</strong>`;
                if (branch === 'waerme' && typeof t.workingPriceHtCt === 'number' && typeof t.workingPriceNtCt === 'number') {
                    const etCt = Number(t.workingPriceEtCt || t.workingPriceCt || 0).toFixed(2).replace('.', ',');
                    const htCt = Number(t.workingPriceHtCt).toFixed(2).replace('.', ',');
                    const ntCt = Number(t.workingPriceNtCt).toFixed(2).replace('.', ',');
                    rateDetail = `ET: <strong>${etCt} ct</strong> · HT/NT: <strong>${htCt} / ${ntCt} ct/kWh</strong> · GP: <strong>${baseEur} €/Mon.</strong>`;
                } else if (branch === 'ladestrom') {
                    rateDetail = `Arbeitspreis (§ 14a EnWG): <strong>${workCt} ct/kWh</strong> · Grundpreis: <strong>${baseEur} €/Mon.</strong>`;
                }
                return `
                    <div class="d2d-tariff-card ${isSel ? 'selected' : ''}" data-d2d-tariff-idx="${idx}" style="border:2px solid ${isSel ? '#ff7a00' : '#e2e8f0'};border-radius:14px;padding:16px;background:${isSel ? '#fff7ed' : '#ffffff'};cursor:pointer;transition:all 0.2s;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
                            <strong style="color:#0a1f44;font-size:1rem;">${escapeHtml(t.name)}</strong>
                            <span style="background:#dcfce7;color:#15803d;font-size:0.74rem;font-weight:700;padding:3px 8px;border-radius:999px;">+${formatEur(partnerComm)} Provision</span>
                        </div>
                        <div style="font-size:1.35rem;font-weight:800;color:#0a1f44;margin-bottom:6px;">${Number(t.monthlyPayment || 0)} € <span style="font-size:0.82rem;font-weight:500;color:#64748b;">/ Monat Abschlag</span></div>
                        <div style="font-size:0.82rem;color:#475569;">${rateDetail}</div>
                    </div>
                `;
            }).join('');

            resultsGrid.querySelectorAll('[data-d2d-tariff-idx]').forEach(card => {
                card.addEventListener('click', () => {
                    const idx = parseInt(card.getAttribute('data-d2d-tariff-idx'), 10);
                    if (d2dCalculatedTariffs[idx]) {
                        selectedD2dTariff = d2dCalculatedTariffs[idx];
                        syncSelectedD2dTariffToForm(selectedD2dTariff, branch, kwh);
                        renderD2dTariffCards(d2dCalculatedTariffs, branch, kwh);
                    }
                });
            });
        }

        function syncSelectedD2dTariffToForm(tariff, branch, kwh) {
            const labelEl = document.getElementById('d2dSelectedTariffBanner');
            if (labelEl && tariff) {
                labelEl.textContent = `Gewählter Tarif: ${tariff.name} (${branch.toUpperCase()} · ${kwh.toLocaleString('de-DE')} kWh · ${tariff.monthlyPayment} €/Monat Abschlag)`;
            }
        }

        if (branchSel) {
            branchSel.addEventListener('change', () => {
                const br = branchSel.value || 'strom';
                if (kwhInput && ['2500', '3000', '6000', '12000'].includes(String(kwhInput.value))) {
                    kwhInput.value = br === 'gas' ? '12000' : (br === 'waerme' ? '6000' : (br === 'ladestrom' ? '2500' : '3000'));
                }
                const currentPlz = (plzInput?.value || '').replace(/\D/g, '').slice(0, 5);
                if (/^\d{5}$/.test(currentPlz)) {
                    runD2dCalculation();
                }
            });
        }
        if (calcBtn) calcBtn.addEventListener('click', runD2dCalculation);

        bindLiveIbanCheck('d2dOrderIban', 'd2dOrderIbanBadge', null, null);

        const sigModeSelect = document.getElementById('d2dSignatureMode');
        const padWrapper = document.getElementById('d2dCanvasPadWrapper');
        const d2dPad = createSignaturePad('d2dSignCanvas');
        const btnClearPad = document.getElementById('btnD2dClearCanvas');
        const btnDemoSign = document.getElementById('btnD2dDemoSign');

        if (btnClearPad && d2dPad) btnClearPad.addEventListener('click', () => d2dPad.clear());
        if (btnDemoSign && d2dPad) btnDemoSign.addEventListener('click', () => d2dPad.markSignedForTest());

        if (sigModeSelect && padWrapper) {
            sigModeSelect.addEventListener('change', () => {
                padWrapper.style.display = sigModeSelect.value === 'REMOTE' ? 'none' : 'block';
            });
        }

        const orderForm = document.getElementById('d2dDirectOrderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const feedbackEl = document.getElementById('d2dOrderResultBox');
                if (feedbackEl) feedbackEl.style.display = 'none';

                const sigMode = sigModeSelect ? sigModeSelect.value : 'PAD';
                const sigData = sigMode === 'PAD' && d2dPad ? d2dPad.toDataURL() : null;

                if (sigMode === 'PAD' && !sigData) {
                    if (feedbackEl) {
                        feedbackEl.style.display = 'block';
                        feedbackEl.style.background = '#fee2e2';
                        feedbackEl.style.color = '#b91c1c';
                        feedbackEl.textContent = 'Bitte lassen Sie den Kunden auf dem Unterschriftsfeld unterschreiben oder wählen Sie "Remote-Sign Link senden".';
                    }
                    return;
                }

                const branch = branchSel?.value || 'strom';
                const kwh = parseInt(kwhInput?.value, 10) || 2500;
                const tariff = selectedD2dTariff || {
                    id: 'alpha-strom-smart',
                    name: 'AlphaStrom Smart 24',
                    monthlyPayment: 89,
                    savingsEur: 180
                };

                const payload = {
                    tariffId: tariff.id,
                    tariffName: tariff.name,
                    branch,
                    consumption: kwh,
                    monthlyPayment: tariff.monthlyPayment || 89,
                    savings: tariff.savingsEur || 180,
                    salutation: document.getElementById('d2dOrderSalutation')?.value || 'Herr',
                    firstName: document.getElementById('d2dOrderFirstName')?.value.trim() || '',
                    lastName: document.getElementById('d2dOrderLastName')?.value.trim() || '',
                    birthDate: document.getElementById('d2dOrderBirthDate')?.value.trim() || '',
                    email: document.getElementById('d2dOrderEmail')?.value.trim() || '',
                    phone: document.getElementById('d2dOrderPhone')?.value.trim() || '',
                    street: document.getElementById('d2dOrderStreet')?.value.trim() || '',
                    houseNr: document.getElementById('d2dOrderHouseNr')?.value.trim() || '',
                    plz: document.getElementById('d2dOrderPlz')?.value.trim() || '44379',
                    city: document.getElementById('d2dOrderCity')?.value.trim() || 'Dortmund',
                    meterNumber: document.getElementById('d2dOrderMeter')?.value.trim() || '',
                    currentProvider: document.getElementById('d2dOrderProvider')?.value.trim() || '',
                    iban: document.getElementById('d2dOrderIban')?.value.trim() || '',
                    subId: document.getElementById('d2dOrderSubId')?.value.trim() || 'd2d_tablet',
                    signatureMode: sigMode,
                    signatureData: sigData
                };

                try {
                    const res = await fetch('/api/partner/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`
                        },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                        throw new Error(data.error || 'Fehler beim Einreichen des Auftrags.');
                    }

                    if (feedbackEl) {
                        feedbackEl.style.display = 'block';
                        feedbackEl.style.background = '#dcfce7';
                        feedbackEl.style.color = '#14532d';
                        if (data.remoteSignUrl) {
                            feedbackEl.innerHTML = `
                                <strong>✓ Auftrag ${escapeHtml(data.orderNumber)} angelegt (Wartet auf Kunden-eSign)!</strong>
                                <div style="margin-top:8px;">Senden Sie diesen Unterschrifts-Link an den Kunden (WhatsApp / SMS / E-Mail):</div>
                                <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                                    <input type="text" readonly value="${escapeHtml(data.remoteSignUrl)}" style="flex:1;min-width:220px;padding:7px 10px;border-radius:6px;border:1px solid #86efac;background:#fff;font-size:0.84rem;">
                                    <a href="${escapeHtml(data.remoteSignUrl)}" target="_blank" class="btn btn-primary" style="padding:7px 14px;font-size:0.82rem;">eSign-Seite öffnen</a>
                                </div>
                            `;
                        } else {
                            feedbackEl.innerHTML = `<strong>✓ D2D-Auftrag ${escapeHtml(data.orderNumber)} inkl. digitaler Kundenunterschrift erfolgreich eingereicht!</strong> Provision (${formatEur(data.order.commissionAmount)}) wurde Ihrem Konto vorgemerkt.`;
                        }
                    }
                    if (d2dPad) d2dPad.clear();
                    await loadPartnerCockpit();
                } catch (err) {
                    if (feedbackEl) {
                        feedbackEl.style.display = 'block';
                        feedbackEl.style.background = '#fee2e2';
                        feedbackEl.style.color = '#b91c1c';
                        feedbackEl.textContent = err.message;
                    }
                }
            });
        }
    }

    // Versorgerseite Affiliate Link Builder, Deep-Link Configurator, QR-Code & Sub-ID Stats
    function renderAffiliateTab(data) {
        const partner = data.partner;
        const targetPageSel = document.getElementById('affTargetPageSelect');
        const subIdInput = document.getElementById('affSubIdInput');
        const prefillPlzInput = document.getElementById('affPrefillPlzInput');
        const prefillKwhInput = document.getElementById('affPrefillKwhInput');
        const generatedUrlInput = document.getElementById('affGeneratedUrlInput');
        const embedCodeArea = document.getElementById('affWidgetEmbedCode');
        const qrCanvas = document.getElementById('affQrCodeCanvas');

        function updateAffiliateAssets() {
            const origin = window.location.origin || 'https://alpha-energie.de';
            const page = targetPageSel ? targetPageSel.value : '/versorger';
            const sub = subIdInput ? subIdInput.value.trim() : '';
            const plz = prefillPlzInput ? prefillPlzInput.value.replace(/\D/g, '').slice(0, 5) : '';
            const kwh = prefillKwhInput ? prefillKwhInput.value.trim() : '';
            const code = partner ? partner.partnerCode : 'AFF-PARTNER';
            const sep = page.includes('?') ? '&' : '?';
            let url = `${origin}${page}${sep}ref=${encodeURIComponent(code)}`;
            if (plz.length === 5) url += `&plz=${encodeURIComponent(plz)}`;
            if (kwh && Number(kwh) >= 500) url += `&kwh=${encodeURIComponent(kwh)}`;
            if (sub) url += `&subid=${encodeURIComponent(sub)}`;

            if (generatedUrlInput) generatedUrlInput.value = url;
            if (embedCodeArea) {
                embedCodeArea.value = `<iframe src="${origin}/versorger?ref=${encodeURIComponent(code)}${sub ? '&subid=' + encodeURIComponent(sub) : ''}#rechner" width="100%" height="680" style="border:0;border-radius:16px;overflow:hidden;" loading="lazy"></iframe>`;
            }
            if (qrCanvas) renderQrCanvas(qrCanvas, url, code);
        }

        [targetPageSel, subIdInput, prefillPlzInput, prefillKwhInput].forEach(el => {
            if (el && !el.dataset.bound) {
                el.dataset.bound = '1';
                el.addEventListener('input', updateAffiliateAssets);
                el.addEventListener('change', updateAffiliateAssets);
            }
        });

        const copyBtn = document.getElementById('btnCopyAffUrl');
        if (copyBtn && !copyBtn.dataset.bound) {
            copyBtn.dataset.bound = '1';
            copyBtn.addEventListener('click', () => {
                if (generatedUrlInput) {
                    navigator.clipboard?.writeText(generatedUrlInput.value).catch(() => {});
                    copyBtn.textContent = 'Kopiert ✓';
                    setTimeout(() => { copyBtn.textContent = '📋 Link kopieren'; }, 1800);
                }
            });
        }

        const waShareBtn = document.getElementById('btnShareAffWhatsapp');
        if (waShareBtn && !waShareBtn.dataset.bound) {
            waShareBtn.dataset.bound = '1';
            waShareBtn.addEventListener('click', () => {
                const url = generatedUrlInput ? generatedUrlInput.value : '';
                const txt = `Jetzt Strom- & Gastarif auf der Versorgerseite von Alpha Energie berechnen und sparen: ${url}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
            });
        }

        const downloadQrBtn = document.getElementById('btnDownloadAffQr');
        if (downloadQrBtn && !downloadQrBtn.dataset.bound) {
            downloadQrBtn.dataset.bound = '1';
            downloadQrBtn.addEventListener('click', () => {
                if (!qrCanvas) return;
                const link = document.createElement('a');
                link.download = `AlphaEnergie-Versorger-QR-${partner ? partner.partnerCode : 'Partner'}.png`;
                link.href = qrCanvas.toDataURL('image/png');
                link.click();
            });
        }

        updateAffiliateAssets();

        const subIdTbody = document.getElementById('affSubIdTableBody');
        if (subIdTbody) {
            const rows = data.subIdStats || [];
            if (rows.length === 0) {
                subIdTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:16px;color:#64748b;">Noch keine Klicks oder Conversions aufgezeichnet.</td></tr>`;
            } else {
                subIdTbody.innerHTML = rows.map(r => {
                    const cr = r.clicks > 0 ? ((r.conversions / r.clicks) * 100).toFixed(1) : (r.conversions > 0 ? '100.0' : '0.0');
                    return `
                        <tr>
                            <td><strong>${escapeHtml(r.subId)}</strong></td>
                            <td>${r.clicks}</td>
                            <td>${r.conversions}</td>
                            <td>${cr}%</td>
                            <td style="font-weight:700;color:#0a1f44;">${formatEur(r.commissionEur)}</td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }

    // Tippgeber Lead Box
    function renderTippgeberTab(data) {
        const tbody = document.getElementById('tippgeberLeadsTableBody');
        if (tbody) {
            const leads = data.leads || [];
            if (leads.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:16px;color:#64748b;">Noch keine Empfehlungen eingereicht.</td></tr>`;
            } else {
                tbody.innerHTML = leads.map(l => `
                    <tr>
                        <td><strong>${escapeHtml(l.customerName)}</strong><div style="font-size:0.75rem;color:#64748b;">${formatDate(l.createdAt)}</div></td>
                        <td>${escapeHtml(l.customerPhone)}${l.customerEmail ? `<div style="font-size:0.75rem;color:#64748b;">${escapeHtml(l.customerEmail)}</div>` : ''}</td>
                        <td>${escapeHtml(String(l.branch || 'strom').toUpperCase())}${l.estimatedConsumption ? ` · ${Number(l.estimatedConsumption).toLocaleString('de-DE')} kWh` : ''}</td>
                        <td>${statusBadgeHtml(l.status)}</td>
                        <td style="font-weight:700;color:#0a1f44;">${formatEur(l.commissionAmount)}</td>
                    </tr>
                `).join('');
            }
        }

        const leadForm = document.getElementById('tippgeberLeadForm');
        if (leadForm && !leadForm.dataset.bound) {
            leadForm.dataset.bound = '1';
            leadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const msg = document.getElementById('tippgeberFormFeedback');
                const payload = {
                    customerName: document.getElementById('tippName')?.value.trim() || '',
                    customerPhone: document.getElementById('tippPhone')?.value.trim() || '',
                    customerEmail: document.getElementById('tippEmail')?.value.trim() || '',
                    plz: document.getElementById('tippPlz')?.value.trim() || '',
                    city: document.getElementById('tippCity')?.value.trim() || '',
                    branch: document.getElementById('tippBranch')?.value || 'strom',
                    estimatedConsumption: document.getElementById('tippKwh')?.value || null,
                    notes: document.getElementById('tippNotes')?.value.trim() || ''
                };
                try {
                    const res = await fetch('/api/partner/leads', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`
                        },
                        body: JSON.stringify(payload)
                    });
                    const resData = await res.json();
                    if (!res.ok || !resData.success) throw new Error(resData.error || 'Fehler');
                    leadForm.reset();
                    if (msg) {
                        msg.style.display = 'block';
                        msg.style.color = '#15803d';
                        msg.textContent = '✓ Empfehlung erfolgreich übermittelt! Unser Vertriebsteam übernimmt die telefonische Beratung.';
                    }
                    await loadPartnerCockpit();
                } catch (err) {
                    if (msg) {
                        msg.style.display = 'block';
                        msg.style.color = '#dc2626';
                        msg.textContent = err.message;
                    }
                }
            });
        }
    }

    // VP Own Orders & Statusmeldungen Tab (Strictly isolated to the logged-in VP)
    function renderOrdersTab(data) {
        const tbody = document.getElementById('allPartnerOrdersBody');
        if (!tbody) return;
        const orders = data.orders || [];
        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:18px;color:#64748b;">Noch keine eigenen Aufträge vorhanden.</td></tr>`;
            return;
        }
        tbody.innerHTML = orders.map(o => {
            const signStatus = o.signedAt
                ? `<span style="color:#15803d;font-size:0.76rem;font-weight:700;">✓ eSign (${formatDate(o.signedAt)})</span>`
                : (o.signatureToken
                    ? `<a href="/vp?sign=${encodeURIComponent(o.signatureToken)}" target="_blank" style="color:#ea580c;font-size:0.76rem;font-weight:700;text-decoration:underline;">eSign-Link öffnen</a>`
                    : `<span style="color:#64748b;font-size:0.75rem;">Online / Versorger-Link</span>`);
            return `
                <tr>
                    <td><strong>${escapeHtml(o.orderNumber)}</strong><div style="font-size:0.75rem;color:#64748b;">${formatDate(o.createdAt)}</div></td>
                    <td>${escapeHtml(o.firstName)} ${escapeHtml(o.lastName)}<div style="font-size:0.75rem;color:#64748b;">${escapeHtml(o.plz)} ${escapeHtml(o.city)}</div></td>
                    <td>${escapeHtml(o.tariffName)}<div style="font-size:0.75rem;color:#64748b;">Zähler: ${escapeHtml(o.meterNumber)}</div></td>
                    <td><strong style="font-size:0.78rem;color:#0a1f44;">${escapeHtml(o.orderSource || 'ONLINE')}</strong>${o.subId ? `<div style="font-size:0.72rem;color:#64748b;">Sub: ${escapeHtml(o.subId)}</div>` : ''}</td>
                    <td>${signStatus}</td>
                    <td>${renderStatusWithMessageHtml(o)}</td>
                    <td style="font-weight:700;color:#0a1f44;">${formatEur(o.commissionAmount)}<div style="margin-top:4px;">${statusBadgeHtml(o.commissionStatus)}</div></td>
                </tr>
            `;
        }).join('');
    }

    // Agency & Downline Tab
    function renderDownlineTab(data) {
        const subTbody = document.getElementById('downlineSubPartnersBody');
        const origin = window.location.origin || 'https://alpha-energie.de';
        if (subTbody) {
            const subs = data.subPartners || [];
            if (subs.length === 0) {
                subTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:16px;color:#64748b;">Noch keine Unterpartner in Ihrer Downline angelegt.</td></tr>`;
            } else {
                subTbody.innerHTML = subs.map(sp => {
                    const affUrl = `${origin}/versorger?ref=${encodeURIComponent(sp.partnerCode)}`;
                    return `
                        <tr>
                            <td>
                                <strong>${escapeHtml(sp.partnerCode)}</strong>
                                <div style="margin-top:4px;">
                                    <button type="button" data-copy-sub-link="${escapeHtml(affUrl)}" style="background:#fff7ed;border:1px solid #fdba74;color:#ea580c;border-radius:6px;padding:2px 7px;font-size:0.72rem;font-weight:700;cursor:pointer;">🔗 Versorger-Link kopieren</button>
                                </div>
                            </td>
                            <td>${escapeHtml(sp.fullName)}<div style="font-size:0.75rem;color:#64748b;">${escapeHtml(sp.email)}</div></td>
                            <td>${escapeHtml(roleLabel(sp.role))}</td>
                            <td>${sp.stromCommissionEur} € / ${sp.gasCommissionEur} €</td>
                            <td><strong>${sp.ordersCount || 0}</strong> Verträge</td>
                            <td style="font-weight:700;color:#0a1f44;">${formatEur(sp.totalCommissionEur)}</td>
                        </tr>
                    `;
                }).join('');
                subTbody.querySelectorAll('[data-copy-sub-link]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        navigator.clipboard?.writeText(btn.getAttribute('data-copy-sub-link')).catch(() => {});
                        btn.textContent = '✓ Kopiert!';
                        setTimeout(() => { btn.textContent = '🔗 Versorger-Link kopieren'; }, 1600);
                    });
                });
            }
        }

        const subForm = document.getElementById('createSubPartnerForm');
        if (subForm && !subForm.dataset.bound) {
            subForm.dataset.bound = '1';
            subForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const msg = document.getElementById('subPartnerFormFeedback');
                const payload = {
                    firstName: document.getElementById('subFirstName')?.value.trim() || '',
                    lastName: document.getElementById('subLastName')?.value.trim() || '',
                    email: document.getElementById('subEmail')?.value.trim() || '',
                    phone: document.getElementById('subPhone')?.value.trim() || '',
                    role: document.getElementById('subRole')?.value || 'D2D',
                    stromCommissionEur: document.getElementById('subCommission')?.value || 55,
                    password: document.getElementById('subPassword')?.value || 'Alpha2026!'
                };
                try {
                    const res = await fetch('/api/partner/subpartners', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`
                        },
                        body: JSON.stringify(payload)
                    });
                    const resData = await res.json();
                    if (!res.ok || !resData.success) throw new Error(resData.error || 'Fehler');
                    subForm.reset();
                    if (msg) {
                        const subUrl = `${origin}/versorger?ref=${encodeURIComponent(resData.subPartner.partnerCode)}`;
                        msg.style.display = 'block';
                        msg.style.color = '#15803d';
                        msg.innerHTML = `✓ Unterpartner <strong>${escapeHtml(resData.subPartner.fullName)}</strong> (${escapeHtml(resData.subPartner.partnerCode)}) angelegt! Versorgerseite-Affiliate-Link: <code>${escapeHtml(subUrl)}</code>`;
                    }
                    await loadPartnerCockpit();
                } catch (err) {
                    if (msg) {
                        msg.style.display = 'block';
                        msg.style.color = '#dc2626';
                        msg.textContent = err.message;
                    }
                }
            });
        }
    }

    // Payouts (Abrechnungstool Preview + PDF Gutschriften) & Profile Stammdaten Tab
    function renderPayoutsAndProfileTab(data) {
        const p = data.partner || {};
        const k = data.kpis || {};
        const prev = k.nextPayoutPreview || {};

        const setTxt = (id, txt) => {
            const el = document.getElementById(id);
            if (el) el.textContent = txt;
        };

        setTxt('vpTaxModeBadge', p.isVatLiable ? 'Steuerart: Regelbesteuerung (+19% USt.)' : 'Steuerart: Kleinunternehmer (§ 19 UStG · 0% USt.)');
        setTxt('vpPreviewBaseEur', formatEur(prev.baseEur || 0));
        setTxt('vpPreviewEligibleCount', `${prev.eligibleOrdersCount || 0} abrechenbare Verträge`);
        setTxt('vpPreviewReserveEur', `-${formatEur(prev.reserveEur || 0)}`);
        setTxt('vpPreviewReservePct', `Stornoreserve-Satz: ${prev.reservePct ?? p.stornoReservePct ?? 10} %`);
        setTxt('vpPreviewNetAndVat', formatEur(prev.netEur || 0));
        setTxt('vpPreviewVatSub', p.isVatLiable ? `zzgl. ${formatEur(prev.vatEur || 0)} USt. (19%)` : 'Umsatzsteuerfrei gem. § 19 UStG');
        setTxt('vpPreviewGrossEur', formatEur(prev.grossEur || 0));
        setTxt('vpStornoReserveBalance', formatEur(k.stornoReserveBalance || 0));
        setTxt('vpLiabilityInfo', `Haftungszeit: ${p.liabilityMonths || 12} Monate`);

        const payoutsBody = document.getElementById('partnerPayoutsTableBody');
        if (payoutsBody) {
            const payouts = data.payouts || [];
            if (payouts.length === 0) {
                payoutsBody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:16px;color:#64748b;">Noch keine Provisionsgutschriften erstellt. Sobald Ihre offenen Aufträge abgerechnet werden, erscheint Ihr PDF-Beleg hier.</td></tr>`;
            } else {
                payoutsBody.innerHTML = payouts.map(po => `
                    <tr>
                        <td><strong>${escapeHtml(po.payoutNumber)}</strong><div style="font-size:0.74rem;color:#64748b;">${formatDate(po.createdAt)}</div></td>
                        <td>
                            <strong>${escapeHtml(po.periodLabel)}</strong>
                            ${po.remark ? `<div style="font-size:0.74rem;color:#64748b;">${escapeHtml(po.remark)}</div>` : ''}
                        </td>
                        <td><strong>${po.ordersCount}</strong> Pos.</td>
                        <td>${po.stornoReserveAmount > 0 ? `<span style="color:#d97706;font-weight:700;">-${formatEur(po.stornoReserveAmount)}</span>` : '<span style="color:#64748b;">0,00 €</span>'}</td>
                        <td>${formatEur(po.netAmount)}</td>
                        <td>${formatEur(po.vatAmount)}</td>
                        <td style="font-weight:800;color:#0a1f44;">${formatEur(po.grossAmount)}</td>
                        <td>
                            ${statusBadgeHtml(po.status)}
                            <div style="margin-top:4px;">
                                <a href="/api/partner/payouts/${po.id}/pdf" target="_blank" style="display:inline-block;background:#fff7ed;border:1px solid #fdba74;color:#ea580c;padding:3px 9px;border-radius:6px;font-weight:700;font-size:0.76rem;text-decoration:none;">📄 PDF Gutschrift</a>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        }

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val ?? '';
        };
        setVal('profFirstName', p.firstName);
        setVal('profLastName', p.lastName);
        setVal('profCompany', p.companyName);
        setVal('profLegalForm', p.legalForm);
        setVal('profPhone', p.phone);
        setVal('profIhkNumber', p.ihkNumber);
        setVal('profStreet', p.street);
        setVal('profHouseNr', p.houseNr);
        setVal('profPlz', p.plz);
        setVal('profCity', p.city);
        setVal('profTaxOffice', p.taxOffice);
        setVal('profTaxId', p.taxId);
        setVal('profVatId', p.vatId);
        setVal('profIban', p.iban);
        setVal('profBic', p.bic);
        setVal('profBankName', p.bankName);
        const vatEl = document.getElementById('profIsVatLiable');
        if (vatEl) vatEl.checked = Boolean(p.isVatLiable);

        bindLiveIbanCheck('profIban', 'profIbanBadge', 'profBic', 'profBankName');

        const profForm = document.getElementById('partnerProfileForm');
        if (profForm && !profForm.dataset.bound) {
            profForm.dataset.bound = '1';
            profForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const msg = document.getElementById('profSaveFeedback');
                const payload = {
                    firstName: document.getElementById('profFirstName')?.value.trim() || '',
                    lastName: document.getElementById('profLastName')?.value.trim() || '',
                    companyName: document.getElementById('profCompany')?.value.trim() || '',
                    legalForm: document.getElementById('profLegalForm')?.value.trim() || '',
                    phone: document.getElementById('profPhone')?.value.trim() || '',
                    ihkNumber: document.getElementById('profIhkNumber')?.value.trim() || '',
                    street: document.getElementById('profStreet')?.value.trim() || '',
                    houseNr: document.getElementById('profHouseNr')?.value.trim() || '',
                    plz: document.getElementById('profPlz')?.value.trim() || '',
                    city: document.getElementById('profCity')?.value.trim() || '',
                    taxOffice: document.getElementById('profTaxOffice')?.value.trim() || '',
                    taxId: document.getElementById('profTaxId')?.value.trim() || '',
                    vatId: document.getElementById('profVatId')?.value.trim() || '',
                    iban: document.getElementById('profIban')?.value.trim() || '',
                    bic: document.getElementById('profBic')?.value.trim() || '',
                    bankName: document.getElementById('profBankName')?.value.trim() || '',
                    isVatLiable: Boolean(document.getElementById('profIsVatLiable')?.checked)
                };
                try {
                    const res = await fetch('/api/partner/profile', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`
                        },
                        body: JSON.stringify(payload)
                    });
                    const resData = await res.json();
                    if (!res.ok || !resData.success) throw new Error(resData.error || 'Fehler beim Speichern.');
                    if (msg) {
                        msg.style.display = 'block';
                        msg.style.color = '#15803d';
                        msg.textContent = '✓ Stammdaten, Steuerdaten & SEPA-Auszahlungskonto erfolgreich gespeichert!';
                    }
                    await loadPartnerCockpit();
                } catch (err) {
                    if (msg) {
                        msg.style.display = 'block';
                        msg.style.color = '#dc2626';
                        msg.textContent = err.message;
                    }
                }
            });
        }
    }

    // =========================================================================
    // 4. ADMIN CONTROL MODE INSIDE /vp (When Admin enters via /admin)
    // =========================================================================
    async function checkAndLoadAdminModeInVp() {
        const adminToken = localStorage.getItem('adminToken');
        const adminBanner = document.getElementById('vpAdminModeBanner');
        const adminTabBtns = document.querySelectorAll('.admin-only-vp-tab');

        if (!adminToken) {
            isAdminInVp = false;
            if (adminBanner) adminBanner.style.display = 'none';
            adminTabBtns.forEach(b => { b.style.display = 'none'; });
            return;
        }

        try {
            const res = await fetch('/api/admin/portal-overview', {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (!res.ok) {
                isAdminInVp = false;
                if (adminBanner) adminBanner.style.display = 'none';
                adminTabBtns.forEach(b => { b.style.display = 'none'; });
                return;
            }
            const data = await res.json();
            if (!data.success) return;

            isAdminInVp = true;
            adminPortalData = data;

            if (adminBanner) adminBanner.style.display = 'block';
            adminTabBtns.forEach(b => { b.style.display = 'inline-block'; });

            // If Admin entered /vp directly from /admin without an active VP session yet, auto-impersonate first VP & open cockpit
            if (!currentPartner && !window.__adminAutoImpersonated) {
                window.__adminAutoImpersonated = true;
                try {
                    const impRes = await fetch('/api/admin/impersonate-partner', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${adminToken}`
                        },
                        body: JSON.stringify({})
                    });
                    const impData = await impRes.json();
                    if (impData.success && impData.token) {
                        currentToken = impData.token;
                        localStorage.setItem(STORAGE_TOKEN_KEY, currentToken);
                        await loadPartnerCockpit();
                        if (!window.__adminTabSwitched) {
                            window.__adminTabSwitched = true;
                            const urlParams = new URLSearchParams(window.location.search);
                            const adminTabParam = urlParams.get('adminTab');
                            switchCockpitTab(adminTabParam && ['admin-orders', 'admin-partners', 'admin-billing'].includes(adminTabParam) ? adminTabParam : 'admin-orders');
                        }
                        return;
                    }
                } catch (e) {}
            }

            const publicSec = document.getElementById('publicPortalAuthSection');
            const cockpitSec = document.getElementById('partnerCockpitSection');
            if (publicSec) publicSec.style.display = 'none';
            if (cockpitSec) cockpitSec.style.display = 'block';

            populateAdminImpersonateDropdown(data.partners || []);
            renderVpAdminOrdersTab(data);
            renderVpAdminPartnersTab(data);
            renderVpAdminBillingTab(data);
            initVpAdminInteractions();

            // Support ?adminTab=admin-orders|admin-partners|admin-billing deep-link from /admin
            const urlParams = new URLSearchParams(window.location.search);
            const adminTabParam = urlParams.get('adminTab');
            if (adminTabParam && ['admin-orders', 'admin-partners', 'admin-billing'].includes(adminTabParam) && !window.__adminTabSwitched) {
                window.__adminTabSwitched = true;
                switchCockpitTab(adminTabParam);
            }
        } catch (err) {
            console.warn('[PartnerPortal] Admin check skipped:', err.message);
        }
    }

    function populateAdminImpersonateDropdown(partners) {
        const sel = document.getElementById('adminVpImpersonateSelect');
        if (!sel) return;
        const currentCode = currentPartner ? currentPartner.partnerCode : '';
        sel.innerHTML = `<option value="">-- VP-Ansicht wechseln (${partners.length} VPs) --</option>` +
            partners.map(p => `<option value="${escapeHtml(p.partnerCode)}" ${p.partnerCode === currentCode ? 'selected' : ''}>${escapeHtml(p.partnerCode)} – ${escapeHtml(p.fullName)} (${escapeHtml(p.role)})</option>`).join('');

        if (!sel.dataset.bound) {
            sel.dataset.bound = '1';
            sel.addEventListener('change', async () => {
                const code = sel.value;
                if (!code) return;
                try {
                    const adminToken = localStorage.getItem('adminToken');
                    const res = await fetch('/api/admin/impersonate-partner', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${adminToken}`
                        },
                        body: JSON.stringify({ partnerCode: code })
                    });
                    const d = await res.json();
                    if (d.success && d.token) {
                        currentToken = d.token;
                        localStorage.setItem(STORAGE_TOKEN_KEY, currentToken);
                        await loadPartnerCockpit();
                    }
                } catch (e) {}
            });
        }
    }

    function renderVpAdminOrdersTab(data) {
        const orders = data.orders || [];
        const partners = data.partners || [];

        const filterPartnerSel = document.getElementById('vpAdminOrdersFilterPartner');
        if (filterPartnerSel) {
            const prevVal = filterPartnerSel.value;
            filterPartnerSel.innerHTML = `<option value="">Alle Vertriebspartner (${partners.length})</option>` +
                partners.map(p => `<option value="${escapeHtml(p.partnerCode)}">${escapeHtml(p.partnerCode)} – ${escapeHtml(p.fullName)}</option>`).join('');
            filterPartnerSel.value = prevVal;
        }

        const filterStatusSel = document.getElementById('vpAdminOrdersFilterStatus');
        const filterCode = filterPartnerSel ? filterPartnerSel.value : '';
        const filterStatus = filterStatusSel ? filterStatusSel.value : '';

        const filtered = orders.filter(o => {
            if (filterCode && o.partnerCode !== filterCode) return false;
            if (filterStatus && o.status !== filterStatus) return false;
            return true;
        });

        const tbody = document.getElementById('vpAdminAllOrdersTableBody');
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:18px;color:#64748b;">Keine Aufträge für diesen Filter gefunden.</td></tr>`;
            return;
        }

        const orderStatuses = ['RECEIVED', 'AWAITING_SIGNATURE', 'CONFIRMED', 'IN_DELIVERY', 'CLARIFICATION', 'PAID', 'CANCELLED'];
        const commStatuses = ['PENDING', 'APPROVED', 'PAID', 'CANCELLED', 'NONE'];

        tbody.innerHTML = filtered.map(o => `
            <tr data-adm-order-row="${o.id}">
                <td>
                    <strong>${escapeHtml(o.orderNumber)}</strong>
                    <div style="font-size:0.74rem;color:#64748b;">${formatDate(o.createdAt)} · ${escapeHtml(o.orderSource || 'ONLINE')}</div>
                    ${o.payoutNumber ? `<div style="font-size:0.72rem;color:#15803d;font-weight:700;">Gutschrift: ${escapeHtml(o.payoutNumber)}</div>` : ''}
                </td>
                <td>
                    <strong>${escapeHtml(o.firstName)} ${escapeHtml(o.lastName)}</strong>
                    <div style="font-size:0.74rem;color:#64748b;">${escapeHtml(o.plz)} ${escapeHtml(o.city)} · Zähler: ${escapeHtml(o.meterNumber)}</div>
                    <div style="font-size:0.74rem;color:#0a1f44;font-weight:600;">${escapeHtml(o.tariffName)} (${Number(o.consumption || 0).toLocaleString('de-DE')} kWh)</div>
                </td>
                <td>
                    <input type="text" data-adm-field="partnerCode" value="${escapeHtml(o.partnerCode || '')}" placeholder="VP-Code" style="width:110px;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font-weight:700;font-size:0.8rem;">
                    ${o.subId ? `<div style="font-size:0.72rem;color:#64748b;margin-top:3px;">Sub: ${escapeHtml(o.subId)}</div>` : ''}
                </td>
                <td>
                    <select data-adm-field="status" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.8rem;font-weight:700;margin-bottom:4px;">
                        ${orderStatuses.map(st => `<option value="${st}" ${o.status === st ? 'selected' : ''}>${st}</option>`).join('')}
                    </select>
                    <input type="date" data-adm-field="supplyStartDate" value="${escapeHtml(o.supplyStartDate || '')}" title="Geplanter Lieferbeginn" style="width:100%;padding:5px 7px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.76rem;">
                </td>
                <td style="min-width:250px;">
                    <textarea data-adm-field="statusMessage" rows="2" placeholder="Offizielle Statusmeldung für den VP (z.B. VNB bestätigt / Klärfall)..." style="width:100%;padding:6px 8px;border:1px solid #94a3b8;border-radius:6px;font-size:0.8rem;font-family:inherit;">${escapeHtml(o.statusMessage || '')}</textarea>
                </td>
                <td>
                    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;">
                        <input type="number" step="0.5" data-adm-field="commissionAmount" value="${Number(o.commissionAmount || 0)}" style="width:78px;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-weight:700;font-size:0.8rem;">
                        <span style="font-size:0.8rem;font-weight:700;">€</span>
                    </div>
                    <select data-adm-field="commissionStatus" style="width:100%;padding:5px 7px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.76rem;font-weight:700;">
                        ${commStatuses.map(cs => `<option value="${cs}" ${o.commissionStatus === cs ? 'selected' : ''}>${cs}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <button type="button" data-adm-save-order="${o.id}" class="btn btn-primary" style="border:none;padding:7px 12px;font-size:0.78rem;border-radius:8px;cursor:pointer;white-space:nowrap;">💾 Speichern</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('textarea[data-adm-field="statusMessage"]').forEach(ta => {
            ta.addEventListener('focus', () => { lastFocusedStatusInput = ta; });
        });

        tbody.querySelectorAll('[data-adm-save-order]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const orderId = btn.getAttribute('data-adm-save-order');
                const row = tbody.querySelector(`tr[data-adm-order-row="${orderId}"]`);
                if (!row) return;
                const payload = {
                    partnerCode: row.querySelector('[data-adm-field="partnerCode"]')?.value.trim() || '',
                    status: row.querySelector('[data-adm-field="status"]')?.value || 'RECEIVED',
                    supplyStartDate: row.querySelector('[data-adm-field="supplyStartDate"]')?.value || '',
                    statusMessage: row.querySelector('[data-adm-field="statusMessage"]')?.value.trim() || '',
                    commissionAmount: parseFloat(row.querySelector('[data-adm-field="commissionAmount"]')?.value || '0') || 0,
                    commissionStatus: row.querySelector('[data-adm-field="commissionStatus"]')?.value || 'PENDING'
                };
                btn.textContent = '⏳...';
                try {
                    const adminToken = localStorage.getItem('adminToken');
                    const res = await fetch(`/api/admin/energy-orders/${orderId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${adminToken}`
                        },
                        body: JSON.stringify(payload)
                    });
                    const d = await res.json();
                    if (!res.ok || !d.success) throw new Error(d.error || 'Fehler');
                    btn.textContent = '✓ Gespeichert';
                    btn.style.background = '#16a34a';
                    setTimeout(() => {
                        btn.textContent = '💾 Speichern';
                        btn.style.background = '';
                    }, 1600);
                    await loadPartnerCockpit();
                } catch (err) {
                    btn.textContent = 'Fehler!';
                }
            });
        });
    }

    function renderVpAdminPartnersTab(data) {
        const partners = data.partners || [];
        const origin = window.location.origin || 'https://alpha-energie.de';

        // Populate parent agency select
        const parentSel = document.getElementById('admVpParentPartner');
        if (parentSel) {
            const agencies = partners.filter(p => p.role === 'AGENCY');
            parentSel.innerHTML = `<option value="">-- Keine (Direkt unter Alpha Energie) --</option>` +
                agencies.map(a => `<option value="${a.id}">${escapeHtml(a.partnerCode)} – ${escapeHtml(a.companyName || a.fullName)}</option>`).join('');
        }

        const tbody = document.getElementById('vpAdminPartnersTableBody');
        if (!tbody) return;

        if (partners.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:18px;color:#64748b;">Noch keine Vertriebspartner angelegt.</td></tr>`;
            return;
        }

        tbody.innerHTML = partners.map(p => {
            const affLink = `${origin}/versorger?ref=${encodeURIComponent(p.partnerCode)}`;
            return `
                <tr>
                    <td>
                        <strong style="color:#0a1f44;font-size:0.9rem;">${escapeHtml(p.partnerCode)}</strong>
                        <div style="margin-top:3px;">${statusBadgeHtml(p.status)} <span style="font-size:0.74rem;font-weight:700;color:#ea580c;">${escapeHtml(p.role)}</span></div>
                    </td>
                    <td>
                        <strong>${escapeHtml(p.fullName)}</strong>
                        ${p.companyName ? `<div style="font-size:0.76rem;color:#0a1f44;font-weight:600;">${escapeHtml(p.companyName)} (${escapeHtml(p.legalForm || '')})</div>` : ''}
                        <div style="font-size:0.74rem;color:#64748b;">${escapeHtml(p.email)} · ${escapeHtml(p.phone || '-')}</div>
                        <div style="font-size:0.73rem;color:#64748b;">${escapeHtml(p.street || '')} ${escapeHtml(p.houseNr || '')}, ${escapeHtml(p.plz || '')} ${escapeHtml(p.city || '')}</div>
                    </td>
                    <td style="min-width:230px;">
                        <div style="display:flex;gap:5px;align-items:center;">
                            <input type="text" readonly value="${escapeHtml(affLink)}" style="flex:1;padding:5px 8px;font-size:0.76rem;border:1px solid #fdba74;border-radius:6px;background:#fff7ed;color:#0a1f44;font-weight:700;">
                            <button type="button" data-copy-vp-aff="${escapeHtml(affLink)}" style="background:#ff7a00;color:#fff;border:none;border-radius:6px;padding:5px 9px;font-size:0.74rem;font-weight:700;cursor:pointer;">Kopieren</button>
                        </div>
                    </td>
                    <td>
                        <div style="font-size:0.76rem;font-weight:700;color:${p.isVatLiable ? '#0369a1' : '#475569'};">
                            ${p.isVatLiable ? 'Regelbesteuert (19% USt.)' : 'Kleinunternehmer (§ 19 UStG)'}
                        </div>
                        <div style="font-size:0.73rem;color:#64748b;">St-Nr./USt-ID: ${escapeHtml(p.vatId || p.taxId || '-')}</div>
                        <div style="font-size:0.73rem;color:#334155;font-family:monospace;">${escapeHtml(p.iban || 'Keine IBAN')}</div>
                    </td>
                    <td>
                        <div style="font-size:0.76rem;font-weight:700;color:#0a1f44;">
                            Strom: ${p.stromCommissionEur} € | Gas: ${p.gasCommissionEur} € | Wärme: ${p.waermeCommissionEur} €
                        </div>
                        <div style="font-size:0.73rem;color:#64748b;">
                            Reserve: ${p.stornoReservePct ?? 10}% (${p.liabilityMonths || 12} Mon.) · Stufe: ${escapeHtml(p.commissionTier || 'PRO')}
                        </div>
                    </td>
                    <td>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;">
                            <button type="button" data-edit-vp-id="${p.id}" style="background:#f1f5f9;border:1px solid #cbd5e1;color:#0a1f44;border-radius:6px;padding:5px 9px;font-size:0.75rem;font-weight:700;cursor:pointer;">✏️ Bearbeiten</button>
                            <button type="button" data-bill-vp-id="${p.id}" style="background:#dcfce7;border:1px solid #86efac;color:#15803d;border-radius:6px;padding:5px 9px;font-size:0.75rem;font-weight:700;cursor:pointer;">💶 Abrechnen</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('[data-copy-vp-aff]').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard?.writeText(btn.getAttribute('data-copy-vp-aff')).catch(() => {});
                btn.textContent = '✓';
                setTimeout(() => { btn.textContent = 'Kopieren'; }, 1500);
            });
        });

        tbody.querySelectorAll('[data-edit-vp-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-edit-vp-id'), 10);
                const partner = partners.find(x => x.id === id);
                if (!partner) return;
                loadPartnerIntoAdminForm(partner);
            });
        });

        tbody.querySelectorAll('[data-bill-vp-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-bill-vp-id');
                switchCockpitTab('admin-billing');
                const billSel = document.getElementById('billPartnerSelect');
                if (billSel) {
                    billSel.value = String(id);
                    billSel.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    function loadPartnerIntoAdminForm(p) {
        const setVal = (id, v) => {
            const el = document.getElementById(id);
            if (el) el.value = v ?? '';
        };
        setVal('admVpEditId', p.id);
        setVal('admVpSalutation', p.salutation || 'Herr');
        setVal('admVpFirstName', p.firstName || '');
        setVal('admVpLastName', p.lastName || '');
        setVal('admVpEmail', p.email || '');
        setVal('admVpPhone', p.phone || '');
        setVal('admVpBirthDate', p.birthDate || '');
        setVal('admVpRole', p.role || 'D2D');
        setVal('admVpCode', p.partnerCode || '');
        setVal('admVpPassword', '');
        setVal('admVpCompany', p.companyName || '');
        setVal('admVpLegalForm', p.legalForm || 'Einzelunternehmen');
        setVal('admVpWebsite', p.website || '');
        setVal('admVpStreet', p.street || '');
        setVal('admVpHouseNr', p.houseNr || '');
        setVal('admVpPlz', p.plz || '');
        setVal('admVpCity', p.city || '');
        setVal('admVpIhk', p.ihkNumber || '');
        setVal('admVpGewerbeCity', p.gewerbeamtCity || '');
        setVal('admVpVatMode', p.isVatLiable ? 'true' : 'false');
        setVal('admVpTaxId', p.taxId || '');
        setVal('admVpVatId', p.vatId || '');
        setVal('admVpTaxOffice', p.taxOffice || '');
        setVal('admVpIban', p.iban || '');
        setVal('admVpBic', p.bic || '');
        setVal('admVpBankName', p.bankName || '');
        setVal('admVpStromComm', p.stromCommissionEur ?? 65);
        setVal('admVpGasComm', p.gasCommissionEur ?? 65);
        setVal('admVpWaermeComm', p.waermeCommissionEur ?? 75);
        setVal('admVpLadestromComm', p.ladestromCommissionEur ?? p.stromCommissionEur ?? 65);
        setVal('admVpTippComm', p.tippgeberCommissionEur ?? 35);
        setVal('admVpOverrideComm', p.overrideCommissionEur ?? 10);
        setVal('admVpStornoPct', p.stornoReservePct ?? 10);
        setVal('admVpLiabilityMonths', p.liabilityMonths ?? 12);
        setVal('admVpTier', p.commissionTier || 'PRO');
        setVal('admVpParentPartner', p.parentPartnerId || '');
        setVal('admVpRemarks', p.adminRemarks || '');

        const saveBtn = document.getElementById('btnAdmSavePartner');
        if (saveBtn) saveBtn.textContent = `💾 Änderungen für ${p.partnerCode} speichern`;
        document.getElementById('vpAdminCreatePartnerForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderVpAdminBillingTab(data) {
        const partners = data.partners || [];
        const payouts = data.payouts || [];

        const billPartnerSel = document.getElementById('billPartnerSelect');
        if (billPartnerSel) {
            const prev = billPartnerSel.value;
            billPartnerSel.innerHTML = `<option value="">-- Bitte Vertriebspartner wählen (${partners.length}) --</option>` +
                partners.map(p => `<option value="${p.id}">${escapeHtml(p.partnerCode)} – ${escapeHtml(p.companyName || p.fullName)} (${p.isVatLiable ? '19% USt.' : '§ 19 UStG'})</option>`).join('');
            if (prev) billPartnerSel.value = prev;
        }

        const payoutsTbody = document.getElementById('vpAdminAllPayoutsTableBody');
        if (payoutsTbody) {
            if (payouts.length === 0) {
                payoutsTbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:18px;color:#64748b;">Noch keine Gutschriften vorhanden.</td></tr>`;
            } else {
                payoutsTbody.innerHTML = payouts.map(po => {
                    const p = partners.find(x => x.id === po.partnerId);
                    return `
                        <tr>
                            <td><strong>${escapeHtml(po.payoutNumber)}</strong><div style="font-size:0.74rem;color:#64748b;">${formatDate(po.createdAt)}</div></td>
                            <td>
                                <strong>${escapeHtml(p ? (p.companyName || p.fullName) : `Partner #${po.partnerId}`)}</strong>
                                <div style="font-size:0.74rem;color:#64748b;">Code: ${escapeHtml(p ? p.partnerCode : '-')}</div>
                            </td>
                            <td>
                                <strong>${escapeHtml(po.periodLabel)}</strong>
                                <div style="font-size:0.74rem;color:#64748b;">${po.ordersCount} Positionen</div>
                            </td>
                            <td>
                                <div style="font-size:0.76rem;">Basis: ${formatEur(po.subTotalEur || po.netAmount)}</div>
                                ${po.stornoReserveAmount > 0 ? `<div style="font-size:0.74rem;color:#d97706;">Reserve: -${formatEur(po.stornoReserveAmount)}</div>` : ''}
                            </td>
                            <td style="font-weight:700;">${formatEur(po.netAmount)}</td>
                            <td>${formatEur(po.vatAmount)}</td>
                            <td style="font-weight:800;color:#0a1f44;">${formatEur(po.grossAmount)}</td>
                            <td>
                                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                                    ${statusBadgeHtml(po.status)}
                                    ${po.status !== 'PAID' ? `<button type="button" data-adm-mark-paid="${po.id}" style="background:#16a34a;color:#fff;border:none;border-radius:6px;padding:3px 8px;font-size:0.73rem;font-weight:700;cursor:pointer;">✓ Als bezahlt buchen</button>` : ''}
                                    <a href="/api/partner/payouts/${po.id}/pdf" target="_blank" style="background:#fff7ed;border:1px solid #fdba74;color:#ea580c;border-radius:6px;padding:3px 8px;font-size:0.74rem;font-weight:700;text-decoration:none;">📄 PDF</a>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');

                payoutsTbody.querySelectorAll('[data-adm-mark-paid]').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const id = btn.getAttribute('data-adm-mark-paid');
                        const adminToken = localStorage.getItem('adminToken');
                        await fetch(`/api/admin/payouts/${id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${adminToken}`
                            },
                            body: JSON.stringify({ status: 'PAID' })
                        });
                        await loadPartnerCockpit();
                    });
                });
            }
        }
    }

    function initVpAdminInteractions() {
        // 1. Order filters & status preset pills
        const filterPartnerSel = document.getElementById('vpAdminOrdersFilterPartner');
        const filterStatusSel = document.getElementById('vpAdminOrdersFilterStatus');
        const refreshOrdersBtn = document.getElementById('btnVpAdminRefreshOrders');

        if (filterPartnerSel && !filterPartnerSel.dataset.bound) {
            filterPartnerSel.dataset.bound = '1';
            filterPartnerSel.addEventListener('change', () => {
                if (adminPortalData) renderVpAdminOrdersTab(adminPortalData);
            });
        }
        if (filterStatusSel && !filterStatusSel.dataset.bound) {
            filterStatusSel.dataset.bound = '1';
            filterStatusSel.addEventListener('change', () => {
                if (adminPortalData) renderVpAdminOrdersTab(adminPortalData);
            });
        }
        if (refreshOrdersBtn && !refreshOrdersBtn.dataset.bound) {
            refreshOrdersBtn.dataset.bound = '1';
            refreshOrdersBtn.addEventListener('click', () => loadPartnerCockpit());
        }

        document.querySelectorAll('[data-status-preset]').forEach(pill => {
            if (pill.dataset.bound) return;
            pill.dataset.bound = '1';
            pill.addEventListener('click', () => {
                const presetText = pill.getAttribute('data-status-preset') || '';
                const targetTa = lastFocusedStatusInput || document.querySelector('#vpAdminAllOrdersTableBody textarea[data-adm-field="statusMessage"]');
                if (targetTa) {
                    targetTa.value = presetText;
                    targetTa.focus();
                }
            });
        });

        // 2. Admin Create / Edit Partner Form
        bindLiveIbanCheck('admVpIban', 'admVpIbanBadge', 'admVpBic', 'admVpBankName');

        const roleSel = document.getElementById('admVpRole');
        if (roleSel && !roleSel.dataset.bound) {
            roleSel.dataset.bound = '1';
            roleSel.addEventListener('change', () => {
                const r = roleSel.value;
                const defaults = {
                    D2D: { strom: 65, gas: 65, waerme: 75, lade: 65, override: 0, reserve: 10 },
                    AFFILIATE: { strom: 55, gas: 55, waerme: 65, lade: 55, override: 0, reserve: 10 },
                    TIPPGEBER: { strom: 35, gas: 35, waerme: 40, lade: 35, override: 0, reserve: 0 },
                    AGENCY: { strom: 75, gas: 75, waerme: 85, lade: 75, override: 15, reserve: 10 }
                }[r] || { strom: 60, gas: 60, waerme: 70, lade: 60, override: 0, reserve: 10 };
                document.getElementById('admVpStromComm').value = defaults.strom;
                document.getElementById('admVpGasComm').value = defaults.gas;
                document.getElementById('admVpWaermeComm').value = defaults.waerme;
                document.getElementById('admVpLadestromComm').value = defaults.lade;
                document.getElementById('admVpOverrideComm').value = defaults.override;
                document.getElementById('admVpStornoPct').value = defaults.reserve;
            });
        }

        const resetPartnerBtn = document.getElementById('btnAdmResetPartnerForm');
        const createPartnerForm = document.getElementById('vpAdminCreatePartnerForm');
        if (resetPartnerBtn && !resetPartnerBtn.dataset.bound) {
            resetPartnerBtn.dataset.bound = '1';
            resetPartnerBtn.addEventListener('click', () => {
                createPartnerForm?.reset();
                document.getElementById('admVpEditId').value = '';
                const saveBtn = document.getElementById('btnAdmSavePartner');
                if (saveBtn) saveBtn.textContent = '➕ Vertriebspartner speichern & Versorgerseite-Affiliate-Link erzeugen';
            });
        }

        if (createPartnerForm && !createPartnerForm.dataset.bound) {
            createPartnerForm.dataset.bound = '1';
            createPartnerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const editId = document.getElementById('admVpEditId')?.value.trim() || '';
                const resultBox = document.getElementById('admCreateVpResultBox');
                if (resultBox) resultBox.style.display = 'none';

                const firstName = document.getElementById('admVpFirstName')?.value.trim() || '';
                const lastName = document.getElementById('admVpLastName')?.value.trim() || '';
                const payload = {
                    salutation: document.getElementById('admVpSalutation')?.value || 'Herr',
                    firstName,
                    lastName,
                    fullName: `${firstName} ${lastName}`.trim(),
                    email: document.getElementById('admVpEmail')?.value.trim() || '',
                    phone: document.getElementById('admVpPhone')?.value.trim() || '',
                    birthDate: document.getElementById('admVpBirthDate')?.value || '',
                    role: document.getElementById('admVpRole')?.value || 'D2D',
                    partnerCode: document.getElementById('admVpCode')?.value.trim() || undefined,
                    password: document.getElementById('admVpPassword')?.value || undefined,
                    companyName: document.getElementById('admVpCompany')?.value.trim() || '',
                    legalForm: document.getElementById('admVpLegalForm')?.value || 'Einzelunternehmen',
                    website: document.getElementById('admVpWebsite')?.value.trim() || '',
                    street: document.getElementById('admVpStreet')?.value.trim() || '',
                    houseNr: document.getElementById('admVpHouseNr')?.value.trim() || '',
                    plz: document.getElementById('admVpPlz')?.value.trim() || '',
                    city: document.getElementById('admVpCity')?.value.trim() || '',
                    ihkNumber: document.getElementById('admVpIhk')?.value.trim() || '',
                    gewerbeamtCity: document.getElementById('admVpGewerbeCity')?.value.trim() || '',
                    isVatLiable: document.getElementById('admVpVatMode')?.value === 'true',
                    taxId: document.getElementById('admVpTaxId')?.value.trim() || '',
                    vatId: document.getElementById('admVpVatId')?.value.trim() || '',
                    taxOffice: document.getElementById('admVpTaxOffice')?.value.trim() || '',
                    iban: document.getElementById('admVpIban')?.value.trim() || '',
                    bic: document.getElementById('admVpBic')?.value.trim() || '',
                    bankName: document.getElementById('admVpBankName')?.value.trim() || '',
                    stromCommissionEur: parseFloat(document.getElementById('admVpStromComm')?.value || '65') || 65,
                    gasCommissionEur: parseFloat(document.getElementById('admVpGasComm')?.value || '65') || 65,
                    waermeCommissionEur: parseFloat(document.getElementById('admVpWaermeComm')?.value || '75') || 75,
                    ladestromCommissionEur: parseFloat(document.getElementById('admVpLadestromComm')?.value || '65') || 65,
                    tippgeberCommissionEur: parseFloat(document.getElementById('admVpTippComm')?.value || '35') || 35,
                    overrideCommissionEur: parseFloat(document.getElementById('admVpOverrideComm')?.value || '0') || 0,
                    stornoReservePct: parseFloat(document.getElementById('admVpStornoPct')?.value || '10') || 0,
                    liabilityMonths: parseInt(document.getElementById('admVpLiabilityMonths')?.value || '12', 10) || 12,
                    commissionTier: document.getElementById('admVpTier')?.value || 'PRO',
                    parentPartnerId: document.getElementById('admVpParentPartner')?.value || null,
                    adminRemarks: document.getElementById('admVpRemarks')?.value.trim() || ''
                };

                try {
                    const adminToken = localStorage.getItem('adminToken');
                    const url = editId ? `/api/admin/partner-users/${editId}` : '/api/admin/partner-users';
                    const method = editId ? 'PATCH' : 'POST';
                    const res = await fetch(url, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${adminToken}`
                        },
                        body: JSON.stringify(payload)
                    });
                    const d = await res.json();
                    if (!res.ok || !d.success) throw new Error(d.error || 'Fehler beim Speichern des Vertriebspartners.');

                    const p = d.partner;
                    const origin = window.location.origin || 'https://alpha-energie.de';
                    const affUrl = `${origin}/versorger?ref=${encodeURIComponent(p.partnerCode)}`;

                    if (resultBox) {
                        resultBox.style.display = 'block';
                        resultBox.style.background = '#dcfce7';
                        resultBox.style.border = '1px solid #86efac';
                        resultBox.style.color = '#14532d';
                        resultBox.innerHTML = `
                            <div style="font-weight:800;font-size:0.95rem;margin-bottom:6px;">
                                ✅ Vertriebspartner ${escapeHtml(p.fullName)} (${escapeHtml(p.partnerCode)}) erfolgreich ${editId ? 'aktualisiert' : 'angelegt'}!
                            </div>
                            <div style="font-size:0.84rem;margin-bottom:8px;">
                                Login im <code>/vp</code>: <strong>${escapeHtml(p.email)}</strong> (oder Code: <strong>${escapeHtml(p.partnerCode)}</strong>) ${d.generatedPassword ? `· Passwort: <strong>${escapeHtml(d.generatedPassword)}</strong>` : ''}
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                                <span style="font-size:0.82rem;font-weight:700;">🔗 Persönlicher Versorgerseite-Affiliate-Link:</span>
                                <input type="text" readonly value="${escapeHtml(affUrl)}" style="flex:1;min-width:220px;padding:6px 10px;border-radius:6px;border:1px solid #16a34a;background:#fff;font-weight:700;font-size:0.84rem;">
                            </div>
                        `;
                    }
                    document.getElementById('admVpEditId').value = '';
                    const saveBtn = document.getElementById('btnAdmSavePartner');
                    if (saveBtn) saveBtn.textContent = '➕ Vertriebspartner speichern & Versorgerseite-Affiliate-Link erzeugen';
                    await loadPartnerCockpit();
                } catch (err) {
                    if (resultBox) {
                        resultBox.style.display = 'block';
                        resultBox.style.background = '#fee2e2';
                        resultBox.style.color = '#b91c1c';
                        resultBox.textContent = err.message;
                    }
                }
            });
        }

        // 3. Admin Abrechnungstool (Gutschrifts-Generator)
        const billPartnerSel = document.getElementById('billPartnerSelect');
        const billSelectAll = document.getElementById('billSelectAllOrders');
        const billOrdersContainer = document.getElementById('billSelectableOrdersContainer');
        const billStornoPct = document.getElementById('billStornoPct');
        const billStornoRelease = document.getElementById('billStornoRelease');
        const billBonusEur = document.getElementById('billBonusEur');
        const billCustomNet = document.getElementById('billCustomNet');
        const billingForm = document.getElementById('vpAdminBillingForm');

        function recalculateLiveBillingPreview() {
            const partnerId = parseInt(billPartnerSel?.value || '0', 10);
            const partners = (adminPortalData && adminPortalData.partners) || [];
            const partner = partners.find(p => p.id === partnerId);

            const checkedBoxes = billOrdersContainer
                ? Array.from(billOrdersContainer.querySelectorAll('input[data-bill-order-id]:checked'))
                : [];
            let subTotal = checkedBoxes.reduce((s, cb) => s + (parseFloat(cb.getAttribute('data-bill-amount') || '0') || 0), 0);

            const customVal = parseFloat(billCustomNet?.value || '0');
            if (customVal > 0) subTotal = customVal;

            const resPct = Math.max(0, Math.min(50, parseFloat(billStornoPct?.value || '0') || 0));
            const resEur = Number(((subTotal * resPct) / 100).toFixed(2));
            const releaseEur = Math.max(0, parseFloat(billStornoRelease?.value || '0') || 0);
            const bonusEur = Math.max(0, parseFloat(billBonusEur?.value || '0') || 0);
            const netEur = Number(Math.max(0, subTotal - resEur + releaseEur + bonusEur).toFixed(2));
            const isVat = partner ? Boolean(partner.isVatLiable) : false;
            const vatEur = isVat ? Number((netEur * 0.19).toFixed(2)) : 0;
            const grossEur = Number((netEur + vatEur).toFixed(2));

            const taxLbl = document.getElementById('billLiveTaxLabel');
            const breakdownTxt = document.getElementById('billLiveBreakdownText');
            const grossTxt = document.getElementById('billLiveGrossTotal');

            if (taxLbl) {
                taxLbl.textContent = partner
                    ? (isVat ? 'Regelbesteuert zzgl. 19% USt.' : 'Kleinunternehmer § 19 UStG · 0% USt.')
                    : 'Bitte Partner wählen';
            }
            if (breakdownTxt) {
                breakdownTxt.textContent = `Zwischensumme: ${formatEur(subTotal)} | ./. Stornoreserve (${resPct}%): -${formatEur(resEur)} | + Freigabe/Bonus: +${formatEur(releaseEur + bonusEur)} | Netto: ${formatEur(netEur)} | USt.: ${formatEur(vatEur)}`;
            }
            if (grossTxt) {
                grossTxt.textContent = formatEur(grossEur);
            }
        }

        if (billPartnerSel && !billPartnerSel.dataset.bound) {
            billPartnerSel.dataset.bound = '1';
            billPartnerSel.addEventListener('change', () => {
                const partnerId = parseInt(billPartnerSel.value || '0', 10);
                const partners = (adminPortalData && adminPortalData.partners) || [];
                const orders = (adminPortalData && adminPortalData.orders) || [];
                const partner = partners.find(p => p.id === partnerId);

                if (partner && billStornoPct) {
                    billStornoPct.value = partner.stornoReservePct ?? 10;
                }

                if (!partner || !billOrdersContainer) {
                    if (billOrdersContainer) billOrdersContainer.innerHTML = `<div style="color:#64748b;padding:8px 0;">Bitte oben einen Vertriebspartner auswählen...</div>`;
                    recalculateLiveBillingPreview();
                    return;
                }

                const eligibleOrders = orders.filter(o =>
                    (o.partnerId === partner.id || o.partnerCode === partner.partnerCode) &&
                    (o.commissionStatus === 'PENDING' || o.commissionStatus === 'APPROVED') &&
                    o.status !== 'CANCELLED'
                );

                if (eligibleOrders.length === 0) {
                    billOrdersContainer.innerHTML = `<div style="color:#d97706;font-weight:600;padding:8px 0;">Keine offenen/unabgerechneten Aufträge für ${escapeHtml(partner.partnerCode)} gefunden. Sie können unten optional einen manuellen Netto-Betrag oder eine Stornoreserve-Freigabe eintragen.</div>`;
                } else {
                    billOrdersContainer.innerHTML = eligibleOrders.map(o => `
                        <label style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #e2e8f0;cursor:pointer;">
                            <span>
                                <input type="checkbox" data-bill-order-id="${o.id}" data-bill-amount="${Number(o.commissionAmount || 0)}" checked style="margin-right:8px;">
                                <strong>${escapeHtml(o.orderNumber)}</strong> · ${escapeHtml(o.firstName)} ${escapeHtml(o.lastName)} (${escapeHtml(o.city || o.plz)}) · <em>${escapeHtml(o.tariffName)}</em>
                                ${statusBadgeHtml(o.status)}
                            </span>
                            <strong style="color:#0a1f44;">${formatEur(o.commissionAmount)}</strong>
                        </label>
                    `).join('');

                    billOrdersContainer.querySelectorAll('input[data-bill-order-id]').forEach(cb => {
                        cb.addEventListener('change', recalculateLiveBillingPreview);
                    });
                }
                recalculateLiveBillingPreview();
            });
        }

        if (billSelectAll && !billSelectAll.dataset.bound) {
            billSelectAll.dataset.bound = '1';
            billSelectAll.addEventListener('change', () => {
                if (!billOrdersContainer) return;
                billOrdersContainer.querySelectorAll('input[data-bill-order-id]').forEach(cb => {
                    cb.checked = billSelectAll.checked;
                });
                recalculateLiveBillingPreview();
            });
        }

        [billStornoPct, billStornoRelease, billBonusEur, billCustomNet].forEach(inp => {
            if (inp && !inp.dataset.bound) {
                inp.dataset.bound = '1';
                inp.addEventListener('input', recalculateLiveBillingPreview);
            }
        });

        if (billingForm && !billingForm.dataset.bound) {
            billingForm.dataset.bound = '1';
            billingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const feedback = document.getElementById('billCreateFeedback');
                if (feedback) feedback.style.display = 'none';

                const partnerId = parseInt(billPartnerSel?.value || '0', 10);
                if (!partnerId) return;

                const selectedIds = billOrdersContainer
                    ? Array.from(billOrdersContainer.querySelectorAll('input[data-bill-order-id]:checked')).map(cb => parseInt(cb.getAttribute('data-bill-order-id'), 10))
                    : [];

                const payload = {
                    partnerId,
                    periodLabel: document.getElementById('billPeriodLabel')?.value.trim() || 'Provisionsabrechnung',
                    markPaid: document.getElementById('billStatusSelect')?.value === 'PAID',
                    orderIds: selectedIds,
                    stornoReservePct: parseFloat(billStornoPct?.value || '0') || 0,
                    stornoReleaseAmount: parseFloat(billStornoRelease?.value || '0') || 0,
                    bonusAmount: parseFloat(billBonusEur?.value || '0') || 0,
                    customNetAmount: billCustomNet?.value ? parseFloat(billCustomNet.value) : undefined,
                    remark: document.getElementById('billRemark')?.value.trim() || ''
                };

                try {
                    const adminToken = localStorage.getItem('adminToken');
                    const res = await fetch('/api/admin/payouts/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${adminToken}`
                        },
                        body: JSON.stringify(payload)
                    });
                    const d = await res.json();
                    if (!res.ok || !d.success) throw new Error(d.error || 'Fehler beim Erstellen der Gutschrift.');

                    if (feedback) {
                        feedback.style.display = 'block';
                        feedback.style.background = '#dcfce7';
                        feedback.style.color = '#14532d';
                        feedback.innerHTML = `
                            ✅ <strong>Gutschrift ${escapeHtml(d.payout.payoutNumber)} über ${formatEur(d.payout.grossAmount)} (Brutto) erfolgreich erstellt!</strong>
                            <a href="/api/partner/payouts/${d.payout.id}/pdf" target="_blank" style="margin-left:12px;background:#0a1f44;color:#fff;padding:5px 12px;border-radius:6px;text-decoration:none;font-size:0.82rem;">📄 PDF-Gutschrift jetzt öffnen</a>
                        `;
                    }
                    await loadPartnerCockpit();
                } catch (err) {
                    if (feedback) {
                        feedback.style.display = 'block';
                        feedback.style.background = '#fee2e2';
                        feedback.style.color = '#b91c1c';
                        feedback.textContent = err.message;
                    }
                }
            });
        }
    }

    // Initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-cockpit-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                switchCockpitTab(btn.getAttribute('data-cockpit-tab'));
            });
        });

        initPublicCommissionCalculator();
        initAuthForms();
        initD2dTabInteractions();

        const params = new URLSearchParams(window.location.search);
        const signToken = params.get('sign');
        if (signToken) {
            initRemoteCustomerSignFlow(signToken);
            return;
        }

        if (currentToken || localStorage.getItem('adminToken')) {
            loadPartnerCockpit();
        }
    });
})();
