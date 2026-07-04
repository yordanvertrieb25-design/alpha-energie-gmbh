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
            } else {
                alert('Fehler beim Laden der Daten.');
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    }

    function renderContacts(contacts) {
        const tbody = document.getElementById('contacts-tbody');
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
            </tr>
        `).join('');
    }

    function renderApplications(apps) {
        const tbody = document.getElementById('applications-tbody');
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

    loadData();
}
