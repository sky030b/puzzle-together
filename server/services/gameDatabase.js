const { nanoid } = require('nanoid');

const pool = require('./createDatabasePool');
const { uploadToS3 } = require('./createS3Client');

async function getGameBySerialId(id) {
  const [game] = (await pool.query(`
    SELECT 
      *
    FROM 
      games 
    WHERE 
      id = ?
  `, [id]))[0];
  return game;
}

async function getRenderInfoByGameId(gameId) {
  function getOrderedPuzzleInfo(puzzlesArray) {
    const orderedPuzzlesInfo = puzzlesArray.map((puzzleObj) => {
      const {
        puzzle_id: puzzleId, target_id: targetId, top_ratio: topRatio, left_ratio: leftRatio,
        is_locked: isLocked, locked_by: lockedBy, locked_color: lockedColor, locked_at: lockedAt,
        z_index: zIndex
      } = puzzleObj;

      return {
        puzzleId, targetId, topRatio, leftRatio, isLocked, lockedBy, lockedColor, lockedAt, zIndex
      };
    });
    return orderedPuzzlesInfo;
  }

  function getOrderedGameRenderInfo(renderInfoFromDB) {
    const {
      title, question_img_url: questionImgUrl, owner_id: ownerId,
      row_qty: rowQty, col_qty: colQty, difficulty, mode,
      puzzles,
      is_public: isPublic, is_open_when_owner_not_in: isOpenWhenOwnerNotIn,
      play_duration: playDuration, is_completed: isCompleted, completed_at: completedAt
    } = renderInfoFromDB;

    return {
      gameId,
      title,
      questionImgUrl,
      ownerId,
      rowQty,
      colQty,
      difficulty,
      mode,
      puzzles: getOrderedPuzzleInfo(puzzles),
      isPublic,
      isOpenWhenOwnerNotIn,
      playDuration,
      isCompleted,
      completedAt
    };
  }

  const [gameRenderInfo] = (await pool.query(`
    SELECT 
      g.game_id AS game_id, 
      g.title AS title, 
      g.question_img_url AS question_img_url, 
      g.owner_id AS owner_id, 
      g.row_qty AS row_qty, 
      g.col_qty AS col_qty, 
      g.difficulty AS difficulty, 
      g.mode AS mode, 
      p.puzzles AS puzzles, 
      g.is_public AS is_public, 
      g.is_open_when_owner_not_in AS is_open_when_owner_not_in, 
      g.play_duration AS play_duration, 
      g.is_completed AS is_completed, 
      g.completed_at AS completed_at
    FROM 
      games g
    LEFT JOIN 
      (
        SELECT 
          game_id, 
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'puzzle_id', p.puzzle_id, 
              'target_id', p.target_id, 
              'top_ratio', p.top_ratio, 
              'left_ratio', p.left_ratio, 
              'is_locked', p.is_locked, 
              'locked_by', p.locked_by, 
              'locked_color', p.locked_color, 
              'locked_at', p.locked_at, 
              'z_index', p.z_index
            )
          ) AS puzzles
        FROM 
          (
            SELECT 
              game_id, 
              puzzle_id, 
              target_id, 
              top_ratio, 
              left_ratio, 
              is_locked, 
              locked_by, 
              locked_color, 
              locked_at, 
              z_index
            FROM 
              puzzles
            WHERE
              game_id = ?
            ORDER BY 
              target_id ASC
          ) p
        GROUP BY 
          game_id
      ) p ON p.game_id = g.game_id
    WHERE 
      g.game_id = ?;
  `, [gameId, gameId]))[0];

  const orderedGameRenderInfo = getOrderedGameRenderInfo(gameRenderInfo);

  return orderedGameRenderInfo;
}

async function getAllGames() {
  const [games] = await pool.query(`
    SELECT 
      *
    FROM 
      games
  `);
  return games;
}

async function addPuzzlesOfGame(newGame) {
  function getRandomIntAvoidRanges2D(centerAvoidPercent, edgeAvoidPercent) {
    const min = 0 + edgeAvoidPercent;
    const max = 100 - edgeAvoidPercent;

    const centerStart = 50 - centerAvoidPercent / 2;
    const centerEnd = 50 + centerAvoidPercent / 2;

    function isInAvoidRange(value) {
      return (value >= centerStart && value <= centerEnd)
        || (value <= min)
        || (value >= max);
    }

    let leftRatio;
    let topRatio;
    do {
      leftRatio = Math.floor(Math.random() * (max - min + 1)) + min;
      topRatio = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (isInAvoidRange(leftRatio) && isInAvoidRange(topRatio));

    return { leftRatio, topRatio };
  }

  try {
    const { game_id: gameId, row_qty: rowQty, col_qty: colQty } = newGame;

    const targetPuzzlePairingObject = {};
    Array(rowQty * colQty).fill().forEach((_, index) => {
      targetPuzzlePairingObject[index + 1] = nanoid(10);
    });

    const puzzlesInfo = Object.keys(targetPuzzlePairingObject).map((targetId) => {
      const { topRatio, leftRatio } = getRandomIntAvoidRanges2D(20, 20);
      return [
        gameId, targetPuzzlePairingObject[targetId], targetId,
        topRatio, leftRatio
      ];
    });

    const sql = `
      INSERT INTO puzzles (
        game_id, puzzle_id, target_id, 
        top_ratio, left_ratio
      ) VALUES ?
    `;

    const res = await pool.query(sql, [puzzlesInfo]);
    const { affectedRows } = res;
    return affectedRows;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function addNewGame(file, info) {
  try {
    const gameId = nanoid(10);
    const questionImgUrl = await uploadToS3(file);

    const {
      title, ownerId, rowQty, colQty, difficulty, mode, isPublic, isOpenWhenOwnerNotIn
    } = info;

    const gameInfo = [
      gameId, title, questionImgUrl, ownerId, rowQty, colQty,
      difficulty, mode, isPublic, isOpenWhenOwnerNotIn
    ];

    const [{ insertId: id }] = await pool.query(`
      INSERT INTO games (
        game_id, title, question_img_url, owner_id, row_qty, col_qty, 
        difficulty, mode, is_public, is_open_when_owner_not_in
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `, gameInfo);

    const newGame = await getGameBySerialId(id);
    await addPuzzlesOfGame(newGame);

    return newGame;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function updatePuzzleLocation(puzzleInfo) {
  try {
    const {
      topRatio, leftRatio, gameId, puzzleId
    } = puzzleInfo;
    const updateInfo = [topRatio, leftRatio, gameId, puzzleId];
    const res = await pool.query(`
      UPDATE puzzles SET top_ratio = ?, left_ratio = ? WHERE game_id = ? AND puzzle_id = ?;
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
      isLocked, lockedBy, lockedColor, zIndex, gameId, puzzleId
    } = lockingInfo;
    const updateInfo = [isLocked, lockedBy, lockedColor, zIndex, gameId, puzzleId];
    const res = await pool.query(`
      UPDATE puzzles SET is_locked = ?, locked_by = ?, locked_color = ?, z_index = ? WHERE game_id = ? AND puzzle_id = ?;
    `, updateInfo);
    const { affectedRows } = res;
    return affectedRows;
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = {
  getRenderInfoByGameId, getAllGames, addNewGame, updatePuzzleLocation, lockPuzzleBySomeone
};
