import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createRecruitmentPosting, listHrPhase8Model } from "@/lib/phase8/hr";
import { phase8ApiError } from "@/lib/phase8/payroll";

const schema = z.object({ title: z.string().min(1), description: z.string().nullable().optional(), departmentId: z.string().uuid().nullable().optional(), employmentType: z.string().optional(), openings: z.number().int().positive().optional(), salaryRangeMinPaise: z.number().int().nullable().optional(), salaryRangeMaxPaise: z.number().int().nullable().optional(), closesOn: z.string().nullable().optional() });

export async function GET() {
  const ctx = await requirePermission("hr.recruitment.read");
  const model = await listHrPhase8Model(ctx.tenantId);
  return Response.json({ postings: model.postings, applications: model.applications });
}

export async function POST(request: Request) {
  const ctx = await requirePermission("hr.recruitment.write");
  try {
    const posting = await createRecruitmentPosting(ctx.tenantId, ctx.userId, schema.parse(await request.json()));
    return Response.json({ posting }, { status: 201 });
  } catch (error) {
    return phase8ApiError(error);
  }
}
