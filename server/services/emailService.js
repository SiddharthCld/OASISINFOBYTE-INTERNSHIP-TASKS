const dns = require('dns');
const nodemailer = require('nodemailer');

// Force IPv4 DNS resolution to prevent ECONNREFUSED ::1 on Windows
dns.setDefaultResultOrder('ipv4first');

/**
 * Create the Nodemailer transporter using Gmail SMTP.
 * Uses environment variables for credentials.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false, // true for 465, false for other ports (587 uses STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ─── Shared email styles (pizza-themed) ────────────────────────────────────────
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#FFF8F0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px; margin:0 auto; background-color:#ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #D32F2F, #FF6F00); padding:30px 20px; text-align:center;">
      <h1 style="color:#ffffff; margin:0; font-size:28px;">🍕 Pizza Delivery</h1>
      <p style="color:#FFE0B2; margin:5px 0 0; font-size:14px;">Hot & Fresh, Right to Your Door</p>
    </div>
    <!-- Body -->
    <div style="padding:30px 25px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background-color:#FBE9E7; padding:20px; text-align:center; border-top:2px solid #FFCCBC;">
      <p style="color:#BF360C; margin:0; font-size:12px;">
        &copy; ${new Date().getFullYear()} Pizza Delivery. All rights reserved.
      </p>
      <p style="color:#D84315; margin:5px 0 0; font-size:11px;">
        This is an automated email. Please do not reply directly.
      </p>
    </div>
  </div>
</body>
</html>
`;

// ─── 1. Verification Email ─────────────────────────────────────────────────────

/**
 * Send an email verification link to a newly registered user.
 * @param {string} email - Recipient email
 * @param {string} name  - User's name
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const html = emailWrapper(`
    <h2 style="color:#D32F2F; margin-top:0;">Welcome, ${name}! 👋</h2>
    <p style="color:#333; font-size:15px; line-height:1.6;">
      Thanks for signing up at <strong>Pizza Delivery</strong>! 
      Please verify your email address to start ordering delicious pizzas.
    </p>
    <div style="text-align:center; margin:30px 0;">
      <a href="${verifyUrl}" 
         style="display:inline-block; background-color:#D32F2F; color:#ffffff; 
                padding:14px 35px; text-decoration:none; border-radius:8px; 
                font-size:16px; font-weight:bold; letter-spacing:0.5px;">
        ✅ Verify My Email
      </a>
    </div>
    <p style="color:#777; font-size:13px;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <a href="${verifyUrl}" style="color:#FF6F00; word-break:break-all;">${verifyUrl}</a>
    </p>
    <p style="color:#999; font-size:12px;">This link expires in 24 hours.</p>
  `);

  await transporter.sendMail({
    from: `"Pizza Delivery" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🍕 Verify Your Email — Pizza Delivery',
    html,
  });
};

// ─── 2. Password Reset Email ───────────────────────────────────────────────────

/**
 * Send a password reset link to the user.
 * @param {string} email - Recipient email
 * @param {string} name  - User's name
 * @param {string} token - Password reset token
 */
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const html = emailWrapper(`
    <h2 style="color:#D32F2F; margin-top:0;">Password Reset Request</h2>
    <p style="color:#333; font-size:15px; line-height:1.6;">
      Hi <strong>${name}</strong>, we received a request to reset your password.
      Click the button below to set a new password.
    </p>
    <div style="text-align:center; margin:30px 0;">
      <a href="${resetUrl}" 
         style="display:inline-block; background-color:#FF6F00; color:#ffffff; 
                padding:14px 35px; text-decoration:none; border-radius:8px; 
                font-size:16px; font-weight:bold; letter-spacing:0.5px;">
        🔑 Reset Password
      </a>
    </div>
    <p style="color:#777; font-size:13px;">
      If you didn't request this, you can safely ignore this email.<br/>
      Link: <a href="${resetUrl}" style="color:#FF6F00; word-break:break-all;">${resetUrl}</a>
    </p>
    <p style="color:#999; font-size:12px;">This link expires in 1 hour.</p>
  `);

  await transporter.sendMail({
    from: `"Pizza Delivery" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🔑 Password Reset — Pizza Delivery',
    html,
  });
};

// ─── 3. Stock Alert Email ──────────────────────────────────────────────────────

/**
 * Send an alert to the admin when inventory items fall below their threshold.
 * @param {string} adminEmail   - Admin's email address
 * @param {Array}  lowStockItems - Array of inventory documents with low stock
 */
const sendStockAlertEmail = async (adminEmail, lowStockItems) => {
  const itemRows = lowStockItems
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #FFCCBC; color:#333;">${item.name}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #FFCCBC; color:#333; text-transform:capitalize;">${item.category}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #FFCCBC; color:#D32F2F; font-weight:bold; text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #FFCCBC; color:#333; text-align:center;">${item.threshold}</td>
      </tr>`
    )
    .join('');

  const html = emailWrapper(`
    <h2 style="color:#D32F2F; margin-top:0;">⚠️ Low Stock Alert</h2>
    <p style="color:#333; font-size:15px; line-height:1.6;">
      The following inventory items are running low and need restocking:
    </p>
    <table style="width:100%; border-collapse:collapse; margin:20px 0; border:1px solid #FFCCBC; border-radius:8px; overflow:hidden;">
      <thead>
        <tr style="background-color:#FBE9E7;">
          <th style="padding:12px; text-align:left; color:#BF360C; font-size:13px;">Item</th>
          <th style="padding:12px; text-align:left; color:#BF360C; font-size:13px;">Category</th>
          <th style="padding:12px; text-align:center; color:#BF360C; font-size:13px;">Qty Left</th>
          <th style="padding:12px; text-align:center; color:#BF360C; font-size:13px;">Threshold</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
    <p style="color:#777; font-size:13px;">
      Please restock these items as soon as possible to avoid order disruptions.
    </p>
  `);

  await transporter.sendMail({
    from: `"Pizza Delivery System" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: '⚠️ Low Stock Alert — Pizza Delivery',
    html,
  });
};

// ─── 4. Order Status Update Email ──────────────────────────────────────────────

/**
 * Notify the user when their order status changes.
 * @param {string} email   - User's email
 * @param {string} name    - User's name
 * @param {string} orderId - The order's MongoDB _id
 * @param {string} status  - New status string
 */
const sendOrderStatusEmail = async (email, name, orderId, status) => {
  // Map statuses to friendly emojis and colors
  const statusMeta = {
    'Order Received': { emoji: '📋', color: '#1565C0' },
    'In the Kitchen': { emoji: '👨‍🍳', color: '#FF6F00' },
    'Sent to Delivery': { emoji: '🚗', color: '#2E7D32' },
    'Delivered': { emoji: '✅', color: '#388E3C' },
  };

  const meta = statusMeta[status] || { emoji: '📦', color: '#333' };

  const html = emailWrapper(`
    <h2 style="color:#D32F2F; margin-top:0;">Order Update</h2>
    <p style="color:#333; font-size:15px; line-height:1.6;">
      Hi <strong>${name}</strong>, your order status has been updated!
    </p>
    <div style="background-color:#FFF3E0; border-left:4px solid ${meta.color}; 
                padding:20px; margin:20px 0; border-radius:0 8px 8px 0;">
      <p style="margin:0; font-size:14px; color:#777;">Order ID</p>
      <p style="margin:4px 0 12px; font-size:13px; color:#555; word-break:break-all;">${orderId}</p>
      <p style="margin:0; font-size:14px; color:#777;">Current Status</p>
      <p style="margin:4px 0 0; font-size:22px; font-weight:bold; color:${meta.color};">
        ${meta.emoji} ${status}
      </p>
    </div>
    ${
      status === 'Delivered'
        ? `<p style="color:#388E3C; font-size:15px; font-weight:bold;">
            🎉 Your pizza has been delivered! Enjoy your meal!
           </p>`
        : `<p style="color:#555; font-size:14px;">
            We'll notify you when the next update is available.
           </p>`
    }
  `);

  await transporter.sendMail({
    from: `"Pizza Delivery" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${meta.emoji} Order ${status} — Pizza Delivery`,
    html,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendStockAlertEmail,
  sendOrderStatusEmail,
};
