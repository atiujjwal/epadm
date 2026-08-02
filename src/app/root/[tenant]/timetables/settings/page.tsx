import { requirePermission } from "@/lib/auth/guards";
import { listTimetableModel } from "@/lib/phase4/academics";
import { OperationsPage } from "../../academics/phase4-view";

export default async function TimetableSettingsPage() {
  const ctx = await requirePermission("timetables.read");
  const model = await listTimetableModel(ctx.tenantId);
  return <OperationsPage title="Period Settings" subtitle="Working days: Monday to Friday by default" rows={model.periods} empty="No periods configured. Use the settings API to create standard periods." columns={[
    { label: "Period", value: (row) => row.name },
    { label: "Time", value: (row) => `${row.startTime} - ${row.endTime}` },
    { label: "Break", value: (row) => row.isBreak ? "Yes" : "No" },
    { label: "Order", value: (row) => row.displayOrder },
  ]} />;
}
