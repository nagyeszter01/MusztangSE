const opciok = document.querySelectorAll('.szerep-opcio');
let kivalasztottSzerep = 'edzo';

opciok.forEach(opcio => {
  opcio.addEventListener('click', () => {
    opciok.forEach(o => o.classList.remove('kivalasztva'));
    opcio.classList.add('kivalasztva');
    kivalasztottSzerep = opcio.dataset.szerep;
  });
});