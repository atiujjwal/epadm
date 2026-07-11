"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/http/fetch-with-csrf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormItem, FormError } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";

export function ProvisionTenantForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    adminEmail: "",
    adminPassword: "",
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
      <Button
        type="button"
        onClick={() => setOpen(true)}
        variant="accent"
      >
        Provision tenant
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card variant="elevated" padding="none" className="w-full max-w-lg overflow-hidden shadow-2xl">
            <CardHeader className="px-6 py-4 border-b border-default flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">
                Provision new school
              </h2>
              <button 
                type="button" 
                onClick={() => setOpen(false)}
                className="text-muted hover:text-primary transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardBody className="p-6 space-y-4">
                <FormItem>
                  <Label htmlFor="name" required>School Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. International Public School"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </FormItem>

                <FormItem>
                  <Label htmlFor="slug" required>Slug</Label>
                  <Input
                    id="slug"
                    placeholder="e.g. ipsmohania"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    pattern="[a-z0-9-]+"
                    required
                  />
                  <p className="text-xs text-muted mt-1">Only lowercase letters, numbers, and hyphens.</p>
                </FormItem>

                <FormItem>
                  <Label htmlFor="adminEmail" required>Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@school.edu"
                    value={form.adminEmail}
                    onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                    required
                  />
                </FormItem>

                <FormItem>
                  <Label htmlFor="adminPassword" required>Admin Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={form.adminPassword}
                    onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-muted mt-1">The tenant admin will use this password to sign in at /login.</p>
                </FormItem>

                <FormItem>
                  <Label htmlFor="subscriptionTier">Subscription Plan</Label>
                  <Select
                    id="subscriptionTier"
                    value={form.subscriptionTier}
                    onChange={(e) => setForm({ ...form, subscriptionTier: e.target.value })}
                  >
                    <option value="basic">Basic Plan</option>
                    <option value="pro">Pro Plan</option>
                    <option value="enterprise">Enterprise Plan</option>
                  </Select>
                </FormItem>

                {error && <FormError>{error}</FormError>}
              </CardBody>
              <CardFooter className="px-6 py-4 bg-surface-2 border-t border-subtle flex justify-end gap-3" style={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                >
                  {loading ? "Provisioning..." : "Create tenant"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
