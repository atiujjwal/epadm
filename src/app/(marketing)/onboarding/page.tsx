"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = searchParams.get("slug") ?? "demo";
  const email = searchParams.get("email") ?? "admin@schoolapp.com";
  const name = searchParams.get("name") ?? "Springfield Public School";

  return (
    <Card variant="elevated" padding="lg" className="onboarding-page__card">
      <div className="text-center">
        <div className="onboarding-page__badge">
          Workspace ready
        </div>
        <h1 className="onboarding-page__heading">
          Institution Provisioned!
        </h1>
        <p className="onboarding-page__body">
          Your new school workspace has been successfully created.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <dl className="onboarding-page__details">
          <div className="onboarding-page__detail-item">
            <dt className="onboarding-page__detail-label">School Name</dt>
            <dd className="onboarding-page__detail-value">{name}</dd>
          </div>

          <div className="onboarding-page__detail-item">
            <dt className="onboarding-page__detail-label">School Subdomain / Slug</dt>
            <dd className="onboarding-page__detail-value">
              <code 
                style={{ 
                  color: "var(--color-success-600)", 
                  backgroundColor: "var(--color-success-50)", 
                  border: "1px solid var(--color-success-100)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "var(--text-xs)",
                  fontFamily: "var(--font-mono)"
                }}
              >
                {slug}
              </code>
            </dd>
          </div>

          <div className="onboarding-page__detail-item">
            <dt className="onboarding-page__detail-label">Admin Email</dt>
            <dd className="onboarding-page__detail-value">{email}</dd>
          </div>
        </dl>

        <div 
          style={{ 
            borderColor: "var(--color-success-100)", 
            backgroundColor: "rgba(16, 185, 129, 0.05)",
            color: "var(--color-success-600)",
            padding: "1rem",
            borderRadius: "var(--radius-lg)",
            fontSize: "var(--text-xs)",
            borderStyle: "dashed",
            borderWidth: "1px",
            lineHeight: "var(--leading-relaxed)"
          }}
        >
          <strong style={{ display: "block", marginBottom: "4px" }}>Accessing Your Tenant:</strong>
          When logging into SchoolOS, you will need to input your school slug (<strong>{slug}</strong>) along with your administrator email and password to scope your session.
        </div>
      </div>

      <div className="onboarding-page__actions">
        <Button
          onClick={() => router.push("/login")}
          variant="primary"
          className="w-full justify-center"
        >
          Proceed to Login
        </Button>
      </div>
    </Card>
  );
}

export default function OnboardingPage() {
  return (
    <div className="onboarding-page">
      <Suspense fallback={<div className="text-muted">Loading workspace configurations...</div>}>
        <OnboardingContent />
      </Suspense>
    </div>
  );
}
