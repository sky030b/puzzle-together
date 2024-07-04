/* eslint-disable no-console */
const pool = require('./createDatabasePool');
const { invitePlayerJoinGame } = require('./playerGameDatabase');
const { getGameCompletionInfo } = require('./gameDatabase');

async function updatePuzzleLocation(puzzleInfo) {
  try {
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
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function lockPuzzleBySomeone(lockingInfo) {
  try {
    const {
      playerId, isLocked, lockedBy, lockedColor, zIndex, gameId, puzzleId
    } = lockingInfo;
    const updateInfo = [isLocked, lockedBy, lockedColor, zIndex, gameId, puzzleId];
    await pool.query(`
      UPDATE puzzles SET is_locked = ?, locked_by = ?, locked_color = ?, z_index = ? WHERE game_id = ? AND puzzle_id = ?;
    `, updateInfo);

    if (playerId) {
      const invitePLayerResult = await invitePlayerJoinGame(playerId, playerId, gameId);
      if (invitePLayerResult instanceof Error) throw invitePLayerResult;
    }
    const completionInfo = await getGameCompletionInfo(gameId);
    return completionInfo;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function savePuzzleMovementToDB(data) {
  try {
    const values = data.map(item => [
      item.puzzleId,
      item.gameId,
      item.topRatio.toFixed(3),
      item.leftRatio.toFixed(3),
      item.movedColor,
      item.movedAt
    ]);

    const sql = `
      INSERT INTO movements (
        puzzle_id, game_id, top_ratio, left_ratio, moved_color, moved_at
      ) VALUES ?
    `;

    const res = (await pool.query(sql, [values]))[0];
    const { affectedRows } = res;
    return affectedRows;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getPlaybackInfoByGameId(gameId) {
  try {
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
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = {
  updatePuzzleLocation,
  lockPuzzleBySomeone,
  savePuzzleMovementToDB,
  getPlaybackInfoByGameId
};
