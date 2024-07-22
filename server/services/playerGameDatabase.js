const pool = require('./createDatabasePool');

async function invitePlayerJoinGame(inviterId, inviteeId, gameId) {
  await pool.query(`
    INSERT INTO player_game (inviter_id, invitee_id, game_id)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
    is_deleted = IF(is_deleted = 1, 0, is_deleted);    
  `, [inviterId, inviteeId, gameId, inviteeId, gameId]);
  return `Invite player done with ${inviteeId}-${gameId} record.`;
}

async function checkoutInvited(playerId, gameId) {
  const [linkRecord] = await pool.query(`
    SELECT * FROM player_game WHERE invitee_id = ? AND game_id = ? AND is_deleted = 0;
  `, [playerId, gameId]);
  return linkRecord;
}

async function getAllPlayedGamesInfo(playerId) {
  const [gamesInfo] = await pool.query(`
    SELECT g.*,
      p.nickname AS owner_nickname,
      ROUND((SUM(pz.is_locked) / COUNT(pz.puzzle_id)) * 100, 2) AS completion_rate
    FROM games g
    JOIN players p ON g.owner_id = p.player_id
    JOIN puzzles pz ON g.game_id = pz.game_id
    JOIN player_game pg ON g.game_id = pg.game_id
    WHERE pg.invitee_id = ? AND pg.is_deleted = 0
    GROUP BY g.game_id, g.title
    ORDER BY completion_rate DESC;
  `, [playerId]);
  return gamesInfo;
}

async function getMyOwnGamesInfo(playerId) {
  const [gamesInfo] = await pool.query(`
    SELECT g.*,
      ROUND((SUM(pz.is_locked) / COUNT(pz.puzzle_id)) * 100, 2) AS completion_rate
    FROM games g
    JOIN puzzles pz ON g.game_id = pz.game_id
    WHERE g.owner_id = ? AND g.is_deleted = 0
    GROUP BY g.game_id, g.title
    ORDER BY g.create_at DESC;
  `, [playerId]);
  return gamesInfo;
}

module.exports = {
  invitePlayerJoinGame,
  checkoutInvited,
  getAllPlayedGamesInfo,
  getMyOwnGamesInfo
};
