import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { listHrPhase8Model } from "@/lib/phase8/hr";
import { OperationsPage, RouteButton, StatusBadge } from "../../../academics/phase4-view";

export default async function PerformanceCyclePage({ params }: { params: Promise<{ cycleId: string }> }) {
  const ctx = await requirePermission("hr.performance.read");
  const { cycleId } = await params;
  const model = await listHrPhase8Model(ctx.tenantId);
  const cycle = model.cycles.find((item) => item.id === cycleId);
  if (!cycle) notFound();
  const rows = model.reviews.filter((review) => review.cycleId === cycleId);
  return <OperationsPage title={cycle.name} subtitle={`${rows.length} staff reviews`} rows={rows} empty="No reviews generated for this cycle." columns={[
    { label: "Staff", value: (row) => `${row.employeeCode} · ${row.staffName}` },
    { label: "Rating", value: (row) => row.overallRating ?? "—" },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
    { label: "Open", value: (row) => <RouteButton href={`/hr/performance/${cycleId}/reviews/${row.id}`}>Review</RouteButton> },
  ]} />;
}
