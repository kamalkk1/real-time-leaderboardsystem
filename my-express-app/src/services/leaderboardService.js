const redis = require('../config/redisClient');

function getLeaderboardKey(region, gameMode) {
  return `leaderboard:${region}:${gameMode}`;
}

function getPlayerKey(playerId) {
  return `player:${playerId}`;
}

async function updatePlayerScore({ playerId, playerName, score, region, gameMode }) {
  const key = getLeaderboardKey(region, gameMode);
  const playerKey = getPlayerKey(playerId);

  // Strict score validation
  const numericScore = Number(score);
  if (isNaN(numericScore)) {
    throw new TypeError('Invalid argument type: score must be a number');
  }

  // Start a Redis transaction
  const multi = redis.multi();
  
  // Update player's score in the sorted set
  multi.zAdd(key, [{ score: numericScore, value: playerId }]);
  
  // Store player details in a hash
  multi.hSet(playerKey, {
    name: playerName,
    lastActive: Date.now(),
    currentRegion: region,
    currentGameMode: gameMode,
    lastScore: numericScore
  });

  // Set TTL for player details (48 hours)
  multi.expire(playerKey, 48 * 60 * 60);

  // Set TTL to expire at midnight if not set
  const ttl = await redis.ttl(key);
  if (ttl === -1) {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const secondsUntilMidnight = Math.floor((midnight - now) / 1000);
    multi.expire(key, secondsUntilMidnight);
  }

  // Execute transaction
  await multi.exec();

  // Get player's current rank
  const rank = await redis.zRevRank(key, playerId);
  return { rank: rank + 1 }; // Redis ranks are 0-based
}

async function getTopPlayers({ topN, region, gameMode }) {
  const key = getLeaderboardKey(region, gameMode);
  
  // Get top players with scores
  const raw = await redis.zRange(key, 0, topN - 1, { REV: true, WITHSCORES: true });
  
  // Convert raw data and fetch player details
  const players = [];
  const multi = redis.multi();
  
  for (let i = 0; i < raw.length; i += 2) {
    const playerId = raw[i];
    const score = Number(raw[i + 1]);
    multi.hGetAll(getPlayerKey(playerId));
  }

  const playerDetails = await multi.exec();
  
  for (let i = 0; i < raw.length; i += 2) {
    const playerId = raw[i];
    const score = Number(raw[i + 1]);
    // Defensive: check if playerDetails[i/2] exists and is an array
    const detailsArr = playerDetails[i/2];
    const details = (detailsArr && typeof detailsArr[1] === 'object' && detailsArr[1] !== null) ? detailsArr[1] : {};
    if (Object.keys(details).length > 0) {
      players.push({
        rank: i/2 + 1,
        playerId,
        playerName: details.name,
        score,
        lastActive: Number(details.lastActive)
      });
    } else {
      // Fallback: still include player with minimal info
      players.push({
        rank: i/2 + 1,
        playerId,
        playerName: playerId,
        score,
        lastActive: null
      });
    }
  }
  
  return players;
}

async function getPlayerStats(playerId, { region, gameMode }) {
  const key = getLeaderboardKey(region, gameMode);
  const playerKey = getPlayerKey(playerId);
  
  const [rank, score, details] = await Promise.all([
    redis.zRevRank(key, playerId),
    redis.zScore(key, playerId),
    redis.hGetAll(playerKey)
  ]);

  if (!score) return null;

  return {
    rank: rank + 1,
    score: Number(score),
    ...details,
    lastActive: Number(details.lastActive)
  };
}

async function resetLeaderboard() {
  // Get all leaderboard keys
  const keys = await redis.keys('leaderboard:*');
  if (keys.length) {
    // Archive yesterday's leaderboards before deleting
    const multi = redis.multi();
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const yesterday = date.toISOString().split('T')[0];
    
    for (const key of keys) {
      // Copy to archive with date
      multi.rename(key, `${key}:${yesterday}`);
      // Set archive to expire after 7 days
      multi.expire(`${key}:${yesterday}`, 7 * 24 * 60 * 60);
    }
    
    await multi.exec();
  }
}

module.exports = {
  updatePlayerScore,
  getTopPlayers,
  getPlayerStats,
  resetLeaderboard,
};