const mongoose = require("mongoose");

// 1. Definisi Schema (Hanya satu kali)
const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    businessName: String
});

// 2. Definisi Model (Mencegah OverwriteModelError di Vercel)
const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = async (req, res) => {
    // 3. CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    // 4. Batasi hanya Method POST
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, msg: "Method tidak diizinkan" });
    }

    try {
        // 5. Koneksi Database (Optimasi Serverless)
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        }

        const { email, password } = req.body;

        // 6. Validasi Input
        if (!email || !password) {
            return res.status(400).json({ success: false, msg: "Email dan Password wajib diisi" });
        }

        // 7. Cari User
        const user = await User.findOne({ email, password });

        if (user) {
            return res.status(200).json({
                success: true,
                token: "token-123",
                msg: "Login Berhasil",
                user: {
                    businessName: user.businessName,
                    email: user.email
                }
            });
        } else {
            return res.status(401).json({ success: false, msg: "Email atau Password salah" });
        }
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ success: false, msg: "Terjadi kesalahan server" });
    }
};