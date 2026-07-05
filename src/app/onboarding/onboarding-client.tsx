"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";
  const name = searchParams.get("name") ?? "your school";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
          Workspace ready
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          {name} is provisioned
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Your tenant record, administrator account, and default service
          entitlements are active. Sign in with your school slug and admin
          credentials to open the dashboard.
        </p>

        <dl className="mt-6 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm">
          <div>
            <dt className="text-zinc-500">School slug</dt>
            <dd className="font-medium text-zinc-900">{slug || "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Next step</dt>
            <dd className="font-medium text-zinc-900">
              Sign in and configure users, academics, and staff.
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex flex-1 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Go to sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex flex-1 items-center justify-center rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Register another school
          </Link>
        </div>
      </div>
    </div>
  );
}
