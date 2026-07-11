"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";
  const name = searchParams.get("name") ?? "your school";

  return (
    <div className="onboarding-page">
      <Card variant="elevated" padding="lg" className="onboarding-page__card">
        <div className="onboarding-page__badge">
          Workspace ready
        </div>
        <h1 className="onboarding-page__heading">
          {name} is provisioned
        </h1>
        <p className="onboarding-page__body">
          Your tenant record, administrator account, and default service
          entitlements are active. Sign in with your school slug and admin
          credentials to open the dashboard.
        </p>

        <dl className="onboarding-page__details">
          <div className="onboarding-page__detail-item">
            <dt className="onboarding-page__detail-label">School slug</dt>
            <dd className="onboarding-page__detail-value">{slug || "—"}</dd>
          </div>
          <div className="onboarding-page__detail-item">
            <dt className="onboarding-page__detail-label">Next step</dt>
            <dd className="onboarding-page__detail-value">
              Sign in and configure users, academics, and staff.
            </dd>
          </div>
        </dl>

        <div className="onboarding-page__actions">
          <Button
            href="/login"
            variant="primary"
            className="flex-1 justify-center"
          >
            Go to sign in
          </Button>
          <Button
            href="/register"
            variant="secondary"
            className="flex-1 justify-center"
          >
            Register another school
          </Button>
        </div>
      </Card>
    </div>
  );
}
