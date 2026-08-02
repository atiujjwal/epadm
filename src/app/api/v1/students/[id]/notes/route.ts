import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { addNote, listNotes } from "@/lib/phase3/students";
import { phase3ApiError } from "@/lib/phase3/api";
const schema = z.object({ body: z.string().trim().min(1).max(10000), category: z.enum(["general","academic","behavioural","medical","welfare","safeguarding"]).optional(), visibility: z.enum(["staff","admin_only","restricted"]).optional() });
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) { const ctx = await requirePermission("students.notes.read"); const { id } = await params; return Response.json({ notes: await listNotes(ctx.tenantId, id, hasPermission(ctx.role, "students.notes.safeguarding")) }); }
export async function POST(request: Request, { params }: Context) { const ctx = await requirePermission("students.notes.create"); const { id } = await params; try { const input = schema.parse(await request.json()); if (input.category === "safeguarding" && !hasPermission(ctx.role, "students.notes.safeguarding")) return Response.json({ error: "Safeguarding permission required" }, { status: 403 }); return Response.json({ note: await addNote(ctx.tenantId, ctx.userId, id, input) }, { status: 201 }); } catch (error) { return phase3ApiError(error); } }
