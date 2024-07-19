const { getChatHistoryByGameId, addNewMessageToGame } = require('../services/chatDatabase.js');
const { getGamePublicInfo } = require('../services/gameDatabase.js');
const { checkoutInvited } = require('../services/playerGameDatabase.js');

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
    const { playerId: playerIdInToken } = res.locals.jwtData;
    const { playerId: playerIdInBody, message } = req.body;

    if (playerIdInToken !== playerIdInBody) return res.status(403).send('403 Forbidden: 您無權限訪問此資源。');

    const isPublic = await getGamePublicInfo(gameId);

    if (!isPublic) {
      const linkRecord = await checkoutInvited(playerIdInBody, gameId);
      if (linkRecord instanceof Error) throw linkRecord;
      if (!linkRecord.length) return res.status(403).send('403 Forbidden: 您沒有權限在此遊戲關卡的聊天室發言，請確保您已經收到邀請。或是指定關卡不存在。');
    }

    const messageInfo = {
      gameId,
      playerId: playerIdInBody,
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
