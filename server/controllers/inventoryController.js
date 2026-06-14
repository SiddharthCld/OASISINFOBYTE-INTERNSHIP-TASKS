const Inventory = require('../models/Inventory');

// ─── Get Available Items (Public) ──────────────────────────────────────────────

/**
 * @desc    Get all available inventory items, grouped by category
 * @route   GET /api/inventory
 * @access  Public
 */
const getAvailableItems = async (req, res) => {
  try {
    const items = await Inventory.find({ isAvailable: true }).sort('category name');

    // Group items by category for easier frontend consumption
    const grouped = items.reduce((acc, item) => {
      const cat = item.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: items.length,
      data: grouped,
    });
  } catch (error) {
    console.error('Get available items error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching inventory',
    });
  }
};

// ─── Get All Items (Admin) ─────────────────────────────────────────────────────

/**
 * @desc    Get ALL inventory items with full details (including unavailable)
 * @route   GET /api/inventory/admin
 * @access  Protected, Admin
 */
const getAllItems = async (req, res) => {
  try {
    const items = await Inventory.find().sort('category name');

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('Get all items error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching inventory',
    });
  }
};

// ─── Add Item (Admin) ──────────────────────────────────────────────────────────

/**
 * @desc    Create a new inventory item
 * @route   POST /api/inventory
 * @access  Protected, Admin
 */
const addItem = async (req, res) => {
  try {
    const { category, name, description, quantity, threshold, price, image, isAvailable } =
      req.body;

    const item = await Inventory.create({
      category,
      name,
      description,
      quantity,
      threshold,
      price,
      image,
      isAvailable,
    });

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: item,
    });
  } catch (error) {
    console.error('Add item error:', error.message);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating inventory item',
    });
  }
};

// ─── Update Item (Admin) ───────────────────────────────────────────────────────

/**
 * @desc    Update an inventory item by ID
 * @route   PUT /api/inventory/:id
 * @access  Protected, Admin
 */
const updateItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Apply schema validators on update
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item,
    });
  } catch (error) {
    console.error('Update item error:', error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating inventory item',
    });
  }
};

// ─── Delete Item (Admin) ───────────────────────────────────────────────────────

/**
 * @desc    Delete an inventory item by ID
 * @route   DELETE /api/inventory/:id
 * @access  Protected, Admin
 */
const deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `"${item.name}" deleted from inventory`,
    });
  } catch (error) {
    console.error('Delete item error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting inventory item',
    });
  }
};

module.exports = {
  getAvailableItems,
  getAllItems,
  addItem,
  updateItem,
  deleteItem,
};
