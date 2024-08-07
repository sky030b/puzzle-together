const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const {
  getAllPlayers, getAnonymousNickname, addNewPlayer,
  getPlayerByPlayerId, setPlayerProfileByPlayerId,
  getPlayerByEmail, getHashPWDByEmail
} = require('../models/playerDatabase');

async function getPlayers(req, res) {
  try {
    const allPlayers = await getAllPlayers();
    return res.status(200).send(allPlayers);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

function getPlayerInfo(req, res) {
  const { jwtData } = res.locals;
  const { playerId, nickname, representColor } = jwtData;
  const playerInfo = { playerId, nickname, representColor };
  return res.status(200).send(playerInfo);
}

async function getPlayerProfile(req, res) {
  try {
    const { playerId } = req.params;
    const playerProfile = await getPlayerByPlayerId(playerId);
    return res.status(200).send(playerProfile);
  } catch (error) {
    if (error.message === '找不到指定玩家的資訊。') return res.status(404).send('404 Not Found: 找不到指定玩家的資訊。');
    return res.status(500).send(error.message);
  }
}

async function updatePlayerProfile(req, res) {
  try {
    const { playerId: playerIdInParams } = req.params;
    const { playerId: playerIdInToken } = res.locals.jwtData;

    if (playerIdInToken !== playerIdInParams) return res.status(403).send('403 Forbidden: 您無權限訪問此資源。');

    await setPlayerProfileByPlayerId(playerIdInParams, req.body);
    return res.status(200).send('updatePlayerProfile Done');
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

function getPlayerToken(player) {
  try {
    const accessExpired = 4 * 60 * 60;
    const options = {
      expiresIn: accessExpired
    };

    const {
      player_id: playerId, nickname, represent_color: representColor
    } = player;

    const playerInfo = {
      playerId, nickname, representColor
    };

    const accessToken = jwt.sign(playerInfo, process.env.JWT_PRIVATE_KEY, options);
    const data = { accessToken, accessExpired, playerInfo };

    return { data };
  } catch (error) {
    return error;
  }
}

async function signup(req, res) {
  try {
    const {
      email, password, nickname, represent_color: representColor, is_room_public: isRoomPublic
    } = req.body;

    if (nickname.startsWith('匿名')) return res.status(400).send('400 Bad Request: 禁止使用"匿名"開頭的暱稱');

    const playerId = nanoid(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    const playerInfo = {
      playerId, email, hashedPassword, nickname, representColor, isRoomPublic: isRoomPublic === 'true'
    };

    const newPlayer = await addNewPlayer(playerInfo);
    const playerToken = getPlayerToken(newPlayer);

    return res.status(200).send(playerToken);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function signin(req, res) {
  try {
    const { email, password } = req.body;

    const hashedPasswordFromDatabase = await getHashPWDByEmail(email);
    if (!hashedPasswordFromDatabase) {
      return res.status(400).send('400 Bad Request: 帳號或密碼輸入錯誤');
    }

    const isPasswordCorrect = await bcrypt.compare(password, hashedPasswordFromDatabase);
    if (!isPasswordCorrect) {
      // eslint-disable-next-line no-console
      console.error('Password is incorrect');
      return res.status(400).send('400 Bad Request: 帳號或密碼輸入錯誤');
    }

    const player = await getPlayerByEmail(email);
    const playerToken = getPlayerToken(player);

    return res.status(200).send(playerToken);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

function getRandomColorCode() {
  let hexCode = Math.floor(Math.random() * 0xFFFFFF).toString(16);
  while (hexCode.length < 6) {
    hexCode = `0${hexCode}`;
  }
  return `#${hexCode}`;
}

async function generateAnonymousPlayer(req, res) {
  try {
    const nickname = await getAnonymousNickname();
    const anonymousPlayer = {
      nickname,
      representColor: getRandomColorCode()
    };
    return res.status(200).send(anonymousPlayer);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

module.exports = {
  getPlayers,
  getPlayerInfo,
  getPlayerProfile,
  updatePlayerProfile,
  signup,
  signin,
  generateAnonymousPlayer
};
