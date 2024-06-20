const express = require('express');
const {
  getPlayers, generateAnonymousPlayer, signup, signin
} = require('../controllers/playerController');

const router = express.Router();

router.get('/', getPlayers);
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/anonymous', generateAnonymousPlayer);

module.exports = router;
