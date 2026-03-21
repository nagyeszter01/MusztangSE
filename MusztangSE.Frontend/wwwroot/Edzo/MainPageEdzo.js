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

function loadUserName() {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        const payload = JSON.parse(jsonPayload);
        document.getElementById('username').textContent = payload['fullName'] ?? '';
    } catch (err) {
        console.error('Hiba a nev betoltesekor:', err);
    }
}

async function loadVersenyek() {
    try {
        const response = await fetch('https://localhost:7104/api/shared/versenyek/kozelgo', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return;
        const versenyek = await response.json();
        renderVersenyek(versenyek);
    } catch (err) {
        console.error('Hiba a versenyek betoltesekor:', err);
    }
}

function renderVersenyek(versenyek) {
    const container = document.querySelector('.content-boxes');
    container.innerHTML = '';

    const limit = 5;
    const megjelenito = versenyek.slice(0, limit);
    const tobbi = versenyek.slice(limit);

    megjelenito.forEach(v => container.appendChild(createBox(v)));

    if (tobbi.length > 0) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tobbi-gomb';
        btn.textContent = `Osszes mutatasa (${versenyek.length})`;
        btn.addEventListener('click', () => {
            tobbi.forEach(v => container.appendChild(createBox(v)));
            btn.remove();
        });
        container.appendChild(btn);
    }
}

function createBox(v) {
    const box = document.createElement('div');
    box.className = 'box';
    box.innerHTML = `
        <span class="box-nev">${v.nev}</span>
        <span class="box-datum">${v.datum?.split('T')[0]}</span>
        <span class="box-hely">${v.hely}</span>
    `;
    return box;
}

async function addVerseny() {
    const nev = document.getElementById('verseny-nev').value.trim();
    const datum = document.getElementById('verseny-datum').value;
    const hely = document.getElementById('verseny-hely').value.trim();

    if (!nev || !datum || !hely) {
        showMessage('verseny-uzenet', 'Minden mezo kitoltese kotelezo!', true);
        return;
    }

    try {
        const response = await fetch('https://localhost:7104/api/coach/versenyek', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nev, datum, hely })
        });

        if (response.ok) {
            showMessage('verseny-uzenet', 'Verseny sikeresen hozzaadva!', false);
            document.getElementById('verseny-nev').value = '';
            document.getElementById('verseny-datum').value = '';
            document.getElementById('verseny-hely').value = '';
            toggleForm(false);
            loadVersenyek();
        } else {
            showMessage('verseny-uzenet', 'Hiba a verseny hozzaadasakor.', true);
        }
    } catch (err) {
        showMessage('verseny-uzenet', 'Kapcsolodasi hiba.', true);
    }
}

function toggleForm(show) {
    document.getElementById('verseny-form').style.display = show ? 'flex' : 'none';
    document.getElementById('hozzaadas-gomb').style.display = show ? 'none' : 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 100;
    const kezdolapSection = document.getElementById('kezdolap');
    const versenyekSection = document.getElementById('versenyek');

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

    // Smooth scroll
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '/Edzo/MainPageEdzo.html' && kezdolapSection) {
                if (window.location.pathname.includes('MainPageEdzo')) {
                    e.preventDefault();
                    window.scrollTo({ top: kezdolapSection.offsetTop, behavior: 'smooth' });
                }
            } else if (href === '/Edzo/MainPageEdzo.html#versenyek' && versenyekSection) {
                e.preventDefault();
                window.scrollTo({ top: versenyekSection.offsetTop, behavior: 'smooth' });
            }
        });
    });

    // Aktív link scroll figyelő
    const kezdolapLink = document.querySelector('a[href="/Edzo/MainPageEdzo.html"]');
    const versenyekLink = document.querySelector('a[href="/Edzo/MainPageEdzo.html#versenyek"]');

    function setActiveLink() {
        if (!kezdolapSection || !versenyekSection) return;

        const versenyekRect = versenyekSection.getBoundingClientRect();

        if (versenyekRect.top <= headerHeight + 30) {
            kezdolapLink?.classList.remove('active');
            versenyekLink?.classList.add('active');
        } else {
            kezdolapLink?.classList.add('active');
            versenyekLink?.classList.remove('active');
        }
    }

    window.addEventListener('scroll', setActiveLink);
    setActiveLink();

    document.getElementById('kijelentkezes-gomb')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/Bejelentkezes/bejelentkezes.html';
    });

    document.getElementById('hozzaadas-gomb')?.addEventListener('click', () => toggleForm(true));
    document.getElementById('verseny-mentes')?.addEventListener('click', addVerseny);
    document.getElementById('verseny-megse')?.addEventListener('click', () => toggleForm(false));

    loadUserName();
    loadVersenyek();
});