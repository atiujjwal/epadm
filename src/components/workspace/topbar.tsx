"use client";

import { Search, Bell, Sparkles, Command as CmdIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button-base";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TenantShellCtx } from "./app-shell";

type Props = {
  ctx: TenantShellCtx;
  onOpenCommand: () => void;
  onOpenCopilot: () => void;
};

export function Topbar({ ctx, onOpenCommand, onOpenCopilot }: Props) {
  const year = new Date().getFullYear();
  const nextYear = year + 1;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-surface px-3">
      <SidebarTrigger className="h-8 w-8" />
      <Separator orientation="vertical" className="h-5" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[13px] font-medium">
            {ctx.tenantName}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Current school
          </DropdownMenuLabel>
          <DropdownMenuItem>{ctx.tenantName}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-muted-foreground">
            Plan: {ctx.planTier}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-5" />
      <Badge variant="outline" className="h-6 rounded-sm font-mono text-[10px] tracking-wide">
        AY {year} – {nextYear}
      </Badge>

      <button
        type="button"
        onClick={onOpenCommand}
        className="ml-3 flex h-8 max-w-md flex-1 items-center gap-2 rounded-md border bg-background px-2.5 text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-[12px]">Search students, invoices, actions…</span>
        <kbd className="ml-auto inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          <CmdIcon className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-[12px]"
          onClick={onOpenCopilot}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Copilot
        </Button>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
        </Button>
      </div>
    </header>
  );
}
