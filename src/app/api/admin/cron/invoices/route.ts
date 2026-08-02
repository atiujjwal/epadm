import { timingSafeEqual } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getCtx } from "@/lib/context";
import { hasPermission } from "@/lib/auth/permissions";
import { academicYears } from "@/lib/db";
import { opsDb, tenants } from "@/lib/db/ops";
import { badRequest, forbidden, ok, serverError, unauthorized } from "@/lib/http/responses";
import { withApiObservability } from "@/lib/observability/api-handler";
import { generateInvoices } from "@/lib/phase7/finance";
import { withTenant } from "@/lib/rls";

const REQUIRED_PERMISSION = "finance.fees.invoices.generate" as const;

const bodySchema = z.object({
  tenantId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
}).strict();

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

async function authorize(req: Request, body: z.infer<typeof bodySchema>): Promise<{ tenantId: string; actorUserId: string | null } | Response> {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = req.headers.get("authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";

  if (cronSecret && bearer) {
    if (!safeEqual(bearer, cronSecret)) return unauthorized("Invalid cron credentials");
    if (!body.tenantId) return badRequest("tenantId is required for scheduled runs");
    const tenant = await opsDb.query.tenants.findFirst({ where: and(eq(tenants.id, body.tenantId), eq(tenants.isActive, true)) });
    if (!tenant) return badRequest("Unknown or inactive tenant");
    return { tenantId: body.tenantId, actorUserId: null };
  }

  try {
    const ctx = await getCtx();
    if (!hasPermission(ctx.role, REQUIRED_PERMISSION)) return forbidden(`Missing permission: ${REQUIRED_PERMISSION}`);
    return { tenantId: ctx.tenantId, actorUserId: ctx.userId };
  } catch {
    return unauthorized("Authentication required");
  }
}

async function resolveAcademicYear(tenantId: string, requestedId?: string) {
  if (requestedId) return requestedId;
  const [year] = await withTenant(tenantId, (tx) =>
    tx.select().from(academicYears).where(eq(academicYears.tenantId, tenantId)).orderBy(desc(academicYears.isCurrent), desc(academicYears.startDate)).limit(1),
  );
  return year?.id;
}

async function POSTHandler(req: Request) {
  try {
    const raw = await req.text();
    const parsed = raw.trim() ? bodySchema.safeParse(JSON.parse(raw)) : bodySchema.safeParse({});
    if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());
    const auth = await authorize(req, parsed.data);
    if (auth instanceof Response) return auth;
    const academicYearId = await resolveAcademicYear(auth.tenantId, parsed.data.academicYearId);
    if (!academicYearId) return badRequest("No academic year found for invoice generation");
    const result = await generateInvoices(auth.tenantId, auth.actorUserId, { academicYearId });
    return ok({ success: true, message: `Invoices processed. Created: ${result.created}, Skipped: ${result.skipped}`, ...result });
  } catch (error) {
    console.error("[cron/invoices] Unexpected error:", error);
    return serverError();
  }
}

export const POST = withApiObservability(POSTHandler);
