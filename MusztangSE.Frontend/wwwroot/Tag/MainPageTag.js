const headerHeight = document.querySelector('header').offsetHeight;

// Csak a helyi scrollhoz tartozó linkek
const menuLinks = {
    kezdolap: document.getElementById('kezdolap-link'),
    versenyek: document.getElementById('versenyek-link')
};

// Szekciók
const sections = {
    kezdolap: document.getElementById('kezdolap'),
    versenyek: document.getElementById('versenyek')
};

// Smooth scroll linkekhez
Object.keys(menuLinks).forEach(key => {
    menuLinks[key].addEventListener('click', function (e) {
        e.preventDefault();
        const section = sections[key];

        // Pont a szekció tetejére görget
        window.scrollTo({
            top: section.offsetTop,
            behavior: 'smooth'
        });
    });
});

// Aktív link kezelése scroll alapján
function setActiveLink() {
    const scrollPos = window.scrollY + headerHeight / 2; // header figyelembevéve

    for (const key in sections) {
        const section = sections[key];
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;

        if (scrollPos >= top && scrollPos < bottom) {
            Object.values(menuLinks).forEach(link => link.classList.remove('active'));
            menuLinks[key].classList.add('active');
        }
    }
}

window.addEventListener('scroll', setActiveLink);
setActiveLink();

// Példa a felhasználó nevének beállítására
const username = "Xy";
document.getElementById("username").textContent = username;