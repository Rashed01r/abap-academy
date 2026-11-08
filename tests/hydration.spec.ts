import { test, expect } from "@playwright/test";
import { roadmapCopy } from "../src/lib/tree-copy";
import { roadmapNode } from "./academy-helpers";

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
    await expect(page.getByRole("combobox", { name: roadmapCopy("en").searchLabel })).toBeVisible();
    await expect(roadmapNode(page, "learn")).toBeVisible();
    await expect(roadmapNode(page, "tcodes")).toBeVisible();

    if (reducedMotion === "reduce") {
      // Effects start off and the root glow does not animate.
      await expect(page.locator(".k-root").first()).toHaveCSS("animation-name", "none");
      await expect(page.locator(".roadmap-home")).toHaveClass(/noaur/);
      await expect(page.locator(".roadmap-home")).toHaveClass(/nogrid/);
      await expect(page.locator(".roadmap-home")).toHaveClass(/noflow/);
    }
    expect(errors).toEqual([]);
  });
}
