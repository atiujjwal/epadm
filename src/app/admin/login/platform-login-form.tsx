"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormItem } from "@/components/ui/form";
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import { Label } from "@/components/ui/label";

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
        <p className="text-sm text-muted">
          Enter the 6-digit code from your authenticator app.
        </p>
        <Input
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value)}
          className="text-center text-lg font-mono tracking-widest"
          placeholder="000000"
        />
        <FormErrorSummary errors={error ? [error] : []} />
        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          className="w-full justify-center"
        >
          {loading ? "Verifying..." : "Verify MFA"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} noValidate className="flex w-full flex-col gap-5">
      <FormItem>
        <Label htmlFor="email">Operator email</Label>
        <Input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@schoolapp.com"
        />
      </FormItem>

      <FormItem>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </FormItem>

      <FormErrorSummary errors={error ? [error] : []} />

      <Button
        type="submit"
        disabled={loading}
        variant="primary"
        className="w-full justify-center"
      >
        {loading ? "Signing in..." : "Sign in to control plane"}
      </Button>
    </form>
  );
}
