import { requirePermission } from "@/lib/auth/guards";
import { listAcademicModel } from "@/lib/phase4/academics";
import { OperationsPage, RouteButton, StatusBadge } from "../phase4-view";

export default async function AcademicYearsPage() {
  const ctx = await requirePermission("academics.read");
  const model = await listAcademicModel(ctx.tenantId);
  return <OperationsPage title="Years & Terms" subtitle={`${model.years.length} academic years, ${model.terms.length} terms`} actions={<RouteButton href="/academics/settings">Academic settings</RouteButton>} rows={model.years} empty="Create an academic year to start building the calendar." columns={[
    { label: "Year", value: (row) => row.name },
    { label: "Dates", value: (row) => `${row.startDate} to ${row.endDate}` },
    { label: "Status", value: (row) => <StatusBadge status={row.isCurrent ? "active" : row.status} /> },
    { label: "Terms", value: (row) => model.terms.filter((term) => term.academicYearId === row.id).map((term) => term.name).join(", ") || "No terms" },
  ]} />;
}
