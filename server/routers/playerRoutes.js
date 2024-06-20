const express = require('express');
const {
  signup, signin, getPlayerInfo, generateAnonymousPlayer
} = require('../controllers/playerController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// router.get('/', getPlayers);
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/playerInfo', authenticateToken, getPlayerInfo);
router.get('/anonymous', generateAnonymousPlayer);

module.exports = router;
