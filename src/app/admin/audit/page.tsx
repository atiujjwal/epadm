import { listPlatformAuditLogs } from "@/lib/platform/ops-console";

export const dynamic = "force-dynamic";

export default async function PlatformAuditPage() {
  const rows = await listPlatformAuditLogs();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Platform Audit Log</h1>
        <p className="text-sm text-muted-foreground">Provisioning, support access, and platform configuration events.</p>
      </div>
      <div className="rounded-md border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Operator</th><th className="px-4 py-3">Created</th></tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">{row.action}</td>
                <td className="px-4 py-3">{row.entityType}:{row.entityId}</td>
                <td className="px-4 py-3">{row.operatorId ?? "-"}</td>
                <td className="px-4 py-3">{row.createdAt.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
