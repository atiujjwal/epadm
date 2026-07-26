"use client";

import { AppShell, PageHeader } from "@/components/workspace/app-shell";
import { Button } from "@/components/ui/button-base";
import { Badge } from "@/components/ui/badge";
import { admissions } from "@/data/mock";
import { Plus } from "lucide-react";

const slaTone = ["text-success", "text-info", "text-warning", "text-primary", "text-success"];

export default function AdmissionsPage() {
  return (
    <><PageHeader
        title="Admissions pipeline"
        subtitle="Intake AY 2026–2027 · 412 enquiries · 118 enrolled"
        actions={<Button size="sm" className="h-8 gap-1.5 text-[12px]"><Plus className="h-3.5 w-3.5" /> New applicant</Button>}
      />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {admissions.map((col, ci) => (
            <div key={col.stage} className="rounded-md border bg-surface flex flex-col min-h-[420px]">
              <div className="px-3 py-2.5 border-b flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${["bg-info", "bg-chart-5", "bg-warning", "bg-primary", "bg-success"][ci]}`} />
                <div className="text-[12px] font-semibold">{col.stage}</div>
                <Badge variant="outline" className="h-5 text-[10px] font-mono ml-auto">{col.items.length}</Badge>
              </div>
              <div className="p-2 space-y-2 flex-1">
                {col.items.map((name, i) => (
                  <div key={i} className="rounded-sm border bg-background p-2.5 hover:border-primary/40 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[12px] font-medium">{name}</div>
                      <Badge variant="outline" className={`h-4 text-[9px] font-mono ${slaTone[ci]}`}>
                        {ci === 0 ? "New" : ci === 4 ? "Done" : `${2 + i}d`}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">Grade {7 + i} · Applied {i + 2} days ago</div>
                    <div className="mt-2 flex items-center gap-1">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Fit</div>
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${70 + (i * 5) % 30}%` }} />
                      </div>
                      <div className="text-[9px] font-mono">{70 + (i * 5) % 30}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
