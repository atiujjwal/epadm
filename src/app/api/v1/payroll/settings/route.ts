import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { listPayrollModel, phase8ApiError, savePayrollSettings } from "@/lib/phase8/payroll";

const schema = z.object({
  pfEnabled: z.boolean().optional(),
  pfEmployeeRate: z.string().or(z.number()).optional(),
  pfEmployerRate: z.string().or(z.number()).optional(),
  esiEnabled: z.boolean().optional(),
  esiEmployeeRate: z.string().or(z.number()).optional(),
  esiEmployerRate: z.string().or(z.number()).optional(),
  esiGrossCeilingPaise: z.number().int().nonnegative().optional(),
  ptEnabled: z.boolean().optional(),
  ptState: z.string().nullable().optional(),
  ptMonthlyPaise: z.number().int().nonnegative().optional(),
  ptThresholdPaise: z.number().int().nonnegative().optional(),
  standardWorkingDays: z.number().int().min(1).max(31).optional(),
  payDay: z.number().int().min(1).max(28).optional(),
  currency: z.string().optional(),
  absenceDeductionMode: z.string().optional(),
});

export async function GET() {
  const ctx = await requirePermission("payroll.read");
  const model = await listPayrollModel(ctx.tenantId);
  return Response.json({ settings: model.settings });
}

export async function PUT(request: Request) {
  const ctx = await requirePermission("payroll.settings.manage");
  try {
    const body = schema.parse(await request.json());
    const settings = await savePayrollSettings(ctx.tenantId, {
      ...body,
      pfEmployeeRate: body.pfEmployeeRate == null ? undefined : String(body.pfEmployeeRate),
      pfEmployerRate: body.pfEmployerRate == null ? undefined : String(body.pfEmployerRate),
      esiEmployeeRate: body.esiEmployeeRate == null ? undefined : String(body.esiEmployeeRate),
      esiEmployerRate: body.esiEmployerRate == null ? undefined : String(body.esiEmployerRate),
    });
    return Response.json({ settings });
  } catch (error) {
    return phase8ApiError(error);
  }
}
