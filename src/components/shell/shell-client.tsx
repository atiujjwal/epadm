"use client";

import { useState, type ReactNode } from "react";
import { Building2 } from "lucide-react";
import { NavSidebar } from "@/components/shell/nav-sidebar";
import { Topbar, type ShellSession } from "@/components/shell/topbar";
import { CommandPalette } from "@/components/shell/command-palette";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { ClientRouteDefinition } from "@/lib/navigation/route-registry";

function Brand({ tenantName }: { tenantName: string }) {
  return (
    <div className="flex h-14 items-center gap-2 border-b px-4">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
        <Building2 className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">EPADM</p>
        <p className="truncate text-[10px] text-muted-foreground">{tenantName}</p>
      </div>
    </div>
  );
}

export function ShellClient({
  children,
  session,
  authorizedRoutes,
  activeAcademicYear,
  academicYears,
}: {
  children: ReactNode;
  session: ShellSession;
  authorizedRoutes: ClientRouteDefinition[];
  activeAcademicYear: string;
  academicYears: string[];
}) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isAdmin = session.primaryRole === "admin" || session.primaryRole === "superadmin";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-modal focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md"
      >
        Skip to main content
      </a>

      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar-background lg:flex">
        <Brand tenantName={session.tenantName} />
        <NavSidebar
          authorizedRoutes={authorizedRoutes}
          tenantId={session.tenantId}
          isAdmin={isAdmin}
        />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="flex w-72 flex-col gap-0 bg-sidebar-background p-0">
          <SheetTitle className="sr-only">Main navigation</SheetTitle>
          <SheetDescription className="sr-only">Navigate between authorized EPADM modules.</SheetDescription>
          <Brand tenantName={session.tenantName} />
          <NavSidebar
            authorizedRoutes={authorizedRoutes}
            tenantId={session.tenantId}
            isAdmin={isAdmin}
            onNavigate={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          session={session}
          activeAcademicYear={activeAcademicYear}
          academicYears={academicYears}
          onOpenCommand={() => setCommandOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        authorizedRoutes={authorizedRoutes}
      />
    </div>
  );
}
