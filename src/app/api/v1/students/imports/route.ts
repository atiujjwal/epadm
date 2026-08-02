import { requirePermission } from "@/lib/auth/guards";
import { createImportJob, listImportJobs } from "@/lib/phase3/imports";
import { phase3ApiError } from "@/lib/phase3/api";
export async function GET() { const ctx = await requirePermission("students.import"); return Response.json({ jobs: await listImportJobs(ctx.tenantId, "students") }); }
export async function POST(request: Request) { const ctx = await requirePermission("students.import"); try { const form = await request.formData(); const file = form.get("file"); if (!(file instanceof File)) return Response.json({ error: "CSV file is required" }, { status: 400 }); if (file.size > 5_000_000) return Response.json({ error: "CSV file must be 5 MB or smaller" }, { status: 413 }); return Response.json({ job: await createImportJob(ctx.tenantId, ctx.userId, "students", file.name, await file.text()) }, { status: 201 }); } catch (error) { return phase3ApiError(error); } }
