// Self-service appointment booking by registrars is disabled.
// Appointments can only be managed via /admin by authorized administrators.
document.addEventListener("DOMContentLoaded", () => {
    const calendarSection = document.getElementById("termin-buchen");
    if (calendarSection) {
        calendarSection.remove();
    }
});
