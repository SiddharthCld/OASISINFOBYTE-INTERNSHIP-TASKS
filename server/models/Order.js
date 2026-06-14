const mongoose = require('mongoose');

/**
 * Order Schema
 * Stores each pizza order with selected ingredients, payment info, and delivery status.
 * References the User who placed the order.
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    // The pizza composition — one base, one sauce, one cheese, multiple veggies/meats
    items: {
      base: {
        name: String,
        price: Number,
      },
      sauce: {
        name: String,
        price: Number,
      },
      cheese: {
        name: String,
        price: Number,
      },
      veggies: [
        {
          name: String,
          price: Number,
        },
      ],
      meats: [
        {
          name: String,
          price: Number,
        },
      ],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    // Razorpay integration fields
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    // Order lifecycle status
    orderStatus: {
      type: String,
      enum: ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'],
      default: 'Order Received',
    },
    deliveryAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
