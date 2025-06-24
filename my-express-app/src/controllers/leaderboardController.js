const leaderboardService = require('../services/leaderboardService');

exports.scoreUpdate = async (req, res) => {
  const { playerId, score, region, gameMode } = req.body;
  await leaderboardService.updatePlayerScore({ playerId, score, region, gameMode });
  res.json({ success: true });
};

exports.fetchLeaderboard = async (req, res) => {
  const { topN, region, gameMode } = req.query;
const players = await leaderboardService.getTopPlayers({
  topN: Number(topN),
  region,
  gameMode
});
  res.json(players);
};