const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getAllStoresForAdmin, 
    getAllOrdersForAdmin,
    getAllProductsForAdmin,
    deleteStoreByAdmin,
    deleteProductByAdmin
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.use(protect, isAdmin);
router.get('/stats', getDashboardStats);
router.get('/stores', getAllStoresForAdmin);
router.get('/orders', getAllOrdersForAdmin);
router.get('/products', getAllProductsForAdmin);
router.delete('/stores/:id', deleteStoreByAdmin);
router.delete('/products/:id', deleteProductByAdmin);

module.exports = router;