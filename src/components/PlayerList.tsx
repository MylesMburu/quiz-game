"use client";

import { PlayerType } from "@/types";

interface PlayerListProps {
  players: PlayerType[];
}

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-3">
        Players ({players.length})
      </h3>
      {players.length === 0 ? (
        <p className="text-gray-400 text-sm">Waiting for players to join...</p>
      ) : (
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2"
            >
              <span className="text-white font-medium">{player.name}</span>
              <span className="text-gray-400 text-sm">
                {player.score} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
