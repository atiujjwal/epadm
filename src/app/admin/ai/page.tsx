import { getPlatformAiGovernance } from "@/lib/platform/ops-console";

export const dynamic = "force-dynamic";

export default async function PlatformAiPage() {
  const model = await getPlatformAiGovernance();
  const failedRate = model.totalGenerations ? Math.round((model.failedGenerations / model.totalGenerations) * 1000) / 10 : 0;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Platform AI Governance</h1>
        <p className="text-sm text-muted-foreground">Cross-tenant usage, budget posture, and generation governance.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Total tokens" value={model.totalTokens.toLocaleString("en-IN")} />
        <Stat label="Generations" value={model.totalGenerations.toLocaleString("en-IN")} />
        <Stat label="Rejected rate" value={`${failedRate}%`} />
        <Stat label="Platform key" value={model.platformKeyConfigured ? "Configured" : "Missing"} />
      </div>
      <div className="rounded-md border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Tenant</th><th className="px-4 py-3">Tokens used</th><th className="px-4 py-3">Limit</th><th className="px-4 py-3">Usage</th></tr>
          </thead>
          <tbody className="divide-y">
            {model.usage.map((row) => (
              <tr key={row.tenantId}>
                <td className="px-4 py-3">{row.tenantName ?? row.tenantSlug ?? row.tenantId}</td>
                <td className="px-4 py-3">{row.tokensUsedThisMonth.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">{row.monthlyTokenLimit.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">{row.monthlyTokenLimit ? `${Math.round((row.tokensUsedThisMonth / row.monthlyTokenLimit) * 100)}%` : "0%"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border bg-surface p-4"><div className="text-xs uppercase text-muted-foreground">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div></div>;
}
