const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config(); 

const app = express();

// 1. Koneksi Database
// Di Vercel (Serverless), koneksi sering kali dibuka-tutup. 
// connectDB harus dipastikan sudah siap sebelum route diakses.
connectDB();

// 2. Middleware Keamanan & CORS
app.use(helmet({ 
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: true, // Mengizinkan semua origin di fase dev/prod Vercel agar tidak CORS error
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Middleware Log (Monitoring Request)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${req.method}] ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
    });
    next();
});

// 4. Routes
// Menggunakan path.resolve atau join untuk reliabilitas di Vercel
app.use('/api/auth', require(path.join(__dirname, 'routes/authRoutes')));
app.use('/api/products', require(path.join(__dirname, 'routes/productRoutes')));
app.use('/api/transactions', require(path.join(__dirname, 'routes/transactionRoutes')));

// 5. Health Check & Welcome Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: "Online",
        message: "API Kasir WA Pro is Running!",
        timestamp: new Date().toISOString()
    });
});

// Root route (Sangat berguna untuk cek apakah server up tanpa ke /api)
app.get('/', (req, res) => {
    res.status(200).send("Backend Kasir WA Pro is Live!");
});

// 6. Global Error Handler
app.use((err, req, res, next) => {
    console.error(`🔴 ERROR: ${err.message}`);
    res.status(err.status || 500).json({
        success: false,
        msg: err.message || "Internal Server Error"
    });
});

// 7. Local Development Server
// Vercel akan mengabaikan blok ini dan menggunakan module.exports di bawah
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 SERVER LOCAL JALAN DI PORT ${PORT}`);
    });
}

// 8. Export untuk Vercel (WAJIB)
module.exports = app;