"use client";

import { PageHeader } from "@/components/workspace/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const roles = [
  { role: "Principal", members: 3, scope: "Full access" },
  { role: "Academic head", members: 6, scope: "Academics, Exams, Timetable" },
  { role: "Class teacher", members: 148, scope: "Own class attendance, grades" },
  { role: "Accounts", members: 8, scope: "Fees, Payments, Reports" },
  { role: "Front office", members: 12, scope: "Admissions, Communications" },
  { role: "Guardian", members: 2984, scope: "Own child data" },
];

export default function SettingsPage() {
  return (
    <><PageHeader title="Settings" subtitle="Delhi Public School · North Campus · AY 2025–2026" />
      <div className="p-6 space-y-6 max-w-4xl">
        <section className="rounded-md border bg-surface">
          <div className="px-4 py-3 border-b">
            <div className="text-[13px] font-semibold">School profile</div>
            <div className="text-[11px] text-muted-foreground">Displayed to guardians and printed on receipts.</div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px]">School name</Label>
              <Input defaultValue="Delhi Public School — North Campus" className="h-8 text-[12px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Board</Label>
              <Input defaultValue="CBSE" className="h-8 text-[12px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Academic year</Label>
              <Input defaultValue="2025 – 2026" className="h-8 text-[12px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Timezone</Label>
              <Input defaultValue="Asia/Kolkata (IST)" className="h-8 text-[12px]" />
            </div>
          </div>
        </section>

        <section className="rounded-md border bg-surface">
          <div className="px-4 py-3 border-b">
            <div className="text-[13px] font-semibold">Roles & permissions</div>
            <div className="text-[11px] text-muted-foreground">Server-enforced role checks — never trust client state.</div>
          </div>
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2 border-b">Role</th>
                <th className="text-left px-4 py-2 border-b">Members</th>
                <th className="text-left px-4 py-2 border-b">Scope</th>
                <th className="text-right px-4 py-2 border-b" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {roles.map((r) => (
                <tr key={r.role}>
                  <td className="px-4 py-2 font-medium">{r.role}</td>
                  <td className="px-4 py-2 font-mono tabular">{r.members}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.scope}</td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="ghost" size="sm" className="h-6 text-[11px]">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-md border bg-surface">
          <div className="px-4 py-3 border-b">
            <div className="text-[13px] font-semibold">Copilot preferences</div>
          </div>
          <div className="p-4 space-y-3">
            {[
              ["Daily briefing every morning at 07:30", true],
              ["Automatic fee-reminder drafts", true],
              ["Flag chronic absences after 3 missed days", true],
              ["Allow Copilot to send messages without review", false],
            ].map(([label, on], i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div className="text-[12px]">{label as string}</div>
                <Switch defaultChecked={on as boolean} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border bg-surface">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold">Compliance</div>
              <div className="text-[11px] text-muted-foreground">DPDP Act 2023 · SOC 2 Type II · ISO 27001</div>
            </div>
            <Badge variant="outline" className="h-6 bg-success/10 text-success border-success/20">All checks green</Badge>
          </div>
        </section>
      </div>
    </>
  );
}
