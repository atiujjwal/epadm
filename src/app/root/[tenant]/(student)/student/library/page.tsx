import { requireRole } from "@/lib/auth/guards";
import { getStudentPortalModel } from "@/lib/phase11/portal";
import { EmptyPortal, PortalShell, SimpleTable, Status, formatINR } from "../../../phase11-view";

export default async function StudentLibraryPage() {
  const ctx = await requireRole(["student"]);
  const model = await getStudentPortalModel(ctx.tenantId, ctx.userId);
  if (!model.data) return <PortalShell title="My library" description="Borrowed books and issue history."><EmptyPortal message="No student profile linked." /></PortalShell>;
  return <PortalShell title="My library" description="Borrowed books and issue history."><SimpleTable rows={model.data.library} columns={[{ label: "Title", value: (row) => row.title }, { label: "Accession", value: (row) => row.accessionNumber }, { label: "Due", value: (row) => row.dueDate }, { label: "Status", value: (row) => <Status value={row.status} /> }, { label: "Fine", value: (row) => formatINR(row.finePaise) }]} /></PortalShell>;
}
