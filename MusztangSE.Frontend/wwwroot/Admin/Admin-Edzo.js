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
function generalAzonosito(inputId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    document.getElementById(inputId).value = result;
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
        const response = await fetch('https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/admin/felhasznalok/edzo', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nev, felhasznaloAzonosito: azonosito })
        });

        if (response.ok) {
            showMessage('fo-uzenetedzo', 'Edző sikeresen hozzáadva!', false);
            closeUjEdzo();
            loadEdzok();
        } else {
            const hiba = await response.text();
            showMessage('uj-edzo-uzenet', hiba, true);
        }
    } catch (err) {
        showMessage('uj-edzo-uzenet', 'Kapcsolódási hiba.', true);
    }
}
async function loadEdzok() {
    try {
        const response = await fetch('https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/admin/edzok', {
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
async function toggleMindenTagotLat(id) {
    try {
        const response = await fetch(`https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/admin/edzok/${id}/minden-tagot-lat`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            showMessage('fo-uzenet', 'Jogosultság módosítva!', false);
            loadEdzok();
        } else {
            showMessage('fo-uzenet', 'Hiba a módosítás során.', true);
        }
    } catch (err) {
        showMessage('fo-uzenet', 'Kapcsolódási hiba.', true);
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
        box.querySelector('.edit-nev-btn').insertAdjacentHTML('afterend', `
    <button type="button" class="action-btn ${e.mindenTagotLat ? 'toggle-btn-aktiv' : 'toggle-btn'} minden-tag-btn" data-id="${e.id}">
        ${e.mindenTagotLat ? '👁 Minden tagot lát' : '👁 Csak saját tagok'}
    </button>
`);

        box.querySelector('.minden-tag-btn').addEventListener('click', () => toggleMindenTagotLat(e.id));
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
    let url = `https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/admin/edzok/${torlesId}`;
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
        const response = await fetch(`https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/admin/edzok/${id}/nev`, {
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
    document.getElementById('uj-edzo-gomb').addEventListener('click', openUjEdzo);
    document.getElementById('edzo-megse').addEventListener('click', closeUjEdzo);
    document.getElementById('edzo-mentes').addEventListener('click', saveUjEdzo);
    document.getElementById('edzo-azonosito-general').addEventListener('click', () => generalAzonosito('edzo-azonosito'));
    document.getElementById('modal-torol').addEventListener('click', deleteEdzo);
    document.getElementById('modal-megse').addEventListener('click', closeTorlesModal);

    loadEdzok();
});