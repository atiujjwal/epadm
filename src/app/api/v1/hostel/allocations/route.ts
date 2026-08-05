import { requirePermission } from "@/lib/auth/guards";
import { allocateStudentHostel, listHostelModel } from "@/lib/phase10/hostel";
import { phase10ApiError } from "@/lib/phase10/shared";

export async function GET() {
  const ctx = await requirePermission("hostel.read");
  const model = await listHostelModel(ctx.tenantId);
  return Response.json({ allocations: model.allocations });
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("hostel.allocations.manage");
    const allocation = await allocateStudentHostel(ctx.tenantId, ctx.userId, await request.json());
    return Response.json({ allocation }, { status: 201 });
  } catch (error) {
    return phase10ApiError(error);
  }
}
