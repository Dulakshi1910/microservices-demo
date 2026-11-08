// Request logger middleware
const requestLogger = (req, _res, next) => {
  console.log(`[user-service] ${req.method} ${req.path}`);
  next();
};

module.exports = requestLogger;
