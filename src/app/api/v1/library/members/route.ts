import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { enrollLibraryMember, listLibraryModel } from "@/lib/phase9/library";
import { phase9ApiError } from "@/lib/phase9/transport";

const schema = z.object({ memberCode: z.string().min(1), memberType: z.string().min(1), studentId: z.string().uuid().nullable().optional(), staffId: z.string().uuid().nullable().optional(), userId: z.string().uuid().nullable().optional(), displayName: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("library.read");
  const model = await listLibraryModel(ctx.tenantId);
  return Response.json({ members: model.members });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("library.members.manage");
  try {
    const member = await enrollLibraryMember(ctx.tenantId, schema.parse(await request.json()));
    return Response.json({ member }, { status: 201 });
  } catch (error) {
    return phase9ApiError(error);
  }
}
