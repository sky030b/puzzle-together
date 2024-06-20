const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const {
  getAllPlayers, getAnonymousNickname, addNewPlayer,
  getPlayerByEmail, getHashPWDByEmail
} = require('../services/playerDatabase');

async function getPlayers(req, res) {
  try {
    const allPlayers = await getAllPlayers();
    return res.status(200).send(allPlayers);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}

function getPlayerInfo(req, res) {
  const { jwtData } = res.locals;
  const { playerId, nickname, representColor } = jwtData;
  const playerInfo = { playerId, nickname, representColor };
  return res.status(200).send(playerInfo);
}

function getPlayerToken(player) {
  try {
    const accessExpired = 4 * 60 * 60;
    const options = {
      expiresIn: accessExpired
    };

    const {
      player_id: playerId, email, nickname, represent_color: representColor
    } = player;

    const playerInfo = {
      playerId, email, nickname, representColor
    };

    const accessToken = jwt.sign(playerInfo, process.env.JWT_PRIVATE_KEY, options);
    const data = { accessToken, accessExpired, playerInfo };

    return { data };
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function signup(req, res) {
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
    const playerToken = getPlayerToken(newPlayer);
    return res.status(200).send(playerToken);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
}

async function signin(req, res) {
  try {
    const {
      email, password
    } = req.body;

    const hashedPasswordFromDatabase = await getHashPWDByEmail(email);
    if (!hashedPasswordFromDatabase) {
      return res.status(401).send('401 Unauthorized: User does not exist.');
    }

    const isPasswordCorrect = await bcrypt.compare(password, hashedPasswordFromDatabase);
    if (!isPasswordCorrect) {
      console.log('Password is incorrect');
      return res.status(403).send('403 Forbidden: Password is incorrect.');
    }

    const player = await getPlayerByEmail(email);
    const playerToken = getPlayerToken(player);

    return res.status(200).send(playerToken);
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

module.exports = {
  getPlayers, getPlayerInfo, signup, signin, generateAnonymousPlayer
};
