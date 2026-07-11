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
      <form onSubmit={handleMfa} noValidate className="flex w-full flex-col gap-5">
        <p className="text-sm text-zinc-400">
          Enter the 6-digit code from your authenticator app.
        </p>
        <input
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-center text-lg font-mono tracking-widest text-white outline-none transition duration-150 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 placeholder-zinc-700"
          style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          placeholder="000000"
        />
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-amber-500 px-4 py-3 text-sm font-bold text-zinc-950 transition duration-150 hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
        >
          {loading ? "Verifying..." : "Verify MFA"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} noValidate className="flex w-full flex-col gap-5">
      <div className="flex flex-col">
        <label className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Operator email
        </label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@schoolapp.com"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition duration-150 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 placeholder-zinc-700"
          style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition duration-150 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 placeholder-zinc-700"
          style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {error && <p className="text-sm font-medium text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-lg bg-amber-500 px-4 py-3 text-sm font-bold text-zinc-950 transition duration-150 hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
      >
        {loading ? "Signing in..." : "Sign in to control plane"}
      </button>
    </form>
  );
}