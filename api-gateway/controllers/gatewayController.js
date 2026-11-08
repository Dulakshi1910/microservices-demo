const { proxyRequest, checkServiceHealth, USER_SERVICE_URL, PRODUCT_SERVICE_URL, ORDER_SERVICE_URL } = require('../utils/proxy');

// User Service Routes
exports.registerUser = async (req, res) => {
  await proxyRequest(`${USER_SERVICE_URL}/register`, req, res);
};

exports.loginUser = async (req, res) => {
  await proxyRequest(`${USER_SERVICE_URL}/login`, req, res);
};

exports.verifyToken = async (req, res) => {
  await proxyRequest(`${USER_SERVICE_URL}/verify`, req, res);
};

exports.getUserProfile = async (req, res) => {
  await proxyRequest(`${USER_SERVICE_URL}/profile/${req.params.userId}`, req, res);
};

// Product Service Routes
exports.getAllProducts = async (req, res) => {
  const queryString = new URLSearchParams(req.query).toString();
  const url = `${PRODUCT_SERVICE_URL}/products${queryString ? '?' + queryString : ''}`;
  await proxyRequest(url, req, res);
};

exports.getProduct = async (req, res) => {
  await proxyRequest(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`, req, res);
};

exports.createProduct = async (req, res) => {
  await proxyRequest(`${PRODUCT_SERVICE_URL}/products`, req, res);
};

exports.updateProduct = async (req, res) => {
  await proxyRequest(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`, req, res);
};

exports.deleteProduct = async (req, res) => {
  await proxyRequest(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`, req, res);
};

// Order Service Routes
exports.createOrder = async (req, res) => {
  await proxyRequest(`${ORDER_SERVICE_URL}/orders`, req, res);
};

exports.getAllOrders = async (req, res) => {
  await proxyRequest(`${ORDER_SERVICE_URL}/orders`, req, res);
};

exports.getOrder = async (req, res) => {
  await proxyRequest(`${ORDER_SERVICE_URL}/orders/${req.params.id}`, req, res);
};

exports.getOrdersByUser = async (req, res) => {
  await proxyRequest(`${ORDER_SERVICE_URL}/orders/user/${req.params.userId}`, req, res);
};

exports.updateOrderStatus = async (req, res) => {
  await proxyRequest(`${ORDER_SERVICE_URL}/orders/${req.params.id}/status`, req, res);
};

exports.cancelOrder = async (req, res) => {
  await proxyRequest(`${ORDER_SERVICE_URL}/orders/${req.params.id}`, req, res);
};

// Health Check
exports.gatewayHealth = (req, res) => {
  res.json({ service: 'api-gateway', status: 'healthy', port: process.env.PORT || 3000 });
};

exports.systemHealth = async (req, res) => {
  try {
    const [userHealth, productHealth, orderHealth] = await Promise.all([
      checkServiceHealth(USER_SERVICE_URL, 'user-service'),
      checkServiceHealth(PRODUCT_SERVICE_URL, 'product-service'),
      checkServiceHealth(ORDER_SERVICE_URL, 'order-service'),
    ]);

    res.json({
      gateway: 'healthy',
      services: { ...userHealth, ...productHealth, ...orderHealth }
    });
  } catch (error) {
    res.status(503).json({ message: 'Health check failed', error: error.message });
  }
};
