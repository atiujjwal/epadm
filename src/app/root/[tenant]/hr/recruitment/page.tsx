import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase8/payroll";
import { listHrPhase8Model } from "@/lib/phase8/hr";
import { OperationsPage, RouteButton, StatusBadge } from "../../academics/phase4-view";

export default async function RecruitmentPage() {
  const ctx = await requirePermission("hr.recruitment.read");
  const model = await listHrPhase8Model(ctx.tenantId);
  return <OperationsPage title="Recruitment" subtitle={`${model.postings.length} postings · ${model.applications.length} applications`} rows={model.postings} empty="No recruitment postings yet." columns={[
    { label: "Posting", value: (row) => row.title },
    { label: "Openings", value: (row) => row.openings },
    { label: "Salary", value: (row) => row.salaryRangeMinPaise ? `${formatCurrency(row.salaryRangeMinPaise)}–${formatCurrency(row.salaryRangeMaxPaise ?? row.salaryRangeMinPaise)}` : "—" },
    { label: "Applications", value: (row) => model.applications.filter((app) => app.postingId === row.id).length },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
    { label: "Open", value: (row) => <RouteButton href={`/hr/recruitment/${row.id}`}>Pipeline</RouteButton> },
  ]} />;
}
