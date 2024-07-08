const express = require('express');
const {
  signup, signin, getPlayerInfo, generateAnonymousPlayer,
  getPlayerProfile, updatePlayerProfile
} = require('../controllers/playerController');
const { invitePlayer, getPlayedGameInfo } = require('../controllers/playerGameController');
const validateSignupMiddleware = require('../middleware/validateSignupMiddleware');
const validateSigninMiddleware = require('../middleware/validateSigninMiddleware');
const authenticateToken = require('../middleware/authenticateToken');
const validateProfileLengthMiddleware = require('../middleware/validateProfileLengthMiddleware');

const router = express.Router();

// router.get('/', getPlayers);
router.post('/signup', validateSignupMiddleware, signup);
router.post('/signin', validateSigninMiddleware, signin);
router.get('/playerInfo', authenticateToken, getPlayerInfo);
router.get('/profile/:playerId', getPlayerProfile);
router.post('/profile/:playerId', authenticateToken, validateProfileLengthMiddleware, updatePlayerProfile);
router.get('/anonymous', generateAnonymousPlayer);
router.post('/invite', authenticateToken, invitePlayer);
router.get('/:playerId/played-games', getPlayedGameInfo);

module.exports = router;
