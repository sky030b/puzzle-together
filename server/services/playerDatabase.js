const jwt = require('jsonwebtoken');
const pool = require('./createDatabasePool');

async function getPlayerById(id) {
  const [player] = (await pool.query(`
    SELECT 
      player_id, email, nickname, represent_color, is_room_public,
      games_played, games_completed, puzzles_locked, profile
    FROM 
      players 
    WHERE 
      id = ?
  `, [id]))[0];
  return player;
}

async function getAllPlayers() {
  const [players] = await pool.query(`
    SELECT 
      player_id, email, nickname, represent_color, is_room_public,
      games_played, games_completed, puzzles_locked, profile
    FROM 
      players
  `);
  return players;
}

async function getAnonymousNickname() {
  const [nickname] = await pool.query(`
    SELECT animal FROM anonymous_players ORDER BY RAND() LIMIT 1;
  `);
  const { animal } = nickname[0];
  return animal;
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

async function addNewPlayer(info) {
  const {
    playerId, email, hashedPassword, nickname, representColor, isRoomPublic
  } = info;

  const playerInfo = [
    playerId, email, hashedPassword, nickname, representColor, isRoomPublic
  ];

  const [{ insertId: id }] = await pool.query(`
    INSERT INTO players (
      player_id, email, password, nickname, represent_color, is_room_public
    ) VALUES (
      ?, ?, ?, ?, ?, ?
    )
  `, playerInfo);

  const newPlayer = await getPlayerById(id);
  return getPlayerToken(newPlayer);
}

module.exports = {
  getPlayerById, getAllPlayers, getAnonymousNickname, addNewPlayer
};
