"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import {
  updateOwnProfile,
  type ProfileActionState,
} from "./profile-actions";

const initialState: ProfileActionState = { status: "idle", errors: [] };

export function ProfileForm({
  profile,
}: {
  profile: { name: string; email: string; phone: string };
}) {
  const [state, formAction, pending] = useActionState(
    updateOwnProfile,
    initialState,
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-5 rounded-lg border bg-surface p-6">
      <FormErrorSummary errors={state.errors} />
      {state.status === "success" ? (
        <p role="status" className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          Profile saved.
        </p>
      ) : null}
      <div className="space-y-1.5">
        <label htmlFor="profile-name" className="text-sm font-medium">Name</label>
        <input id="profile-name" name="name" defaultValue={profile.name} required minLength={2} maxLength={255} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="profile-email" className="text-sm font-medium">Email</label>
        <input id="profile-email" name="email" type="email" defaultValue={profile.email} required maxLength={255} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="profile-phone" className="text-sm font-medium">Phone</label>
        <input id="profile-phone" name="phone" type="tel" defaultValue={profile.phone} maxLength={20} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>
      <Button type="submit" loading={pending}>Save profile</Button>
    </form>
  );
}
