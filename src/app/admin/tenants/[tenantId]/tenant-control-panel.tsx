"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FinOpsTab } from "./FinOpsTab";
import { PerformanceTab } from "./PerformanceTab";
import PageHeader from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      <PageHeader
        title={name}
        description={`Slug: ${slug}`}
        badge={
          <Badge variant={isActive ? "success" : "error"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        }
      />

      <div className="tab-nav">
        {(["controls", "performance", "finops"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`tab-nav__button ${tab === key ? "tab-nav__button--active" : ""}`}
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
          <Card variant="default" padding="md">
            <CardHeader className="border-b-0 pb-0">
              <h2 className="font-semibold text-primary text-lg">Lifecycle controls</h2>
            </CardHeader>
            <CardBody className="pt-2 space-y-4">
              <p className="text-sm text-secondary">
                Disruptive changes require typing the tenant slug to confirm.
              </p>
              <div className="space-y-3">
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason (optional)"
                />
                <Input
                  value={confirmSlug}
                  onChange={(e) => setConfirmSlug(e.target.value)}
                  placeholder={`Type "${slug}" to confirm`}
                />
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={() => toggleStatus(false)}
                    variant="danger"
                  >
                    Deactivate
                  </Button>
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={() => toggleStatus(true)}
                    variant="primary"
                  >
                    Reactivate
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card variant="default" padding="md">
            <CardHeader className="border-b-0 pb-0">
              <h2 className="font-semibold text-primary text-lg">Feature flags</h2>
            </CardHeader>
            <CardBody className="pt-2">
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between rounded-xl border border-default px-4 py-3 bg-surface-2"
                  >
                    <div>
                      <div className="font-medium text-primary">
                        {service.serviceKey}
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        {service.isEnabled ? (
                          <Badge variant="success" className="px-1.5 py-0.5 text-[10px]">Enabled</Badge>
                        ) : (
                          <Badge variant="error" className="px-1.5 py-0.5 text-[10px]">Disabled</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        toggleService(service.serviceKey, !service.isEnabled)
                      }
                      variant="outline"
                      size="sm"
                    >
                      Toggle
                    </Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === "performance" && <PerformanceTab metrics={metrics} />}
      {tab === "finops" && <FinOpsTab metrics={metrics} />}

      {message && <p className="text-sm font-medium" style={{ color: "var(--color-error-500)" }}>{message}</p>}
    </div>
  );
}
