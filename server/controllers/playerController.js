const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const { getAllPlayers, getAnonymousNickname, addNewPlayer } = require('../services/playerDatabase');

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
      hexCode = `0${hexCode}`;
    }
    return `#${hexCode}`;
  }

  try {
    const nickname = await getAnonymousNickname();
    const anonymousPlayer = {
      nickname,
      representColor: getRandomColorCode()
    };
    return res.status(200).send(anonymousPlayer);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}

async function createNewPlayer(req, res) {
  try {
    const {
      email, password, nickname, representColor, isRoomPublic
    } = req.body;

    const playerId = nanoid(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    const playerInfo = {
      playerId, email, hashedPassword, nickname, representColor, isRoomPublic: isRoomPublic === 'on'
    };

    const newPlayer = await addNewPlayer(playerInfo);
    return res.status(200).send(newPlayer);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}

module.exports = { getPlayers, generateAnonymousPlayer, createNewPlayer };
