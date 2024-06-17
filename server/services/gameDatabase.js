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
        puzzle_id, target_id, top_ratio, left_ratio,
        is_locked, locked_by, locked_color, locked_at, z_index
      } = puzzleObj;

      return {
        puzzle_id, target_id, top_ratio, left_ratio,
        is_locked, locked_by, locked_color, locked_at, z_index
      };
    })
    return orderedPuzzlesInfo;
  }


  function getOrderedGameRenderInfo(renderInfoFromDB) {
    const {
      game_id, title, question_img_url, owner_id,
      row_qty, col_qty, difficulty, mode,
      puzzles,
      is_public, is_open_when_owner_not_in,
      play_duration, is_completed, completed_at
    } = renderInfoFromDB;

    return {
      game_id, title, question_img_url, owner_id,
      row_qty, col_qty, difficulty, mode,
      puzzles: getOrderedPuzzleInfo(puzzles),
      is_public, is_open_when_owner_not_in,
      play_duration, is_completed, completed_at
    }
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
          ) AS puzzles,
          p.game_id AS game_id
        FROM 
          games g
        LEFT JOIN 
          puzzles p 
          ON p.game_id = g.game_id
        GROUP BY 
          p.game_id
      ) p ON p.game_id = g.game_id
    WHERE 
      g.game_id = ?;
  `, [gameId]))[0];

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

async function addNewGame(file, info) {
  try {
    const game_id = nanoid(10);
    const question_img_url = await uploadToS3(file);

    const {
      title, owner_id, row_qty, col_qty, difficulty, mode,
      is_public, is_open_when_owner_not_in
    } = info;

    const gameInfo = [
      game_id, title, question_img_url, owner_id, row_qty, col_qty,
      difficulty, mode, is_public, is_open_when_owner_not_in
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

async function addPuzzlesOfGame(newGame) {

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  try {
    const { game_id, row_qty, col_qty } = newGame;

    const targetPuzzlePairingObject = {};
    Array(row_qty * col_qty).fill().forEach((_, index) => targetPuzzlePairingObject[index + 1] = nanoid(10));

    const puzzlesInfo = Object.keys(targetPuzzlePairingObject).map((targetId) =>
      [
        game_id, targetPuzzlePairingObject[targetId], targetId,
        getRandomInt(30, 70),
        getRandomInt(30, 70)
      ]
    );

    const sql = `
      INSERT INTO puzzles (
        game_id, puzzle_id, target_id, 
        top_ratio, 
        left_ratio
      ) VALUES ?
    `;

    await pool.query(sql, [puzzlesInfo]);
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function updatePuzzleLocation(puzzleInfo) {
  try {
    const { topRatio, leftRatio, gameId, puzzleId } = puzzleInfo;
    const updateInfo = [topRatio, leftRatio, gameId, puzzleId];
    await pool.query(`
      UPDATE puzzles SET top_ratio = ?, left_ratio = ? WHERE game_id = ? AND puzzle_id = ?;
    `, updateInfo);
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function lockPuzzleBySomeone(lockingInfo) {
  try {
    const { isLocked, lockedBy, lockedColor, zIndex, gameId, puzzleId } = lockingInfo;
    const updateInfo = [isLocked, lockedBy, lockedColor, zIndex, gameId, puzzleId];
    await pool.query(`
      UPDATE puzzles SET is_locked = ?, locked_by = ?, locked_color = ?, z_index = ? WHERE game_id = ? AND puzzle_id = ?;
    `, updateInfo);
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = { getRenderInfoByGameId, getAllGames, addNewGame, updatePuzzleLocation, lockPuzzleBySomeone };
