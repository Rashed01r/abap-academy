import { test, expect } from "@playwright/test";

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`home hydrates with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    // Search is portaled into the header only after hydration.
    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect(page.locator(".tree-paths>button")).toHaveCount(9);

    if (reducedMotion === "reduce") {
      await expect(page.locator(".tree-node").first()).toHaveCSS("animation-name", "none");
    }
    expect(errors).toEqual([]);
  });
}
