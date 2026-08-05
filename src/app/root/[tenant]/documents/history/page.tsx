import { requirePermission } from "@/lib/auth/guards";
import { listDocumentsModel } from "@/lib/phase11/documents";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function DocumentHistoryPage() {
  const ctx = await requirePermission("documents.read");
  const model = await listDocumentsModel(ctx.tenantId);
  return <PortalShell title="Generated documents" description="Generated certificate and letter history."><SimpleTable rows={model.documents} columns={[{ label: "Number", value: (row) => row.documentNumber }, { label: "Student", value: (row) => `${row.studentName} (${row.admissionNumber})` }, { label: "Template", value: (row) => row.templateName }, { label: "Generated", value: (row) => row.generatedAt.toLocaleString() }, { label: "Status", value: (row) => <Status value={row.status} /> }, { label: "Download", value: (row) => row.pdfUrl ? <a className="text-primary underline" href={`/api/v1/documents/${row.id}/download`}>PDF</a> : "-" }]} /></PortalShell>;
}
