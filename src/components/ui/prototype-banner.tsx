import { Construction } from "lucide-react";
import { cn } from "@/lib/utils";

type PrototypeBannerProps = {
  feature: string;
  phase: number;
  message?: string;
  className?: string;
};

export function PrototypeBanner({
  feature,
  phase,
  message,
  className,
}: PrototypeBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm",
        className,
      )}
      role="status"
      aria-label={`${feature} is under development`}
    >
      <Construction className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
      <div className="space-y-0.5">
        <p className="font-medium text-warning-foreground">{feature} — Under Development</p>
        <p className="text-muted-foreground">
          {message ?? `This feature is planned for Phase ${phase} and is not yet available.`}
        </p>
      </div>
    </div>
  );
}
