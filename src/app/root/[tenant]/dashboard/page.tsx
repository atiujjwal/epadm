import DashboardModulePage from "@/lib/modules/pages/dashboard";
import { getStaffSummary, getStudentSummary } from "@/lib/admin/registries";
import { getCtx } from "@/lib/context";
import { studentInvoices } from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { and, eq, inArray, sql } from "drizzle-orm";

export default async function DashboardPage() {
  const ctx = await getCtx();

  const [studentSummary, staffSummary, invoiceStats] = await Promise.all([
    getStudentSummary(ctx.tenantId),
    getStaffSummary(ctx.tenantId),
    withTenant(ctx.tenantId, (tx) =>
      tx
        .select({
          pendingCount: sql<number>`count(*)::int`,
          outstanding: sql<number>`coalesce(sum(${studentInvoices.amount}), 0)::int`,
        })
        .from(studentInvoices)
        .where(
          and(
            eq(studentInvoices.tenantId, ctx.tenantId),
            inArray(studentInvoices.status, ["pending", "overdue"]),
          ),
        ),
    ),
  ]);

  const stats = invoiceStats[0];

  return (
    <DashboardModulePage
      liveStats={{
        studentTotal: studentSummary.total,
        studentActive: studentSummary.active,
        staffTotal: staffSummary.total,
        staffActive: staffSummary.active,
        pendingInvoiceCount: Number(stats?.pendingCount ?? 0),
        outstandingAmount: Number(stats?.outstanding ?? 0),
      }}
    />
  );
}
