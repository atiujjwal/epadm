'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
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
    <Link href="/" aria-label="EPADM — home" className="nav__logo">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        {/* E — three horizontal bars of decreasing width */}
        <rect x="4" y="6"  width="14" height="2.5" rx="1.25" fill="var(--accent-primary)" />
        <rect x="4" y="14.75" width="10" height="2.5" rx="1.25" fill="var(--accent-primary)" />
        <rect x="4" y="23.5" width="14" height="2.5" rx="1.25" fill="var(--accent-primary)" />
        {/* Vertical bar */}
        <rect x="4" y="6" width="2.5" height="20" rx="1.25" fill="var(--accent-primary)" />
        {/* Dot — precision mark */}
        <circle cx="24" cy="24" r="4" fill="var(--color-indigo-300)" opacity="0.7" />
        <circle cx="24" cy="24" r="2" fill="var(--accent-primary)" />
      </svg>
      <span className="nav__logo-text">EPADM</span>
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
          className="nav__dropdown"
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
              className="nav__dropdown-item"
              role="menuitem"
              onClick={onClose}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="nav__dropdown-item-label">
                {item.label}
                {item.badge && <span className="badge badge--accent">{item.badge}</span>}
              </span>
              {item.description && (
                <span className="nav__dropdown-item-desc">{item.description}</span>
              )}
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
            className="nav__mobile-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <m.div
            className="nav__mobile-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Drawer header */}
            <div className="nav__mobile-header">
              <Logo />
              <button
                className="btn btn--ghost btn--icon"
                onClick={onClose}
                aria-label="Close navigation"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="nav__mobile-nav" aria-label="Mobile navigation">
              {mainNav.map((group) => (
                <div key={group.label} className="nav__mobile-group">
                  {group.items ? (
                    <>
                      <button
                        className="nav__mobile-group-trigger"
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
                        <div className="nav__mobile-sub">
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="nav__mobile-sub-item"
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
                      className="nav__mobile-group-trigger"
                      onClick={onClose}
                    >
                      {group.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Drawer CTAs */}
            <div className="nav__mobile-ctas">
              <Link
                href={ctaNav.tenantLogin.href}
                className="btn btn--secondary w-full"
                onClick={onClose}
              >
                {ctaNav.tenantLogin.label}
              </Link>
              <Link
                href={ctaNav.primary.href}
                className="btn btn--primary w-full"
                onClick={onClose}
              >
                {ctaNav.primary.label}
              </Link>
              {features.showCmsAccess && (
                <Link
                  href={ctaNav.cms.href}
                  className="nav__mobile-cms-link"
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
        className={`nav${scrolled ? ' nav--scrolled' : ''}`}
        ref={navRef}
        role="banner"
      >
        <div className="nav__inner container">
          {/* Logo */}
          <Logo />

          {/* Desktop nav */}
          <nav className="nav__desktop" aria-label="Main navigation">
            <ul className="nav__list" role="list">
              {mainNav.map((group) => (
                <li
                  key={group.label}
                  className="nav__item"
                  onMouseEnter={() => group.items && handleGroupEnter(group.label)}
                  onMouseLeave={() => group.items && handleGroupLeave()}
                >
                  {group.items ? (
                    <button
                      className={`nav__trigger${isGroupActive(group) ? ' nav__trigger--active' : ''}`}
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
                        className="nav__chevron"
                        style={{
                          transform: activeGroup === group.label ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.18s ease',
                        }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={group.href!}
                      className={`nav__trigger${isGroupActive(group) ? ' nav__trigger--active' : ''}`}
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

          {/* Desktop CTAs */}
          <div className="nav__ctas">
            {features.showCmsAccess && (
              <Link
                href={ctaNav.cms.href}
                className="nav__cms-link"
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

            <Link href={ctaNav.tenantLogin.href} className="btn btn--ghost btn--sm">
              {ctaNav.tenantLogin.label}
            </Link>

            <Link href={ctaNav.primary.href} className="btn btn--primary btn--sm">
              {ctaNav.primary.label}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav__hamburger btn btn--ghost btn--icon"
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
      <div className="nav__spacer" aria-hidden="true" />
    </>
  );
}