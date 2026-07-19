import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, FileType, Printer } from "lucide-react";
import { toast } from "sonner";

export function ExportMenu({ label = "Export", size = "sm" }: { label?: string; size?: "sm" | "default" }) {
  const fire = (kind: string) => toast.success(`${kind} export queued`, { description: "You'll get a download link when it's ready." });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className="h-8 gap-1.5 text-[12px]">
          <Download className="h-3.5 w-3.5" /> {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Export as
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => fire("PDF")} className="text-[12px]">
          <FileType className="h-3.5 w-3.5 mr-2" /> PDF document
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => fire("Excel")} className="text-[12px]">
          <FileSpreadsheet className="h-3.5 w-3.5 mr-2" /> Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => fire("CSV")} className="text-[12px]">
          <FileText className="h-3.5 w-3.5 mr-2" /> CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.print()} className="text-[12px]">
          <Printer className="h-3.5 w-3.5 mr-2" /> Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
