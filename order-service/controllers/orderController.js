const Order = require('../models/Order');
const { httpGet, httpPost } = require('../utils/httpClient');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

// Health check
exports.health = async (_req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.json({ service: 'order-service', status: 'healthy', port: process.env.PORT || 3003, totalOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      return res.status(400).json({ message: 'Missing fields: userId, productId, and quantity required' });
    }

    // Step 1: Verify user exists
    let user;
    try {
      user = await httpGet(`${USER_SERVICE_URL}/profile/${userId}`);
    } catch (err) {
      return res.status(400).json({ message: `User verification failed: ${err.message}` });
    }

    // Step 2: Fetch product details & reserve stock
    let product;
    try {
      product = await httpGet(`${PRODUCT_SERVICE_URL}/products/${productId}`);
    } catch (err) {
      return res.status(404).json({ message: `Product ${productId} not found` });
    }

    try {
      await httpPost(`${PRODUCT_SERVICE_URL}/products/${productId}/reserve`, { quantity });
    } catch (err) {
      return res.status(400).json({ message: `Stock reservation failed: ${err.message}` });
    }

    // Step 3: Create the order in database
    const newOrder = new Order({
      userId,
      productId,
      productName: product.name,
      quantity: Number(quantity),
      totalPrice: product.price * Number(quantity),
      status: 'confirmed'
    });

    await newOrder.save();

    console.log(`[order-service] ✅ Order ${newOrder._id} created for user ${userId} — $${newOrder.totalPrice}`);

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get orders by user
exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel a delivered order' });
    }

    // Release reserved stock
    try {
      await httpPost(`${PRODUCT_SERVICE_URL}/products/${order.productId}/release`, {
        quantity: order.quantity
      });
      console.log(`[order-service] 🔄 Released ${order.quantity}x ${order.productId}`);
    } catch (err) {
      console.error(`[order-service] ❌ Failed to release stock:`, err.message);
      return res.status(500).json({ message: 'Failed to release stock' });
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled and stock released', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
