"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";

export function PlatformLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetchWithCsrf("/api/platform/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      if (data.requiresMfa) {
        setMfaToken(data.mfaToken);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetchWithCsrf("/api/platform/auth/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaToken, code: mfaCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "MFA verification failed");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (mfaToken) {
    return (
      <form onSubmit={handleMfa} className="space-y-4">
        <p className="text-sm text-zinc-600">
          Enter the 6-digit code from your authenticator app.
        </p>
        <input
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-center text-lg tracking-widest"
          placeholder="000000"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify MFA"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Operator email
        </label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
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
          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in to control plane"}
      </button>
    </form>
  );
}
