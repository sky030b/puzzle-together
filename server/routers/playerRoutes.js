const express = require('express');
const { getPlayers, generateAnonymousPlayer, createNewPlayer } = require('../controllers/playerController');

const router = express.Router();

router.get('/', getPlayers);
router.post('/', createNewPlayer);
router.get('/anonymous', generateAnonymousPlayer);

module.exports = router;
