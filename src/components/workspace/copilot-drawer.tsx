"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button-base";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, Send } from "lucide-react";

export function CopilotDrawer({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-[420px] flex-col p-0 sm:max-w-none">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-[14px]">
            <Sparkles className="h-4 w-4 text-primary" />
            Copilot
            <Badge variant="outline" className="ml-auto font-mono text-[10px]">
              Context: Dashboard
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              Today&apos;s briefing
            </div>
            <div className="space-y-2 rounded-md border bg-surface p-3">
              <p className="text-[13px] leading-relaxed text-foreground">
                Attendance is up <span className="font-semibold text-success">0.8%</span> vs
                yesterday. Grade 8-B dipped to{" "}
                <span className="font-semibold text-warning">87%</span> — third day in a row. Fee
                collections are <span className="font-semibold">₹18 L</span> ahead of run-rate for
                the term.
              </p>
              <Button variant="ghost" size="sm" className="-ml-2 h-7 gap-1 text-[11px]">
                See breakdown <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              Suggested actions
            </div>
            <div className="space-y-2">
              {[
                {
                  icon: AlertTriangle,
                  tint: "text-warning",
                  t: "Notify parents of 12 at-risk students",
                  s: "Draft prepared · 2 min",
                },
                {
                  icon: Send,
                  tint: "text-info",
                  t: "Send fee reminder to 42 overdue accounts",
                  s: "Estimated recovery ₹6.1 L",
                },
                {
                  icon: TrendingUp,
                  tint: "text-success",
                  t: "Publish Q2 performance report to board",
                  s: "Auto-summary ready",
                },
              ].map((a) => (
                <button
                  key={a.t}
                  type="button"
                  className="group w-full rounded-md border bg-surface p-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex items-start gap-2.5">
                    <a.icon className={`mt-0.5 h-4 w-4 ${a.tint}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium">{a.t}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{a.s}</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              Ask Copilot
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                "Which students have missed 3+ days this month?",
                "Forecast fee collection for next quarter",
                "Compare Grade 10 exam results across sections",
                "Draft an announcement about the sports day",
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  className="rounded-md border border-border-subtle px-2.5 py-1.5 text-left text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t p-3">
          <div className="relative">
            <input
              placeholder="Ask anything about your school…"
              className="h-9 w-full rounded-md border bg-background pl-3 pr-9 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button size="icon" className="absolute right-1 top-1 h-7 w-7">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
