const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, nama, email, role, phone_number, created_at FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateUserRole = async (req, res) => {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['admin', 'toko', 'pembeli'].includes(role)) {
        return res.status(400).json({ message: 'Role tidak valid' });
    }

    try {
        const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }
        res.json({ message: 'Role user berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }
        res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Tidak dapat menghapus user ini karena memiliki data pesanan terkait.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};