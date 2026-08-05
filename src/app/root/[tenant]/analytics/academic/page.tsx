import { requirePermission } from "@/lib/auth/guards";
import { getRoleAnalytics } from "@/lib/phase12/analytics";
import { PortalShell, StatGrid } from "../../phase11-view";

export default async function AcademicAnalyticsPage() {
  const ctx = await requirePermission("analytics.academic.read");
  const data = await getRoleAnalytics(ctx.tenantId, "academic") as Record<string, unknown>;
  return (
    <PortalShell title="Academic Analytics" description="Enrollment, attendance, and published result health from cached tenant snapshots.">
      <StatGrid stats={[
        { label: "Active enrollments", value: Number(data.activeEnrollments ?? 0) },
        { label: "Attendance rows", value: Number(data.attendanceMarked ?? 0) },
        { label: "Absent rows", value: Number(data.absentRows ?? 0) },
        { label: "Attendance rate", value: `${Number(data.attendanceRate ?? 0)}%` },
      ]} />
    </PortalShell>
  );
}
