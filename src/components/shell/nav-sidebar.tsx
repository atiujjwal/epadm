"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRouteIcon } from "@/components/shell/route-icons";
import type {
  ClientRouteDefinition,
  NavGroup,
} from "@/lib/navigation/route-registry";

interface NavSidebarProps {
  authorizedRoutes: ClientRouteDefinition[];
  tenantId: string;
  isAdmin?: boolean;
  onNavigate?: () => void;
}

function routeIsActive(route: ClientRouteDefinition, pathname: string): boolean {
  return [route.path, ...(route.legacyPaths ?? [])].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function NavSidebar({
  authorizedRoutes,
  tenantId,
  isAdmin = false,
  onNavigate,
}: NavSidebarProps) {
  const pathname = usePathname();
  const groups = useMemo(
    () =>
      authorizedRoutes.reduce<
        Map<NavGroup, { label: string; routes: ClientRouteDefinition[] }>
      >((map, route) => {
        if (!map.has(route.group)) {
          map.set(route.group, { label: route.groupLabel, routes: [] });
        }
        map.get(route.group)?.routes.push(route);
        return map;
      }, new Map()),
    [authorizedRoutes],
  );

  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener("epadm-nav-change", onStoreChange);
    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener("epadm-nav-change", onStoreChange);
    };
  }, []);
  const getCollapsedSnapshot = useCallback(
    () =>
      Array.from(groups.keys())
        .filter(
          (group) =>
            localStorage.getItem(`${tenantId}-nav-${group}`) === "collapsed",
        )
        .join("|"),
    [groups, tenantId],
  );
  const collapsedSnapshot = useSyncExternalStore(
    subscribe,
    getCollapsedSnapshot,
    () => "",
  );
  const collapsedGroups = useMemo(
    () => new Set(collapsedSnapshot.split("|").filter(Boolean) as NavGroup[]),
    [collapsedSnapshot],
  );

  const toggleGroup = (group: NavGroup) => {
    localStorage.setItem(
      `${tenantId}-nav-${group}`,
      collapsedGroups.has(group) ? "expanded" : "collapsed",
    );
    window.dispatchEvent(new Event("epadm-nav-change"));
  };

  return (
    <nav aria-label="Main navigation" className="flex-1 space-y-4 overflow-y-auto py-4">
      {Array.from(groups.entries()).map(([group, { label, routes }]) => {
        const visibleRoutes = routes.filter(
          (route) => !route.comingSoon || isAdmin,
        );
        if (visibleRoutes.length === 0) return null;
        const collapsed = collapsedGroups.has(group);

        return (
          <section key={group} aria-labelledby={`nav-group-${group}`}>
            <button
              type="button"
              onClick={() => toggleGroup(group)}
              className="mb-1 flex w-full items-center gap-2 px-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/70"
              aria-expanded={!collapsed}
            >
              <span id={`nav-group-${group}`} className="flex-1">{label}</span>
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", collapsed && "-rotate-90")}
                aria-hidden="true"
              />
            </button>

            {!collapsed ? (
              <ul className="space-y-0.5 px-2">
                {visibleRoutes.map((route) => {
                  const Icon = getRouteIcon(route.iconKey);
                  const active = routeIsActive(route, pathname);
                  const locked = route.comingSoon && isAdmin;

                  return (
                    <li key={route.key}>
                      {locked ? (
                        <div
                          className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground/50"
                          title={`${route.label} — Coming soon`}
                        >
                          {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                          <span className="flex-1 truncate">{route.label}</span>
                          <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
                        </div>
                      ) : (
                        <Link
                          href={route.path}
                          onClick={onNavigate}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )}
                        >
                          {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                          <span className="flex-1 truncate">{route.label}</span>
                        </Link>
                      )}

                      {active && route.children && route.children.length > 0 ? (
                        <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2">
                          {route.children
                            .filter((routeChild) => !routeChild.comingSoon || isAdmin)
                            .map((routeChild) => {
                              const childActive = routeIsActive(routeChild, pathname);
                              if (routeChild.comingSoon) {
                                return (
                                  <li key={routeChild.key}>
                                    <div
                                      className="flex cursor-not-allowed items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground/50"
                                      title={`${routeChild.label} — Coming soon`}
                                    >
                                      <span className="flex-1">{routeChild.label}</span>
                                      <Lock className="h-3 w-3" aria-hidden="true" />
                                    </div>
                                  </li>
                                );
                              }
                              return (
                                <li key={routeChild.key}>
                                  <Link
                                    href={routeChild.path}
                                    onClick={onNavigate}
                                    aria-current={childActive ? "page" : undefined}
                                    className={cn(
                                      "flex items-center rounded-md px-2 py-1.5 text-xs transition-colors",
                                      childActive
                                        ? "font-medium text-sidebar-primary"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                    )}
                                  >
                                    {routeChild.label}
                                  </Link>
                                </li>
                              );
                            })}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>
        );
      })}
    </nav>
  );
}
