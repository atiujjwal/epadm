import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { addQualification } from "@/lib/phase3/hr";
import { phase3ApiError } from "@/lib/phase3/api";
const schema = z.object({ degree: z.string().trim().min(1).max(160), institution: z.string().trim().min(1).max(255), boardOrUniversity: z.string().max(255).optional(), yearOfPassing: z.string().max(20).optional(), gradeOrPercentage: z.string().max(40).optional() });
type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: Context) { const ctx = await requirePermission("hr.qualifications.manage"); const { id } = await params; try { return Response.json({ qualification: await addQualification(ctx.tenantId, id, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase3ApiError(error); } }
