import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { listHrPhase8Model } from "@/lib/phase8/hr";
import { OperationsPage, StatusBadge } from "../../../../../academics/phase4-view";

export default async function PerformanceReviewPage({ params }: { params: Promise<{ cycleId: string; reviewId: string }> }) {
  const ctx = await requirePermission("hr.performance.read");
  const { cycleId, reviewId } = await params;
  const model = await listHrPhase8Model(ctx.tenantId);
  const review = model.reviews.find((item) => item.cycleId === cycleId && item.id === reviewId);
  if (!review) notFound();
  const rows = [{ field: "Staff", value: `${review.employeeCode} · ${review.staffName}` }, { field: "Status", value: <StatusBadge status={review.status} /> }, { field: "Overall rating", value: review.overallRating ?? "Pending" }];
  return <OperationsPage title="Performance Review" subtitle="Self assessment, reviewer rating, and acknowledgment workflow" rows={rows} empty="Review not found." columns={[
    { label: "Field", value: (row) => row.field },
    { label: "Value", value: (row) => row.value },
  ]} />;
}
