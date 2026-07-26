/**
 * EPADM Site Configuration
 *
 * Single source of truth for all site-wide constants.
 * All environment-specific URLs are resolved from env vars — never hardcoded.
 */

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') return window.location.origin;
  let url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url && process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  }
  if (!url) {
    url = 'http://localhost:3000';
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }
  return url;
};

export const appUrls = {
  tenantLogin: '/#login',
  cms: '/admin/login',
  forgotPassword: '/forgot-password',
  support: 'mailto:support@epadm.in',
  docs: '/docs',
  apiDocs: '/docs/api',
  status: 'https://status.epadm.in',
} as const;

export const siteConfig = {
  name: 'EPADM',
  title: 'EPADM — Next-Gen AI-Driven K-12 School Management Platform',
  description:
    'EPADM is an end-to-end, AI-powered School Management SaaS built for private schools in India. Experience secure biometrics automation, genetic timetable scheduling, and absolute DPDP Act 2023 compliance.',
  url: getBaseUrl(),
  twitterHandle: '@epadm_in',
  keywords: [
    'school management software india',
    'k-12 school erp',
    'dpdp act compliance for schools',
    'biometric attendance system school adms',
    'ai timetable generator genetic algorithm',
    'automated exam generator ai',
    'secure student database rls',
    'school administration software',
  ],
  contactEmail: 'sales@epadm.in',
  demoFormEndpoint: '/api/demo-request',
  contactFormEndpoint: '/api/contact',
} as const;

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
  badge?: string;
};

export type NavGroup = {
  label: string;
  href?: string;
  items?: NavItem[];
};

export const mainNav: NavGroup[] = [
  {
    label: 'Features',
    href: '/#features',
  },
  {
    label: 'Pricing',
    href: '/#pricing',
  },
  {
    label: 'Compliance',
    href: '/security',
  },
] as const;

export const ctaNav = {
  primary: {
    label: 'Request Demo',
    href: '/demo',
  },
  tenantLogin: {
    label: 'School Login',
    href: appUrls.tenantLogin,
  },
  cms: {
    label: 'Platform Admin',
    href: appUrls.cms,
  },
} as const;

export const footerNav = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Platform Overview', href: '/platform' },
      { label: 'Security & Compliance', href: '/security' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Request a Demo', href: '/demo' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Cookie Policy', href: '/legal/cookies' },
    ],
  },
] as const;

export const features = {
  demoRequest: true,
  contactForm: true,
  showCmsAccess: false,
} as const;
