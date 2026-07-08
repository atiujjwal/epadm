All errors have been fixed:

1. Fixed the import in `src/proxy.ts` to use the correct path for `PLATFORM_COOKIE` and `verifyPlatformToken` (changed from `"./platform/auth/token"` to `"./lib/platform/auth/token"`).

2. Fixed the JSX syntax error in `src/app/page.tsx` in the `SchoolTopologyVisual` component:
   - Changed `y={`${center.y}%`} + 13%` to `y={`${center.y + 13}%`}`.

3. Removed the Next.js lock file and restarted the development server, which now starts successfully on port 3001 (port 3000 was still in use, but the server is running without compilation errors).

The public-facing marketing site is now set up as requested:
- Root landing page (`/`) includes hero, features (three pillars), and pricing sections.
- Navigation includes links to Features (`/#features`), Pricing (`/#pricing`), Compliance (`/security`).
- Header CTAs: "School Login" → `/login`, "Platform Admin" → `/admin/login`, "Get Started" → `/register`.
- Footer includes links to all public pages.
- A placeholder register page (`/register`) has been created.
- sitemap.ts updated to include `/register`.
- All public pages (about, contact, demo, legal, platform, security) use the root layout and inherit the header and footer.

No changes were made to `src/middleware.ts` or the multi-tenant logic in `src/proxy.ts` beyond adding `/register` to `PUBLIC_PATHS`.

The site is now ready for use.