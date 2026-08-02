import { listTimetableEntries } from "@/lib/admin/timetable";
import { getCtx } from "@/lib/context";
import { TimetableWorkspace } from "./timetable-workspace";

export default async function TimetablePage() {
  const ctx = await getCtx();
  const entries = await listTimetableEntries(ctx.tenantId);

  return <TimetableWorkspace initialEntries={entries} />;
}
