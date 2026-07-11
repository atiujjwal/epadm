import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Enable React strict mode in development
  reactStrictMode: true,

  // Compiler options
  compiler: {
    // Remove console.* in production builds
    removeConsole: isDev ? false : { exclude: ['error', 'warn'] },
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features
  experimental: {
    // Optimize package imports for tree-shaking
    optimizePackageImports: ['framer-motion'],
  },

  // Security & caching headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // XSS protection (legacy browsers)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Strict HTTPS
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Content Security Policy
          // Tighten in production based on your actual script/font/image sources.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Tighten for production
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache Next.js static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Redirect old routes if any exist
      // { source: '/old-path', destination: '/new-path', permanent: true },
    ];
  },
};

// Trigger server reload: 5
export default nextConfig;
