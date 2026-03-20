let kivalasztottSzerep = 'edzo';

document.querySelectorAll('.szerep-opcio').forEach(opcio => {
  opcio.addEventListener('click', () => {
    document.querySelectorAll('.szerep-opcio').forEach(o => o.classList.remove('kivalasztva'));
    opcio.classList.add('kivalasztva');
    kivalasztottSzerep = opcio.dataset.szerep;
  });
});

function showMessage(message, isError) {
  const el = document.getElementById('uzenet');
  el.textContent = message;
  el.className = 'uzenet ' + (isError ? 'hiba' : 'siker');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('bejelentkezes-gomb').addEventListener('click', async () => {
    const azonosito = document.getElementById('azonosito').value.trim();
    const jelszo = document.getElementById('jelszo').value;

    if (!azonosito || !jelszo) {
      showMessage('Minden mezot ki kell tolteni!', true);
      return;
    }

    try {
      const response = await fetch('https://localhost:7104/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          felhasznaloAzonosito: azonosito,
          password: jelszo,
          szerep: kivalasztottSzerep
        })
      });

      if (!response.ok) {
        const hiba = await response.text();
        showMessage(hiba, true);
        return;
      }

      const token = await response.text();
      localStorage.setItem('token', token);
      localStorage.setItem('szerep', kivalasztottSzerep);

// Szerepkör kiolvasása a tokenből
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(
          atob(base64).split('').map(c =>
              '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          ).join('')
      ));

      const valodiSzerep = payload['role'];

      if (valodiSzerep === 'admin') {
        window.location.href = '/Admin/MainPageAdmin.html';
      } else if (kivalasztottSzerep === 'edzo') {
        window.location.href = '/Edzo/MainPageEdzo.html';
      } else {
        window.location.href = '/Tag/MainPageTagok.html';
      }

    } catch (err) {
      showMessage('Kapcsolodasi hiba.', true);
    }
  });
});
