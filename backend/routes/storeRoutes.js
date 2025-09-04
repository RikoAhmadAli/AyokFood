const express = require('express');
const router = express.Router();
const { getAllStores, getStoreById, getMyStoreStats, updateMyStore } = require('../controllers/storeController');
const { protect, isToko } = require('../middleware/authMiddleware');

router.get('/', getAllStores);
router.get('/:id', getStoreById);
router.get('/my-store/stats', protect, isToko, getMyStoreStats);
router.put('/my-store', protect, isToko, updateMyStore);

module.exports = router;