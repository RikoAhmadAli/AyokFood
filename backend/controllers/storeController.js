const db = require('../config/db');

// Rumus Haversine untuk menghitung jarak
const haversineDistance = `(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))`;

exports.getAllStores = async (req, res) => {
    const { lat, lng, q } = req.query; 
    try {
        let query = 'SELECT id, nama_toko, deskripsi, alamat';
        const params = [];

        if (lat && lng) {
            query += `, ${haversineDistance} AS distance`;
            params.push(lat, lng, lat);
        }
        query += ' FROM stores WHERE is_open = 1';
        // Jika ada query pencarian
        if (q) {
            query += ' AND (nama_toko LIKE ? OR deskripsi LIKE ?)';
            params.push(`%${q}%`, `%${q}%`);
        }
        // Urutkan berdasarkan jarak jika ada
        if (lat && lng) {
            query += ' ORDER BY distance';
        }
        const [stores] = await db.query(query, params);
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getStoreById = async (req, res) => {
    try {
        const [stores] = await db.query('SELECT * FROM stores WHERE id = ?', [req.params.id]);
        if (stores.length === 0) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.json(stores[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
// [BARU] Mengambil statistik untuk toko yang sedang login
exports.getMyStoreStats = async (req, res) => {
    const tokoId = req.user.tokoId;
    try {
        const [orders] = await db.query(
            'SELECT COUNT(id) as totalOrders, SUM(total_price) as totalRevenue FROM orders WHERE toko_id = ? AND status = "delivered"', 
            [tokoId]
        );
        const [products] = await db.query('SELECT COUNT(id) as totalProducts FROM products WHERE toko_id = ?', [tokoId]);

        res.json({
            totalOrders: orders[0].totalOrders || 0,
            totalRevenue: orders[0].totalRevenue || 0,
            totalProducts: products[0].totalProducts || 0,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// [BARU] Memperbarui detail toko yang sedang login
exports.updateMyStore = async (req, res) => {
    const { nama_toko, deskripsi, alamat, is_open } = req.body;
    const tokoId = req.user.tokoId;

    try {
        await db.query(
            'UPDATE stores SET nama_toko = ?, deskripsi = ?, alamat = ?, is_open = ? WHERE id = ?',
            [nama_toko, deskripsi, alamat, is_open, tokoId]
        );
        res.json({ message: 'Profil toko berhasil diperbarui.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};