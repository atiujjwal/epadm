import { requireRole } from "@/lib/auth/guards";
import { submitAssignmentAsStudent } from "@/lib/phase11/portal";
import { phase11ApiError } from "@/lib/phase11/shared";

export async function POST(request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const ctx = await requireRole(["student"]);
    const { id } = await params;
    const body = await request.json();
    const submission = await submitAssignmentAsStudent(ctx.tenantId, ctx.userId, id, body.content ?? "");
    return Response.json({ submission });
  } catch (error) {
    return phase11ApiError(error);
  }
}
