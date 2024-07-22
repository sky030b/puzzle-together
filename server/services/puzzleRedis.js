/* eslint-disable no-console */
const redisClient = require('./createRedisClient');
const { savePuzzleMovementToDB } = require('./puzzleDatabase');

async function savePuzzleMovementToRedis(movementInfo) {
  if (redisClient.status !== 'ready') return new Error('redisClient is not ready.');

  const {
    gameId, puzzleId, leftRatio, topRatio, movedColor, movedAt
  } = movementInfo;
  const saveInfo = {
    gameId, puzzleId, leftRatio, topRatio, movedColor, movedAt
  };
  await redisClient.rpush(`movement-${gameId}`, JSON.stringify(saveInfo));

  return 'savePuzzleMovementToRedis Done';
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

module.exports = { savePuzzleMovementToRedis, savePuzzleMovementToDBWithPrefix };
