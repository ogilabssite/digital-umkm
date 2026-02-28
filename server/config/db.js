const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // 1. Cek status koneksi: 1 = connected, 2 = connecting
        // Menggunakan readyState agar tidak membuat koneksi baru setiap kali API dipanggil
        if (mongoose.connection.readyState >= 1) {
            return;
        }

        // 2. Konfigurasi Koneksi
        // Vercel Serverless bisa memutuskan koneksi jika terlalu lama idle
        const options = {
            family: 4, 
            serverSelectionTimeoutMS: 20000, 
            socketTimeoutMS: 45000,
            // Menghindari warning deprecation di beberapa versi driver
            autoIndex: true, 
        };

        // Pastikan nama variabel env di Vercel sama dengan yang di sini (MONGO_URI)
        await mongoose.connect(process.env.MONGO_URI, options);
        
        console.log('✅ SaaS Database Connected...');
    } catch (err) {
        console.error('❌ Database Error:', err.message);
        // Di Vercel, kita tidak boleh mematikan proses (process.exit), 
        // cukup biarkan error tertangkap agar Vercel bisa mencoba lagi (retry).
        throw err; 
    }
};

module.exports = connectDB;