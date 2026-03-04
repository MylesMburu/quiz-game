"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuestionForm from "@/components/QuestionForm";
import { QuestionFormData, QuestionType } from "@/types";

export default function CreateGame() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [preloaded, setPreloaded] = useState<QuestionType[]>([]);
  const [selectedPreloaded, setSelectedPreloaded] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => setPreloaded(data))
      .catch(console.error);
  }, []);

  const handleAddQuestion = (q: QuestionFormData) => {
    setQuestions([...questions, q]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const togglePreloaded = (id: number) => {
    const next = new Set(selectedPreloaded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedPreloaded(next);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const allQuestions = [
      ...questions,
      ...preloaded
        .filter((q) => selectedPreloaded.has(q.id))
        .map((q) => ({
          text: q.text,
          type: q.type as "multiple_choice" | "true_false",
          timeLimit: q.timeLimit,
          answers: q.answers.map((a) => ({
            text: a.text,
            isCorrect: a.isCorrect,
          })),
        })),
    ];

    if (allQuestions.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, questions: allQuestions }),
      });
      const game = await res.json();
      router.push(`/host/${game.code}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const totalQuestions = questions.length + selectedPreloaded.size;

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Create Game</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Game Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter game title..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <QuestionForm onAdd={handleAddQuestion} />

        {questions.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-3">
              Custom Questions ({questions.length})
            </h3>
            <div className="space-y-2">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2"
                >
                  <div>
                    <p className="text-white text-sm">{q.text}</p>
                    <p className="text-gray-400 text-xs">
                      {q.type === "true_false" ? "True/False" : "Multiple Choice"} - {q.timeLimit}s
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {preloaded.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-3">
              Pre-loaded Questions ({selectedPreloaded.size} selected)
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {preloaded.map((q) => (
                <label
                  key={q.id}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2 cursor-pointer transition-colors ${
                    selectedPreloaded.has(q.id)
                      ? "bg-purple-600/30 border border-purple-500"
                      : "bg-gray-700 border border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPreloaded.has(q.id)}
                    onChange={() => togglePreloaded(q.id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-white text-sm">{q.text}</p>
                    <p className="text-gray-400 text-xs">
                      {q.type === "true_false" ? "True/False" : "Multiple Choice"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim() || totalQuestions === 0}
          className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-colors"
        >
          {loading
            ? "Creating..."
            : `Create Game (${totalQuestions} question${totalQuestions !== 1 ? "s" : ""})`}
        </button>
      </div>
    </div>
  );
}
