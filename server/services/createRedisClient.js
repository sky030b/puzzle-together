const Redis = require('ioredis');

// for localhost
// const redisClient = new Redis({
//   host: process.env.EC2_REDIS_HOST,
//   port: process.env.EC2_REDIS_PORT,
//   password: process.env.EC2_REDIS_PASSWORD
// });

// for ElasticCache
const redisClient = new Redis({
  host: process.env.AWS_ELASTICACHE_HOST,
  port: process.env.AWS_ELASTICACHE_PORT
});

module.exports = redisClient;
