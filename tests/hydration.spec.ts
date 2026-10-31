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
    // The start button is enabled only after the page's mount effect has run.
    await expect(page.locator(".hero .primary")).toBeEnabled();
    await expect(page.locator(".hero-intro")).toHaveCSS("opacity", "1");
    if (reducedMotion === "reduce") {
      await expect(page.locator(".hero-intro")).toHaveCSS("animation-name", "none");
    }
    expect(errors).toEqual([]);
  });
}
