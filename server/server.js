/**
 * Pizza Delivery — Express Server
 *
 * Entry point for the backend API.
 * Loads env vars, connects to MongoDB, mounts route handlers,
 * starts the stock monitor cron, and listens for requests.
 */

const dns = require('dns');
// Set public DNS servers to resolve MongoDB SRV records reliably
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startStockMonitor } = require('./services/stockMonitor');

// ─── Load environment variables ────────────────────────────────────────────────
dotenv.config();

// ─── Import route modules ──────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// ─── Initialize Express ────────────────────────────────────────────────────────
const app = express();

// ─── Middleware ─────────────────────────────────────────────────────────────────
// Enable CORS for the frontend origin (and all origins in development)
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🍕 Pizza Delivery API is running!',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start the stock level monitoring cron job
    startStockMonitor();

    // Listen for incoming requests
    app.listen(PORT, () => {
      console.log(`\n🍕 Pizza Delivery API running on port ${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
