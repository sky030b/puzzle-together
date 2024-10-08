/* eslint-disable no-console */
const Redis = require('ioredis');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isDevelopment = process.env.NODE_ENV === 'dev';

// redis client
const redisConfig = {
  host: isDevelopment ? process.env.EC2_REDIS_HOST : process.env.AWS_ELASTICACHE_HOST,
  port: isDevelopment ? process.env.EC2_REDIS_PORT : process.env.AWS_ELASTICACHE_PORT,
  password: isDevelopment ? process.env.EC2_REDIS_PASSWORD : undefined
};

if (!redisConfig.password) delete redisConfig.password;

const redisClient = new Redis(redisConfig);

// mysql pool
const pool = mysql.createPool({
  host: isDevelopment ? process.env.MYSQL_HOST : process.env.RDS_MYSQL_HOST,
  user: isDevelopment ? process.env.MYSQL_USER : process.env.RDS_MYSQL_USER,
  password: isDevelopment ? process.env.MYSQL_PASSWORD : process.env.RDS_MYSQL_PASSWORD,
  database: isDevelopment ? process.env.MYSQL_DATABASE : process.env.RDS_MYSQL_DATABASE
});

async function savePuzzleMovementToDB(data) {
  if (!data.length) return 0;

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

  const res = (await pool.query(sql, [values]))[0];
  const { affectedRows } = res;
  return affectedRows;
}

async function savePuzzleMovementToDBWithPrefix(redisMovementKeyPrefix) {
  if (redisClient.status !== 'ready') return new Error('redisClient is not ready.');

  const luaScript = `
    local keys = redis.call('keys', ARGV[1])
    local result = {}
    for _, key in ipairs(keys) do
      local movementsInfo = redis.call('lrange', key, 0, -1)
      redis.call('del', key)
      for _, movementInfo in ipairs(movementsInfo) do
        table.insert(result, {key, movementInfo})
      end
    end
    return result
  `;

  const res = await redisClient.eval(luaScript, 0, `${redisMovementKeyPrefix}*`);

  const dataToWrite = res.map(([, movementInfo]) => JSON.parse(movementInfo));
  await savePuzzleMovementToDB(dataToWrite);

  return 'savePuzzleMovementToDBWithPrefix Done.';
}

redisClient.on('ready', async () => {
  console.log('redisClient is ready.');

  try {
    const updateIntervalSec = 30 * 60;
    setInterval(async () => {
      try {
        const saveToDBResult = await savePuzzleMovementToDBWithPrefix('movement-');
        console.log(saveToDBResult);
      } catch (error) {
        console.error('Error in setInterval task:', error);
      }
    }, updateIntervalSec * 1000);

    const saveToDBResult = await savePuzzleMovementToDBWithPrefix('movement-');
    console.log(saveToDBResult);
  } catch (error) {
    console.error('Error in redisClient ready event or first save process:', error);
  }
});
