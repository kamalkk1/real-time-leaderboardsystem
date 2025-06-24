const { createClient } = require('redis');

if (!process.env.REDIS_URL) {
  throw new Error('❌ REDIS_URL is not set. Make sure Redis plugin is connected in Railway.');
}

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error', err);
});

(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Connected to Redis');
  } catch (e) {
    console.error('❌ Failed to connect to Redis:', e);
  }
})();

module.exports = redisClient;
