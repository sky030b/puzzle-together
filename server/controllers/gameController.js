const { getRenderInfoByGameId, getAllGames, addNewGame } = require('../services/gameDatabase');

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
    if (gameRenderInfo instanceof Error) throw gameRenderInfo;

    return res.status(200).send(gameRenderInfo);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function createNewGame(req, res) {
  try {
    const { file } = req;
    const {
      title, owner_id: ownerId, row_qty: rowQty, col_qty: colQty, difficulty, mode,
      is_public: isPublic, is_open_when_owner_not_in: isOpenWhenOwnerNotIn
    } = req.body;

    const gameInfo = {
      title,
      ownerId,
      rowQty,
      colQty,
      difficulty,
      mode,
      isPublic: isPublic === 'on',
      isOpenWhenOwnerNotIn: isOpenWhenOwnerNotIn === 'on'
    };

    const newGame = await addNewGame(file, gameInfo);
    if (newGame instanceof Error) throw newGame;

    return res.status(200).send(newGame);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

module.exports = { getGames, getRenderInfo, createNewGame };
