import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { getMembership } from "@/lib/phase3/administration";
export default async function MembershipPage({ params }: { params: Promise<{ membershipId: string }> }) { const ctx = await requirePermission("administration.users.read"); const { membershipId } = await params; const m = await getMembership(ctx.tenantId, membershipId); if (!m) notFound(); return <div className="space-y-6"><PageHeader title={m.name} description={m.email} badge={<div className="flex gap-2"><Badge>{m.role}</Badge><Badge variant={m.status === "active" ? "success" : "warning"}>{m.status}</Badge></div>} />
  <div className="grid gap-4 md:grid-cols-2"><Card padding="lg"><h2 className="font-semibold">Role assignment</h2><p className="mt-3 text-sm">Built-in role: {m.role}</p><p className="text-sm text-muted-foreground">Custom role: {m.customRoleId ?? "None"}</p></Card><Card padding="lg"><h2 className="font-semibold">Account details</h2><p className="mt-3 text-sm">Joined: {m.joinedAt.toLocaleString()}</p><p className="text-sm">Last login: {m.lastLoginAt?.toLocaleString() ?? "Never"}</p></Card></div>
  <Card padding="lg"><h2 className="font-semibold">Recent activity</h2><div className="mt-3 space-y-2">{m.activity.length ? m.activity.map((event)=><div key={event.id} className="flex justify-between border-b py-2 text-sm"><span>{event.action}</span><span className="text-muted-foreground">{event.createdAt.toLocaleString()}</span></div>) : <p className="text-sm text-muted-foreground">No recent activity.</p>}</div></Card></div>; }
