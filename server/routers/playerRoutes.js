const express = require('express');
const { getPlayers, generateAnonymousPlayer } = require('../controllers/playerController');

const router = express.Router();

router.get('/', getPlayers);
router.get('/anonymous', generateAnonymousPlayer);

module.exports = router;
