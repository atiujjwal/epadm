import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
      <SheetContent side="right" className="w-[420px] sm:max-w-none p-0 flex flex-col">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-[14px]">
            <Sparkles className="h-4 w-4 text-primary" />
            Copilot
            <Badge variant="outline" className="ml-auto text-[10px] font-mono">
              Context: Dashboard
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Today's briefing
            </div>
            <div className="rounded-md border bg-surface p-3 space-y-2">
              <p className="text-[13px] leading-relaxed text-foreground">
                Attendance is up <span className="font-semibold text-success">0.8%</span> vs
                yesterday. Grade 8-B dipped to <span className="font-semibold text-warning">87%</span>{" "}
                — third day in a row. Fee collections are <span className="font-semibold">₹18 L</span>{" "}
                ahead of run-rate for the term.
              </p>
              <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 -ml-2">
                See breakdown <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Suggested actions
            </div>
            <div className="space-y-2">
              {[
                { icon: AlertTriangle, tint: "text-warning", t: "Notify parents of 12 at-risk students", s: "Draft prepared · 2 min" },
                { icon: Send, tint: "text-info", t: "Send fee reminder to 42 overdue accounts", s: "Estimated recovery ₹6.1 L" },
                { icon: TrendingUp, tint: "text-success", t: "Publish Q2 performance report to board", s: "Auto-summary ready" },
              ].map((a, i) => (
                <button
                  key={i}
                  className="w-full text-left rounded-md border bg-surface p-3 hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start gap-2.5">
                    <a.icon className={`h-4 w-4 mt-0.5 ${a.tint}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium">{a.t}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{a.s}</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
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
                  className="text-left text-[12px] rounded-md border border-border-subtle px-2.5 py-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
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
              className="w-full h-9 pl-3 pr-9 rounded-md border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              size="icon"
              className="absolute right-1 top-1 h-7 w-7"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
