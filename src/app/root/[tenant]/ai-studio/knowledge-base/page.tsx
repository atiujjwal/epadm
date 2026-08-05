import { requirePermission } from "@/lib/auth/guards";
import { listAIKnowledgeBase } from "@/lib/phase12/ai-studio";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function AIKnowledgeBasePage() {
  const ctx = await requirePermission("ai-studio.read");
  const documents = await listAIKnowledgeBase(ctx.tenantId);
  return (
    <PortalShell title="AI Knowledge Base" description="School-specific context used by AI Studio prompts.">
      <SimpleTable rows={documents} empty="No AI context documents yet." columns={[
        { label: "Title", value: (row) => row.title },
        { label: "Category", value: (row) => <Status value={row.category} /> },
        { label: "Active", value: (row) => <Status value={row.isActive} /> },
        { label: "Updated", value: (row) => row.updatedAt.toLocaleString("en-IN") },
      ]} />
    </PortalShell>
  );
}
