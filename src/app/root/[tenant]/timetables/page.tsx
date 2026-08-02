import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { listTimetableModel } from "@/lib/phase4/academics";
import { OperationsPage, RouteButton, StatusBadge } from "../academics/phase4-view";

export default async function TimetablesPage() {
  const ctx = await requirePermission("timetables.read");
  const model = await listTimetableModel(ctx.tenantId);
  return <OperationsPage title="Timetables" subtitle={`${model.versions.length} versions, ${model.periods.length} periods`} actions={<RouteButton href="/timetables/settings">Period settings</RouteButton>} rows={model.versions} empty="Create a draft timetable version after configuring periods." columns={[
    { label: "Version", value: (row) => <Link className="text-primary underline-offset-4 hover:underline" href={`/timetables/${row.id}`}>{row.name}</Link> },
    { label: "Academic year", value: (row) => model.years.find((year) => year.id === row.academicYearId)?.name ?? "Unknown" },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
    { label: "Slots", value: (row) => model.slots.filter((slot) => slot.versionId === row.id).length },
  ]} />;
}
