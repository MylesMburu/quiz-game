import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing pre-loaded questions (those with no gameId)
  await prisma.playerAnswer.deleteMany({
    where: { question: { gameId: null } },
  });
  await prisma.answer.deleteMany({
    where: { question: { gameId: null } },
  });
  await prisma.question.deleteMany({
    where: { gameId: null },
  });

  const questions = [
    {
      text: "What is the largest planet in our solar system?",
      type: "multiple_choice",
      answers: [
        { text: "Jupiter", isCorrect: true },
        { text: "Saturn", isCorrect: false },
        { text: "Neptune", isCorrect: false },
        { text: "Earth", isCorrect: false },
      ],
    },
    {
      text: "What is the chemical symbol for water?",
      type: "multiple_choice",
      answers: [
        { text: "H2O", isCorrect: true },
        { text: "CO2", isCorrect: false },
        { text: "NaCl", isCorrect: false },
        { text: "O2", isCorrect: false },
      ],
    },
    {
      text: "The Great Wall of China is visible from space.",
      type: "true_false",
      answers: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
    {
      text: "Which country is known as the Land of the Rising Sun?",
      type: "multiple_choice",
      answers: [
        { text: "Japan", isCorrect: true },
        { text: "China", isCorrect: false },
        { text: "Thailand", isCorrect: false },
        { text: "South Korea", isCorrect: false },
      ],
    },
    {
      text: "What is the smallest prime number?",
      type: "multiple_choice",
      answers: [
        { text: "2", isCorrect: true },
        { text: "1", isCorrect: false },
        { text: "3", isCorrect: false },
        { text: "0", isCorrect: false },
      ],
    },
    {
      text: "Bananas are berries.",
      type: "true_false",
      answers: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
    {
      text: "What is the capital of Australia?",
      type: "multiple_choice",
      answers: [
        { text: "Canberra", isCorrect: true },
        { text: "Sydney", isCorrect: false },
        { text: "Melbourne", isCorrect: false },
        { text: "Brisbane", isCorrect: false },
      ],
    },
    {
      text: "Who painted the Mona Lisa?",
      type: "multiple_choice",
      answers: [
        { text: "Leonardo da Vinci", isCorrect: true },
        { text: "Michelangelo", isCorrect: false },
        { text: "Raphael", isCorrect: false },
        { text: "Pablo Picasso", isCorrect: false },
      ],
    },
    {
      text: "Octopuses have three hearts.",
      type: "true_false",
      answers: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
    {
      text: "What is the hardest natural substance on Earth?",
      type: "multiple_choice",
      answers: [
        { text: "Diamond", isCorrect: true },
        { text: "Gold", isCorrect: false },
        { text: "Iron", isCorrect: false },
        { text: "Platinum", isCorrect: false },
      ],
    },
    {
      text: "Which element has the chemical symbol 'Fe'?",
      type: "multiple_choice",
      answers: [
        { text: "Iron", isCorrect: true },
        { text: "Fluorine", isCorrect: false },
        { text: "Francium", isCorrect: false },
        { text: "Fermium", isCorrect: false },
      ],
    },
    {
      text: "Lightning never strikes the same place twice.",
      type: "true_false",
      answers: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
    {
      text: "What is the longest river in the world?",
      type: "multiple_choice",
      answers: [
        { text: "Nile", isCorrect: true },
        { text: "Amazon", isCorrect: false },
        { text: "Mississippi", isCorrect: false },
        { text: "Yangtze", isCorrect: false },
      ],
    },
    {
      text: "How many bones does an adult human body have?",
      type: "multiple_choice",
      answers: [
        { text: "206", isCorrect: true },
        { text: "195", isCorrect: false },
        { text: "215", isCorrect: false },
        { text: "300", isCorrect: false },
      ],
    },
    {
      text: "Venus is the hottest planet in our solar system.",
      type: "true_false",
      answers: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
    {
      text: "What is the currency of Japan?",
      type: "multiple_choice",
      answers: [
        { text: "Yen", isCorrect: true },
        { text: "Won", isCorrect: false },
        { text: "Yuan", isCorrect: false },
        { text: "Ringgit", isCorrect: false },
      ],
    },
    {
      text: "Which planet is known as the Red Planet?",
      type: "multiple_choice",
      answers: [
        { text: "Mars", isCorrect: true },
        { text: "Venus", isCorrect: false },
        { text: "Jupiter", isCorrect: false },
        { text: "Mercury", isCorrect: false },
      ],
    },
    {
      text: "Honey never spoils.",
      type: "true_false",
      answers: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
    {
      text: "What is the most spoken language in the world by native speakers?",
      type: "multiple_choice",
      answers: [
        { text: "Mandarin Chinese", isCorrect: true },
        { text: "English", isCorrect: false },
        { text: "Spanish", isCorrect: false },
        { text: "Hindi", isCorrect: false },
      ],
    },
    {
      text: "A group of flamingos is called a 'flamboyance'.",
      type: "true_false",
      answers: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await prisma.question.create({
      data: {
        text: q.text,
        type: q.type,
        timeLimit: 20,
        order: i + 1,
        gameId: null,
        answers: {
          create: q.answers,
        },
      },
    });
  }

  console.log(`Seeded ${questions.length} pre-loaded questions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
