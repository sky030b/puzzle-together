const { getChatHistoryByGameId, addNewMessageToGame } = require('../services/chatDatabase.js');

async function getChatHistory(req, res) {
  try {
    const { gameId } = req.params;
    const chatHistory = await getChatHistoryByGameId(gameId);
    if (chatHistory instanceof Error) throw chatHistory;

    return res.status(200).send(chatHistory);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function createNewMessage(req, res) {
  try {
    const { gameId } = req.params;
    const { playerId } = res.locals.jwtData;
    const { message } = req.body;

    const messageInfo = {
      gameId,
      playerId,
      message
    };

    const newMessage = await addNewMessageToGame(messageInfo);
    if (newMessage instanceof Error) throw newMessage;

    return res.status(200).send(newMessage);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

module.exports = { getChatHistory, createNewMessage };
