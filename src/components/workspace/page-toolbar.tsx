import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
import { ExportMenu } from "./export-menu";
import { Search, SlidersHorizontal } from "lucide-react";
import { gradesList, sectionsList } from "@/data/mock";

export function PageToolbar({
  search = true,
  gradeFilter = false,
  sectionFilter = false,
  sessionFilter = false,
  date,
  exportBtn = true,
  extra,
  onSearch,
}: {
  search?: boolean;
  gradeFilter?: boolean;
  sectionFilter?: boolean;
  sessionFilter?: boolean;
  date?: string;
  exportBtn?: boolean;
  extra?: ReactNode;
  onSearch?: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b bg-surface">
      {search && (
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            onChange={(e) => onSearch?.(e.target.value)}
            className="h-8 text-[12px] pl-8 w-56"
          />
        </div>
      )}
      {gradeFilter && (
        <Select defaultValue="all">
          <SelectTrigger className="h-8 text-[12px] w-32">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">All grades</SelectItem>
            {gradesList.map((g) => (
              <SelectItem key={g} value={g} className="text-[12px]">{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {sectionFilter && (
        <Select defaultValue="all">
          <SelectTrigger className="h-8 text-[12px] w-28">
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">All sections</SelectItem>
            {sectionsList.map((s) => (
              <SelectItem key={s} value={s} className="text-[12px]">Section {s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {sessionFilter && (
        <Select defaultValue="2026-27">
          <SelectTrigger className="h-8 text-[12px] w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2026-27" className="text-[12px]">2026 – 2027</SelectItem>
            <SelectItem value="2025-26" className="text-[12px]">2025 – 2026</SelectItem>
            <SelectItem value="2024-25" className="text-[12px]">2024 – 2025</SelectItem>
          </SelectContent>
        </Select>
      )}
      {date !== undefined && (
        <Input type="date" defaultValue={date} className="h-8 text-[12px] w-40" />
      )}
      {extra}
      <div className="flex-1" />
      <Button variant="secondary" size="sm" className="h-8 gap-1.5 text-[12px]">
        <SlidersHorizontal className="h-3.5 w-3.5" /> Columns
      </Button>
      {exportBtn && <ExportMenu />}
    </div>
  );
}

export function Pagination({
  page = 1,
  perPage = 25,
  total,
}: {
  page?: number;
  perPage?: number;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t bg-surface-muted/30 text-[11px]">
      <div className="text-muted-foreground">
        Showing <span className="font-mono tabular">{Math.min((page - 1) * perPage + 1, total)}</span>–
        <span className="font-mono tabular">{Math.min(page * perPage, total)}</span> of{" "}
        <span className="font-mono tabular">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue={String(perPage)}>
          <SelectTrigger className="h-7 text-[11px] w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[25, 50, 100, 200].map((n) => (
              <SelectItem key={n} value={String(n)} className="text-[11px]">{n} / page</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">‹</Button>
          <span className="font-mono tabular px-2">{page} / {pages}</span>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">›</Button>
        </div>
      </div>
    </div>
  );
}
