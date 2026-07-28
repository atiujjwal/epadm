"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TenantErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tenant error boundary caught", {
      digest: error.digest,
      name: error.name,
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="h-10 w-10 text-warning" aria-hidden="true" />
      <div>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          An unexpected error occurred. Our team has been notified.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={reset}>Try again</Button>
        <Button variant="ghost" onClick={() => { window.location.href = "/dashboard"; }}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
