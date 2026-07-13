import { Skeleton, StatCardSkeleton, MemberListSkeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div style={{ paddingBottom: "var(--space-6)", borderBottom: "1px solid var(--border-default)", marginBottom: "var(--space-6)" }}>
        <Skeleton width="14rem" height="1.5rem" />
        <Skeleton width="24rem" height="0.875rem" style={{ marginTop: "var(--space-2)" }} />
      </div>

      {/* Stat cards skeleton */}
      <StatCardSkeleton count={4} />

      {/* Content area skeleton */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card variant="elevated" padding="lg">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton width="12rem" height="1.125rem" />
              <Skeleton width="20rem" height="0.75rem" />
            </div>
            <Skeleton width="6rem" height="2rem" style={{ borderRadius: "var(--radius-md)" }} />
          </div>
          <MemberListSkeleton count={5} />
        </Card>

        <div className="space-y-6">
          <Card variant="elevated" padding="lg">
            <Skeleton width="10rem" height="1.125rem" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton width="5rem" height="0.875rem" />
                  <Skeleton width="2rem" height="0.875rem" />
                </div>
              ))}
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <Skeleton width="8rem" height="1.125rem" />
            <div className="mt-4 grid gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl px-4 py-3" style={{ backgroundColor: "var(--bg-surface-2)" }}>
                  <Skeleton width="5rem" height="0.625rem" />
                  <Skeleton width="100%" height="0.875rem" style={{ marginTop: "var(--space-2)" }} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
