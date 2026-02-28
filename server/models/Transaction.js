const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    // Menghubungkan ke Owner Toko/User
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // Nama pelanggan untuk personalisasi struk (Default: Umum)
    pelanggan: {
        type: String,
        default: 'Umum',
        trim: true
    },
    // Detail item yang dibeli
    items: [
        {
            productId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Product' 
            },
            nama: { type: String, required: true },
            qty: { type: Number, required: true },
            harga: { type: Number, required: true },
            subtotal: { type: Number, required: true }
        }
    ],
    // Ringkasan Pembayaran
    total: { 
        type: Number, 
        required: true 
    },
    bayar: { 
        type: Number, 
        required: true 
    },
    kembali: { 
        type: Number, 
        required: true,
        default: 0
    },
    // Metode pembayaran (bisa dikembangkan nanti: Tunai, QRIS, dll)
    metode: {
        type: String,
        default: 'Tunai'
    }
}, {
    timestamps: true // Otomatis mengelola createdAt dan updatedAt
});

// Indexing untuk kecepatan query laporan (Urutkan dari transaksi terbaru)
TransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);