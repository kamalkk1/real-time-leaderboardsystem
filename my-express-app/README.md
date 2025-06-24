# 🏆 Real-Time Leaderboard System

A scalable, production-ready real-time leaderboard system for multiplayer games and competitions, built using **Node.js**, **Socket.IO**, **Redis**, and a static frontend deployed via **Netlify**. It supports live score updates, regional filtering, game mode isolation, and automatic daily resets.

---

## 📌 Features

- ⚡ **Real-time WebSocket updates** via Socket.IO
- 🧠 **Redis ZSET**-based sorted score tracking
- 🌍 **Scoped leaderboards** by `region` and `game mode`
- 🕒 **Daily TTL resets** for fresh competitions
- 📊 View top `N` players live across multiple clients
- 🌐 Frontend deployable on Netlify, backend on Railway or Docker

---

## 🏗️ Tech Stack

| Layer        | Technology        |
|--------------|-------------------|
| Frontend     | Vanilla JS + HTML |
| Real-time    | Socket.IO         |
| Backend      | Node.js + Express |
| Data Store   | Redis 7           |
| Deployment   | Railway (API), Netlify (UI) |

---

## 🚀 Getting Started

### 🛠 Local Development (with Docker)

```bash
git clone https://github.com/your-username/real-time-leaderboard.git
cd real-time-leaderboard
cp .env.example .env
docker-compose up --build
Navigate to: http://localhost:3000

🌐 Hosted Demo (Public)
Frontend: Netlify Link
Backend: Railway Link

🧪 Testing Real-Time Updates
Open the app in two browser windows

Submit a score in one

Watch the leaderboard update instantly in both

Re-submit a higher score → see it update live

📁 Project Structure
csharp
Copy
Edit
├── src/
│   ├── config/             # Redis client setup
│   ├── services/           # Leaderboard logic (zAdd, zRange, TTL, rank)
│   ├── controllers/        # RESTful APIs (optional use)
│   ├── sockets/            # Socket.IO handlers
│   ├── routes/             # Optional REST routes
│   └── index.js            # Express + HTTP + Socket.IO init
├── public/
│   ├── index.html          # Frontend UI
│   └── main.js             # Frontend socket logic
├── Dockerfile
├── docker-compose.yml
└── README.md
⚙️ Configuration
Key	Description	Example
REDIS_URL	Redis connection string	redis://localhost:6379
PORT	App port	3000

For local .env:

env
Copy
Edit
PORT=3000
REDIS_URL=redis://localhost:6379
🧠 Design Decisions
Used Redis ZSETs for natural score sorting (high-performance)

Leaderboards scoped by composite keys: leaderboard:{region}:{gameMode}

Hashes used to store per-player metadata (name, lastActive, etc.)

Socket.IO used for efficient WebSocket broadcasting by room

TTLs auto-reset daily at midnight for time-bound competitions

📈 Example Redis Keys
Key Format	Description
leaderboard:NA:Arcade	Sorted scores (ZSET)
player:kamal	Hash with metadata

✅ Roadmap / TODO
 Real-time multi-client sync

 Daily TTL expiration logic

 Join/leave Socket.IO rooms per filter

 Admin dashboard to reset/archive leaderboards

 JWT-based player authentication

 Export to CSV for offline leaderboard review

🛡️ Security
Sanitized input on both client & server

CORS-restricted access to trusted frontend

Optional Redis auth/token support for production use

🤝 Contributing
Pull requests and feedback are welcome. Please open an issue first for significant changes.