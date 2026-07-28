"use client";

import { usePathname } from "next/navigation";
import { Filter, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProvisionTenantForm } from "@/app/admin/tenants/provision-tenant-form";
import { useAdminShell } from "@/components/layout/admin-shell-context";

const SECTION_LABELS: Array<{ match: (path: string) => boolean; label: string }> = [
  { match: (path) => path === "/admin", label: "Overview" },
  { match: (path) => path.startsWith("/admin/tenants"), label: "School Tenants" },
  { match: (path) => path.startsWith("/admin/login"), label: "Sign in" },
];

function resolveSectionLabel(pathname: string | null) {
  if (!pathname) return "Overview";
  const hit = SECTION_LABELS.find((entry) => entry.match(pathname));
  return hit?.label ?? "Platform Console";
}

export function AdminTopbar() {
  const pathname = usePathname();
  const { search, setSearch } = useAdminShell();
  const sectionLabel = resolveSectionLabel(pathname);

  return (
    <div className="h-14 border-b bg-surface px-6 flex items-center gap-4 shrink-0">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-danger font-medium">
          Platform Console · Global scope
        </div>
        <div className="text-[15px] font-semibold tracking-tight leading-tight truncate">
          {sectionLabel}
        </div>
      </div>
      <div className="relative w-64 hidden sm:block">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tenants, users, invoices…"
          className="h-8 pl-8 text-[12px]"
        />
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="h-8 text-[12px] font-normal text-muted-foreground gap-1.5 hidden md:inline-flex"
        type="button"
        disabled
        title="Coming soon"
      >
        <Filter className="h-3 w-3" /> Region
      </Button>
      <ProvisionTenantForm
        trigger={
          <Button size="sm" className="h-8 text-[12px] gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New tenant
          </Button>
        }
      />
    </div>
  );
}
