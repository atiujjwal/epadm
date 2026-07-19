/**
 * SkipLink — visible on focus, allows keyboard users to jump to #main-content.
 * Required for WCAG 2.4.1 (Bypass Blocks).
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="absolute -top-full left-[var(--space-4)] z-[var(--z-toast)] px-[var(--space-6)] py-[var(--space-3)] bg-[var(--accent-primary)] text-[var(--color-white)] font-semibold rounded-[var(--radius-md)] transition-[top] duration-[var(--duration-fast)] ease-[var(--ease-default)] no-underline focus:top-[var(--space-4)]"
    >
      Skip to main content
    </a>
  );
}
