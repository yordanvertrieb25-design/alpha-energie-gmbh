window.onerror = function(msg, url, lineNo, columnNo, error) {
    alert("JS Error: " + msg + "\nLine: " + lineNo + "\n" + (error ? error.stack : ""));
    return false;
};
// Admin Authentication & Logic

const isLocalDev = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000';
const isFileProtocol = window.location.protocol === 'file:';
const API_URL = (isLocalDev || isFileProtocol) ? 'http://localhost:3000/api' : '/api';

// --- Login Logic ---
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('login-error');

        try {
            const res = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                window.location.href = '/admin'; // Redirect to dashboard
            } else {
                errorMsg.style.display = 'block';
                errorMsg.innerText = data.error || 'Ungültiges Passwort.';
            }
        } catch (err) {
            errorMsg.style.display = 'block';
            errorMsg.innerText = 'Fehler bei der Verbindung zum Server.';
        }
    });
}

// --- Dashboard Logic ---
if (document.querySelector('.dashboard-container')) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login';
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
    });

    let cachedPartnerApplications = [];

    // Tab Switching
    window.switchTab = function(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        const targetBtn = document.querySelector(`button[onclick="switchTab('${tabName}')"]`);
        if (targetBtn) targetBtn.classList.add('active');
        const targetContent = document.getElementById(`${tabName}-tab`);
        if (targetContent) targetContent.classList.add('active');

        if (tabName === 'werbelink' && typeof fetchWerbelinkApplications === 'function') {
            fetchWerbelinkApplications();
        } else if (tabName === 'affiliates' && typeof loadAffiliates === 'function') {
            loadAffiliates();
        } else if (tabName === 'portal-orders' && typeof window.loadAdminPortalOverview === 'function') {
            window.loadAdminPortalOverview();
        }
    };

    window.downloadICS = function(name, dateStr, timeStr, email, phone) {
        let year, month, day;
        if (dateStr.includes('-')) {
            const p = dateStr.split('-');
            year = p[0]; month = p[1]; day = p[2];
        } else if (dateStr.includes('.')) {
            const p = dateStr.split('.');
            day = p[0]; month = p[1]; year = p[2];
            if (year.length === 2) year = "20" + year;
        } else {
            alert('Datumsformat nicht erkannt: ' + dateStr);
            return;
        }

        const timeParts = (timeStr || "00:00").split(':');
        const hour = timeParts[0].padStart(2, '0');
        const minute = timeParts[1].padStart(2, '0');

        const startDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour}:${minute}:00`);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

        const formatICSDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        // Escape special chars for ICS
        const safeName = (name || "").replace(/,/g, '\\,').replace(/;/g, '\\;');
        const safeEmail = (email || "").replace(/,/g, '\\,').replace(/;/g, '\\;');
        const safePhone = (phone || "").replace(/,/g, '\\,').replace(/;/g, '\\;');

        const icsString = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Alpha Energie//NONSGML v1.0//EN",
            "BEGIN:VEVENT",
            `UID:${new Date().getTime()}@alpha-energie.network`,
            `DTSTAMP:${formatICSDate(new Date())}`,
            `DTSTART:${formatICSDate(startDate)}`,
            `DTEND:${formatICSDate(endDate)}`,
            `SUMMARY:Termin mit ${safeName}`,
            `DESCRIPTION:Kontakt:\\nName: ${safeName}\\nE-Mail: ${safeEmail}\\nTelefon: ${safePhone || '-'}`,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `termin_${(name || 'Unbekannt').replace(/\\s+/g, '_')}.ics`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    window.deleteEntry = async function(type, id) {
        if (!confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return;
        
        try {
            const res = await fetch(`${API_URL}/admin/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Optional: alert('Eintrag erfolgreich gelöscht.');
                loadData();
            } else {
                alert('Fehler beim Löschen: ' + (data.error || 'Unbekannt'));
            }
        } catch (e) {
            alert('Fehler bei der Verbindung zum Server.');
        }
    };

    // Load Data
    async function loadData() {
        try {
            const res = await fetch(`${API_URL}/admin/data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.status === 401) {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
                return;
            }

            const json = await res.json();
            if (json.success) {
                renderContacts(json.data.contacts);
                renderApplications(json.data.applications, json.data.appointments);
                renderAppointments(json.data.appointments);
            } else {
                alert('Fehler beim Laden der Daten.');
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    }

    function renderContacts(contacts) {
        const tbody = document.getElementById('requests-tbody');
        if (!tbody) return;
        if (contacts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Keine Kontaktanfragen gefunden.</td></tr>';
            return;
        }

        tbody.innerHTML = contacts.map(c => `
            <tr>
                <td>${new Date(c.createdAt).toLocaleString('de-DE')}</td>
                <td>${c.name}</td>
                <td><a href="mailto:${c.email}">${c.email}</a></td>
                <td>${c.phone ? `<a href="tel:${c.phone}">${c.phone}</a>` : '-'}</td>
                <td>${c.subject}</td>
                <td>${c.message.length > 50 ? c.message.substring(0, 50) + '...' : c.message}</td>
                <td style="text-align: center;">
                    <button onclick="deleteEntry('contacts', ${c.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px;" title="Löschen">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    function renderApplications(apps, appointments = []) {
        cachedPartnerApplications = apps || [];
        const tbody = document.getElementById('partners-tbody');
        if (!tbody) return;
        if (apps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">Keine Bewerbungen gefunden.</td></tr>';
            return;
        }

        tbody.innerHTML = apps.map(a => {
            const hasAppt = appointments.some(appt => appt.email && appt.email.toLowerCase() === a.email.toLowerCase());
            const apptStatus = hasAppt ? '<span style="color: #10b981; font-weight: bold;"><i class="fa-solid fa-check"></i> Ja</span>' : '<span style="color: #64748b;">Nein</span>';
            const displayNotes = a.notes ? a.notes.replace(/\n/g, '<br>') : '<span style="color: #94a3b8; font-style: italic;">Keine Notizen</span>';
            const rawNotes = (a.notes || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
            const affiliateBadge = a.affiliateLink 
                ? `<span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 5px;" title="Werbelink-Partner: ${a.affiliateLink.name} (${a.affiliateLink.code})"><i class="fa-solid fa-link" style="font-size: 0.75rem;"></i> ${a.affiliateLink.name} <span style="opacity: 0.75; font-weight: 400; font-size: 0.75rem;">(${a.affiliateLink.code})</span></span>`
                : `<span style="color: #94a3b8; font-size: 0.85rem; font-style: italic;">Keiner (Direkt)</span>`;

            const isEmailSent = Boolean(a.masterDataEmailSent || a.masterDataEmailSentAt);
            let emailSentDateFormatted = '';
            if (a.masterDataEmailSentAt) {
                try {
                    const parsedDate = new Date(a.masterDataEmailSentAt);
                    if (!isNaN(parsedDate.getTime())) {
                        emailSentDateFormatted = parsedDate.toLocaleString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) + ' Uhr';
                    }
                } catch (e) {
                    console.error('Date format error', e);
                }
            }

            const emailSentBadge = isEmailSent
                ? `<div style="padding: 5px 8px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #065f46;" title="Stammdaten-Mail versendet${emailSentDateFormatted ? ' am ' + emailSentDateFormatted : ''}">
                    <i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 0.85rem; flex-shrink: 0;"></i>
                    <div style="line-height: 1.25;">
                        <span style="display: block; font-weight: 700; color: #065f46;">Stammdaten-Mail versendet</span>
                        ${emailSentDateFormatted ? `<span style="font-weight: 500; font-size: 0.7rem; color: #047857;">${emailSentDateFormatted}</span>` : ''}
                    </div>
                   </div>`
                : '';

            const btnSendEmail = isEmailSent
                ? `<button onclick="openEmailModal(${a.id})" class="btn-send-stammdaten" style="background: #0284c7; color: white; border: none; border-radius: 4px; padding: 6px 10px; cursor: pointer; font-size: 0.75rem; font-weight: bold; width: 100%; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.2s;" title="E-Mail zur Stammdatenerfassung erneut senden">
                    <i class="fa-solid fa-paper-plane"></i> Stammdaten-Mail erneut senden
                   </button>`
                : `<button onclick="openEmailModal(${a.id})" class="btn-send-stammdaten" style="background: #ef8a00; color: white; border: none; border-radius: 4px; padding: 6px 10px; cursor: pointer; font-size: 0.75rem; font-weight: bold; width: 100%; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.2s;" title="E-Mail zur Stammdatenerfassung senden">
                    <i class="fa-solid fa-envelope"></i> Stammdatenemail senden
                   </button>`;

            return `
            <tr class="partner-row">
                <td>${new Date(a.createdAt).toLocaleString('de-DE')}</td>
                <td>
                    <strong>${a.fullName}</strong>
                    ${a.companyName ? `<br><span style="color: #64748b; font-size: 0.8rem;"><i class="fa-solid fa-building" style="font-size: 0.72rem;"></i> ${a.companyName}</span>` : ''}
                </td>
                <td><a href="mailto:${a.email}">${a.email}</a></td>
                <td><a href="tel:${a.phone}">${a.phone}</a></td>
                <td>${affiliateBadge}</td>
                <td>${a.experience}</td>
                <td style="text-align: center;">${apptStatus}</td>
                <td style="text-align: center;">
                    <input type="checkbox" class="zugangsdaten-cb" style="width: 18px; height: 18px; cursor: pointer; accent-color: #10b981;">
                </td>
                <td style="min-width: 220px;">
                    <div style="font-size: 0.85rem; margin-bottom: 5px; max-height: 80px; overflow-y: auto;">${displayNotes}</div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div>
                            <button onclick="openNotesModal(${a.id}, '${rawNotes}')" style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 0.85rem; padding: 0;">
                                <i class="fa-solid fa-pen"></i> Bearbeiten
                            </button>
                            <button onclick="deleteEntry('partner-applications', ${a.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0 0 0 10px; font-size: 0.85rem;" title="Löschen">
                                <i class="fa-solid fa-trash"></i> Löschen
                            </button>
                        </div>
                        ${emailSentBadge}
                        ${btnSendEmail}
                        <button onclick="activatePartnerPortalAccount(${a.id})" style="background: #10b981; color: white; border: none; border-radius: 4px; padding: 6px 10px; cursor: pointer; font-size: 0.75rem; font-weight: bold; width: 100%; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" title="Partner-Portal Account (1-Klick) freischalten">
                            <i class="fa-solid fa-key"></i> Portal-Zugang aktivieren
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');

        // ----------------- RENDER STAMMDATEN TAB -----------------
        const stBody = document.getElementById('stammdaten-tbody');
        if (stBody) {
            const stammdatenApps = apps.filter(a => a.masterDataStatus === 'SUBMITTED');
            if (stammdatenApps.length === 0) {
                stBody.innerHTML = '<tr><td colspan="7" class="text-center">Noch keine Stammdaten eingereicht.</td></tr>';
            } else {
                stBody.innerHTML = stammdatenApps.map(a => {
                    const dlTrade = a.tradeLicenseUrl ? `<div style="margin-bottom: 5px;"><a href="${a.tradeLicenseUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline; font-size: 0.85rem;"><i class="fa-solid fa-download"></i> Gewerbeschein</a></div>` : '';
                    const dlFront = a.idCardFrontUrl ? `<div style="margin-bottom: 5px;"><a href="${a.idCardFrontUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline; font-size: 0.85rem;"><i class="fa-solid fa-download"></i> Ausweis (Vorn)</a></div>` : '';
                    const dlBack = a.idCardBackUrl ? `<div><a href="${a.idCardBackUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline; font-size: 0.85rem;"><i class="fa-solid fa-download"></i> Ausweis (Hinten)</a></div>` : '';
                    const downloadLinks = (dlTrade || dlFront || dlBack) ? (dlTrade + dlFront + dlBack) : '-';
                    
                    return `
                    <tr>
                        <td>${new Date(a.updatedAt || a.createdAt).toLocaleString('de-DE')}</td>
                        <td>
                            <strong>${a.firstName || ''} ${a.lastName || ''}</strong><br>
                            <span style="color: #64748b; font-size: 0.85rem;">${a.companyName || ''}</span>
                        </td>
                        <td>
                            ${a.street || ''} ${a.houseNr || ''}<br>
                            ${a.plz || ''} ${a.city || ''}<br>
                            ${a.country || ''}
                        </td>
                        <td>
                            <a href="mailto:${a.email}">${a.email}</a><br>
                            <a href="tel:${a.phone}">${a.phone}</a><br>
                            ${a.website ? `<a href="${a.website}" target="_blank" style="font-size: 0.85rem;">${a.website}</a>` : ''}
                        </td>
                        <td>
                            <strong>${a.bankName || ''}</strong><br>
                            ${a.iban || ''}<br>
                            ${a.bic || ''}
                        </td>
                        <td style="font-size: 0.85rem;">
                            USt-pflichtig: <strong>${a.isVatLiable ? 'Ja' : 'Nein'}</strong><br>
                            Form: ${a.legalForm || '-'}<br>
                            StNr: ${a.taxId || '-'}<br>
                            FA: ${a.taxOffice || '-'}
                        </td>
                        <td style="text-align: left;">
                            ${downloadLinks}
                        </td>
                    </tr>
                    `;
                }).join('');
            }
        }

        document.querySelectorAll('.zugangsdaten-cb').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const tr = e.target.closest('tr');
                if (e.target.checked) {
                    tr.style.backgroundColor = '#dcfce7';
                } else {
                    tr.style.backgroundColor = '';
                }
            });
        });
    }

    function renderAppointments(appointments) {
        const tbody = document.getElementById('appointments-tbody');
        if (!tbody) return;
        if (!appointments || appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Keine Termine gefunden.</td></tr>';
            return;
        }

        tbody.innerHTML = appointments.map(a => {
            const escapedName = (a.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const escapedDate = (a.date || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const escapedTime = (a.time || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const escapedEmail = (a.email || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const escapedPhone = (a.phone || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

            return `
            <tr>
                <td>${new Date(a.createdAt).toLocaleString('de-DE')}</td>
                <td><strong>${a.date}</strong> um ${a.time} Uhr</td>
                <td>${a.name}</td>
                <td><a href="mailto:${a.email}">${a.email}</a></td>
                <td>${a.phone ? `<a href="tel:${a.phone}">${a.phone}</a>` : '-'}</td>
                <td style="text-align: center; white-space: nowrap;">
                    <button onclick="downloadICS('${escapedName}', '${escapedDate}', '${escapedTime}', '${escapedEmail}', '${escapedPhone}')" style="background: none; border: none; color: #3b82f6; cursor: pointer; padding: 4px; margin-right: 5px;" title="An Thunderbird/Kalender senden">
                        <i class="fa-regular fa-calendar-plus"></i>
                    </button>
                    <button onclick="deleteEntry('appointments', ${a.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px;" title="Löschen">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
            `;
        }).join('');
    }

    loadData();

    // --- Campaign Logic ---
    let currentCampaignId = null;
    let pollInterval = null;
    let currentPage = 1;
    let currentStatus = null;

    const triggerScrapeCampaign = async (targetIndustry) => {
        const companySize = document.getElementById('camp-size').value.trim();
        const pages = document.getElementById('camp-pages').value;
        const statusDiv = document.getElementById('camp-status');
        const actionsDiv = document.getElementById('camp-actions');
        const tableContainer = document.getElementById('camp-live-table-container');

        if (!companySize) {
            alert('Bitte geben Sie einen Ort oder eine PLZ ein.');
            return;
        }

        // Dynamische Generierung von Name und Branche
        const dateString = new Date().toLocaleDateString('de-DE');
        const name = `${companySize} - ${targetIndustry} (${dateString})`;
        const industry = targetIndustry;

        statusDiv.style.display = 'block';
        statusDiv.innerText = 'Kampagne wird gestartet...';
        statusDiv.style.color = '#3b82f6';
        actionsDiv.style.display = 'none';
        document.getElementById('btn-stop').style.display = 'none';
        tableContainer.style.display = 'block';
        document.getElementById('camp-live-tbody').innerHTML = '<tr><td colspan="4" class="text-center">Warte auf erste Kontakte...</td></tr>';
        
        currentPage = 1;
        if (pollInterval) clearInterval(pollInterval);

        const requirePhone = document.getElementById('camp-require-phone') ? document.getElementById('camp-require-phone').checked : false;

        try {
            const res = await fetch(`${API_URL}/campaigns/scrape`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, industry, companySize, pages: pages === 'max' ? 'max' : parseInt(pages), requirePhone })
            });

            const json = await res.json();
            
            if (json.success) {
                currentCampaignId = json.campaignId;
                let plzText = json.plzs && json.plzs.length > 0 ? ` (${json.plzs.length} PLZs gefunden: ${json.plzs.slice(0, 5).join(', ')}${json.plzs.length > 5 ? '...' : ''})` : '';
                statusDiv.innerText = `Scraping läuft...${plzText}`;
                document.getElementById('btn-stop').style.display = 'block';
                
                // Start polling
                pollInterval = setInterval(pollCampaignStatus, 3000);
                // Fetch first page immediately
                fetchContactsPage(currentPage);
            } else {
                statusDiv.innerText = 'Fehler: ' + (json.error || 'Unbekannt');
                statusDiv.style.color = '#ef4444';
            }
        } catch (error) {
            statusDiv.innerText = 'Fehler beim Verbinden zum Server.';
            statusDiv.style.color = '#ef4444';
        }
    };

    if (document.getElementById('btn-scrape-energie')) {
        document.getElementById('btn-scrape-energie').addEventListener('click', () => triggerScrapeCampaign('Energieberater'));
    }
    if (document.getElementById('btn-scrape-esg')) {
        document.getElementById('btn-scrape-esg').addEventListener('click', () => triggerScrapeCampaign('ESG Berater'));
    }
    if (document.getElementById('btn-preview-email')) {
        document.getElementById('btn-preview-email').addEventListener('click', () => {
            console.log('[UI] Opening Goldstandard email preview.');
        });
    }

        if (document.getElementById('btn-stop')) {
            document.getElementById('btn-stop').addEventListener('click', async () => {
                if (!currentCampaignId) return;
                if (!confirm('Bist du sicher, dass du das Scraping abbrechen möchtest? (Die bisherigen Kontakte bleiben erhalten)')) return;

                document.getElementById('btn-stop').disabled = true;
                document.getElementById('btn-stop').innerText = 'Stoppt...';

                try {
                    await fetch(`${API_URL}/campaigns/${currentCampaignId}/stop`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    // Das Polling wird den STOPPED Status beim nächsten Tick erkennen und aufräumen
                } catch (e) {
                    alert('Fehler beim Stoppen.');
                    document.getElementById('btn-stop').disabled = false;
                    document.getElementById('btn-stop').innerText = 'Abbrechen';
                }
            });
        }

        async function pollCampaignStatus() {
            if (!currentCampaignId) return;
            try {
                const res = await fetch(`${API_URL}/campaigns/${currentCampaignId}/status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                
                if (json.success) {
                    currentStatus = json.status;
                    const statusDiv = document.getElementById('camp-status');
                    
                    if (currentStatus === 'COMPLETED' || currentStatus === 'STOPPED') {
                        clearInterval(pollInterval);
                        document.getElementById('btn-stop').style.display = 'none';
                        document.getElementById('btn-stop').disabled = false;
                        document.getElementById('btn-stop').innerText = 'Abbrechen';

                        statusDiv.innerText = currentStatus === 'STOPPED' ? 'Scraping manuell abgebrochen!' : 'Scraping erfolgreich abgeschlossen!';
                        statusDiv.style.color = currentStatus === 'STOPPED' ? '#ef4444' : '#10b981';
                        
                        document.getElementById('camp-result-text').innerText = `${json.contactsCount} Kontakte in der Datenbank!`;
                        document.getElementById('camp-actions').style.display = 'flex';
                    } else {
                        let statusHtml = `Scraping läuft... Bisher gefunden: <b>${json.contactsCount}</b>`;
                        if (json.progress) {
                            const { totalPlzs, finishedPlzs, currentPlz } = json.progress;
                            const total = totalPlzs ? totalPlzs.length : 0;
                            const finished = finishedPlzs ? finishedPlzs.length : 0;
                            const remaining = total - finished - (currentPlz ? 1 : 0);
                            statusHtml += `<div style="font-size: 0.85rem; margin-top: 5px; color: #475569;">`;
                            if (total > 0) {
                                statusHtml += `<div><b>Insgesamt zu scannen:</b> ${total} PLZs</div>`;
                                if (currentPlz) statusHtml += `<div><b>Aktuell durchsucht:</b> <span style="color: #3b82f6;">${currentPlz}</span></div>`;
                                if (finished > 0) statusHtml += `<div><b>Erledigt (${finished}):</b> <span style="color: #10b981;">${finishedPlzs.slice(-5).join(', ')}${finished > 5 ? '...' : ''}</span></div>`;
                                if (remaining > 0) statusHtml += `<div><b>Noch ausstehend:</b> ${remaining} PLZs</div>`;
                            }
                            statusHtml += `</div>`;
                        }
                        statusDiv.innerHTML = statusHtml;
                    }

                    // Refresh current page
                    fetchContactsPage(currentPage);
                }
            } catch (e) {
                console.error('Polling error', e);
            }
        }

        async function fetchContactsPage(page) {
            if (!currentCampaignId) return;
            try {
                const res = await fetch(`${API_URL}/campaigns/${currentCampaignId}/contacts?page=${page}&limit=50`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                
                if (json.success) {
                    currentPage = json.page;
                    const totalPages = json.totalPages || 1;
                    
                    document.getElementById('camp-pagination-info').innerText = `Seite ${currentPage} von ${totalPages} (Total: ${json.total})`;
                    document.getElementById('btn-prev-page').disabled = currentPage <= 1;
                    document.getElementById('btn-next-page').disabled = currentPage >= totalPages;

                    const tbody = document.getElementById('camp-live-tbody');
                    if (json.data.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Noch keine Kontakte gefunden...</td></tr>';
                    } else {
                        tbody.innerHTML = json.data.map(c => `
                            <tr>
                                <td>${c.name}</td>
                                <td>${c.address || '-'}</td>
                                <td>${c.email ? `<a href="mailto:${c.email}">${c.email}</a>` : '-'}</td>
                                <td>${c.phone || '-'}</td>
                                <td>${c.website ? `<a href="${c.website}" target="_blank">Link</a>` : '-'}</td>
                                <td><button class="btn-send-single" data-id="${c.id}" style="background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Senden</button></td>
                            </tr>
                        `).join('');
                        
                        document.querySelectorAll('.btn-send-single').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                const cid = e.target.getAttribute('data-id');
                                if (!confirm('E-Mail an diesen Kontakt senden?')) return;
                                e.target.disabled = true;
                                e.target.innerText = 'Sende...';
                                try {
                                    const res = await fetch(`${API_URL}/contacts/${cid}/send`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
                                    const data = await res.json();
                                    if(data.success) {
                                        alert('E-Mail versendet!');
                                        e.target.innerText = 'Gesendet';
                                        e.target.style.background = '#64748b';
                                    } else {
                                        alert('Fehler: ' + data.error);
                                        e.target.disabled = false;
                                        e.target.innerText = 'Senden';
                                    }
                                } catch(err) {
                                    alert('Fehler beim Senden.');
                                    e.target.disabled = false;
                                    e.target.innerText = 'Senden';
                                }
                            });
                        });
                    }
                }
            } catch (e) {
                console.error('Fetch contacts error', e);
            }
        }

        document.getElementById('btn-prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                fetchContactsPage(currentPage - 1);
            }
        });

        document.getElementById('btn-next-page').addEventListener('click', () => {
            fetchContactsPage(currentPage + 1);
        });

        document.getElementById('btn-export').addEventListener('click', async () => {
            if (!currentCampaignId) return;
            try {
                const res = await fetch(`${API_URL}/campaigns/${currentCampaignId}/export`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `campaign_${currentCampaignId}_contacts.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else {
                    alert('Fehler beim Exportieren.');
                }
            } catch(e) {
                alert('Fehler beim Verbinden zum Server.');
            }
        });

        document.getElementById('btn-send').addEventListener('click', async () => {
            if (!currentCampaignId) return;
            
            if (!confirm('Möchten Sie jetzt die KI-generierten E-Mails an alle gescrapten Kontakte versenden?')) return;

            const btn = document.getElementById('btn-send');
            const originalText = btn.innerText;
            btn.innerText = 'Wird versendet...';
            btn.disabled = true;

            try {
                const res = await fetch(`${API_URL}/campaigns/${currentCampaignId}/send`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const json = await res.json();
                if (json.success) {
                    alert(`Erfolgreich versendet: ${json.sent}\nFehlgeschlagen: ${json.failed}`);
                } else {
                    alert('Fehler: ' + (json.error || 'Unbekannt'));
                }
            } catch (error) {
                alert('Fehler beim Verbinden zum Server.');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
// brace removed here

    // --- Global B2B Database Logic ---
    let dbCurrentPage = 1;
    let dbSearchTerm = '';
    let dbStatusFilterVal = '';
    let dbCityFilterVal = '';

    const dbSearchInput = document.getElementById('db-search');
    const dbStatusFilter = document.getElementById('db-status-filter');
    const dbCityFilter = document.getElementById('db-city-filter');
    const dbTbody = document.getElementById('db-b2b-tbody');
    const dbPrevBtn = document.getElementById('btn-db-prev');
    const dbNextBtn = document.getElementById('btn-db-next');
    const dbPageInfo = document.getElementById('db-pagination-info');
    const dbExportBtn = document.getElementById('btn-db-export');

    async function loadCities() {
        if (!dbCityFilter) return;
        try {
            const res = await fetch(`${API_URL}/cities`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success && json.data) {
                dbCityFilter.innerHTML = '<option value="">Alle Städte</option>' + 
                    json.data.map(c => `<option value="${c}">${c}</option>`).join('');
            }
        } catch (e) {
            console.error('Error loading cities', e);
        }
    }

    if (dbSearchInput) {
        loadCities();
        
        // Debounce search
        let searchTimeout;
        dbSearchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                dbSearchTerm = e.target.value;
                dbCurrentPage = 1;
                fetchGlobalContacts();
            }, 500);
        });

        dbStatusFilter.addEventListener('change', (e) => {
            dbStatusFilterVal = e.target.value;
            dbCurrentPage = 1;
            fetchGlobalContacts();
        });
        
        dbCityFilter.addEventListener('change', (e) => {
            dbCityFilterVal = e.target.value;
            dbCurrentPage = 1;
            fetchGlobalContacts();
        });

        dbPrevBtn.addEventListener('click', () => {
            if (dbCurrentPage > 1) {
                dbCurrentPage--;
                fetchGlobalContacts();
            }
        });

        dbNextBtn.addEventListener('click', () => {
            dbCurrentPage++;
            fetchGlobalContacts();
        });

        dbExportBtn.addEventListener('click', async () => {
            try {
                const query = new URLSearchParams({
                    search: dbSearchTerm,
                    status: dbStatusFilterVal,
                    city: dbCityFilterVal
                }).toString();

                const res = await fetch(`${API_URL}/contacts/export?${query}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `b2b_database_export.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else {
                    alert('Fehler beim Exportieren.');
                }
            } catch(e) {
                alert('Fehler beim Verbinden zum Server.');
            }
        });

        // initial load when switching to the tab
        document.querySelector('button[onclick="switchTab(\'db-b2b\')"]').addEventListener('click', () => {
            fetchGlobalContacts();
        });
    }

    async function fetchGlobalContacts() {
        try {
            const query = new URLSearchParams({
                page: dbCurrentPage,
                limit: 50,
                search: dbSearchTerm,
                status: dbStatusFilterVal,
                city: dbCityFilterVal
            }).toString();

            const res = await fetch(`${API_URL}/contacts?${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            
            if (json.success) {
                dbCurrentPage = json.page;
                const totalPages = json.totalPages || 1;
                
                dbPageInfo.innerText = `Seite ${dbCurrentPage} von ${totalPages} (Total: ${json.total})`;
                dbPrevBtn.disabled = dbCurrentPage <= 1;
                dbNextBtn.disabled = dbCurrentPage >= totalPages;

                if (json.data.length === 0) {
                    dbTbody.innerHTML = '<tr><td colspan="7" class="text-center">Keine Kontakte gefunden.</td></tr>';
                } else {
                    dbTbody.innerHTML = json.data.map(c => {
                        const dateStr = new Date(c.createdAt).toLocaleString('de-DE');
                        const city = (c.campaign && c.campaign.companySize) ? c.campaign.companySize : '-';
                        return `
                        <tr>
                            <td>${dateStr}</td>
                            <td>${city}</td>
                            <td>${c.address || '-'}</td>
                            <td><strong>${c.name}</strong></td>
                            <td>
                                ${c.email ? `<a href="mailto:${c.email}">${c.email}</a>` : '-'}<br>
                                ${c.phone || '-'}<br>
                                ${c.website ? `<a href="${c.website}" target="_blank" style="font-size:0.8rem">Webseite</a>` : ''}
                            </td>
                            <td>
                                <select class="status-dropdown" data-id="${c.id}" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1;">
                                    <option value="Neu / Unbearbeitet" ${c.status === 'Neu / Unbearbeitet' || c.status === 'PENDING' ? 'selected' : ''}>Neu / Unbearbeitet</option>
                                    <option value="Abtelefoniert" ${c.status === 'Abtelefoniert' ? 'selected' : ''}>Abtelefoniert</option>
                                    <option value="Abgelehnt" ${c.status === 'Abgelehnt' ? 'selected' : ''}>Abgelehnt</option>
                                    <option value="Terminiert" ${c.status === 'Terminiert' ? 'selected' : ''}>Terminiert</option>
                                    <option value="Entscheider nicht angetroffen" ${c.status === 'Entscheider nicht angetroffen' ? 'selected' : ''}>Entscheider nicht angetroffen</option>
                                </select>
                            </td>
                            <td><button class="btn-send-single" data-id="${c.id}" style="background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Senden</button></td>
                        </tr>
                        `;
                    }).join('');

                    document.querySelectorAll('.btn-send-single').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            const cid = e.target.getAttribute('data-id');
                            if (!confirm('E-Mail an diesen Kontakt senden?')) return;
                            e.target.disabled = true;
                            e.target.innerText = 'Sende...';
                            try {
                                const res = await fetch(`${API_URL}/contacts/${cid}/send`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
                                const data = await res.json();
                                if(data.success) {
                                    alert('E-Mail versendet!');
                                    e.target.innerText = 'Gesendet';
                                    e.target.style.background = '#64748b';
                                } else {
                                    alert('Fehler: ' + data.error);
                                    e.target.disabled = false;
                                    e.target.innerText = 'Senden';
                                }
                            } catch(err) {
                                alert('Fehler beim Senden.');
                                e.target.disabled = false;
                                e.target.innerText = 'Senden';
                            }
                        });
                    });

                    // Add event listeners for the newly rendered dropdowns
                    document.querySelectorAll('.status-dropdown').forEach(select => {
                        select.addEventListener('change', async (e) => {
                            const contactId = e.target.getAttribute('data-id');
                            const newStatus = e.target.value;
                            
                            // Visual update for color
                            if(newStatus === 'Terminiert') e.target.style.borderColor = '#10b981';
                            else if(newStatus === 'Abgelehnt') e.target.style.borderColor = '#ef4444';
                            else e.target.style.borderColor = '#cbd5e1';

                            try {
                                await fetch(`${API_URL}/contacts/${contactId}/status`, {
                                    method: 'PATCH',
                                    headers: { 
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ status: newStatus })
                                });
                            } catch (error) {
                                console.error('Failed to update status', error);
                                alert('Fehler beim Speichern des Status.');
                            }
                        });
                    });
                }
            }
        } catch (e) {
            console.error('Fetch global contacts error', e);
        }
    }

    // --- Notes Modal Logic ---
    let currentNotesAppId = null;
    const notesModal = document.getElementById('notes-modal');
    const notesTextarea = document.getElementById('notes-textarea');
    const notesSaveBtn = document.getElementById('notes-btn-save');
    const notesCancelBtn = document.getElementById('notes-btn-cancel');

    window.openNotesModal = function(id, currentNotes) {
        currentNotesAppId = id;
        notesTextarea.value = currentNotes || '';
        notesModal.style.display = 'flex';
        notesTextarea.focus();
    };

    if (notesCancelBtn) {
        notesCancelBtn.addEventListener('click', () => {
            notesModal.style.display = 'none';
        });
    }

    if (notesSaveBtn) {
        notesSaveBtn.addEventListener('click', async () => {
            if (!currentNotesAppId) return;
            const newNotes = notesTextarea.value;
            notesSaveBtn.disabled = true;
            notesSaveBtn.innerText = 'Speichert...';

            try {
                const res = await fetch(`${API_URL}/admin/partner-applications/${currentNotesAppId}/notes`, {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ notes: newNotes })
                });
                const data = await res.json();
                
                if (data.success) {
                    notesModal.style.display = 'none';
                    loadData(); // Reload table
                } else {
                    alert('Fehler beim Speichern der Notiz: ' + (data.error || 'Unbekannt'));
                }
            } catch (err) {
                alert('Netzwerkfehler beim Speichern.');
            } finally {
                notesSaveBtn.disabled = false;
                notesSaveBtn.innerText = 'Speichern';
            }
        });
    }

    // --- Stammdaten Email Logic ---
    window.openEmailModal = function(id, email, fullName) {
        const modal = document.getElementById('email-modal');
        const toInput = document.getElementById('email-modal-to');
        const subjectInput = document.getElementById('email-modal-subject');
        const bodyInput = document.getElementById('email-modal-body');
        const cancelBtn = document.getElementById('email-modal-cancel');
        const sendBtn = document.getElementById('email-modal-send');

        if (!modal) return;

        let targetEmail = email;
        let targetFullName = fullName;

        if (!targetEmail || !targetFullName) {
            const app = cachedPartnerApplications.find(a => a.id === id);
            if (app) {
                targetEmail = targetEmail || app.email || '';
                targetFullName = targetFullName || app.fullName || '';
            }
        }

        toInput.value = targetEmail || '';
        subjectInput.value = 'Wichtige Stammdaten für Deine Vertriebspartnerschaft';
        
        const stammdatenLink = `https://alpha-energie.de/stammdaten.html?id=${id}`;
        
        bodyInput.value = `<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://alpha-energie.de/logo.png" alt="Alpha Energie GmbH" style="max-width: 200px;">
    </div>
    <p>Hallo ${targetFullName || ''},</p>
    <p>herzlichen Dank für Deine Bewerbung und Dein Vertrauen in die Alpha Energie GmbH! Wir freuen uns sehr über Dein Interesse an einer Vertriebspartnerschaft.</p>
    <p>Um Deine Registrierung zügig abzuschließen und Deinen Account freizuschalten, benötigen wir im nächsten Schritt noch einige Stammdaten von Dir.</p>
    <p><strong>So geht es jetzt weiter:</strong></p>
    <ol style="line-height: 1.6; margin-bottom: 20px;">
        <li>Klicke auf den Button unten und trage Deine restlichen Daten ein (Dokumenten-Upload & Bankverbindung sind optional).</li>
        <li>Unser Backoffice-Team prüft Deine Unterlagen schnellstmöglich.</li>
        <li>Sobald alles verifiziert ist, senden wir Dir Deine persönlichen Zugangsdaten für das Vertriebsportal zu, und Du kannst direkt starten!</li>
    </ol>
    <div style="text-align: center; margin: 35px 0;">
        <a href="${stammdatenLink}" style="background-color: #ef8a00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1rem;">Jetzt Stammdaten hinterlegen</a>
    </div>
    <p>Solltest Du vorab Fragen haben, kannst Du jederzeit auf diese E-Mail antworten.</p>
    <p>Mit freundlichen Grüßen,</p>
    <p><strong>Dein Team der Alpha Energie GmbH</strong></p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
    <div style="font-size: 0.85rem; color: #666;">
        <strong>Alpha Energie GmbH</strong><br>
        Alter Hellweg 50 | 44379 Dortmund<br>
        Telefon: 0231 39989390<br>
        E-Mail: info@alpha-energie.de<br>
        Geschäftsführer: Tolga Canga<br>
        Registergericht: Amtsgericht Dortmund, HRB 38030
    </div>
</div>`;

        modal.style.display = 'flex';

        cancelBtn.onclick = () => {
            modal.style.display = 'none';
        };

        sendBtn.onclick = async () => {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Senden...';
            try {
                const success = await sendStammdatenEmail(id, toInput.value, subjectInput.value, bodyInput.value);
                if (success) {
                    modal.style.display = 'none';
                }
            } finally {
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Jetzt Senden';
            }
        };
    };

    window.sendStammdatenEmail = async function(id, customEmail, customSubject, customBody) {
        try {
            const res = await fetch(`${API_URL}/admin/partner-applications/${id}/send-master-data-email`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customEmail: customEmail,
                    customSubject: customSubject,
                    customBody: customBody
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('E-Mail erfolgreich gesendet!');
                loadData();
                if (typeof fetchWerbelinkApplications === 'function') {
                    fetchWerbelinkApplications();
                }
                return true;
            } else {
                alert('Fehler beim Senden: ' + (data.error || 'Unbekannt'));
                return false;
            }
        } catch(e) {
            alert('Netzwerkfehler beim Senden.');
            return false;
        }
    };

    // --- Affiliate Logic ---
    window.loadAffiliates = async function() {
        try {
            const res = await fetch(`${API_URL}/admin/affiliates`, { headers: { 'Authorization': `Bearer ${token}` } });
            const json = await res.json();
            if (json.success) {
                const tbody = document.getElementById('affiliates-tbody');
                tbody.innerHTML = '';
                if(json.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Keine Werbelinks gefunden.</td></tr>';
                    return;
                }
                json.data.forEach(a => {
                    const host = window.location.origin;
                    const fullLink = `${host}/stammdaten.html?ref=${a.code}`;
                    const count = a._count ? a._count.applications : 0;
                    const escapedLink = fullLink.replace(/'/g, "\\'");
                    const row = `
                        <tr>
                            <td>${new Date(a.createdAt).toLocaleString('de-DE')}</td>
                            <td><strong>${a.name}</strong></td>
                            <td>
                                <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${a.code}</code><br>
                                <span style="font-size: 0.8rem; color: #475569; word-break: break-all;">${fullLink}</span><br>
                                <div style="display: flex; gap: 10px; margin-top: 4px;">
                                    <a href="${fullLink}" target="_blank" style="font-size: 0.8rem; color: #3b82f6; font-weight: 600; text-decoration: none;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Link öffnen</a>
                                    <button onclick="navigator.clipboard.writeText('${escapedLink}').then(() => alert('Link in Zwischenablage kopiert!'))" style="background: none; border: none; color: #10b981; font-size: 0.8rem; cursor: pointer; font-weight: 600; padding: 0;"><i class="fa-regular fa-copy"></i> Link kopieren</button>
                                </div>
                            </td>
                            <td><strong>${count}</strong> Bewerbungen</td>
                            <td>
                                <button class="btn btn-outline-light" onclick="showAffiliatePartners(${a.id})" style="padding: 4px 8px; font-size: 0.85rem; color: #0f172a; border-color: #cbd5e1;">Partner anzeigen</button>
                            </td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            }
        } catch(e) {
            console.error("Error loading affiliates", e);
        }
    };

    window.createAffiliateLink = async function() {
        const nameInput = document.getElementById('new-affiliate-name');
        const name = nameInput.value.trim();
        if(!name) {
            alert('Bitte einen Namen eingeben.');
            return;
        }
        
        try {
            const res = await fetch(`${API_URL}/admin/affiliates`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if(data.success) {
                nameInput.value = '';
                loadAffiliates();
            } else {
                alert('Fehler: ' + data.error);
            }
        } catch(e) {
            alert('Netzwerkfehler');
        }
    };

    window.showAffiliatePartners = async function(id) {
        try {
            const res = await fetch(`${API_URL}/admin/affiliates/${id}/applications`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if(data.success) {
                const tbody = document.getElementById('affiliate-partners-tbody');
                tbody.innerHTML = '';
                if(data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Noch keine Partner über diesen Link registriert.</td></tr>';
                } else {
                    data.data.forEach(p => {
                        tbody.innerHTML += `
                            <tr>
                                <td>${new Date(p.createdAt).toLocaleString('de-DE')}</td>
                                <td>${p.fullName}</td>
                                <td><a href="mailto:${p.email}">${p.email}</a></td>
                                <td><a href="tel:${p.phone}">${p.phone}</a></td>
                                <td>${p.experience}</td>
                            </tr>
                        `;
                    });
                }
                document.getElementById('affiliate-partners-modal').style.display = 'flex';
            }
        } catch(e) {
            console.error(e);
        }
    };

    window.closeAffiliateModal = function() {
        document.getElementById('affiliate-partners-modal').style.display = 'none';
    };

    // --- Werbelink Anfragen Tab Logic ---
    let cachedWerbelinkApps = [];

    window.loadWerbelinkTab = async function() {
        await populateWerbelinkPartnerFilter();
        await fetchWerbelinkApplications();
    };

    async function populateWerbelinkPartnerFilter() {
        const select = document.getElementById('werbelink-filter-partner');
        if (!select) return;
        try {
            const res = await fetch(`${API_URL}/admin/affiliates`, { headers: { 'Authorization': `Bearer ${token}` } });
            const json = await res.json();
            if (json.success && json.data) {
                const currentVal = select.value;
                select.innerHTML = '<option value="">Alle Partner</option>' +
                    json.data.map(p => `<option value="${p.id}">${p.name} (${p.code})</option>`).join('');
                select.value = currentVal;
            }
        } catch (e) {
            console.error('Error populating partner filter:', e);
        }
    }

    async function fetchWerbelinkApplications() {
        const partnerId = document.getElementById('werbelink-filter-partner')?.value || '';
        const status = document.getElementById('werbelink-filter-status')?.value || '';
        const search = document.getElementById('werbelink-search')?.value || '';

        const query = new URLSearchParams({ partnerId, status, search }).toString();

        try {
            const res = await fetch(`${API_URL}/admin/werbelink-applications?${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();

            if (json.success) {
                cachedWerbelinkApps = json.data || [];
                
                // KPIs
                if (json.kpis) {
                    document.getElementById('werbelink-kpi-total').innerText = json.kpis.total || 0;
                    document.getElementById('werbelink-kpi-new').innerText = json.kpis.newCount || 0;
                    document.getElementById('werbelink-kpi-pending').innerText = json.kpis.pendingCount || 0;
                    document.getElementById('werbelink-kpi-partners').innerText = json.kpis.activePartners || 0;
                }

                renderWerbelinkApplicationsTable(json.data);
            }
        } catch (e) {
            console.error('Error fetching werbelink applications:', e);
        }
    }

    function renderWerbelinkApplicationsTable(apps) {
        const tbody = document.getElementById('werbelink-tbody');
        if (!tbody) return;

        if (!apps || apps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Keine Anfragen für die gewählten Filter gefunden.</td></tr>';
            return;
        }

        tbody.innerHTML = apps.map(a => {
            const dateStr = new Date(a.createdAt).toLocaleString('de-DE');
            const applicantInfo = `<strong>${a.fullName}</strong>${a.companyName ? `<br><span style="color: #64748b; font-size: 0.85rem;">${a.companyName}</span>` : ''}`;
            const contactInfo = `<a href="mailto:${a.email}">${a.email}</a><br><a href="tel:${a.phone}">${a.phone}</a>`;
            const partnerBadge = a.affiliateLink
                ? `<span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 5px;"><i class="fa-solid fa-link"></i> ${a.affiliateLink.name} <span style="opacity: 0.75; font-weight: 400; font-size: 0.75rem;">(${a.affiliateLink.code})</span></span>`
                : `<span style="color: #94a3b8; font-size: 0.85rem; font-style: italic;">Keiner</span>`;

            const currentStatus = a.masterDataStatus || 'SUBMITTED';

            return `
            <tr>
                <td>${dateStr}</td>
                <td>${applicantInfo}</td>
                <td>${contactInfo}</td>
                <td>${partnerBadge}</td>
                <td>
                    <select onchange="updateWerbelinkStatus(${a.id}, this.value)" style="padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 0.85rem; ${currentStatus === 'ACCEPTED' ? 'color: #10b981; border-color: #10b981;' : currentStatus === 'REJECTED' ? 'color: #ef4444; border-color: #ef4444;' : currentStatus === 'PENDING' ? 'color: #f59e0b; border-color: #f59e0b;' : 'color: #0369a1; border-color: #bae6fd;'}">
                        <option value="SUBMITTED" ${currentStatus === 'SUBMITTED' ? 'selected' : ''}>Neu / Eingereicht</option>
                        <option value="PENDING" ${currentStatus === 'PENDING' ? 'selected' : ''}>In Bearbeitung</option>
                        <option value="ACCEPTED" ${currentStatus === 'ACCEPTED' ? 'selected' : ''}>Akzeptiert</option>
                        <option value="REJECTED" ${currentStatus === 'REJECTED' ? 'selected' : ''}>Abgelehnt</option>
                    </select>
                </td>
                <td style="text-align: center;">
                    <div style="display: flex; justify-content: center; gap: 8px;">
                        <button onclick="openWerbelinkDetailModal(${a.id})" class="btn" style="background: #3b82f6; color: white; border: none; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-weight: bold;"><i class="fa-solid fa-eye"></i> Details</button>
                        <button onclick="deleteEntry('partner-applications', ${a.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px;" title="Löschen"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
    }

    window.updateWerbelinkStatus = async function(id, newStatus) {
        try {
            const res = await fetch(`${API_URL}/admin/werbelink-applications/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                fetchWerbelinkApplications();
            } else {
                alert('Fehler beim Aktualisieren des Status.');
            }
        } catch (e) {
            alert('Netzwerkfehler.');
        }
    };

    window.generateWerbelink = async function() {
        const input = document.getElementById('werbelink-gen-name');
        const name = input?.value.trim();
        if (!name) {
            alert('Bitte einen Partner-Namen eingeben.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/admin/affiliates`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });
            const data = await res.json();

            if (data.success && data.data) {
                input.value = '';
                const code = data.data.code;
                const fullUrl = `${window.location.origin}/stammdaten.html?ref=${code}`;
                
                document.getElementById('werbelink-gen-url').innerText = fullUrl;
                document.getElementById('werbelink-gen-output').style.display = 'flex';
                
                populateWerbelinkPartnerFilter();
                fetchWerbelinkApplications();
            } else {
                alert('Fehler: ' + (data.error || 'Erstellung fehlgeschlagen'));
            }
        } catch (e) {
            alert('Netzwerkfehler beim Generieren.');
        }
    };

    window.copyWerbelinkToClipboard = function() {
        const urlText = document.getElementById('werbelink-gen-url')?.innerText;
        if (!urlText) return;
        navigator.clipboard.writeText(urlText).then(() => {
            alert('Werbelink in die Zwischenablage kopiert!\n\n' + urlText);
        }).catch(err => {
            alert('Kopieren fehlgeschlagen: ' + urlText);
        });
    };

    window.openWerbelinkDetailModal = function(appId) {
        const app = cachedWerbelinkApps.find(a => a.id === appId);
        if (!app) return;

        const body = document.getElementById('werbelink-detail-body');
        if (!body) return;

        const dlTrade = app.tradeLicenseUrl ? `<div><a href="${app.tradeLicenseUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline;"><i class="fa-solid fa-download"></i> Gewerbeschein herunterladen</a></div>` : '<div><span style="color: #94a3b8;">Gewerbeschein: Nicht vorhanden</span></div>';
        const dlFront = app.idCardFrontUrl ? `<div><a href="${app.idCardFrontUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline;"><i class="fa-solid fa-download"></i> Ausweis Vorderseite</a></div>` : '<div><span style="color: #94a3b8;">Ausweis Vorderseite: Nicht vorhanden</span></div>';
        const dlBack = app.idCardBackUrl ? `<div><a href="${app.idCardBackUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline;"><i class="fa-solid fa-download"></i> Ausweis Rückseite</a></div>` : '<div><span style="color: #94a3b8;">Ausweis Rückseite: Nicht vorhanden</span></div>';

        body.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 0.95rem;">
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-top: 0; color: #0369a1; margin-bottom: 10px;"><i class="fa-solid fa-user"></i> Persönliche Daten</h4>
                    <p style="margin: 4px 0;"><strong>Name:</strong> ${app.salutation || ''} ${app.firstName || ''} ${app.lastName || app.fullName}</p>
                    <p style="margin: 4px 0;"><strong>Geburtsdatum:</strong> ${app.birthDate || '-'}</p>
                    <p style="margin: 4px 0;"><strong>E-Mail:</strong> <a href="mailto:${app.email}">${app.email}</a></p>
                    <p style="margin: 4px 0;"><strong>Telefon:</strong> <a href="tel:${app.phone}">${app.phone}</a></p>
                    <p style="margin: 4px 0;"><strong>Webseite:</strong> ${app.website ? `<a href="${app.website}" target="_blank">${app.website}</a>` : '-'}</p>
                    ${(app.masterDataEmailSent || app.masterDataEmailSentAt) ? `<p style="margin: 4px 0; color: #059669; font-weight: 500;"><strong><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Stammdaten-Mail:</strong> Versendet${app.masterDataEmailSentAt ? ' (' + new Date(app.masterDataEmailSentAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' Uhr)' : ''}</p>` : ''}
                </div>

                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-top: 0; color: #0369a1; margin-bottom: 10px;"><i class="fa-solid fa-location-dot"></i> Anschrift</h4>
                    <p style="margin: 4px 0;"><strong>Straße:</strong> ${app.street || ''} ${app.houseNr || ''}</p>
                    <p style="margin: 4px 0;"><strong>PLZ & Ort:</strong> ${app.plz || ''} ${app.city || ''}</p>
                    <p style="margin: 4px 0;"><strong>Land:</strong> ${app.country || 'Deutschland'}</p>
                </div>

                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-top: 0; color: #0369a1; margin-bottom: 10px;"><i class="fa-solid fa-building"></i> Unternehmen & Steuer</h4>
                    <p style="margin: 4px 0;"><strong>USt-Pflichtig:</strong> ${app.isVatLiable ? 'Ja' : 'Nein'}</p>
                    <p style="margin: 4px 0;"><strong>Firmenname:</strong> ${app.companyName || '-'}</p>
                    <p style="margin: 4px 0;"><strong>Rechtsform:</strong> ${app.legalForm || '-'}</p>
                    <p style="margin: 4px 0;"><strong>Steuernummer:</strong> ${app.taxId || '-'}</p>
                    <p style="margin: 4px 0;"><strong>Finanzamt:</strong> ${app.taxOffice || '-'}</p>
                </div>

                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-top: 0; color: #0369a1; margin-bottom: 10px;"><i class="fa-solid fa-piggy-bank"></i> Bankverbindung</h4>
                    <p style="margin: 4px 0;"><strong>Bankinstitut:</strong> ${app.bankName || '-'}</p>
                    <p style="margin: 4px 0;"><strong>IBAN:</strong> ${app.iban || '-'}</p>
                    <p style="margin: 4px 0;"><strong>BIC:</strong> ${app.bic || '-'}</p>
                </div>
            </div>

            <div style="margin-top: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <h4 style="margin-top: 0; color: #0369a1; margin-bottom: 10px;"><i class="fa-solid fa-file-pdf"></i> Eingereichte Dokumente</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${dlTrade}
                    ${dlFront}
                    ${dlBack}
                </div>
            </div>
        `;

        document.getElementById('werbelink-detail-modal').style.display = 'flex';
    };

    window.closeWerbelinkDetailModal = function() {
        document.getElementById('werbelink-detail-modal').style.display = 'none';
    };

    // Attach listeners for filters
    document.getElementById('werbelink-filter-partner')?.addEventListener('change', fetchWerbelinkApplications);
    document.getElementById('werbelink-filter-status')?.addEventListener('change', fetchWerbelinkApplications);
    
    let werbelinkSearchDebounce;
    document.getElementById('werbelink-search')?.addEventListener('input', () => {
        clearTimeout(werbelinkSearchDebounce);
        werbelinkSearchDebounce = setTimeout(fetchWerbelinkApplications, 400);
    });

    document.getElementById('btn-export-werbelink')?.addEventListener('click', () => {
        if (!cachedWerbelinkApps || cachedWerbelinkApps.length === 0) {
            alert('Keine Daten zum Exportieren vorhanden.');
            return;
        }
        const headers = ['ID', 'Datum', 'Salutation', 'FirstName', 'LastName', 'Email', 'Phone', 'CompanyName', 'Partner', 'Status'];
        const rows = cachedWerbelinkApps.map(a => [
            a.id,
            new Date(a.createdAt).toLocaleString('de-DE'),
            `"${(a.salutation || '').replace(/"/g, '""')}"`,
            `"${(a.firstName || '').replace(/"/g, '""')}"`,
            `"${(a.lastName || a.fullName || '').replace(/"/g, '""')}"`,
            `"${(a.email || '').replace(/"/g, '""')}"`,
            `"${(a.phone || '').replace(/"/g, '""')}"`,
            `"${(a.companyName || '').replace(/"/g, '""')}"`,
            `"${(a.affiliateLink?.name || '').replace(/"/g, '""')}"`,
            a.masterDataStatus || 'SUBMITTED'
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `werbelink_anfragen_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // --- Manual Partner Creation Logic ---
    window.openCreatePartnerModal = async function() {
        const select = document.getElementById('create-partner-affiliate-select');
        if (select) {
            try {
                const res = await fetch(`${API_URL}/admin/affiliates`, { headers: { 'Authorization': `Bearer ${token}` } });
                const json = await res.json();
                if (json.success && json.data) {
                    select.innerHTML = '<option value="">Kein Werbelink (Direkt)</option>' +
                        json.data.map(p => `<option value="${p.id}">${p.name} (${p.code})</option>`).join('');
                }
            } catch (e) {
                console.error('Error loading affiliates for create modal:', e);
            }
        }
        document.getElementById('create-partner-modal').style.display = 'flex';
    };

    window.closeCreatePartnerModal = function() {
        document.getElementById('create-partner-modal').style.display = 'none';
        document.getElementById('create-partner-form')?.reset();
    };

    document.getElementById('create-partner-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Speichert...';
        }

        const formData = new FormData(form);
        const payload = {};
        formData.forEach((value, key) => {
            payload[key] = value;
        });

        try {
            const res = await fetch(`${API_URL}/admin/partner-applications/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                alert('Partner-Bewerbung erfolgreich manuell angelegt!');
                closeCreatePartnerModal();
                loadData();
                fetchWerbelinkApplications();
            } else {
                alert('Fehler beim Anlegen: ' + (data.error || 'Unbekannt'));
            }
        } catch (err) {
            alert('Netzwerkfehler beim Anlegen des Partners.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Partner jetzt anlegen';
            }
        }
    });

    // Bind event for tab switch
    const werbelinkTabBtn = document.querySelector('button[onclick="switchTab(\'werbelink\')"]');
    if (werbelinkTabBtn) {
        werbelinkTabBtn.addEventListener('click', loadWerbelinkTab);
    }
    const affiliateTabBtn = document.querySelector('button[onclick="switchTab(\'affiliates\')"]');
    if(affiliateTabBtn) {
        affiliateTabBtn.addEventListener('click', loadAffiliates);
    }

    // --- 5. In-House Partner Portal & EnergyOrder Commission Management ---
    function fmtEurAdmin(v) {
        return Number(v || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }

    window.activatePartnerPortalAccount = async function(appId) {
        try {
            const res = await fetch(`${API_URL}/admin/partner-applications/${appId}/activate-portal`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                alert('Fehler bei der Portal-Freischaltung: ' + (data.error || 'Unbekannt'));
                return;
            }
            const p = data.partner;
            alert(
                `Partner-Portal Zugang aktiv!\n\n` +
                `Name: ${p.fullName}\n` +
                `Partner-Code: ${p.partnerCode}\n` +
                `Login E-Mail: ${p.email}\n` +
                `Passwort: ${data.generatedPassword}\n\n` +
                `Login-URL: ${window.location.origin}/vertriebspartner-portal.html`
            );
            loadData();
        } catch (err) {
            alert('Netzwerkfehler bei der Portal-Aktivierung.');
        }
    };

    function escAdmin(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    window.loadAdminPortalOverview = async function() {
        try {
            const res = await fetch(`${API_URL}/admin/portal-overview`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!data.success) return;

            const k = data.kpis || {};
            const setTxt = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
            setTxt('admin-kpi-orders', String(k.ordersCount || 0));
            setTxt('admin-kpi-partners', String(k.partnersCount || 0));
            setTxt('admin-kpi-comm-pending', fmtEurAdmin(k.totalCommissionPending));
            setTxt('admin-kpi-comm-paid', fmtEurAdmin((k.totalCommissionApproved || 0) + (k.totalCommissionPaid || 0)));
            setTxt('admin-kpi-clicks', String(k.clicksCount || 0));

            const ordersTbody = document.getElementById('admin-portal-orders-tbody');
            if (ordersTbody) {
                const orders = data.orders || [];
                if (orders.length === 0) {
                    ordersTbody.innerHTML = '<tr><td colspan="8" class="text-center">Keine Energieaufträge vorhanden.</td></tr>';
                } else {
                    ordersTbody.innerHTML = orders.map(o => `
                        <tr>
                            <td>
                                <strong>${escAdmin(o.orderNumber)}</strong><br>
                                <span style="font-size:0.75rem;color:#64748b;">${new Date(o.createdAt).toLocaleString('de-DE')}</span>
                            </td>
                            <td>
                                <strong>${escAdmin(o.firstName)} ${escAdmin(o.lastName)}</strong><br>
                                <span style="font-size:0.8rem;color:#475569;">${escAdmin(o.street)} ${escAdmin(o.houseNr)}, ${escAdmin(o.plz)} ${escAdmin(o.city)}</span>
                            </td>
                            <td>
                                <strong>${escAdmin(o.tariffName)}</strong> (${escAdmin(String(o.branch || 'strom').toUpperCase())})<br>
                                <span style="font-size:0.78rem;color:#64748b;">${Number(o.consumption || 0).toLocaleString('de-DE')} kWh · Zähler: ${escAdmin(o.meterNumber)}</span>
                            </td>
                            <td>
                                <span style="font-family:monospace;font-size:0.78rem;">${escAdmin(o.iban || '-')}</span><br>
                                <span style="font-size:0.75rem;color:${o.ibanValid ? '#16a34a' : '#64748b'};">${escAdmin(o.bankName || (o.ibanValid ? '✓ Mod-97 OK' : ''))}</span>
                            </td>
                            <td>
                                <strong>${escAdmin(o.partnerCode || 'Direkt (Online)')}</strong><br>
                                <span style="font-size:0.75rem;color:#64748b;">Kanal: ${escAdmin(o.orderSource || 'ONLINE')}${o.subId ? ' · Sub: ' + escAdmin(o.subId) : ''}</span>
                            </td>
                            <td>
                                ${o.signedAt
                                    ? `<span style="color:#16a34a;font-weight:700;font-size:0.78rem;">✓ eSign vorhanden</span>`
                                    : (o.signatureToken
                                        ? `<a href="/vertriebspartner-portal.html?sign=${encodeURIComponent(o.signatureToken)}" target="_blank" style="color:#ea580c;font-weight:700;font-size:0.78rem;">Offener eSign-Link</a>`
                                        : `<span style="color:#64748b;font-size:0.75rem;">Web-Abschluss</span>`)}
                            </td>
                            <td>
                                <select onchange="updateAdminEnergyOrder(${Number(o.id)}, { status: this.value })" style="padding:5px 8px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.8rem;">
                                    <option value="RECEIVED" ${o.status === 'RECEIVED' ? 'selected' : ''}>Eingegangen</option>
                                    <option value="PENDING_SIGNATURE" ${(o.status === 'PENDING_SIGNATURE' || o.status === 'AWAITING_SIGNATURE') ? 'selected' : ''}>Wartet auf eSign</option>
                                    <option value="PROCESSING" ${o.status === 'PROCESSING' ? 'selected' : ''}>In Bearbeitung</option>
                                    <option value="CONFIRMED" ${o.status === 'CONFIRMED' ? 'selected' : ''}>Bestätigt</option>
                                    <option value="CANCELLED" ${o.status === 'CANCELLED' ? 'selected' : ''}>Storniert</option>
                                </select>
                            </td>
                            <td>
                                <div style="font-weight:800;color:#0f172a;margin-bottom:4px;">${fmtEurAdmin(o.commissionAmount)}</div>
                                <select onchange="updateAdminEnergyOrder(${Number(o.id)}, { commissionStatus: this.value })" style="padding:4px 8px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.78rem;">
                                    <option value="NONE" ${o.commissionStatus === 'NONE' ? 'selected' : ''}>Keine</option>
                                    <option value="PENDING" ${o.commissionStatus === 'PENDING' ? 'selected' : ''}>Vorgemerkt</option>
                                    <option value="APPROVED" ${o.commissionStatus === 'APPROVED' ? 'selected' : ''}>Freigegeben</option>
                                    <option value="PAID" ${o.commissionStatus === 'PAID' ? 'selected' : ''}>Ausgezahlt</option>
                                    <option value="CANCELLED" ${o.commissionStatus === 'CANCELLED' ? 'selected' : ''}>Storniert</option>
                                </select>
                            </td>
                        </tr>
                    `).join('');
                }
            }

            const partnersTbody = document.getElementById('admin-portal-partners-tbody');
            if (partnersTbody) {
                const partners = data.partners || [];
                partnersTbody.innerHTML = partners.map(p => `
                    <tr>
                        <td><strong style="color:#0284c7;">${escAdmin(p.partnerCode)}</strong></td>
                        <td><strong>${escAdmin(p.fullName)}</strong>${p.companyName ? `<br><span style="font-size:0.78rem;color:#64748b;">${escAdmin(p.companyName)}</span>` : ''}</td>
                        <td>
                            <div style="display:flex;flex-direction:column;gap:4px;">
                                <select onchange="updateAdminPartnerUser(${Number(p.id)}, { role: this.value })" style="padding:3px 6px;border-radius:5px;border:1px solid #cbd5e1;font-size:0.76rem;font-weight:700;">
                                    <option value="D2D" ${p.role === 'D2D' ? 'selected' : ''}>D2D</option>
                                    <option value="AFFILIATE" ${p.role === 'AFFILIATE' ? 'selected' : ''}>AFFILIATE</option>
                                    <option value="TIPPGEBER" ${p.role === 'TIPPGEBER' ? 'selected' : ''}>TIPPGEBER</option>
                                    <option value="AGENCY" ${p.role === 'AGENCY' ? 'selected' : ''}>AGENCY</option>
                                </select>
                                <select onchange="updateAdminPartnerUser(${Number(p.id)}, { status: this.value })" style="padding:3px 6px;border-radius:5px;border:1px solid #cbd5e1;font-size:0.74rem;color:${p.status === 'ACTIVE' ? '#15803d' : '#b91c1c'};font-weight:700;">
                                    <option value="ACTIVE" ${p.status === 'ACTIVE' ? 'selected' : ''}>Aktiv</option>
                                    <option value="SUSPENDED" ${p.status === 'SUSPENDED' ? 'selected' : ''}>Gesperrt</option>
                                </select>
                            </div>
                        </td>
                        <td>${escAdmin(p.email)}<br><span style="font-size:0.78rem;color:#64748b;">${escAdmin(p.phone || '-')}</span></td>
                        <td>
                            <div style="display:flex;align-items:center;gap:4px;font-size:0.76rem;">
                                <input type="number" value="${Number(p.stromCommissionEur || 0)}" onchange="updateAdminPartnerUser(${Number(p.id)}, { stromCommissionEur: parseFloat(this.value) || 0, gasCommissionEur: parseFloat(this.value) || 0 })" style="width:52px;padding:3px 5px;border:1px solid #cbd5e1;border-radius:4px;" title="Strom/Gas Provision (€)"> €
                                <span>/ Override:</span>
                                <input type="number" value="${Number(p.overrideCommissionEur || 0)}" onchange="updateAdminPartnerUser(${Number(p.id)}, { overrideCommissionEur: parseFloat(this.value) || 0 })" style="width:46px;padding:3px 5px;border:1px solid #cbd5e1;border-radius:4px;" title="Override Provision (€)"> €
                            </div>
                        </td>
                        <td><span style="font-family:monospace;font-size:0.76rem;">${escAdmin(p.iban || '-')}</span><br><span style="font-size:0.74rem;color:#64748b;">${p.isVatLiable ? 'Regelbesteuert (19% USt.)' : 'Kleinunternehmer (0% USt.)'}</span></td>
                        <td>
                            <button onclick="createAdminCommissionPayout(${Number(p.id)})" style="background:#10b981;color:#fff;border:none;padding:6px 11px;border-radius:6px;font-size:0.78rem;font-weight:700;cursor:pointer;">
                                <i class="fa-solid fa-file-invoice-dollar"></i> Gutschrift erstellen
                            </button>
                        </td>
                    </tr>
                `).join('');
            }

            const leadsTbody = document.getElementById('admin-portal-leads-tbody');
            if (leadsTbody) {
                const leads = data.leads || [];
                if (leads.length === 0) {
                    leadsTbody.innerHTML = '<tr><td colspan="4" class="text-center">Keine Tippgeber-Empfehlungen.</td></tr>';
                } else {
                    leadsTbody.innerHTML = leads.map(l => `
                        <tr>
                            <td><strong>${escAdmin(l.partnerCode)}</strong></td>
                            <td><strong>${escAdmin(l.customerName)}</strong><br><span style="font-size:0.78rem;color:#64748b;">${escAdmin(l.customerPhone)}</span></td>
                            <td>${escAdmin(String(l.branch || 'strom').toUpperCase())}</td>
                            <td>
                                <select onchange="updateAdminPartnerLead(${Number(l.id)}, this.value)" style="padding:4px 8px;border-radius:6px;border:1px solid #cbd5e1;font-size:0.78rem;">
                                    <option value="NEW" ${l.status === 'NEW' ? 'selected' : ''}>Neu</option>
                                    <option value="CONTACTED" ${l.status === 'CONTACTED' ? 'selected' : ''}>Kontaktiert</option>
                                    <option value="QUALIFIED" ${l.status === 'QUALIFIED' ? 'selected' : ''}>Qualifiziert</option>
                                    <option value="CONVERTED" ${l.status === 'CONVERTED' ? 'selected' : ''}>Abgeschlossen</option>
                                    <option value="PAID" ${l.status === 'PAID' ? 'selected' : ''}>Ausgezahlt</option>
                                    <option value="REJECTED" ${l.status === 'REJECTED' ? 'selected' : ''}>Abgelehnt</option>
                                </select>
                                <span style="margin-left:6px;font-weight:700;">${fmtEurAdmin(l.commissionAmount)}</span>
                            </td>
                        </tr>
                    `).join('');
                }
            }

            const payoutsTbody = document.getElementById('admin-portal-payouts-tbody');
            if (payoutsTbody) {
                const payouts = data.payouts || [];
                if (payouts.length === 0) {
                    payoutsTbody.innerHTML = '<tr><td colspan="4" class="text-center">Noch keine Gutschriften.</td></tr>';
                } else {
                    payoutsTbody.innerHTML = payouts.map(po => `
                        <tr>
                            <td><strong>${escAdmin(po.payoutNumber)}</strong></td>
                            <td>${escAdmin(po.periodLabel)} (${Number(po.ordersCount || 0)} Vertr.)</td>
                            <td>${fmtEurAdmin(po.netAmount)} Netto<br><strong>${fmtEurAdmin(po.grossAmount)} Brutto</strong></td>
                            <td><a href="/api/partner/payouts/${Number(po.id)}/pdf" target="_blank" style="color:#ea580c;font-weight:700;text-decoration:underline;">PDF öffnen</a></td>
                        </tr>
                    `).join('');
                }
            }
        } catch (err) {
            console.error('Error loading admin portal overview:', err);
        }
    };

    window.updateAdminPartnerUser = async function(partnerId, patchData) {
        try {
            await fetch(`${API_URL}/admin/partner-users/${partnerId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(patchData)
            });
            window.loadAdminPortalOverview();
        } catch (err) {
            alert('Fehler beim Aktualisieren des Partners.');
        }
    };

    window.updateAdminEnergyOrder = async function(orderId, patchData) {
        try {
            await fetch(`${API_URL}/admin/energy-orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(patchData)
            });
            window.loadAdminPortalOverview();
        } catch (err) {
            alert('Fehler beim Aktualisieren des Auftrags.');
        }
    };

    window.updateAdminPartnerLead = async function(leadId, status) {
        try {
            await fetch(`${API_URL}/admin/partner-leads/${leadId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            window.loadAdminPortalOverview();
        } catch (err) {}
    };

    window.createAdminCommissionPayout = async function(partnerId) {
        try {
            const res = await fetch(`${API_URL}/admin/payouts/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ partnerId, markPaid: true })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                alert(data.error || 'Keine offenen Provisionen für diesen Partner vorhanden.');
                return;
            }
            alert(`Provisionsgutschrift ${data.payout.payoutNumber} (${fmtEurAdmin(data.payout.grossAmount)} Brutto) erfolgreich erstellt!`);
            window.loadAdminPortalOverview();
        } catch (err) {
            alert('Fehler beim Erstellen der Gutschrift.');
        }
    };
}
