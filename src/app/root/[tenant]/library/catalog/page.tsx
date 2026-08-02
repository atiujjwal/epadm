import { requirePermission } from "@/lib/auth/guards";
import { listLibraryModel } from "@/lib/phase9/library";
import { OperationsPage, StatusBadge } from "../../academics/phase4-view";

export default async function LibraryCatalogPage() {
  const ctx = await requirePermission("library.read");
  const model = await listLibraryModel(ctx.tenantId);
  return <OperationsPage title="Library Catalog" subtitle={`${model.titles.length} titles · ${model.copies.length} copies`} rows={model.titles} empty="No titles in the catalog yet." columns={[
    { label: "Title", value: (row) => row.title },
    { label: "Author", value: (row) => row.author ?? "-" },
    { label: "ISBN", value: (row) => row.isbn ?? "-" },
    { label: "Copies", value: (row) => `${row.available}/${row.copies} available` },
    { label: "Status", value: (row) => <StatusBadge status={row.status} /> },
  ]} />;
}
