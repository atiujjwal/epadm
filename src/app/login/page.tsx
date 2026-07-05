"use client";

import { useState } from "react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [tenantSlug, setTenantSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetchWithCsrf("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantSlug, email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Invalid credentials");
        setLoading(false);
        return;
      }

      // After successful login, middleware will rewrite /dashboard into
      // /_root/{tenantId}/dashboard based on the auth_token cookie.
      router.push("/dashboard");
    } catch (err) {
      console.error("[login] Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-semibold text-zinc-900">
          Sign in to SchoolOS
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-500">
          Enter your school slug, email, and password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              School slug
            </label>
            <input
              type="text"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value.trim())}
              placeholder="e.g. stxaviers"
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300"
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
            className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Need a new school workspace?{" "}
          <a href="/register" className="font-medium text-zinc-900 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}