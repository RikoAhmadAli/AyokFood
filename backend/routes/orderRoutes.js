const express = require('express');
const router = express.Router();
const { createOrder, getStoreOrders, updateOrderStatus, getBuyerOrders } = require('../controllers/orderController');
const { protect, isToko } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/myorders', protect, isToko, getStoreOrders);
router.get('/history', protect, getBuyerOrders); // Route baru
router.put('/:id/status', protect, isToko, updateOrderStatus);

module.exports = router;