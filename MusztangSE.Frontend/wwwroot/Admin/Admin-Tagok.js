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

function generalAzonosito(inputId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    document.getElementById(inputId).value = result;
}

async function loadFelhasznalok() {
    try {
        const response = await fetch('https://localhost:7104/api/admin/felhasznalok', {
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
            <td class="td-nev">${f.nev}</td>
            <td class="td-azonosito">${f.felhasznaloAzonosito}</td>
            <td><span class="szerepkor-badge szerepkor-${f.szerepkor}">${f.szerepkor}</span></td>
            <td>${f.passwordSetAt ? new Date(f.passwordSetAt).toLocaleDateString('hu-HU') : '—'}</td>
            <td>
                <span class="aktiv-badge ${f.aktiv ? 'aktiv' : 'inaktiv'}">
                    ${f.aktiv ? 'Aktív' : 'Inaktív'}
                </span>
            </td>
            <td class="td-actions">
                <button type="button" class="action-btn toggle-btn" data-id="${f.id}" data-aktiv="${f.aktiv}">
                    ${f.aktiv ? 'Deaktiválás' : 'Aktiválás'}
                </button>
                <button type="button" class="action-btn delete-btn" data-id="${f.id}" data-nev="${f.nev}">
                    Törlés
                </button>
            </td>
        `;

        tr.querySelector('.toggle-btn').addEventListener('click', () => toggleAktiv(f.id));
        tr.querySelector('.delete-btn').addEventListener('click', () => deleteFelhasznalo(f.id, f.nev));

        tbody.appendChild(tr);
    });
}

async function toggleAktiv(id) {
    try {
        const response = await fetch(`https://localhost:7104/api/admin/felhasznalok/${id}/aktiv`, {
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
    if (!confirm(`Biztosan törlöd: ${nev}?`)) return;
    try {
        const response = await fetch(`https://localhost:7104/api/admin/felhasznalok/${id}`, {
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

function openUjEdzo() {
    document.getElementById('uj-edzo-form').style.display = 'flex';
    document.getElementById('uj-edzo-gomb').style.display = 'none';
}

function closeUjEdzo() {
    document.getElementById('uj-edzo-form').style.display = 'none';
    document.getElementById('uj-edzo-gomb').style.display = 'block';
    document.getElementById('edzo-nev').value = '';
    document.getElementById('edzo-azonosito').value = '';
}

async function saveUjEdzo() {
    const nev = document.getElementById('edzo-nev').value.trim();
    const azonosito = document.getElementById('edzo-azonosito').value;

    if (!nev || !azonosito) {
        showMessage('uj-edzo-uzenet', 'Minden mező kötelező!', true);
        return;
    }

    try {
        const response = await fetch('https://localhost:7104/api/admin/felhasznalok/edzo', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nev, felhasznaloAzonosito: azonosito })
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Edző sikeresen hozzáadva!', false);
            closeUjEdzo();
            loadFelhasznalok();
        } else {
            const hiba = await response.text();
            showMessage('uj-edzo-uzenet', hiba, true);
        }
    } catch (err) {
        showMessage('uj-edzo-uzenet', 'Kapcsolódási hiba.', true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
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

    document.getElementById('uj-edzo-gomb').addEventListener('click', openUjEdzo);
    document.getElementById('edzo-megse').addEventListener('click', closeUjEdzo);
    document.getElementById('edzo-mentes').addEventListener('click', saveUjEdzo);
    document.getElementById('edzo-azonosito-general').addEventListener('click', () => generalAzonosito('edzo-azonosito'));

    loadFelhasznalok();
});