"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import JoinForm from "@/components/JoinForm";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Home() {
  const router = useRouter();

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col items-center justify-center px-4 w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold dark:text-white text-gray-900 mb-2">
            Quiz Game
          </h1>
          <p className="font-extralight text-base md:text-xl dark:text-neutral-300 text-gray-600">
            Real-time multiplayer trivia
          </p>
        </div>

        <div className="w-full space-y-4">
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
              <span className="px-4 bg-zinc-900 text-gray-400">
                or join an existing game
              </span>
            </div>
          </div>

          <JoinForm />
        </div>
      </motion.div>
    </AuroraBackground>
  );
}
