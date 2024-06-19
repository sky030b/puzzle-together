const pool = require('./createDatabasePool');

async function getPlayerById(id) {
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

async function getNickname() {
  const [nickname] = await pool.query(`
    SELECT animal FROM anonymous_players ORDER BY RAND() LIMIT 1;
  `);
  const { animal } = nickname[0];
  return animal;
}

module.exports = { getPlayerById, getAllPlayers, getNickname };