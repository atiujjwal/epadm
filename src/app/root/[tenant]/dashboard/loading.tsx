import { Skeleton, StatCardSkeleton, MemberListSkeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Page header skeleton */}
      <div className="page-header">
        <div className="page-header__content">
          <Skeleton width="16rem" height="1.75rem" />
          <Skeleton width="24rem" height="0.875rem" />
        </div>
      </div>

      {/* 5 metric cards matching your global CSS grid */}
      <section className="dashboard-metrics">
        <StatCardSkeleton count={5} />
      </section>

      {/* Content grid */}
      <section className="dashboard-content">
        {/* Left: recent members */}
        <Card variant="elevated" padding="lg">
          <div className="mb-6 space-y-2">
            <Skeleton width="12rem" height="1.5rem" />
            <Skeleton width="20rem" height="1rem" />
          </div>
          <div className="mt-6">
             <MemberListSkeleton count={5} />
          </div>
        </Card>

        {/* Right sidebar */}
        <div className="dashboard-sidebar">
          {/* Role chart skeleton */}
          <Card variant="elevated" padding="lg">
            <Skeleton width="10rem" height="1.5rem" className="mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton width="4rem" height="0.875rem" />
                  <Skeleton width="100%" height="0.5rem" className="rounded-full" />
                  <Skeleton width="1.5rem" height="0.875rem" />
                </div>
              ))}
            </div>
          </Card>

          {/* Context skeleton matching new rich UI layout */}
          <Card variant="elevated" padding="lg">
            <Skeleton width="10rem" height="1.5rem" className="mb-5" />
            
            <div className="flex flex-col gap-5">
              {/* Tech details well skeleton */}
              <Skeleton width="100%" height="9rem" className="rounded-xl" />
              
              {/* Badges grid skeleton */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Skeleton width="100%" height="4.5rem" className="rounded-xl" />
                <Skeleton width="100%" height="4.5rem" className="rounded-xl" />
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}