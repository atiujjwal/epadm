import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { phase12ApiError } from "@/lib/phase12/analytics";
import { createAIKnowledgeBaseDoc, listAIKnowledgeBase } from "@/lib/phase12/ai-studio";

const schema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const ctx = await requirePermission("ai-studio.read");
    return Response.json({ documents: await listAIKnowledgeBase(ctx.tenantId) });
  } catch (error) {
    return phase12ApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("ai-studio.governance");
    return Response.json({ document: await createAIKnowledgeBaseDoc(ctx.tenantId, ctx.userId, schema.parse(await request.json())) }, { status: 201 });
  } catch (error) {
    return phase12ApiError(error);
  }
}
