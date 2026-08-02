import { requirePermission } from "@/lib/auth/guards";
import { listCurriculum } from "@/lib/phase4/academics";
import { OperationsPage } from "../../academics/phase4-view";

export default async function CoveragePage() {
  const ctx = await requirePermission("curriculum.read");
  const curriculum = await listCurriculum(ctx.tenantId);
  const rows = curriculum.classes.map((item) => ({ ...item, offerings: curriculum.offerings.filter((offering) => offering.classId === item.id).length }));
  return <OperationsPage title="Coverage" subtitle="Prototype coverage report backed by live offerings" rows={rows} empty="No classes available for coverage reporting." columns={[
    { label: "Class", value: (row) => row.name },
    { label: "Offerings", value: (row) => row.offerings },
    { label: "Status", value: (row) => row.offerings > 0 ? "Covered" : "Needs offerings" },
  ]} />;
}
