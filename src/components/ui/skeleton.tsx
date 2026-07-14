import { HTMLAttributes, forwardRef } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Width — pass any CSS value (e.g. "100%", "8rem") */
  width?: string;
  /** Height — pass any CSS value (e.g. "1rem", "2.5rem") */
  height?: string;
  /** Renders a circle instead of a rounded rectangle */
  circle?: boolean;
}

/**
 * Skeleton loading placeholder.
 *
 * Renders an animated shimmer block that occupies space while real content loads.
 * Use inside Suspense boundaries or conditional renders to prevent layout shift
 * and ghost-text bugs.
 *
 * @example
 * <Skeleton width="100%" height="1.5rem" />                  // text line
 * <Skeleton width="3rem" height="3rem" circle />             // avatar
 * <div className="grid grid-cols-4 gap-4">
 *   {Array.from({ length: 4 }).map((_, i) => (
 *     <Skeleton key={i} height="6rem" />                     // stat card
 *   ))}
 * </div>
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton({ width, height, circle, className = "", style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={`skeleton ${circle ? "skeleton--circle" : ""} ${className}`}
        style={{ width, height, ...style }}
        aria-hidden="true"
        {...rest}
      />
    );
  }
);

/**
 * Pre-built skeleton for a stat card grid (e.g. dashboard overview).
 * Renders `count` shimmer cards.
 */
export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="dashboard-metrics" style={{ '--stat-cols': count } as React.CSSProperties}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card card--elevated card--padding-md stat-card">
          <Skeleton width="2.25rem" height="2.25rem" style={{ borderRadius: "var(--radius-lg)" }} />
          <Skeleton width="6rem" height="0.75rem" />
          <Skeleton width="4rem" height="1.75rem" />
        </div>
      ))}
    </div>
  );
}

/**
 * Pre-built skeleton for a member list (e.g. recent tenant members).
 * Renders `count` shimmer rows.
 */
export function MemberListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3" style={{ borderColor: "var(--border-default)" }}>
          <div className="space-y-2">
            <Skeleton width="10rem" height="0.875rem" />
            <Skeleton width="14rem" height="0.75rem" />
          </div>
          <div className="flex gap-2">
            <Skeleton width="3.5rem" height="1.25rem" style={{ borderRadius: "var(--radius-full)" }} />
            <Skeleton width="3.5rem" height="1.25rem" style={{ borderRadius: "var(--radius-full)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
