const token = localStorage.getItem('token');
if (!token) window.location.href = '/Bejelentkezes/bejelentkezes.html';

let osszeEdzok = [];
let kereses = '';
let torlesId = null;

function showMessage(id, message, isError) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className = 'uzenet ' + (isError ? 'hiba' : 'siker');
    setTimeout(() => { el.className = 'uzenet'; el.textContent = ''; }, 4000);
}

async function loadEdzok() {
    try {
        const response = await fetch('https://localhost:7104/api/admin/edzok', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = '/Bejelentkezes/bejelentkezes.html';
            return;
        }
        if (!response.ok) return;
        osszeEdzok = await response.json();
        renderEdzok();
    } catch (err) {
        console.error('Hiba:', err);
    }
}

function getSzurt() {
    return kereses === ''
        ? osszeEdzok
        : osszeEdzok.filter(e => e.nev.toLowerCase().includes(kereses.toLowerCase()));
}

function renderEdzok() {
    const container = document.getElementById('edzok-container');
    container.innerHTML = '';
    const szurt = getSzurt();

    if (szurt.length === 0) {
        container.innerHTML = '<p class="ures-uzenet">Nincs találat.</p>';
        return;
    }

    szurt.forEach(e => {
        const box = document.createElement('div');
        box.className = 'edzo-box';
        box.innerHTML = `
            <div class="edzo-fejlec">
                <div class="edzo-info">
                    <span class="edzo-nev">${e.nev}</span>
                    <span class="edzo-azonosito">${e.felhasznaloAzonosito ?? '—'}</span>
                </div>
                <div class="edzo-actions">
                    <button type="button" class="action-btn edit-nev-btn" data-id="${e.id}" data-nev="${e.nev}">
                        Név módosítása
                    </button>
                    <button type="button" class="action-btn delete-btn torol-btn-piros" data-id="${e.id}">
                        Törlés
                    </button>
                </div>
            </div>

            <!-- Név szerkesztés -->
            <div class="nev-edit-form" id="nev-form-${e.id}" style="display:none">
                <input type="text" id="nev-input-${e.id}" value="${e.nev}" class="admin-search" style="border-radius:10px">
                <button type="button" class="action-btn toggle-btn nev-mentes" data-id="${e.id}">Mentés</button>
                <button type="button" class="action-btn megse-btn-small nev-megse" data-id="${e.id}">Mégse</button>
            </div>

            <!-- Csapatok -->
            <div class="edzo-csapatok">
                <p class="csapatok-cim">Csapatok (${e.csapatok.length})</p>
                ${e.csapatok.length === 0
            ? '<p class="ures-tag">Nincs csapat.</p>'
            : e.csapatok.map(c => `
                        <div class="csapat-sor">
                            <span class="csapat-nev-kis">${c.nev}</span>
                            <span class="csapat-meta-kis">${c.kategoria} · ${c.paros ? 'Páros' : 'Egyéni'}</span>
                        </div>
                    `).join('')
        }
            </div>
        `;

        // Törlés gomb
        box.querySelector('.torol-btn-piros').addEventListener('click', () => openTorlesModal(e));

        // Név szerkesztés
        box.querySelector('.edit-nev-btn').addEventListener('click', () => {
            document.getElementById(`nev-form-${e.id}`).style.display = 'flex';
        });

        box.querySelector('.nev-mentes').addEventListener('click', () => saveNev(e.id));
        box.querySelector('.nev-megse').addEventListener('click', () => {
            document.getElementById(`nev-form-${e.id}`).style.display = 'none';
        });

        container.appendChild(box);
    });
}

function openTorlesModal(edzo) {
    torlesId = edzo.id;
    const modal = document.getElementById('torles-modal');
    const szoveg = document.getElementById('modal-szoveg');
    const ujEdzoWrapper = document.getElementById('uj-edzo-wrapper');
    const ujEdzoSelect = document.getElementById('uj-edzo-select');

    szoveg.textContent = `Biztosan törlöd: ${edzo.nev}?`;

    if (edzo.csapatok.length > 0) {
        szoveg.textContent += ` Az edzőnek ${edzo.csapatok.length} csapata van — rendeld át őket!`;
        ujEdzoWrapper.style.display = 'block';

        ujEdzoSelect.innerHTML = '<option value="">-- Válassz edzőt --</option>';
        osszeEdzok
            .filter(e => e.id !== edzo.id)
            .forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.id;
                opt.textContent = e.nev;
                ujEdzoSelect.appendChild(opt);
            });
    } else {
        ujEdzoWrapper.style.display = 'none';
    }

    modal.style.display = 'flex';
}

function closeTorlesModal() {
    document.getElementById('torles-modal').style.display = 'none';
    document.getElementById('modal-uzenet').className = 'uzenet';
    document.getElementById('modal-uzenet').textContent = '';
    torlesId = null;
}

async function deleteEdzo() {
    if (!torlesId) return;

    const ujEdzoId = document.getElementById('uj-edzo-select').value;
    let url = `https://localhost:7104/api/admin/edzok/${torlesId}`;
    if (ujEdzoId) url += `?ujEdzoId=${ujEdzoId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Edző sikeresen törölve!', false);
            closeTorlesModal();
            loadEdzok();
        } else {
            const hiba = await response.text();
            showMessage('modal-uzenet', hiba, true);
        }
    } catch (err) {
        showMessage('modal-uzenet', 'Kapcsolódási hiba.', true);
    }
}

async function saveNev(id) {
    const nev = document.getElementById(`nev-input-${id}`).value.trim();
    if (!nev) return;

    try {
        const response = await fetch(`https://localhost:7104/api/admin/edzok/${id}/nev`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nev })
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Edző neve módosítva!', false);
            loadEdzok();
        } else {
            showMessage('fo-uzenet', 'Hiba a mentés során.', true);
        }
    } catch (err) {
        showMessage('fo-uzenet', 'Kapcsolódási hiba.', true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('kijelentkezes-gomb').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/Bejelentkezes/bejelentkezes.html';
    });

    document.getElementById('kereses-input').addEventListener('input', e => {
        kereses = e.target.value;
        renderEdzok();
    });

    document.getElementById('modal-torol').addEventListener('click', deleteEdzo);
    document.getElementById('modal-megse').addEventListener('click', closeTorlesModal);

    loadEdzok();
});