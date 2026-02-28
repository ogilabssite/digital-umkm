const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nama_cafe: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true // Memastikan email tersimpan dalam huruf kecil
    },
    password: { 
        type: String, 
        required: true 
    },
    // ✅ Field baru untuk integrasi WhatsApp per toko
    no_whatsapp: { 
        type: String, 
        default: '628123456789' 
    },
    // ✅ Field baru untuk kustomisasi brand pengguna
    logo: { 
        type: String, 
        default: 'https://ui-avatars.com/api/?background=1D8E54&color=fff' 
    },
    tanggal_join: { 
        type: Date, 
        default: Date.now 
    }
});

// Middleware sebelum simpan: Membersihkan nomor WA jika input user salah format
UserSchema.pre('save', function(next) {
    if (this.isModified('no_whatsapp')) {
        // Hapus karakter non-angka
        let cleaned = this.no_whatsapp.replace(/\D/g, '');
        // Ubah 08xxx menjadi 628xxx
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.slice(1);
        }
        this.no_whatsapp = cleaned;
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);