const { invitePlayerJoinGame, getAllPlayedGamesInfo } = require('../services/playerGameDatabase');

async function invitePlayer(req, res) {
  try {
    const { playerId } = res.locals.jwtData;
    const { inviterId, inviteeId, gameId } = req.body;

    if (inviterId != playerId) return res.status(403).send('403 Forbidden: 您無權限訪問此資源。');

    const invitePLayerResult = await invitePlayerJoinGame(inviterId, inviteeId, gameId);
    if (invitePLayerResult instanceof Error) throw invitePLayerResult;

    return res.status(200).send(invitePLayerResult);
  } catch (error) {
    if (error.message.includes('a foreign key constraint fails')) {
      return res.status(400).send('400 Bad Request: 邀請的玩家不存在。');
    }
    return res.status(500).send(error.message);
  }
}

async function getPlayedGameInfo(req, res) {
  try {
    const { playerId } = req.params;
    const gamesInfo = await getAllPlayedGamesInfo(playerId);
    if (gamesInfo instanceof Error) throw gamesInfo;

    return res.status(200).send(gamesInfo);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

module.exports = {
  invitePlayer,
  getPlayedGameInfo
};
