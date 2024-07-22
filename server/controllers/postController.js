const { addNewPost, getAllPostByPlayerId } = require('../models/postDatabase');

async function getAllPlayerPosts(req, res) {
  try {
    const { playerId } = req.params;
    const allPosts = await getAllPostByPlayerId(playerId);
    return res.status(200).send(allPosts);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function createNewPost(req, res) {
  try {
    const { gameId, content } = req.body;
    const { playerId } = res.locals.jwtData;
    const postInfo = { playerId, gameId, content };
    const newGame = await addNewPost(postInfo);
    return res.status(200).send(newGame);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

module.exports = {
  getAllPlayerPosts,
  createNewPost
};
