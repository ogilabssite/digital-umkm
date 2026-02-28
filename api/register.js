const mongoose = require('mongoose');
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    businessName: String, whatsapp: String, email: { type: String, unique: true }, password: String
}));
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Gunakan POST' });
    try {
        if (mongoose.connection.readyState !== 1) await mongoose.connect(process.env.MONGO_URI);
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true, message: 'Berhasil mendaftar!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
