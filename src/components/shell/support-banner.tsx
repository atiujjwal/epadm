export function SupportBanner({ expiresAt }: { expiresAt: Date }) {
  return (
    <div className="sticky top-0 z-50 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-950">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-2">
        <span>
          ⚠ Support access active — all actions are logged. Session expires at{" "}
          {expiresAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.
        </span>
        <span className="font-medium">End it from the ops console when diagnosis is complete.</span>
      </div>
    </div>
  );
}
