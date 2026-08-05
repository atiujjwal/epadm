import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { listDocumentsModel } from "@/lib/phase11/documents";
import { PortalShell, SimpleTable, StatGrid, Status } from "../phase11-view";

export default async function DocumentsPage() {
  const ctx = await requirePermission("documents.read");
  const model = await listDocumentsModel(ctx.tenantId);
  return <PortalShell title="Documents" description="Templates, generation, and certificate history."><StatGrid stats={[{ label: "Templates", value: model.templates.length }, { label: "Generated", value: model.documents.length }]} /><div className="flex gap-2 text-sm">{["templates", "generate", "history"].map((item) => <Link key={item} href={`/documents/${item}`} className="rounded-md border bg-surface px-3 py-2 capitalize">{item}</Link>)}</div><SimpleTable rows={model.documents.slice(0, 8)} columns={[{ label: "Number", value: (row) => row.documentNumber }, { label: "Student", value: (row) => row.studentName }, { label: "Template", value: (row) => row.templateName }, { label: "Status", value: (row) => <Status value={row.status} /> }]} /></PortalShell>;
}
