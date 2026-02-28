const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    // Menghubungkan produk ke User/Toko tertentu
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    nama: { 
        type: String, 
        required: [true, 'Nama produk harus diisi'],
        trim: true 
    },
    harga: { 
        type: Number, 
        required: [true, 'Harga produk harus diisi'],
        min: [0, 'Harga tidak boleh negatif'] 
    },
    kategori: { 
        type: String, 
        default: 'Umum',
        trim: true
    },
    gambar: { 
        type: String, 
        default: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=400' 
    }
    // createdAt dihapus dari sini karena sudah ada di { timestamps: true }
}, {
    timestamps: true // Menghasilkan createdAt dan updatedAt secara otomatis
});

// Indexing untuk kecepatan query per toko
ProductSchema.index({ user: 1 });

// Indexing untuk pencarian nama produk (Text Search)
ProductSchema.index({ nama: 'text' }); 

module.exports = mongoose.model('Product', ProductSchema);