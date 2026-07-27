import { getStaffSummary, listStaff, listStaffDepartments } from "@/lib/admin/registries";
import { getCtx } from "@/lib/context";
import { StaffWorkspace } from "./staff-workspace";

export default async function StaffPage() {
  const ctx = await getCtx();
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
