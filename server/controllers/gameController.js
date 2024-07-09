const {
  getRenderInfoByGameId,
  getAllGames,
  addNewGame,
  updateGameBasicSetting,
  deleteMyOwnGameByGameId
} = require('../services/gameDatabase');
const { getGameCompletionInfo } = require('../services/gameHelpers');
const { getPlaybackInfoByGameId } = require('../services/puzzleDatabase');

async function getGames(req, res) {
  try {
    const allGames = await getAllGames();
    if (allGames instanceof Error) throw allGames;

    return res.status(200).send(allGames);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function getRenderInfo(req, res) {
  try {
    const { gameId } = req.params;
    const gameRenderInfo = await getRenderInfoByGameId(gameId);
    if (gameRenderInfo instanceof Error) {
      if (gameRenderInfo.message === '找不到指定關卡的資訊。') {
        return res.status(404).send('404 Not Found: 找不到指定關卡的資訊。');
      }
      throw gameRenderInfo;
    }

    return res.status(200).send(gameRenderInfo);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function createNewGame(req, res) {
  try {
    const { file } = req;
    const { playerId } = res.locals.jwtData;
    const {
      title, owner_id: ownerId, row_qty: rowQty, col_qty: colQty, difficulty, mode,
      is_public: isPublic, is_open_when_owner_not_in: isOpenWhenOwnerNotIn
    } = req.body;

    if (ownerId != playerId) return res.status(403).send('403 Forbidden: 您無權限訪問此資源。');

    const gameInfo = {
      title,
      ownerId: playerId,
      rowQty,
      colQty,
      difficulty,
      mode,
      isPublic: isPublic === 'true',
      isOpenWhenOwnerNotIn: isOpenWhenOwnerNotIn === 'true'
    };

    const newGame = await addNewGame(file, gameInfo);
    if (newGame instanceof Error) throw newGame;

    return res.status(200).send(newGame);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function getPlaybackInfo(req, res) {
  try {
    const { gameId } = req.params;

    const completionInfo = await getGameCompletionInfo(gameId);
    if (completionInfo instanceof Error) return res.status(400).send(completionInfo.message);

    const { isCompleted } = completionInfo;
    if (!isCompleted) return res.status(400).send('這個關卡尚未結束，無法使用回放功能。');

    const playbackInfo = await getPlaybackInfoByGameId(gameId);
    if (playbackInfo instanceof Error) throw playbackInfo;

    return res.status(200).send(playbackInfo);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function getHintInfo(req, res) {
  try {
    const { gameId } = req.params;
    const gameRenderInfo = await getRenderInfoByGameId(gameId);
    if (gameRenderInfo instanceof Error) {
      if (gameRenderInfo.message === '找不到指定關卡的資訊。') {
        return res.status(404).send('404 Not Found: 找不到指定關卡的資訊。');
      }
      throw gameRenderInfo;
    }
    const { puzzles } = gameRenderInfo;
    return res.status(200).send(puzzles);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function updateGameInfo(req, res) {
  try {
    const { gameId } = req.params;
    const { title, difficulty, isPublic } = req.body;
    const updateInfo = { gameId, title, difficulty, isPublic: isPublic === true };

    const updateGameInfoResult = await updateGameBasicSetting(updateInfo);
    if (updateGameInfoResult instanceof Error) throw updateGameInfoResult;

    return res.status(200).send('updateGameInfo Done.');
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function deleteMyGame(req, res) {
  try {
    const { gameId } = req.params;

    const deleteGameResult = await deleteMyOwnGameByGameId(gameId);
    if (deleteGameResult instanceof Error) throw deleteGameResult;


    return res.status(200).send('deleteMyGame Done.');
  } catch (error) {
    return res.status(500).send(error.message);
  }}

module.exports = {
  getGames,
  getRenderInfo,
  createNewGame,
  getPlaybackInfo,
  getHintInfo,
  updateGameInfo,
  deleteMyGame
};
