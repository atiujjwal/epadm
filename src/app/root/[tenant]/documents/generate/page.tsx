import { requirePermission } from "@/lib/auth/guards";
import { listDocumentsModel } from "@/lib/phase11/documents";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function GenerateDocumentsPage() {
  const ctx = await requirePermission("documents.generate");
  const model = await listDocumentsModel(ctx.tenantId);
  return <PortalShell title="Generate document" description="Use POST /api/v1/documents/generate with studentId, templateId, and customFields."><SimpleTable rows={model.templates} columns={[{ label: "Template", value: (row) => row.name }, { label: "Type", value: (row) => row.documentType }, { label: "Variables", value: (row) => row.variables?.join(", ") ?? "-" }, { label: "Active", value: (row) => <Status value={row.isActive ? "active" : "disabled"} /> }]} /></PortalShell>;
}
