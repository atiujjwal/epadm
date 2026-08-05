import { desc, eq, and } from "drizzle-orm";
import { getCtx } from "@/lib/context";
import { attendance } from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { SimpleTable, Status } from "../../../phase11-view";

export default async function StudentAttendancePage({ params }: { params: Promise<{ studentId: string }> }) {
  const ctx = await getCtx();
  const { studentId } = await params;
  const rows = await withTenant(ctx.tenantId, (tx) => tx
    .select()
    .from(attendance)
    .where(and(eq(attendance.tenantId, ctx.tenantId), eq(attendance.studentId, studentId)))
    .orderBy(desc(attendance.date))
    .limit(60));
  return <SimpleTable rows={rows} empty="No attendance records yet." columns={[
    { label: "Date", value: (row) => row.date },
    { label: "Status", value: (row) => <Status value={row.status} /> },
    { label: "Notes", value: (row) => row.notes ?? "-" },
  ]} />;
}
