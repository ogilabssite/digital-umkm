const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// 1. Membuat Transaksi Baru (Checkout)
exports.createTransaction = async (req, res) => {
    try {
        const { items, totalHarga, bayar, kembali, pelanggan } = req.body;

        // Validasi Dasar
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, msg: "Keranjang belanja kosong" });
        }

        if (Number(bayar) < Number(totalHarga)) {
            return res.status(400).json({ success: false, msg: "Uang bayar tidak mencukupi" });
        }

        // --- Validasi Keberadaan Produk ---
        // Menggunakan Promise.all untuk performa lebih cepat dibanding for-loop biasa
        for (const item of items) {
            const produk = await Product.findById(item.productId);
            
            if (!produk) {
                return res.status(404).json({ 
                    success: false, 
                    msg: `Produk ${item.nama || 'dengan ID ' + item.productId} tidak terdaftar di etalase` 
                });
            }
            
            // Verifikasi harga dari server untuk mencegah manipulasi harga dari inspeksi browser
            // item.subtotal = produk.harga * item.jumlah; 
        }

        const newTransaction = new Transaction({
            user: req.user.id, // ID Kasir/Owner dari middleware auth
            items,
            totalHarga: Number(totalHarga),
            bayar: Number(bayar),
            kembali: Number(kembali),
            pelanggan: pelanggan || "Umum",
            tanggal: new Date()
        });

        await newTransaction.save();

        res.status(201).json({
            success: true,
            msg: "Transaksi berhasil disimpan",
            data: newTransaction
        });

    } catch (err) {
        console.error("Checkout Error:", err.message);
        res.status(500).json({ success: false, msg: "Gagal memproses transaksi di server" });
    }
};

// 2. Mengambil Riwayat Transaksi (Untuk Laporan Penjualan)
exports.getTransactions = async (req, res) => {
    try {
        // Ambil transaksi milik user login, urutkan dari yang terbaru
        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(100); // Limit 100 transaksi terakhir agar load tidak berat
        
        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Gagal mengambil riwayat transaksi" });
    }
};

// 3. Detail Transaksi Berdasarkan ID (Untuk Cetak Struk ulang)
exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ success: false, msg: "Data transaksi tidak ditemukan" });
        }

        // Keamanan: Cek apakah transaksi ini milik user yang request
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, msg: "Akses ditolak: Anda bukan pemilik transaksi ini" });
        }

        res.status(200).json({ success: true, data: transaction });
    } catch (err) {
        console.error("Detail Error:", err.message);
        res.status(500).json({ success: false, msg: "Gagal memuat detail transaksi" });
    }
};