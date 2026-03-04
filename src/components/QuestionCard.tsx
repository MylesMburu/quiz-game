"use client";

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  total: number;
  answers: { id: number; text: string }[];
  onAnswer: (answerId: number) => void;
  disabled: boolean;
  selectedAnswerId?: number | null;
  correctAnswerId?: number | null;
}

const answerColors = [
  "bg-red-600 hover:bg-red-700",
  "bg-blue-600 hover:bg-blue-700",
  "bg-yellow-600 hover:bg-yellow-700",
  "bg-green-600 hover:bg-green-700",
];

export default function QuestionCard({
  question,
  questionNumber,
  total,
  answers,
  onAnswer,
  disabled,
  selectedAnswerId,
  correctAnswerId,
}: QuestionCardProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">
          Question {questionNumber} of {total}
        </p>
        <h2 className="text-2xl font-bold text-white">{question}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {answers.map((answer, idx) => {
          let className = answerColors[idx % answerColors.length];

          if (correctAnswerId !== null && correctAnswerId !== undefined) {
            if (answer.id === correctAnswerId) {
              className = "bg-green-500 ring-4 ring-green-300";
            } else if (answer.id === selectedAnswerId) {
              className = "bg-red-800 opacity-75";
            } else {
              className = "bg-gray-600 opacity-50";
            }
          } else if (answer.id === selectedAnswerId) {
            className = "bg-purple-600 ring-2 ring-purple-300";
          }

          return (
            <button
              key={answer.id}
              onClick={() => onAnswer(answer.id)}
              disabled={disabled}
              className={`${className} p-4 rounded-lg text-white font-bold text-lg transition-all disabled:cursor-not-allowed`}
            >
              {answer.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
