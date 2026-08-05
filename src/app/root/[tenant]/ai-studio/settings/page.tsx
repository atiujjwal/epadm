import { requirePermission } from "@/lib/auth/guards";
import { AI_FEATURES, ensureAISettings } from "@/lib/phase12/ai-studio";
import { PortalShell, SimpleTable, StatGrid, Status } from "../../phase11-view";

export default async function AISettingsPage() {
  const ctx = await requirePermission("ai-studio.settings");
  const settings = await ensureAISettings(ctx.tenantId);
  return (
    <PortalShell title="AI Studio Settings" description="Tenant AI feature toggles, token usage, and monthly limits.">
      <StatGrid stats={[
        { label: "Limit", value: settings.monthlyTokenLimit.toLocaleString("en-IN") },
        { label: "Used", value: settings.tokensUsedThisMonth.toLocaleString("en-IN") },
        { label: "Reset date", value: settings.usageResetDate ?? "-" },
        { label: "Custom key", value: settings.customApiKeyHash ? "Configured" : "Platform default" },
      ]} />
      <SimpleTable rows={[...AI_FEATURES]} columns={[
        { label: "Feature", value: (row) => row.label },
        { label: "Enabled", value: (row) => <Status value={settings.featuresEnabled?.includes(row.key) ? "enabled" : "disabled"} /> },
        { label: "Description", value: (row) => row.description },
      ]} />
    </PortalShell>
  );
}
