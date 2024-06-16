const express = require('express');
const { getGames, createNewGame } = require('../controllers/gameController');
const uploadImageMiddleware = require('../middleware/uploadImageMiddleware');

const router = express.Router();

router.get('/', getGames);
router.post(
  '/',
  uploadImageMiddleware({ single: true, fieldName: 'question_img' }),
  createNewGame
);

module.exports = router;
