const express = require('express');
const { getChatHistory, createNewMessage } = require('../controllers/chatController.js');

const router = express.Router();

router.get('/:gameId', getChatHistory);
router.post('/:gameId', createNewMessage);

module.exports = router;
