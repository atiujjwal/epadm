import { requirePermission } from "@/lib/auth/guards";
import { listCurriculum } from "@/lib/phase4/academics";
import { OperationsPage } from "../../academics/phase4-view";

export default async function TeacherAllocationPage() {
  const ctx = await requirePermission("curriculum.read");
  const curriculum = await listCurriculum(ctx.tenantId);
  return <OperationsPage title="Teacher Allocation" subtitle={`${curriculum.allocations.length} section-level allocations`} rows={curriculum.allocations} empty="No teachers allocated to offerings yet." columns={[
    { label: "Teacher", value: (row) => curriculum.staff.find((item) => item.id === row.staffId)?.fullName ?? "Unknown" },
    { label: "Section", value: (row) => curriculum.sections.find((item) => item.id === row.sectionId)?.name ?? "Unknown" },
    { label: "Subject", value: (row) => {
      const offering = curriculum.offerings.find((item) => item.id === row.offeringId);
      return curriculum.subjects.find((item) => item.id === offering?.subjectId)?.name ?? "Unknown";
    } },
    { label: "Primary", value: (row) => row.isPrimary ? "Yes" : "No" },
  ]} />;
}
