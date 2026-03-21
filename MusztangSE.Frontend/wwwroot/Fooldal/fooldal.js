const szoveg = "MusztángSE";
const cim = document.getElementById("cim");

let index = 0;

function kiir() {
    if (!cim) return;
    if (index >= szoveg.length) return;

    const karakter = szoveg[index];

    if (karakter === " ") {
        cim.innerHTML += " ";
        index++;
        kiir();
        return;
    }

    const osztaly = index < 8 ? "feher" : "piros";

    cim.innerHTML += `<span class="${osztaly}">${karakter}</span>`;

    index++;
    setTimeout(kiir, 180);
}

window.addEventListener("load", kiir);

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