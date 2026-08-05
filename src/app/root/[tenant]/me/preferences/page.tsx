import { eq } from "drizzle-orm";
import { getCtx } from "@/lib/context";
import { notificationPreferences } from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { PortalShell, SimpleTable, Status } from "../../phase11-view";

export default async function PreferencesPage() {
  const ctx = await getCtx();
  const preferences = await withTenant(ctx.tenantId, (tx) => tx.select().from(notificationPreferences).where(eq(notificationPreferences.userId, ctx.userId)));
  return <PortalShell title="Preferences" description="Notification channel preferences. Use POST /api/v1/me/notification-preferences to update toggles."><SimpleTable rows={preferences} empty="Default preferences are enabled until you disable a channel." columns={[{ label: "Event", value: (row) => row.eventType }, { label: "Channel", value: (row) => row.channel }, { label: "Enabled", value: (row) => <Status value={row.isEnabled ? "enabled" : "disabled"} /> }]} /></PortalShell>;
}
