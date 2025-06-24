const redis = require('../config/redisClient');

function getLeaderboardKey(region, gameMode) {
  return `leaderboard:${region}:${gameMode}`;
}

async function updatePlayerScore({ playerId, score, region, gameMode }) {
  const key = getLeaderboardKey(region, gameMode);
  await redis.zAdd(key, [{ score: Number(score), value: playerId }]);
  // Set TTL to expire at midnight if not set
  const ttl = await redis.ttl(key);
  if (ttl === -1) {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const secondsUntilMidnight = Math.floor((midnight - now) / 1000);
    await redis.expire(key, secondsUntilMidnight);
  }
}

async function getTopPlayers({ topN, region, gameMode }) {
  const key = getLeaderboardKey(region, gameMode);
const players = await redis.zRevRangeWithScores(key, 0, topN - 1);
  return players;
}

async function resetLeaderboard() {
  // Optionally, scan and delete all leaderboard keys
  const keys = await redis.keys('leaderboard:*');
  if (keys.length) await redis.del(keys);
}

module.exports = {
  updatePlayerScore,
  getTopPlayers,
  resetLeaderboard,
};