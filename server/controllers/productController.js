const Product = require('../models/Product');

// 1. Ambil Semua Produk (Hanya milik user yang login)
exports.getProducts = async (req, res) => {
    try {
        // req.user.id dipastikan ada oleh authMiddleware
        const products = await Product.find({ user: req.user.id }).sort({ createdAt: -1 });
        
        // Tetap kirim array kosong [] jika belum ada produk, agar frontend tidak crash
        res.status(200).json(products); 
    } catch (err) {
        console.error("Error GetProducts:", err.message);
        res.status(500).json({ success: false, msg: "Gagal mengambil data produk" });
    }
};

// 2. Tambah Produk Baru
exports.createProduct = async (req, res) => {
    try {
        const { nama, harga, kategori, gambar } = req.body;

        // Validasi input minimal di sisi server
        if (!nama || !harga) {
            return res.status(400).json({ success: false, msg: "Nama dan Harga wajib diisi" });
        }

        const newProduct = new Product({
            user: req.user.id, 
            nama,
            harga,
            kategori: kategori || 'Umum',
            gambar
        });

        await newProduct.save();
        res.status(201).json({ success: true, data: newProduct });
    } catch (err) {
        res.status(400).json({ success: false, msg: "Gagal menambah produk: " + err.message });
    }
};

// 3. Update Produk
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, msg: "Produk tidak ditemukan" });
        }

        if (product.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, msg: "Akses ditolak: Bukan pemilik produk" });
        }

        // Gunakan destructuring untuk keamanan, agar user tidak bisa ubah field 'user'
        const { nama, harga, kategori, gambar } = req.body;

        product = await Product.findByIdAndUpdate(
            req.params.id, 
            { nama, harga, kategori, gambar }, 
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, msg: "Gagal update: " + err.message });
    }
};

// 4. Hapus Produk
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, msg: "Produk tidak ditemukan" });
        }

        if (product.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, msg: "Akses ditolak" });
        }

        await product.deleteOne();
        res.status(200).json({ success: true, msg: "Produk berhasil dihapus" });
    } catch (err) {
        // Menangani jika ID yang dikirim formatnya salah (CastError)
        res.status(400).json({ success: false, msg: "ID Produk tidak valid" });
    }
};