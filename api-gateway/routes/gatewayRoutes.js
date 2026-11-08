const express = require('express');
const router = express.Router();
const controller = require('../controllers/gatewayController');

// Health checks
router.get('/health', controller.gatewayHealth);
router.get('/status', controller.systemHealth);

// User Service Routes
router.post('/api/users/register', controller.registerUser);
router.post('/api/users/login', controller.loginUser);
router.post('/api/users/verify', controller.verifyToken);
router.get('/api/users/:userId', controller.getUserProfile);

// Product Service Routes
router.get('/api/products', controller.getAllProducts);
router.get('/api/products/:id', controller.getProduct);
router.post('/api/products', controller.createProduct);
router.put('/api/products/:id', controller.updateProduct);
router.delete('/api/products/:id', controller.deleteProduct);

// Order Service Routes
router.post('/api/orders', controller.createOrder);
router.get('/api/orders', controller.getAllOrders);
router.get('/api/orders/:id', controller.getOrder);
router.get('/api/orders/user/:userId', controller.getOrdersByUser);
router.patch('/api/orders/:id/status', controller.updateOrderStatus);
router.delete('/api/orders/:id', controller.cancelOrder);

module.exports = router;
