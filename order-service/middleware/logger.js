// Request logger middleware
const requestLogger = (req, _res, next) => {
  console.log(`[order-service] ${req.method} ${req.path}`);
  next();
};

module.exports = requestLogger;
