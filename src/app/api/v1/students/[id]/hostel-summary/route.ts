import { requirePermission } from "@/lib/auth/guards";
import { getStudentHostelSummary } from "@/lib/phase10/hostel";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET(_request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const ctx = await requirePermission("hostel.read");
    const { id } = await params;
    return Response.json(await getStudentHostelSummary(ctx.tenantId, id));
  } catch (error) {
    return phase10ApiError(error);
  }
}
