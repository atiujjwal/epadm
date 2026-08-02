import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createRecruitmentApplication, listHrPhase8Model } from "@/lib/phase8/hr";
import { phase8ApiError } from "@/lib/phase8/payroll";

const schema = z.object({ postingId: z.string().uuid(), candidateName: z.string().min(1), candidateEmail: z.string().nullable().optional(), candidatePhone: z.string().nullable().optional(), resumeUrl: z.string().nullable().optional(), currentCtcPaise: z.number().int().nullable().optional(), expectedCtcPaise: z.number().int().nullable().optional(), source: z.string().nullable().optional(), notes: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("hr.recruitment.read");
  const model = await listHrPhase8Model(ctx.tenantId);
  return Response.json({ applications: model.applications });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("hr.recruitment.write");
  try {
    const application = await createRecruitmentApplication(ctx.tenantId, schema.parse(await request.json()));
    return Response.json({ application }, { status: 201 });
  } catch (error) {
    return phase8ApiError(error);
  }
}
