"use client";

import { useState } from "react";
import { QuestionFormData } from "@/types";

interface QuestionFormProps {
  onAdd: (question: QuestionFormData) => void;
}

export default function QuestionForm({ onAdd }: QuestionFormProps) {
  const [text, setText] = useState("");
  const [type, setType] = useState<"multiple_choice" | "true_false">(
    "multiple_choice"
  );
  const [timeLimit, setTimeLimit] = useState(20);
  const [answers, setAnswers] = useState([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const handleTypeChange = (newType: "multiple_choice" | "true_false") => {
    setType(newType);
    if (newType === "true_false") {
      setAnswers([
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ]);
    } else {
      setAnswers([
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updated = [...answers];
    updated[index].text = value;
    setAnswers(updated);
  };

  const handleCorrectChange = (index: number) => {
    const updated = answers.map((a, i) => ({
      ...a,
      isCorrect: i === index,
    }));
    setAnswers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (answers.some((a) => !a.text.trim())) return;

    onAdd({ text, type, timeLimit, answers });

    // Reset form
    setText("");
    setType("multiple_choice");
    setTimeLimit(20);
    setAnswers([
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-white">Add Question</h3>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Question Text
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your question..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) =>
              handleTypeChange(
                e.target.value as "multiple_choice" | "true_false"
              )
            }
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True / False</option>
          </select>
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Time (sec)
          </label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            min={5}
            max={120}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Answers
        </label>
        {answers.map((answer, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              checked={answer.isCorrect}
              onChange={() => handleCorrectChange(idx)}
              className="w-4 h-4 text-green-500"
            />
            <input
              type="text"
              value={answer.text}
              onChange={(e) => handleAnswerChange(idx, e.target.value)}
              placeholder={`Answer ${idx + 1}`}
              disabled={type === "true_false"}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
      >
        Add Question
      </button>
    </form>
  );
}
