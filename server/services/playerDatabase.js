const pool = require('./createDatabasePool');

async function getPlayerById(id) {
  const [player] = (await pool.query(`
    SELECT 
      player_id, email, nickname, represent_color, is_room_public, profile
    FROM 
      players 
    WHERE 
      id = ?
  `, [id]))[0];
  return player;
}

async function getPlayerByPlayerId(playerId) {
  const [player] = (await pool.query(`
    SELECT 
      p.player_id, 
      p.email, 
      p.nickname, 
      p.represent_color,
      (SELECT COUNT(*) 
        FROM player_game pg 
        WHERE 
          pg.invitee_id = p.player_id 
          AND pg.is_deleted = 0) AS games_played,
      (SELECT COUNT(*) 
        FROM player_game pg
        JOIN games g ON pg.game_id = g.game_id
        WHERE 
          pg.invitee_id = p.player_id 
          AND g.is_completed = 1 
          AND pg.is_deleted = 0) AS games_completed,
      (SELECT COUNT(*)
        FROM puzzles pu
        WHERE pu.locked_by = p.nickname) AS puzzles_locked,
      p.profile
    FROM 
      players p 
    WHERE 
      p.player_id = ?;
`, [playerId]))[0];

  if (!player) return new Error('找不到指定玩家的資訊。');

  return player;
}

async function setPlayerProfileByPlayerId(playerId, data) {
  const { representColor, profile } = data;
  await pool.query(`
    UPDATE players SET represent_color = ?, profile = ? WHERE player_id = ?;
  `, [representColor, profile, playerId]);
  return 'Update profile done.';
}

async function getPlayerByEmail(email) {
  const [player] = (await pool.query(`
    SELECT 
      player_id, email, nickname, represent_color, is_room_public, profile
    FROM 
      players 
    WHERE 
      email = ?
  `, [email]))[0];
  return player;
}

async function getHashPWDByEmail(email) {
  const [player] = (await pool.query(`
    SELECT 
      password 
    From 
      players 
    WHERE 
      email = ?
  `, [email]))[0];

  return player ? player.password : null;
}

async function getAllPlayers() {
  const [players] = await pool.query(`
    SELECT 
      player_id, email, nickname, represent_color, is_room_public, profile
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
  return newPlayer;
}

module.exports = {
  getPlayerById,
  getPlayerByPlayerId,
  setPlayerProfileByPlayerId,
  getPlayerByEmail,
  getHashPWDByEmail,
  getAllPlayers,
  getAnonymousNickname,
  addNewPlayer
};
