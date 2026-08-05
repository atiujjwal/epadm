import { requirePermission } from "@/lib/auth/guards";
import { listDocumentsModel } from "@/lib/phase11/documents";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function DocumentTemplatesPage() {
  const ctx = await requirePermission("documents.read");
  const model = await listDocumentsModel(ctx.tenantId);
  return <PortalShell title="Document templates" description="Tenant certificate and letter templates."><SimpleTable rows={model.templates} columns={[{ label: "Name", value: (row) => row.name }, { label: "Type", value: (row) => row.documentType }, { label: "Default", value: (row) => <Status value={row.isDefault ? "yes" : "no"} /> }, { label: "Active", value: (row) => <Status value={row.isActive ? "active" : "disabled"} /> }]} /></PortalShell>;
}
