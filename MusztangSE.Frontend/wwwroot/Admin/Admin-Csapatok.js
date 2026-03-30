const token = localStorage.getItem('token');
if (!token) window.location.href = '/Bejelentkezes/bejelentkezes.html';

let osszeCsapat = [];
let osszeEdzo = [];
let osszeTag = [];
let kereses = '';

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

async function loadAll() {
    try {
        const [csapatRes, edzoRes, tagRes] = await Promise.all([
            fetch('https://localhost:7104/api/admin/csapatok', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('https://localhost:7104/api/admin/edzok', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('https://localhost:7104/api/coach/tagok', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (csapatRes.status === 401 || csapatRes.status === 403) {
            window.location.href = '/Bejelentkezes/bejelentkezes.html';
            return;
        }

        osszeCsapat = await csapatRes.json();
        osszeEdzo = edzoRes.ok ? await edzoRes.json() : [];
        osszeTag = tagRes.ok ? await tagRes.json() : [];

        feltoltEdzoSelect('csapat-edzo');
        renderCsapatok();
    } catch (err) {
        console.error('Hiba:', err);
    }
}

function feltoltEdzoSelect(selectId, kizartId = null) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">-- Válassz edzőt --</option>';
    osszeEdzo
        .filter(e => e.id !== kizartId)
        .forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.id;
            opt.textContent = e.nev;
            select.appendChild(opt);
        });
}

function getSzurt() {
    return kereses === ''
        ? osszeCsapat
        : osszeCsapat.filter(c => c.nev.toLowerCase().includes(kereses.toLowerCase()));
}

function renderCsapatok() {
    const container = document.getElementById('csapatok-container');
    container.innerHTML = '';
    const szurt = getSzurt();

    if (szurt.length === 0) {
        container.innerHTML = '<p class="ures-uzenet">Nincs találat.</p>';
        return;
    }

    szurt.forEach(c => {
        const box = document.createElement('div');
        box.className = 'edzo-box';
        box.innerHTML = `
            <div class="edzo-fejlec">
                <div class="edzo-info">
                    <span class="edzo-nev">${c.nev}</span>
                    <span class="edzo-azonosito">${c.kategoria} · ${c.paros ? 'Páros' : 'Formáció'} · Edző: ${c.edzo?.nev ?? '—'}</span>
                </div>
                <div class="edzo-actions">
                    <button type="button" class="action-btn toggle-btn edzo-modosit-btn" data-id="${c.id}">Edző módosítása</button>
                    <button type="button" class="action-btn torol-btn-piros csapat-torol-btn" data-id="${c.id}" data-nev="${c.nev}">Törlés</button>
                </div>
            </div>

            <!-- Edző módosítás form -->
            <div class="nev-edit-form" id="edzo-form-${c.id}" style="display:none">
                <select id="edzo-select-${c.id}" class="admin-select" style="flex:1; border-radius:10px">
                    <option value="">-- Nincs edző --</option>
                    ${osszeEdzo.map(e => `<option value="${e.id}" ${c.edzo?.id === e.id ? 'selected' : ''}>${e.nev}</option>`).join('')}
                </select>
                <button type="button" class="action-btn toggle-btn edzo-mentes-btn" data-id="${c.id}">Mentés</button>
                <button type="button" class="action-btn megse-btn-small edzo-megse-btn" data-id="${c.id}">Mégse</button>
            </div>

            <!-- Tagok -->
            <div class="edzo-csapatok">
                <p class="csapatok-cim">Tagok (${c.tagok.length})</p>
                <div id="tag-lista-${c.id}">
                    ${c.tagok.length === 0
            ? '<p class="ures-tag">Nincs tag.</p>'
            : c.tagok.map(t => `
                            <div class="csapat-sor">
                                <span class="csapat-nev-kis">${t.nev}</span>
                                <button type="button" class="action-btn torol-btn-piros tag-torol-btn"
                                    data-csapat-id="${c.id}" data-tag-id="${t.id}">
                                    Eltávolítás
                                </button>
                            </div>
                        `).join('')
        }
                </div>
                <div class="tag-hozzaadas-sor" style="margin-top:12px; display:flex; gap:10px; align-items:center">
                    <select id="tag-select-${c.id}" class="admin-select" style="flex:1; border-radius:10px">
                        <option value="">-- Válassz tagot --</option>
                        ${osszeTag
            .filter(t => !c.tagok.some(ct => ct.id === t.tagId))
            .map(t => `<option value="${t.tagId}">${t.nev}</option>`)
            .join('')
        }
                    </select>
                    <button type="button" class="action-btn toggle-btn tag-hozzaad-btn" data-id="${c.id}">+ Tag</button>
                </div>
                <div id="csapat-uzenet-${c.id}" class="uzenet"></div>
            </div>
        `;

        // Edző módosítás
        box.querySelector('.edzo-modosit-btn').addEventListener('click', () => {
            document.getElementById(`edzo-form-${c.id}`).style.display = 'flex';
        });
        box.querySelector('.edzo-mentes-btn').addEventListener('click', () => updateEdzo(c.id));
        box.querySelector('.edzo-megse-btn').addEventListener('click', () => {
            document.getElementById(`edzo-form-${c.id}`).style.display = 'none';
        });

        // Törlés
        box.querySelector('.csapat-torol-btn').addEventListener('click', () => deleteCsapat(c.id, c.nev));

        // Tag eltávolítás
        box.querySelectorAll('.tag-torol-btn').forEach(btn => {
            btn.addEventListener('click', () =>
                tagEltavolitas(btn.dataset.csapatId, btn.dataset.tagId)
            );
        });

        // Tag hozzáadás
        box.querySelector('.tag-hozzaad-btn').addEventListener('click', () => {
            const select = document.getElementById(`tag-select-${c.id}`);
            if (!select.value) {
                showMessage(`csapat-uzenet-${c.id}`, 'Válassz tagot!', true);
                return;
            }
            tagHozzaadas(c.id, parseInt(select.value));
        });

        container.appendChild(box);
    });
}

async function updateEdzo(csapatId) {
    const edzoId = document.getElementById(`edzo-select-${csapatId}`).value;
    try {
        const response = await fetch(`https://localhost:7104/api/admin/csapatok/${csapatId}/edzo`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ edzoId: edzoId ? parseInt(edzoId) : null })
        });
        if (response.ok) {
            showMessage('fo-uzenet', 'Edző módosítva!', false);
            loadAll();
        } else {
            showMessage('fo-uzenet', 'Hiba a módosítás során.', true);
        }
    } catch (err) {
        showMessage('fo-uzenet', 'Kapcsolódási hiba.', true);
    }
}

async function deleteCsapat(id, nev) {
    const ok = await customConfirm(`Biztosan törlöd a(z) "${nev}" csapatot?`);
    if (!ok) return;
    try {
        const response = await fetch(`https://localhost:7104/api/admin/csapatok/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            showMessage('fo-uzenet', 'Csapat törölve!', false);
            loadAll();
        } else {
            showMessage('fo-uzenet', 'Hiba a törlés során.', true);
        }
    } catch (err) {
        showMessage('fo-uzenet', 'Kapcsolódási hiba.', true);
    }
}

async function tagHozzaadas(csapatId, tagId) {
    try {
        const response = await fetch('https://localhost:7104/api/admin/csapatok/tag-hozzaadas', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tagId, csapatId })
        });
        if (response.ok) {
            showMessage('fo-uzenet', 'Tag hozzáadva!', false);
            loadAll();
        } else {
            const hiba = await response.text();
            showMessage(`csapat-uzenet-${csapatId}`, hiba, true);
        }
    } catch (err) {
        showMessage(`csapat-uzenet-${csapatId}`, 'Kapcsolódási hiba.', true);
    }
}

async function tagEltavolitas(csapatId, tagId) {
    if (!confirm('Biztosan eltávolítod a tagot?')) return;
    try {
        const response = await fetch(
            `https://localhost:7104/api/admin/csapatok/tag-eltavolitas/${csapatId}/${tagId}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        if (response.ok) {
            showMessage('fo-uzenet', 'Tag eltávolítva!', false);
            loadAll();
        } else {
            showMessage('fo-uzenet', 'Hiba az eltávolítás során.', true);
        }
    } catch (err) {
        showMessage('fo-uzenet', 'Kapcsolódási hiba.', true);
    }
}

function openUjCsapat() {
    document.getElementById('uj-csapat-form').style.display = 'flex';
    document.getElementById('uj-csapat-gomb').style.display = 'none';
}

function closeUjCsapat() {
    document.getElementById('uj-csapat-form').style.display = 'none';
    document.getElementById('uj-csapat-gomb').style.display = 'block';
    document.getElementById('csapat-nev').value = '';
    document.getElementById('csapat-kategoria').value = '';
    document.getElementById('csapat-paros').checked = false;
    document.getElementById('csapat-edzo').value = '';
}

async function saveUjCsapat() {
    const nev = document.getElementById('csapat-nev').value.trim();
    const kategoria = document.getElementById('csapat-kategoria').value.trim();
    const paros = document.getElementById('csapat-paros').checked;
    const edzoId = document.getElementById('csapat-edzo').value;

    if (!nev || !kategoria) {
        showMessage('uj-csapat-uzenet', 'Név és kategória kötelező!', true);
        return;
    }

    try {
        const response = await fetch('https://localhost:7104/api/admin/csapatok', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nev,
                kategoria,
                paros,
                edzoId: edzoId ? parseInt(edzoId) : null
            })
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Csapat sikeresen létrehozva!', false);
            closeUjCsapat();
            loadAll();
        } else {
            const hiba = await response.text();
            showMessage('uj-csapat-uzenet', hiba, true);
        }
    } catch (err) {
        showMessage('uj-csapat-uzenet', 'Kapcsolódási hiba.', true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('kijelentkezes-gomb').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/Bejelentkezes/bejelentkezes.html';
    });

    document.getElementById('kereses-input').addEventListener('input', e => {
        kereses = e.target.value;
        renderCsapatok();
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

    document.getElementById('uj-csapat-gomb').addEventListener('click', openUjCsapat);
    document.getElementById('csapat-mentes').addEventListener('click', saveUjCsapat);
    document.getElementById('csapat-megse').addEventListener('click', closeUjCsapat);

    loadAll();
});