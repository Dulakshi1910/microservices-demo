const app = require('./app');

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`product-service running on http://localhost:${PORT}`);
});
