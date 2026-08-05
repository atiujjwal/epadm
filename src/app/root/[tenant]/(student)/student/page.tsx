import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getStudentPortalModel } from "@/lib/phase11/portal";
import { EmptyPortal, PortalShell, SimpleTable, StatGrid, Status } from "../../phase11-view";

export default async function StudentHomePage() {
  const ctx = await requireRole(["student"]);
  const model = await getStudentPortalModel(ctx.tenantId, ctx.userId);
  if (!model.student || !model.data) return <PortalShell title="Student portal" description="My school workspace."><EmptyPortal message="No student profile is linked to this account." /></PortalShell>;
  return (
    <PortalShell title={`Hello, ${model.student.firstName}`} description={`${model.student.className ?? "Class"} ${model.student.sectionName ?? ""} · Admission ${model.student.admissionNumber}`}>
      <StatGrid stats={[
        { label: "Attendance", value: model.data.attendancePercent == null ? "-" : `${model.data.attendancePercent}%` },
        { label: "Assignments", value: model.data.assignments.length },
        { label: "Borrowed books", value: model.data.library.filter((row) => row.status === "issued" || row.status === "overdue").length },
        { label: "Notices", value: model.announcements.length },
      ]} />
      <div className="flex flex-wrap gap-2 text-sm">
        {["timetable", "assignments", "results", "attendance", "library"].map((item) => <Link key={item} href={`/student/${item}`} className="rounded-md border bg-surface px-3 py-2 capitalize">{item}</Link>)}
      </div>
      <SimpleTable rows={model.announcements} empty="No announcements." columns={[{ label: "Notice", value: (row) => row.title }, { label: "Priority", value: (row) => <Status value={row.priority} /> }, { label: "Published", value: (row) => row.publishedAt?.toLocaleString() ?? "-" }]} />
    </PortalShell>
  );
}
