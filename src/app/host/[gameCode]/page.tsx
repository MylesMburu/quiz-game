"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import PlayerList from "@/components/PlayerList";
import Leaderboard from "@/components/Leaderboard";
import Timer from "@/components/Timer";
import { PlayerType, LeaderboardEntry } from "@/types";

interface QuestionData {
  id: number;
  text: string;
  type: string;
  timeLimit: number;
  answers: { id: number; text: string }[];
}

export default function HostPage({
  params,
}: {
  params: Promise<{ gameCode: string }>;
}) {
  const { gameCode } = use(params);
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [status, setStatus] = useState<"waiting" | "active" | "finished">(
    "waiting"
  );
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(
    null
  );
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleTimeout = useCallback(() => {
    setTimerRunning(false);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    socket.emit("host-join", { gameCode });

    socket.on("game-state", ({ players: p, status: s }) => {
      setPlayers(p);
      setStatus(s);
    });

    socket.on("player-joined", ({ players: allPlayers }) => {
      setPlayers(allPlayers);
    });

    socket.on("game-started", () => {
      setStatus("active");
    });

    socket.on("question", ({ question, questionNumber: qn, total }) => {
      setCurrentQuestion(question);
      setQuestionNumber(qn);
      setTotalQuestions(total);
      setCorrectAnswerId(null);
      setTimerRunning(true);
      setShowResults(false);
    });

    socket.on("question-end", ({ leaderboard: lb, correctAnswerId: cid }) => {
      setLeaderboard(lb);
      setCorrectAnswerId(cid);
      setTimerRunning(false);
      setShowResults(true);
    });

    socket.on("game-over", ({ leaderboard: lb }) => {
      setLeaderboard(lb);
      setStatus("finished");
      setTimeout(() => {
        router.push(`/results/${gameCode}`);
      }, 3000);
    });

    return () => {
      socket.off("game-state");
      socket.off("player-joined");
      socket.off("game-started");
      socket.off("question");
      socket.off("question-end");
      socket.off("game-over");
      socket.disconnect();
    };
  }, [gameCode, router]);

  const startGame = () => {
    const socket = getSocket();
    socket.emit("start-game", { gameCode });
  };

  const nextQuestion = () => {
    const socket = getSocket();
    socket.emit("next-question", { gameCode });
    setShowResults(false);
  };

  // Lobby view
  if (status === "waiting") {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto flex flex-col items-center justify-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Game Lobby</h1>
          <div className="bg-gray-800 rounded-xl px-8 py-4 inline-block">
            <p className="text-gray-400 text-sm mb-1">Game Code</p>
            <p className="text-5xl font-extrabold text-purple-400 tracking-widest">
              {gameCode}
            </p>
          </div>
        </div>

        <div className="w-full">
          <PlayerList players={players} />
        </div>

        <button
          onClick={startGame}
          disabled={players.length === 0}
          className="w-full max-w-sm py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-colors"
        >
          {players.length === 0
            ? "Waiting for players..."
            : `Start Game (${players.length} player${players.length !== 1 ? "s" : ""})`}
        </button>
      </div>
    );
  }

  // Active game view
  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {currentQuestion && (
            <>
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">
                  Question {questionNumber} of {totalQuestions}
                </p>
                <h2 className="text-2xl font-bold text-white mb-4">
                  {currentQuestion.text}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.answers.map((a) => (
                    <div
                      key={a.id}
                      className={`p-3 rounded-lg text-white font-medium ${
                        correctAnswerId === a.id
                          ? "bg-green-500 ring-4 ring-green-300"
                          : correctAnswerId !== null
                            ? "bg-gray-600 opacity-50"
                            : "bg-gray-700"
                      }`}
                    >
                      {a.text}
                    </div>
                  ))}
                </div>
              </div>

              <Timer
                duration={currentQuestion.timeLimit}
                onTimeout={handleTimeout}
                running={timerRunning}
              />

              {showResults && (
                <button
                  onClick={nextQuestion}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
                >
                  {questionNumber >= totalQuestions
                    ? "View Results"
                    : "Next Question"}
                </button>
              )}
            </>
          )}
        </div>

        <div className="space-y-4">
          <Leaderboard entries={leaderboard} />
          <PlayerList players={players} />
        </div>
      </div>
    </div>
  );
}
