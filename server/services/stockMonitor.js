const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const { sendStockAlertEmail } = require('./emailService');

/**
 * Check inventory stock levels and send an alert email if any items
 * have a quantity below their configured threshold.
 * This can be called manually (e.g. after processing an order) or
 * automatically via the cron schedule.
 */
const checkStockLevels = async () => {
  try {
    // Find all items where current quantity is below the threshold
    const lowStockItems = await Inventory.find({
      $expr: { $lt: ['$quantity', '$threshold'] },
    });

    if (lowStockItems.length > 0) {
      console.log(
        `⚠️  Low stock detected for ${lowStockItems.length} item(s):`,
        lowStockItems.map((i) => `${i.name} (${i.quantity}/${i.threshold})`).join(', ')
      );

      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendStockAlertEmail(adminEmail, lowStockItems);
        console.log('📧 Stock alert email sent to admin.');
      } else {
        console.warn('⚠️  ADMIN_EMAIL not set — skipping stock alert email.');
      }
    } else {
      console.log('✅ Stock levels are healthy — no alerts needed.');
    }
  } catch (error) {
    console.error('❌ Error checking stock levels:', error.message);
  }
};

/**
 * Start the cron-based stock monitor.
 * Runs every 30 minutes to check for low-stock items.
 */
const startStockMonitor = () => {
  // Cron expression: every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('🔄 Running scheduled stock level check...');
    await checkStockLevels();
  });

  console.log('📦 Stock monitor started — checking every 30 minutes.');
};

module.exports = { checkStockLevels, startStockMonitor };
