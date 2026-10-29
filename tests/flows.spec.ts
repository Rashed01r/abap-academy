import { test, expect, Page } from "@playwright/test";
import { missions, orientation, structureExample } from "../src/lib/curriculum";
import { ui } from "../src/lib/i18n";
import { Locale } from "../src/lib/engine";
async function edit(page: Page, code: string) {
  const editor = page.getByRole("textbox").first();
  await expect(editor).toBeVisible();
  await editor.focus();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(code);
}
async function lab(
  page: Page,
  lang: Locale,
  count: number,
  orientationLab = false,
) {
  const region = page.locator(".syntax-lab");
  const finish = region.getByRole("button", {
    name: orientationLab ? ui[lang].finishOrientation : ui[lang].syntaxDone,
    exact: true,
  });
  await expect(finish).toBeDisabled();
  for (let i = 0; i < count; i++) {
    await region.locator(".token-list button").nth(i).click();
    await region.locator(".quiz .answer-options button").first().click();
  }
  await expect(finish).toBeEnabled();
  await finish.click();
}
for (const lang of ["en", "ar"] as const)
  for (const theme of ["light", "dark"] as const) {
    test(`${lang} ${theme}: complete orientation, missions and persist rewards`, async ({
      page,
    }, info) => {
      const t = ui[lang],
        errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("/");
      if (lang === "ar")
        await page
          .getByRole("button", { name: "العربية", exact: true })
          .click();
      await page.getByLabel(t.appearance, { exact: true }).selectOption(theme);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("html")).toHaveAttribute(
        "dir",
        lang === "ar" ? "rtl" : "ltr",
      );
      await page.locator(".node-card").nth(2).click();
      await expect(page.getByRole("dialog")).toContainText(t.locked);
      await page
        .getByRole("dialog")
        .getByRole("button", { name: t.back, exact: true })
        .last()
        .click();
      await page.getByRole("button", { name: t.start, exact: true }).click();
      await lab(page, lang, orientation.length, true);
      await expect(page.locator(".progress-ring")).toContainText("33");
      for (let i = 0; i < 2; i++) {
        const m = missions[i];
        await page
          .locator(".node-card")
          .filter({
            has: page.getByRole("heading", {
              name: m.title[lang],
              exact: true,
            }),
          })
          .click();
        await lab(page, lang, m.tokens.length);
        await page
          .locator(".stage-footer")
          .getByRole("button", { name: t.next, exact: true })
          .click();
        await page.getByRole("button", { name: t.run, exact: true }).click();
        await expect(page.locator(".execution-pointer")).toHaveCount(1);
        await expect(page.locator(".active-statement")).toHaveAttribute(
          "data-start-line",
          "1",
        );
        if (i === 1)
          await expect(page.locator(".active-statement")).toHaveAttribute(
            "data-end-line",
            "4",
          );
        await page
          .locator(".execution-controls")
          .getByRole("button", { name: t.next, exact: true })
          .click();
        await expect(page.getByTestId("memory")).not.toContainText(t.noMemory);
        await page
          .locator(".stage-footer")
          .getByRole("button", { name: t.next, exact: true })
          .click();
        await edit(page, m.example);
        await page.getByRole("button", { name: t.reset, exact: true }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page.getByRole("button", { name: t.cancel, exact: true }).click();
        await page
          .locator(".stage-footer")
          .getByRole("button", { name: t.next, exact: true })
          .click();
        const continueButton = page
          .locator(".stage-footer")
          .getByRole("button", { name: t.next, exact: true });
        await expect(continueButton).toBeDisabled();
        await edit(
          page,
          i === 0
            ? "WRITE 30."
            : m.solution.replace("quantity = 12", "quantity = 1"),
        );
        await page.getByRole("button", { name: t.check, exact: true }).click();
        await expect(page.locator(".feedback.warning")).toBeVisible();
        await expect(continueButton).toBeDisabled();
        await edit(page, m.solution);
        await page.getByRole("button", { name: t.check, exact: true }).click();
        await expect(page.locator(".feedback.success")).toBeVisible();
        await continueButton.click();
        await page
          .locator(".completion-card .answer-options button")
          .first()
          .click();
        await page
          .getByRole("button", { name: t.complete, exact: true })
          .click();
      }
      await expect(page.locator(".progress-ring")).toContainText("100");
      await expect(page.locator(".xp-row")).toContainText("275");
      await page.reload();
      await expect(page.locator(".progress-ring")).toContainText("100");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      await page.screenshot({
        path: `test-results/${info.project.name}-${lang}-${theme}-roadmap.png`,
        fullPage: true,
      });
      expect(errors).toEqual([]);
    });
  }
test("synchronized trace: next, previous, restart, play, edits, locale, and theme", async ({
  page,
}, info) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: ui.en.playground, exact: true })
    .click();
  await page.getByRole("button", { name: ui.en.run, exact: true }).click();
  await expect(page.locator(".execution-pointer")).toHaveCount(1);
  const controls = page.locator(".execution-controls");
  for (let i = 0; i < 3; i++)
    await controls.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByTestId("memory")).toContainText("13");
  await controls.getByRole("button", { name: "Previous", exact: true }).click();
  await expect(
    page.getByTestId("memory").locator(".memory-card").last(),
  ).toContainText("0");
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  await expect(page.locator(".active-statement")).toHaveAttribute(
    "data-start-line",
    "3",
  );
  await expect(page.locator(".editor-shell")).toHaveAttribute("dir", "ltr");
  await page.getByLabel(ui.ar.appearance, { exact: true }).selectOption("dark");
  await expect(page.locator(".editor-shell")).toHaveAttribute(
    "data-editor-theme",
    "dark",
  );
  await expect(page.locator(".active-statement")).toHaveAttribute(
    "data-start-line",
    "3",
  );
  await controls
    .getByRole("button", { name: ui.ar.restart, exact: true })
    .click();
  await expect(page.locator(".active-statement")).toHaveAttribute(
    "data-start-line",
    "1",
  );
  await controls.getByRole("button", { name: ui.ar.play, exact: true }).click();
  await expect(page.locator(".active-statement")).toHaveAttribute(
    "data-start-line",
    "2",
    { timeout: 4000 },
  );
  await controls
    .getByRole("button", { name: ui.ar.pause, exact: true })
    .click();
  await edit(page, "DATA lv_age TYPE i\nlv_age = 25.");
  await expect(page.locator(".execution-pointer")).toHaveCount(0);
  await expect(page.locator(".timeline")).toHaveCount(0);
  await page.getByRole("button", { name: ui.ar.run, exact: true }).click();
  await expect(page.locator(".feedback.error")).toContainText("النقطة");
  await expect(page.locator(".error-range")).not.toHaveCount(0);
  await edit(page, structureExample);
  await page.getByRole("button", { name: ui.ar.run, exact: true }).click();
  await expect(page.locator(".active-statement")).toHaveAttribute(
    "data-end-line",
    "4",
  );
  await controls.getByRole("button", { name: ui.ar.next, exact: true }).click();
  await page
    .locator(".view-line")
    .filter({ hasText: "ls_employee-name = 'Ahmed'." })
    .click({ position: { x: 35, y: 8 } });
  await expect(page.locator(".selected-field")).toContainText(
    "ls_employee-name",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: `test-results/${info.project.name}-workspace.png`,
    fullPage: true,
  });
});
test("conditional trace skips unchosen WRITE and displays condition", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: ui.en.playground, exact: true })
    .click();
  await page
    .getByRole("button", { name: ui.en.conditionDemo, exact: true })
    .click();
  await page.getByRole("button", { name: ui.en.run, exact: true }).click();
  const next = page
    .locator(".execution-controls")
    .getByRole("button", { name: "Next", exact: true });
  await next.click();
  await expect(page.locator(".condition-card")).toContainText(
    "1200 >= 1000 → TRUE",
  );
  await expect(page.locator(".skipped-code")).not.toHaveCount(0);
  await next.click();
  await expect(page.getByTestId("output")).toHaveText("Approved");
  await next.click();
  await expect(page.locator(".active-statement")).toContainText("ENDIF.");
  await expect(page.locator(".timeline li")).toHaveCount(4);
  await expect(page.getByTestId("output")).toHaveText("Approved");
  await expect(
    page.locator(".timeline li>button").filter({ hasText: "WRITE 'Review'" }),
  ).toHaveCount(0);
});
test("system appearance follows OS and future roadmap items have previews", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator(".future-paths details").last().locator("summary").click();
  await page
    .getByRole("button", { name: "API integration", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(ui.en.futureIntro);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
