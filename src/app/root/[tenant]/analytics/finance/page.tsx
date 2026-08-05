import { requirePermission } from "@/lib/auth/guards";
import { getRoleAnalytics } from "@/lib/phase12/analytics";
import { PortalShell, StatGrid, formatINR } from "../../phase11-view";

export default async function FinanceAnalyticsPage() {
  const ctx = await requirePermission("finance.analytics.read");
  const data = await getRoleAnalytics(ctx.tenantId, "finance") as Record<string, unknown>;
  return (
    <PortalShell title="Finance Analytics" description="Fees, collections, overdue exposure, and ledger summary.">
      <StatGrid stats={[
        { label: "Invoiced", value: formatINR(Number(data.invoicedPaise ?? 0)) },
        { label: "Collected", value: formatINR(Number(data.collectedPaise ?? 0)) },
        { label: "Outstanding", value: formatINR(Number(data.outstandingPaise ?? 0)) },
        { label: "Expenses", value: formatINR(Number(data.expensePaise ?? 0)) },
      ]} />
    </PortalShell>
  );
}
