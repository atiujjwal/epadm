import { requirePermission } from "@/lib/auth/guards";
import { getStudentHealthSummary } from "@/lib/phase10/facilities";
import { OperationsPage, StatusBadge } from "../../../academics/phase4-view";

export default async function StudentHealthPage({ params }: { params: Promise<{ studentId: string }> }) {
  const ctx = await requirePermission("facilities.health.manage");
  const { studentId } = await params;
  const rows = await getStudentHealthSummary(ctx.tenantId, studentId, ["facilities.health.manage"]);
  return (
    <OperationsPage
      title="Health"
      subtitle="Sensitive student health visits - restricted access"
      rows={rows}
      empty="No health visits for this student."
      columns={[
        { label: "Visit", value: (row) => row.visitAt.toLocaleString() },
        { label: "Complaint", value: (row) => row.complaint },
        { label: "Diagnosis", value: (row) => row.diagnosis ?? "-" },
        { label: "Treatment", value: (row) => row.treatment ?? "-" },
        { label: "Emergency", value: (row) => <StatusBadge status={row.isEmergency ? "emergency" : "routine"} /> },
        { label: "Parent notified", value: (row) => <StatusBadge status={row.parentNotified ? "yes" : "no"} /> },
      ]}
    />
  );
}
