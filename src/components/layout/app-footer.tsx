export function AppFooter() {
  return (
    <footer className="app-footer">
      <span>&copy; {new Date().getFullYear()} EPADM</span>
      <span aria-hidden="true">&middot;</span>
      <span>v1.0</span>
      <span aria-hidden="true">&middot;</span>
      <span className="app-footer__status">
        <span className="app-footer__status-dot" aria-hidden="true" />
        All systems operational
      </span>
      <span aria-hidden="true">&middot;</span>
      <a href="mailto:support@epadm.in" className="app-footer__link">Support</a>
    </footer>
  );
}
