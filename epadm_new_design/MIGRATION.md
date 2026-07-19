# Vite to Next.js migration assessment

## Outcome

The application now runs on Next.js App Router (Next 16) with the same public URLs, components, Tailwind design tokens, mock data, navigation, dialogs, charts, and browser interactions. The former Vite/TanStack Start server entry, generated route tree, and Vite configuration have been removed.

## Source assessment

| Area | Finding | Migration decision |
| --- | --- | --- |
| Runtime | React 19, TypeScript 5.8, Vite 8, TanStack Start | Replaced Vite/Start runtime with Next 16 App Router. |
| Routing | 21 flat TanStack file routes; no dynamic/protected routes or redirects | `app/[[...slug]]/page.tsx` preserves every existing URL. |
| State | Local React state and React Query dependency; no Redux, Zustand, persistence, or API client | Preserved unchanged. No provider was needed by current screens. |
| Styling | Tailwind CSS 4, `tw-animate-css`, global CSS tokens | Preserved `styles.css`; configured Tailwind's Next/PostCSS integration. |
| Assets | One public favicon; no image/font files in source | Preserved under `public/`; external Google font URLs remain in the existing CSS/font stack. |
| Auth/API | No implementation found; UI uses `src/data/mock.ts` | No auth or API contract exists to change. |
| Browser APIs | Keyboard, print, cookies, `matchMedia`, location | Existing UI renders as client components; guarded error reporting remains safe on the server. |

## Compatibility matrix

| Former capability | Next equivalent | Status |
| --- | --- | --- |
| `createFileRoute` route declarations | Lightweight `tanstack-router-compat` route metadata | Compatible |
| TanStack `Link` | `next/link` adapter accepting the existing `to` prop | Compatible |
| `useNavigate` / router state | `next/navigation` adapter | Compatible |
| `/`, `/dashboard`, and all feature paths | Optional catch-all App Router page | Compatible |
| Tailwind Vite plugin | `@tailwindcss/postcss` | Compatible |
| Vite SSR error wrapper | Next built-in route/error handling | No application-specific server wrapper was required |

## Phased execution record

1. Audited routes, dependencies, styling, state, and browser-only usage.
2. Added the App Router root layout and preserved route dispatcher.
3. Added a narrow router adapter so feature modules did not need UI or business-logic rewrites.
4. Moved Tailwind processing to PostCSS and removed obsolete Vite/TanStack Start entries.
5. Installed dependencies and completed a production Next build.

## Validation and parity checklist

- [x] Production build succeeds (`npm run build`).
- [x] TypeScript succeeds during the production build.
- [ ] Lint is not clean: the inherited source has 936 Prettier formatting errors and 11 warnings. This pre-dates the migration and was intentionally not bulk-reformatted to preserve the requested zero-regression scope.
- [x] Existing public feature URLs resolve through the App Router dispatcher.
- [x] Existing route components, mock-data flows, charts, dialogs, forms, and styling are retained.
- [x] Browser-only behavior stays in client-rendered route UI.
- [x] Vite/TanStack Start runtime files are removed.

## Residual risks

The source is a front-end prototype with no automated tests, API service, or real authentication implementation. Browser-level visual regression tests and authenticated API testing cannot be performed until those integrations and baseline tests exist. The inherited ESLint configuration reports 936 Prettier formatting errors and 11 warnings across the preserved files; no formatting sweep was applied because this was explicitly a non-refactoring migration. The catch-all dispatcher intentionally keeps the route modules intact; if future dynamic routes are added, promote those paths to dedicated `app/` directories for static metadata and server rendering.

## Changed files

Added: `src/app/layout.tsx`, `src/app/[[...slug]]/page.tsx`, `src/lib/tanstack-router-compat.tsx`, `postcss.config.mjs`, `next.config.ts`, and this report.

Modified: `package.json`, `tsconfig.json`, `src/styles.css`, `.gitignore` (Next generated an ignore entry), and dependency lockfiles.

Removed: `vite.config.ts`, `src/router.tsx`, `src/start.ts`, `src/server.ts`, `src/routeTree.gen.ts`, and `src/routes/__root.tsx`.
