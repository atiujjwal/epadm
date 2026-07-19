import { Search, Bell, Sparkles, Command as CmdIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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

type Props = {
  onOpenCommand: () => void;
  onOpenCopilot: () => void;
};

export function Topbar({ onOpenCommand, onOpenCopilot }: Props) {
  return (
    <header className="h-14 border-b bg-surface flex items-center gap-2 px-3 sticky top-0 z-30">
      <SidebarTrigger className="h-8 w-8" />
      <Separator orientation="vertical" className="h-5" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[13px] font-medium">
            Delhi Public School · North Campus
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Switch tenant
          </DropdownMenuLabel>
          <DropdownMenuItem>Delhi Public School · North</DropdownMenuItem>
          <DropdownMenuItem>Delhi Public School · South</DropdownMenuItem>
          <DropdownMenuItem>Ryan International · Mumbai</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-primary">+ Add school</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-5" />
      <Badge variant="outline" className="h-6 rounded-sm font-mono text-[10px] tracking-wide">
        AY 2025 – 2026 · Term 2
      </Badge>

      <button
        onClick={onOpenCommand}
        className="ml-3 flex-1 max-w-md flex items-center gap-2 h-8 px-2.5 rounded-md border bg-background text-muted-foreground hover:bg-muted transition-colors"
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
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
        </Button>
      </div>
    </header>
  );
}
