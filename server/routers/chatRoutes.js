const express = require('express');
const { getChatHistory, createNewMessage } = require('../controllers/chatController.js');
const authenticateToken = require('../middleware/authenticateToken.js');

const router = express.Router();

router.get('/:gameId', getChatHistory);
router.post('/:gameId', authenticateToken, createNewMessage);

module.exports = router;
