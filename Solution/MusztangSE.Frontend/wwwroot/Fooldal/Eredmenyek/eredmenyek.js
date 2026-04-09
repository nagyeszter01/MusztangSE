const API_URL = 'https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/Eredmenyek';

// ── Helyezés CSS osztály ──
function helyezesClass(h) {
    if (!h) return '';
    if (h === 1) return 'arany';
    if (h === 2) return 'ezust';
    if (h === 3) return 'bronz';
    return '';
}

// ── Dátum formázás ──
function datumFormaz(d) {
    if (!d) return 'Ismeretlen dátum';
    const date = new Date(d);
    if (isNaN(date)) return String(d);
    return date.toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) + '.';
}

// ── Év kinyerés ──
function evKinyer(d) {
    if (!d) return 'Ismeretlen';
    const date = new Date(d);
    return isNaN(date) ? 'Ismeretlen' : date.getFullYear();
}

// ── HTML renderelés ──
function render(adatok) {
    const tartalom = document.getElementById('tartalom');

    if (!adatok || adatok.length === 0) {
        tartalom.innerHTML = '<p class="allapot-uzenet">Jelenleg nincs megjeleníthető eredmény.</p>';
        return;
    }

    // Évek + dátumok szerint csoportosítás
    const evek = {};
    adatok.forEach(sor => {
        const ev = evKinyer(sor.datum);
        const datum = datumFormaz(sor.datum);
        if (!evek[ev]) evek[ev] = {};
        if (!evek[ev][datum]) evek[ev][datum] = [];
        evek[ev][datum].push(sor);
    });

    // Évek csökkenő sorrendben
    const rendezettEvek = Object.keys(evek).sort((a, b) => b - a);

    let html = '';

    rendezettEvek.forEach(ev => {
        html += `<div class="ev-blokk">`;
        html += `<div class="ev-cim">${ev}</div>`;
        html += `<div class="ev-kartya">`;

        const datumok = Object.keys(evek[ev]).sort((a, b) => new Date(b) - new Date(a));
        datumok.forEach((datum, i) => {
            html += `<div class="datum-csoport">`;
            html += `<div class="datum-cim">${datum}</div>`;

            evek[ev][datum].forEach(sor => {
                const cls = helyezesClass(sor.helyezes);
                const helyezes = sor.helyezes ? `${sor.helyezes}. hely` : '–';

                html += `
                    <div class="eredmeny-sor">
                        <div class="eredmeny-bal">
                            <span class="versenyzo-nev">${sor.csapatNev}</span>
                            <span class="kategoria">${sor.versenyNev} &bull; ${sor.hely}</span>
                        </div>
                        <span class="helyezes ${cls}">${helyezes}</span>
                    </div>`;
            });

            html += `</div>`;
            if (i < datumok.length - 1) html += `<div class="datum-elvalaszto"></div>`;
        });

        html += `</div></div>`;
    });

    tartalom.innerHTML = html;
}

// ── API betöltés ──
async function betolt() {
    const tartalom = document.getElementById('tartalom');
    const tipus = tartalom?.dataset.tipus;

    const szuroTerkep = {
        'teruleti': 'területi',
        'orszagos': 'országos',
        'magyar': 'magyar',
        'vilag': 'világ'
    };

    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const adatok = await res.json();

        let szurt = Array.isArray(adatok) ? adatok : [];

        if (tipus && szuroTerkep[tipus]) {
            const kulcsszo = szuroTerkep[tipus].toLowerCase();
            szurt = szurt.filter(sor =>
                sor.versenyNev?.toLowerCase().includes(kulcsszo)
            );
        }

        render(szurt);
    } catch (err) {
        console.error('API hiba:', err);
        tartalom.innerHTML = '<p class="allapot-uzenet">Hiba történt az adatok betöltése közben.</p>';
    }
}

// ── Hamburger menü ──
document.addEventListener('DOMContentLoaded', () => {
    betolt();

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
});