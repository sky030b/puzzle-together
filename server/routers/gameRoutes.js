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

router.route('/:gameId')
  .get(checkGameEntryMiddleware, getRenderInfo)
  .post(authenticateTokenMiddleware, authorizeOwnerMiddleware, updateGameInfo)
  .delete(authenticateTokenMiddleware, authorizeOwnerMiddleware, deleteMyGame);

router.get('/:gameId/playback', checkGameEntryMiddleware, getPlaybackInfo);
router.get('/:gameId/hint', checkGameEntryMiddleware, getHintInfo);

router.post(
  '/',
  authenticateTokenMiddleware,
  uploadImageMiddleware({ single: true, fieldName: 'question_img' }),
  createNewGame
);

module.exports = router;
