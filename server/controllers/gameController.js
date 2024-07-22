const {
  getRenderInfoByGameId,
  getAllGames,
  addNewGame,
  updateGameBasicSetting,
  deleteMyOwnGameByGameId,
  getAllPublicGames
} = require('../models/gameDatabase');
const { getGameCompletionInfo } = require('../models/gameHelpers');
const { getPlaybackInfoByGameId } = require('../models/puzzleDatabase');

async function getGames(req, res) {
  try {
    const allGames = await getAllGames();
    return res.status(200).send(allGames);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function getPublicGames(req, res) {
  try {
    const publicGames = await getAllPublicGames();
    return res.status(200).send(publicGames);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function getRenderInfo(req, res) {
  try {
    const { gameId } = req.params;
    const gameRenderInfo = await getRenderInfoByGameId(gameId);
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

    if (ownerId !== playerId) return res.status(403).send('403 Forbidden: 您無權限訪問此資源。');

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

    return res.status(200).send(newGame);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function getPlaybackInfo(req, res) {
  try {
    const { gameId } = req.params;
    const { isCompleted } = await getGameCompletionInfo(gameId);
    if (!isCompleted) return res.status(400).send('這個關卡尚未結束，無法使用回放功能。');

    const playbackInfo = await getPlaybackInfoByGameId(gameId);
    return res.status(200).send(playbackInfo);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function getHintInfo(req, res) {
  try {
    const { gameId } = req.params;
    const gameRenderInfo = await getRenderInfoByGameId(gameId);
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
    const updateInfo = {
      gameId, title, difficulty, isPublic: isPublic === true
    };
    await updateGameBasicSetting(updateInfo);
    return res.status(200).send('updateGameInfo Done.');
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function deleteMyGame(req, res) {
  try {
    const { gameId } = req.params;
    await deleteMyOwnGameByGameId(gameId);
    return res.status(200).send('deleteMyGame Done.');
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

module.exports = {
  getGames,
  getPublicGames,
  getRenderInfo,
  createNewGame,
  getPlaybackInfo,
  getHintInfo,
  updateGameInfo,
  deleteMyGame
};
