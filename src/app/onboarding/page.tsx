"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = searchParams.get("slug") ?? "demo";
  const email = searchParams.get("email") ?? "admin@schoolapp.com";
  const name = searchParams.get("name") ?? "Springfield Public School";

  return (
    <div className="w-full max-w-lg rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700">
          🎉
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          Institution Provisioned!
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Your new school workspace has been successfully created.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="rounded-2xl bg-zinc-50 p-5 space-y-3.5 border border-zinc-150">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">School Name</div>
            <div className="mt-0.5 text-sm font-medium text-zinc-800">{name}</div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">School Subdomain / Slug</div>
            <div className="mt-0.5 text-sm font-mono text-emerald-800 bg-emerald-50/50 px-2 py-1 rounded-md inline-block">
              {slug}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Admin Email</div>
            <div className="mt-0.5 text-sm font-medium text-zinc-800">{email}</div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 p-4 text-xs text-emerald-800 leading-relaxed">
          <strong className="block mb-1">Accessing Your Tenant:</strong>
          When logging into SchoolOS, you will need to input your school slug (<strong>{slug}</strong>) along with your administrator email and password to scope your session.
        </div>
      </div>

      <button
        onClick={() => router.push("/login")}
        className="mt-8 flex w-full items-center justify-center rounded-xl bg-zinc-950 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition shadow-sm"
      >
        Proceed to Login
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f4f8f6_0%,#fcfdfd_100%)] px-4 py-12">
      <Suspense fallback={<div className="text-zinc-500">Loading workspace configurations...</div>}>
        <OnboardingContent />
      </Suspense>
    </div>
  );
}
