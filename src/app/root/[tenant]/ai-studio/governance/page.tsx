import { requirePermission } from "@/lib/auth/guards";
import { listAIGenerations } from "@/lib/phase12/ai-studio";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function AIGovernancePage() {
  const ctx = await requirePermission("ai-studio.governance");
  const generations = await listAIGenerations(ctx.tenantId);
  return (
    <PortalShell title="AI Governance" description="Audit trail of generated drafts, review outcomes, and applied content targets.">
      <SimpleTable rows={generations} empty="No AI generations yet." columns={[
        { label: "Feature", value: (row) => row.feature },
        { label: "Summary", value: (row) => row.inputSummary },
        { label: "Status", value: (row) => <Status value={row.status} /> },
        { label: "Applied target", value: (row) => row.appliedToType ? `${row.appliedToType}:${row.appliedToId ?? ""}` : "-" },
      ]} />
    </PortalShell>
  );
}
