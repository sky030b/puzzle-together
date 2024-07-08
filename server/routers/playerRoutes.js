const express = require('express');
const {
  signup, signin, getPlayerInfo, generateAnonymousPlayer,
  getPlayerProfile, updatePlayerProfile
} = require('../controllers/playerController');
const authenticateToken = require('../middleware/authenticateToken');
const { invitePlayer, getPlayedGameInfo } = require('../controllers/playerGameController');

const router = express.Router();

// router.get('/', getPlayers);
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/playerInfo', authenticateToken, getPlayerInfo);
router.get('/profile/:playerId', getPlayerProfile);
router.post('/profile/:playerId', authenticateToken, updatePlayerProfile);
router.get('/anonymous', generateAnonymousPlayer);
router.post('/invite', authenticateToken, invitePlayer);
router.get('/:playerId/played-games', getPlayedGameInfo);

module.exports = router;
