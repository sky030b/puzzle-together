/* eslint-disable no-console */
const pool = require('./createDatabasePool');

async function getPlayerById(id) {
  try {
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
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getPlayerByPlayerId(playerId) {
  try {
    const [player] = (await pool.query(`
    SELECT 
      player_id, email, nickname, represent_color,
      games_played, games_completed, puzzles_locked, profile
    FROM 
      players 
    WHERE 
      player_id = ?
  `, [playerId]))[0];
    return player;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function setPlayerProfileByPlayerId(playerId, profile) {
  try {
    await pool.query(`
      UPDATE players SET profile = ? WHERE player_id = ?;
    `, [profile, playerId]);
    return 'Update profile done.';
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getPlayerByEmail(email) {
  try {
    const [player] = (await pool.query(`
    SELECT 
      player_id, email, nickname, represent_color, is_room_public,
      games_played, games_completed, puzzles_locked, profile
    FROM 
      players 
    WHERE 
      email = ?
  `, [email]))[0];
    return player;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getHashPWDByEmail(email) {
  try {
    const [player] = (await pool.query(`
    SELECT 
      password 
    From 
      players 
    WHERE 
      email = ?
  `, [email]))[0];

    return player ? player.password : null;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getAllPlayers() {
  try {
    const [players] = await pool.query(`
    SELECT 
      player_id, email, nickname, represent_color, is_room_public,
      games_played, games_completed, puzzles_locked, profile
    FROM 
      players
  `);
    return players;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getAnonymousNickname() {
  try {
    const [nickname] = await pool.query(`
    SELECT animal FROM anonymous_players ORDER BY RAND() LIMIT 1;
  `);
    const { animal } = nickname[0];
    return animal;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function addNewPlayer(info) {
  try {
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
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function invitePlayerJoinGame(inviterId, inviteeId, gameId) {
  try {
    await pool.query(`
      INSERT INTO player_game (
        inviter_id, invitee_id, game_id
      ) VALUES (
        ?, ?, ?
      )
    `, [inviterId, inviteeId, gameId]);
    return `Invite player done with ${inviteeId}-${gameId} record.`;
  } catch (error) {
    console.error(error);
    return error;
  }
}
async function checkoutInvited(playerId, gameId) {
  try {
    const [linkRecord] = await pool.query(`
      SELECT * FROM player_game WHERE invitee_id = ? AND game_id = ?;
    `, [playerId, gameId]);
    console.log(linkRecord);
    return linkRecord;
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = {
  getPlayerById,
  getPlayerByPlayerId,
  setPlayerProfileByPlayerId,
  getPlayerByEmail,
  getHashPWDByEmail,
  getAllPlayers,
  getAnonymousNickname,
  addNewPlayer,
  invitePlayerJoinGame,
  checkoutInvited
};
