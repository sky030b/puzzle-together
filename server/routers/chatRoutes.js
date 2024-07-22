const express = require('express');
const { getChatHistory, createNewMessage } = require('../controllers/chatController.js');
const checkGameEntryMiddleware = require('../middlewares/checkGameEntryMiddleware.js');
const authenticateTokenMiddleware = require('../middlewares/authenticateTokenMiddleware.js');

const router = express.Router();

router.route('/:gameId')
  .get(checkGameEntryMiddleware, getChatHistory)
  .post(authenticateTokenMiddleware, createNewMessage);

module.exports = router;
