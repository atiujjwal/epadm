import { requirePermission } from "@/lib/auth/guards";
import { listFacilitiesModel } from "@/lib/phase10/facilities";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function HealthRecordsPage() {
  const ctx = await requirePermission("facilities.health.manage");
  const model = await listFacilitiesModel(ctx.tenantId, true);
  return (
    <OperationsPage
      title="Student Health Records"
      subtitle="Sensitive medical visit register - restricted access"
      rows={model.healthRecords}
      empty="No health visits recorded."
      columns={[
        { label: "Student", value: (row) => row.studentName },
        { label: "Admission", value: (row) => row.admissionNumber },
        { label: "Visit", value: (row) => row.visitAt.toLocaleString() },
        { label: "Complaint", value: (row) => row.complaint },
        { label: "Treatment", value: (row) => row.treatment ?? "-" },
        { label: "Emergency", value: (row) => <StatusBadge status={row.isEmergency ? "emergency" : "routine"} /> },
        { label: "Parent notified", value: (row) => <StatusBadge status={row.parentNotified ? "yes" : "no"} /> },
      ]}
    />
  );
}
