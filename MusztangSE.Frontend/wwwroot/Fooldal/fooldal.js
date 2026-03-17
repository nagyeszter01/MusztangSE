const szoveg = "MusztángSE";
const cim = document.getElementById("cim");

let index = 0;

function kiir() {
    // Ha kiirta akkor leáll
    if (index >= szoveg.length) return;

    const karakter = szoveg[index];


    if (karakter === " ") {
        cim.innerHTML += " ";
        index++;
        kiir();
        return;
    }

    // Szín eldöntése Musztáng rész fehér az SE rész piros a 8 karaktertöl kezdve piros addig fehér
    const osztaly = index < 8 ? "feher" : "piros";

    cim.innerHTML += `<span class="${osztaly}">${karakter}</span>`;

    index++;
    setTimeout(kiir, 180); // kicsit gyorsabb, természetesebb
}

// Oldal betöltése után indul
window.addEventListener("load", kiir);



