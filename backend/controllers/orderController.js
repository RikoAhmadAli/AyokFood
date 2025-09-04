const db = require('../config/db');

exports.createOrder = async (req, res) => {
    const { toko_id, total_price, delivery_address, items, delivery_latitude, delivery_longitude } = req.body;
    const pembeli_id = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Tidak ada item dalam pesanan' });
    }

    const connection = await db.getConnection();
    try {
        // Mulai transaksi
        await connection.beginTransaction();
        // 1. Masukkan data ke tabel 'orders'
        const [orderResult] = await connection.query(
            'INSERT INTO orders (pembeli_id, toko_id, total_price, delivery_address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
            [pembeli_id, toko_id, total_price, delivery_address, delivery_latitude, delivery_longitude]
        );
        const orderId = orderResult.insertId;

        // 2. Masukkan setiap item ke tabel 'order_items'
        for (const item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, produk_id, quantity, price_per_item) VALUES (?, ?, ?, ?)',
                [orderId, item.produk_id, item.quantity, item.price]
            );
        }
        await connection.commit();
        res.status(201).json({ message: 'Pesanan berhasil dibuat', orderId });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
};

exports.getStoreOrders = async (req, res) => {
    const tokoId = req.user.tokoId;
    if (!tokoId) {
        return res.status(404).json({ message: 'Toko untuk user ini tidak ditemukan' });
    }

    try {
        const [orders] = await db.query(
            `SELECT o.id, o.total_price, o.delivery_address, o.status, o.order_date, u.nama as pembeli_nama 
            FROM orders o
            JOIN users u ON o.pembeli_id = u.id
            WHERE o.toko_id = ? 
            ORDER BY o.order_date DESC`,
            [tokoId]
        );
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;
    const tokoId = req.user.tokoId;

    try {
        const [result] = await db.query(
            'UPDATE orders SET status = ? WHERE id = ? AND toko_id = ?',
            [status, orderId, tokoId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan atau Anda tidak berwenang' });
        }
        res.json({ message: 'Status pesanan berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getBuyerOrders = async (req, res) => {
    const pembeliId = req.user.id;
    try {
        const [orders] = await db.query(
            `SELECT o.id, o.total_price, o.delivery_address, o.status, o.order_date, s.nama_toko 
            FROM orders o
            JOIN stores s ON o.toko_id = s.id
            WHERE o.pembeli_id = ? 
            ORDER BY o.order_date DESC`,
            [pembeliId]
        );
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};