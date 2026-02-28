// 1. Penentuan API_URL secara otomatis
const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://digital-store-m33fx85q7-ogilasofficial.vercel.app/api';

// 2. Fungsi Login
async function loginUser(email, password) {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            // Menyimpan data penting ke localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('nama_cafe', data.user?.nama_cafe || 'Pemilik Toko');
            localStorage.setItem('no_whatsapp', data.user?.no_whatsapp || '628123456789'); 
            
            // Redirect ke Dashboard Utama (index.html)
            window.location.href = 'index.html';
        } else {
            alert(data.msg || 'Email atau Password salah!');
        }
    } catch (err) {
        console.error('Error Login:', err);
        alert('Gagal terhubung ke server.');
    }
}

// 3. Fungsi Registrasi
async function registerUser(nama_cafe, email, password, no_whatsapp) {
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama_cafe, email, password, no_whatsapp })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Registrasi Berhasil! Silakan Login.');
            // Setelah daftar, arahkan ke login
            window.location.href = 'login.html';
        } else {
            alert(data.msg || 'Registrasi Gagal.');
        }
    } catch (err) {
        console.error('Error Register:', err);
        alert('Gagal menghubungi server.');
    }
}

// 4. Fungsi Logout
function logout() {
    localStorage.clear(); 
    window.location.href = 'login.html';
}

// 5. Cek Sesi (Proteksi Halaman)
function checkAuth() {
    const token = localStorage.getItem('token');
    const path = window.location.pathname;
    
    // Tentukan mana halaman "terbuka" (tidak butuh login)
    const isAuthPage = path.endsWith('login.html') || path.endsWith('register.html');

    if (!token) {
        // Jika belum login dan mencoba akses dashboard (index.html atau root /)
        if (!isAuthPage) {
            window.location.href = 'login.html';
        }
    } else {
        // Jika sudah login tapi mencoba buka halaman login/register
        if (isAuthPage) {
            window.location.href = 'index.html';
        }
        
        // Update Nama Cafe di UI jika elemen tersedia
        const cafeElem = document.getElementById('display-nama-cafe');
        const namaCafe = localStorage.getItem('nama_cafe');
        if (cafeElem && namaCafe) {
            cafeElem.innerText = namaCafe;
        }
    }
}

// Jalankan proteksi otomatis
checkAuth();