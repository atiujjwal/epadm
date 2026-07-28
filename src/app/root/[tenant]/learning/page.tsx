import { PrototypeBanner } from "@/components/ui/prototype-banner";
import { PageHeader } from "@/components/layout/page-header";
import { requirePermission } from "@/lib/auth/guards";

export default async function LearningPage() {
  await requirePermission("learning.read");

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Teaching & Learning"
        description="Assignments, gradebook, lesson plans, and learning resources."
      />
      <PrototypeBanner feature="Teaching & Learning" phase={5} />
    </div>
  );
}
