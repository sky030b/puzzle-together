const { invitePlayerJoinGame, getAllPlayedGamesInfo } = require('../services/playerGameDatabase');

async function invitePlayer(req, res) {
  try {
    const { inviterId, inviteeId, gameId } = req.body;
    const invitePLayerResult = await invitePlayerJoinGame(inviterId, inviteeId, gameId);
    if (invitePLayerResult instanceof Error) throw invitePLayerResult;

    return res.status(200).send(invitePLayerResult);
  } catch (error) {
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
