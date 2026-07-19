import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { timetable, periods, days } from "@/data/mock";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/timetable")({
  head: () => ({
    meta: [
      { title: "Timetable · EPADM" },
      { name: "description", content: "Weekly class schedule with conflict detection and drag-to-edit slots." },
    ],
  }),
  component: TimetablePage,
});

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

function TimetablePage() {
  return (
    <AppShell>
      <PageHeader
        title="Timetable · Grade 11 – A"
        subtitle="Term 2 · Week of 13 Jul 2026"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8 text-[12px]">Print</Button>
            <Button size="sm" className="h-8 text-[12px]">Edit schedule</Button>
          </>
        }
      />
      <div className="p-6">
        <div className="rounded-md border bg-surface overflow-hidden">
          <div className="grid" style={{ gridTemplateColumns: `72px repeat(${periods.length}, 1fr)` }}>
            <div className="border-b border-r bg-muted/40 h-10" />
            {periods.map((p, i) => (
              <div key={p} className="border-b border-r last:border-r-0 bg-muted/40 h-10 flex flex-col items-center justify-center">
                <div className="text-[10px] font-mono text-muted-foreground">P{i + 1}</div>
                <div className="text-[10px] text-muted-foreground">{p}</div>
              </div>
            ))}

            {timetable.map((row) => (
              <div key={row.d} className="contents">
                <div className="border-b border-r bg-muted/20 flex items-center justify-center text-[11px] font-medium">
                  {row.d}
                </div>
                {row.slots.map((s, i) => {
                  const conflict = row.d === "Wed" && i === 3;
                  return (
                    <div key={i} className="border-b border-r last:border-r-0 p-1.5 h-16">
                      <div className={`h-full rounded-sm border px-2 py-1 ${subjColor[s.subj]} relative`}>
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

        <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Badge variant="outline" className="h-5 text-[10px] gap-1 border-danger/30 text-danger">
            <AlertTriangle className="h-2.5 w-2.5" /> 1 conflict
          </Badge>
          Wednesday · P4 · Physics room double-booked with Chemistry lab
        </div>
      </div>
      <div className="sr-only">Days: {days.join(", ")}</div>
    </AppShell>
  );
}
