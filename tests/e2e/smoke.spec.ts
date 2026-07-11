import { expect, test } from "@playwright/test";

/**
 * Minimal smoke test: the public marketing homepage renders without a server
 * error and produces a document with a non-empty <title>. This is deliberately
 * shallow — it guards against build/boot regressions, not feature behaviour.
 */
test("homepage renders", async ({ page }) => {
  const response = await page.goto("/");
  expect(response, "navigation should produce a response").not.toBeNull();
  expect(response!.status(), "homepage should not 5xx").toBeLessThan(400);

  await expect(page).toHaveTitle(/.+/);
  // The primary content region should be present.
  await expect(page.locator("body")).toBeVisible();
});
