import { Card } from "@/components/ui/card";
import { getCtx } from "@/lib/context";

export default async function SetupPendingPage() {
  const ctx = await getCtx();

  return (
    <main className="grid min-h-screen place-items-center bg-muted/20 p-6">
      <Card padding="lg" className="max-w-lg rounded-lg text-center">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">System under setup</div>
        <h1 className="mt-2 text-2xl font-semibold">{ctx.tenantName || "Your school"} is being configured</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The tenant superadmin must complete first-login onboarding before dashboards and operations are available.
        </p>
      </Card>
    </main>
  );
}
