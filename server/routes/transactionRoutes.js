const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); 
const Transaction = require('../models/Transaction');

// @route    POST api/transactions
// @desc     Simpan transaksi baru
router.post('/', auth, async (req, res) => {
    try {
        // Mendukung 'total' atau 'totalAmount' agar sinkron dengan frontend
        const { items, total, totalAmount } = req.body;
        const finalTotal = total || totalAmount;

        if (!items || items.length === 0) {
            return res.status(400).json({ msg: 'Keranjang belanja kosong' });
        }

        const newTransaction = new Transaction({
            user: req.user.id,
            items,
            totalAmount: finalTotal // Pastikan field ini sesuai dengan model Transaction.js Anda
        });

        const transaction = await newTransaction.save();
        res.status(201).json(transaction);
    } catch (err) {
        console.error("Error Save Transaction:", err.message);
        res.status(500).json({ msg: 'Gagal mencatat transaksi' });
    }
});

// @route    GET api/transactions/stats
// @desc     Ambil statistik omzet untuk dashboard owner
router.get('/stats', auth, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Ambil data transaksi user
        const transactions = await Transaction.find({ user: req.user.id });

        // Hitung Omzet Hari Ini
        const todayOmzet = transactions
            .filter(t => t.createdAt >= startOfDay)
            .reduce((acc, curr) => acc + curr.totalAmount, 0);

        // Hitung Omzet Bulan Ini
        const monthOmzet = transactions
            .filter(t => t.createdAt >= startOfMonth)
            .reduce((acc, curr) => acc + curr.totalAmount, 0);

        // Ambil 10 transaksi terakhir untuk riwayat
        const recent = await Transaction.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            todayOmzet,
            monthOmzet,
            count: transactions.length,
            recent
        });
    } catch (err) {
        console.error("Error Stats:", err.message);
        res.status(500).json({ msg: 'Gagal memuat statistik' });
    }
});

// @route    GET api/transactions
// @desc     Ambil semua riwayat transaksi
router.get('/', auth, async (req, res) => {
    try {
        const history = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error("Error Get History:", err.message);
        res.status(500).json({ msg: 'Gagal memuat riwayat transaksi' });
    }
});

module.exports = router;