const rateLimit = require('express-rate-limit');

// Rate limiting middleware (100 requests per minute per IP)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests, please slow down' }
});

// Request logger middleware
const requestLogger = (req, _res, next) => {
  console.log(`[api-gateway] ${req.method} ${req.path}`);
  next();
};

module.exports = { limiter, requestLogger };
