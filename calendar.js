document.addEventListener("DOMContentLoaded", () => {
    const datesContainer = document.getElementById("calendar-dates");
    const timesContainer = document.getElementById("calendar-times");
    const timeStep = document.getElementById("time-selection-step");
    const formStep = document.getElementById("booking-form-step");
    const successMsg = document.getElementById("booking-success-message");
    const selectedDateDisplay = document.getElementById("selected-date-display");
    const finalDatetimeDisplay = document.getElementById("final-datetime-display");
    const apptForm = document.getElementById("appointment-form");

    // Only run on pages that have the calendar
    if (!datesContainer) return;

    let selectedDate = null;
    let selectedTime = null;

    // Pre-fill form from localStorage if they just registered
    const savedName = localStorage.getItem('partnerName');
    const savedEmail = localStorage.getItem('partnerEmail');
    const savedPhone = localStorage.getItem('partnerPhone');
    
    if (savedName) document.getElementById('appt-name').value = savedName;
    if (savedEmail) document.getElementById('appt-email').value = savedEmail;
    if (savedPhone) document.getElementById('appt-phone').value = savedPhone;

    // Generate upcoming dates (next 14 days, skipping weekends)
    const dates = [];
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1); // Start tomorrow

    while (dates.length < 10) { // Get 10 working days
        const day = currentDate.getDay();
        if (day !== 0 && day !== 6) { // Skip Sunday(0) and Saturday(6)
            dates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const formatDate = (dateObj) => {
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const getDayName = (dateObj) => {
        const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        return days[dateObj.getDay()];
    };

    // Render Dates
    dates.forEach(d => {
        const dateStr = formatDate(d);
        const displayStr = `${getDayName(d)}, ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
        
        const btn = document.createElement("button");
        btn.className = "cal-date-btn";
        btn.innerHTML = `<span>${displayStr}</span><span style="color: var(--text-muted); font-size: 0.9em;">›</span>`;
        
        btn.addEventListener("click", async () => {
            // UI updates
            document.querySelectorAll(".cal-date-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            selectedDate = dateStr;
            selectedTime = null;
            selectedDateDisplay.textContent = displayStr;
            
            // Hide form if it was open
            formStep.style.display = "none";
            timesContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">Lade freie Termine...</div>';
            timeStep.style.display = "block";

            // Fetch times from Backend
            try {
                // Adjust API URL if local
                const isLocalDev = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000';
                const API_URL = isLocalDev ? `http://localhost:3000/api/appointments/available?date=${dateStr}` : `/api/appointments/available?date=${dateStr}`;
                
                const res = await fetch(API_URL);
                if (!res.ok) throw new Error("API failed");
                const { data } = await res.json();
                
                renderTimes(data);
            } catch (err) {
                console.error(err);
                timesContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 1rem;">Fehler beim Laden der Zeiten.</div>';
            }
        });
        
        datesContainer.appendChild(btn);
    });

    const renderTimes = (availableTimes) => {
        timesContainer.innerHTML = '';
        
        if (!availableTimes || availableTimes.length === 0) {
            timesContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 1rem;">Keine Termine an diesem Tag verfügbar.</div>';
            return;
        }

        availableTimes.forEach(time => {
            const btn = document.createElement("button");
            btn.className = "cal-time-btn";
            btn.textContent = time;
            
            btn.addEventListener("click", () => {
                document.querySelectorAll(".cal-time-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                selectedTime = time;
                finalDatetimeDisplay.textContent = `${selectedDateDisplay.textContent} um ${time} Uhr`;
                formStep.style.display = "block";
                
                // Scroll to form smoothly
                formStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            
            timesContainer.appendChild(btn);
        });
    };

    // Handle form submit
    apptForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        if (!selectedDate || !selectedTime) return;
        
        const submitBtn = apptForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Bitte warten...";
        
        const name = document.getElementById("appt-name").value;
        const email = document.getElementById("appt-email").value;
        const phone = document.getElementById("appt-phone").value;
        
        try {
            const isLocalDev = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000';
            const API_URL = isLocalDev ? 'http://localhost:3000/api/appointments' : '/api/appointments';
            
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    date: selectedDate,
                    time: selectedTime
                })
            });
            
            if (!res.ok) throw new Error("API failed");
            
            // Success
            timeStep.style.display = "none";
            formStep.style.display = "none";
            successMsg.style.display = "block";
            
            // Clear localStorage so it doesn't auto-fill forever if not wanted
            localStorage.removeItem('partnerName');
            localStorage.removeItem('partnerEmail');
            localStorage.removeItem('partnerPhone');
            
        } catch (err) {
            console.error(err);
            alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut oder rufen Sie uns an.");
            submitBtn.disabled = false;
            submitBtn.textContent = "Termin verbindlich buchen";
        }
    });
});
