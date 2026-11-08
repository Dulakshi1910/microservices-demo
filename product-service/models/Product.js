const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true,
      default: 'general'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
