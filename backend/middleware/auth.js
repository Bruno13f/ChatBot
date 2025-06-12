require('dotenv').config({ path: '.env' });
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET;

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });

    // Fetch the user from the database
    try {
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
  });
}

module.exports = authenticateToken;