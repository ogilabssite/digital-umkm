// 1. Variabel Penampung Pesanan (Keranjang)
let keranjang = [];
let totalHarga = 0;

// 2. Fungsi Menambah Produk ke Keranjang
function tambahProduk(id, nama, harga) {
    const item = {
        productId: id,
        nama: nama,
        jumlah: 1,
        subtotal: harga
    };
    
    // Cek jika barang sudah ada, tambah jumlahnya saja
    const index = keranjang.findIndex(p => p.productId === id);
    if (index !== -1) {
        keranjang[index].jumlah += 1;
        keranjang[index].subtotal = keranjang[index].jumlah * harga;
    } else {
        keranjang.push(item);
    }
    updateTampilan();
}

// 3. Fungsi Kirim Data ke Backend (Checkout)
async function bayar() {
    const bayarNominal = document.getElementById('input-bayar').value;
    const kembali = bayarNominal - totalHarga;

    const dataTransaksi = {
        items: keranjang,
        totalHarga: totalHarga,
        bayar: bayarNominal,
        kembali: kembali
    };

    try {
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Token dari login
            },
            body: JSON.stringify(dataTransaksi)
        });

        const result = await response.json();
        if (result.success) {
            alert("Transaksi Berhasil!");
            window.location.reload(); // Refresh halaman
        }
    } catch (error) {
        console.error("Gagal mengirim transaksi:", error);
    }
}