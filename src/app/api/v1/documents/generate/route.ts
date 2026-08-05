import { requirePermission } from "@/lib/auth/guards";
import { generateStudentDocument } from "@/lib/phase11/documents";
import { phase11ApiError } from "@/lib/phase11/shared";

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("documents.generate");
    const result = await generateStudentDocument(ctx.tenantId, ctx.userId, await request.json());
    return Response.json(result, { status: 201 });
  } catch (error) {
    return phase11ApiError(error);
  }
}
