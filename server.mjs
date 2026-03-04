import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

// Track active game state in memory
const gameTimers = {}; // gameCode -> timer
const gameState = {}; // gameCode -> { currentQuestionIndex, questions }

// Color + Food name generator
const colors = [
  "Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Cyan",
  "Turquoise", "Magenta", "Crimson", "Gold", "Silver", "Teal", "Coral",
  "Lavender", "Indigo", "Scarlet", "Amber", "Lime",
];
const foods = [
  "Pizza", "Taco", "Burger", "Sushi", "Waffle", "Donut", "Pretzel", "Mango",
  "Cookie", "Bagel", "Pancake", "Noodle", "Burrito", "Cupcake", "Dumpling",
  "Croissant", "Popcorn", "Brownie", "Avocado", "Nacho",
];

function generateRandomName(existingNames) {
  for (let i = 0; i < 100; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const food = foods[Math.floor(Math.random() * foods.length)];
    const name = `${color} ${food}`;
    if (!existingNames.includes(name)) return name;
  }
  const color = colors[Math.floor(Math.random() * colors.length)];
  const food = foods[Math.floor(Math.random() * foods.length)];
  return `${color} ${food} ${Math.floor(Math.random() * 100)}`;
}

async function getLeaderboard(gameCode) {
  const game = await prisma.game.findUnique({
    where: { code: gameCode },
    include: {
      players: { orderBy: { score: "desc" } },
    },
  });
  if (!game) return [];
  return game.players.map((p) => ({
    id: p.id,
    name: p.name,
    score: p.score,
  }));
}

function clearGameTimer(gameCode) {
  if (gameTimers[gameCode]) {
    clearTimeout(gameTimers[gameCode]);
    delete gameTimers[gameCode];
  }
}

async function sendQuestion(io, gameCode) {
  const state = gameState[gameCode];
  if (!state) return;

  const question = state.questions[state.currentQuestionIndex];
  if (!question) return;

  // Send question to all clients in the room (answers without isCorrect for players)
  io.to(gameCode).emit("question", {
    question: {
      id: question.id,
      text: question.text,
      type: question.type,
      timeLimit: question.timeLimit,
      answers: question.answers.map((a) => ({ id: a.id, text: a.text })),
    },
    questionNumber: state.currentQuestionIndex + 1,
    total: state.questions.length,
  });

  // Set timer for auto-advance
  clearGameTimer(gameCode);
  gameTimers[gameCode] = setTimeout(async () => {
    await endQuestion(io, gameCode);
  }, question.timeLimit * 1000);
}

async function endQuestion(io, gameCode) {
  clearGameTimer(gameCode);
  const state = gameState[gameCode];
  if (!state) return;

  const question = state.questions[state.currentQuestionIndex];
  const correctAnswer = question.answers.find((a) => a.isCorrect);
  const leaderboard = await getLeaderboard(gameCode);

  io.to(gameCode).emit("question-end", {
    leaderboard,
    correctAnswerId: correctAnswer ? correctAnswer.id : null,
  });

  // Check if this was the last question
  if (state.currentQuestionIndex >= state.questions.length - 1) {
    // Game over
    setTimeout(async () => {
      await prisma.game.update({
        where: { code: gameCode },
        data: { status: "finished" },
      });
      io.to(gameCode).emit("game-over", { leaderboard });
      delete gameState[gameCode];
    }, 3000);
  }
}

async function nextQuestion(io, gameCode) {
  const state = gameState[gameCode];
  if (!state) return;

  state.currentQuestionIndex++;
  if (state.currentQuestionIndex >= state.questions.length) {
    // Game over
    const leaderboard = await getLeaderboard(gameCode);
    await prisma.game.update({
      where: { code: gameCode },
      data: { status: "finished" },
    });
    io.to(gameCode).emit("game-over", { leaderboard });
    delete gameState[gameCode];
    return;
  }

  await sendQuestion(io, gameCode);
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-game", async ({ gameCode }) => {
      try {
        const game = await prisma.game.findUnique({
          where: { code: gameCode },
          include: { players: true },
        });

        if (!game) {
          socket.emit("error", { message: "Game not found" });
          return;
        }

        if (game.status === "finished") {
          socket.emit("error", { message: "Game has already finished" });
          return;
        }

        // Check if player already exists with this session
        let player = game.players.find((p) => p.sessionId === socket.id);

        if (!player) {
          const existingNames = game.players.map((p) => p.name);
          const name = generateRandomName(existingNames);

          player = await prisma.player.create({
            data: {
              gameId: game.id,
              name,
              sessionId: socket.id,
              score: 0,
            },
          });
        }

        socket.join(gameCode);
        socket.data.gameCode = gameCode;
        socket.data.playerId = player.id;

        // Send player info back
        socket.emit("joined", { player });

        // Broadcast to the room
        const allPlayers = await prisma.player.findMany({
          where: { gameId: game.id },
        });
        io.to(gameCode).emit("player-joined", {
          player,
          players: allPlayers,
        });
      } catch (err) {
        console.error("join-game error:", err);
        socket.emit("error", { message: "Failed to join game" });
      }
    });

    socket.on("host-join", async ({ gameCode }) => {
      socket.join(gameCode);
      socket.data.gameCode = gameCode;
      socket.data.isHost = true;

      const game = await prisma.game.findUnique({
        where: { code: gameCode },
        include: { players: true },
      });

      if (game) {
        socket.emit("game-state", {
          players: game.players,
          status: game.status,
        });
      }
    });

    socket.on("start-game", async ({ gameCode }) => {
      try {
        const game = await prisma.game.findUnique({
          where: { code: gameCode },
          include: {
            questions: {
              include: { answers: true },
              orderBy: { order: "asc" },
            },
          },
        });

        if (!game || game.questions.length === 0) {
          socket.emit("error", { message: "Game not found or has no questions" });
          return;
        }

        await prisma.game.update({
          where: { code: gameCode },
          data: { status: "active" },
        });

        gameState[gameCode] = {
          currentQuestionIndex: 0,
          questions: game.questions,
        };

        io.to(gameCode).emit("game-started");

        // Send first question after a brief delay
        setTimeout(() => sendQuestion(io, gameCode), 1000);
      } catch (err) {
        console.error("start-game error:", err);
      }
    });

    socket.on("submit-answer", async ({ gameCode, questionId, answerId, timeMs }) => {
      try {
        const playerId = socket.data.playerId;
        if (!playerId) return;

        const state = gameState[gameCode];
        if (!state) return;

        const question = state.questions[state.currentQuestionIndex];
        if (!question || question.id !== questionId) return;

        // Check if already answered
        const existing = await prisma.playerAnswer.findFirst({
          where: { playerId, questionId },
        });
        if (existing) return;

        const answer = question.answers.find((a) => a.id === answerId);
        if (!answer) return;

        const isCorrect = answer.isCorrect;
        let points = 0;
        if (isCorrect) {
          points = Math.round(
            1000 * (1 - (timeMs / (question.timeLimit * 1000)) * 0.5)
          );
          points = Math.max(points, 500); // minimum 500 for correct
        }

        await prisma.playerAnswer.create({
          data: {
            playerId,
            questionId,
            answerId,
            timeMs,
            isCorrect,
          },
        });

        if (isCorrect) {
          await prisma.player.update({
            where: { id: playerId },
            data: { score: { increment: points } },
          });
        }

        socket.emit("answer-result", {
          correct: isCorrect,
          points,
          correctAnswerId: question.answers.find((a) => a.isCorrect)?.id,
        });
      } catch (err) {
        console.error("submit-answer error:", err);
      }
    });

    socket.on("next-question", async ({ gameCode }) => {
      clearGameTimer(gameCode);
      await endQuestion(io, gameCode);

      // Advance after showing results briefly
      setTimeout(() => nextQuestion(io, gameCode), 3000);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
