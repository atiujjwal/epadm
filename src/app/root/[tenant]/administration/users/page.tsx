import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { requirePermission } from "@/lib/auth/guards";
import { listMemberships } from "@/lib/phase3/administration";
import { InviteMemberForm } from "./invite-member-form";

export default async function MembershipsPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; status?: string; invite?: string }> }) {
  const ctx = await requirePermission("administration.users.read"); const filters = await searchParams;
  const memberships = await listMemberships(ctx.tenantId, { q: filters.q, role: filters.role as never, status: filters.status });
  return <div className="space-y-6"><PageHeader title="Users & Memberships" description="Invite people and manage school access." actions={<Link className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" href="?invite=true">Invite member</Link>} />
    {filters.invite === "true" ? <InviteMemberForm /> : null}
    <form className="flex flex-wrap gap-2"><input name="q" defaultValue={filters.q} placeholder="Search name or email" className="rounded-md border px-3 py-2 text-sm"/><select name="role" defaultValue={filters.role ?? ""} className="rounded-md border px-3 py-2 text-sm"><option value="">All roles</option>{["superadmin","admin","teacher","student","parent","hr","staff","accountant","librarian"].map((role)=><option key={role}>{role}</option>)}</select><select name="status" defaultValue={filters.status ?? ""} className="rounded-md border px-3 py-2 text-sm"><option value="">All statuses</option><option>active</option><option>invited</option><option>deactivated</option></select><button className="rounded-md border px-3 py-2 text-sm">Filter</button></form>
    <div className="overflow-x-auto rounded-lg border"><table className="w-full text-sm"><thead className="bg-muted/50 text-left"><tr>{["Member","Email","Role","Status","Last login","Actions"].map((h)=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{memberships.map((m)=><tr key={m.membershipId} className="border-t"><td className="px-4 py-3 font-medium">{m.name}</td><td className="px-4 py-3">{m.email}</td><td className="px-4 py-3"><Badge>{m.role}</Badge></td><td className="px-4 py-3"><Badge variant={m.status === "active" ? "success" : m.status === "invited" ? "warning" : "default"}>{m.status}</Badge></td><td className="px-4 py-3 text-muted-foreground">{m.lastLoginAt?.toLocaleString() ?? "Never"}</td><td className="px-4 py-3"><Link className="text-primary" href={`/administration/users/${m.membershipId}`}>Manage</Link></td></tr>)}</tbody></table></div>
  </div>;
}
