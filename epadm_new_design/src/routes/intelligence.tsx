import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { insights } from "@/data/mock";
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, Users, Wallet } from "lucide-react";

export const Route = createFileRoute("/intelligence")({
  head: () => ({
    meta: [
      { title: "AI Insights · EPADM" },
      { name: "description", content: "AI-driven insights across academics, attendance, fees, and operations." },
    ],
  }),
  component: IntelligencePage,
});

const cards = [
  { icon: Users, tint: "text-warning", title: "12 students at chronic-absence risk", desc: "Attendance trending below 78% over past 3 weeks. 8 in Grade 8, 4 in Grade 10.", cta: "Notify class teachers" },
  { icon: Wallet, tint: "text-info", title: "Fee default risk: ₹3.4 L exposure", desc: "8 accounts likely to miss next cycle based on payment history and communication signals.", cta: "Send reminders" },
  { icon: TrendingUp, tint: "text-success", title: "Grade 11 Math scores up 8%", desc: "Section A gains driven by new practice-set rollout. Recommend expanding to sections B and C.", cta: "Plan rollout" },
  { icon: AlertTriangle, tint: "text-danger", title: "1 timetable conflict detected", desc: "Physics-11A · Wednesday · Period 4. Room R202 double-booked with Chem lab.", cta: "Suggest fix" },
];

function IntelligencePage() {
  return (
    <AppShell>
      <PageHeader
        title="Intelligence"
        subtitle="Signals synthesised from attendance, academics, fees, and staff data · Updated 4 min ago"
        actions={<Button size="sm" className="h-8 gap-1.5 text-[12px]"><Sparkles className="h-3.5 w-3.5" /> Ask Copilot</Button>}
      />
      <div className="p-6 space-y-6 max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c, i) => (
            <div key={i} className="rounded-md border bg-surface p-4 hover:border-primary/40 transition-colors group">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-muted grid place-items-center shrink-0">
                  <c.icon className={`h-4.5 w-4.5 ${c.tint}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold leading-snug">{c.title}</div>
                  <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{c.desc}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" className="h-7 text-[11px]">{c.cta}</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1">
                      Explain <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-md border bg-surface">
          <div className="px-4 py-3 border-b">
            <div className="text-[13px] font-semibold">Signal feed</div>
            <div className="text-[11px] text-muted-foreground">All AI-detected events across the school</div>
          </div>
          <div className="divide-y divide-border-subtle">
            {insights.concat(insights).map((ins, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30">
                <span className={`h-1.5 w-1.5 rounded-full ${ins.severity === "high" ? "bg-danger" : ins.severity === "medium" ? "bg-warning" : "bg-info"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium">{ins.title}</div>
                  <div className="text-[10px] text-muted-foreground">{ins.meta}</div>
                </div>
                <Badge variant="outline" className="h-5 text-[10px] capitalize">{ins.severity}</Badge>
                <span className="text-[10px] font-mono text-muted-foreground">{i * 7 + 2}m</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
