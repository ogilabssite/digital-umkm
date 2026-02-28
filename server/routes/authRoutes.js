const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/authMiddleware'); // Pastikan middleware ini ada
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Daftarkan Owner Cafe Baru dengan Nomor WA
router.post('/register', async (req, res) => {
    const { nama_cafe, email, password, no_whatsapp } = req.body;

    try {
        // 1. Cek apakah email sudah terdaftar
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Email sudah terdaftar!' });

        // 2. Buat instance user baru (Termasuk no_whatsapp)
        user = new User({ 
            nama_cafe, 
            email, 
            password, 
            no_whatsapp: no_whatsapp || "628123456789" // Default jika kosong
        });

        // 3. Enkripsi Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 4. Simpan ke Database
        await user.save();

        // 5. Buat Token JWT
        const payload = { user: { id: user.id } };
        
        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    msg: 'Registrasi Berhasil',
                    user: { 
                        id: user.id, 
                        nama_cafe: user.nama_cafe,
                        no_whatsapp: user.no_whatsapp 
                    } 
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/login
// @desc    Masuk ke Dashboard & Dapatkan Data Toko
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Email atau Password salah!' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Email atau Password salah!' });

        const payload = { user: { id: user.id } };

        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }, 
            (err, token) => {
                if (err) throw err;
                // ✅ Kirim no_whatsapp agar bisa disimpan di localStorage frontend
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        nama_cafe: user.nama_cafe,
                        no_whatsapp: user.no_whatsapp 
                    } 
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/update-profile
// @desc    Update data toko (WA / Nama Cafe)
router.put('/update-profile', auth, async (req, res) => {
    const { nama_cafe, no_whatsapp } = req.body;
    try {
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User tidak ditemukan' });

        if (nama_cafe) user.nama_cafe = nama_cafe;
        if (no_whatsapp) user.no_whatsapp = no_whatsapp;

        await user.save();
        res.json({ 
            msg: 'Profil berhasil diperbarui', 
            user: { nama_cafe: user.nama_cafe, no_whatsapp: user.no_whatsapp } 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;