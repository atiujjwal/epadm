"use client";

import { useState } from "react";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormItem, FormError } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import Link from "next/link";

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
    <div className="login-page">
      <Card variant="elevated" padding="lg" className="login-page__card">
        <div className="login-page__header">
          <h1 className="login-page__heading">
            Sign in to SchoolOS
          </h1>
          <p className="login-page__subheading">
            Enter your school slug, email, and password to continue.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="login-page__form">
          <FormItem>
            <Label htmlFor="tenantSlug" required>School slug</Label>
            <Input
              id="tenantSlug"
              type="text"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value.trim())}
              placeholder="e.g. stxaviers"
              required
            />
          </FormItem>

          <FormItem>
            <Label htmlFor="email" required>Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              required
            />
          </FormItem>

          <FormItem>
            <Label htmlFor="password" required>Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </FormItem>

          {error && (
            <FormError role="alert">
              {error}
            </FormError>
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full justify-center"
            style={{ marginTop: 'var(--space-2)' }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="login-page__footer">
          Need a new school workspace?{" "}
          <Link href="/register" className="login-page__link">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
}