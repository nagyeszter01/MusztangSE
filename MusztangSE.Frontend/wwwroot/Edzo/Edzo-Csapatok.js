const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/Bejelentkezes/bejelentkezes.html';
}

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

async function loadOsszesTago() {
    try {
        const response = await fetch('http://localhost:5217/api/coach/tagok', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (err) {
        return [];
    }
}

async function loadCsapatok() {
    try {
        const response = await fetch('http://localhost:5217/api/coach/csapatok/sajat', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = '/Bejelentkezes/bejelentkezes.html';
            return;
        }

        if (!response.ok) {
            showMessage('fo-uzenet', 'Hiba a csapatok betöltésekor.', true);
            return;
        }

        const csapatok = await response.json();
        const osszesTago = await loadOsszesTago();
        renderCsapatok(csapatok, osszesTago);
    } catch (err) {
        console.error('Hiba:', err);
        showMessage('fo-uzenet', 'Kapcsolódási hiba.', true);
    }
}

function renderCsapatok(csapatok, osszesTago) {
    const container = document.getElementById('csapatok-container');
    container.innerHTML = '';

    if (csapatok.length === 0) {
        container.innerHTML = '<p class="ures-uzenet">Nincsenek csapatok.</p>';
        return;
    }

    csapatok.forEach(c => {
        const csapatBox = document.createElement('div');
        csapatBox.className = 'csapat-box';
        csapatBox.innerHTML = `
            <div class="csapat-fejlec" data-id="${c.id}">
                <div class="csapat-info">
                    <span class="csapat-nev">${c.nev}</span>
                    <span class="csapat-meta">${c.kategoria} · ${c.paros ? 'Páros' : 'Formáció'}</span>
                </div>
                <div class="csapat-fejlec-jobb">
                    <button type="button" class="torol-btn csapat-torol" data-id="${c.id}">Törlés</button>
                    <span class="csapat-nyil">▼</span>
                </div>
            </div>
            <div class="csapat-tartalom" id="csapat-tartalom-${c.id}" style="display:none">
                <div class="tag-lista" id="tag-lista-${c.id}">
                    ${c.tagok.length === 0
            ? '<p class="ures-tag">Nincs tag ebben a csapatban.</p>'
            : c.tagok.map(t => `
                            <div class="tag-sor" id="tag-sor-${c.id}-${t.id}">
                                <span class="tag-nev">${t.nev}</span>
                                <button type="button" class="tag-torol-btn"
                                    data-csapat-id="${c.id}"
                                    data-tag-id="${t.id}">
                                    Eltávolítás
                                </button>
                            </div>
                        `).join('')
        }
                </div>
                <div class="tag-hozzaadas-wrapper">
                    <select class="csapat-select" id="select-${c.id}">
                        <option value="">-- Válassz tagot --</option>
                        ${osszesTago
            .filter(t => !c.tagok.some(ct => ct.id === t.tagId))
            .map(t => `<option value="${t.tagId}">${t.nev}</option>`)
            .join('')
        }
                    </select>
                    <button type="button" class="add-btn" data-csapat-id="${c.id}">+ Tag hozzáadása</button>
                </div>
                <div id="csapat-uzenet-${c.id}" class="uzenet"></div>
            </div>
        `;
        container.appendChild(csapatBox);

        // Lenyitás/becsukás — csak a fejlécre, nem a törlés gombra
        csapatBox.querySelector('.csapat-fejlec').addEventListener('click', (e) => {
            if (e.target.closest('.csapat-torol')) return;
            const tartalom = document.getElementById(`csapat-tartalom-${c.id}`);
            const nyil = csapatBox.querySelector('.csapat-nyil');
            const nyitva = tartalom.style.display !== 'none';
            tartalom.style.display = nyitva ? 'none' : 'block';
            nyil.textContent = nyitva ? '▼' : '▲';
        });

        // Csapat törlése
        csapatBox.querySelector('.csapat-torol').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCsapat(c.id, c.nev);
        });

        // Tag eltávolítás gombok
        csapatBox.querySelectorAll('.tag-torol-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await tagEltavolitas(btn.dataset.csapatId, btn.dataset.tagId, c.nev);
            });
        });

        // Tag hozzáadása gomb
        csapatBox.querySelector('.add-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            const csapatId = e.target.dataset.csapatId;
            const select = document.getElementById(`select-${csapatId}`);
            const tagId = select.value;

            if (!tagId) {
                showMessage(`csapat-uzenet-${csapatId}`, 'Válassz tagot!', true);
                return;
            }

            await tagHozzaadas(parseInt(csapatId), parseInt(tagId));
        });
    });
}

async function tagHozzaadas(csapatId, tagId) {
    try {
        const response = await fetch('http://localhost:5217/api/coach/csapatok/tag-hozzaadas', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tagId, csapatId })
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Tag sikeresen hozzáadva!', false);
            loadCsapatok();
        } else {
            const hiba = await response.text();
            showMessage(`csapat-uzenet-${csapatId}`, hiba, true);
        }
    } catch (err) {
        showMessage(`csapat-uzenet-${csapatId}`, 'Kapcsolódási hiba.', true);
    }
}

async function tagEltavolitas(csapatId, tagId, csapatNev) {
    if (!confirm(`Biztosan eltávolítod a tagot a(z) ${csapatNev} csapatból?`)) return;

    try {
        const response = await fetch(
            `http://localhost:5217/api/coach/csapatok/tag-eltavolitas/${csapatId}/${tagId}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (response.ok) {
            showMessage('fo-uzenet', 'Tag sikeresen eltávolítva!', false);
            loadCsapatok();
        } else {
            showMessage('fo-uzenet', 'Hiba az eltávolítás során.', true);
        }
    } catch (err) {
        showMessage('fo-uzenet', 'Kapcsolódási hiba.', true);
    }
}

async function deleteCsapat(id, nev) {
    if (!confirm(`Biztosan törlöd a(z) "${nev}" csapatot?`)) return;

    try {
        const response = await fetch(`http://localhost:5217/api/coach/csapatok/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Csapat sikeresen törölve!', false);
            loadCsapatok();
        } else {
            showMessage('fo-uzenet', 'Hiba a törlés során.', true);
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
}

async function saveUjCsapat() {
    const nev = document.getElementById('csapat-nev').value.trim();
    const kategoria = document.getElementById('csapat-kategoria').value.trim();
    const paros = document.getElementById('csapat-paros').checked;

    if (!nev || !kategoria) {
        showMessage('uj-csapat-uzenet', 'Név és kategória kötelező!', true);
        return;
    }

    try {
        const response = await fetch('http://localhost:5217/api/coach/csapatok', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nev, kategoria, paros })
        });

        if (response.ok) {
            showMessage('fo-uzenet', 'Csapat sikeresen létrehozva!', false);
            closeUjCsapat();
            loadCsapatok();
        } else {
            const hiba = await response.text();
            showMessage('uj-csapat-uzenet', hiba, true);
        }
    } catch (err) {
        showMessage('uj-csapat-uzenet', 'Kapcsolódási hiba.', true);
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

    document.getElementById('uj-csapat-gomb').addEventListener('click', openUjCsapat);
    document.getElementById('csapat-mentes').addEventListener('click', saveUjCsapat);
    document.getElementById('csapat-megse').addEventListener('click', closeUjCsapat);

    loadCsapatok();
});