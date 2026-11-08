const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

// Proxy request to downstream service
async function proxyRequest(targetUrl, req, res) {
  try {
    const fetchRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward user context
        ...(req.user ? { 'X-User-Id': req.user.userId, 'X-User-Email': req.user.email } : {}),
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
    });

    const data = await fetchRes.json();
    res.status(fetchRes.status).json(data);
  } catch (error) {
    console.error(`Proxy error: ${error.message}`);
    res.status(503).json({ message: 'Service unavailable', error: error.message });
  }
}

// Health check for downstream services
async function checkServiceHealth(serviceUrl, serviceName) {
  try {
    const res = await fetch(`${serviceUrl}/health`);
    if (res.ok) {
      return { [serviceName]: 'healthy' };
    }
    return { [serviceName]: 'unhealthy' };
  } catch (error) {
    return { [serviceName]: 'down' };
  }
}

module.exports = { proxyRequest, checkServiceHealth, USER_SERVICE_URL, PRODUCT_SERVICE_URL, ORDER_SERVICE_URL };
