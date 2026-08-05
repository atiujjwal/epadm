import { PageHeader } from "@/components/layout/page-header";
import { requirePermission } from "@/lib/auth/guards";

export default async function LearningPage() {
  await requirePermission("learning.read");

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Teaching & Learning"
        description="Assignments, gradebook, lesson planning, and learning resources."
      />
      <div className="rounded-lg border bg-surface p-6 text-sm text-muted-foreground">
        Assignment submission and student learning portal workflows are live. Full lesson-bank authoring remains a documented deferred enhancement beyond Phase 13.
      </div>
    </div>
  );
}
