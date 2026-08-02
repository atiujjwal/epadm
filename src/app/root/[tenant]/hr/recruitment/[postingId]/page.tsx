import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/phase8/payroll";
import { listHrPhase8Model } from "@/lib/phase8/hr";
import { OperationsPage, StatusBadge } from "../../../academics/phase4-view";

export default async function RecruitmentPostingPage({ params }: { params: Promise<{ postingId: string }> }) {
  const ctx = await requirePermission("hr.recruitment.read");
  const { postingId } = await params;
  const model = await listHrPhase8Model(ctx.tenantId);
  const posting = model.postings.find((item) => item.id === postingId);
  if (!posting) notFound();
  const rows = model.applications.filter((app) => app.postingId === postingId);
  return <OperationsPage title={posting.title} subtitle={`${rows.length} candidates in pipeline`} rows={rows} empty="No applications for this posting." columns={[
    { label: "Candidate", value: (row) => row.candidateName },
    { label: "Email", value: (row) => row.candidateEmail ?? "—" },
    { label: "Expected CTC", value: (row) => row.expectedCtcPaise ? formatCurrency(row.expectedCtcPaise) : "—" },
    { label: "Stage", value: (row) => <StatusBadge status={row.stage} /> },
  ]} />;
}
