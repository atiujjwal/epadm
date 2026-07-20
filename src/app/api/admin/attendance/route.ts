import { requirePermission } from "@/lib/auth/guards";
import {
  ATTENDANCE_READ_PERMISSION,
  getAttendanceSummary,
} from "@/lib/admin/attendance";
import { ok, serverError } from "@/lib/http/responses";

export async function GET(req: Request) {
  try {
    const ctx = await requirePermission(ATTENDANCE_READ_PERMISSION);
    const url = new URL(req.url);
    const date = url.searchParams.get("date")?.trim() || undefined;
    const result = await getAttendanceSummary(ctx.tenantId, date);
    return ok(result);
  } catch (error) {
    console.error("[admin/attendance][GET] Unexpected error:", error);
    return serverError();
  }
}
