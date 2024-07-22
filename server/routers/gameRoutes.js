const express = require('express');
const {
  getPublicGames,
  getRenderInfo,
  createNewGame,
  getPlaybackInfo,
  getHintInfo,
  updateGameInfo,
  deleteMyGame
} = require('../controllers/gameController');
const checkGameEntryMiddleware = require('../middlewares/checkGameEntryMiddleware');
const uploadImageMiddleware = require('../middlewares/uploadImageMiddleware');
const authorizeOwnerMiddleware = require('../middlewares/authorizeOwnerMiddleware');
const authenticateTokenMiddleware = require('../middlewares/authenticateTokenMiddleware');

const router = express.Router();

router.get('/public', getPublicGames);
router.get('/:gameId', checkGameEntryMiddleware, getRenderInfo);
router.get('/:gameId/playback', checkGameEntryMiddleware, getPlaybackInfo);
router.get('/:gameId/hint', checkGameEntryMiddleware, getHintInfo);

router.post(
  '/',
  authenticateTokenMiddleware,
  uploadImageMiddleware({ single: true, fieldName: 'question_img' }),
  createNewGame
);
router.post('/:gameId', authenticateTokenMiddleware, authorizeOwnerMiddleware, updateGameInfo);

router.delete('/:gameId', authenticateTokenMiddleware, authorizeOwnerMiddleware, deleteMyGame);

module.exports = router;
