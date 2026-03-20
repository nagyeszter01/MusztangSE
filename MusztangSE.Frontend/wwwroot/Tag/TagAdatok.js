const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/Bejelentkezes/bejelentkezes.html';
}

function showMessage(targetId, message, isError) {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.textContent = message;
    el.className = 'uzenet ' + (isError ? 'hiba' : 'siker');
    setTimeout(() => {
        el.className = 'uzenet';
        el.textContent = '';
    }, 4000);
}

async function loadData() {
    try {
        const response = await fetch('https://localhost:7104/api/tag/me/adataim', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = '/Bejelentkezes/bejelentkezes.html';
            return;
        }

        if (!response.ok) {
            showMessage('szemelyes-uzenet', 'Hiba az adatok betöltésekor.', true);
            return;
        }

        const adat = await response.json();

        document.getElementById('nev').textContent = adat.nev ?? '';
        document.getElementById('szuletes').textContent = adat.szuletes?.split('T')[0] ?? '';
        document.getElementById('anyjaneve').textContent = adat.anyjaNeve ?? '';
        document.getElementById('lakcim').textContent = adat.lakcim ?? '';
        document.getElementById('telefonszam').textContent = adat.telefonszam ?? '';
        document.getElementById('email').textContent = adat.email ?? '';

        document.getElementById('statusz').textContent = adat.tagsagiStatusz ? 'Aktív' : 'Inaktív';
        document.getElementById('versenyengedely').textContent = adat.versenyengedelySzam ?? '';
        document.getElementById('sportorvosi').textContent = adat.sportorvosiEngedely?.split('T')[0] ?? '';
        document.getElementById('tagsagKezdete').textContent = adat.tagsagKezdete?.split('T')[0] ?? '';

        document.getElementById('lakcim-input').value = adat.lakcim ?? '';
        document.getElementById('telefonszam-input').value = adat.telefonszam ?? '';
        document.getElementById('email-input').value = adat.email ?? '';

    } catch (err) {
        console.error('Hiba:', err);
        showMessage('szemelyes-uzenet', 'Kapcsolódási hiba.', true);
    }
}

async function updateData() {
    const dto = {
        lakcim: document.getElementById('lakcim-input').value,
        telefonszam: document.getElementById('telefonszam-input').value,
        email: document.getElementById('email-input').value
    };

    try {
        const response = await fetch('https://localhost:7104/api/tag/me/adataim', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dto)
        });

        if (response.ok) {
            showMessage('szemelyes-uzenet', 'Adatok sikeresen mentve!', false);
            toggleEdit(false);
            loadData();
        } else {
            showMessage('szemelyes-uzenet', 'Hiba a mentés során.', true);
        }
    } catch (err) {
        console.error('Hiba:', err);
        showMessage('szemelyes-uzenet', 'Kapcsolódási hiba.', true);
    }
}

function toggleEdit(show) {
    document.querySelectorAll('.view-mode').forEach(el => el.style.display = show ? 'none' : '');
    document.querySelectorAll('.edit-mode').forEach(el => el.style.display = show ? '' : 'none');
}

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const mobilMenu = document.getElementById('mobil-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('aktiv');
        mobilMenu.classList.toggle('nyitva');
    });

    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobilMenu.contains(e.target)) {
            hamburger.classList.remove('aktiv');
            mobilMenu.classList.remove('nyitva');
        }
    });

    document.getElementById('kijelentkezes-gomb').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/Bejelentkezes/bejelentkezes.html';
    });

    document.getElementById('modosit-gomb')?.addEventListener('click', () => toggleEdit(true));
    document.getElementById('mentes-gomb')?.addEventListener('click', updateData);
    document.getElementById('megse-gomb')?.addEventListener('click', () => toggleEdit(false));

    loadData();
});