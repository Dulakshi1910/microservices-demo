const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Health check
router.get('/health', userController.health);

// Auth routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/verify', userController.verify);

// User routes
router.get('/profile/:userId', userController.getProfile);
router.get('/users', userController.getAllUsers);

module.exports = router;
