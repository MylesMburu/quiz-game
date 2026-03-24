# Quiz Game

A real-time multiplayer trivia game built with Next.js and Socket.io. A host creates a game, shares a 6-character code, and players join from any device — no accounts required.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Socket.io](https://img.shields.io/badge/Socket.io-4-black?logo=socket.io)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)

## Features

- **Live multiplayer** — Socket.io keeps all players in sync in real time
- **Speed-based scoring** — faster correct answers earn more points (500–1000 per question)
- **Flexible question creation** — build custom quizzes or pick from pre-loaded questions
- **Two question types** — multiple choice and true/false
- **Per-question time limits** — configurable from 5 to 120 seconds
- **Live leaderboard** — updates after every question
- **Results & breakdown** — podium view, full rankings, and per-question answer distribution
- **No accounts needed** — players get a random color+food name on join (e.g. *Purple Mango*)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Real-time | Socket.io 4 |
| Database | SQLite via Prisma ORM |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| Server | Custom Express + Next.js |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/MylesMburu/quiz-game.git
cd quiz-game
npm install
```

### Database setup

```bash
npx prisma migrate dev
npx prisma db seed   # optional: loads pre-built questions
```

### Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

### For the host

1. Go to the home page and click **Create Game**
2. Give the quiz a title, add questions (or select pre-loaded ones), and set a time limit per question
3. Click **Create Game** — you'll land in the lobby with a shareable 6-character game code
4. Wait for players to join, then click **Start Game**
5. After each question, click **Next Question** to advance
6. When all questions are done, everyone is redirected to the results page

### For players

1. Go to the home page, enter the game code, and click **Join**
2. You'll be assigned a random name — wait in the lobby until the host starts
3. Answer each question before the timer runs out — the faster you answer correctly, the more points you earn
4. After the final question, see the final standings on the results page

## Project Structure

```
src/
├── app/
│   ├── page.tsx                     # Landing page
│   ├── create/page.tsx              # Game creation form
│   ├── host/[gameCode]/page.tsx     # Host/presenter view
│   ├── play/[gameCode]/page.tsx     # Player view
│   └── results/[gameCode]/page.tsx  # Final results & podium
├── components/
│   ├── JoinForm.tsx                 # Game code entry
│   ├── QuestionForm.tsx             # Question builder
│   ├── QuestionCard.tsx             # Question display with answer choices
│   ├── Timer.tsx                    # Countdown timer
│   ├── Leaderboard.tsx              # Live rankings
│   ├── PlayerList.tsx               # Player lobby list
│   └── ui/aurora-background.tsx     # Animated background
├── lib/
│   ├── prisma.ts                    # Prisma client
│   ├── socket.ts                    # Socket.io client
│   ├── names.ts                     # Random name generator
│   └── utils.ts                     # cn() helper
└── types/index.ts                   # Shared TypeScript types

server.mjs                           # Custom Express + Socket.io server
prisma/schema.prisma                 # Database schema
```

## Scoring

Points for a correct answer are calculated based on how quickly the player responded:

```
points = 1000 × (1 − (elapsed / totalTime) × 0.5)
```

This gives a range of **500** (answered at the last moment) to **1000** (answered instantly). Wrong answers score 0.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## License

MIT
