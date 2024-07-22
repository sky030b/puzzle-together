const express = require('express');
const { getChatHistory, createNewMessage } = require('../controllers/chatController.js');
const checkGameEntryMiddleware = require('../middlewares/checkGameEntryMiddleware.js');
const authenticateTokenMiddleware = require('../middlewares/authenticateTokenMiddleware.js');

const router = express.Router();

router.get('/:gameId', checkGameEntryMiddleware, getChatHistory);
router.post('/:gameId', authenticateTokenMiddleware, createNewMessage);

module.exports = router;
