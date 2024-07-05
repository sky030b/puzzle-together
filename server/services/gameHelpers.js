const pool = require('./createDatabasePool');

async function getGameCompletionInfo(gameId) {
  try {
    const [gameStatus] = (await pool.query(`
      SELECT 
        COUNT(CASE WHEN is_locked = 1 THEN 1 END) AS locked_puzzles,
        COUNT(*) AS total_puzzles
      FROM 
        puzzles
      WHERE 
        game_id = ?;
    `, [gameId]))[0];
    const { locked_puzzles: lockedPuzzles, total_puzzles: totalPuzzles } = gameStatus;
    if (!totalPuzzles) return new Error('找不到指定關卡，請重新輸入遊戲關卡 ID。');

    const completionInfo = {
      lockedPuzzles,
      totalPuzzles,
      isCompleted: lockedPuzzles === totalPuzzles
    };

    return completionInfo;
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = {
  getGameCompletionInfo,
};
