import { Badge } from "@/components/ui/badge";
import { getCtx } from "@/lib/context";
import { getStudent360 } from "@/lib/phase3/students";

export default async function Enrollment({ params }: { params: Promise<{ studentId: string }> }) {
  const ctx = await getCtx();
  const { studentId } = await params;
  const data = await getStudent360(ctx.tenantId, studentId, ctx.role);
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        {data.enrollments.map((enrollment) => (
          <div key={enrollment.id} className="flex items-center justify-between border-b p-4 last:border-0">
            <div>
              <p className="font-medium">{enrollment.academicYear} · {enrollment.className} {enrollment.sectionName}</p>
              <p className="text-sm text-muted-foreground">Roll {enrollment.rollNumber ?? "—"} · Enrolled {enrollment.enrolledOn ?? "—"}</p>
            </div>
            <Badge variant={enrollment.status === "active" ? "success" : "default"}>{enrollment.status}</Badge>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-surface p-4 text-sm text-muted-foreground">
        Class progression and rollover workflows are available from Academics → Progression.
      </div>
    </div>
  );
}
