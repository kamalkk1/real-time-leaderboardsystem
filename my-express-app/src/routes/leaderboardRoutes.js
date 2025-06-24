const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

router.post('/score', leaderboardController.scoreUpdate);
router.get('/top', leaderboardController.fetchLeaderboard);

module.exports = router;