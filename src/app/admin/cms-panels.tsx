"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Essentials",
    price: "₹18",
    students: "≤ 500",
    modules: 8,
    tenants: 42,
    features: ["Core academics", "Fees", "Parent app"],
  },
  {
    name: "Professional",
    price: "₹28",
    students: "≤ 2,000",
    modules: 14,
    tenants: 118,
    features: ["+ Payroll", "+ Library & Labs", "+ AI Studio (5k)"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    students: "Unlimited",
    modules: 18,
    tenants: 24,
    features: ["Unlimited AI", "SSO / SAML", "Dedicated CSM"],
  },
];

const smsUsage = [
  { tenant: "Delhi HS", used: 42_180, quota: 50_000, wa: 8420 },
  { tenant: "Mount Public", used: 22_804, quota: 30_000, wa: 4210 },
  { tenant: "Bangalore South", used: 38_010, quota: 40_000, wa: 6100 },
  { tenant: "Chennai Valley", used: 4_820, quota: 10_000, wa: 640 },
];

const aiUsage = [
  { tenant: "Delhi HS", credits: 8_420, cap: 10_000, top: "Report Card Comments" },
  { tenant: "Mount Public", credits: 3_120, cap: 5_000, top: "Notice Composer" },
  { tenant: "Bangalore South", credits: 4_820, cap: 5_000, top: "Exam Creator" },
  { tenant: "Chennai Valley", credits: 480, cap: 1_000, top: "Notice Composer" },
];

const platformUsers = [
  { name: "Aditya Verma", role: "Platform Admin", scope: "Global", last: "2m" },
  { name: "Sana Khan", role: "Customer Success", scope: "North India", last: "18m" },
  { name: "Rohit Menon", role: "Billing", scope: "Global", last: "1h" },
  { name: "Priya Iyer", role: "Support L2", scope: "South India", last: "3h" },
];

const audit = [
  { when: "10:42", actor: "aditya@epadm.com", action: "Upgraded plan · CVS-078 → Professional" },
  { when: "10:14", actor: "system", action: "SMS quota auto-topup · MPS-014 · 10,000 credits" },
  { when: "09:52", actor: "sana@epadm.com", action: "Suspended tenant · KIA-121 (dues > 60d)" },
  { when: "09:04", actor: "rohit@epadm.com", action: "Generated invoices · Jul cycle · 184 tenants" },
];

function StatGrid({ items }: { items: { label: string; value: string; delta?: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-md overflow-hidden border">
      {items.map((s) => (
        <div key={s.label} className="bg-surface p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
          <div className="text-[18px] font-semibold mt-0.5 font-mono tabular-nums">{s.value}</div>
          {s.delta ? (
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.delta}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function UsageBar({ used, quota }: { used: number; quota: number }) {
  const pct = Math.min(100, Math.round((used / quota) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full", pct > 85 ? "bg-danger" : pct > 65 ? "bg-warning" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
        {used.toLocaleString()} / {quota.toLocaleString()}
      </span>
    </div>
  );
}

export function CmsPlansPanel() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {plans.map((p) => (
        <div key={p.name} className="rounded-md border bg-surface p-5">
          <div className="text-[15px] font-semibold">{p.name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {p.students} students · {p.modules} modules
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-[24px] font-semibold font-mono tabular-nums">{p.price}</span>
            {p.price !== "Custom" ? (
              <span className="text-[11px] text-muted-foreground">/ student / mo</span>
            ) : null}
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            Tenants on plan:{" "}
            <span className="font-mono tabular-nums text-foreground">{p.tenants}</span>
          </div>
          <ul className="mt-4 space-y-1.5 text-[12px]">
            {p.features.map((f) => (
              <li key={f} className="text-muted-foreground">
                · {f}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-[11px]">
              Edit plan
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-[11px]">
              Module matrix
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CmsBillingPanel() {
  return (
    <div className="space-y-6">
      <StatGrid
        items={[
          { label: "Invoiced · Jul", value: "₹68.4 L" },
          { label: "Collected", value: "₹52.1 L", delta: "76%" },
          { label: "Overdue", value: "₹4.2 L" },
          { label: "Auto-collect ready", value: "142" },
        ]}
      />
      <div className="rounded-md border bg-surface overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
            <tr>
              {["Invoice", "Tenant", "Cycle", "Amount", "Due", "Status"].map((h) => (
                <th key={h} className="text-left font-medium px-3 py-2 border-b">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {[
              ["INV-2607-142", "Delhi HS", "Jul 2026", "₹58,912", "05 Aug", "Paid"],
              ["INV-2607-143", "Mount Public", "Jul 2026", "₹34,720", "05 Aug", "Pending"],
              ["INV-2607-144", "Chennai Valley", "Jul 2026", "₹11,520", "05 Aug", "Overdue"],
              ["INV-2607-145", "Kochi International", "Jul 2026", "₹7,560", "20 Jun", "Overdue"],
            ].map((r) => (
              <tr key={r[0]} className="hover:bg-muted/40">
                {r.map((c, i) => (
                  <td key={i} className="px-3 py-2">
                    {i === 5 ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 text-[10px]",
                          c === "Paid" && "bg-success/10 text-success border-success/20",
                          c === "Pending" && "bg-warning/10 text-warning border-warning/20",
                          c === "Overdue" && "bg-danger/10 text-danger border-danger/20",
                        )}
                      >
                        {c}
                      </Badge>
                    ) : i === 0 ? (
                      <span className="font-mono text-[11px] text-muted-foreground">{c}</span>
                    ) : (
                      c
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CmsSmsPanel() {
  return (
    <div className="space-y-6">
      <StatGrid
        items={[
          { label: "SMS sent · 7d", value: "3.42 L" },
          { label: "WhatsApp sent · 7d", value: "88 K" },
          { label: "Auto-topups pending", value: "3" },
          { label: "Delivery %", value: "98.6" },
        ]}
      />
      <div className="rounded-md border bg-surface overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
            <tr>
              {["Tenant", "SMS usage", "WhatsApp", "Auto-topup", ""].map((h) => (
                <th key={h || "actions"} className="text-left font-medium px-3 py-2 border-b">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {smsUsage.map((u) => (
              <tr key={u.tenant}>
                <td className="px-3 py-2 font-medium">{u.tenant}</td>
                <td className="px-3 py-2">
                  <UsageBar used={u.used} quota={u.quota} />
                </td>
                <td className="px-3 py-2 font-mono tabular-nums">{u.wa.toLocaleString()}</td>
                <td className="px-3 py-2">
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] bg-success/10 text-success border-success/20"
                  >
                    Enabled
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="ghost" className="h-6 text-[11px]">
                    Adjust
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CmsAiPanel() {
  return (
    <div className="space-y-6">
      <StatGrid
        items={[
          { label: "AI credits · 30d", value: "1.24 M" },
          { label: "Active studios", value: "12" },
          { label: "Tenants near cap", value: "4" },
          { label: "Blocked (PII)", value: "62" },
        ]}
      />
      <div className="rounded-md border bg-surface overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
            <tr>
              {["Tenant", "AI credits", "Top studio", "Cap policy", ""].map((h) => (
                <th key={h || "actions"} className="text-left font-medium px-3 py-2 border-b">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {aiUsage.map((u) => (
              <tr key={u.tenant}>
                <td className="px-3 py-2 font-medium">{u.tenant}</td>
                <td className="px-3 py-2">
                  <UsageBar used={u.credits} quota={u.cap} />
                </td>
                <td className="px-3 py-2">{u.top}</td>
                <td className="px-3 py-2 text-muted-foreground">Auto-block on cap</td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="ghost" className="h-6 text-[11px]">
                    Adjust
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CmsPlatformUsersPanel() {
  return (
    <div className="rounded-md border bg-surface overflow-hidden">
      <table className="w-full text-[12px]">
        <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
          <tr>
            {["User", "Role", "Scope", "Last active", ""].map((h) => (
              <th key={h || "actions"} className="text-left font-medium px-3 py-2 border-b">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {platformUsers.map((u) => (
            <tr key={u.name}>
              <td className="px-3 py-2 font-medium">{u.name}</td>
              <td className="px-3 py-2">{u.role}</td>
              <td className="px-3 py-2 text-muted-foreground">{u.scope}</td>
              <td className="px-3 py-2 font-mono tabular-nums text-muted-foreground">{u.last}</td>
              <td className="px-3 py-2 text-right">
                <Button size="sm" variant="ghost" className="h-6 text-[11px]">
                  Manage
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CmsAuditPanel() {
  return (
    <div className="rounded-md border bg-surface overflow-hidden">
      <table className="w-full text-[12px]">
        <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
          <tr>
            {["When", "Actor", "Action"].map((h) => (
              <th key={h} className="text-left font-medium px-3 py-2 border-b">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {audit.map((a) => (
            <tr key={`${a.when}-${a.actor}`}>
              <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{a.when}</td>
              <td className="px-3 py-2">{a.actor}</td>
              <td className="px-3 py-2">{a.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CmsInfraPanel() {
  return (
    <div className="space-y-6">
      <StatGrid
        items={[
          { label: "Uptime · 30d", value: "99.99%" },
          { label: "Regions", value: "3" },
          { label: "Avg API p95", value: "142ms" },
          { label: "Incidents · 90d", value: "1" },
        ]}
      />
      <div className="rounded-md border bg-surface p-4 text-[12px] text-muted-foreground">
        India-South (primary) · India-West · Singapore (DR). Hourly encrypted per-tenant backups,
        35-day retention. All traffic terminated at edge with mTLS to service mesh.
      </div>
    </div>
  );
}
