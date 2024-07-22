/* eslint-disable no-console */
const pool = require('./createDatabasePool');
const { invitePlayerJoinGame } = require('./playerGameDatabase');
const { getGameCompletionInfo } = require('./gameHelpers');

async function updatePuzzleLocation(puzzleInfo) {
  const {
    topRatio, leftRatio, gameId, puzzleId,
    isLocked, lockedBy, lockedColor, zIndex
  } = puzzleInfo;
  const updateInfo = [
    topRatio, leftRatio, isLocked, lockedBy, lockedColor, zIndex, gameId, puzzleId
  ];
  const res = await pool.query(`
    UPDATE
      puzzles 
    SET 
      top_ratio = ?, left_ratio = ?, is_locked = ?, 
      locked_by = ?, locked_color = ?, z_index = ? 
    WHERE 
      game_id = ? AND puzzle_id = ?;
  `, updateInfo);
  const { affectedRows } = res;
  return affectedRows;
}

async function lockPuzzleBySomeone(lockingInfo) {
  const {
    playerId, isLocked, lockedBy, lockedColor, zIndex, gameId, puzzleId
  } = lockingInfo;
  const updateInfo = [isLocked, lockedBy, lockedColor, zIndex, gameId, puzzleId];
  await pool.query(`
    UPDATE 
      puzzles 
    SET 
      is_locked = ?, locked_by = ?, locked_color = ?, z_index = ? 
    WHERE 
      game_id = ? AND puzzle_id = ?;
  `, updateInfo);

  if (playerId) await invitePlayerJoinGame(playerId, playerId, gameId);

  const completionInfo = await getGameCompletionInfo(gameId);
  return completionInfo;
}

async function savePuzzleMovementToDB(data) {
  const taiwanOffsetSec = 8 * 60 * 60;
  const values = data.map((item) => [
    item.puzzleId,
    item.gameId,
    item.topRatio.toFixed(3),
    item.leftRatio.toFixed(3),
    item.movedColor,
    item.movedAt ? item.movedAt : new Date(Date.now() + taiwanOffsetSec * 1000).toISOString().slice(0, 19).replace('T', ' ')
  ]);

  const sql = `
    INSERT INTO movements (
      puzzle_id, game_id, top_ratio, left_ratio, moved_color, moved_at
    ) VALUES ?
  `;

  const { affectedRows } = (await pool.query(sql, [values]))[0];
  return affectedRows;
}

async function getPlaybackInfoByGameId(gameId) {
  const [playbackInfo] = await pool.query(`
    SELECT 
      *
    FROM 
      movements 
    WHERE 
      game_id = ?
    ORDER BY id;
  `, [gameId]);
  return playbackInfo;
}

module.exports = {
  updatePuzzleLocation,
  lockPuzzleBySomeone,
  savePuzzleMovementToDB,
  getPlaybackInfoByGameId
};
