const db = require('../config/db');

// Rumus Haversine untuk menghitung jarak dalam kilometer
const haversineDistance = `(6371 * acos(cos(radians(?)) * cos(radians(s.latitude)) * cos(radians(s.longitude) - radians(?)) + sin(radians(?)) * sin(radians(s.latitude))))`;

exports.getAllProducts = async (req, res) => {
    const { lat, lng } = req.query;

    try {
        let query = `
            SELECT 
                p.id, p.nama, p.deskripsi, p.price, p.category, 
                p.toko_id, p.image_url, s.nama_toko, s.alamat
        `;
        const params = [];

        // Jika ada parameter lokasi, hitung jarak
        if (lat && lng) {
            query += `, ${haversineDistance} AS distance`;
            params.push(lat, lng, lat);
        }
        
        query += `
            FROM products p
            JOIN stores s ON p.toko_id = s.id
            WHERE p.is_available = 1`;

        if (lat && lng) {
            query += ' ORDER BY distance ASC';
        }
        const [products] = await db.query(query, params);
        const productsWithFullUrl = products.map(p => ({
            ...p,
            image_url: p.image_url ? `${req.protocol}://${req.get('host')}${p.image_url}` : null
        }));
        
        res.json(productsWithFullUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getProductsByStore = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE toko_id = ?', [req.params.tokoId]);
        const productsWithFullUrl = products.map(p => ({
            ...p,
            image_url: p.image_url ? `${req.protocol}://${req.get('host')}${p.image_url}` : null
        }));
        res.json(productsWithFullUrl);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createProduct = async (req, res) => {
    const { nama, deskripsi, price, category } = req.body;
    const tokoId = req.user.tokoId;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        await db.query(
            'INSERT INTO products (toko_id, nama, deskripsi, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [tokoId, nama, deskripsi, price, category, imageUrl]
        );
        res.status(201).json({ message: "Produk berhasil dibuat" });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProduct = async (req, res) => {
    const { nama, deskripsi, price, category, is_available } = req.body;
    const productId = req.params.id;
    const tokoId = req.user.tokoId;
    let imageUrl = req.body.image_url;

    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
        try {
            const url = new URL(imageUrl);
            imageUrl = url.pathname; 
        } catch (e) {
        }
    }

    try {
        await db.query(
            'UPDATE products SET nama = ?, deskripsi = ?, price = ?, category = ?, is_available = ?, image_url = ? WHERE id = ? AND toko_id = ?',
            [nama, deskripsi, price, category, is_available, imageUrl, productId, tokoId]
        );
        res.json({ message: "Produk berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteProduct = async (req, res) => {
    const productId = req.params.id;
    const tokoId = req.user.tokoId;

    try {
        const [result] = await db.query('DELETE FROM products WHERE id = ? AND toko_id = ?', [productId, tokoId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan atau tidak berwenang' });
        }
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};