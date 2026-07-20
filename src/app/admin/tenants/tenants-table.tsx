"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminShell } from "@/components/layout/admin-shell-context";
import { cn } from "@/lib/utils";

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  subscriptionTier: string;
  createdAt: string;
};

function tierLabel(tier: string) {
  if (tier === "enterprise") return "Enterprise";
  if (tier === "pro") return "Professional";
  if (tier === "basic") return "Essentials";
  return tier;
}

export function TenantsTable({ initialRows }: { initialRows: TenantRow[] }) {
  const { search } = useAdminShell();
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) {
          params.set("search", search.trim());
        }
        const res = await fetch(`/api/platform/tenants?${params.toString()}`);
        const data = await res.json();
        setRows(data.tenants ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [search]);

  const displayRows = useMemo(() => rows, [rows]);

  return (
    <div className="rounded-md border bg-surface overflow-hidden">
      {loading ? (
        <div className="px-3 py-2 text-[11px] text-muted-foreground border-b bg-muted/20">
          Updating tenant list…
        </div>
      ) : null}
      <table className="w-full text-[12px]">
        <thead className="bg-muted/40 text-muted-foreground text-[10px] uppercase tracking-wider">
          <tr>
            {["Code", "School", "Plan", "Created", "Status", ""].map((h) => (
              <th key={h} className="text-left font-medium px-3 py-2 border-b whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {displayRows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                No tenants match your search.
              </td>
            </tr>
          ) : (
            displayRows.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-muted/40">
                <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground uppercase">
                  {tenant.slug}
                </td>
                <td className="px-3 py-2 font-medium">{tenant.name}</td>
                <td className="px-3 py-2">{tierLabel(tenant.subscriptionTier)}</td>
                <td className="px-3 py-2 font-mono tabular-nums text-muted-foreground">
                  {new Date(tenant.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-3 py-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5 text-[10px] rounded-sm normal-case tracking-normal font-medium px-2",
                      tenant.isActive
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-danger/10 text-danger border-danger/20",
                    )}
                  >
                    {tenant.isActive ? "Live" : "Suspended"}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[11px]"
                    href={`/admin/tenants/${tenant.id}`}
                  >
                    Manage
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
