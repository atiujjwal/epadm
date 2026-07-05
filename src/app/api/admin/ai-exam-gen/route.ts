import { requireModule } from "@/lib/security/guard";
import { NextResponse } from "next/server";

async function handler() {
  return NextResponse.json({
    success: true,
    message: "Welcome to AI Exam Generation. The AI Suite module is active!",
    data: {
      generatedQuestions: [
        { id: 1, question: "What is 2 + 2?", answer: "4" },
        { id: 2, question: "What is the capital of France?", answer: "Paris" },
      ],
    },
  });
}

export const GET = requireModule("AI Suite")(handler);
export const POST = requireModule("AI Suite")(handler);
