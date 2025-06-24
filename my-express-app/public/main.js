const socket = io();

const form = document.getElementById('scoreForm');
const leaderboardBody = document.getElementById('leaderboardBody');

let currentRegion = '';
let currentGameMode = '';

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const playerId = form.playerId.value;
  const region = form.region.value;
  const gameMode = form.gameMode.value;
  // Ensure score is a number
  const score = Number(form.score.value);

  currentRegion = region;
  currentGameMode = gameMode;
  console.log({ playerId, region, gameMode, score });
  
  socket.emit('player:scoreUpdate', { playerId, score, region, gameMode });
  socket.emit('leaderboard:fetch', { topN: 10, region, gameMode });
});

socket.on('leaderboard:update', (players) => {
  leaderboardBody.innerHTML = '';
  if (Array.isArray(players)) {
    players.forEach((p, idx) => {
      leaderboardBody.innerHTML += `<tr>
        <td>${idx + 1}</td>
        <td>${p.value}</td>
        <td>${p.score}</td>
      </tr>`;
    });
  }
});

// Initial fetch
form.addEventListener('input', () => {
  const region = form.region.value;
  const gameMode = form.gameMode.value;
  if (region && gameMode) {
    socket.emit('leaderboard:fetch', { topN: 10, region, gameMode });
  }
});