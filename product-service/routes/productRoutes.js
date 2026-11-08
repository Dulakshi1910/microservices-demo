const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Health check
router.get('/health', productController.health);

// Product routes
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProduct);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Stock management routes
router.post('/products/:id/reserve', productController.reserveStock);
router.post('/products/:id/release', productController.releaseStock);

module.exports = router;
