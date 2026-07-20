"use client";

import { PageHeader } from "@/components/workspace/app-shell";
import { ExportMenu } from "@/components/workspace/export-menu";
import { Button } from "@/components/ui/button-base";
import { Badge } from "@/components/ui/badge";
import {
  kpis,
  attendanceSeries,
  feesSeries,
  admissionsFunnel,
  activity,
  insights,
  todaysFeeCollection,
  feesLast15Days,
  todaysAttendanceByGrade,
  attendanceEntryStatus,
  birthdaysToday,
  birthdaysThisMonth,
} from "@/data/mock";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  ArrowRight,
  Plus,
  Cake,
  Wallet,
  ClipboardCheck,
  CalendarClock,
  Receipt,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DashboardLiveStats = {
  studentTotal: number;
  studentActive: number;
  staffTotal: number;
  staffActive: number;
  pendingInvoiceCount: number;
  outstandingAmount: number;
};

type Props = {
  liveStats?: DashboardLiveStats;
};

function formatINR(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function buildKpis(live?: DashboardLiveStats) {
  if (!live) return kpis;

  return [
    {
      label: "Total Enrollment",
      value: live.studentTotal.toLocaleString("en-IN"),
      delta: live.studentActive === live.studentTotal ? "all active" : `${live.studentActive} active`,
      trend: "up" as const,
      hint: "live student count",
    },
    kpis[1],
    kpis[2],
    {
      label: "Outstanding Dues",
      value: live.outstandingAmount > 0 ? formatINR(live.outstandingAmount) : "—",
      delta: live.pendingInvoiceCount > 0 ? `${live.pendingInvoiceCount} pending` : "none",
      trend: live.pendingInvoiceCount > 0 ? ("down" as const) : ("flat" as const),
      hint: live.pendingInvoiceCount > 0 ? "pending & overdue invoices" : "no open invoices",
    },
    {
      label: "Staff Present",
      value: `${live.staffActive} / ${live.staffTotal}`,
      delta: live.staffTotal > 0 ? `${Math.round((live.staffActive / live.staffTotal) * 100)}%` : "—",
      trend: "flat" as const,
      hint: `${live.staffTotal - live.staffActive} inactive`,
    },
    kpis[5],
  ];
}

export default function Dashboard({ liveStats }: Props) {
  const kpiStrip = buildKpis(liveStats);
  return (
    <><PageHeader
        title="Today at a glance"
        subtitle="Wednesday, 15 July 2026 · Session 2026 – 2027 · Last sync 2 min ago"
        actions={
          <>
            <ExportMenu />
            <Button size="sm" className="h-8 gap-1.5 text-[12px]">
              <Plus className="h-3.5 w-3.5" /> New action
            </Button>
          </>
        }
      />

      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border rounded-md overflow-hidden border">
          {kpiStrip.map((k) => {
            const Icon = k.trend === "up" ? ArrowUp : k.trend === "down" ? ArrowDown : Minus;
            const tone =
              k.trend === "up"
                ? "text-success"
                : k.trend === "down"
                  ? k.label.includes("Outstanding")
                    ? "text-success"
                    : "text-danger"
                  : "text-muted-foreground";
            return (
              <div key={k.label} className="bg-surface p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {k.label}
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <div className="text-[22px] font-semibold tabular tracking-tight">{k.value}</div>
                  <div className={`flex items-center gap-0.5 text-[11px] font-medium ${tone}`}>
                    <Icon className="h-3 w-3" />
                    {k.delta}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{k.hint}</div>
              </div>
            );
          })}
        </div>

        {/* AI briefing */}
        <div className="rounded-md border bg-gradient-to-br from-accent/40 to-transparent p-4 flex items-start gap-3">
          <div className="h-8 w-8 rounded-md bg-primary/10 grid place-items-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Copilot briefing
              </span>
              <Badge variant="outline" className="h-5 text-[10px] font-mono">4 items</Badge>
            </div>
            <p className="text-[13px] leading-relaxed">
              Attendance held above 94% for the fifth straight day. <span className="font-medium">₹8.42 L</span> collected so far today across{" "}
              <span className="font-medium">47 receipts</span>. 3 classes still have not submitted attendance for today, and{" "}
              <span className="font-medium">7 students</span> celebrate a birthday today — draft messages are ready.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-[12px] gap-1">
            Review <ArrowRight className="h-3 w-3" />
          </Button>
        </div>

        {/* Today's fee + attendance bento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PanelCard
            icon={<Wallet className="h-3.5 w-3.5" />}
            title="Today's fee collection"
            subtitle={`${todaysFeeCollection.receipts} receipts issued`}
            action={<Badge variant="outline" className="h-5 text-[10px] font-mono text-success border-success/30 bg-success/10">Live</Badge>}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-baseline gap-2">
                <div className="text-[28px] font-semibold tabular tracking-tight">
                  ₹{(todaysFeeCollection.total / 100000).toFixed(2)} L
                </div>
                <div className="text-[11px] text-success">+18% vs yesterday</div>
              </div>
              <div className="grid grid-cols-3 gap-px bg-border rounded overflow-hidden border">
                {[
                  { l: "Online", v: todaysFeeCollection.online, t: "text-info" },
                  { l: "Cash", v: todaysFeeCollection.cash, t: "text-foreground" },
                  { l: "Cheque", v: todaysFeeCollection.cheque, t: "text-warning" },
                ].map((x) => (
                  <div key={x.l} className="bg-surface p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{x.l}</div>
                    <div className={`text-[13px] font-semibold tabular mt-0.5 ${x.t}`}>
                      ₹{(x.v / 1000).toFixed(0)}k
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-[80px] -mx-1">
                <ResponsiveContainer>
                  <BarChart data={todaysFeeCollection.hourly} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                    <XAxis dataKey="h" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={1} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                    <Bar dataKey="v" fill="var(--chart-1)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </PanelCard>

          <PanelCard
            icon={<Receipt className="h-3.5 w-3.5" />}
            title="Last 15 days · fees collection"
            subtitle="₹ Lakhs · daily"
            action={<Button variant="ghost" size="sm" className="h-6 text-[11px] -mr-2">Detail</Button>}
          >
            <div className="p-4 h-[168px]">
              <ResponsiveContainer>
                <AreaChart data={feesLast15Days} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="fc15" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                  <Area type="monotone" dataKey="collected" stroke="var(--chart-2)" strokeWidth={2} fill="url(#fc15)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 border-t divide-x divide-border-subtle">
              <MiniStat label="Total" value={`₹${feesLast15Days.reduce((a, b) => a + b.collected, 0).toFixed(1)}L`} />
              <MiniStat label="Peak day" value={`₹${Math.max(...feesLast15Days.map((f) => f.collected)).toFixed(1)}L`} />
              <MiniStat label="Receipts" value={feesLast15Days.reduce((a, b) => a + b.receipts, 0).toString()} />
            </div>
          </PanelCard>

          <PanelCard
            icon={<ClipboardCheck className="h-3.5 w-3.5" />}
            title="Today's student attendance"
            subtitle="Session 2026 – 2027 · grade-wise"
            action={<Badge variant="outline" className="h-5 text-[10px] font-mono">7 grades</Badge>}
          >
            <div className="p-2 space-y-0.5">
              {todaysAttendanceByGrade.map((g) => (
                <div key={g.grade} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/40">
                  <div className="text-[11px] w-16 text-muted-foreground">{g.grade}</div>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success"
                      style={{ width: `${g.pct}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-mono tabular w-12 text-right">{g.pct}%</div>
                  <div className="text-[10px] font-mono tabular text-muted-foreground w-16 text-right">
                    {g.present}/{g.total}
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        </div>

        {/* Attendance entry status + Birthdays */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PanelCard
            icon={<CalendarClock className="h-3.5 w-3.5" />}
            title="Attendance entry status · last 15 days"
            subtitle="21 classes × 15 days"
            action={
              <div className="flex items-center gap-2 text-[10px]">
                <Legend color="bg-success" label="Entered" />
                <Legend color="bg-warning" label="Partial" />
                <Legend color="bg-danger" label="Missing" />
              </div>
            }
            className="lg:col-span-2"
          >
            <div className="p-4">
              <div className="space-y-0.5">
                {(() => {
                  const days = attendanceEntryStatus;
                  const classes = days[0].classes.map((c) => c.cls);
                  const cols = `40px repeat(${days.length}, minmax(0, 1fr))`;
                  return (
                    <>
                      {classes.map((cls, ci) => (
                        <div key={cls} className="grid items-center gap-1" style={{ gridTemplateColumns: cols }}>
                          <div className="text-[10px] font-mono text-muted-foreground pr-1 truncate">{cls}</div>
                          {days.map((d) => {
                            const st = d.classes[ci].status;
                            const tone =
                              st === "entered" ? "bg-success" : st === "partial" ? "bg-warning" : "bg-danger";
                            return (
                              <div
                                key={d.d}
                                title={`${cls} · ${d.d}: ${st}`}
                                className={`aspect-square w-full rounded-sm ${tone} opacity-80 hover:opacity-100 hover:ring-1 hover:ring-primary/50 cursor-pointer`}
                              />
                            );
                          })}
                        </div>
                      ))}
                      <div className="grid items-center gap-1 pt-1.5" style={{ gridTemplateColumns: cols }}>
                        <div />
                        {days.map((d) => (
                          <div key={d.d} className="text-[9px] font-mono text-muted-foreground text-center truncate">
                            {d.label}
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </PanelCard>

          <PanelCard
            icon={<Cake className="h-3.5 w-3.5" />}
            title="Birthdays today"
            subtitle={`${birthdaysToday.length} students`}
            action={<Button variant="ghost" size="sm" className="h-6 text-[11px] -mr-2 gap-1">Send wishes</Button>}
          >
            <div className="divide-y divide-border-subtle">
              {birthdaysToday.map((s) => (
                <div key={s.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-muted/40">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-chart-4 to-chart-5 grid place-items-center text-[11px] font-semibold text-white shrink-0">
                    {s.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium truncate">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground">{s.grade} · Section {s.section}</div>
                  </div>
                  <Cake className="h-3.5 w-3.5 text-chart-4" />
                </div>
              ))}
              {birthdaysToday.length === 0 && (
                <div className="px-4 py-6 text-center text-[12px] text-muted-foreground">No birthdays today</div>
              )}
            </div>
          </PanelCard>
        </div>

        {/* Birthdays this month */}
        <PanelCard
          icon={<Cake className="h-3.5 w-3.5" />}
          title="Birthdays this month"
          subtitle={`${birthdaysThisMonth.length} students · July`}
          action={
            <div className="flex items-center gap-2">
              <ExportMenu />
              <Button variant="outline" size="sm" className="h-7 text-[11px]">Bulk message</Button>
            </div>
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border-subtle">
            {birthdaysThisMonth.map((s) => {
              const [, m, d] = s.dob.split("-");
              const isToday = s.days === 0;
              return (
                <div key={s.id} className="bg-surface p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-mono text-muted-foreground tabular">
                      {d} {new Date(2026, +m - 1, 1).toLocaleString("en", { month: "short" })}
                    </div>
                    {isToday && (
                      <Badge variant="outline" className="h-4 text-[9px] font-mono bg-chart-4/10 text-chart-4 border-chart-4/30">
                        TODAY
                      </Badge>
                    )}
                  </div>
                  <div className="text-[12px] font-medium leading-tight truncate">{s.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{s.grade} · {s.section}</div>
                </div>
              );
            })}
          </div>
        </PanelCard>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-md border bg-surface">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <div className="text-[13px] font-semibold">Fee collection vs billing</div>
                <div className="text-[11px] text-muted-foreground">Last 12 months · ₹ Lakhs</div>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <Legend color="bg-chart-1" label="Collected" />
                <Legend color="bg-muted-foreground/40" label="Billed" />
              </div>
            </div>
            <div className="p-4 h-[220px]">
              <ResponsiveContainer>
                <AreaChart data={feesSeries} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="fc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                  <Area type="monotone" dataKey="billed" stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeDasharray="3 3" fill="none" />
                  <Area type="monotone" dataKey="collected" stroke="var(--chart-1)" strokeWidth={2} fill="url(#fc)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-md border bg-surface">
            <div className="px-4 py-3 border-b">
              <div className="text-[13px] font-semibold">Attendance this week</div>
              <div className="text-[11px] text-muted-foreground">Present %</div>
            </div>
            <div className="p-4 h-[220px]">
              <ResponsiveContainer>
                <LineChart data={attendanceSeries} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="d" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis domain={[85, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                  <Line type="monotone" dataKey="present" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3, fill: "var(--chart-2)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Funnel + activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-md border bg-surface">
            <div className="px-4 py-3 border-b">
              <div className="text-[13px] font-semibold">Admissions funnel</div>
              <div className="text-[11px] text-muted-foreground">This intake cycle</div>
            </div>
            <div className="p-4 h-[240px]">
              <ResponsiveContainer>
                <BarChart data={admissionsFunnel} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: "var(--foreground)" }} tickLine={false} axisLine={false} width={72} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                  <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 3, 3, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-md border bg-surface lg:col-span-2">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="text-[13px] font-semibold">Activity</div>
              <Button variant="ghost" size="sm" className="h-6 text-[11px] -mr-2">View all</Button>
            </div>
            <div className="divide-y divide-border-subtle max-h-[240px] overflow-y-auto">
              {activity.map((a, i) => (
                <div key={i} className="px-4 py-2.5 flex items-start gap-3 hover:bg-muted/40">
                  <div className="text-[10px] font-mono text-muted-foreground w-8 shrink-0 pt-0.5">{a.t}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] leading-snug">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.what}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="h-5 text-[10px] shrink-0">{a.tag}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights strip */}
        <div className="rounded-md border bg-surface">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <div className="text-[13px] font-semibold">Intelligence highlights</div>
            <Badge variant="outline" className="ml-2 h-5 text-[10px] font-mono">{insights.length} signals</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
            {insights.map((ins, i) => {
              const tone =
                ins.severity === "high" ? "bg-danger" : ins.severity === "medium" ? "bg-warning" : "bg-info";
              return (
                <div key={i} className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${tone}`} />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      {ins.severity}
                    </span>
                  </div>
                  <div className="text-[13px] font-medium leading-snug">{ins.title}</div>
                  <div className="text-[11px] text-muted-foreground">{ins.meta}</div>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] w-full">
                    {ins.action}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function PanelCard({
  icon,
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-md border bg-surface flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b gap-2">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold flex items-center gap-1.5">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            {title}
          </div>
          {subtitle && <div className="text-[11px] text-muted-foreground truncate">{subtitle}</div>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 text-center">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-[12px] font-semibold tabular mt-0.5">{value}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
      <span className={`h-2 w-2 rounded-sm ${color}`} /> {label}
    </span>
  );
}
