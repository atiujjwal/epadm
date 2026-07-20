"use client";

import { useMemo, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/workspace/app-shell";
import type { InnerRailGroup } from "@/components/workspace/inner-rail";
import { ExportMenu } from "@/components/workspace/export-menu";
import { Button } from "@/components/ui/button-base";
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
  /** Optional custom content instead of default table */
  content?: ReactNode;
};

export function ModuleShell({
  title,
  subtitle,
  rail,
  flows,
  defaultFlow,
  headerActions,
}: {
  title: string;
  subtitle: string;
  rail: InnerRailGroup[];
  flows: Record<string, ModuleFlow>;
  defaultFlow: string;
  headerActions?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? undefined;
  const active = tab && flows[tab] ? tab : defaultFlow;
  const flow = flows[active] ?? flows[defaultFlow];

  const activeGroup = useMemo(
    () => rail.find((g) => g.items.some((i) => i.id === active))?.label,
    [rail, active],
  );

  const setTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          headerActions ?? (
            <>
              <ExportMenu />
              {flow.primaryAction ? (
                <Button size="sm" className="h-8 gap-1.5 text-[12px]">
                  <Plus className="h-3.5 w-3.5" /> {flow.primaryAction}
                </Button>
              ) : null}
            </>
          )
        }
      />

      <div className="sticky top-14 z-20 border-b bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="flex items-center gap-1.5 px-6 py-1.5 text-[11px] text-muted-foreground">
          <span>{title}</span>
          {activeGroup ? (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>{activeGroup}</span>
            </>
          ) : null}
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">{flow.title}</span>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="flex min-w-max items-stretch gap-3">
            {rail.map((g, gi) => (
              <div key={g.label} className="flex items-center gap-1.5">
                {gi > 0 ? <div className="mx-1 h-5 w-px self-center bg-border" /> : null}
                <span className="pr-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/50">
                  {g.label}
                </span>
                <div className="flex items-stretch">
                  {g.items.map((it) => {
                    const isActive = it.id === active;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => setTab(it.id)}
                        className={cn(
                          "relative flex h-9 items-center gap-1.5 whitespace-nowrap px-2.5 text-[12px] transition-colors",
                          isActive
                            ? "font-medium text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span>{it.label}</span>
                        {it.count !== undefined ? (
                          <span
                            className={cn(
                              "grid h-4 min-w-4 place-items-center rounded-full px-1 font-mono text-[9px]",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {it.count}
                          </span>
                        ) : null}
                        {isActive ? (
                          <span className="absolute inset-x-1.5 -bottom-px h-0.5 rounded-full bg-primary" />
                        ) : null}
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
    </>
  );
}

export function FlowView({ flow, extra }: { flow: ModuleFlow; extra?: ReactNode }) {
  if (flow.content) {
    return <div className="p-6">{flow.content}</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight">{flow.title}</h2>
        {flow.subtitle ? (
          <p className="mt-0.5 text-[12px] text-muted-foreground">{flow.subtitle}</p>
        ) : null}
      </div>

      {flow.ai ? (
        <div className="flex items-start gap-2 rounded-md border bg-gradient-to-br from-accent/40 to-transparent p-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-[12px] leading-relaxed">{flow.ai}</div>
        </div>
      ) : null}

      {flow.stats ? (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border md:grid-cols-4">
          {flow.stats.map((s) => (
            <div key={s.label} className="bg-surface p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-0.5 font-mono text-[16px] font-semibold tabular-nums">
                {s.value}
              </div>
              {s.delta ? (
                <div className="mt-0.5 text-[10px] text-muted-foreground">{s.delta}</div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search…" className="h-8 pl-8 text-[12px]" />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-[12px] font-normal text-muted-foreground"
        >
          <Filter className="h-3 w-3" /> Filters
        </Button>
      </div>

      {extra}

      {flow.columns && flow.rows ? (
        <div className="overflow-hidden rounded-md border bg-surface">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {flow.columns.map((c) => (
                  <th
                    key={c}
                    className="whitespace-nowrap border-b px-3 py-2 text-left font-medium"
                  >
                    {c}
                  </th>
                ))}
                <th className="border-b px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {flow.rows.map((r, i) => (
                <tr key={i} className="hover:bg-muted/40">
                  {r.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap px-3 py-2">
                      {typeof cell === "string" &&
                      /^(Paid|Approved|Active|Sent|Delivered|Success|OK|Live|Enabled)$/.test(
                        cell,
                      ) ? (
                        <Badge
                          variant="outline"
                          className="h-5 border-success/20 bg-success/10 text-[10px] text-success"
                        >
                          {cell}
                        </Badge>
                      ) : typeof cell === "string" &&
                        /^(Pending|Draft|Partial|Warning|Review|Trial)$/.test(cell) ? (
                        <Badge
                          variant="outline"
                          className="h-5 border-warning/20 bg-warning/10 text-[10px] text-warning"
                        >
                          {cell}
                        </Badge>
                      ) : typeof cell === "string" &&
                        /^(Overdue|Rejected|Failed|High|Critical|Suspended|Blocked)$/.test(
                          cell,
                        ) ? (
                        <Badge
                          variant="outline"
                          className="h-5 border-danger/20 bg-danger/10 text-[10px] text-danger"
                        >
                          {cell}
                        </Badge>
                      ) : j === 0 ? (
                        <span className="font-mono text-[11px] text-muted-foreground">{cell}</span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    <button type="button" className="mr-2 text-[11px] text-primary hover:underline">
                      View
                    </button>
                    <button type="button" className="text-[11px] text-primary hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {flow.emptyHint && (!flow.rows || flow.rows.length === 0) ? (
        <div className="rounded-md border border-dashed p-8 text-center text-[12px] text-muted-foreground">
          {flow.emptyHint}
        </div>
      ) : null}
    </div>
  );
}
