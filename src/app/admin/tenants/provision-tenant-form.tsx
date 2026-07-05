"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

export function ProvisionTenantForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    adminEmail: "",
    subscriptionTier: "basic",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetchWithCsrf("/api/platform/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Provisioning failed");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
      >
        Provision tenant
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-zinc-950">
              Provision new school
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                placeholder="School name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5"
                required
              />
              <input
                placeholder="slug (e.g. stxaviers)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5"
                pattern="[a-z0-9-]+"
                required
              />
              <input
                type="email"
                placeholder="Admin email"
                value={form.adminEmail}
                onChange={(e) =>
                  setForm({ ...form, adminEmail: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5"
                required
              />
              <select
                value={form.subscriptionTier}
                onChange={(e) =>
                  setForm({ ...form, subscriptionTier: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5"
              >
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  {loading ? "Provisioning..." : "Create tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
