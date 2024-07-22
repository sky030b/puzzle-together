/* eslint-disable no-console */
const { nanoid } = require('nanoid');

const pool = require('./createDatabasePool');
const { uploadToS3 } = require('./createS3Client');
const { invitePlayerJoinGame } = require('./playerGameDatabase');
const { savePuzzleMovementToDB } = require('./puzzleDatabase');

async function getGamePublicInfo(gameId) {
  try {
    const [game] = (await pool.query(`
      SELECT 
        is_public
      FROM 
        games 
      WHERE 
        game_id = ?;
    `, [gameId]))[0];

    if (!game) throw new Error('找不到指定關卡的資訊。');

    const { is_public: isPublic } = game;
    return isPublic;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getGameBySerialId(id) {
  try {
    const [game] = (await pool.query(`
      SELECT 
        *
      FROM 
        games 
      WHERE 
        id = ? AND is_deleted = 0;
    `, [id]))[0];
    return game;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getGameOwnerIdByGameId(gameId) {
  try {
    const [game] = (await pool.query(`
      SELECT 
        owner_id
      FROM 
        games 
      WHERE 
        game_id = ? AND is_deleted = 0;
    `, [gameId]))[0];

    if (!game) return new Error('找不到指定關卡的資訊。');

    const { owner_id: ownerId } = game;
    return ownerId;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function updateGameBasicSetting(updateInfo) {
  try {
    const {
      title, difficulty, isPublic, gameId
    } = updateInfo;
    await pool.query(`
      UPDATE games SET title = ?, difficulty = ?, is_public = ? WHERE game_id = ?;
    `, [title, difficulty, isPublic, gameId]);
    return 'updateGameDurationByGameId done.';
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function deleteMyOwnGameByGameId(gameId) {
  try {
    await pool.query(`
      UPDATE games SET title = CONCAT(title, ' - deleted - ', CURRENT_TIMESTAMP), is_deleted = 1 WHERE game_id = ?;
    `, [gameId]);

    await pool.query(`
      UPDATE player_game SET is_deleted = 1 WHERE game_id = ?;
    `, [gameId]);
    return 'deleteMyOwnGameByGameId done.';
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getGameDurationByGameId(gameId) {
  try {
    const [game] = (await pool.query(`
      SELECT 
        play_duration, is_completed
      FROM 
        games 
      WHERE 
        game_id = ?;
    `, [gameId]))[0];
    return game;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function updateGameDurationByGameId(gameId, playDuration) {
  try {
    await pool.query(`
      UPDATE games SET play_duration = ? WHERE game_id = ?;
    `, [playDuration, gameId]);
    return 'updateGameDurationByGameId done.';
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getRenderInfoByGameId(gameId) {
  function getOrderedPuzzleInfo(puzzlesArray) {
    const orderedPuzzlesInfo = puzzlesArray.map((puzzleObj) => {
      const {
        puzzle_id: puzzleId, target_id: targetId, top_ratio: topRatio, left_ratio: leftRatio,
        is_locked: isLocked, locked_by: lockedBy, locked_color: lockedColor, z_index: zIndex
      } = puzzleObj;

      return {
        puzzleId, targetId, topRatio, leftRatio, isLocked, lockedBy, lockedColor, zIndex
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

  try {
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

    if (!gameRenderInfo) return new Error('找不到指定關卡的資訊。');

    const orderedGameRenderInfo = getOrderedGameRenderInfo(gameRenderInfo);

    return orderedGameRenderInfo;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getAllGames() {
  try {
    const [games] = await pool.query(`
      SELECT 
        *
      FROM 
        games
      WHERE
        is_deleted = 0;
    `);
    return games;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getAllPublicGames() {
  try {
    const [publicGames] = await pool.query(`
      SELECT 
        g.*,
        p.nickname AS owner_nickname,
        ROUND((SUM(pz.is_locked) / COUNT(pz.puzzle_id)) * 100, 2) AS completion_rate
      FROM 
        games g
      JOIN 
        players p 
        ON g.owner_id = p.player_id
      JOIN 
        puzzles pz 
        ON g.game_id = pz.game_id
      WHERE
        g.is_deleted = 0 AND g.is_public = 1
      GROUP BY 
        g.game_id, g.title
      ORDER BY g.create_at DESC;
    `);
    return publicGames;
  } catch (error) {
    console.error(error);
    return error;
  }
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

    const targetPuzzlePairingObj = {};
    Array(rowQty * colQty).fill().forEach((_, index) => {
      targetPuzzlePairingObj[index + 1] = nanoid(10);
    });

    const puzzlesInfoObj = Object.keys(targetPuzzlePairingObj).map((targetId) => {
      const centerAvoidPercent = 15;
      const edgeAvoidPercent = 25;
      const {
        topRatio, leftRatio
      } = getRandomIntAvoidRanges2D(centerAvoidPercent, edgeAvoidPercent);

      return {
        gameId,
        puzzleId: targetPuzzlePairingObj[targetId],
        targetId,
        topRatio,
        leftRatio
      };
    });

    const values = puzzlesInfoObj.map((puzzlesInfo) => [
      puzzlesInfo.gameId,
      puzzlesInfo.puzzleId,
      puzzlesInfo.targetId,
      puzzlesInfo.topRatio.toFixed(3),
      puzzlesInfo.leftRatio.toFixed(3)
    ]);

    const sql = `
      INSERT INTO puzzles (
        game_id, puzzle_id, target_id, 
        top_ratio, left_ratio
      ) VALUES ?
    `;

    const res = await pool.query(sql, [values]);
    const { affectedRows } = res;
    // console.log(targetPuzzlePairingObj, puzzlesInfoObj)
    await savePuzzleMovementToDB(puzzlesInfoObj);
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

    await invitePlayerJoinGame(ownerId, ownerId, gameId);

    return newGame;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function updateGameIsCompletedStatus(gameId, isCompleted = 1) {
  try {
    const res = await pool.query(`
      UPDATE
        games 
      SET 
        is_completed = ? 
      WHERE 
        game_id = ?;
    `, [isCompleted, gameId]);
    const { affectedRows } = res;
    return affectedRows;
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = {
  getGamePublicInfo,
  getGameOwnerIdByGameId,
  updateGameBasicSetting,
  deleteMyOwnGameByGameId,
  getGameDurationByGameId,
  updateGameDurationByGameId,
  getRenderInfoByGameId,
  getAllGames,
  getAllPublicGames,
  addNewGame,
  updateGameIsCompletedStatus
};
