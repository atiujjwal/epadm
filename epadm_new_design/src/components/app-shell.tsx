import { useState, type ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";
import { CopilotDrawer } from "./copilot-drawer";

export function AppShell({ children }: { children: ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <SidebarProvider style={{ "--sidebar-width": "220px", "--sidebar-width-icon": "3rem" } as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0">
          <Topbar
            onOpenCommand={() => setCmdOpen(true)}
            onOpenCopilot={() => setCopilotOpen(true)}
          />
          <main className="flex-1 min-w-0">{children}</main>
        </SidebarInset>
      </div>
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
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
      <div className="px-6 py-4 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-[18px] font-semibold tracking-tight leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
