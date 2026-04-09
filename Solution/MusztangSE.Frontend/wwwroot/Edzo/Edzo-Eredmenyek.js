const token = localStorage.getItem('token');
if (!token) window.location.href = '/Bejelentkezes/bejelentkezes.html';

let osszeEredmeny = [];
let osszeVerseny = [];
let osszeCsapat = [];
let kereses = '';
const mostaniEv = new Date().getFullYear();

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

function helyezesJelveny(h) {
    if (!h) return '—';
    if (h === 1) return '🥇 1.';
    if (h === 2) return '🥈 2.';
    if (h === 3) return '🥉 3.';
    return `${h}.`;
}

function feltoltEvSelect() {
    const select = document.getElementById('uj-ev');
    select.innerHTML = '';
    for (let ev = mostaniEv; ev >= mostaniEv - 5; ev--) {
        const opt = document.createElement('option');
        opt.value = ev;
        opt.textContent = ev;
        if (ev === mostaniEv) opt.selected = true;
        select.appendChild(opt);
    }
}

async function loadVersenyekByEv(ev) {
    try {
        const response = await fetch(`https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/shared/versenyek/ev/${ev}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (err) {
        return [];
    }
}

async function loadAll() {
    try {
        const [eredmenyRes, csapatRes] = await Promise.all([
            fetch('https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/coach/eredmenyek', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/coach/csapatok/sajat', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (eredmenyRes.status === 401 || eredmenyRes.status === 403) {
            window.location.href = '/Bejelentkezes/bejelentkezes.html';
            return;
        }

        osszeEredmeny = eredmenyRes.ok ? await eredmenyRes.json() : [];
        const osszesCsapat = csapatRes.ok ? await csapatRes.json() : [];

        // Csak a nem archivált csapatok kerülnek a dropdownba
        osszeCsapat = osszesCsapat.filter(c => !c.archivalt);

        feltoltEvSelect();
        osszeVerseny = await loadVersenyekByEv(mostaniEv);
        feltoltVersenySelect('uj-verseny');
        feltoltVersenySelect('edit-verseny');
        feltoltCsapatSelect('uj-csapat');
        feltoltCsapatSelect('edit-csapat');
        renderEredmenyek();
    } catch (err) {
        console.error('Hiba:', err);
    }
}

function feltoltVersenySelect(selectId) {
    const select = document.getElementById(selectId);
    const ertek = select.value;
    select.innerHTML = '<option value="">-- Válassz versenyt --</option>';
    osszeVerseny.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = `${v.nev} (${v.datum?.split('T')[0]})`;
        select.appendChild(opt);
    });
    if (ertek) select.value = ertek;
}

function feltoltCsapatSelect(selectId) {
    const select = document.getElementById(selectId);
    const ertek = select.value;
    select.innerHTML = '<option value="">-- Válassz csapatot --</option>';
    osszeCsapat.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.nev} (${c.kategoria})`;
        select.appendChild(opt);
    });
    if (ertek) select.value = ertek;
}

function getSzurt() {
    if (kereses === '') return osszeEredmeny;
    return osszeEredmeny.filter(e =>
        e.verseny.nev.toLowerCase().includes(kereses.toLowerCase()) ||
        e.csapat.nev.toLowerCase().includes(kereses.toLowerCase())
    );
}

function renderEredmenyek() {
    const tbody = document.getElementById('eredmenyek-tbody');
    tbody.innerHTML = '';
    const szurt = getSzurt();

    if (szurt.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:rgba(255,255,255,0.3); padding:30px; font-family:IBM Plex Serif,serif">Nincs eredmény.</td></tr>';
        return;
    }

    szurt.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${e.verseny.nev}</td>
            <td class="datum-cell">${e.verseny.datum?.split('T')[0]}</td>
            <td>${e.csapat.nev}</td>
            <td class="kategoria-cell">${e.csapat.kategoria}</td>
            <td class="helyezes-cell">${helyezesJelveny(e.helyezes)}</td>
            <td class="actions-cell">
                <button type="button" class="edit-btn">Szerkesztés</button>
                <button type="button" class="torol-btn">Törlés</button>
            </td>
        `;

        tr.querySelector('.edit-btn').addEventListener('click', () => openEdit(e));
        tr.querySelector('.torol-btn').addEventListener('click', () => deleteEredmeny(e.id));
        tbody.appendChild(tr);
    });
}

function openEdit(e) {
    document.getElementById('edit-id').value = e.id;
    document.getElementById('edit-verseny').value = e.verseny.id;
    document.getElementById('edit-csapat').value = e.csapat.id;
    document.getElementById('edit-helyezes').value = e.helyezes ?? '';
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEdit() {
    document.getElementById('edit-modal').style.display = 'none';
}

async function saveEdit() {
    const id = document.getElementById('edit-id').value;
    const versenyId = document.getElementById('edit-verseny').value;
    const csapatId = document.getElementById('edit-csapat').value;
    const helyezes = document.getElementById('edit-helyezes').value;

    if (!versenyId || !csapatId) {
        showMessage('edit-uzenet', 'Verseny és csapat kötelező!', true);
        return;
    }

    try {
        const response = await fetch(`https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/coach/eredmenyek/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                versenyId: parseInt(versenyId),
                csapatId: parseInt(csapatId),
                helyezes: helyezes ? parseInt(helyezes) : null
            })
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Eredmény módosítva!', false);
            closeEdit();
            loadAll();
        } else {
            showMessage('edit-uzenet', 'Hiba a mentés során.', true);
        }
    } catch (err) {
        showMessage('edit-uzenet', 'Kapcsolódási hiba.', true);
    }
}

async function deleteEredmeny(id) {

    const ok = await customConfirm('Biztosan törlöd az eredményt?');
    if (!ok) return;
    try {
        const response = await fetch(`https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/coach/eredmenyek/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            showMessage('fo-uzenet', 'Eredmény törölve!', false);
            loadAll();
        }
    } catch (err) {
        showMessage('fo-uzenet', 'Kapcsolódási hiba.', true);
    }
}

function openUjEredmeny() {
    document.getElementById('uj-eredmeny-form').style.display = 'flex';
    document.getElementById('uj-eredmeny-gomb').style.display = 'none';
}

function closeUjEredmeny() {
    document.getElementById('uj-eredmeny-form').style.display = 'none';
    document.getElementById('uj-eredmeny-gomb').style.display = 'block';
    document.getElementById('uj-verseny').value = '';
    document.getElementById('uj-csapat').value = '';
    document.getElementById('uj-helyezes').value = '';
}

async function saveUjEredmeny() {
    const versenyId = document.getElementById('uj-verseny').value;
    const csapatId = document.getElementById('uj-csapat').value;
    const helyezes = document.getElementById('uj-helyezes').value;

    if (!versenyId || !csapatId) {
        showMessage('uj-eredmeny-uzenet', 'Verseny és csapat kötelező!', true);
        return;
    }

    try {
        const response = await fetch('https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/coach/eredmenyek', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                versenyId: parseInt(versenyId),
                csapatId: parseInt(csapatId),
                helyezes: helyezes ? parseInt(helyezes) : null
            })
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Eredmény sikeresen rögzítve!', false);
            closeUjEredmeny();
            loadAll();
        } else {
            const hiba = await response.text();
            showMessage('uj-eredmeny-uzenet', hiba, true);
        }
    } catch (err) {
        showMessage('uj-eredmeny-uzenet', 'Kapcsolódási hiba.', true);
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

    document.getElementById('kereses-input').addEventListener('input', e => {
        kereses = e.target.value;
        renderEredmenyek();
    });

    document.getElementById('uj-ev').addEventListener('change', async e => {
        osszeVerseny = await loadVersenyekByEv(e.target.value);
        feltoltVersenySelect('uj-verseny');
    });

    document.getElementById('uj-eredmeny-gomb').addEventListener('click', openUjEredmeny);
    document.getElementById('eredmeny-mentes').addEventListener('click', saveUjEredmeny);
    document.getElementById('eredmeny-megse').addEventListener('click', closeUjEredmeny);
    document.getElementById('edit-mentes').addEventListener('click', saveEdit);
    document.getElementById('edit-megse').addEventListener('click', closeEdit);

    loadAll();
});