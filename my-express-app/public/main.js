const socket = io();

const form = document.getElementById("scoreForm");
const leaderboardBody = document.getElementById("leaderboardBody");
const regionSelect = document.getElementById("region");
const gameModeSelect = document.getElementById("gameMode");

let currentRegion = "";
let currentGameMode = "";

function joinRoom(region, gameMode) {
  if (region && gameMode) {
    socket.emit("leaderboard:fetch", { topN: 10, region, gameMode });
    currentRegion = region;
    currentGameMode = gameMode;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const playerId = form.playerId.value;
  const region = form.region.value;
  const gameMode = form.gameMode.value;
  const score = Number(form.score.value);
  const playerName = playerId;
  joinRoom(region, gameMode); // Always join the correct room before submitting
  sessionStorage.setItem("playerId", playerId);
  sessionStorage.setItem("playerName", playerName);
  sessionStorage.setItem("region", region);
  sessionStorage.setItem("gameMode", gameMode);
  sessionStorage.setItem("score", score);

  socket.emit("player:scoreUpdate", {
    playerId,
    playerName,
    score,
    region,
    gameMode,
  });
});

// Listen for changes in region/game mode and join the correct room
regionSelect.addEventListener("change", () => {
  joinRoom(regionSelect.value, gameModeSelect.value);
});
gameModeSelect.addEventListener("change", () => {
  joinRoom(regionSelect.value, gameModeSelect.value);
});

socket.on('leaderboard:update', (players) => {
  leaderboardBody.innerHTML = '';
  console.log('Received players:', players); // Debug log

  // Ensure players is an array
  if (!Array.isArray(players)) {
    console.error('Players is not an array:', players);
    return;
  }

  // Sort players by score in descending order
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  console.log('Sorted players:', sortedPlayers); // Debug log

  for (let i = 0; i < 10; i++) {
    const player = sortedPlayers[i];
    const rank = i + 1;

    if (player) {
      console.log(`Rendering player ${rank}:`, player); // Debug log
      const name = player.playerName || player.value || player.playerId || 'Unknown';
      const score = typeof player.score === 'number' ? player.score : '—';

      leaderboardBody.innerHTML += `
        <tr>
          <td>${rank}</td>
          <td>${name}</td>
          <td>${score}</td>
        </tr>
      `;
    } else {
      // Fill empty row if player doesn't exist
      leaderboardBody.innerHTML += `
        <tr>
          <td>${rank}</td>
          <td>—</td>
          <td>—</td>
        </tr>
      `;
    }
  }
});


socket.on("player:rankUpdate", ({ rank, score }) => {
  const status = document.getElementById("status");
  status.innerText = `🎉 Your score: ${score} | Rank: ${rank}`;
});

socket.on("error", (msg) => {
  const error = document.getElementById("error");
  error.innerText = `❌ ${msg}`;
});

// Initial fetch on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedPlayerId = sessionStorage.getItem('playerId');
  const savedRegion = sessionStorage.getItem('region');
  const savedGameMode = sessionStorage.getItem('gameMode');
  const savedScore = sessionStorage.getItem('score');

  if (savedPlayerId) form.playerId.value = savedPlayerId;
  if (savedRegion) form.region.value = savedRegion;
  if (savedGameMode) form.gameMode.value = savedGameMode;
  if (savedScore) form.score.value = savedScore;

  // Join room with saved values
  if (savedRegion && savedGameMode) {
    joinRoom(savedRegion, savedGameMode);
  }
});

