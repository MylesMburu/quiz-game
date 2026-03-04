import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gameCode: string }> }
) {
  const { gameCode } = await params;

  const game = await prisma.game.findUnique({
    where: { code: gameCode },
    include: {
      players: {
        orderBy: { score: "desc" },
      },
      questions: {
        orderBy: { order: "asc" },
        include: {
          answers: true,
          playerAnswers: true,
        },
      },
    },
  });

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const leaderboard = game.players.map((p) => ({
    id: p.id,
    name: p.name,
    score: p.score,
  }));

  const questions = game.questions.map((q) => ({
    text: q.text,
    answers: q.answers.map((a) => ({
      text: a.text,
      isCorrect: a.isCorrect,
      count: q.playerAnswers.filter((pa) => pa.answerId === a.id).length,
    })),
  }));

  return NextResponse.json({ leaderboard, questions });
}
