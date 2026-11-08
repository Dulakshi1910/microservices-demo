require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const requestLogger = require('./middleware/logger');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(requestLogger);

// Connect to MongoDB
connectDB();

// Routes
app.use('/', orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = app;
