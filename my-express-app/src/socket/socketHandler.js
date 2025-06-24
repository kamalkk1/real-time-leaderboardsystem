const leaderboardService = require('../services/leaderboardService');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('⚡ New client connected');
    let currentRoom = null;

    socket.on('player:scoreUpdate', async (payload) => {
      try {
        // Validate payload
        if (!payload.playerId || !payload.playerName) {
          socket.emit('error', 'Missing player information');
          return;
        }

        payload.score = Number(payload.score);
        if (isNaN(payload.score) || payload.score === null) {
          socket.emit('error', 'Invalid score value');
          return;
        }

        // Update score and get new rank
        const { rank } = await leaderboardService.updatePlayerScore(payload);
        const { region, gameMode } = payload;

        // Send personal update to the player
        socket.emit('player:rankUpdate', { rank, score: payload.score });

        // Get and broadcast updated leaderboard
        const topPlayers = await leaderboardService.getTopPlayers({ 
          topN: 10, 
          region, 
          gameMode 
        });
        
        io.to(`${region}:${gameMode}`).emit('leaderboard:update', topPlayers);

      } catch (error) {
        console.error('❌ Socket scoreUpdate failed:', error);
        socket.emit('error', 'Score update failed');
      }
    });

socket.on('leaderboard:fetch', async ({ topN = 10, region, gameMode }) => {
  try {
    // Validate required fields
    if (!region || !gameMode) {
      return socket.emit('error', 'Region and gameMode are required');
    }

    const newRoom = `${region}:${gameMode}`;

    // Leave previous room if switching
    if (currentRoom && currentRoom !== newRoom) {
      socket.leave(currentRoom);
      console.log(`👋 Left room: ${currentRoom}`);
    }

    // Join new room
    currentRoom = newRoom;
    socket.join(currentRoom);
    console.log(`🚪 Joined room: ${currentRoom}`);

    // Fetch top players
    const topPlayers = await leaderboardService.getTopPlayers({
      topN,
      region,
      gameMode
    });

    // Emit only to this socket (not broadcast)
    socket.emit('leaderboard:update', topPlayers);
    console.log(`📤 Sent leaderboard:update to ${currentRoom}`, topPlayers);
  } catch (error) {
    console.error('❌ Socket leaderboard:fetch failed:', error);
    socket.emit('error', 'Leaderboard fetch failed');
  }
});

    socket.on('player:stats', async ({ playerId, region, gameMode }) => {
      try {
        const stats = await leaderboardService.getPlayerStats(playerId, { 
          region, 
          gameMode 
        });
        
        if (!stats) {
          socket.emit('error', 'Player not found');
          return;
        }
        
        socket.emit('player:statsUpdate', stats);
      } catch (error) {
        console.error('❌ Socket player:stats failed:', error);
        socket.emit('error', 'Failed to fetch player stats');
      }
    });

    socket.on('disconnect', () => {
      if (currentRoom) {
        socket.leave(currentRoom);
      }
      console.log('🔌 Client disconnected');
    });
  });
};