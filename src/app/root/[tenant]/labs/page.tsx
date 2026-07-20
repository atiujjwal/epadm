import { listLabBookings } from "@/lib/admin/labs";
import { getCtx } from "@/lib/context";
import { LabsWorkspace } from "./labs-workspace";

export default async function LabsPage() {
  const ctx = await getCtx();
  const bookings = await listLabBookings(ctx.tenantId);
  return <LabsWorkspace initialBookings={bookings} />;
}
