const express = require('express');
const {
  getRenderInfo,
  createNewGame,
  getPlaybackInfo,
  getHintInfo,
  updateGameInfo,
  deleteMyGame
} = require('../controllers/gameController');
const checkGameEntryMiddleware = require('../middleware/checkGameEntryMiddleware');
const authenticateToken = require('../middleware/authenticateToken');
const uploadImageMiddleware = require('../middleware/uploadImageMiddleware');
const authorizeOwnerMiddleware = require('../middleware/authorizeOwnerMiddleware');

const router = express.Router();

// router.get('/', getGames);
router.get('/:gameId', checkGameEntryMiddleware, getRenderInfo);
router.get('/:gameId/playback', checkGameEntryMiddleware, getPlaybackInfo);
router.get('/:gameId/hint', checkGameEntryMiddleware, getHintInfo);

router.post(
  '/',
  authenticateToken,
  uploadImageMiddleware({ single: true, fieldName: 'question_img' }),
  createNewGame
);
router.post('/:gameId', authenticateToken, authorizeOwnerMiddleware, updateGameInfo);

router.delete('/:gameId', authenticateToken, authorizeOwnerMiddleware, deleteMyGame);

module.exports = router;
