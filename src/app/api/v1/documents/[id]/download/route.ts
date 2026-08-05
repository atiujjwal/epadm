import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/guards";
import { generatedDocuments } from "@/lib/db";
import { withTenant } from "@/lib/rls";

export async function GET(_request: Request, { params }: { params: Promise<Record<string, string>> }) {
  const ctx = await requirePermission("documents.read");
  const { id } = await params;
  const [document] = await withTenant(ctx.tenantId, (tx) => tx.select().from(generatedDocuments).where(and(eq(generatedDocuments.tenantId, ctx.tenantId), eq(generatedDocuments.id, id))).limit(1));
  if (!document?.pdfUrl) return Response.json({ error: "Document PDF not generated." }, { status: 404 });
  const bytes = await readFile(path.join(process.cwd(), document.pdfUrl.replace(/^\/+/, "")));
  return new Response(bytes, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename=\"${document.documentNumber.replace(/[^A-Za-z0-9_-]/g, "_")}.pdf\"` } });
}
