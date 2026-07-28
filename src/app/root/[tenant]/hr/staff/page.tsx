import { getStaffSummary, listStaff, listStaffDepartments } from "@/lib/admin/registries";
import { requirePermission } from "@/lib/auth/guards";
import { StaffWorkspace } from "../../staff/staff-workspace";

export default async function StaffPage() {
  const ctx = await requirePermission("hr.read");
  const [initialStaff, departments, summary] = await Promise.all([
    listStaff(ctx.tenantId),
    listStaffDepartments(ctx.tenantId),
    getStaffSummary(ctx.tenantId),
  ]);

  return (
    <StaffWorkspace
      initialStaff={initialStaff}
      initialDepartments={departments}
      total={summary.total}
      active={summary.active}
    />
  );
}
