import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, questions } = body;

  let code = generateCode();
  // Ensure unique code
  let existing = await prisma.game.findUnique({ where: { code } });
  while (existing) {
    code = generateCode();
    existing = await prisma.game.findUnique({ where: { code } });
  }

  const game = await prisma.game.create({
    data: {
      code,
      title,
      status: "waiting",
      questions: {
        create: questions.map(
          (
            q: {
              text: string;
              type: string;
              timeLimit: number;
              answers: { text: string; isCorrect: boolean }[];
            },
            idx: number
          ) => ({
            text: q.text,
            type: q.type,
            timeLimit: q.timeLimit || 20,
            order: idx + 1,
            answers: {
              create: q.answers,
            },
          })
        ),
      },
    },
    include: {
      questions: {
        include: { answers: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json(game);
}
