import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/catalog";
import { requirePermission } from "@/lib/auth/guards";
import { assertStudentAccess, getStudent360 } from "@/lib/phase3/students";

const tabs = [
  ["overview", "Overview"],
  ["profile", "Profile"],
  ["enrollment", "Enrollment"],
  ["guardians", "Guardians"],
  ["documents", "Documents"],
  ["attendance", "Attendance"],
  ["fees", "Fees"],
  ["assessments", "Assessments"],
  ["transport", "Transport"],
  ["hostel", "Hostel"],
  ["activities", "Activities"],
  ["health", "Health"],
  ["notes", "Notes"],
] as const;

export default async function StudentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ studentId: string }>;
}) {
  const ctx = await requirePermission("students.read");
  const { studentId } = await params;
  await assertStudentAccess(ctx.tenantId, ctx.userId, ctx.role, studentId);
  const data = await getStudent360(ctx.tenantId, studentId, ctx.role);
  if (!data) notFound();

  const s = data.student;
  const canViewHealth = DEFAULT_ROLE_PERMISSIONS[ctx.role].includes("facilities.health.manage");
  const visibleTabs = tabs.filter(([key]) => key !== "health" || canViewHealth);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${s.firstName} ${s.lastName ?? ""}`}
        description={`Admission ${s.admissionNumber}`}
        badge={<Badge variant={s.status === "active" ? "success" : "default"}>{s.status}</Badge>}
      />
      <nav className="flex gap-1 overflow-x-auto border-b">
        {visibleTabs.map(([key, label]) => (
          <Link
            key={key}
            href={`/students/${studentId}/${key}`}
            className="whitespace-nowrap px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
