"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FinOpsTab } from "./FinOpsTab";
import { PerformanceTab } from "./PerformanceTab";

type ServiceRow = {
  id: string;
  serviceKey: string;
  isEnabled: boolean;
};

type MetricRow = {
  logDate: string;
  activeUsers: number;
  totalAiTokens: number;
  dbStorageBytes: number;
  computeCostInr: string;
};

type Props = {
  tenantId: string;
  slug: string;
  name: string;
  isActive: boolean;
  services: ServiceRow[];
  metrics: MetricRow[];
};

export function TenantControlPanel({
  tenantId,
  slug,
  name,
  isActive,
  services,
  metrics,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"performance" | "finops" | "controls">(
    "controls",
  );
  const [confirmSlug, setConfirmSlug] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function toggleStatus(nextActive: boolean) {
    if (confirmSlug !== slug) {
      setMessage(`Type "${slug}" to confirm this lifecycle change.`);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/platform/tenants/${tenantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive, reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Status update failed");
        return;
      }

      router.refresh();
      setConfirmSlug("");
      setReason("");
    } finally {
      setLoading(false);
    }
  }

  async function toggleService(serviceKey: string, isEnabled: boolean) {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/platform/tenants/${tenantId}/services`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceKey, isEnabled }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Service toggle failed");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-950">{name}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Slug: <span className="font-mono">{slug}</span> ·{" "}
          {isActive ? "Active" : "Inactive"}
        </p>
      </div>

      <div className="flex gap-2">
        {(["controls", "performance", "finops"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === key
                ? "bg-zinc-950 text-white"
                : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {key === "controls"
              ? "Lifecycle"
              : key === "performance"
                ? "Performance"
                : "FinOps"}
          </button>
        ))}
      </div>

      {tab === "controls" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold text-zinc-950">Lifecycle controls</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Disruptive changes require typing the tenant slug to confirm.
            </p>
            <div className="mt-4 space-y-3">
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm"
              />
              <input
                value={confirmSlug}
                onChange={(e) => setConfirmSlug(e.target.value)}
                placeholder={`Type "${slug}" to confirm`}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => toggleStatus(false)}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  Deactivate
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => toggleStatus(true)}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  Reactivate
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold text-zinc-950">Feature flags</h2>
            <div className="mt-4 space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 px-4 py-3"
                >
                  <div>
                    <div className="font-medium text-zinc-950">
                      {service.serviceKey}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {service.isEnabled ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      toggleService(service.serviceKey, !service.isEnabled)
                    }
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-800"
                  >
                    Toggle
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "performance" && <PerformanceTab metrics={metrics} />}
      {tab === "finops" && <FinOpsTab metrics={metrics} />}

      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}
