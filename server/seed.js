/**
 * Pizza Delivery — Database Seeder
 *
 * Populates the database with:
 *  - 1 Admin user
 *  - 1 Sample user
 *  - 28 Inventory items across 5 categories
 *
 * Usage: node seed.js
 */

const dns = require('dns');
// Set public DNS servers to resolve MongoDB SRV records reliably
dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Inventory = require('./models/Inventory');
const Order = require('./models/Order');

// Load environment variables
dotenv.config();

// ─── Seed Data ──────────────────────────────────────────────────────────────────

const users = [
  {
    name: 'Admin',
    email: 'admin@pizzadelivery.com',
    password: 'Admin@123',
    role: 'admin',
    isVerified: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'User@123',
    role: 'user',
    isVerified: true,
  },
];

const inventoryItems = [
  // ── Bases (5) ──
  { category: 'base', name: 'Thin Crust', description: 'Light and crispy thin crust base', quantity: 100, threshold: 20, price: 3, isAvailable: true },
  { category: 'base', name: 'Thick Crust', description: 'Soft and fluffy thick crust base', quantity: 100, threshold: 20, price: 3.5, isAvailable: true },
  { category: 'base', name: 'Cheese Burst', description: 'Crust stuffed with gooey cheese', quantity: 100, threshold: 20, price: 5, isAvailable: true },
  { category: 'base', name: 'Whole Wheat', description: 'Healthy whole wheat crust', quantity: 100, threshold: 20, price: 4, isAvailable: true },
  { category: 'base', name: 'Gluten-Free', description: 'Gluten-free crust option', quantity: 100, threshold: 20, price: 4.5, isAvailable: true },

  // ── Sauces (5) ──
  { category: 'sauce', name: 'Marinara', description: 'Classic Italian tomato sauce', quantity: 150, threshold: 20, price: 1, isAvailable: true },
  { category: 'sauce', name: 'BBQ', description: 'Smoky barbecue sauce', quantity: 150, threshold: 20, price: 1.5, isAvailable: true },
  { category: 'sauce', name: 'Alfredo', description: 'Creamy white alfredo sauce', quantity: 150, threshold: 20, price: 2, isAvailable: true },
  { category: 'sauce', name: 'Pesto', description: 'Fresh basil pesto sauce', quantity: 150, threshold: 20, price: 2, isAvailable: true },
  { category: 'sauce', name: 'Hot Sauce', description: 'Spicy hot chili sauce', quantity: 150, threshold: 20, price: 1, isAvailable: true },

  // ── Cheeses (5) ──
  { category: 'cheese', name: 'Mozzarella', description: 'Classic stretchy mozzarella', quantity: 120, threshold: 20, price: 2, isAvailable: true },
  { category: 'cheese', name: 'Cheddar', description: 'Sharp aged cheddar cheese', quantity: 120, threshold: 20, price: 2.5, isAvailable: true },
  { category: 'cheese', name: 'Parmesan', description: 'Nutty Italian parmesan', quantity: 120, threshold: 20, price: 3, isAvailable: true },
  { category: 'cheese', name: 'Gouda', description: 'Smooth and creamy gouda', quantity: 120, threshold: 20, price: 3, isAvailable: true },
  { category: 'cheese', name: 'Vegan Cheese', description: 'Plant-based cheese alternative', quantity: 120, threshold: 20, price: 3.5, isAvailable: true },

  // ── Veggies (8) ──
  { category: 'veggie', name: 'Mushrooms', description: 'Sliced button mushrooms', quantity: 200, threshold: 20, price: 0.75, isAvailable: true },
  { category: 'veggie', name: 'Bell Peppers', description: 'Colorful diced bell peppers', quantity: 200, threshold: 20, price: 0.5, isAvailable: true },
  { category: 'veggie', name: 'Onions', description: 'Thinly sliced red onions', quantity: 200, threshold: 20, price: 0.5, isAvailable: true },
  { category: 'veggie', name: 'Olives', description: 'Sliced black olives', quantity: 200, threshold: 20, price: 1, isAvailable: true },
  { category: 'veggie', name: 'Tomatoes', description: 'Fresh diced tomatoes', quantity: 200, threshold: 20, price: 0.5, isAvailable: true },
  { category: 'veggie', name: 'Corn', description: 'Sweet golden corn kernels', quantity: 200, threshold: 20, price: 0.5, isAvailable: true },
  { category: 'veggie', name: 'Jalapeños', description: 'Spicy sliced jalapeño peppers', quantity: 200, threshold: 20, price: 0.75, isAvailable: true },
  { category: 'veggie', name: 'Spinach', description: 'Fresh baby spinach leaves', quantity: 200, threshold: 20, price: 0.75, isAvailable: true },

  // ── Meats (5) ──
  { category: 'meat', name: 'Pepperoni', description: 'Classic spicy pepperoni slices', quantity: 80, threshold: 20, price: 2, isAvailable: true },
  { category: 'meat', name: 'Chicken', description: 'Grilled seasoned chicken pieces', quantity: 80, threshold: 20, price: 2.5, isAvailable: true },
  { category: 'meat', name: 'Sausage', description: 'Italian sausage crumbles', quantity: 80, threshold: 20, price: 2, isAvailable: true },
  { category: 'meat', name: 'Bacon', description: 'Crispy smoked bacon bits', quantity: 80, threshold: 20, price: 2.5, isAvailable: true },
  { category: 'meat', name: 'Ham', description: 'Honey-glazed ham slices', quantity: 80, threshold: 20, price: 2, isAvailable: true },
];

// ─── Run Seeder ─────────────────────────────────────────────────────────────────

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Order.deleteMany({});
    await Inventory.deleteMany({});
    await User.deleteMany({});
    console.log('   ✓ Cleared orders, inventory, and users');

    // Create users (password hashing is handled by the pre-save hook)
    console.log('👤 Creating users...');
    const createdUsers = await User.create(users);
    createdUsers.forEach((u) =>
      console.log(`   ✓ ${u.role.toUpperCase()}: ${u.email}`)
    );

    // Create inventory items
    console.log('📦 Creating inventory items...');
    const createdItems = await Inventory.insertMany(inventoryItems);
    const categoryCounts = createdItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    Object.entries(categoryCounts).forEach(([cat, count]) =>
      console.log(`   ✓ ${cat}: ${count} items`)
    );

    console.log(`\n🎉 Database seeded successfully!`);
    console.log(`   Total users:    ${createdUsers.length}`);
    console.log(`   Total items:    ${createdItems.length}`);
    console.log(`\n   Admin login:    admin@pizzadelivery.com / Admin@123`);
    console.log(`   User login:     john@example.com / User@123\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
