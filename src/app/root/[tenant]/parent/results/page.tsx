import { requireRole } from "@/lib/auth/guards";
import { getParentPortalModel } from "@/lib/phase11/portal";
import { EmptyPortal, PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function ParentResultsPage() {
  const ctx = await requireRole(["parent"]);
  const model = await getParentPortalModel(ctx.tenantId, ctx.userId);
  if (!model.data) return <PortalShell title="Results" description="Published results."><EmptyPortal message="No linked child results." /></PortalShell>;
  return <PortalShell title="Results" description="Only published results are visible."><SimpleTable rows={model.data.results} columns={[{ label: "Plan", value: (row) => row.planId }, { label: "Marks", value: (row) => `${row.totalMarksObtained ?? "-"} / ${row.totalMarksMax ?? "-"}` }, { label: "Percentage", value: (row) => row.percentage ?? "-" }, { label: "Grade", value: (row) => row.gradeLabel ?? "-" }, { label: "Pass", value: (row) => <Status value={row.isPass ? "pass" : "review"} /> }]} /></PortalShell>;
}
