const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAvailableItems,
  getAllItems,
  addItem,
  updateItem,
  deleteItem,
} = require('../controllers/inventoryController');

// Public route — available items grouped by category
router.get('/', getAvailableItems);

// Admin routes — full CRUD on inventory
router.get('/admin', protect, adminOnly, getAllItems);
router.post('/', protect, adminOnly, addItem);
router.put('/:id', protect, adminOnly, updateItem);
router.delete('/:id', protect, adminOnly, deleteItem);

module.exports = router;
