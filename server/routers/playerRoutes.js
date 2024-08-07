const express = require('express');
const {
  signup, signin, getPlayerInfo, generateAnonymousPlayer,
  getPlayerProfile, updatePlayerProfile
} = require('../controllers/playerController');
const { invitePlayer, getPlayedGames, getMyOwnGames } = require('../controllers/playerGameController');
const validateSignupMiddleware = require('../middlewares/validateSignupMiddleware');
const validateSigninMiddleware = require('../middlewares/validateSigninMiddleware');
const validateProfileLengthMiddleware = require('../middlewares/validateProfileLengthMiddleware');
const authenticateTokenMiddleware = require('../middlewares/authenticateTokenMiddleware');

const router = express.Router();

// router.get('/', getPlayers);

router.post('/signup', validateSignupMiddleware, signup);
router.post('/signin', validateSigninMiddleware, signin);

router.get('/playerInfo', authenticateTokenMiddleware, getPlayerInfo);

router.route('/profile/:playerId')
  .get(getPlayerProfile)
  .post(authenticateTokenMiddleware, validateProfileLengthMiddleware, updatePlayerProfile);

router.get('/:playerId/played-games', getPlayedGames);
router.get('/:playerId/my-own-games', authenticateTokenMiddleware, getMyOwnGames);

router.get('/anonymous', generateAnonymousPlayer);
router.post('/invite', authenticateTokenMiddleware, invitePlayer);

module.exports = router;
