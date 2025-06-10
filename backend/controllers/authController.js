require('dotenv').config({ path: '.env' });
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SALT_ROUNDS = 10;

const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  res.json({ userId: user._id, token });
};

exports.signUp = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'Email is already registered' });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await User.create({ email, password: passwordHash});
  res.status(201).json({ message: 'User registered successfully' });
};

exports.validateToken = (req, res) => {
  const authHeader = req.headers.authorization;
  const userId = req.body.userId;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed token.' });
  }

  if (!userId) {
    return res.status(400).json({ message: 'User ID is missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, JWT_SECRET);

    // You can now check if the token belongs to a specific userId
    const tokenUserId = decoded.userId;
    const expectedUserId = req.query.userId || req.body.userId;

    if (expectedUserId && tokenUserId !== expectedUserId) {
      return res.status(403).json({ message: 'Token does not match user ID' });
    }

    return res.status(200).json({ valid: true, userId: tokenUserId });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

