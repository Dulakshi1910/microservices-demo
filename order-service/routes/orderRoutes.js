const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Health check
router.get('/health', orderController.health);

// Order routes
router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrder);
router.get('/orders/user/:userId', orderController.getOrdersByUser);
router.patch('/orders/:id/status', orderController.updateOrderStatus);
router.delete('/orders/:id', orderController.cancelOrder);

module.exports = router;
