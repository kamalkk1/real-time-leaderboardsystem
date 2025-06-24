require('dotenv').config();
const { createClient } = require('redis');

const env = process.env.ENV || 'production';
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('❌ REDIS_URL not set!');
}

console.log(`🔌 Connecting to Redis [${env}]: ${redisUrl}`);

const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (e) {
    console.error('❌ Redis connection failed:', e);
  }
})();

module.exports = redisClient;
