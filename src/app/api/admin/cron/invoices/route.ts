import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { getCtx } from "@/lib/context";
import { hasPermission } from "@/lib/auth/permissions";
import { opsDb, tenants } from "@/lib/db/ops";
import {
  studentEnrollments,
  feeStructures,
  studentInvoices,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { badRequest, forbidden, ok, serverError, unauthorized } from "@/lib/http/responses";

const FEES_WRITE_PERMISSION = "fees.write" as const;

const bodySchema = z
  .object({
    // Only honoured on the machine (CRON_SECRET) path; ignored for interactive
    // calls, which are always scoped to the caller's own tenant.
    tenantId: z.string().uuid().optional(),
  })
  .strict();

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Resolves the tenant to bill and authorizes the caller.
 *
 * Two mutually-exclusive callers are supported:
 *  - Scheduler: presents `Authorization: Bearer <CRON_SECRET>` and names the
 *    tenant explicitly (body.tenantId). No user session required.
 *  - Interactive admin: authenticated tenant session holding `fees.write`.
 *
 * Returns the resolved tenantId, or a NextResponse to short-circuit with.
 */
async function authorize(
  req: Request,
  body: z.infer<typeof bodySchema>,
): Promise<string | Response> {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = req.headers.get("authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  // Machine path — only enabled when CRON_SECRET is configured.
  if (cronSecret && bearer) {
    if (!safeEqual(bearer, cronSecret)) {
      return unauthorized("Invalid cron credentials");
    }

    const tenantId = body.tenantId;
    if (!tenantId) {
      return badRequest("tenantId is required for scheduled runs");
    }

    const tenant = await opsDb.query.tenants.findFirst({
      where: and(eq(tenants.id, tenantId), eq(tenants.isActive, true)),
    });
    if (!tenant) {
      return badRequest("Unknown or inactive tenant");
    }

    return tenantId;
  }

  // Interactive path — authenticated tenant admin with fees.write.
  // getCtx() throws when the request carries no tenant/user session headers;
  // treat that as unauthenticated rather than a server error.
  let ctx;
  try {
    ctx = await getCtx();
  } catch {
    return unauthorized("Authentication required");
  }
  if (!hasPermission(ctx.role, FEES_WRITE_PERMISSION)) {
    return forbidden(`Missing permission: ${FEES_WRITE_PERMISSION}`);
  }
  return ctx.tenantId;
}

export async function POST(req: Request) {
  try {
    // Body is optional (interactive calls send none); tolerate an empty body.
    let parsedBody: z.infer<typeof bodySchema> = {};
    const raw = await req.text();
    if (raw.trim().length > 0) {
      const json = JSON.parse(raw);
      const result = bodySchema.safeParse(json);
      if (!result.success) {
        return badRequest("Invalid payload", result.error.flatten());
      }
      parsedBody = result.data;
    }

    const authResult = await authorize(req, parsedBody);
    if (authResult instanceof Response) {
      return authResult;
    }
    const tenantId = authResult;

    const dateObj = new Date();
    const monthName = dateObj.toLocaleString("default", { month: "long" });
    const yearStr = dateObj.getFullYear();
    const dueDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), 15);
    const dueDateStr = dueDay.toISOString().split("T")[0];

    const result = await withTenant(tenantId, async (tx) => {
      // 1. Active enrollments for the tenant.
      const enrollments = await tx
        .select({
          enrollmentId: studentEnrollments.id,
          studentId: studentEnrollments.studentId,
          classId: studentEnrollments.classId,
        })
        .from(studentEnrollments)
        .where(
          and(
            eq(studentEnrollments.status, "active"),
            eq(studentEnrollments.tenantId, tenantId),
          ),
        );

      if (enrollments.length === 0) {
        return { createdCount: 0, skippedCount: 0 };
      }

      // 2. All monthly fee structures for the tenant, grouped by class (one query).
      const monthlyFees = await tx
        .select()
        .from(feeStructures)
        .where(
          and(
            eq(feeStructures.frequency, "monthly"),
            eq(feeStructures.tenantId, tenantId),
          ),
        );

      const feesByClass = new Map<string, typeof monthlyFees>();
      for (const fee of monthlyFees) {
        const bucket = feesByClass.get(fee.classId);
        if (bucket) {
          bucket.push(fee);
        } else {
          feesByClass.set(fee.classId, [fee]);
        }
      }

      // 3. Build the candidate invoice rows.
      type NewInvoice = typeof studentInvoices.$inferInsert;
      const candidates: NewInvoice[] = [];
      for (const enrollment of enrollments) {
        const classFees = feesByClass.get(enrollment.classId);
        if (!classFees) continue;
        for (const fee of classFees) {
          candidates.push({
            tenantId,
            studentId: enrollment.studentId,
            enrollmentId: enrollment.enrollmentId,
            title: `${fee.name} - ${monthName} ${yearStr}`,
            amount: fee.amount,
            dueDate: dueDateStr,
            status: "pending",
          });
        }
      }

      if (candidates.length === 0) {
        return { createdCount: 0, skippedCount: 0 };
      }

      // 4. Fetch the already-existing invoices for these titles in one query,
      //    then filter in memory (removes the per-fee existence N+1).
      const titles = [...new Set(candidates.map((c) => c.title as string))];
      const existing = await tx
        .select({
          studentId: studentInvoices.studentId,
          title: studentInvoices.title,
        })
        .from(studentInvoices)
        .where(
          and(
            eq(studentInvoices.tenantId, tenantId),
            inArray(studentInvoices.title, titles),
          ),
        );

      const existingKeys = new Set(
        existing.map((row) => `${row.studentId}::${row.title}`),
      );

      const toInsert = candidates.filter(
        (c) => !existingKeys.has(`${c.studentId}::${c.title as string}`),
      );

      if (toInsert.length > 0) {
        await tx.insert(studentInvoices).values(toInsert);
      }

      return {
        createdCount: toInsert.length,
        skippedCount: candidates.length - toInsert.length,
      };
    });

    return ok({
      success: true,
      message: `Invoices processed. Created: ${result.createdCount}, Skipped: ${result.skippedCount}`,
    });
  } catch (error) {
    console.error("[cron/invoices] Unexpected error:", error);
    return serverError();
  }
}
