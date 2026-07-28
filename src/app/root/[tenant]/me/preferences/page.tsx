import { PageHeader } from "@/components/layout/page-header";
import { getCtx } from "@/lib/context";

export default async function PreferencesPage() {
  await getCtx();

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Preferences" description="Personal notification and regional settings." />
      <div className="max-w-2xl space-y-6 rounded-lg border bg-surface p-6">
        <fieldset disabled className="space-y-3">
          <legend className="font-semibold">Notifications</legend>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Email notifications</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Mobile push notifications</label>
        </fieldset>
        <div className="space-y-1.5">
          <label htmlFor="timezone" className="text-sm font-medium">Timezone</label>
          <select id="timezone" disabled className="block w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option>Asia/Kolkata</option>
          </select>
          <p className="text-xs text-muted-foreground">Preference saving will be enabled in a later phase.</p>
        </div>
      </div>
    </div>
  );
}
