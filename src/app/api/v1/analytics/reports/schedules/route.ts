import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { phase12ApiError } from "@/lib/phase12/analytics";
import { createReportSchedule, listReportSchedules } from "@/lib/phase12/reports";

const schema = z.object({
  reportKey: z.string().min(1),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  recipients: z.array(z.string().email()).optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
  runTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  dayOfMonth: z.number().int().min(1).max(28).nullable().optional(),
});

export async function GET() {
  try {
    const ctx = await requirePermission("reports.schedule.manage");
    return Response.json({ schedules: await listReportSchedules(ctx.tenantId) });
  } catch (error) {
    return phase12ApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("reports.schedule.manage");
    return Response.json({ schedule: await createReportSchedule(ctx.tenantId, ctx.userId, schema.parse(await request.json())) }, { status: 201 });
  } catch (error) {
    return phase12ApiError(error);
  }
}
