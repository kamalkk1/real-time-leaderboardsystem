require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');
const socketHandler = require('./src/socket/socketHandler');
const leaderboardService = require('./src/services/leaderboardService');
const cron = require('node-cron');

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'https://verdant-zuccutto-3b00e7.netlify.app', 
  'http://localhost:3000', 
];
app.use(cors({ origin: allowedOrigins, credentials: true }));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api/leaderboard', leaderboardRoutes);

// Socket.io
socketHandler(io);

// Daily reset at midnight
cron.schedule('0 0 * * *', async () => {
  await leaderboardService.resetLeaderboard();
  io.emit('leaderboard:update', []); // Clear all leaderboards
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));