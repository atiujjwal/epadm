import { requirePermission } from "@/lib/auth/guards";
import { AI_FEATURES, type AIFeatureKey, listAIGenerations } from "@/lib/phase12/ai-studio";
import { PortalShell, SimpleTable, Status } from "../phase11-view";

export async function AiFeatureShell({ featureKey }: { featureKey: AIFeatureKey }) {
  const feature = AI_FEATURES.find((item) => item.key === featureKey);
  const ctx = await requirePermission("ai-studio.use");
  const generations = await listAIGenerations(ctx.tenantId, featureKey);
  return (
    <PortalShell title={feature?.label ?? "AI Studio Feature"} description={feature?.description ?? "Create governed AI drafts that require human review before use."}>
      <div className="rounded-lg border bg-surface p-4 text-sm">
        <p className="font-medium">Generate a draft</p>
        <p className="mt-1 text-muted-foreground">
          POST <code>/api/v1/ai-studio/generate</code> with <code>{JSON.stringify({ feature: featureKey, prompt: "Describe what you need", context: {} })}</code>.
          The response is saved as a draft in the governance log.
        </p>
      </div>
      <SimpleTable rows={generations} empty="No drafts for this feature yet." columns={[
        { label: "Summary", value: (row) => row.inputSummary },
        { label: "Status", value: (row) => <Status value={row.status} /> },
        { label: "Tokens", value: (row) => `${row.promptTokens ?? 0} / ${row.outputTokens ?? 0}` },
        { label: "Created", value: (row) => row.createdAt.toLocaleString("en-IN") },
      ]} />
    </PortalShell>
  );
}
