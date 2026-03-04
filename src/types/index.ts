export interface GameType {
  id: number;
  code: string;
  title: string;
  status: "waiting" | "active" | "finished";
  createdAt: string;
  questions: QuestionType[];
  players: PlayerType[];
}

export interface QuestionType {
  id: number;
  gameId: number | null;
  text: string;
  type: "multiple_choice" | "true_false";
  timeLimit: number;
  order: number;
  answers: AnswerType[];
}

export interface AnswerType {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
}

export interface PlayerType {
  id: number;
  gameId: number;
  name: string;
  sessionId: string;
  score: number;
}

export interface PlayerAnswerType {
  id: number;
  playerId: number;
  questionId: number;
  answerId: number;
  timeMs: number;
  isCorrect: boolean;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  score: number;
}

export interface QuestionFormData {
  text: string;
  type: "multiple_choice" | "true_false";
  timeLimit: number;
  answers: { text: string; isCorrect: boolean }[];
}
