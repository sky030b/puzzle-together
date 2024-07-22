const express = require('express');
const { getAllPlayerPosts, createNewPost } = require('../controllers/postController.js');
const authenticateTokenMiddleware = require('../middlewares/authenticateTokenMiddleware.js');

const router = express.Router();

router.get('/:playerId', getAllPlayerPosts);
router.post('/', authenticateTokenMiddleware, createNewPost);

module.exports = router;
