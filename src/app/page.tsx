"use client";

import { useRouter } from "next/navigation";
import JoinForm from "@/components/JoinForm";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-white mb-2">
            Quiz Game
          </h1>
          <p className="text-gray-400">Real-time multiplayer trivia</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push("/create")}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl transition-colors"
          >
            Create Game
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400">
                or join an existing game
              </span>
            </div>
          </div>

          <JoinForm />
        </div>
      </div>
    </div>
  );
}
