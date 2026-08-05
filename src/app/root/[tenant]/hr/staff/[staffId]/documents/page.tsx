import { requirePermission } from "@/lib/auth/guards";

export default async function StaffDocumentsPage() {
  await requirePermission("documents.read");
  return (
    <div className="rounded-lg border bg-surface p-6 text-sm text-muted-foreground">
      Staff document storage is deferred to the managed document storage roadmap. Student certificates and generated documents are live under Documents.
    </div>
  );
}
