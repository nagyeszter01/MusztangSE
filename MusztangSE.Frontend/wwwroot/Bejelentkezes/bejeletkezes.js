const opciok = document.querySelectorAll('.szerep-opcio');
    const rejtettSzerepInput = document.getElementById('szerep');

    opciok.forEach(opcio => {
      opcio.addEventListener('click', () => {
        opciok.forEach(o => o.classList.remove('kivalasztva'));
        opcio.classList.add('kivalasztva');
        rejtettSzerepInput.value = opcio.dataset.szerep;
      });
    });