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

    // Tab Switching
    window.switchTab = function(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        document.querySelector(`button[onclick="switchTab('${tabName}')"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
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
                renderApplications(json.data.applications);
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
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Keine Kontaktanfragen gefunden.</td></tr>';
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
            </tr>
        `).join('');
    }

    function renderApplications(apps) {
        const tbody = document.getElementById('partners-tbody');
        if (!tbody) return;
        if (apps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Keine Bewerbungen gefunden.</td></tr>';
            return;
        }

        tbody.innerHTML = apps.map(a => `
            <tr>
                <td>${new Date(a.createdAt).toLocaleString('de-DE')}</td>
                <td>${a.fullName}</td>
                <td><a href="mailto:${a.email}">${a.email}</a></td>
                <td><a href="tel:${a.phone}">${a.phone}</a></td>
                <td>${a.experience}</td>
            </tr>
        `).join('');
    }

    function renderAppointments(appointments) {
        const tbody = document.getElementById('appointments-tbody');
        if (!tbody) return;
        if (!appointments || appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Keine Termine gefunden.</td></tr>';
            return;
        }

        tbody.innerHTML = appointments.map(a => `
            <tr>
                <td>${new Date(a.createdAt).toLocaleString('de-DE')}</td>
                <td><strong>${a.date}</strong> um ${a.time} Uhr</td>
                <td>${a.name}</td>
                <td><a href="mailto:${a.email}">${a.email}</a></td>
                <td>${a.phone ? `<a href="tel:${a.phone}">${a.phone}</a>` : '-'}</td>
            </tr>
        `).join('');
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
}
