"use client";

import { useState } from "react";
import { PageHeader } from "@/components/workspace/app-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import { PageToolbar, Pagination } from "@/components/workspace/page-toolbar";
import { ExportMenu } from "@/components/workspace/export-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { students, holidays, holidayReasons, sessionConfig, leaveApplications, gradesList, sectionsList, todaysAttendanceByGrade } from "@/data/mock";
import { Check, X, Clock, Sparkles, MessageSquare, Trash2, FileBarChart2, CalendarRange, Send, Settings2, ClipboardList, CalendarDays, PieChart, UserCheck, UserX, Users2, Percent, Award, TrendingDown, MailCheck, CalendarClock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormErrorSummary } from "@/components/ui/form-error-summary";

const rail: InnerRailGroup[] = [
  {
    label: "Operate",
    items: [
      { id: "feed", label: "Feed Attendance", icon: <ClipboardList className="h-3.5 w-3.5" /> },
      { id: "feed-monthly", label: "Feed Monthly Attendance", icon: <CalendarDays className="h-3.5 w-3.5" /> },
      { id: "sms", label: "Send SMS to Absentees", icon: <MessageSquare className="h-3.5 w-3.5" /> },
      { id: "delete", label: "Delete Attendance", icon: <Trash2 className="h-3.5 w-3.5" /> },
      { id: "leave", label: "Leave Applications", count: 3, icon: <MailCheck className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Reports",
    items: [
      { id: "monthly-class", label: "Monthly · Class", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "monthly-all", label: "Monthly · All Classes", icon: <FileBarChart2 className="h-3.5 w-3.5" /> },
      { id: "annual-class", label: "Annual · Class", icon: <CalendarRange className="h-3.5 w-3.5" /> },
      { id: "annual-student", label: "Annual · Student", icon: <UserCheck className="h-3.5 w-3.5" /> },
      { id: "annual-pct", label: "Annual Percentage", icon: <Percent className="h-3.5 w-3.5" /> },
      { id: "monthly-absent", label: "Monthly Absentees", icon: <UserX className="h-3.5 w-3.5" /> },
      { id: "absent-date", label: "Absent on a Date", icon: <UserX className="h-3.5 w-3.5" /> },
      { id: "perfect", label: "100% Attendance", icon: <Award className="h-3.5 w-3.5" /> },
      { id: "class-pct", label: "Class-wise %", icon: <PieChart className="h-3.5 w-3.5" /> },
      { id: "class-absent", label: "Class-wise Absent Count", icon: <TrendingDown className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Configure",
    items: [
      { id: "cfg-holidays", label: "Holidays", count: holidays.length, icon: <CalendarClock className="h-3.5 w-3.5" /> },
      { id: "cfg-reasons", label: "Holiday Reasons", icon: <Settings2 className="h-3.5 w-3.5" /> },
      { id: "cfg-session", label: "Session Dates", icon: <CalendarRange className="h-3.5 w-3.5" /> },
    ],
  },
];

const tabs = rail.flatMap((group) =>
  group.items.map((item) => ({
    id: item.id as ViewId,
    label: item.label,
    group: group.label,
    count: item.count,
  })),
);

type ViewId =
  | "feed" | "feed-monthly" | "sms" | "delete" | "leave"
  | "monthly-class" | "monthly-all" | "annual-class" | "annual-student" | "annual-pct" | "monthly-absent" | "absent-date" | "perfect" | "class-pct" | "class-absent"
  | "cfg-holidays" | "cfg-reasons" | "cfg-session";

export default function AttendancePage() {
  const [view, setView] = useState<ViewId>("feed");
  const active = tabs.find((tab) => tab.id === view) ?? tabs[0];

  return (
    <>
      <div className="sticky top-14 z-20 border-b bg-surface/95 backdrop-blur">
        <div className="px-4 py-1.5 text-[11px] text-muted-foreground md:px-6">
          Attendance <span className="px-1">/</span>
          <span className="font-medium text-foreground">{active.label}</span>
        </div>
        <div className="overflow-x-auto px-3">
          <div className="flex min-w-max items-stretch gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setView(tab.id)}
                className={`relative flex h-10 items-center gap-1.5 px-3 text-[12px] transition-colors ${
                  view === tab.id ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground/70 xl:inline">
                  {tab.group}
                </span>
                <span>{tab.label}</span>
                {tab.count ? (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                    {tab.count}
                  </span>
                ) : null}
                {view === tab.id ? <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" /> : null}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="min-h-[calc(100vh-3.5rem)]">
        {renderView(view)}
      </div>
    </>
  );
}

function renderView(view: ViewId) {
  switch (view) {
    case "feed": return <FeedAttendance />;
    case "feed-monthly": return <FeedMonthly />;
    case "sms": return <SmsAbsentees />;
    case "delete": return <DeleteAttendance />;
    case "leave": return <LeaveApplications />;
    case "cfg-holidays": return <ConfigHolidays />;
    case "cfg-reasons": return <ConfigReasons />;
    case "cfg-session": return <ConfigSession />;
    case "perfect": return <PerfectAttendance />;
    case "class-pct": return <ClassWisePercent />;
    case "monthly-absent": return <MonthlyAbsentees />;
    case "absent-date": return <AbsentOnDate />;
    case "annual-pct": return <AnnualPercent />;
    default: return <ReportPlaceholder view={view} />;
  }
}

/* ---------- Feed Attendance ---------- */
function FeedAttendance() {
  const roster = students.slice(0, 22);
  const periods = ["P1", "P2", "P3", "P4", "P5", "P6"];
  return (
    <>
      <PageHeader
        title="Feed Attendance"
        subtitle="Wednesday, 15 July 2026 · Session 2026 – 2027"
        actions={
          <>
            <Button variant="secondary" size="sm" className="h-8 text-[12px]">Mark all present</Button>
            <Button size="sm" className="h-8 text-[12px]">Save</Button>
          </>
        }
      />
      <PageToolbar gradeFilter sectionFilter sessionFilter date="2026-07-15" />
      <div className="p-6 space-y-4 flex-1">
        <div className="rounded-md border bg-gradient-to-br from-accent/40 to-transparent p-3 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="text-[12px] leading-relaxed flex-1">
            Copilot flagged <span className="font-medium">3 chronic absentees</span> in Grade 10-B — Kabir Sharma, Ira Rao, and Sara Menon have missed 4+ days this month.
          </div>
          <Button variant="secondary" size="sm" className="h-7 text-[11px] shrink-0">Notify guardians</Button>
        </div>

        <div className="rounded-md border bg-surface overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2 border-b w-16">Roll</th>
                <th className="text-left px-3 py-2 border-b">Student</th>
                {periods.map((p) => (
                  <th key={p} className="text-center px-2 py-2 border-b w-16">{p}</th>
                ))}
                <th className="text-center px-3 py-2 border-b w-20">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {roster.map((s, i) => {
                const marks = periods.map((_, pi) => ((i + pi) % 7 === 0 ? "A" : (i + pi) % 5 === 0 ? "L" : "P"));
                return (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-3 py-1.5 font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</td>
                    <td className="px-3 py-1.5 font-medium">{s.name}</td>
                    {marks.map((m, mi) => (
                      <td key={mi} className="px-2 py-1.5 text-center">
                        <div className="inline-flex items-center gap-0.5">
                          {["P", "A", "L"].map((opt) => {
                            const active = m === opt;
                            const tone =
                              opt === "P" ? (active ? "bg-success text-success-foreground" : "hover:bg-success/10 text-muted-foreground")
                              : opt === "A" ? (active ? "bg-danger text-danger-foreground" : "hover:bg-danger/10 text-muted-foreground")
                              : (active ? "bg-warning text-warning-foreground" : "hover:bg-warning/10 text-muted-foreground");
                            return (
                              <button key={opt} className={`h-5 w-5 rounded-sm text-[9px] font-mono font-semibold ${tone}`}>
                                {opt === "P" ? <Check className="h-2.5 w-2.5 mx-auto" /> : opt === "A" ? <X className="h-2.5 w-2.5 mx-auto" /> : <Clock className="h-2.5 w-2.5 mx-auto" />}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    ))}
                    <td className="px-3 py-1.5 text-center">
                      <Badge variant="outline" className="h-5 text-[10px] font-mono">
                        {marks.filter((m) => m === "P").length}/{periods.length}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------- Feed Monthly ---------- */
function FeedMonthly() {
  const roster = students.slice(0, 18);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <>
      <PageHeader title="Feed Monthly Attendance" subtitle="Mark full-day attendance for the entire month" actions={<Button size="sm" className="h-8 text-[12px]">Save month</Button>} />
      <PageToolbar gradeFilter sectionFilter sessionFilter extra={
        <select className="h-8 text-[12px] border rounded-md px-2 bg-surface">
          {["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map(m => <option key={m}>{m} 2026</option>)}
        </select>
      } />
      <div className="p-6 flex-1 overflow-auto">
        <div className="rounded-md border bg-surface overflow-auto">
          <table className="w-full text-[11px]">
            <thead className="bg-muted/40 text-[9px] uppercase tracking-wider text-muted-foreground sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 border-b sticky left-0 bg-muted/40 z-10">Student</th>
                {days.map(d => (
                  <th key={d} className="text-center px-1 py-2 border-b w-6 font-mono">{d}</th>
                ))}
                <th className="text-center px-2 py-2 border-b">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {roster.map((s, i) => {
                const marks = days.map(d => ((d + i) % 11 === 0 ? "A" : (d + i) % 8 === 0 ? "L" : "P"));
                const pct = Math.round(marks.filter(m => m === "P").length / days.length * 100);
                return (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-3 py-1 font-medium sticky left-0 bg-surface truncate max-w-[160px]">{s.name}</td>
                    {marks.map((m, mi) => (
                      <td key={mi} className="text-center px-0.5 py-1">
                        <span className={`inline-block h-4 w-4 rounded-sm text-[8px] font-mono font-bold leading-4 ${
                          m === "P" ? "bg-success/20 text-success" : m === "A" ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
                        }`}>{m}</span>
                      </td>
                    ))}
                    <td className="px-2 py-1 text-center font-mono tabular font-semibold">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------- SMS Absentees ---------- */
function SmsAbsentees() {
  const absentees = students.filter(s => s.attendance < 80).slice(0, 14);
  return (
    <>
      <PageHeader title="Send SMS to Absentees" subtitle="15 July 2026 · 14 students marked absent today" actions={
        <>
          <Button variant="secondary" size="sm" className="h-8 text-[12px]">Preview</Button>
          <Button size="sm" className="h-8 gap-1.5 text-[12px]"><Send className="h-3.5 w-3.5" /> Send to selected</Button>
        </>
      } />
      <PageToolbar gradeFilter sectionFilter date="2026-07-15" />
      <div className="p-6 space-y-4">
        <div className="rounded-md border bg-surface p-4 space-y-2">
          <Label className="text-[11px]">Message template</Label>
          <textarea
            className="w-full h-24 rounded-md border p-2 text-[12px] bg-background"
            defaultValue="Dear {{guardian}}, this is to inform you that {{student}} was marked absent on {{date}} in {{class}}. Please contact the school if this is unexpected. — DPS North"
          />
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>Variables: {"{{"}guardian{"}}"}, {"{{"}student{"}}"}, {"{{"}date{"}}"}, {"{{"}class{"}}"}</span>
            <span className="ml-auto">SMS credits: <span className="font-mono text-foreground tabular">18,420</span></span>
          </div>
        </div>
        <div className="rounded-md border bg-surface overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-8 px-3 py-2 border-b"><input type="checkbox" defaultChecked /></th>
                <th className="text-left px-3 py-2 border-b">Student</th>
                <th className="text-left px-3 py-2 border-b">Class</th>
                <th className="text-left px-3 py-2 border-b">Guardian</th>
                <th className="text-left px-3 py-2 border-b">Mobile</th>
                <th className="text-center px-3 py-2 border-b">This month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {absentees.map(s => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2"><input type="checkbox" defaultChecked /></td>
                  <td className="px-3 py-2 font-medium">{s.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{s.grade} · {s.section}</td>
                  <td className="px-3 py-2">{s.guardian}</td>
                  <td className="px-3 py-2 font-mono tabular text-muted-foreground">+91 98••• {String(1000 + s.id.length * 7).slice(0,4)}</td>
                  <td className="px-3 py-2 text-center font-mono tabular">
                    <span className={s.attendance < 75 ? "text-danger" : "text-warning"}>{s.attendance}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------- Delete Attendance ---------- */
function DeleteAttendance() {
  const [confirmationErrors, setConfirmationErrors] = useState<string[]>([]);

  return (
    <>
      <PageHeader title="Delete Attendance" subtitle="Remove attendance entries for a specific class and date range" />
      <div className="p-6 max-w-2xl">
        <div className="rounded-md border bg-surface p-5 space-y-4">
          <div className="rounded-md border border-danger/30 bg-danger/5 p-3 text-[12px]">
            <span className="font-medium text-danger">Warning:</span> Deleting attendance is permanent and audited. Only Admin and Principal roles can perform this action.
          </div>
          <FormErrorSummary errors={confirmationErrors} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Grade</Label>
              <select className="h-8 w-full text-[12px] border rounded-md px-2 bg-background">
                {gradesList.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Section</Label>
              <select className="h-8 w-full text-[12px] border rounded-md px-2 bg-background">
                {sectionsList.map(s => <option key={s}>Section {s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">From date</Label>
              <Input type="date" className="h-8 text-[12px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">To date</Label>
              <Input type="date" className="h-8 text-[12px]" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" className="h-8 text-[12px]">Cancel</Button>
            <Button variant="danger" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setConfirmationErrors(["Enter DELETE to confirm this destructive action."])}>
              <Trash2 className="h-3.5 w-3.5" /> Delete attendance
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Leave Applications ---------- */
function LeaveApplications() {
  return (
    <>
      <PageHeader title="Leave Applications" subtitle={`${leaveApplications.filter(l => l.status === "Pending").length} pending · ${leaveApplications.length} total this week`} actions={<ExportMenu />} />
      <PageToolbar gradeFilter sectionFilter />
      <div className="p-6 flex-1">
        <div className="rounded-md border bg-surface overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {["ID", "Student", "Class", "From", "To", "Days", "Reason", "Applied", "Status", ""].map(h => (
                  <th key={h} className="text-left px-3 py-2 border-b">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {leaveApplications.map(l => {
                const days = Math.max(1, (+new Date(l.to) - +new Date(l.from)) / 86400000 + 1);
                const tone = l.status === "Approved" ? "bg-success/10 text-success border-success/20" : l.status === "Rejected" ? "bg-danger/10 text-danger border-danger/20" : "bg-warning/10 text-warning border-warning/20";
                return (
                  <tr key={l.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{l.id}</td>
                    <td className="px-3 py-2 font-medium">{l.student}</td>
                    <td className="px-3 py-2 text-muted-foreground">{l.grade} · {l.section}</td>
                    <td className="px-3 py-2 font-mono tabular text-muted-foreground">{l.from}</td>
                    <td className="px-3 py-2 font-mono tabular text-muted-foreground">{l.to}</td>
                    <td className="px-3 py-2 font-mono tabular">{days}</td>
                    <td className="px-3 py-2 text-muted-foreground max-w-[220px] truncate">{l.reason}</td>
                    <td className="px-3 py-2 font-mono tabular text-muted-foreground">{l.applied}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className={`h-5 text-[10px] ${tone}`}>{l.status}</Badge></td>
                    <td className="px-3 py-2 text-right">
                      {l.status === "Pending" && (
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-success">Approve</Button>
                          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-danger">Reject</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination total={leaveApplications.length} />
        </div>
      </div>
    </>
  );
}

/* ---------- Config: Holidays ---------- */
function ConfigHolidays() {
  return (
    <>
      <PageHeader title="Holidays" subtitle={`${holidays.length} scheduled for Session 2026 – 2027`} actions={<Button size="sm" className="h-8 text-[12px]">Add holiday</Button>} />
      <div className="p-6">
        <div className="rounded-md border bg-surface overflow-hidden max-w-3xl">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2 border-b">Date</th>
                <th className="text-left px-3 py-2 border-b">Name</th>
                <th className="text-left px-3 py-2 border-b">Reason</th>
                <th className="text-left px-3 py-2 border-b">Type</th>
                <th className="text-right px-3 py-2 border-b" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {holidays.map(h => (
                <tr key={h.date} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono tabular text-muted-foreground">{h.date}</td>
                  <td className="px-3 py-2 font-medium">{h.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{h.reason}</td>
                  <td className="px-3 py-2"><Badge variant="outline" className="h-5 text-[10px]">{h.type}</Badge></td>
                  <td className="px-3 py-2 text-right"><Button variant="ghost" size="sm" className="h-6 text-[11px]">Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ConfigReasons() {
  return (
    <>
      <PageHeader title="Holiday Reasons" subtitle="Master list of holiday categories" actions={<Button size="sm" className="h-8 text-[12px]">Add reason</Button>} />
      <div className="p-6">
        <div className="rounded-md border bg-surface overflow-hidden max-w-md">
          {holidayReasons.map(r => (
            <div key={r} className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 hover:bg-muted/30">
              <span className="text-[12px]">{r}</span>
              <Button variant="ghost" size="sm" className="h-6 text-[11px]">Edit</Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ConfigSession() {
  return (
    <>
      <PageHeader title="Session Start & End Dates" subtitle={`Current session: ${sessionConfig.current}`} actions={<Button size="sm" className="h-8 text-[12px]">Save</Button>} />
      <div className="p-6">
        <div className="rounded-md border bg-surface p-5 max-w-xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Session name</Label>
              <Input defaultValue={sessionConfig.current} className="h-8 text-[12px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Working days</Label>
              <Input defaultValue={sessionConfig.workingDays} className="h-8 text-[12px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Start date</Label>
              <Input type="date" defaultValue={sessionConfig.start} className="h-8 text-[12px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">End date</Label>
              <Input type="date" defaultValue={sessionConfig.end} className="h-8 text-[12px]" />
            </div>
          </div>
          <div className="flex items-center justify-between py-1 border-t pt-3">
            <div className="text-[12px]">Saturdays off</div>
            <Switch defaultChecked={sessionConfig.saturdaysOff} />
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Reports ---------- */
function PerfectAttendance() {
  const winners = students.filter(s => s.attendance >= 95).slice(0, 24);
  return (
    <>
      <PageHeader title="100% Attendance Report" subtitle={`${winners.length} students · Session 2026 – 2027`} actions={<ExportMenu />} />
      <PageToolbar gradeFilter sectionFilter sessionFilter />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {winners.map(s => (
            <div key={s.id} className="rounded-md border bg-surface p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-success to-chart-2 grid place-items-center text-[11px] font-semibold text-white shrink-0">
                {s.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium truncate">{s.name}</div>
                <div className="text-[10px] text-muted-foreground">{s.grade} · {s.section}</div>
              </div>
              <Badge variant="outline" className="h-5 text-[10px] font-mono bg-success/10 text-success border-success/20">{s.attendance}%</Badge>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ClassWisePercent() {
  return (
    <>
      <PageHeader title="Class-wise Attendance Percentage" subtitle="Session 2026 – 2027 · today" actions={<ExportMenu />} />
      <PageToolbar sessionFilter date="2026-07-15" />
      <div className="p-6">
        <div className="rounded-md border bg-surface overflow-hidden max-w-3xl">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2 border-b">Grade</th>
                <th className="text-right px-3 py-2 border-b">Total</th>
                <th className="text-right px-3 py-2 border-b">Present</th>
                <th className="text-right px-3 py-2 border-b">Absent</th>
                <th className="text-right px-3 py-2 border-b">Late</th>
                <th className="text-right px-3 py-2 border-b">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {todaysAttendanceByGrade.map(g => (
                <tr key={g.grade} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{g.grade}</td>
                  <td className="px-3 py-2 text-right font-mono tabular">{g.total}</td>
                  <td className="px-3 py-2 text-right font-mono tabular text-success">{g.present}</td>
                  <td className="px-3 py-2 text-right font-mono tabular text-danger">{g.absent}</td>
                  <td className="px-3 py-2 text-right font-mono tabular text-warning">{g.late}</td>
                  <td className="px-3 py-2 text-right font-mono tabular font-semibold">{g.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function MonthlyAbsentees() {
  const list = students.filter(s => s.attendance < 78).slice(0, 20);
  return (
    <>
      <PageHeader title="Monthly Absent Students Report" subtitle="July 2026 · students with 3+ absences" actions={<ExportMenu />} />
      <PageToolbar gradeFilter sectionFilter sessionFilter />
      <div className="p-6">
        <div className="rounded-md border bg-surface overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Student", "Class", "Absences", "Present", "%", "Risk"].map(h => (
                  <th key={h} className="text-left px-3 py-2 border-b">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {list.map(s => {
                const absences = Math.round((100 - s.attendance) * 0.22);
                const present = 22 - absences;
                return (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{s.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{s.grade} · {s.section}</td>
                    <td className="px-3 py-2 font-mono tabular text-danger">{absences}</td>
                    <td className="px-3 py-2 font-mono tabular text-success">{present}</td>
                    <td className="px-3 py-2 font-mono tabular">{s.attendance}%</td>
                    <td className="px-3 py-2"><Badge variant="outline" className={`h-5 text-[10px] ${s.risk === "high" ? "bg-danger/10 text-danger border-danger/20" : "bg-warning/10 text-warning border-warning/20"}`}>{s.risk}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination total={list.length} />
        </div>
      </div>
    </>
  );
}

function AbsentOnDate() {
  const list = students.filter(s => s.attendance < 85).slice(0, 12);
  return (
    <>
      <PageHeader title="Students Absent on a Date" subtitle="Pick a date to see the absentee list" actions={<ExportMenu />} />
      <PageToolbar gradeFilter sectionFilter date="2026-07-15" />
      <div className="p-6">
        <div className="rounded-md border bg-surface overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Roll", "Student", "Class", "Guardian", "Contact", "Reason"].map(h => (
                  <th key={h} className="text-left px-3 py-2 border-b">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {list.map((s, i) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono tabular text-muted-foreground">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-3 py-2 font-medium">{s.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{s.grade} · {s.section}</td>
                  <td className="px-3 py-2">{s.guardian}</td>
                  <td className="px-3 py-2 font-mono tabular text-muted-foreground">+91 98••• {String(1000 + i).slice(-4)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{i % 3 === 0 ? "Not informed" : i % 2 === 0 ? "Medical" : "Family"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AnnualPercent() {
  return (
    <>
      <PageHeader title="Annual Attendance Percentage" subtitle="Session 2026 – 2027 · school-wide" actions={<ExportMenu />} />
      <PageToolbar sessionFilter />
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-md border bg-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">School average</div>
          <div className="text-[32px] font-semibold tabular tracking-tight mt-1">92.4%</div>
          <div className="text-[11px] text-success mt-0.5">+1.2% vs last session</div>
        </div>
        <div className="rounded-md border bg-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Above 90%</div>
          <div className="text-[32px] font-semibold tabular tracking-tight mt-1">2,184</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">76.7% of students</div>
        </div>
        <div className="rounded-md border bg-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Below 75%</div>
          <div className="text-[32px] font-semibold tabular tracking-tight mt-1 text-danger">142</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">5.0% · needs intervention</div>
        </div>
      </div>
    </>
  );
}

function ReportPlaceholder({ view }: { view: ViewId }) {
  const labels: Record<string, string> = {
    "monthly-class": "Monthly Attendance of a Class",
    "monthly-all": "Monthly Attendance of All Classes",
    "annual-class": "Annual Attendance of a Class",
    "annual-student": "Student Annual Attendance",
    "class-absent": "Class-wise Absent Count Report",
  };
  return (
    <>
      <PageHeader title={labels[view] ?? "Report"} subtitle="Configure filters and generate report" actions={<ExportMenu />} />
      <PageToolbar gradeFilter sectionFilter sessionFilter />
      <div className="p-6">
        <div className="rounded-md border border-dashed bg-surface-muted/30 p-10 text-center">
          <Users2 className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <div className="text-[13px] font-medium">Select filters to generate report</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Choose grade, section, and date range above, then click Generate.
          </div>
          <Button size="sm" className="h-8 text-[12px] mt-4">Generate report</Button>
        </div>
      </div>
    </>
  );
}
