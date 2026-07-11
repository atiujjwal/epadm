import { requireModule } from "@/lib/security/guard";
import { NextResponse } from "next/server";
import { generateExamAI } from "@/lib/ai/client";
import { logAIVariableCost } from "@/lib/platform/metering";
import { getCtx } from "@/lib/context";

async function handler(req: Request) {
  try {
    const ctx = await getCtx();
    if (!ctx.tenantId) {
      return NextResponse.json(
        { error: "Tenant context not found" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { subject, gradeLevel, difficulty, format } = body;

    if (!subject || !gradeLevel || !difficulty || !format) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: subject, gradeLevel, difficulty, format",
        },
        { status: 400 },
      );
    }

    // Generate content using Gemini AI
    const result = await generateExamAI(subject, gradeLevel, difficulty, format);

    // Extract and parse JSON content from result
    let parsedContent;
    try {
      parsedContent = JSON.parse(result.text);
    } catch {
      // In case the AI wrapped it in markdown codeblocks (e.g. ```json ... ```)
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI output as JSON: " + result.text);
      }
    }

    // Log the variable compute cost to the platform metering buffer
    await logAIVariableCost(
      ctx.tenantId,
      "gemini-2.5-flash",
      result.promptTokens,
      result.completionTokens,
    );

    return NextResponse.json({
      success: true,
      data: parsedContent,
      meta: {
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
      },
    });
  } catch (error) {
    console.error("[ai_exam_gen] Endpoint error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export const POST = requireModule("ai_exam_gen")(handler);
