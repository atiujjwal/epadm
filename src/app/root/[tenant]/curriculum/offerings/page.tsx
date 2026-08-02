import { requirePermission } from "@/lib/auth/guards";
import { listCurriculum } from "@/lib/phase4/academics";
import { OperationsPage, RouteButton } from "../../academics/phase4-view";

export default async function OfferingsPage() {
  const ctx = await requirePermission("curriculum.read");
  const curriculum = await listCurriculum(ctx.tenantId);
  return <OperationsPage title="Curriculum Offerings" subtitle={`${curriculum.offerings.length} subject-class-year links`} actions={<RouteButton href="/curriculum/teacher-allocation">Teacher allocation</RouteButton>} rows={curriculum.offerings} empty="Create offerings to link subjects to classes for an academic year." columns={[
    { label: "Class", value: (row) => curriculum.classes.find((item) => item.id === row.classId)?.name ?? "Unknown" },
    { label: "Subject", value: (row) => curriculum.subjects.find((item) => item.id === row.subjectId)?.name ?? "Unknown" },
    { label: "Periods/week", value: (row) => row.periodsPerWeek },
    { label: "Type", value: (row) => row.isCore ? "Core" : "Elective" },
  ]} />;
}
