const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ msg: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }

    try {
        const bearerToken = token.split(' ')[1] || token;

        // Validasi tambahan: Cek apakah JWT_SECRET ada
        if (!process.env.JWT_SECRET) {
            console.error("🔴 ERROR: JWT_SECRET belum diatur di Environment Variables!");
            return res.status(500).json({ msg: 'Kesalahan konfigurasi server.' });
        }

        const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);

        // Pastikan struktur decoded sesuai dengan saat kamu melakukan jwt.sign
        // Jika saat sign kamu pakai { id: user.id }, maka di sini decoded.id
        req.user = decoded.user || decoded; 
        
        next();
    } catch (err) {
        // Log khusus untuk debugging jika token expired atau salah kunci
        console.error("🔴 Auth Error:", err.message);
        res.status(401).json({ msg: 'Token tidak valid atau telah kedaluwarsa.' });
    }
};