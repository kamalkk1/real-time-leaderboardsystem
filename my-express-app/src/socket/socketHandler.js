const leaderboardService = require('../services/leaderboardService');

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('player:scoreUpdate', async (payload) => {
      await leaderboardService.updatePlayerScore(payload);
      const { region, gameMode } = payload;
      const topPlayers = await leaderboardService.getTopPlayers({ topN: 10, region, gameMode });
      io.to(`${region}:${gameMode}`).emit('leaderboard:update', topPlayers);
    });

    socket.on('leaderboard:fetch', async ({ topN, region, gameMode }) => {
      socket.join(`${region}:${gameMode}`);
      const topPlayers = await leaderboardService.getTopPlayers({ topN, region, gameMode });
      socket.emit('leaderboard:update', topPlayers);
    });
  });
};