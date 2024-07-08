/* eslint-disable no-console */
const pool = require('./createDatabasePool');

async function invitePlayerJoinGame(inviterId, inviteeId, gameId) {
  try {
    await pool.query(`
      INSERT INTO player_game (inviter_id, invitee_id, game_id)
      SELECT * FROM (SELECT ? AS inviter_id_value, ? AS invitee_id_value, ? AS game_id_value) AS tmp
      WHERE NOT EXISTS (
        SELECT 1 FROM player_game WHERE invitee_id = ? AND game_id = ?
      ) LIMIT 1;
    `, [inviterId, inviteeId, gameId, inviteeId, gameId]);
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
    return linkRecord;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getAllPlayedGamesInfo(playerId) {
  try {
    const [gamesInfo] = await pool.query(`
      SELECT g.*,
        p.nickname AS owner_nickname,
        ROUND((SUM(pz.is_locked) / COUNT(pz.puzzle_id)) * 100, 2) AS completion_rate
      FROM games g
      JOIN players p ON g.owner_id = p.player_id
      JOIN puzzles pz ON g.game_id = pz.game_id
      JOIN player_game pg ON g.game_id = pg.game_id
      WHERE pg.invitee_id = ?
      GROUP BY g.game_id, g.title
      ORDER BY completion_rate DESC;
    `, [playerId]);
    return gamesInfo;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getMyOwnGamesInfo(playerId) {
  try {
    const [gamesInfo] = await pool.query(`
      SELECT g.*,
        ROUND((SUM(pz.is_locked) / COUNT(pz.puzzle_id)) * 100, 2) AS completion_rate
      FROM games g
      JOIN puzzles pz ON g.game_id = pz.game_id
      WHERE g.owner_id = ?
      GROUP BY g.game_id, g.title
      ORDER BY g.create_at DESC;
    `, [playerId]);
    return gamesInfo;
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = {
  invitePlayerJoinGame,
  checkoutInvited,
  getAllPlayedGamesInfo,
  getMyOwnGamesInfo
};
