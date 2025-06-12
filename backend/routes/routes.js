const express = require('express');
const router = express.Router();

const { login, signUp, validateToken } = require('../controllers/authController');
const { getMessages, postMessage, getJokes } = require('../controllers/messageController');
const { createGroup } = require('../controllers/groupController');
const authenticateToken = require('../middleware/auth');

router.post('/login', login);
router.post('/sign-up', signUp);
router.post('/validate-token', validateToken);

router.get('/messages/:userId', authenticateToken, getMessages);
router.post('/messages', authenticateToken, postMessage);

router.get('/jokes/:userId', authenticateToken, getJokes);

router.post('/groups', authenticateToken, createGroup);

module.exports = router;
