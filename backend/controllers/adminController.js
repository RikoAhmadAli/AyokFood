const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const [users] = await db.query('SELECT COUNT(id) as totalUsers FROM users');
        const [stores] = await db.query('SELECT COUNT(id) as totalStores FROM stores');
        const [orders] = await db.query('SELECT COUNT(id) as totalOrders, SUM(total_price) as totalRevenue FROM orders WHERE status = "delivered"');

        res.json({
            totalUsers: users[0].totalUsers || 0,
            totalStores: stores[0].totalStores || 0,
            totalOrders: orders[0].totalOrders || 0,
            totalRevenue: orders[0].totalRevenue || 0,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllStoresForAdmin = async (req, res) => {
    try {
        const [stores] = await db.query(`
            SELECT s.id, s.nama_toko, s.alamat, s.is_open, u.nama as pemilik, u.email 
            FROM stores s 
            JOIN users u ON s.user_id = u.id
        `);
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllOrdersForAdmin = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.id, u.nama as pembeli, s.nama_toko, o.total_price, o.status, o.order_date
            FROM orders o
            JOIN users u ON o.pembeli_id = u.id
            JOIN stores s ON o.toko_id = s.id
            ORDER BY o.order_date DESC
        `);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllProductsForAdmin = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.id, p.nama, p.price, p.is_available, s.nama_toko 
            FROM products p
            JOIN stores s ON p.toko_id = s.id
            ORDER BY p.id DESC
        `);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteStoreByAdmin = async (req, res) => {
    const storeId = req.params.id;
    try {
        await db.query('DELETE FROM stores WHERE id = ?', [storeId]);
        res.json({ message: 'Toko berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteProductByAdmin = async (req, res) => {
    const productId = req.params.id;
    try {
        await db.query('DELETE FROM products WHERE id = ?', [productId]);
        res.json({ message: 'Produk berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};