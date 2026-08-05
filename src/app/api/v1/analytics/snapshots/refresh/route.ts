import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { phase12ApiError, refreshAnalyticsSnapshot } from "@/lib/phase12/analytics";

const schema = z.object({
  key: z.enum(["admin_dashboard", "academic_dashboard", "finance_dashboard", "hr_dashboard"]),
  academicYearId: z.string().uuid().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("analytics.read");
    const input = schema.parse(await request.json());
    return Response.json({ data: await refreshAnalyticsSnapshot(ctx.tenantId, input.key, input.academicYearId ?? null) });
  } catch (error) {
    return phase12ApiError(error);
  }
}
