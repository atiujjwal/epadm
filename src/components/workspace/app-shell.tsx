"use client";

import { useState, type ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";
import { CopilotDrawer } from "./copilot-drawer";

export type TenantShellCtx = {
  role: string;
  tenantName: string;
  tenantSlug: string;
  planTier: string;
  userName?: string;
};

export function AppShell({
  children,
  ctx,
}: {
  children: ReactNode;
  ctx: TenantShellCtx;
}) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <SidebarProvider
      style={
        { "--sidebar-width": "220px", "--sidebar-width-icon": "3rem" } as React.CSSProperties
      }
    >
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar ctx={ctx} />
        <SidebarInset className="flex min-w-0 flex-col">
          <Topbar
            ctx={ctx}
            onOpenCommand={() => setCmdOpen(true)}
            onOpenCopilot={() => setCopilotOpen(true)}
          />
          <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} role={ctx.role} />
      <CopilotDrawer open={copilotOpen} setOpen={setCopilotOpen} />
    </SidebarProvider>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b bg-surface">
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-[18px] font-semibold leading-tight tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
