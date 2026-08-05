import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { listCommunicationsModel } from "@/lib/phase11/notifications";
import { PortalShell, SimpleTable, StatGrid, Status } from "../phase11-view";

export default async function CommunicationsPage() {
  const ctx = await requirePermission("communications.read");
  const model = await listCommunicationsModel(ctx.tenantId);
  return (
    <PortalShell title="Communications" description="Announcements, campaigns, templates, delivery queue, and parent messages.">
      <StatGrid stats={[
        { label: "Announcements", value: model.announcements.length },
        { label: "Campaigns", value: model.campaigns.length },
        { label: "Templates", value: model.templates.length },
        { label: "Queued", value: model.queue.filter((row) => row.status === "pending").length },
      ]} />
      <div className="flex flex-wrap gap-2 text-sm">{["announcements", "campaigns", "templates", "queue", "messages"].map((item) => <Link key={item} href={`/communications/${item}`} className="rounded-md border bg-surface px-3 py-2 capitalize">{item}</Link>)}</div>
      <SimpleTable rows={model.announcements.slice(0, 8)} empty="No announcements yet." columns={[{ label: "Title", value: (row) => row.title }, { label: "Target", value: (row) => row.targetRole ?? row.targetSectionId ?? "Whole school" }, { label: "Status", value: (row) => <Status value={row.isDraft ? "draft" : "published"} /> }]} />
    </PortalShell>
  );
}
