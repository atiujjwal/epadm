import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright smoke-test config.
 *
 * Boots the production build and hits the public marketing entrypoint to prove
 * the app renders end-to-end. Kept intentionally small — deeper flows (auth,
 * tenant provisioning) require seeded data and belong in a later slice.
 *
 * Set PLAYWRIGHT_BASE_URL to point at an already-running server instead of
 * having Playwright start one (CI starts the server as a separate step).
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // When no external base URL is provided, start the app ourselves.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: baseURL,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      },
});
