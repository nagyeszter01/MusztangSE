const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/Bejelentkezes/bejelentkezes.html';
}

function loadAdminNev() {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        const payload = JSON.parse(jsonPayload);
        document.getElementById('admin-nev').textContent =
            `Bejelentkezve: ${payload['fullName'] ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']}`;
    } catch (err) {
        console.error('Hiba:', err);
    }
}

async function loadStats() {
    try {
        const response = await fetch('http://localhost:5217/api/admin/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = '/Bejelentkezes/bejelentkezes.html';
            return;
        }

        if (!response.ok) return;

        const data = await response.json();

        document.getElementById('stat-tagok').textContent = data.osszesTago;
        document.getElementById('stat-edzok').textContent = data.edzokSzama;
        document.getElementById('stat-csapatok').textContent = data.csapatokSzama;
        document.getElementById('stat-versenyek').textContent = data.kozelgoVersenyek;

    } catch (err) {
        console.error('Hiba a statisztikák betöltésekor:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('kijelentkezes-gomb').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('szerep');
        window.location.href = '/Bejelentkezes/bejelentkezes.html';
    });

    loadAdminNev();
    loadStats();
});