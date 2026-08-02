import { requirePermission } from "@/lib/auth/guards";
import { listHrPhase8Model } from "@/lib/phase8/hr";
import { OperationsPage, RouteButton, StatusBadge } from "../../academics/phase4-view";

export default async function PerformancePage() {
  const ctx = await requirePermission("hr.performance.read");
  const model = await listHrPhase8Model(ctx.tenantId);
  return <OperationsPage title="Performance Reviews" subtitle={`${model.cycles.length} cycles · ${model.reviews.length} reviews`} rows={model.cycles} empty="No performance cycles yet." columns={[
    { label: "Cycle", value: (row) => row.name },
    { label: "Period", value: (row) => `${row.reviewPeriodStart} → ${row.reviewPeriodEnd}` },
    { label: "Reviews", value: (row) => model.reviews.filter((review) => review.cycleId === row.id).length },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
    { label: "Open", value: (row) => <RouteButton href={`/hr/performance/${row.id}`}>Details</RouteButton> },
  ]} />;
}
