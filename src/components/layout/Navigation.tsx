'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  mainNav,
  ctaNav,
  features,
  type NavGroup,
} from '@/config/site';

/* ── Motion variants ──────────────────────────────────────── */
const dropdownVariants = {
  hidden:  { opacity: 0, y: -6, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.18 } },
  exit:    { opacity: 0, y: -4, scale: 0.98,  transition: { duration: 0.12 } },
} as const;

const drawerVariants = {
  hidden:  { x: '100%' },
  visible: { x: 0, transition: { type: 'spring', stiffness: 340, damping: 38 } },
  exit:    { x: '100%', transition: { duration: 0.22 } },
} as const;

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
} as const;

/* ── Logo ─────────────────────────────────────────────────── */
function Logo() {
  return (
    <Link href="/" aria-label="EPADM — home" className="inline-flex items-center gap-3 text-base font-semibold text-slate-900 no-underline">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="4" y="6" width="14" height="2.5" rx="1.25" fill="var(--accent-primary)" />
        <rect x="4" y="14.75" width="10" height="2.5" rx="1.25" fill="var(--accent-primary)" />
        <rect x="4" y="23.5" width="14" height="2.5" rx="1.25" fill="var(--accent-primary)" />
        <rect x="4" y="6" width="2.5" height="20" rx="1.25" fill="var(--accent-primary)" />
        <circle cx="24" cy="24" r="4" fill="var(--color-indigo-300)" opacity="0.7" />
        <circle cx="24" cy="24" r="2" fill="var(--accent-primary)" />
      </svg>
      <span>EPADM</span>
    </Link>
  );
}

/* ── Desktop Dropdown ─────────────────────────────────────── */
interface DropdownProps {
  group: NavGroup;
  isOpen: boolean;
  onClose: () => void;
}

function Dropdown({ group, isOpen, onClose }: DropdownProps) {
  if (!group.items) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="absolute left-0 top-full z-20 mt-3 min-w-[18rem] overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl"
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="menu"
          aria-label={`${group.label} menu`}
        >
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
              role="menuitem"
              onClick={onClose}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-slate-900">{item.label}</span>
                {item.badge && <Badge variant="accent" size="sm">{item.badge}</Badge>}
              </div>
              {item.description && <p className="mt-1 text-sm text-slate-500">{item.description}</p>}
            </Link>
          ))}
        </m.div>
      )}
    </AnimatePresence>
  );
}

/* ── Mobile Drawer ────────────────────────────────────────── */
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

function MobileDrawer({ isOpen, onClose, pathname }: MobileDrawerProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Close on route change
  useEffect(() => { onClose(); }, [pathname, onClose]);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <m.div
            className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <m.div
            className="fixed right-0 top-0 z-40 h-full w-full max-w-xs bg-white p-6 shadow-2xl"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
              <Logo />
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100"
                onClick={onClose}
                aria-label="Close navigation"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="space-y-4" aria-label="Mobile navigation">
              {mainNav.map((group) => (
                <div key={group.label} className="space-y-3">
                  {group.items ? (
                    <>
                      <button
                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                        onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                        aria-expanded={openGroup === group.label}
                      >
                        {group.label}
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" aria-hidden="true"
                          style={{
                            transform: openGroup === group.label ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            flexShrink: 0
                          }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      {openGroup === group.label && (
                        <div className="space-y-2 px-2">
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
                              onClick={onClose}
                              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={group.href!}
                      className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                      onClick={onClose}
                    >
                      {group.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Drawer CTAs */}
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href={ctaNav.tenantLogin.href}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                onClick={onClose}
              >
                {ctaNav.tenantLogin.label}
              </Link>
              <Link
                href={ctaNav.primary.href}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                onClick={onClose}
              >
                {ctaNav.primary.label}
              </Link>
              {features.showCmsAccess && (
                <Link
                  href={ctaNav.cms.href}
                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  onClick={onClose}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  {ctaNav.cms.label}
                </Link>
              )}
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Navigation ───────────────────────────────────────────── */
export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Scroll listener */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Close mobile nav on route change */
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  /* Click outside to close desktop dropdown */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveGroup(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  /* Escape key for dropdown */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveGroup(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleGroupEnter = (label: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setActiveGroup(label);
  };

  const handleGroupLeave = () => {
    closeTimeout.current = setTimeout(() => setActiveGroup(null), 80);
  };

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const isGroupActive = (group: NavGroup) => {
    if (!group.href && !group.items) return false;
    if (group.href && pathname.startsWith(group.href)) return true;
    if (group.items) return group.items.some((i) => pathname.startsWith(i.href));
    return false;
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-transparent bg-white/90 backdrop-blur transition duration-300 ${scrolled ? 'border-slate-200/80 shadow-sm' : ''}`}
        ref={navRef}
        role="banner"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            <ul className="flex items-center gap-1" role="list">
              {mainNav.map((group) => (
                <li
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => group.items && handleGroupEnter(group.label)}
                  onMouseLeave={() => group.items && handleGroupLeave()}
                >
                  {group.items ? (
                    <button
                      className={`inline-flex items-center gap-1 rounded-2xl px-3 py-2 text-sm font-medium transition ${isGroupActive(group) ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                      aria-haspopup="true"
                      aria-expanded={activeGroup === group.label}
                      onClick={() =>
                        setActiveGroup(activeGroup === group.label ? null : group.label)
                      }
                    >
                      {group.label}
                      <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
                        className="transition-transform duration-200"
                        style={{
                          transform: activeGroup === group.label ? 'rotate(180deg)' : 'rotate(0)',
                        }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={group.href!}
                      className={`inline-flex rounded-2xl px-3 py-2 text-sm font-medium transition ${isGroupActive(group) ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      {group.label}
                    </Link>
                  )}

                  {group.items && (
                    <Dropdown
                      group={group}
                      isOpen={activeGroup === group.label}
                      onClose={() => setActiveGroup(null)}
                    />
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {features.showCmsAccess && (
              <Link
                href={ctaNav.cms.href}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                aria-label="Access EPADM Control Plane"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                {ctaNav.cms.label}
              </Link>
            )}

            <Link href={ctaNav.tenantLogin.href} className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              {ctaNav.tenantLogin.label}
            </Link>

            <Link href={ctaNav.primary.href} className="inline-flex rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              {ctaNav.primary.label}
            </Link>
          </div>

          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="6"  x2="21" y2="6"  />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={mobileOpen}
          onClose={closeMobile}
          pathname={pathname}
        />
      </header>

      {/* Nav Spacer */}
      <div className="h-20 lg:h-[4.5rem]" aria-hidden="true" />
    </>
  );
}