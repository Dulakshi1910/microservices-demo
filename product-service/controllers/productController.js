const Product = require('../models/Product');

// Health check
exports.health = async (_req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    res.json({ service: 'product-service', status: 'healthy', port: process.env.PORT || 3002, totalProducts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products (with optional search/category filter)
exports.getAllProducts = async (req, res) => {
  try {
    let query = {};

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search filter
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    const products = await Product.find(query);
    res.json({ count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock, description, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'name and price are required' });
    }

    const newProduct = new Product({
      name,
      price: Number(price),
      stock: stock || 0,
      description: description || '',
      category: category || 'general'
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, stock, description, category } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields if provided
    if (name) product.name = name;
    if (price) product.price = Number(price);
    if (stock !== undefined) product.stock = stock;
    if (description) product.description = description;
    if (category) product.category = category;

    await product.save();
    res.json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reserve stock (called by Order Service)
exports.reserveStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { quantity = 1 } = req.body;
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stock}`,
        available: product.stock,
        requested: quantity
      });
    }

    product.stock -= quantity;
    await product.save();

    res.json({
      message: 'Stock reserved',
      productId: product._id,
      reserved: quantity,
      remainingStock: product.stock
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Release stock (rollback on order failure)
exports.releaseStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { quantity = 1 } = req.body;
    product.stock += quantity;
    await product.save();

    res.json({
      message: 'Stock released',
      productId: product._id,
      released: quantity,
      remainingStock: product.stock
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
