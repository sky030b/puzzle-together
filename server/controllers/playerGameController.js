const { invitePlayerJoinGame, getAllPlayedGamesInfo, getMyOwnGamesInfo } = require('../services/playerGameDatabase');

async function invitePlayer(req, res) {
  try {
    const { playerId } = res.locals.jwtData;
    const { inviterId, inviteeId, gameId } = req.body;

    if (inviterId !== playerId) return res.status(403).send('403 Forbidden: 您無權限訪問此資源。');

    const invitePlayerResult = await invitePlayerJoinGame(inviterId, inviteeId, gameId);

    return res.status(200).send(invitePlayerResult);
  } catch (error) {
    if (error.message.includes('a foreign key constraint fails')) {
      return res.status(400).send('400 Bad Request: 邀請的玩家不存在。');
    }
    return res.status(500).send(error.message);
  }
}

async function getPlayedGames(req, res) {
  try {
    const { playerId } = req.params;
    const gamesInfo = await getAllPlayedGamesInfo(playerId);
    return res.status(200).send(gamesInfo);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function getMyOwnGames(req, res) {
  try {
    const { playerId: playerIdInParams } = req.params;
    const { playerId: playerIdInToken } = res.locals.jwtData;

    if (playerIdInToken !== playerIdInParams) return res.status(403).send('403 Forbidden: 您無權限訪問此資源。');

    const gamesInfo = await getMyOwnGamesInfo(playerIdInToken);

    return res.status(200).send(gamesInfo);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

module.exports = {
  invitePlayer,
  getPlayedGames,
  getMyOwnGames
};
