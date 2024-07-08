const express = require('express');
const { getChatHistory, createNewMessage } = require('../controllers/chatController.js');
const checkGameEntryMiddleware = require('../middleware/checkGameEntryMiddleware.js');
const authenticateToken = require('../middleware/authenticateToken.js');

const router = express.Router();

router.get('/:gameId', checkGameEntryMiddleware, getChatHistory);
router.post('/:gameId', authenticateToken, createNewMessage);

module.exports = router;
