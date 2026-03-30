const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/Bejelentkezes/bejelentkezes.html';
}

const OLDAL_MERET = 7;
const TOVABB_MERET = 5;

let osszesTago = [];
let megjelenitve = 0;
let csakAktiv = true;
let kereses = '';

function showMessage(id, message, isError) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className = 'uzenet ' + (isError ? 'hiba' : 'siker');
    setTimeout(() => {
        el.className = 'uzenet';
        el.textContent = '';
    }, 4000);
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
            document.removeEventListener('keydown', onEsc);
        }

        function onYes() {
            cleanup();
            resolve(true);
        }

        function onNo() {
            cleanup();
            resolve(false);
        }

        function onEsc(e) {
            if (e.key === 'Escape') onNo();
        }

        igen.addEventListener('click', onYes);
        nem.addEventListener('click', onNo);
        document.addEventListener('keydown', onEsc);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) onNo();
        });
    });
}

function generalAzonosito() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    document.getElementById('uj-azonosito').value = result;
    showMessage('uj-tag-uzenet', `Azonosító generálva: ${result}`, false);
}

function generalEditAzonosito() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    document.getElementById('edit-azonosito').value = result;
    showMessage('edit-uzenet', `Azonosító generálva: ${result}`, false);
}

function generalEdzoAzonosito() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    document.getElementById('uj-edzo-azonosito').value = result;
}

async function loadTagok() {
    try {
        const response = await fetch('https://localhost:7104/api/coach/tagok', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = '/Bejelentkezes/bejelentkezes.html';
            return;
        }

        if (!response.ok) return;

        osszesTago = await response.json();
        megjelenitve = 0;
        renderTagok();
    } catch (err) {
        console.error('Hiba:', err);
    }
}

function getSzurtTagok() {
    let szurt = csakAktiv ? osszesTago.filter(t => t.tagsagiStatusz) : osszesTago;
    if (kereses.trim() !== '') {
        szurt = szurt.filter(t => t.nev?.toLowerCase().includes(kereses.toLowerCase()));
    }
    return szurt;
}

function renderTagok() {
    const container = document.querySelector('.content-boxes');
    container.innerHTML = '';
    megjelenitve = 0;

    const szurt = getSzurtTagok();
    const megjelenito = szurt.slice(0, OLDAL_MERET);
    megjelenitve = megjelenito.length;

    megjelenito.forEach(t => container.appendChild(createBox(t)));
    updateTovabbGomb(szurt);
}

function updateTovabbGomb(szurt) {
    const tovabbi = document.getElementById('tovabb-gomb');
    const kevesebb = document.getElementById('kevesebb-gomb');

    tovabbi.style.cssText = szurt.length > megjelenitve ? 'display: block !important' : 'display: none !important';
    tovabbi.textContent = szurt.length > megjelenitve
        ? `További ${Math.min(TOVABB_MERET, szurt.length - megjelenitve)} tag betöltése` : '';

    kevesebb.style.cssText = megjelenitve > OLDAL_MERET ? 'display: block !important' : 'display: none !important';
}

function loadTovabb() {
    const szurt = getSzurtTagok();
    const container = document.querySelector('.content-boxes');
    const start = megjelenitve;
    const end = Math.min(start + TOVABB_MERET, szurt.length);

    for (let i = start; i < end; i++) {
        try {
            container.appendChild(createBox(szurt[i]));
        } catch (err) {
            console.error('Hiba a boxnál:', szurt[i], err);
        }
    }

    megjelenitve = end;
    updateTovabbGomb(szurt);
}

function kevesebbet() {
    megjelenitve = 0;
    renderTagok();
    window.scrollTo({
        top: document.querySelector('.content-boxes').offsetTop - 150,
        behavior: 'smooth'
    });
}

function createBox(t) {
    const box = document.createElement('div');
    box.className = 'box';
    box.innerHTML = `
        <div class="member-info">
            <span class="member-name">${t.nev}</span>
            <span class="member-azonosito">${t.felhasznaloAzonosito ?? ''}</span>
        </div>
        <div class="member-actions">
            <button class="edit-btn">Módosítás</button>
            <button class="delete-btn">Törlés</button>
        </div>
    `;

    box.querySelector('.edit-btn').addEventListener('click', () => openEdit(t));
    box.querySelector('.delete-btn').addEventListener('click', () => deleteTag(t.tagId, t.nev));

    return box;
}

async function deleteTag(id, nev) {

    const ok = await customConfirm(`Biztosan törlöd: ${nev}?`);
    if (!ok) return;

    try {
        const response = await fetch(`https://localhost:7104/api/coach/tagok/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Tag sikeresen törölve!', false);
            loadTagok();
        } else {
            showMessage('fo-uzenet', 'Hiba a törlés során.', true);
        }
    } catch (err) {
        showMessage('fo-uzenet', 'Kapcsolódási hiba.', true);
    }
}

function openEdit(t) {
    document.getElementById('edit-id').value = t.tagId;
    document.getElementById('edit-nev').value = t.nev ?? '';
    document.getElementById('edit-lakcim').value = t.lakcim ?? '';
    document.getElementById('edit-telefon').value = t.telefonszam ?? '';
    document.getElementById('edit-email').value = t.email ?? '';
    document.getElementById('edit-statusz').checked = t.tagsagiStatusz ?? false;
    document.getElementById('edit-versenyengedely').value = t.versenyengedelySzam ?? '';
    document.getElementById('edit-tagsagkezdete').value = t.tagsagKezdete?.split('T')[0] ?? '';
    document.getElementById('edit-sportorvosi').value = t.sportorvosiEngedely?.split('T')[0] ?? '';

    const azonositoInput = document.getElementById('edit-azonosito');
    const generalWrapper = document.getElementById('edit-azonosito-wrapper');

    if (t.felhasznaloAzonosito) {
        azonositoInput.value = t.felhasznaloAzonosito;
        generalWrapper.style.display = 'none';
    } else {
        azonositoInput.value = '';
        generalWrapper.style.display = 'flex';
    }

    document.getElementById('edit-form').style.display = 'flex';
    document.getElementById('uj-tag-form').style.display = 'none';
    document.getElementById('uj-edzo-form').style.display = 'none';
    document.getElementById('uj-tag-gomb').style.display = 'none';
    document.getElementById('uj-edzo-gomb').style.display = 'none';
}

function closeEdit() {
    document.getElementById('edit-form').style.display = 'none';
    document.getElementById('uj-tag-gomb').style.display = 'block';
    const edzoGomb = document.getElementById('uj-edzo-gomb');
    if (edzoGomb.dataset.elnok === 'true') edzoGomb.style.display = 'block';
}

async function saveEdit() {
    const id = document.getElementById('edit-id').value;
    const azonosito = document.getElementById('edit-azonosito').value;

    const dto = {
        nev: document.getElementById('edit-nev').value,
        lakcim: document.getElementById('edit-lakcim').value,
        telefonszam: document.getElementById('edit-telefon').value,
        email: document.getElementById('edit-email').value,
        tagsagiStatusz: document.getElementById('edit-statusz').checked,
        versenyengedelySzam: document.getElementById('edit-versenyengedely').value,
        tagsagKezdete: document.getElementById('edit-tagsagkezdete').value || null,
        sportorvosiEngedely: document.getElementById('edit-sportorvosi').value || null,
        felhasznaloAzonosito: azonosito || null
    };

    try {
        const response = await fetch(`https://localhost:7104/api/coach/tagok/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dto)
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Tag sikeresen módosítva!', false);
            closeEdit();
            loadTagok();
        } else {
            const hiba = await response.text();
            showMessage('edit-uzenet', hiba, true);
        }
    } catch (err) {
        showMessage('edit-uzenet', 'Kapcsolódási hiba.', true);
    }
}

async function openUjTag() {
    document.getElementById('uj-tag-form').style.display = 'flex';
    document.getElementById('uj-tag-gomb').style.display = 'none';
    document.getElementById('uj-edzo-gomb').style.display = 'none';
    document.getElementById('edit-form').style.display = 'none';
    document.getElementById('uj-edzo-form').style.display = 'none';
}

function closeUjTag() {
    document.getElementById('uj-tag-form').style.display = 'none';
    document.getElementById('uj-tag-gomb').style.display = 'block';
    const edzoGomb = document.getElementById('uj-edzo-gomb');
    if (edzoGomb.dataset.elnok === 'true') edzoGomb.style.display = 'block';

    document.getElementById('uj-tag-form')
        .querySelectorAll('input[type="text"], input[type="email"], input[type="date"]')
        .forEach(i => i.value = '');
    document.getElementById('uj-statusz').checked = false;
    document.getElementById('uj-azonosito').value = '';
}

async function saveUjTag() {
    const azonosito = document.getElementById('uj-azonosito').value;

    if (!azonosito) {
        showMessage('uj-tag-uzenet', 'Kérlek generálj azonosítót a mentés előtt!', true);
        return;
    }

    const dto = {
        nev: document.getElementById('uj-nev').value.trim(),
        szuletes: document.getElementById('uj-szuletes').value || null,
        anyjaNeve: document.getElementById('uj-anyjaneve').value.trim(),
        lakcim: document.getElementById('uj-lakcim').value.trim(),
        telefonszam: document.getElementById('uj-telefon').value.trim(),
        email: document.getElementById('uj-email').value.trim(),
        tagsagiStatusz: document.getElementById('uj-statusz').checked,
        versenyengedelySzam: document.getElementById('uj-versenyengedely').value.trim(),
        tagsagKezdete: document.getElementById('uj-tagsagkezdete').value || null,
        sportorvosiEngedely: document.getElementById('uj-sportorvosi').value || null,
        felhasznaloAzonosito: azonosito
    };

    if (!dto.nev || !dto.szuletes || !dto.anyjaNeve || !dto.lakcim) {
        showMessage('uj-tag-uzenet', 'Név, születési dátum, anyja neve és lakcím kötelező!', true);
        return;
    }

    try {
        const response = await fetch('https://localhost:7104/api/coach/tagok', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dto)
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Új tag sikeresen felvéve!', false);
            closeUjTag();
            loadTagok();
        } else {
            const hiba = await response.text();
            showMessage('uj-tag-uzenet', hiba, true);
        }
    } catch (err) {
        showMessage('uj-tag-uzenet', 'Kapcsolódási hiba.', true);
    }
}

function openUjEdzo() {
    document.getElementById('uj-edzo-form').style.display = 'flex';
    document.getElementById('uj-edzo-gomb').style.display = 'none';
    document.getElementById('uj-tag-form').style.display = 'none';
    document.getElementById('uj-tag-gomb').style.display = 'none';
    document.getElementById('edit-form').style.display = 'none';
}

function closeUjEdzo() {
    document.getElementById('uj-edzo-form').style.display = 'none';
    document.getElementById('uj-tag-gomb').style.display = 'block';
    document.getElementById('uj-edzo-gomb').style.display = 'block';
    document.getElementById('uj-edzo-nev').value = '';
    document.getElementById('uj-edzo-azonosito').value = '';
}

async function saveUjEdzo() {
    const nev = document.getElementById('uj-edzo-nev').value.trim();
    const azonosito = document.getElementById('uj-edzo-azonosito').value;

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
            showMessage('fo-uzenet', 'Edző sikeresen felvéve!', false);
            closeUjEdzo();
        } else {
            const hiba = await response.text();
            showMessage('uj-edzo-uzenet', hiba, true);
        }
    } catch (err) {
        showMessage('uj-edzo-uzenet', 'Kapcsolódási hiba.', true);
    }
}

async function ellenorizElnok() {
    try {
        const response = await fetch('https://localhost:7104/api/coach/tagok/ellenorzes/elnok', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            const edzoGomb = document.getElementById('uj-edzo-gomb');
            if (data.mindenTagotLat === true) {
                edzoGomb.style.display = 'block';
                edzoGomb.dataset.elnok = 'true';
            }
        }
    } catch (err) {
        console.error('Hiba:', err);
    }
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

    const checkbox = document.getElementById('csak-aktiv');
    checkbox.checked = true;
    checkbox.addEventListener('change', () => {
        csakAktiv = checkbox.checked;
        megjelenitve = 0;
        renderTagok();
    });

    document.getElementById('kereses-input').addEventListener('input', (e) => {
        kereses = e.target.value;
        megjelenitve = 0;
        renderTagok();
    });

    document.getElementById('tovabb-gomb').addEventListener('click', loadTovabb);
    document.getElementById('kevesebb-gomb').addEventListener('click', kevesebbet);
    document.getElementById('edit-mentes').addEventListener('click', saveEdit);
    document.getElementById('edit-megse').addEventListener('click', closeEdit);
    document.getElementById('uj-tag-gomb').addEventListener('click', openUjTag);
    document.getElementById('uj-tag-mentes').addEventListener('click', saveUjTag);
    document.getElementById('uj-tag-megse').addEventListener('click', closeUjTag);
    document.getElementById('azonosito-general').addEventListener('click', generalAzonosito);
    document.getElementById('edit-azonosito-general').addEventListener('click', generalEditAzonosito);
    document.getElementById('uj-edzo-gomb').addEventListener('click', openUjEdzo);
    document.getElementById('uj-edzo-mentes').addEventListener('click', saveUjEdzo);
    document.getElementById('uj-edzo-megse').addEventListener('click', closeUjEdzo);
    document.getElementById('edzo-azonosito-general').addEventListener('click', generalEdzoAzonosito);

    ellenorizElnok();
    loadTagok();
});