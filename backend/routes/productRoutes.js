const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, isToko } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', productController.getAllProducts);

router.get('/store/:tokoId', productController.getProductsByStore);
router.delete('/:id', protect, isToko, productController.deleteProduct);
router.post('/', protect, isToko, upload, productController.createProduct);
router.put('/:id', protect, isToko, upload, productController.updateProduct);

module.exports = router;