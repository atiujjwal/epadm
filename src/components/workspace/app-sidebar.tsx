"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { NAV } from "@/lib/navigation/module-registry";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import type { TenantShellCtx } from "./app-shell";

const ROLE_RULES: Record<string, string[] | undefined> = {
  payroll: ["admin", "accountant"],
  fees: ["admin", "accountant"],
  admin: ["admin"],
  settings: ["admin"],
};

function canAccessModule(key: string, role: string) {
  const allowed = ROLE_RULES[key];
  return !allowed || allowed.includes(role);
}

function filterNav(role: string) {
  return NAV.map((group) => ({
    ...group,
    modules: group.modules.filter((m) => canAccessModule(m.key, role)),
  })).filter((group) => group.modules.length > 0);
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "EP"
  );
}

export function AppSidebar({ ctx }: { ctx: TenantShellCtx }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const nav = filterNav(ctx.role);
  const displayName = ctx.userName ?? ctx.tenantName;

  async function signOut() {
    await fetchWithCsrf("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="flex h-14 flex-row items-center gap-2 border-b px-3">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          {!collapsed ? (
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold tracking-tight">EPADM</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                School OS
              </span>
            </div>
          ) : null}
        </Link>
      </SidebarHeader>

      {!collapsed ? (
        <div className="px-2 pt-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Jump to…"
              className="h-7 bg-background pl-7 text-[11px]"
            />
          </div>
        </div>
      ) : null}

      <SidebarContent className="px-1 py-2">
        {nav.map((group) => {
          const modules = query
            ? group.modules.filter((m) => m.title.toLowerCase().includes(query))
            : group.modules;
          if (modules.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              {!collapsed ? (
                <SidebarGroupLabel className="px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </SidebarGroupLabel>
              ) : null}
              <SidebarGroupContent>
                <SidebarMenu>
                  {modules.map((item) => {
                    const isActive =
                      item.url === "/dashboard"
                        ? pathname === "/dashboard" || pathname === "/admin-dashboard"
                        : pathname === item.url || pathname.startsWith(item.url + "/");

                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          className="h-8 text-[13px] data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-accent-foreground"
                        >
                          <Link href={item.url} className="flex items-center gap-2">
                            {item.icon}
                            {!collapsed ? (
                              <span className="flex-1 truncate">{item.title}</span>
                            ) : null}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <button
          type="button"
          onClick={signOut}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-accent"
        >
          {!collapsed ? (
            <>
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-chart-1 to-chart-5 text-[11px] font-semibold text-primary-foreground">
                {initials(displayName)}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[12px] font-medium">{displayName}</div>
                <div className="truncate text-[10px] text-muted-foreground">
                  {ctx.role} · {ctx.tenantName}
                </div>
              </div>
            </>
          ) : (
            <div className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-chart-1 to-chart-5 text-[11px] font-semibold text-primary-foreground">
              {initials(displayName)}
            </div>
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
