document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Ambil data dari input field
            const businessName = document.querySelector('input[type="text"]').value;
            const whatsapp = document.querySelector('input[placeholder*="WhatsApp"]').value;
            const email = document.querySelector('input[type="email"]').value;
            const password = document.querySelector('input[type="password"]').value;

            // Tampilkan loading sederhana
            const submitBtn = registerForm.querySelector('button');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "Memproses...";
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        businessName,
                        whatsapp,
                        email,
                        password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Selamat! Toko berhasil didaftarkan.');
                    window.location.href = 'login.html'; // Pindah ke halaman login
                } else {
                    alert('Gagal mendaftar: ' + (data.message || 'Terjadi kesalahan'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Server sedang bermasalah atau database belum terhubung.');
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});