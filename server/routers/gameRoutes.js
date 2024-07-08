const express = require('express');
const { getRenderInfo, createNewGame, getPlaybackInfo } = require('../controllers/gameController');
const checkGameEntryMiddleware = require('../middleware/checkGameEntryMiddleware');
const uploadImageMiddleware = require('../middleware/uploadImageMiddleware');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// router.get('/', getGames);
router.get('/:gameId', checkGameEntryMiddleware, getRenderInfo);
router.get('/:gameId/playback', getPlaybackInfo);

router.post(
  '/',
  authenticateToken,
  uploadImageMiddleware({ single: true, fieldName: 'question_img' }),
  createNewGame
);

module.exports = router;
