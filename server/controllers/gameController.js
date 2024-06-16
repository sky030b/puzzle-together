const { getGameBySerialID, getAllGames, addNewGame } = require('../services/gameDatabase');

async function getGames(req, res) {
  try {
    const allGames = await getAllGames();
    return res.status(200).send(allGames);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}

async function createNewGame(req, res) {
  try {
    const { file } = req;
    const { title, owner_id, row_qty, col_qty, difficulty, mode, is_public, is_open_when_owner_not_in } = req.body;

    const gameInfo = {
      title,
      owner_id,
      row_qty,
      col_qty,
      difficulty,
      mode,
      is_public: is_public && is_public === 'on' ? true : false,
      is_open_when_owner_not_in: is_open_when_owner_not_in && is_open_when_owner_not_in === 'on' ? true : false
    }

    const newGame = await addNewGame(file, gameInfo);
    return res.status(200).send(newGame);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}

module.exports = { getGames, createNewGame };
