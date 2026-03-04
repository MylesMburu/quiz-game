"use client";

import { LeaderboardEntry } from "@/types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  highlight?: number; // player id to highlight
}

export default function Leaderboard({ entries, highlight }: LeaderboardProps) {
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-3">Leaderboard</h3>
      <div className="space-y-2">
        {sorted.map((entry, idx) => (
          <div
            key={entry.id}
            className={`flex items-center justify-between rounded-lg px-3 py-2 ${
              highlight === entry.id
                ? "bg-purple-600"
                : idx === 0
                  ? "bg-yellow-600/30"
                  : "bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-400 font-bold w-6 text-center">
                {idx + 1}
              </span>
              <span className="text-white font-medium">{entry.name}</span>
            </div>
            <span className="text-white font-bold">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
