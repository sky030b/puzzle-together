/* eslint-disable no-console */
const pool = require('./createDatabasePool');

async function getMessageById(id) {
  try {
    const [message] = (await pool.query(`
    SELECT 
      *
    FROM 
      chat_logs 
    WHERE 
      id = ?
  `, [id]))[0];
    return message;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getChatHistoryByGameId(gameId) {
  try {
    const [chatHistory] = await pool.query(`
    SELECT 
      c.player_id AS player_id,
      p.nickname AS nickname,
      c.message AS message,
      c.create_at AS create_at
    FROM 
      chat_logs c
    LEFT JOIN
      players p
    ON
      p.player_id = c.player_id
    WHERE
      game_id = ?
    ORDER BY
      create_at ASC;
  `, gameId);
    return chatHistory;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function addNewMessageToGame(info) {
  try {
    const {
      gameId, playerId, message
    } = info;

    const messageInfo = [
      gameId, playerId, message
    ];

    const [{ insertId: id }] = await pool.query(`
    INSERT INTO chat_logs (
      game_id, player_id, message
    ) VALUES (
      ?, ?, ?
    )
  `, messageInfo);

    const newMessage = await getMessageById(id);
    return newMessage;
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = { getChatHistoryByGameId, addNewMessageToGame };