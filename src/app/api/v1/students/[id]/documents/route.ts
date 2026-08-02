import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { addDocument, listDocuments } from "@/lib/phase3/students";
import { phase3ApiError } from "@/lib/phase3/api";
const schema = z.object({ documentType: z.string().min(1).max(80), label: z.string().min(1).max(255), fileUrl: z.string().min(1).max(2048), fileName: z.string().min(1).max(255), fileSizeBytes: z.number().int().nonnegative().optional(), mimeType: z.string().max(120).optional() });
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) { const ctx = await requirePermission("students.documents.read"); const { id } = await params; return Response.json({ documents: await listDocuments(ctx.tenantId, id) }); }
export async function POST(request: Request, { params }: Context) { const ctx = await requirePermission("students.documents.write"); const { id } = await params; try { return Response.json({ document: await addDocument(ctx.tenantId, ctx.userId, id, schema.parse(await request.json())) }, { status: 201 }); } catch (error) { return phase3ApiError(error); } }
