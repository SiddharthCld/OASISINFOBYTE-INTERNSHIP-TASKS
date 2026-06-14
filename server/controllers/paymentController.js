const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { checkStockLevels } = require('../services/stockMonitor');

// Initialize Razorpay instance with API keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Create Razorpay Order ─────────────────────────────────────────────────────

/**
 * @desc    Create a new Razorpay order (to be used by the frontend checkout)
 * @route   POST /api/payment/create-order
 * @access  Protected
 */
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid amount is required',
      });
    }

    // Razorpay expects amount in paise (smallest currency unit)
    const options = {
      amount: Math.round(amount * 100), // Convert dollars/rupees to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
    });
  }
};

// ─── Verify Payment & Create Order ─────────────────────────────────────────────

/**
 * @desc    Verify Razorpay payment signature, create order, deduct inventory
 * @route   POST /api/payment/verify
 * @access  Protected
 */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      totalAmount,
      deliveryAddress,
    } = req.body;

    // ── 1. Verify the Razorpay signature using HMAC SHA256 ──
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed — invalid signature',
      });
    }

    // ── 2. Create the Order document ──
    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: 'completed',
      orderStatus: 'Order Received',
      deliveryAddress,
    });

    // ── 3. Deduct inventory quantities ──
    // Build a list of item names to deduct (each reduces quantity by 1)
    const deductions = [];

    if (items.base && items.base.name) {
      deductions.push(items.base.name);
    }
    if (items.sauce && items.sauce.name) {
      deductions.push(items.sauce.name);
    }
    if (items.cheese && items.cheese.name) {
      deductions.push(items.cheese.name);
    }
    if (items.veggies && Array.isArray(items.veggies)) {
      items.veggies.forEach((v) => {
        if (v.name) deductions.push(v.name);
      });
    }
    if (items.meats && Array.isArray(items.meats)) {
      items.meats.forEach((m) => {
        if (m.name) deductions.push(m.name);
      });
    }

    // Decrement each item's quantity by 1
    for (const itemName of deductions) {
      await Inventory.findOneAndUpdate(
        { name: itemName, quantity: { $gt: 0 } },
        { $inc: { quantity: -1 } }
      );
    }

    // ── 4. Check stock levels after order (may trigger alert email) ──
    // Run asynchronously so it doesn't block the response
    checkStockLevels().catch((err) =>
      console.error('Post-order stock check error:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      data: order,
    });
  } catch (error) {
    console.error('Verify payment error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during payment verification',
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
