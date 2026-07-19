import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
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
import { NAV } from "@/lib/module-registry";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b h-14 px-3 flex-row items-center gap-2">
        <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold tracking-tight">EPADM</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                School OS
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {!collapsed && (
        <div className="px-2 pt-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Jump to…"
              className="h-7 pl-7 text-[11px] bg-background"
            />
          </div>
        </div>
      )}

      <SidebarContent className="px-1 py-2">
        {NAV.map((group) => {
          const modules = query
            ? group.modules.filter((m) => m.title.toLowerCase().includes(query))
            : group.modules;
          if (modules.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              {!collapsed && (
                <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 px-2">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {modules.map((item) => {
                    const isActive =
                      item.url === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.url || pathname.startsWith(item.url + "/");

                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          className="h-8 text-[13px] data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-medium"
                        >
                          <Link to={item.url} className="flex items-center gap-2">
                            {item.icon}
                            {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
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
        {!collapsed ? (
          <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-accent cursor-pointer">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-chart-1 to-chart-5 grid place-items-center text-[11px] font-semibold text-primary-foreground">
              NM
            </div>
            <div className="flex-1 min-w-0 leading-tight">
              <div className="text-[12px] font-medium truncate">Neha Menon</div>
              <div className="text-[10px] text-muted-foreground truncate">Principal · Delhi HS</div>
            </div>
          </div>
        ) : (
          <div className="h-7 w-7 mx-auto rounded-full bg-gradient-to-br from-chart-1 to-chart-5 grid place-items-center text-[11px] font-semibold text-primary-foreground">
            NM
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
