import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { createStudent360, listStudentDirectory } from "@/lib/phase3/students";
import { phase3ApiError } from "@/lib/phase3/api";

const relationship = z.enum(["father","mother","grandfather","grandmother","uncle","aunt","sibling","legal_guardian","other"]);
const studentSchema = z.object({
  admissionNumber: z.string().trim().min(2).max(40), firstName: z.string().trim().min(2).max(120), lastName: z.string().max(120).optional(),
  admissionDate: z.string().date().optional(), dateOfBirth: z.string().date().optional(), gender: z.enum(["male","female","other","prefer_not_to_say"]).optional(),
  bloodGroup: z.string().max(10).optional(), nationality: z.string().max(80).optional(), religion: z.string().max(80).optional(), category: z.string().max(80).optional(), motherTongue: z.string().max(80).optional(),
  addressLine1: z.string().max(255).optional(), addressLine2: z.string().max(255).optional(), city: z.string().max(100).optional(), state: z.string().max(100).optional(), pincode: z.string().max(20).optional(), emergencyContactName: z.string().max(255).optional(), emergencyContactPhone: z.string().max(20).optional(),
  classId: z.string().uuid().optional(), sectionId: z.string().uuid().optional(), academicYear: z.string().max(20).optional(), rollNumber: z.string().max(20).optional(), status: z.string().max(20).optional(),
  classLabel: z.string().max(80).optional(), sectionLabel: z.string().max(80).optional(), guardianName: z.string().max(255).optional(), guardianPhone: z.string().max(20).optional(), notes: z.string().max(2000).optional(),
  guardian: z.object({ firstName: z.string().min(2), lastName: z.string().min(1), phonePrimary: z.string().max(20).optional(), relationship }).optional(),
});

export async function GET(request: Request) {
  const ctx = await requirePermission("students.read"); const p = new URL(request.url).searchParams;
  try { return Response.json(await listStudentDirectory(ctx.tenantId, { q: p.get("q") || undefined, classId: p.get("classId") || undefined, sectionId: p.get("sectionId") || undefined, status: p.get("status") || undefined, gender: p.get("gender") || undefined, page: Number(p.get("page") || 1), limit: Number(p.get("limit") || 25) })); } catch (error) { return phase3ApiError(error); }
}
export async function POST(request: Request) { const ctx = await requirePermission("students.create"); try { return Response.json({ student: await createStudent360(ctx.tenantId, ctx.userId, studentSchema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase3ApiError(error); } }
