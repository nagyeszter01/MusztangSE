const token = localStorage.getItem('token');
if (!token) window.location.href = '/Bejelentkezes/bejelentkezes.html';

let osszeVerseny = [];
let kereses = '';
let idoFilter = 'osszes';

function showMessage(id, message, isError) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className = 'uzenet ' + (isError ? 'hiba' : 'siker');
    setTimeout(() => { el.className = 'uzenet'; el.textContent = ''; }, 4000);
}

async function loadVersenyek() {
    try {
        const response = await fetch('https://localhost:7104/api/admin/versenyek', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = '/Bejelentkezes/bejelentkezes.html';
            return;
        }
        if (!response.ok) return;
        osszeVerseny = await response.json();
        renderVersenyek();
    } catch (err) {
        console.error('Hiba:', err);
    }
}

function getSzurt() {
    const ma = new Date();
    return osszeVerseny.filter(v => {
        const egyezikKereses = kereses === '' ||
            v.nev.toLowerCase().includes(kereses.toLowerCase()) ||
            v.hely.toLowerCase().includes(kereses.toLowerCase());

        const datum = new Date(v.datum);
        const egyezikIdo = idoFilter === 'osszes' ||
            (idoFilter === 'kozelgo' && datum >= ma) ||
            (idoFilter === 'elmult' && datum < ma);

        return egyezikKereses && egyezikIdo;
    });
}

function renderVersenyek() {
    const tbody = document.getElementById('versenyek-tbody');
    tbody.innerHTML = '';
    const szurt = getSzurt();
    const ma = new Date();

    if (szurt.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="ures-sor">Nincs találat.</td></tr>';
        return;
    }

    szurt.forEach(v => {
        const datum = new Date(v.datum);
        const kozelgo = datum >= ma;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="td-nev">${v.nev}</td>
            <td>
                <span class="aktiv-badge ${kozelgo ? 'aktiv' : 'inaktiv'}">
                    ${datum.toLocaleDateString('hu-HU')}
                </span>
            </td>
            <td>${v.hely}</td>
            <td class="td-actions">
                <button type="button" class="action-btn toggle-btn edit-btn" data-id="${v.id}">Szerkesztés</button>
                <button type="button" class="action-btn torol-btn-piros delete-btn" data-id="${v.id}" data-nev="${v.nev}">Törlés</button>
            </td>
        `;

        tr.querySelector('.edit-btn').addEventListener('click', () => openEdit(v));
        tr.querySelector('.delete-btn').addEventListener('click', () => deleteVerseny(v.id, v.nev));

        tbody.appendChild(tr);
    });
}

function openEdit(v) {
    document.getElementById('edit-id').value = v.id;
    document.getElementById('edit-nev').value = v.nev;
    document.getElementById('edit-hely').value = v.hely;
    document.getElementById('edit-datum').value = v.datum?.split('T')[0];
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEdit() {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-uzenet').className = 'uzenet';
    document.getElementById('edit-uzenet').textContent = '';
}

async function saveEdit() {
    const id = document.getElementById('edit-id').value;
    const nev = document.getElementById('edit-nev').value.trim();
    const hely = document.getElementById('edit-hely').value.trim();
    const datum = document.getElementById('edit-datum').value;

    if (!nev || !hely || !datum) {
        showMessage('edit-uzenet', 'Minden mező kötelező!', true);
        return;
    }

    try {
        const response = await fetch(`https://localhost:7104/api/admin/versenyek/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nev, hely, datum })
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Verseny sikeresen módosítva!', false);
            closeEdit();
            loadVersenyek();
        } else {
            showMessage('edit-uzenet', 'Hiba a mentés során.', true);
        }
    } catch (err) {
        showMessage('edit-uzenet', 'Kapcsolódási hiba.', true);
    }
}

async function deleteVerseny(id, nev) {
    if (!confirm(`Biztosan törlöd: "${nev}"?`)) return;
    try {
        const response = await fetch(`https://localhost:7104/api/admin/versenyek/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            showMessage('fo-uzenet', 'Verseny törölve!', false);
            loadVersenyek();
        } else {
            showMessage('fo-uzenet', 'Hiba a törlés során.', true);
        }
    } catch (err) {
        showMessage('fo-uzenet', 'Kapcsolódási hiba.', true);
    }
}

function openUjVerseny() {
    document.getElementById('uj-verseny-form').style.display = 'flex';
    document.getElementById('uj-verseny-gomb').style.display = 'none';
}

function closeUjVerseny() {
    document.getElementById('uj-verseny-form').style.display = 'none';
    document.getElementById('uj-verseny-gomb').style.display = 'block';
    document.getElementById('uj-nev').value = '';
    document.getElementById('uj-hely').value = '';
    document.getElementById('uj-datum').value = '';
}

async function saveUjVerseny() {
    const nev = document.getElementById('uj-nev').value.trim();
    const hely = document.getElementById('uj-hely').value.trim();
    const datum = document.getElementById('uj-datum').value;

    if (!nev || !hely || !datum) {
        showMessage('uj-verseny-uzenet', 'Minden mező kötelező!', true);
        return;
    }

    try {
        const response = await fetch('https://localhost:7104/api/admin/versenyek', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nev, hely, datum })
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Verseny sikeresen hozzáadva!', false);
            closeUjVerseny();
            loadVersenyek();
        } else {
            const hiba = await response.text();
            showMessage('uj-verseny-uzenet', hiba, true);
        }
    } catch (err) {
        showMessage('uj-verseny-uzenet', 'Kapcsolódási hiba.', true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('kijelentkezes-gomb').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/Bejelentkezes/bejelentkezes.html';
    });

    document.getElementById('kereses-input').addEventListener('input', e => {
        kereses = e.target.value;
        renderVersenyek();
    });

    document.getElementById('ido-filter').addEventListener('change', e => {
        idoFilter = e.target.value;
        renderVersenyek();
    });

    document.getElementById('uj-verseny-gomb').addEventListener('click', openUjVerseny);
    document.getElementById('uj-verseny-mentes').addEventListener('click', saveUjVerseny);
    document.getElementById('uj-verseny-megse').addEventListener('click', closeUjVerseny);
    document.getElementById('edit-mentes').addEventListener('click', saveEdit);
    document.getElementById('edit-megse').addEventListener('click', closeEdit);

    loadVersenyek();
});