const { nanoid } = require('nanoid');

const pool = require('./createDatabasePool');
const { uploadToS3 } = require('./createS3Client');

async function getGameBySerialID(id) {
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

async function getGameByRandomCharsID(gameId) {
  const [game] = (await pool.query(`
    SELECT 
      *
    FROM 
      games 
    WHERE 
      game_id = ?
  `, [gameId]))[0];
  return game;
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
  // function changeTrueTo1(originalArray) {
  //   return originalArray
  //     .map((item) => item === true ? 1 : item)
  //     .map((item) => item === false ? 0 : item);
  // }

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

    const newGame = await getGameBySerialID(id);
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

    const canvaHorizontalMidpoint = process.env.CANVA_WIDTH / 2;
    const canvaVerticalMidpoint = process.env.CANVA_HEIGHT / 2;
    const targetBaseSize = process.env.TARGET_BASE_SIZE;

    const targetPuzzlePairingObject = {};
    Array(row_qty * col_qty).fill().forEach((_, index) => targetPuzzlePairingObject[index + 1] = nanoid(10));

    const puzzlesInfo = Object.keys(targetPuzzlePairingObject).map((targetId) =>
      [
        game_id, targetPuzzlePairingObject[targetId], targetId,
        getRandomInt(canvaHorizontalMidpoint - targetBaseSize * 4 / 3, canvaHorizontalMidpoint + targetBaseSize * 4 / 3),
        getRandomInt(canvaVerticalMidpoint - targetBaseSize * 3 / 2, canvaVerticalMidpoint + targetBaseSize * 3 / 2)
      ]
    );

    const sql = `
      INSERT INTO puzzles (
        game_id, puzzle_id, target_id, 
        top_position, 
        left_position
      ) VALUES ?
    `;

    await pool.query(sql, [puzzlesInfo]);
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = { getGameBySerialID, getAllGames, addNewGame };
