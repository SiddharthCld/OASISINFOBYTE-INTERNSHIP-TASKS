const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token containing the user's ID and role.
 * Token expiry is controlled by the JWT_EXPIRE env variable (default: 7d).
 *
 * @param {string} id   - The user's MongoDB _id
 * @param {string} role - The user's role ('user' or 'admin')
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;
