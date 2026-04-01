function ellenorizJelszo(jelszo) {
    return {
        hossz: jelszo.length >= 8,
        nagy: /[A-Z]/.test(jelszo),
        kis: /[a-z]/.test(jelszo),
        spec: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(jelszo)
    };
}

function frissitEroMutato(jelszo) {
    const k = ellenorizJelszo(jelszo);
    const teljesult = [k.hossz, k.nagy, k.kis, k.spec].filter(Boolean).length;
    const vanValami = jelszo.length > 0;

    const kovetek = [
        { id: 'k-hossz', teljesult: k.hossz, ikon: '✓', szoveg: 'Legalább 8 karakter' },
        { id: 'k-nagy',  teljesult: k.nagy,  ikon: '✓', szoveg: 'Nagybetű (A–Z)' },
        { id: 'k-kis',   teljesult: k.kis,   ikon: '✓', szoveg: 'Kisbetű (a–z)' },
        { id: 'k-spec',  teljesult: k.spec,  ikon: '✓', szoveg: 'Speciális karakter (!@#$...)' }
    ];

    kovetek.forEach(kov => {
        const el = document.getElementById(kov.id);
        if (!el) return;
        const ikon = el.querySelector('.kov-ikon');
        const szoveg = el.querySelector('.kov-szoveg');

        el.classList.remove('teljesult', 'nem-teljesult', 'aktiv');

        if (kov.teljesult) {
            el.classList.add('teljesult');
            ikon.textContent = '✓';
            szoveg.textContent = kov.szoveg;
        } else {
            el.classList.add('nem-teljesult');
            if (vanValami) el.classList.add('aktiv');
            ikon.textContent = '○';
            szoveg.textContent = kov.szoveg;
        }
    });

    // Erősség sorok
    const sorok = ['ero-1', 'ero-2', 'ero-3', 'ero-4'];
    sorok.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.className = 'ero-sor';
        if (i < teljesult) {
            if (teljesult <= 2) el.classList.add('gyenge');
            else if (teljesult === 3) el.classList.add('kozepes');
            else el.classList.add('eros');
        }
    });

    // Erősség felirat
    const felirat = document.getElementById('ero-felirat');
    if (felirat) {
        felirat.className = 'ero-felirat';
        if (!vanValami) {
            felirat.textContent = '';
        } else if (teljesult <= 2) {
            felirat.textContent = 'Gyenge jelszó';
            felirat.classList.add('gyenge');
        } else if (teljesult === 3) {
            felirat.textContent = 'Közepes jelszó';
            felirat.classList.add('kozepes');
        } else {
            felirat.textContent = 'Erős jelszó ✓';
            felirat.classList.add('eros');
        }
    }
}

function showMessage(message, isError) {
    const el = document.getElementById('uzenet');
    el.textContent = message;
    el.className = 'uzenet ' + (isError ? 'hiba' : 'siker');
}

document.addEventListener('DOMContentLoaded', () => {
    //hamburger menü
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
    
    
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            frissitEroMutato(passwordInput.value);
        });
    }

    document.querySelector('.gomb').addEventListener('click', async () => {
        const azonosito = document.getElementById('azonosito').value.trim();
        const jelszo = document.getElementById('password').value;
        const jelszoMegerosites = document.getElementById('confirmPassword').value;

        if (!azonosito || !jelszo || !jelszoMegerosites) {
            showMessage('Minden mezot ki kell tolteni!', true);
            return;
        }

        const k = ellenorizJelszo(jelszo);
        if (!k.hossz || !k.nagy || !k.kis || !k.spec) {
            showMessage('A jelszo nem felel meg a kovetelményeknek!', true);
            return;
        }

        if (jelszo !== jelszoMegerosites) {
            showMessage('A ket jelszo nem egyezik.', true);
            return;
        }

        try {
            const response = await fetch('https://musztangse-api-gghga9fnd3eqetcd.westeurope-01.azurewebsites.net/api/auth/setpassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    felhasznaloAzonosito: azonosito,
                    password: jelszo,
                    confirmPassword: jelszoMegerosites
                })
            });

            if (!response.ok) {
                const hiba = await response.text();
                showMessage(hiba, true);
                return;
            }

            showMessage('Jelszo sikeresen beallitva! Atiranyitas...', false);
            setTimeout(() => {
                window.location.href = '/Bejelentkezes/bejelentkezes.html';
            }, 2000);

        } catch (err) {
            showMessage('Kapcsolodasi hiba: az API nem erheto el.', true);
        }
    });
});