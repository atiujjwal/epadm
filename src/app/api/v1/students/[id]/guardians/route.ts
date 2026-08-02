import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { linkGuardian, listStudentGuardians } from "@/lib/phase3/students";
import { phase3ApiError } from "@/lib/phase3/api";
const relationship = z.enum(["father","mother","grandfather","grandmother","uncle","aunt","sibling","legal_guardian","other"]);
const schema = z.object({ guardianId: z.string().uuid().optional(), firstName: z.string().min(1).optional(), lastName: z.string().min(1).optional(), phonePrimary: z.string().max(20).optional(), email: z.string().email().optional(), relationship, isPrimary: z.boolean().optional(), receivesSms: z.boolean().optional(), receivesEmail: z.boolean().optional(), receivesReports: z.boolean().optional(), canPickup: z.boolean().optional() });
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) { const ctx = await requirePermission("students.guardians.read"); const { id } = await params; return Response.json({ guardians: await listStudentGuardians(ctx.tenantId, id) }); }
export async function POST(request: Request, { params }: Context) { const ctx = await requirePermission("students.guardians.write"); const { id } = await params; try { return Response.json({ guardian: await linkGuardian(ctx.tenantId, id, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase3ApiError(error); } }
