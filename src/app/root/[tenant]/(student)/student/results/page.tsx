import { requireRole } from "@/lib/auth/guards";
import { getStudentPortalModel } from "@/lib/phase11/portal";
import { EmptyPortal, PortalShell, SimpleTable, Status } from "../../../phase11-view";

export default async function StudentResultsPage() {
  const ctx = await requireRole(["student"]);
  const model = await getStudentPortalModel(ctx.tenantId, ctx.userId);
  if (!model.data) return <PortalShell title="My results" description="Published results only."><EmptyPortal message="No student profile linked." /></PortalShell>;
  return <PortalShell title="My results" description="Published results only."><SimpleTable rows={model.data.results} columns={[{ label: "Plan", value: (row) => row.planId }, { label: "Marks", value: (row) => `${row.totalMarksObtained ?? "-"} / ${row.totalMarksMax ?? "-"}` }, { label: "Percentage", value: (row) => row.percentage ?? "-" }, { label: "Grade", value: (row) => row.gradeLabel ?? "-" }, { label: "Pass", value: (row) => <Status value={row.isPass ? "pass" : "review"} /> }]} /></PortalShell>;
}
