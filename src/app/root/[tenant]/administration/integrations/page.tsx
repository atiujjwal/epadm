import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { listIntegrations } from "@/lib/phase3/administration";
const catalog = [
  { key: "biometrics", name: "Biometric devices", description: "Attendance device webhook and integration keys", live: true },
  { key: "gps", name: "GPS / vehicle tracking", description: "Vehicle telemetry webhook and credentials", live: true },
  { key: "email", name: "Email provider", description: "SMTP delivery for invitations and password resets", live: true },
  { key: "sms", name: "SMS gateway", description: "Messaging provider configuration", live: false },
  { key: "payment", name: "Payment gateway", description: "Online payment provider configuration", live: false },
] as const;
export default async function IntegrationsPage() { const ctx = await requirePermission("administration.integrations.read"); const configured = await listIntegrations(ctx.tenantId); return <div className="space-y-6"><PageHeader title="Integrations" description="Connect school infrastructure and communication providers."/><div className="grid gap-4 md:grid-cols-2">{catalog.map((item)=>{const saved=configured.find((row)=>row.integrationKey===item.key);return <Card key={item.key} padding="lg"><div className="flex justify-between"><h2 className="font-semibold">{item.name}</h2><Badge variant={!item.live ? "default" : saved?.status === "active" ? "success" : "warning"}>{!item.live ? "Coming soon" : saved?.status === "active" ? "Connected" : "Not connected"}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{item.description}</p>{item.live?<p className="mt-4 rounded bg-muted p-2 font-mono text-xs">/api/webhooks/{item.key === "biometrics" ? "biometrics" : item.key === "gps" ? "gps" : "—"}</p>:null}</Card>})}</div></div>; }
