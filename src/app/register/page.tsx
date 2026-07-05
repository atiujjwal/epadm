"use client";

import { useState } from "react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    adminName: "",
    adminEmail: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetchWithCsrf("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Could not register school workspace");
        setLoading(false);
        return;
      }

      // Redirect to onboarding page with details
      router.push(`/onboarding?slug=${form.slug}&email=${form.adminEmail}&name=${encodeURIComponent(form.name)}`);
    } catch (err) {
      console.error("[register] Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f4f8f6_0%,#fcfdfd_100%)] px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-bold text-emerald-700">
            e
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
            Create school workspace
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Register your institution on EPADM to begin managing students, classes, and compute resources.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                School Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Springfield Academy"
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Workspace Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value.trim().toLowerCase())}
                placeholder="e.g. springfield"
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition"
                required
              />
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-5">
            <h3 className="text-sm font-semibold text-zinc-950">Administrator Details</h3>
            <p className="text-xs text-zinc-500">This account will have master administrative control over the school workspace.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Admin Name
              </label>
              <input
                type="text"
                value={form.adminName}
                onChange={(e) => updateField("adminName", e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Admin Email
              </label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={(e) => updateField("adminEmail", e.target.value)}
                placeholder="admin@school.com"
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Admin Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-zinc-950 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 transition shadow-sm mt-6"
          >
            {loading ? "Registering Institution..." : "Register & Provision"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have a workspace?{" "}
          <a href="/login" className="font-semibold text-zinc-950 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
