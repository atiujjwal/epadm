import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type InnerRailItem = {
  id: string;
  label: string;
  count?: number | string;
  icon?: ReactNode;
};

export type InnerRailGroup = {
  label: string;
  items: InnerRailItem[];
};

export function InnerRail({
  groups,
  active,
  onSelect,
  footer,
}: {
  groups: InnerRailGroup[];
  active: string;
  onSelect: (id: string) => void;
  footer?: ReactNode;
}) {
  return (
    <aside className="w-56 shrink-0 border-r bg-surface-muted/40 flex flex-col">
      <div className="flex-1 overflow-y-auto py-3">
        {groups.map((g) => (
          <div key={g.label} className="mb-4">
            <div className="px-3 pb-1 text-[10px] uppercase tracking-wider font-medium text-muted-foreground/70">
              {g.label}
            </div>
            <div className="px-1.5 space-y-0.5">
              {g.items.map((it) => {
                const isActive = active === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => onSelect(it.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-[12px] text-left transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-foreground/80 hover:bg-muted/60",
                    )}
                  >
                    {it.icon && <span className="shrink-0 text-muted-foreground">{it.icon}</span>}
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.count !== undefined && (
                      <span className="text-[10px] font-mono text-muted-foreground tabular">
                        {it.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {footer && <div className="border-t p-2">{footer}</div>}
    </aside>
  );
}
