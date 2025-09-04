const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.registerUser = async (req, res) => {
    const { nama, email, password, role, phone_number, nama_toko, deskripsi, alamat, latitude, longitude } = req.body;

    if (!nama || !email || !password || !role) {
        return res.status(400).json({ message: 'Mohon isi semua field yang wajib diisi' });
    }
    
    if (role === 'toko' && (!nama_toko || !alamat)) {
        return res.status(400).json({ message: 'Nama toko dan alamat wajib diisi untuk role pedagang' });
    }

    try {
        const [userExists] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User dengan email ini sudah ada' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const connection = await db.getConnection();
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO users (nama, email, password, role, phone_number) VALUES (?, ?, ?, ?, ?)',
            [nama, email, hashedPassword, role, phone_number]
        );
        
        const userId = result.insertId;

        if (role === 'toko') {
            await connection.query(
                'INSERT INTO stores (user_id, nama_toko, deskripsi, alamat, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, nama_toko, deskripsi, alamat, latitude, longitude]
            );
        }

        await connection.commit();
        connection.release();

        res.status(201).json({
            id: userId,
            nama,
            email,
            role,
            token: generateToken(userId),
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Fungsi untuk Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cari user berdasarkan email
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const user = users[0];
        // Bandingkan password yang diinput dengan hash di database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // Jika user adalah 'toko', ambil informasi tokonya
        let storeInfo = null;
        if (user.role === 'toko') {
            const [stores] = await db.query('SELECT id, nama_toko FROM stores WHERE user_id = ?', [user.id]);
            if (stores.length > 0) {
                storeInfo = stores[0];
            }
        }
        
        // Kirim respon sukses beserta data user dan token
        res.json({
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role,
            toko: storeInfo,
            token: generateToken(user.id),
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Fungsi untuk mendapatkan data user yang sedang login
exports.getMe = async (req, res) => {
    
    let storeInfo = null;
    if (req.user.role === 'toko') {
        const [stores] = await db.query('SELECT id, nama_toko FROM stores WHERE user_id = ?', [req.user.id]);
        if (stores.length > 0) {
            storeInfo = stores[0];
        }
    }

    res.status(200).json({
        ...req.user,
        toko: storeInfo
    });
};