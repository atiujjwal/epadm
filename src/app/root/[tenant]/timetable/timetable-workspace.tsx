"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/workspace/app-shell";
import { Button } from "@/components/ui/button-base";
import { Badge } from "@/components/ui/badge";
import type { TimetableEntryRecord } from "@/lib/admin/timetable";
import { timetable as mockTimetable, periods, days } from "@/data/mock";
import { AlertTriangle } from "lucide-react";

type Props = {
  initialEntries: TimetableEntryRecord[];
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const subjColor: Record<string, string> = {
  Math: "bg-chart-1/10 border-chart-1/30 text-chart-1",
  Physics: "bg-chart-5/10 border-chart-5/30 text-chart-5",
  English: "bg-chart-2/10 border-chart-2/30 text-chart-2",
  History: "bg-chart-3/10 border-chart-3/30 text-chart-3",
  CS: "bg-chart-1/10 border-chart-1/30 text-chart-1",
  Biology: "bg-chart-2/10 border-chart-2/30 text-chart-2",
  Chem: "bg-chart-4/10 border-chart-4/30 text-chart-4",
  PE: "bg-warning/10 border-warning/30 text-warning",
  Art: "bg-chart-5/10 border-chart-5/30 text-chart-5",
  "—": "bg-muted border-border-subtle text-muted-foreground",
};

type GridSlot = { subj: string; room: string };

type GridRow = { d: string; slots: GridSlot[] };

function colorForSubject(subject: string) {
  return subjColor[subject] ?? "bg-muted border-border-subtle text-foreground";
}

function buildGridFromEntries(entries: TimetableEntryRecord[]): GridRow[] | null {
  if (entries.length === 0) return null;

  const classLabels = [...new Set(entries.map((e) => e.classLabel))];
  const targetClass = classLabels[0];
  const filtered = entries.filter((e) => e.classLabel === targetClass);

  const maxPeriod = Math.max(...filtered.map((e) => e.period), periods.length);
  const periodCount = Math.max(maxPeriod, periods.length);

  const slotMap = new Map<string, GridSlot>();
  for (const entry of filtered) {
    const dayLabel = DAY_LABELS[entry.dayOfWeek] ?? `Day ${entry.dayOfWeek + 1}`;
    slotMap.set(`${dayLabel}-${entry.period}`, {
      subj: entry.subject,
      room: entry.room ?? "—",
    });
  }

  const usedDays = [...new Set(filtered.map((e) => DAY_LABELS[e.dayOfWeek] ?? DAY_LABELS[0]))];
  const gridDays = usedDays.length > 0 ? usedDays : DAY_LABELS;

  return gridDays.map((d) => ({
    d,
    slots: Array.from({ length: periodCount }, (_, i) => {
      const period = i + 1;
      return slotMap.get(`${d}-${period}`) ?? { subj: "—", room: "—" };
    }),
  }));
}

export function TimetableWorkspace({ initialEntries }: Props) {
  const liveGrid = useMemo(() => buildGridFromEntries(initialEntries), [initialEntries]);
  const grid = liveGrid ?? mockTimetable;
  const usingLive = liveGrid !== null;
  const classLabel = usingLive
    ? [...new Set(initialEntries.map((e) => e.classLabel))][0]
    : "Grade 11 – A";
  const gridPeriods = grid[0]?.slots.length ?? periods.length;
  const periodLabels =
    gridPeriods === periods.length
      ? periods
      : Array.from({ length: gridPeriods }, (_, i) => periods[i] ?? `${8 + i}:00`);

  return (
    <>
      <PageHeader
        title={`Timetable · ${classLabel}`}
        subtitle={
          usingLive
            ? `Live schedule · ${initialEntries.length} entr${initialEntries.length === 1 ? "y" : "ies"}`
            : "Term 2 · Week of 13 Jul 2026 · sample grid"
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8 text-[12px]">
              Print
            </Button>
            <Button size="sm" className="h-8 text-[12px]">
              Edit schedule
            </Button>
          </>
        }
      />
      <div className="p-6">
        <div className="rounded-md border bg-surface overflow-hidden">
          <div
            className="grid"
            style={{ gridTemplateColumns: `72px repeat(${periodLabels.length}, 1fr)` }}
          >
            <div className="border-b border-r bg-muted/40 h-10" />
            {periodLabels.map((p, i) => (
              <div
                key={`${p}-${i}`}
                className="border-b border-r last:border-r-0 bg-muted/40 h-10 flex flex-col items-center justify-center"
              >
                <div className="text-[10px] font-mono text-muted-foreground">P{i + 1}</div>
                <div className="text-[10px] text-muted-foreground">{p}</div>
              </div>
            ))}

            {grid.map((row) => (
              <div key={row.d} className="contents">
                <div className="border-b border-r bg-muted/20 flex items-center justify-center text-[11px] font-medium">
                  {row.d}
                </div>
                {row.slots.map((s, i) => {
                  const conflict = !usingLive && row.d === "Wed" && i === 3;
                  return (
                    <div key={i} className="border-b border-r last:border-r-0 p-1.5 h-16">
                      <div
                        className={`h-full rounded-sm border px-2 py-1 ${colorForSubject(s.subj)} relative`}
                      >
                        <div className="text-[11px] font-semibold leading-tight">{s.subj}</div>
                        <div className="text-[10px] opacity-70 font-mono">{s.room}</div>
                        {conflict && (
                          <div className="absolute top-0.5 right-0.5">
                            <AlertTriangle className="h-3 w-3 text-danger" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {!usingLive ? (
          <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Badge variant="outline" className="h-5 text-[10px] gap-1 border-danger/30 text-danger">
              <AlertTriangle className="h-2.5 w-2.5" /> 1 conflict
            </Badge>
            Wednesday · P4 · Physics room double-booked with Chemistry lab
          </div>
        ) : null}
      </div>
      <div className="sr-only">Days: {days.join(", ")}</div>
    </>
  );
}
