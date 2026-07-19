export function AppFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-3 rounded-full bg-slate-100 px-4 py-3 text-sm text-slate-700">
      <span>&copy; {new Date().getFullYear()} EPADM</span>
      <span aria-hidden="true">&middot;</span>
      <span>v1.0</span>
      <span aria-hidden="true">&middot;</span>
      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
        All systems operational
      </span>
      <span aria-hidden="true">&middot;</span>
      <a href="mailto:support@epadm.in" className="text-slate-700 underline-offset-2 transition hover:text-slate-900 hover:underline">
        Support
      </a>
    </footer>
  );
}
