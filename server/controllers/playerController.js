const { getAllPlayers, getNickname } = require('../services/playerDatabase');

async function getPlayers(req, res) {
  try {
    const allPlayers = await getAllPlayers();
    return res.status(200).send(allPlayers);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}

async function generateAnonymousPlayer(req, res) {

  function getRandomColorCode() {
    let hexCode = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    while (hexCode.length < 6) {
      hexCode = '0' + hexCode;
    }
    return '#' + hexCode;
  }

  try {
    const nickname = await getNickname();
    const anonymousPlayer = {
      nickname,
      represent_color: getRandomColorCode()
    }
    return res.status(200).send(anonymousPlayer);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}

module.exports = { getPlayers, generateAnonymousPlayer };
