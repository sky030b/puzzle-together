const express = require('express');
const { getAllPlayerPosts, createNewPost } = require('../controllers/postController.js');
const authenticateToken = require('../middleware/authenticateToken.js');

const router = express.Router();

router.get('/:playerId', getAllPlayerPosts);
router.post('/', authenticateToken, createNewPost);

module.exports = router;
