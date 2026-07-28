import { Users } from "lucide-react";
import { PrototypeBanner } from "@/components/ui/prototype-banner";
import { PageHeader } from "@/components/layout/page-header";
import { requireRole } from "@/lib/auth/guards";

export default async function ParentPortalPage() {
  await requireRole(["parent"]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Parent portal"
        description="Follow your linked children’s attendance, learning, and school activity."
      />
      <div className="rounded-lg border bg-surface p-5">
        <label htmlFor="child-context" className="text-sm font-medium">
          Child context
        </label>
        <select
          id="child-context"
          className="mt-2 block w-full max-w-sm rounded-md border bg-background px-3 py-2 text-sm"
          disabled
        >
          <option>No linked children</option>
        </select>
        <div className="mt-6 flex max-w-lg flex-col items-center rounded-lg border border-dashed p-8 text-center">
          <Users className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-3 font-semibold">No children linked yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask your school administrator to link a student record to this account.
          </p>
        </div>
      </div>
      <PrototypeBanner feature="Parent insights" phase={8} />
    </div>
  );
}
