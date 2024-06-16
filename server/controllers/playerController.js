const { getAllPlayers } = require('../services/playerDatabase');


async function getPlayers(req, res) {
  try {
    const allPlayers = await getAllPlayers();
    return res.status(200).send(allPlayers);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}

module.exports = { getPlayers };
