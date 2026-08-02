import { requirePermission } from "@/lib/auth/guards";
import { auditTimetableConflicts, listTimetableModel } from "@/lib/phase4/academics";
import { OperationsPage } from "../../academics/phase4-view";

export default async function TimetableConflictsPage() {
  const ctx = await requirePermission("timetables.read");
  const model = await listTimetableModel(ctx.tenantId);
  const published = model.versions.find((version) => version.status === "published") ?? model.versions[0];
  const audit = published ? await auditTimetableConflicts(ctx.tenantId, published.id) : { warnings: [] };
  return <OperationsPage title="Conflict Report" subtitle={published ? `Audit for ${published.name}` : "No timetable version available"} rows={audit.warnings} empty="No timetable warnings found." columns={[
    { label: "Type", value: (row) => row.type },
    { label: "Message", value: (row) => row.message },
  ]} />;
}
