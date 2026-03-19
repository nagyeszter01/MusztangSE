function showMessage(message, isError) {
    const el = document.getElementById('uzenet');
    el.textContent = message;
    el.className = 'uzenet ' + (isError ? 'hiba' : 'siker');
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.gomb').addEventListener('click', async () => {
        const azonosito = document.getElementById('azonosito').value.trim();
        const jelszo = document.getElementById('password').value;
        const jelszoMegerosites = document.getElementById('confirmPassword').value;

        if (!azonosito || !jelszo || !jelszoMegerosites) {
            showMessage('Minden mezot ki kell tolteni!', true);
            return;
        }

        if (jelszo !== jelszoMegerosites) {
            showMessage('A ket jelszo nem egyezik.', true);
            return;
        }

        try {
            const response = await fetch('http://localhost:5217/api/auth/setpassword', {
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