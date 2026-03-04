"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  duration: number;
  onTimeout: () => void;
  running: boolean;
}

export default function Timer({ duration, onTimeout, running }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, timeLeft, onTimeout]);

  const percentage = (timeLeft / duration) * 100;
  const color =
    percentage > 50
      ? "bg-green-500"
      : percentage > 25
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-300">Time Left</span>
        <span className="font-bold text-white">{timeLeft}s</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
