import { useMemo, type ReactNode } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import type { InnerRailGroup } from "@/components/inner-rail";
import { ExportMenu } from "@/components/export-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Plus, Search, Filter, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModuleFlow = {
  id?: string;
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string; delta?: string }[];
  ai?: string;
  columns?: string[];
  rows?: (string | number)[][];
  emptyHint?: string;
  primaryAction?: string;
};

export function ModuleShell({
  title,
  subtitle,
  rail,
  flows,
  defaultFlow,
}: {
  title: string;
  subtitle: string;
  rail: InnerRailGroup[];
  flows: Record<string, ModuleFlow>;
  defaultFlow: string;
}) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const tab = new URLSearchParams(searchStr).get("tab") ?? undefined;
  const active = tab && flows[tab] ? tab : defaultFlow;
  const flow = flows[active] ?? flows[defaultFlow];

  const activeGroup = useMemo(
    () => rail.find((g) => g.items.some((i) => i.id === active))?.label,
    [rail, active],
  );

  return (
    <AppShell>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            <ExportMenu />
            {flow.primaryAction && (
              <Button size="sm" className="h-8 gap-1.5 text-[12px]">
                <Plus className="h-3.5 w-3.5" /> {flow.primaryAction}
              </Button>
            )}
          </>
        }
      />

      {/* In-page navigation header — grouped, sticky, scrollable */}
      <div className="border-b bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 sticky top-14 z-20">
        <div className="px-6 py-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{title}</span>
          {activeGroup && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>{activeGroup}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{flow.title}</span>
        </div>
        <div className="px-4 overflow-x-auto">
          <div className="flex items-stretch gap-3 min-w-max">
            {rail.map((g, gi) => (
              <div key={g.label} className="flex items-center gap-1.5">
                {gi > 0 && <div className="h-5 w-px bg-border mx-1 self-center" />}
                <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-muted-foreground/50 pr-0.5">
                  {g.label}
                </span>
                <div className="flex items-stretch">
                  {g.items.map((it) => {
                    const isActive = it.id === active;
                    return (
                      <button
                        key={it.id}
                        onClick={() =>
                          router.navigate({ to: pathname, search: { tab: it.id } as never, replace: true })
                        }
                        className={cn(
                          "relative h-9 px-2.5 text-[12px] transition-colors whitespace-nowrap flex items-center gap-1.5",
                          isActive
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span>{it.label}</span>
                        {it.count !== undefined && (
                          <span
                            className={cn(
                              "h-4 min-w-4 px-1 rounded-full font-mono text-[9px] grid place-items-center",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {it.count}
                          </span>
                        )}
                        {isActive && (
                          <span className="absolute inset-x-1.5 -bottom-px h-0.5 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <FlowView flow={flow} />
      </div>
    </AppShell>
  );
}

export function FlowView({ flow, extra }: { flow: ModuleFlow; extra?: ReactNode }) {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight">{flow.title}</h2>
        {flow.subtitle && (
          <p className="text-[12px] text-muted-foreground mt-0.5">{flow.subtitle}</p>
        )}
      </div>

      {flow.ai && (
        <div className="rounded-md border bg-gradient-to-br from-accent/40 to-transparent p-3 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="text-[12px] leading-relaxed">{flow.ai}</div>
        </div>
      )}

      {flow.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-md overflow-hidden border">
          {flow.stats.map((s) => (
            <div key={s.label} className="bg-surface p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="text-[16px] font-semibold mt-0.5 font-mono tabular">{s.value}</div>
              {s.delta && <div className="text-[10px] text-muted-foreground mt-0.5">{s.delta}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search…" className="h-8 pl-8 text-[12px]" />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-[12px] gap-1.5 text-muted-foreground font-normal">
          <Filter className="h-3 w-3" /> Filters
        </Button>
      </div>

      {extra}

      {flow.columns && flow.rows && (
        <div className="rounded-md border bg-surface overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
              <tr>
                {flow.columns.map((c) => (
                  <th key={c} className="text-left font-medium px-3 py-2 border-b whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {flow.rows.map((r, i) => (
                <tr key={i} className="hover:bg-muted/40">
                  {r.map((cell, j) => (
                    <td key={j} className="px-3 py-2 whitespace-nowrap">
                      {typeof cell === "string" && /^(Paid|Approved|Active|Sent|Delivered|Success|OK|Live|Enabled)$/.test(cell) ? (
                        <Badge variant="outline" className="h-5 text-[10px] bg-success/10 text-success border-success/20">{cell}</Badge>
                      ) : typeof cell === "string" && /^(Pending|Draft|Partial|Warning|Review|Trial)$/.test(cell) ? (
                        <Badge variant="outline" className="h-5 text-[10px] bg-warning/10 text-warning border-warning/20">{cell}</Badge>
                      ) : typeof cell === "string" && /^(Overdue|Rejected|Failed|High|Critical|Suspended|Blocked)$/.test(cell) ? (
                        <Badge variant="outline" className="h-5 text-[10px] bg-danger/10 text-danger border-danger/20">{cell}</Badge>
                      ) : j === 0 ? (
                        <span className="font-mono text-[11px] text-muted-foreground">{cell}</span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {flow.emptyHint && (!flow.rows || flow.rows.length === 0) && (
        <div className="rounded-md border border-dashed p-8 text-center text-[12px] text-muted-foreground">
          {flow.emptyHint}
        </div>
      )}
    </div>
  );
}
