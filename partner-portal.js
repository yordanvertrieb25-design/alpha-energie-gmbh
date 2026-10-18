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
            CONFIRMED: { bg: '#dcfce7', color: '#15803d', label: 'Bestätigt' },
            PAID: { bg: '#d1fae5', color: '#047857', label: 'Ausgezahlt' },
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
            await loadPartnerCockpit();
        } catch (err) {
            if (errEl) {
                errEl.textContent = err.message;
                errEl.style.display = 'block';
            }
        }
    }

    function initAuthForms() {
        // 1-Click Demo Buttons
        document.querySelectorAll('[data-demo-role]').forEach(btn => {
            btn.addEventListener('click', () => {
                const demoRole = btn.getAttribute('data-demo-role');
                performLogin({ demoRole });
            });
        });

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
                const parentPartnerCode = document.getElementById('reg-parent-code')?.value.trim() || '';

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
                localStorage.removeItem(STORAGE_TOKEN_KEY);
                localStorage.removeItem(STORAGE_USER_KEY);
                const publicSec = document.getElementById('publicPortalAuthSection');
                const cockpitSec = document.getElementById('partnerCockpitSection');
                if (cockpitSec) cockpitSec.style.display = 'none';
                if (publicSec) publicSec.style.display = 'block';
            });
        }
    }

    // =========================================================================
    // 3. LOGGED-IN PARTNER COCKPIT (7 TABS)
    // =========================================================================
    function switchCockpitTab(tabId) {
        document.querySelectorAll('[data-cockpit-tab]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-cockpit-tab') === tabId);
        });
        document.querySelectorAll('.cockpit-tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `cockpit-pane-${tabId}`);
        });
    }

    async function loadPartnerCockpit() {
        if (!currentToken) return;
        const publicSec = document.getElementById('publicPortalAuthSection');
        const cockpitSec = document.getElementById('partnerCockpitSection');

        try {
            const res = await fetch('/api/partner/dashboard', {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem(STORAGE_TOKEN_KEY);
                currentToken = null;
                if (cockpitSec) cockpitSec.style.display = 'none';
                if (publicSec) publicSec.style.display = 'block';
                return;
            }
            const data = await res.json();
            if (!data.success) return;

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
            ratesEl.textContent = `Strom: ${partner.stromCommissionEur} € | Gas: ${partner.gasCommissionEur} € | Wärme: ${partner.waermeCommissionEur} €${partner.overrideCommissionEur > 0 ? ' | Override: ' + partner.overrideCommissionEur + ' €' : ''}`;
        }
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
            const recent = (data.orders || []).slice(0, 6);
            if (recent.length === 0) {
                recentTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:18px;color:#64748b;">Noch keine Verträge eingereicht. Nutzen Sie den D2D-Tarifrechner oder teilen Sie Ihren Affiliate-Link.</td></tr>`;
            } else {
                recentTbody.innerHTML = recent.map(o => `
                    <tr>
                        <td><strong>${escapeHtml(o.orderNumber)}</strong><div style="font-size:0.75rem;color:#64748b;">${formatDate(o.createdAt)}</div></td>
                        <td>${escapeHtml(o.firstName)} ${escapeHtml(o.lastName)}<div style="font-size:0.75rem;color:#64748b;">${escapeHtml(o.plz)} ${escapeHtml(o.city)}</div></td>
                        <td>${escapeHtml(o.tariffName)}<div style="font-size:0.75rem;color:#64748b;">${Number(o.consumption || 0).toLocaleString('de-DE')} kWh</div></td>
                        <td><span style="font-size:0.78rem;font-weight:600;color:#334155;">${escapeHtml(o.orderSource || 'ONLINE')}</span>${o.subId ? `<div style="font-size:0.72rem;color:#64748b;">Sub: ${escapeHtml(o.subId)}</div>` : ''}</td>
                        <td>${statusBadgeHtml(o.status)}</td>
                        <td style="font-weight:700;color:#0a1f44;">${formatEur(o.commissionAmount)}<div style="margin-top:2px;">${statusBadgeHtml(o.commissionStatus)}</div></td>
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
            const plz = (plzInput?.value || '44379').replace(/\D/g, '').slice(0, 5) || '44379';
            const branch = branchSel?.value || 'strom';
            const kwh = parseInt(kwhInput?.value, 10) || (branch === 'gas' ? 12000 : 3000);

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
                return `
                    <div class="d2d-tariff-card ${isSel ? 'selected' : ''}" data-d2d-tariff-idx="${idx}" style="border:2px solid ${isSel ? '#ff7a00' : '#e2e8f0'};border-radius:14px;padding:16px;background:${isSel ? '#fff7ed' : '#ffffff'};cursor:pointer;transition:all 0.2s;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
                            <strong style="color:#0a1f44;font-size:1rem;">${escapeHtml(t.name)}</strong>
                            <span style="background:#dcfce7;color:#15803d;font-size:0.74rem;font-weight:700;padding:3px 8px;border-radius:999px;">+${formatEur(partnerComm)} Provision</span>
                        </div>
                        <div style="font-size:1.35rem;font-weight:800;color:#0a1f44;margin-bottom:6px;">${Number(t.monthlyPayment || 0)} € <span style="font-size:0.82rem;font-weight:500;color:#64748b;">/ Monat Abschlag</span></div>
                        <div style="font-size:0.82rem;color:#475569;">Arbeitspreis: <strong>${workCt} ct/kWh</strong> · Grundpreis: <strong>${baseEur} €/Mon.</strong></div>
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

        if (calcBtn) calcBtn.addEventListener('click', runD2dCalculation);

        // Live IBAN check on D2D Order IBAN
        bindLiveIbanCheck('d2dOrderIban', 'd2dOrderIbanBadge', null, null);

        // Signature Mode Toggle (PAD vs REMOTE)
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

        // Submit D2D Order
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

    // Affiliate Link Builder, QR-Code & Sub-ID Stats
    function renderAffiliateTab(data) {
        const partner = data.partner;
        const targetPageSel = document.getElementById('affTargetPageSelect');
        const subIdInput = document.getElementById('affSubIdInput');
        const generatedUrlInput = document.getElementById('affGeneratedUrlInput');
        const embedCodeArea = document.getElementById('affWidgetEmbedCode');
        const qrCanvas = document.getElementById('affQrCodeCanvas');

        function updateAffiliateAssets() {
            const origin = window.location.origin || 'https://alpha-energie.de';
            const page = targetPageSel ? targetPageSel.value : '/versorger.html';
            const sub = subIdInput ? subIdInput.value.trim() : '';
            const code = partner ? partner.partnerCode : 'AFF-PARTNER';
            const sep = page.includes('?') ? '&' : '?';
            const url = `${origin}${page}${sep}ref=${encodeURIComponent(code)}${sub ? '&subid=' + encodeURIComponent(sub) : ''}`;

            if (generatedUrlInput) generatedUrlInput.value = url;
            if (embedCodeArea) {
                embedCodeArea.value = `<iframe src="${origin}/versorger.html?ref=${encodeURIComponent(code)}${sub ? '&subid=' + encodeURIComponent(sub) : ''}#rechner" width="100%" height="680" style="border:0;border-radius:16px;overflow:hidden;" loading="lazy"></iframe>`;
            }
            if (qrCanvas) renderQrCanvas(qrCanvas, url, code);
        }

        if (targetPageSel && !targetPageSel.dataset.bound) {
            targetPageSel.dataset.bound = '1';
            targetPageSel.addEventListener('change', updateAffiliateAssets);
        }
        if (subIdInput && !subIdInput.dataset.bound) {
            subIdInput.dataset.bound = '1';
            subIdInput.addEventListener('input', updateAffiliateAssets);
        }

        const copyBtn = document.getElementById('btnCopyAffUrl');
        if (copyBtn && !copyBtn.dataset.bound) {
            copyBtn.dataset.bound = '1';
            copyBtn.addEventListener('click', () => {
                if (generatedUrlInput) {
                    navigator.clipboard?.writeText(generatedUrlInput.value).catch(() => {});
                    copyBtn.textContent = 'Kopiert ✓';
                    setTimeout(() => { copyBtn.textContent = 'Link kopieren'; }, 1800);
                }
            });
        }

        const downloadQrBtn = document.getElementById('btnDownloadAffQr');
        if (downloadQrBtn && !downloadQrBtn.dataset.bound) {
            downloadQrBtn.dataset.bound = '1';
            downloadQrBtn.addEventListener('click', () => {
                if (!qrCanvas) return;
                const link = document.createElement('a');
                link.download = `AlphaEnergie-QR-${partner ? partner.partnerCode : 'Partner'}.png`;
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

    // All Orders Tab
    function renderOrdersTab(data) {
        const tbody = document.getElementById('allPartnerOrdersBody');
        if (!tbody) return;
        const orders = data.orders || [];
        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:18px;color:#64748b;">Keine Aufträge vorhanden.</td></tr>`;
            return;
        }
        tbody.innerHTML = orders.map(o => {
            const signStatus = o.signedAt
                ? `<span style="color:#15803d;font-size:0.76rem;font-weight:700;">✓ eSign (${formatDate(o.signedAt)})</span>`
                : (o.signatureToken
                    ? `<a href="/vertriebspartner-portal.html?sign=${encodeURIComponent(o.signatureToken)}" target="_blank" style="color:#ea580c;font-size:0.76rem;font-weight:700;text-decoration:underline;">eSign-Link öffnen</a>`
                    : `<span style="color:#64748b;font-size:0.75rem;">Online</span>`);
            return `
                <tr>
                    <td><strong>${escapeHtml(o.orderNumber)}</strong><div style="font-size:0.75rem;color:#64748b;">${formatDate(o.createdAt)}</div></td>
                    <td>${escapeHtml(o.firstName)} ${escapeHtml(o.lastName)}<div style="font-size:0.75rem;color:#64748b;">${escapeHtml(o.plz)} ${escapeHtml(o.city)}</div></td>
                    <td>${escapeHtml(o.tariffName)}<div style="font-size:0.75rem;color:#64748b;">Zähler: ${escapeHtml(o.meterNumber)}</div></td>
                    <td>${escapeHtml(o.orderSource || 'ONLINE')}${o.subId ? `<div style="font-size:0.72rem;color:#64748b;">${escapeHtml(o.subId)}</div>` : ''}</td>
                    <td>${signStatus}</td>
                    <td>${statusBadgeHtml(o.status)}</td>
                    <td style="font-weight:700;color:#0a1f44;">${formatEur(o.commissionAmount)}<div>${statusBadgeHtml(o.commissionStatus)}</div></td>
                </tr>
            `;
        }).join('');
    }

    // Agency & Downline Tab
    function renderDownlineTab(data) {
        const subTbody = document.getElementById('downlineSubPartnersBody');
        if (subTbody) {
            const subs = data.subPartners || [];
            if (subs.length === 0) {
                subTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:16px;color:#64748b;">Noch keine Unterpartner in Ihrer Downline angelegt.</td></tr>`;
            } else {
                subTbody.innerHTML = subs.map(sp => `
                    <tr>
                        <td><strong>${escapeHtml(sp.partnerCode)}</strong></td>
                        <td>${escapeHtml(sp.fullName)}<div style="font-size:0.75rem;color:#64748b;">${escapeHtml(sp.email)}</div></td>
                        <td>${escapeHtml(roleLabel(sp.role))}</td>
                        <td>${sp.stromCommissionEur} € / ${sp.gasCommissionEur} €</td>
                        <td><strong>${sp.ordersCount || 0}</strong> Verträge</td>
                        <td style="font-weight:700;color:#0a1f44;">${formatEur(sp.totalCommissionEur)}</td>
                    </tr>
                `).join('');
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
                        msg.style.display = 'block';
                        msg.style.color = '#15803d';
                        msg.textContent = `✓ Unterpartner ${resData.subPartner.fullName} (${resData.subPartner.partnerCode}) erfolgreich angelegt!`;
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

    // Payouts (PDF Gutschriften) & Profile Stammdaten Tab
    function renderPayoutsAndProfileTab(data) {
        const p = data.partner || {};
        const payoutsBody = document.getElementById('partnerPayoutsTableBody');
        if (payoutsBody) {
            const payouts = data.payouts || [];
            if (payouts.length === 0) {
                payoutsBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:16px;color:#64748b;">Noch keine Provisionsgutschriften erstellt.</td></tr>`;
            } else {
                payoutsBody.innerHTML = payouts.map(po => `
                    <tr>
                        <td><strong>${escapeHtml(po.payoutNumber)}</strong></td>
                        <td>${escapeHtml(po.periodLabel)}</td>
                        <td>${po.ordersCount}</td>
                        <td>${formatEur(po.netAmount)}</td>
                        <td>${formatEur(po.vatAmount)}</td>
                        <td style="font-weight:700;color:#0a1f44;">${formatEur(po.grossAmount)}</td>
                        <td>
                            ${statusBadgeHtml(po.status)}
                            <a href="/api/partner/payouts/${po.id}/pdf" target="_blank" style="margin-left:8px;color:#ea580c;font-weight:700;font-size:0.8rem;text-decoration:underline;">PDF Gutschrift</a>
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
        setVal('profPhone', p.phone);
        setVal('profStreet', p.street);
        setVal('profHouseNr', p.houseNr);
        setVal('profPlz', p.plz);
        setVal('profCity', p.city);
        setVal('profTaxId', p.taxId);
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
                    phone: document.getElementById('profPhone')?.value.trim() || '',
                    street: document.getElementById('profStreet')?.value.trim() || '',
                    houseNr: document.getElementById('profHouseNr')?.value.trim() || '',
                    plz: document.getElementById('profPlz')?.value.trim() || '',
                    city: document.getElementById('profCity')?.value.trim() || '',
                    taxId: document.getElementById('profTaxId')?.value.trim() || '',
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
                        msg.textContent = '✓ Stammdaten & Auszahlungskonto erfolgreich gespeichert!';
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

    // Initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        // Tab switcher inside Cockpit
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

        if (currentToken) {
            loadPartnerCockpit();
        }
    });
})();
