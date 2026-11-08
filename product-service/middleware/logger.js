// Request logger middleware
const requestLogger = (req, _res, next) => {
  console.log(`[product-service] ${req.method} ${req.path}`);
  next();
};

module.exports = requestLogger;
