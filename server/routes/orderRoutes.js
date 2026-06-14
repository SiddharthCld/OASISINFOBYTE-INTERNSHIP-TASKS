const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

// User routes
router.get('/my-orders', protect, getUserOrders);

// Admin routes
router.get('/all', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
