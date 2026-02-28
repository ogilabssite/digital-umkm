/**
 * APP.JS - REVISED VERSION
 * Mempertahankan logika asli dengan perbaikan sinkronisasi UI & Error Handling
 */

// 1. Memastikan API_URL menggunakan let/var agar tidak terjadi "Already Declared" error jika file ter-load ulang
var API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://digital-store-m33fx85q7-ogilasofficial.vercel.app/api';

let cart = [];
let products = [];

// 2. Inisialisasi Dashboard
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html'; 
        return;
    }

    loadProducts();
    updateCartUI();
    loadDashboardData(); 
    syncCafeName();

    const filterTgl = document.getElementById('filter-tanggal');
    if (filterTgl) {
        filterTgl.addEventListener('change', () => loadDashboardData());
    }
});

function syncCafeName() {
    const namaCafe = localStorage.getItem('nama_cafe') || 'KASIR WA PRO';
    // Menyesuaikan ID dengan elemen UI agar sinkron di semua halaman
    const elementsToUpdate = ['display-nama-cafe', 'set-nama-toko', 'report-nama-toko']; 
    
    elementsToUpdate.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'INPUT') el.value = namaCafe;
            else el.innerText = namaCafe;
        }
    });

    const alamatEl = document.getElementById('set-alamat');
    if (alamatEl) alamatEl.value = localStorage.getItem('alamat_toko') || '';
    
    const waEl = document.getElementById('set-wa');
    if (waEl) waEl.value = localStorage.getItem('no_whatsapp') || '';
}

// 3. Ambil Data Produk
async function loadProducts() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = `
        <div class="col-span-full flex flex-col items-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p class="text-gray-400 font-medium">Menyusun etalase...</p>
        </div>`;

    try {
        const res = await fetch(`${API_URL}/products`, {
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!res.ok) {
            if (res.status === 401) return logout();
            throw new Error('Unauthorized');
        }

        products = await res.json();
        renderProducts(products);
    } catch (err) {
        console.error('Gagal memuat produk:', err);
        productGrid.innerHTML = `<div class="col-span-full text-center py-10 text-red-400 font-bold">Gagal memuat menu. Silakan login ulang.</div>`;
    }
}

// 4. Render Produk
function renderProducts(items) {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    if (items.length === 0) {
        productGrid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400 italic">Menu tidak ditemukan.</div>';
        return;
    }

    productGrid.innerHTML = items.map(product => `
        <div class="bg-white p-4 rounded-[36px] border border-gray-100 shadow-sm transition-all group relative animate-fade-in hover:shadow-md">
            <button onclick="deleteProduct('${product._id}')" class="absolute top-4 right-4 bg-red-50 text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-red-500 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
            <div class="relative overflow-hidden rounded-[28px] mb-4">
                <img src="${product.gambar || 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=400'}" 
                     class="w-full aspect-square object-cover group-hover:scale-110 transition duration-500"
                     onerror="this.src='https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=400'">
            </div>
            <h3 class="font-bold text-gray-800 mb-1 truncate">${product.nama}</h3>
            <div class="flex justify-between items-end">
                <div>
                    <p class="text-green-600 font-black">Rp ${Number(product.harga).toLocaleString()}</p>
                    <p class="text-[9px] text-gray-400 uppercase font-bold tracking-widest">${product.kategori || 'Umum'}</p>
                </div>
                <button onclick="addToCart('${product._id}')" class="bg-green-600 text-white p-2 rounded-2xl active:scale-90 transition-all shadow-lg shadow-green-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>
        </div>
    `).join('');
}

// 5. Filter Kategori
function filterCategory(cat) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        if (btn.innerText.includes(cat)) {
            btn.classList.add('bg-green-600', 'text-white', 'shadow-xl');
            btn.classList.remove('bg-white', 'text-gray-500');
        } else {
            btn.classList.remove('bg-green-600', 'text-white', 'shadow-xl');
            btn.classList.add('bg-white', 'text-gray-500');
        }
    });

    if (cat === 'Semua') renderProducts(products);
    else renderProducts(products.filter(p => p.kategori === cat));
}

// 6. Dashboard & Transaksi (Diperbaiki: Menghitung total transaksi unik)
async function loadDashboardData() {
    try {
        const res = await fetch(`${API_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const transactions = await res.json();
        
        let omsetHariIni = 0;
        let omsetBulanIni = 0;
        const now = new Date();
        const hariIni = now.toDateString();
        const bulanIni = now.getMonth();
        const tahunIni = now.getFullYear();

        const historyContainer = document.getElementById('transaction-history');
        const filterTglValue = document.getElementById('filter-tanggal')?.value;

        let filteredHTML = transactions.map(trx => {
            const tglTrx = new Date(trx.createdAt);
            const total = trx.total || 0;

            if (tglTrx.toDateString() === hariIni) omsetHariIni += total;
            if (tglTrx.getMonth() === bulanIni && tglTrx.getFullYear() === tahunIni) omsetBulanIni += total;

            if (filterTglValue && tglTrx.toISOString().split('T')[0] !== filterTglValue) return '';

            return `
                <div class="flex justify-between items-center p-5 bg-gray-50 rounded-3xl border border-gray-100 mb-3 animate-fade-in">
                    <div>
                        <p class="font-black text-gray-800 text-lg">Rp ${total.toLocaleString()}</p>
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">${tglTrx.toLocaleString('id-ID')}</p>
                    </div>
                    <span class="text-[9px] font-black text-green-600 bg-white border border-green-100 px-4 py-1.5 rounded-full uppercase">
                        ${trx.items ? trx.items.length : 0} Menu
                    </span>
                </div>
            `;
        }).join('');

        if (historyContainer) {
            historyContainer.innerHTML = filteredHTML.trim() === '' 
                ? '<div class="text-center py-10 text-gray-400 text-xs font-bold uppercase italic">Belum ada transaksi</div>'
                : filteredHTML;
        }

        // Sinkronisasi angka ke semua ID yang mungkin ada di index.html
        const updateVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };

        updateVal('omset-hari-ini', `Rp ${omsetHariIni.toLocaleString()}`);
        updateVal('omset-bulan-ini', `Rp ${omsetBulanIni.toLocaleString()}`);
        updateVal('total-transaksi', transactions.length);
        
        // Tambahan untuk laporan halaman terpisah jika ada
        updateVal('report-omset-bulan', `Rp ${omsetBulanIni.toLocaleString()}`);
        updateVal('report-total-transaksi', transactions.length);

    } catch (err) { console.error("Gagal memuat dashboard:", err); }
}

// 7. Keranjang Belanja
function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (product) {
        const existing = cart.find(item => item._id === productId);
        if (existing) existing.qty += 1;
        else cart.push({ ...product, qty: 1 });
        updateCartUI();
        showNotification(`✅ ${product.nama} ditambahkan`);
    }
}

function updateCartUI() {
    const cartContainer = document.getElementById('cartItems');
    const totalPriceElem = document.getElementById('total');
    if (!cartContainer || !totalPriceElem) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `<div class="text-center py-20 opacity-20"><p class="mt-4 font-bold text-xs uppercase">Keranjang Kosong</p></div>`;
        totalPriceElem.innerText = 'Rp 0';
        return;
    }

    let total = 0;
    cartContainer.innerHTML = cart.map((item, index) => {
        total += item.harga * item.qty;
        return `
            <div class="flex justify-between items-center py-4 border-b border-gray-50 group animate-fade-in">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center font-black text-green-600 text-xs">${item.qty}x</div>
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm">${item.nama}</h4>
                        <p class="text-[10px] text-gray-400 font-bold uppercase">Rp ${(item.harga * item.qty).toLocaleString()}</p>
                    </div>
                </div>
                <button onclick="cart.splice(${index}, 1); updateCartUI()" class="text-red-300 hover:text-red-500 font-bold text-[10px] uppercase">Hapus</button>
            </div>
        `;
    }).join('');
    totalPriceElem.innerText = `Rp ${total.toLocaleString()}`;
}

// 8. CRUD Produk
async function saveProduct() {
    const nama = document.getElementById('p-nama').value;
    const harga = document.getElementById('p-harga').value;
    const kategori = document.getElementById('p-kategori').value;
    const gambar = document.getElementById('p-gambar').value;

    if (!nama || !harga) return showNotification("❌ Nama & Harga wajib diisi!");

    try {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ nama, harga: Number(harga), kategori, gambar })
        });

        if (res.ok) {
            showNotification("🚀 Menu Berhasil Ditambahkan!");
            toggleModal(); 
            loadProducts();
            ['p-nama', 'p-harga', 'p-gambar'].forEach(id => document.getElementById(id).value = '');
        }
    } catch (err) { console.error(err); }
}

async function deleteProduct(id) {
    if (!confirm("Hapus menu ini dari etalase?")) return;
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) { 
            loadProducts(); 
            showNotification("🗑️ Menu Telah Dihapus"); 
        }
    } catch (err) { console.error(err); }
}

// 9. Transaksi (WhatsApp & PDF)
async function saveTransactionToDB(tunai = 0, kembali = 0) {
    if (cart.length === 0) return false;
    const totalVal = parseInt(document.getElementById('total').innerText.replace(/[^0-9]/g, ''));

    try {
        const res = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
                items: cart.map(i => ({ nama: i.nama, qty: i.qty, harga: i.harga })), 
                total: totalVal,
                tunai: tunai,
                kembali: kembali
            })
        });
        return res.ok;
    } catch (err) { return false; }
}

async function sendWA() {
    if (cart.length === 0) return showNotification('⚠️ Pilih menu dulu!');
    const ownerWA = localStorage.getItem('no_whatsapp') || '628123456789';
    const totalRaw = document.getElementById('total').innerText;
    
    await saveTransactionToDB(0, 0);

    let message = `*INVOICE - ${localStorage.getItem('nama_cafe') || 'KASIR PRO'}*%0A`;
    message += `_Waktu: ${new Date().toLocaleString()}_%0A`;
    message += `--------------------------%0A`;
    cart.forEach(item => { message += `• ${item.nama} (${item.qty}x)%0A`; });
    message += `--------------------------%0A`;
    message += `*TOTAL TAGIHAN: ${totalRaw}*%0A%0A`;
    message += `_Terima kasih!_`;
    
    window.open(`https://wa.me/${ownerWA}?text=${message}`, '_blank');
    cart = [];
    updateCartUI();
    loadDashboardData();
}

function exportPDF() {
    if (cart.length === 0) return showNotification('⚠️ Keranjang kosong!');
    const totalVal = parseInt(document.getElementById('total').innerText.replace(/[^0-9]/g, ''));
    const inputTunai = prompt(`Total: Rp ${totalVal.toLocaleString()}\nMasukkan Uang Tunai:`, totalVal);
    
    if (inputTunai === null) return;
    const tunaiVal = parseInt(inputTunai.replace(/[^0-9]/g, '')) || 0;
    if (tunaiVal < totalVal) return alert("Uang tunai tidak cukup!");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: [80, 150 + (cart.length * 10)] });
    
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.text((localStorage.getItem('nama_cafe') || 'KASIR PRO').toUpperCase(), 40, 15, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.text(`Tgl: ${new Date().toLocaleString('id-ID')}`, 5, 25);
    doc.text("------------------------------------------", 40, 30, { align: "center" });

    let y = 37;
    cart.forEach((item) => {
        doc.text(`${item.nama.toUpperCase()}`, 5, y);
        doc.text(`${item.qty} x ${item.harga.toLocaleString()}`, 5, y + 4);
        doc.text(`Rp ${(item.harga * item.qty).toLocaleString()}`, 75, y + 4, { align: "right" });
        y += 10;
    });

    doc.text("------------------------------------------", 40, y, { align: "center" });
    doc.text(`TOTAL   : Rp ${totalVal.toLocaleString()}`, 5, y + 7);
    doc.text(`TUNAI   : Rp ${tunaiVal.toLocaleString()}`, 5, y + 12);
    doc.text(`KEMBALI : Rp ${(tunaiVal - totalVal).toLocaleString()}`, 5, y + 17);

    saveTransactionToDB(tunaiVal, tunaiVal - totalVal).then(() => {
        doc.save(`STRUK-${Date.now()}.pdf`);
        showNotification("📠 Struk Berhasil Dicetak");
        cart = [];
        updateCartUI();
        loadDashboardData();
    });
}

// 10. Utils
function showNotification(msg) {
    const toast = document.getElementById("notification");
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

function toggleModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.toggle('hidden');
}