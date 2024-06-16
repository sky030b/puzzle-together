const express = require('express');
const { getGames, getRenderInfo, createNewGame } = require('../controllers/gameController');
const uploadImageMiddleware = require('../middleware/uploadImageMiddleware');

const router = express.Router();

// router.get('/', getGames);
router.get('/:gameId', getRenderInfo);

router.post(
  '/',
  uploadImageMiddleware({ single: true, fieldName: 'question_img' }),
  createNewGame
);

module.exports = router;
