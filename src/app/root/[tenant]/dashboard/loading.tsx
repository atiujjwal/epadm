import { Skeleton, StatCardSkeleton, MemberListSkeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="page-header">
        <div className="page-header__content">
          <Skeleton width="16rem" height="1.75rem" />
          <Skeleton width="24rem" height="0.875rem" />
        </div>
      </div>

      {/* 5 metric cards */}
      <StatCardSkeleton count={5} />

      {/* Content grid */}
      <section className="dashboard-content">
        {/* Left: recent members */}
        <Card variant="elevated" padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton width="10rem" height="1.25rem" />
            <Skeleton width="6rem" height="2rem" style={{ borderRadius: "var(--radius-md)" }} />
          </div>
          <MemberListSkeleton count={5} />
        </Card>

        {/* Right sidebar */}
        <div className="dashboard-sidebar">
          {/* Role chart skeleton */}
          <Card variant="elevated" padding="lg">
            <Skeleton width="9rem" height="1.125rem" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="role-chart__row">
                  <Skeleton width="4rem" height="0.75rem" />
                  <Skeleton width="100%" height="0.5rem" style={{ borderRadius: "var(--radius-full)" }} />
                  <Skeleton width="1.5rem" height="0.75rem" />
                </div>
              ))}
            </div>
          </Card>

          {/* Context skeleton */}
          <Card variant="elevated" padding="lg">
            <Skeleton width="8rem" height="1.125rem" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} width="100%" height="1.75rem" />
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
