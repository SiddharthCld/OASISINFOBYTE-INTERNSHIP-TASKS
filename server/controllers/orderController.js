const Order = require('../models/Order');
const { sendOrderStatusEmail } = require('../services/emailService');

// ─── Get User's Orders ────────────────────────────────────────────────────────

/**
 * @desc    Get all orders for the currently authenticated user
 * @route   GET /api/orders/my-orders
 * @access  Protected
 */
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get user orders error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders',
    });
  }
};

// ─── Get All Orders (Admin) ────────────────────────────────────────────────────

/**
 * @desc    Get all orders with user details populated
 * @route   GET /api/orders/all
 * @access  Protected, Admin
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email') // Only include name & email from User
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get all orders error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders',
    });
  }
};

// ─── Update Order Status (Admin) ───────────────────────────────────────────────

/**
 * @desc    Update an order's status and notify the user via email
 * @route   PUT /api/orders/:id/status
 * @access  Protected, Admin
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status value
    const validStatuses = [
      'Order Received',
      'In the Kitchen',
      'Sent to Delivery',
      'Delivered',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Find and update the order
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Send status update email to the user (non-blocking)
    try {
      if (order.user && order.user.email) {
        await sendOrderStatusEmail(
          order.user.email,
          order.user.name,
          order._id.toString(),
          status
        );
      }
    } catch (emailErr) {
      console.error('Failed to send order status email:', emailErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status',
    });
  }
};

module.exports = {
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};
