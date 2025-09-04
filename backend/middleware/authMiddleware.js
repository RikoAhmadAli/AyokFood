const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const [users] = await db.query('SELECT id, nama, email, role FROM users WHERE id = ?', [decoded.id]);
            if (users.length === 0) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            req.user = users[0];

            if(req.user.role === 'toko'){
                const [stores] = await db.query('SELECT id FROM stores WHERE user_id = ?', [req.user.id]);
                if (stores.length > 0) {
                    req.user.tokoId = stores[0].id;
                }
            }
            
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

exports.isToko = (req, res, next) => {
    if (req.user && req.user.role === 'toko') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a store owner' });
    }
};