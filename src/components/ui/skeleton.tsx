import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  circle?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton({ width, height, circle, className, style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-slate-100 rounded-lg",
          circle && "rounded-full",
          className
        )}
        style={{ width, height, ...style }}
        aria-hidden="true"
        {...rest}
      />
    );
  }
);

export function StatCardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-12" />
          </div>
        </div>
      ))}
    </>
  );
}

export function MemberListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 bg-white">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
