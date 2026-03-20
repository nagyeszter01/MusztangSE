const token = localStorage.getItem('token');
if (!token) window.location.href = '/Bejelentkezes/bejelentkezes.html';

async function loadUserName() {
    try {
        const response = await fetch('https://localhost:7104/api/tag/me/adataim', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return;
        const adat = await response.json();
        document.getElementById('username').textContent = adat.nev ?? '';
    } catch (err) {
        console.error('Hiba a név betöltésekor:', err);
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
        console.error('Hiba a versenyek betöltésekor:', err);
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
        btn.id = 'tobbi-gomb';
        btn.className = 'tobbi-gomb';
        btn.textContent = `Összes mutatása (${versenyek.length})`;
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


document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menü
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
    const headerEl = document.querySelector('header');
    const headerHeight = headerEl ? headerEl.offsetHeight : 100;

    const menuLinks = {
        kezdolap: document.getElementById('kezdolap-link'),
        versenyek: document.getElementById('versenyek-link')
    };

    const sections = {
        kezdolap: document.getElementById('kezdolap'),
        versenyek: document.getElementById('versenyek')
    };

    Object.keys(menuLinks).forEach(key => {
        menuLinks[key]?.addEventListener('click', function(e) {
            e.preventDefault();
            sections[key] && window.scrollTo({ top: sections[key].offsetTop, behavior: 'smooth' });
        });
    });

    function setActiveLink() {
        const scrollPos = window.scrollY + headerHeight / 2;
        for (const key in sections) {
            const section = sections[key];
            if (section && scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                Object.values(menuLinks).forEach(link => link?.classList.remove('active'));
                menuLinks[key]?.classList.add('active');
            }
        }
    }

    window.addEventListener('scroll', setActiveLink);
    setActiveLink();

    // Kijelentkezés
    document.getElementById('kijelentkezes-gomb')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/Bejelentkezes/bejelentkezes.html';
    });

    loadUserName();
    loadVersenyek();
});