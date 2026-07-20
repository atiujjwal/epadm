import { getAttendanceSummary } from "@/lib/admin/attendance";
import { getCtx } from "@/lib/context";
import AttendanceModulePage from "@/lib/modules/pages/attendance";
import { Badge } from "@/components/ui/badge";

export default async function AttendancePage() {
  const ctx = await getCtx();
  const { summary, records } = await getAttendanceSummary(ctx.tenantId);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      <div className="border-b bg-surface px-6 py-2 flex flex-wrap items-center gap-3 text-[12px]">
        <span className="text-muted-foreground">Live · {today}</span>
        <Badge variant="outline" className="h-5 text-[10px] bg-success/10 text-success border-success/20">
          Present {summary.present}
        </Badge>
        <Badge variant="outline" className="h-5 text-[10px] bg-danger/10 text-danger border-danger/20">
          Absent {summary.absent}
        </Badge>
        <Badge variant="outline" className="h-5 text-[10px] bg-warning/10 text-warning border-warning/20">
          Late {summary.late}
        </Badge>
        <span className="text-muted-foreground ml-auto font-mono tabular-nums">
          {records.length} marks today
        </span>
      </div>
      <AttendanceModulePage />
    </div>
  );
}
