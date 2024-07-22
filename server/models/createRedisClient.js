const Redis = require('ioredis');

const isDevelopment = process.env.NODE_ENV === 'dev';

const redisConfig = {
  host: isDevelopment ? process.env.EC2_REDIS_HOST : process.env.AWS_ELASTICACHE_HOST,
  port: isDevelopment ? process.env.EC2_REDIS_PORT : process.env.AWS_ELASTICACHE_PORT,
  password: isDevelopment ? process.env.EC2_REDIS_PASSWORD : undefined
};

if (!redisConfig.password) delete redisConfig.password;

const redisClient = new Redis(redisConfig);

module.exports = redisClient;
