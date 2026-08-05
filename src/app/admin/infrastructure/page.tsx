import { getInfrastructureHealth } from "@/lib/platform/ops-console";

export const dynamic = "force-dynamic";

export default async function InfrastructurePage() {
  const health = await getInfrastructureHealth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Infrastructure Health</h1>
        <p className="text-sm text-muted-foreground">Database connectivity, migration status, and platform telemetry baseline.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Database" value={health.db} />
        <Stat label="Query latency" value={`${health.latencyMs} ms`} />
        <Stat label="Tenants" value={String(health.tenantCount)} />
        <Stat label="Generated" value={new Date(health.generatedAt).toLocaleTimeString("en-IN")} />
      </div>
      <pre className="overflow-auto rounded-md border bg-surface p-4 text-xs">{JSON.stringify({ latestMigration: health.latestMigration, latestMetrics: health.latestMetrics }, null, 2)}</pre>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border bg-surface p-4"><div className="text-xs uppercase text-muted-foreground">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div></div>;
}
