import { getStaffSummary, listStaff } from "@/lib/admin/registries";
import { getCtx } from "@/lib/context";
import { StaffWorkspace } from "./staff-workspace";

export default async function StaffPage() {
  const ctx = await getCtx();
  const [initialStaff, summary] = await Promise.all([
    listStaff(ctx.tenantId),
    getStaffSummary(ctx.tenantId),
  ]);

  return (
    <StaffWorkspace
      initialStaff={initialStaff}
      total={summary.total}
      active={summary.active}
    />
  );
}
