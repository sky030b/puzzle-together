const express = require('express');
const { getRenderInfo, createNewGame } = require('../controllers/gameController');
const checkGameEntryMiddleware = require('../middleware/checkGameEntryMiddleware');
const uploadImageMiddleware = require('../middleware/uploadImageMiddleware');

const router = express.Router();

// router.get('/', getGames);
router.get('/:gameId', checkGameEntryMiddleware, getRenderInfo);

router.post(
  '/',
  uploadImageMiddleware({ single: true, fieldName: 'question_img' }),
  createNewGame
);

module.exports = router;
