const pool = require('./createDatabasePool');

async function getPlayerByID(id) {
  const [player] = (await pool.query(`
    SELECT 
      *
    FROM 
      players 
    WHERE 
      id = ?
  `, [id]))[0];
  return player;
}

async function getAllPlayers() {
  const [players] = await pool.query(`
    SELECT 
      *
    FROM 
      players
  `);
  return players;
}


module.exports = { getPlayerByID, getAllPlayers };