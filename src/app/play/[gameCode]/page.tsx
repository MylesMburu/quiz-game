"use client";

import { useEffect, useState, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import QuestionCard from "@/components/QuestionCard";
import Timer from "@/components/Timer";
import Leaderboard from "@/components/Leaderboard";
import { PlayerType, LeaderboardEntry } from "@/types";

interface QuestionData {
  id: number;
  text: string;
  type: string;
  timeLimit: number;
  answers: { id: number; text: string }[];
}

export default function PlayPage({
  params,
}: {
  params: Promise<{ gameCode: string }>;
}) {
  const { gameCode } = use(params);
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerType | null>(null);
  const [phase, setPhase] = useState<
    "joining" | "lobby" | "playing" | "result" | "finished"
  >("joining");
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(
    null
  );
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const questionStartTime = useRef<number>(0);

  const handleTimeout = useCallback(() => {
    setTimerRunning(false);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    socket.emit("join-game", { gameCode });

    socket.on("joined", ({ player: p }) => {
      setPlayer(p);
      setPhase("lobby");
    });

    socket.on("error", ({ message }) => {
      setError(message);
    });

    socket.on("game-started", () => {
      setPhase("playing");
    });

    socket.on("question", ({ question, questionNumber: qn, total }) => {
      setCurrentQuestion(question);
      setQuestionNumber(qn);
      setTotalQuestions(total);
      setSelectedAnswerId(null);
      setCorrectAnswerId(null);
      setTimerRunning(true);
      setPhase("playing");
      questionStartTime.current = Date.now();
    });

    socket.on("answer-result", ({ correct, points, correctAnswerId: cid }) => {
      setLastCorrect(correct);
      setLastPoints(points);
      setCorrectAnswerId(cid);
    });

    socket.on("question-end", ({ leaderboard: lb, correctAnswerId: cid }) => {
      setLeaderboard(lb);
      setCorrectAnswerId(cid);
      setTimerRunning(false);
      setPhase("result");
    });

    socket.on("game-over", ({ leaderboard: lb }) => {
      setLeaderboard(lb);
      setPhase("finished");
      setTimeout(() => {
        router.push(`/results/${gameCode}`);
      }, 5000);
    });

    return () => {
      socket.off("joined");
      socket.off("error");
      socket.off("game-started");
      socket.off("question");
      socket.off("answer-result");
      socket.off("question-end");
      socket.off("game-over");
      socket.disconnect();
    };
  }, [gameCode, router]);

  const handleAnswer = (answerId: number) => {
    if (selectedAnswerId !== null) return;
    const timeMs = Date.now() - questionStartTime.current;
    setSelectedAnswerId(answerId);

    const socket = getSocket();
    socket.emit("submit-answer", {
      gameCode,
      questionId: currentQuestion?.id,
      answerId,
      timeMs,
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (phase === "joining") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Joining game...</p>
        </div>
      </div>
    );
  }

  if (phase === "lobby") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">You&apos;re in!</h1>
          <div className="bg-gray-800 rounded-xl px-8 py-4 inline-block">
            <p className="text-gray-400 text-sm mb-1">Your Name</p>
            <p className="text-3xl font-bold text-purple-400">
              {player?.name}
            </p>
          </div>
          <p className="text-gray-400">Waiting for the host to start...</p>
          <div className="animate-pulse text-gray-500">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          {selectedAnswerId ? (
            lastCorrect ? (
              <>
                <h2 className="text-4xl font-bold text-green-400 mb-2">
                  Correct!
                </h2>
                <p className="text-2xl text-white">+{lastPoints} points</p>
              </>
            ) : (
              <h2 className="text-4xl font-bold text-red-400 mb-2">Wrong!</h2>
            )
          ) : (
            <h2 className="text-4xl font-bold text-yellow-400 mb-2">
              Time&apos;s up!
            </h2>
          )}
        </div>
        <Leaderboard entries={leaderboard} highlight={player?.id} />
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-bold text-white">Game Over!</h1>
        <Leaderboard entries={leaderboard} highlight={player?.id} />
        <p className="text-gray-400">Redirecting to results...</p>
      </div>
    );
  }

  // Playing phase
  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto flex flex-col justify-center gap-4">
      {currentQuestion && (
        <>
          <Timer
            duration={currentQuestion.timeLimit}
            onTimeout={handleTimeout}
            running={timerRunning}
          />
          <QuestionCard
            question={currentQuestion.text}
            questionNumber={questionNumber}
            total={totalQuestions}
            answers={currentQuestion.answers}
            onAnswer={handleAnswer}
            disabled={selectedAnswerId !== null || !timerRunning}
            selectedAnswerId={selectedAnswerId}
            correctAnswerId={correctAnswerId}
          />
          {selectedAnswerId && !correctAnswerId && (
            <p className="text-center text-gray-400">
              Answer submitted! Waiting for question to end...
            </p>
          )}
        </>
      )}
    </div>
  );
}
