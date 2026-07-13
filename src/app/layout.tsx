import type { Metadata, Viewport } from 'next';
import { Inter, Syne, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from '@/components/layout/Providers';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ConditionalShell } from '@/components/layout/ConditionalShell';
import { SkipLink } from '@/components/ui/SkipLink';
import { siteConfig } from '@/config/site';

/* ── Font Declarations ──────────────────────────────────────── */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

/* ── Site Metadata ──────────────────────────────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: '/default_img_2.jpg',
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — Next-Gen AI-Driven K-12 School Management Platform`,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/default_img_2.jpg'],
    creator: siteConfig.twitterHandle,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },

  manifest: '/site.webmanifest',

  alternates: {
    canonical: siteConfig.url,
  },

  verification: {
    // google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },

  category: 'technology',
};

export const viewport: Viewport = {
  // The marketing surface is a single light theme (see src/styles/globals.css).
  // The browser chrome (address bar, native controls, scrollbars) must match it,
  // otherwise a dark user-agent palette bleeds through the light page.
  themeColor: '#f8fafc', // --color-slate-50, the page's --bg-base
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
};

/* ── Root Layout ────────────────────────────────────────────── */
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Structured data: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: siteConfig.name,
              description: siteConfig.description,
              url: siteConfig.url,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                availability: 'https://schema.org/InStock',
              },
            }),
          }}
        />
      </head>

      <body>
        {/* Accessibility: Skip to main content */}
        <SkipLink />

        {/* Global providers: motion config, theme, etc. */}
        <Providers>
          <ConditionalShell
            navigation={<Navigation />}
            footer={<Footer />}
          >
            {children}
          </ConditionalShell>
        </Providers>

        {/* Analytics: non-blocking, deferred
            Wire up to your preferred provider (Plausible, PostHog, GA4)
            via environment variables. Never log PII here. */}
      </body>
    </html>
  );
}