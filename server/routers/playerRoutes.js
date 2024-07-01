const express = require('express');
const {
  signup, signin, getPlayerInfo, generateAnonymousPlayer, 
  getPlayerProfile, updatePlayerProfile, invitePlayer
} = require('../controllers/playerController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// router.get('/', getPlayers);
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/playerInfo', authenticateToken, getPlayerInfo);
router.get('/profile/:playerId', getPlayerProfile);
router.post('/profile/:playerId', updatePlayerProfile);
router.get('/anonymous', generateAnonymousPlayer);
router.post('/invite', invitePlayer);

module.exports = router;
