import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  ShieldCheck,
  Package,
  Layers,
  Users,
  MessageSquare,
  Sparkles,
  Server,
  ChevronRight,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cms")({
  head: () => ({
    meta: [
      { title: "EPADM CMS · Platform Console" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CMSConsole,
});

type NavKey =
  | "overview"
  | "tenants"
  | "plans"
  | "billing"
  | "sms"
  | "ai"
  | "platform-users"
  | "audit"
  | "infra";

const nav: { key: NavKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: Layers },
  { key: "tenants", label: "School Tenants", icon: Building2 },
  { key: "plans", label: "Plans & Modules", icon: Package },
  { key: "billing", label: "Billing & Invoices", icon: Package },
  { key: "sms", label: "SMS / WhatsApp", icon: MessageSquare },
  { key: "ai", label: "AI Services", icon: Sparkles },
  { key: "platform-users", label: "Platform Users", icon: Users },
  { key: "audit", label: "Audit Log", icon: ShieldCheck },
  { key: "infra", label: "Infrastructure", icon: Server },
];

const tenants = [
  { code: "DHS-001", name: "Delhi High School", city: "Delhi", students: 2104, plan: "Enterprise", mrr: "₹58,912", status: "Live", health: 98 },
  { code: "MPS-014", name: "Mount Public School", city: "Mumbai", students: 1240, plan: "Professional", mrr: "₹34,720", status: "Live", health: 96 },
  { code: "BSS-042", name: "Bangalore South Sr. Sec.", city: "Bengaluru", students: 1820, plan: "Professional", mrr: "₹50,960", status: "Live", health: 99 },
  { code: "CVS-078", name: "Chennai Valley School", city: "Chennai", students: 640, plan: "Essentials", mrr: "₹11,520", status: "Trial", health: 82 },
  { code: "HRE-104", name: "Hyderabad Regent Edu.", city: "Hyderabad", students: 980, plan: "Professional", mrr: "₹27,440", status: "Live", health: 94 },
  { code: "KIA-121", name: "Kochi International", city: "Kochi", students: 420, plan: "Essentials", mrr: "₹7,560", status: "Suspended", health: 44 },
];

const plans = [
  { name: "Essentials", price: "₹18", students: "≤ 500", modules: 8, tenants: 42, features: ["Core academics", "Fees", "Parent app"] },
  { name: "Professional", price: "₹28", students: "≤ 2,000", modules: 14, tenants: 118, features: ["+ Payroll", "+ Library & Labs", "+ AI Studio (5k)"] },
  { name: "Enterprise", price: "Custom", students: "Unlimited", modules: 18, tenants: 24, features: ["Unlimited AI", "SSO / SAML", "Dedicated CSM"] },
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

function CMSConsole() {
  const [active, setActive] = useState<NavKey>("overview");

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r bg-surface-muted/40 flex flex-col">
        <div className="h-14 border-b px-3 flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-danger text-white grid place-items-center">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight">EPADM CMS</div>
            <div className="text-[10px] uppercase tracking-wider text-danger">Platform Console</div>
          </div>
        </div>
        <div className="p-2 flex-1 overflow-y-auto">
          {nav.map((n) => {
            const isActive = active === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setActive(n.key)}
                className={cn(
                  "w-full flex items-center gap-2 h-8 px-2 rounded-sm text-[12px] transition-colors",
                  isActive ? "bg-accent text-accent-foreground font-medium" : "text-foreground/80 hover:bg-muted/60",
                )}
              >
                <n.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{n.label}</span>
              </button>
            );
          })}
        </div>
        <div className="border-t p-2">
          <Link
            to="/"
            className="flex items-center gap-2 h-8 px-2 rounded-sm text-[11px] text-muted-foreground hover:bg-muted/60"
          >
            <ChevronRight className="h-3 w-3 rotate-180" /> Exit to marketing site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="h-14 border-b bg-surface px-6 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wider text-danger font-medium">Platform Console · Global scope</div>
            <div className="text-[15px] font-semibold tracking-tight leading-tight capitalize">{nav.find((n) => n.key === active)?.label}</div>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search tenants, users, invoices…" className="h-8 pl-8 text-[12px]" />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-[12px] font-normal text-muted-foreground gap-1.5">
            <Filter className="h-3 w-3" /> Region
          </Button>
          <Button size="sm" className="h-8 text-[12px] gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New tenant
          </Button>
        </div>

        <div className="p-6 flex-1 min-w-0 overflow-x-auto space-y-6">
          {active === "overview" && <Overview />}
          {active === "tenants" && <Tenants />}
          {active === "plans" && <Plans />}
          {active === "billing" && <Billing />}
          {active === "sms" && <SMS />}
          {active === "ai" && <AI />}
          {active === "platform-users" && <PlatformUsers />}
          {active === "audit" && <Audit />}
          {active === "infra" && <Infra />}
        </div>
      </main>
    </div>
  );
}

function StatGrid({ items }: { items: { label: string; value: string; delta?: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-md overflow-hidden border">
      {items.map((s) => (
        <div key={s.label} className="bg-surface p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
          <div className="text-[18px] font-semibold mt-0.5 font-mono tabular">{s.value}</div>
          {s.delta && <div className="text-[10px] text-muted-foreground mt-0.5">{s.delta}</div>}
        </div>
      ))}
    </div>
  );
}

function Overview() {
  return (
    <>
      <StatGrid
        items={[
          { label: "Tenants · Live", value: "184", delta: "+6 this month" },
          { label: "Students on platform", value: "2.42 L" },
          { label: "MRR", value: "₹68.4 L", delta: "+4.8% MoM" },
          { label: "AI credits burned · 7d", value: "148 K" },
        ]}
      />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-md border bg-surface p-4">
          <div className="text-[13px] font-semibold">At-risk tenants (7)</div>
          <div className="mt-3 space-y-2 text-[12px]">
            {[
              ["KIA-121 · Kochi International", "Suspended · dues 60d+"],
              ["CVS-078 · Chennai Valley", "Trial ends in 4d · 0 payment"],
              ["MPS-014 · Mount Public", "Login drop -32% this week"],
            ].map(([t, r]) => (
              <div key={t} className="flex items-center justify-between border rounded-sm p-2">
                <div className="font-medium">{t}</div>
                <div className="text-muted-foreground">{r}</div>
                <Badge variant="outline" className="h-5 text-[10px] bg-warning/10 text-warning border-warning/20">Review</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border bg-surface p-4">
          <div className="text-[13px] font-semibold flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> Platform copilot</div>
          <p className="text-[12px] text-muted-foreground mt-2 leading-relaxed">
            3 tenants will exhaust SMS credits in the next 48h. Auto-topup is configured for 2 · one needs approval.
          </p>
          <Button size="sm" variant="outline" className="mt-3 h-7 text-[11px]">Review topups</Button>
        </div>
      </div>
    </>
  );
}

function Tenants() {
  return (
    <div className="rounded-md border bg-surface overflow-hidden">
      <table className="w-full text-[12px]">
        <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
          <tr>
            {["Code", "School", "City", "Students", "Plan", "MRR", "Health", "Status", ""].map((h) => (
              <th key={h} className="text-left font-medium px-3 py-2 border-b whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {tenants.map((t) => (
            <tr key={t.code} className="hover:bg-muted/40">
              <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{t.code}</td>
              <td className="px-3 py-2 font-medium">{t.name}</td>
              <td className="px-3 py-2">{t.city}</td>
              <td className="px-3 py-2 font-mono tabular">{t.students.toLocaleString()}</td>
              <td className="px-3 py-2">{t.plan}</td>
              <td className="px-3 py-2 font-mono tabular">{t.mrr}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", t.health >= 90 ? "bg-success" : t.health >= 70 ? "bg-warning" : "bg-danger")}
                      style={{ width: `${t.health}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">{t.health}</span>
                </div>
              </td>
              <td className="px-3 py-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-5 text-[10px]",
                    t.status === "Live" && "bg-success/10 text-success border-success/20",
                    t.status === "Trial" && "bg-warning/10 text-warning border-warning/20",
                    t.status === "Suspended" && "bg-danger/10 text-danger border-danger/20",
                  )}
                >
                  {t.status}
                </Badge>
              </td>
              <td className="px-3 py-2 text-right">
                <Button size="sm" variant="ghost" className="h-6 text-[11px]">Manage</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Plans() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {plans.map((p) => (
        <div key={p.name} className="rounded-md border bg-surface p-5">
          <div className="text-[15px] font-semibold">{p.name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{p.students} students · {p.modules} modules</div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-[24px] font-semibold font-mono tabular">{p.price}</span>
            {p.price !== "Custom" && <span className="text-[11px] text-muted-foreground">/ student / mo</span>}
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">Tenants on plan: <span className="font-mono tabular text-foreground">{p.tenants}</span></div>
          <ul className="mt-4 space-y-1.5 text-[12px]">
            {p.features.map((f) => <li key={f} className="text-muted-foreground">· {f}</li>)}
          </ul>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-[11px]">Edit plan</Button>
            <Button size="sm" variant="ghost" className="h-7 text-[11px]">Module matrix</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Billing() {
  return (
    <>
      <StatGrid items={[
        { label: "Invoiced · Jul", value: "₹68.4 L" },
        { label: "Collected", value: "₹52.1 L", delta: "76%" },
        { label: "Overdue", value: "₹4.2 L" },
        { label: "Auto-collect ready", value: "142" },
      ]}/>
      <div className="rounded-md border bg-surface overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
            <tr>{["Invoice", "Tenant", "Cycle", "Amount", "Due", "Status"].map(h => (
              <th key={h} className="text-left font-medium px-3 py-2 border-b">{h}</th>
            ))}</tr>
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
                      <Badge variant="outline" className={cn("h-5 text-[10px]",
                        c === "Paid" && "bg-success/10 text-success border-success/20",
                        c === "Pending" && "bg-warning/10 text-warning border-warning/20",
                        c === "Overdue" && "bg-danger/10 text-danger border-danger/20")}
                      >{c}</Badge>
                    ) : i === 0 ? <span className="font-mono text-[11px] text-muted-foreground">{c}</span> : c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function UsageBar({ used, quota }: { used: number; quota: number }) {
  const pct = Math.min(100, Math.round((used / quota) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full", pct > 85 ? "bg-danger" : pct > 65 ? "bg-warning" : "bg-primary")} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-mono tabular text-muted-foreground">{used.toLocaleString()} / {quota.toLocaleString()}</span>
    </div>
  );
}

function SMS() {
  return (
    <>
      <StatGrid items={[
        { label: "SMS sent · 7d", value: "3.42 L" },
        { label: "WhatsApp sent · 7d", value: "88 K" },
        { label: "Auto-topups pending", value: "3" },
        { label: "Delivery %", value: "98.6" },
      ]}/>
      <div className="rounded-md border bg-surface overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
            <tr>{["Tenant", "SMS usage", "WhatsApp", "Auto-topup", ""].map(h => (
              <th key={h} className="text-left font-medium px-3 py-2 border-b">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {smsUsage.map((u) => (
              <tr key={u.tenant}>
                <td className="px-3 py-2 font-medium">{u.tenant}</td>
                <td className="px-3 py-2"><UsageBar used={u.used} quota={u.quota} /></td>
                <td className="px-3 py-2 font-mono tabular">{u.wa.toLocaleString()}</td>
                <td className="px-3 py-2"><Badge variant="outline" className="h-5 text-[10px] bg-success/10 text-success border-success/20">Enabled</Badge></td>
                <td className="px-3 py-2 text-right"><Button size="sm" variant="ghost" className="h-6 text-[11px]">Adjust</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AI() {
  return (
    <>
      <StatGrid items={[
        { label: "AI credits · 30d", value: "1.24 M" },
        { label: "Active studios", value: "12" },
        { label: "Tenants near cap", value: "4" },
        { label: "Blocked (PII)", value: "62" },
      ]}/>
      <div className="rounded-md border bg-surface overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
            <tr>{["Tenant", "AI credits", "Top studio", "Cap policy", ""].map(h => (
              <th key={h} className="text-left font-medium px-3 py-2 border-b">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {aiUsage.map((u) => (
              <tr key={u.tenant}>
                <td className="px-3 py-2 font-medium">{u.tenant}</td>
                <td className="px-3 py-2"><UsageBar used={u.credits} quota={u.cap} /></td>
                <td className="px-3 py-2">{u.top}</td>
                <td className="px-3 py-2 text-muted-foreground">Auto-block on cap</td>
                <td className="px-3 py-2 text-right"><Button size="sm" variant="ghost" className="h-6 text-[11px]">Adjust</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PlatformUsers() {
  return (
    <div className="rounded-md border bg-surface overflow-hidden">
      <table className="w-full text-[12px]">
        <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
          <tr>{["User", "Role", "Scope", "Last active", ""].map(h => (
            <th key={h} className="text-left font-medium px-3 py-2 border-b">{h}</th>
          ))}</tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {platformUsers.map((u) => (
            <tr key={u.name}>
              <td className="px-3 py-2 font-medium">{u.name}</td>
              <td className="px-3 py-2">{u.role}</td>
              <td className="px-3 py-2 text-muted-foreground">{u.scope}</td>
              <td className="px-3 py-2 font-mono tabular text-muted-foreground">{u.last}</td>
              <td className="px-3 py-2 text-right"><Button size="sm" variant="ghost" className="h-6 text-[11px]">Manage</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Audit() {
  return (
    <div className="rounded-md border bg-surface overflow-hidden">
      <table className="w-full text-[12px]">
        <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
          <tr>{["When", "Actor", "Action"].map(h => (
            <th key={h} className="text-left font-medium px-3 py-2 border-b">{h}</th>
          ))}</tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {audit.map((a, i) => (
            <tr key={i}>
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

function Infra() {
  return (
    <>
      <StatGrid items={[
        { label: "Uptime · 30d", value: "99.99%" },
        { label: "Regions", value: "3" },
        { label: "Avg API p95", value: "142ms" },
        { label: "Incidents · 90d", value: "1" },
      ]}/>
      <div className="rounded-md border bg-surface p-4 text-[12px] text-muted-foreground">
        India-South (primary) · India-West · Singapore (DR). Hourly encrypted per-tenant backups, 35-day retention. All traffic terminated at edge with mTLS to service mesh.
      </div>
    </>
  );
}
