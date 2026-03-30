const szoveg = "MusztángSE";
const cim = document.getElementById("cim");
let index = 0;
let torol = false;

function animacio() {
    if (!cim) return;

    if (!torol) {
        // Gépelés fázis
        if (index < szoveg.length) {
            const karakter = szoveg[index];
            if (karakter === " ") {
                cim.innerHTML += " ";
                index++;
                animacio();
                return;
            }
            const osztaly = index < 8 ? "feher" : "piros";
            cim.innerHTML += `<span class="${osztaly}">${karakter}</span>`;
            index++;
            setTimeout(animacio, 180);
        } else {
            // Tele van – várunk, majd törlés indul
            setTimeout(() => {
                torol = true;
                animacio();
            }, 1500);
        }
    } else {
        // Törlés fázis
        const spanok = cim.querySelectorAll("span");
        if (spanok.length > 0) {
            spanok[spanok.length - 1].remove();
            setTimeout(animacio, 100);
        } else {
            // Üres – várunk, majd gépelés indul újra
            cim.innerHTML = "";
            index = 0;
            torol = false;
            setTimeout(animacio, 800);
        }
    }
}

window.addEventListener("load", animacio);

document.addEventListener('DOMContentLoaded', () => {

    // HAMBURGER
    const hamburger = document.getElementById('hamburger');
    const mobilMenu = document.getElementById('mobil-menu');

    if (hamburger && mobilMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('aktiv');
            mobilMenu.classList.toggle('nyitva');
        });

        // bezárás ha mellé kattintasz
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !mobilMenu.contains(e.target)) {
                hamburger.classList.remove('aktiv');
                mobilMenu.classList.remove('nyitva');
            }
        });
    }

    // SMOOTH SCROLL
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });

                // mobil menü bezár
                mobilMenu.classList.remove('nyitva');
                hamburger.classList.remove('aktiv');
            }
        });
    });
});