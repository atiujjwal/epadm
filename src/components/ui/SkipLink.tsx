/**
 * SkipLink
 * Renders a visually-hidden link that becomes visible on focus,
 * allowing keyboard users to skip directly to the main content.
 * Required for WCAG 2.4.1 (Bypass Blocks).
 */
export function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}
