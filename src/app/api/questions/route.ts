import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const questions = await prisma.question.findMany({
    where: { gameId: null },
    include: { answers: true },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(questions);
}
