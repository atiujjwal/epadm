import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { getSchoolProfile, updateSchoolProfile } from "@/lib/phase3/administration";
import { phase3ApiError } from "@/lib/phase3/api";

const schoolSchema = z.object({
  name: z.string().trim().min(2).max(255).optional(), logoUrl: z.string().url().nullable().optional(),
  email: z.string().email().nullable().optional(), phone: z.string().max(20).nullable().optional(),
  address: z.string().max(1024).nullable().optional(), city: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(), pincode: z.string().max(20).nullable().optional(),
  affiliationBoard: z.string().max(50).nullable().optional(), settings: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const ctx = await requirePermission("administration.school.read");
  try { return Response.json({ school: await getSchoolProfile(ctx.tenantId) }); } catch (error) { return phase3ApiError(error); }
}

export async function PATCH(request: Request) {
  const ctx = await requirePermission("administration.school.update");
  try { return Response.json({ school: await updateSchoolProfile(ctx.tenantId, ctx.userId, schoolSchema.parse(await request.json())) }); } catch (error) { return phase3ApiError(error); }
}
