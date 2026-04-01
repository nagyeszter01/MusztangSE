const token = localStorage.getItem('token');
if (!token) window.location.href = '/Bejelentkezes/bejelentkezes.html';

let osszesFelhasznalo = [];
let kereses = '';
let szerepkorFilter = '';

function showMessage(id, message, isError) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className = 'uzenet ' + (isError ? 'hiba' : 'siker');
    setTimeout(() => { el.className = 'uzenet'; el.textContent = ''; }, 4000);
}
function customConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const text = document.getElementById('confirm-text');
        const igen = document.getElementById('confirm-igen');
        const nem = document.getElementById('confirm-nem');

        text.textContent = message;
        modal.style.display = 'flex';

        function cleanup() {
            modal.style.display = 'none';
            igen.removeEventListener('click', onYes);
            nem.removeEventListener('click', onNo);
        }

        function onYes() {
            cleanup();
            resolve(true);
        }

        function onNo() {
            cleanup();
            resolve(false);
        }

        igen.addEventListener('click', onYes);
        nem.addEventListener('click', onNo);
    });
}
function generalAzonosito(inputId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    document.getElementById(inputId).value = result;
}
function getSajatId() {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(
            atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        ));
        return parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
    } catch {
        return null;
    }
}

async function loadFelhasznalok() {
    try {
        const response = await fetch('https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/admin/felhasznalok', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = '/Bejelentkezes/bejelentkezes.html';
            return;
        }
        if (!response.ok) return;
        osszesFelhasznalo = await response.json();
        renderFelhasznalok();
    } catch (err) {
        console.error('Hiba:', err);
    }
}

function getSzurt() {
    return osszesFelhasznalo.filter(f => {
        const egyezikKereses = kereses === '' ||
            f.nev?.toLowerCase().includes(kereses.toLowerCase()) ||
            f.felhasznaloAzonosito?.toLowerCase().includes(kereses.toLowerCase());
        const egyezikSzerepkor = szerepkorFilter === '' || f.szerepkor === szerepkorFilter;
        return egyezikKereses && egyezikSzerepkor;
    });
}

function szerepkorNev(szerep) {
    switch(szerep) {
        case 'edzo': return 'Edző';
        case 'admin': return 'Admin';
        case 'tag': return 'Tag';
        default: return szerep;
    }
}

function renderFelhasznalok() {
    const tbody = document.getElementById('felhasznalok-tbody');
    tbody.innerHTML = '';
    const szurt = getSzurt();

    if (szurt.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="ures-sor">Nincs találat.</td></tr>';
        return;
    }

    szurt.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
    <td data-label="Név" class="td-nev">${f.nev}</td>
    <td data-label="Azonosító" class="td-azonosito">${f.felhasznaloAzonosito}</td>
    <td data-label="Szerepkör"><span class="szerepkor-badge szerepkor-${f.szerepkor}">${szerepkorNev(f.szerepkor)}</span></td>
    <td data-label="Jelszó beállítva">${f.passwordSetAt ? new Date(f.passwordSetAt).toLocaleDateString('hu-HU') : '—'}</td>
    <td data-label="Státusz">
        <span class="aktiv-badge ${f.aktiv ? 'aktiv' : 'inaktiv'}">
            ${f.aktiv ? 'Aktív' : 'Inaktív'}
        </span>
    </td>
 <td class="td-actions">
    ${f.szerepkor !== 'admin' ? `
        <button type="button" class="action-btn toggle-btn" data-id="${f.id}">
            ${f.aktiv ? 'Deaktiválás' : 'Aktiválás'}
        </button>
        <button type="button" class="action-btn delete-btn" data-id="${f.id}">
            Törlés
        </button>
    ` : f.id === getSajatId() ? `
        <button type="button" class="action-btn delete-btn" data-id="${f.id}">
            Saját fiók törlése
        </button>
    ` : '<span style="color:rgba(255,255,255,0.3); font-size:0.82rem">—</span>'}
</td>
`;
        if (f.szerepkor !== 'admin') {
            tr.querySelector('.toggle-btn').addEventListener('click', () => toggleAktiv(f.id));
            tr.querySelector('.delete-btn').addEventListener('click', () => deleteFelhasznalo(f.id, f.nev));
        } else if (f.id === getSajatId()) {
            tr.querySelector('.delete-btn').addEventListener('click', () => deleteFelhasznalo(f.id, f.nev));
        }
        tbody.appendChild(tr);
    });
}
async function toggleAktiv(id) {
    try {
        const response = await fetch(`https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/admin/felhasznalok/${id}/aktiv`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            showMessage('fo-uzenet', 'Státusz módosítva!', false);
            loadFelhasznalok();
        }
    } catch (err) {
        showMessage('fo-uzenet', 'Kapcsolódási hiba.', true);
    }
}

async function deleteFelhasznalo(id, nev) {
    const ok = await customConfirm(`Biztosan törlöd: ${nev}?`);
    if (!ok) return;

    try {
        const response = await fetch(`https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/admin/felhasznalok/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Felhasználó törölve!', false);
            loadFelhasznalok();
        } else {
            showMessage('fo-uzenet', 'Hiba a törlés során.', true);
        }
    } catch (err) {
        showMessage('fo-uzenet', 'Kapcsolódási hiba.', true);
    }
}




document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const mobilMenu = document.getElementById('mobil-menu');

    if (hamburger && mobilMenu) {
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
    }

    document.getElementById('kijelentkezes-gomb').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/Bejelentkezes/bejelentkezes.html';
    });

    document.getElementById('kereses-input').addEventListener('input', e => {
        kereses = e.target.value;
        renderFelhasznalok();
    });

    document.getElementById('szerepkor-filter').addEventListener('change', e => {
        szerepkorFilter = e.target.value;
        renderFelhasznalok();
    });

    loadFelhasznalok();
});

