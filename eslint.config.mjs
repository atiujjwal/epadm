import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/components/ui/calendar.tsx",
      "src/components/ui/chart.tsx",
      "src/components/ui/form-radix.tsx",
      "src/components/ui/pagination.tsx",
    ],
    rules: {
      // Upstream shadcn ports rely on @ts-nocheck for third-party type gaps.
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The client-provided reference application is intentionally kept intact
    // and is not part of the production Next application.
    "epadm_new_design/**",
    // Generated / non-source assets that confuse the TS parser
    "drizzle/**",
    "**/*.sql",
  ]),
]);

export default eslintConfig;
