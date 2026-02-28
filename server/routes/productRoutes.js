const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Product = require('../models/Product');

// @route    GET api/products
// @desc     Ambil semua produk milik owner yang login
router.get('/', auth, async (req, res) => {
    try {
        // Mengambil produk berdasarkan user id dari middleware auth
        const products = await Product.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error("Error Get Products:", err.message);
        res.status(500).json({ msg: 'Gagal memuat produk dari server' });
    }
});

// @route    POST api/products
// @desc     Tambah produk baru
router.post('/', auth, async (req, res) => {
    // Menyesuaikan dengan input frontend (nama/name, harga/price)
    // Kita buat fleksibel agar menerima keduanya
    const { name, nama, price, harga, category, kategori, image, gambar } = req.body;
    
    const finalNama = nama || name;
    const finalHarga = harga || price;
    const finalKategori = kategori || category || 'Umum';
    const finalGambar = gambar || image || '';

    if (!finalNama || !finalHarga) {
        return res.status(400).json({ msg: 'Nama dan harga wajib diisi' });
    }

    try {
        const newProduct = new Product({
            user: req.user.id,
            nama: finalNama,
            harga: Number(finalHarga), // Pastikan angka
            kategori: finalKategori,
            gambar: finalGambar
        });

        const product = await newProduct.save();
        res.status(201).json(product);
    } catch (err) {
        console.error("Error Post Product:", err.message);
        res.status(500).json({ msg: 'Gagal menambahkan produk' });
    }
});

// @route    PUT api/products/:id
// @desc     Update produk
router.put('/:id', auth, async (req, res) => {
    const { nama, name, harga, price, kategori, category, gambar, image } = req.body;
    
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Produk tidak ditemukan' });

        // Proteksi kepemilikan
        if (product.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Bukan milik Anda' });
        }

        const fieldsToUpdate = {};
        if (nama || name) fieldsToUpdate.nama = nama || name;
        if (harga || price) fieldsToUpdate.harga = Number(harga || price);
        if (kategori || category) fieldsToUpdate.kategori = kategori || category;
        if (gambar || image) fieldsToUpdate.gambar = gambar || image;

        product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true }
        );
        
        res.json(product);
    } catch (err) {
        console.error("Error Update Product:", err.message);
        res.status(500).json({ msg: 'Terjadi kesalahan saat update' });
    }
});

// @route    DELETE api/products/:id
// @desc     Hapus produk
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Produk tidak ditemukan' });
        
        if (product.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Akses ditolak' });
        }

        await product.deleteOne();
        res.json({ msg: 'Produk berhasil dihapus' });
    } catch (err) {
        console.error("Error Delete Product:", err.message);
        res.status(500).json({ msg: 'Gagal menghapus produk' });
    }
});

module.exports = router;