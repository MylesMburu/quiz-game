"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { LeaderboardEntry } from "@/types";

interface QuestionResult {
  text: string;
  answers: { text: string; isCorrect: boolean; count: number }[];
}

export default function ResultsPage({
  params,
}: {
  params: Promise<{ gameCode: string }>;
}) {
  const { gameCode } = use(params);
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [questions, setQuestions] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/games/${gameCode}/results`)
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard);
        setQuestions(data.questions);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [gameCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Final Results</h1>
        <p className="text-gray-400">Game {gameCode}</p>
      </div>

      {/* Podium for top 3 */}
      {leaderboard.length > 0 && (
        <div className="flex items-end justify-center gap-4 mb-8 h-48">
          {/* 2nd place */}
          {leaderboard[1] && (
            <div className="text-center">
              <p className="text-white font-bold mb-2">{leaderboard[1].name}</p>
              <div className="bg-gray-600 rounded-t-lg w-24 h-28 flex items-center justify-center">
                <div>
                  <p className="text-3xl font-bold text-gray-300">2nd</p>
                  <p className="text-sm text-gray-400">{leaderboard[1].score}</p>
                </div>
              </div>
            </div>
          )}
          {/* 1st place */}
          {leaderboard[0] && (
            <div className="text-center">
              <p className="text-yellow-400 font-bold mb-2 text-lg">
                {leaderboard[0].name}
              </p>
              <div className="bg-yellow-600/40 rounded-t-lg w-28 h-40 flex items-center justify-center border border-yellow-500/50">
                <div>
                  <p className="text-4xl font-bold text-yellow-400">1st</p>
                  <p className="text-sm text-yellow-300">{leaderboard[0].score}</p>
                </div>
              </div>
            </div>
          )}
          {/* 3rd place */}
          {leaderboard[2] && (
            <div className="text-center">
              <p className="text-white font-bold mb-2">{leaderboard[2].name}</p>
              <div className="bg-amber-800/40 rounded-t-lg w-24 h-20 flex items-center justify-center">
                <div>
                  <p className="text-2xl font-bold text-amber-400">3rd</p>
                  <p className="text-sm text-amber-300">{leaderboard[2].score}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full leaderboard */}
      <div className="bg-gray-800 rounded-xl p-4 mb-8">
        <h2 className="text-lg font-bold text-white mb-3">All Players</h2>
        <div className="space-y-2">
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                idx === 0
                  ? "bg-yellow-600/20 border border-yellow-500/30"
                  : "bg-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-bold w-8 text-center">
                  #{idx + 1}
                </span>
                <span className="text-white font-medium">{entry.name}</span>
              </div>
              <span className="text-white font-bold">{entry.score} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Question breakdown */}
      {questions.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold text-white">Question Breakdown</h2>
          {questions.map((q, idx) => (
            <div key={idx} className="bg-gray-800 rounded-xl p-4">
              <p className="text-white font-medium mb-2">
                {idx + 1}. {q.text}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {q.answers.map((a, aidx) => (
                  <div
                    key={aidx}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      a.isCorrect
                        ? "bg-green-600/30 text-green-300 border border-green-500/30"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {a.text} ({a.count} answers)
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => router.push("/")}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
