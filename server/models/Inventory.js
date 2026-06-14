const mongoose = require('mongoose');

/**
 * Inventory Schema
 * Represents individual pizza ingredients organized by category.
 * Each item has a stock quantity and a low-stock threshold for alerts.
 */
const inventorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: {
        values: ['base', 'sauce', 'cheese', 'veggie', 'meat'],
        message: '{VALUE} is not a valid category',
      },
      required: [true, 'Category is required'],
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Current stock quantity
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 100,
      min: [0, 'Quantity cannot be negative'],
    },
    // Low-stock alert threshold — when quantity drops below this, an alert fires
    threshold: {
      type: Number,
      default: 20,
      min: [0, 'Threshold cannot be negative'],
    },
    // Price per unit in dollars
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    // URL or path to the item's image
    image: {
      type: String,
    },
    // Whether this item is currently available for ordering
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
