import {matchAnatomy} from "./anatomy-helpers";
import { test, expect, Page } from "@playwright/test";
import { missions } from "../src/lib/curriculum";
import { ui } from "../src/lib/i18n";

async function edit(page: Page, code: string) {
  const editor = page.getByRole("textbox").first();
  await expect(editor).toBeVisible();
  await editor.focus();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(code);
}
for (const lang of ["en", "ar"] as const) {
  for (const theme of ["light", "dark"] as const) {
  test(`${lang} ${theme}: existing foundation migrates into all three Conditions challenges`, async ({ page }, info) => {
    const t = ui[lang], mission = missions.find(m => m.id === "conditions")!;
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.addInitScript(({ lang, theme }) => {
      if (!localStorage.getItem("phase2-test-seeded")) {
        localStorage.setItem("abap2-language", lang);
        localStorage.setItem("abap2-appearance", theme);
        localStorage.setItem("abap2-master-progress", JSON.stringify({ labs: ["orientation", "addition", "structures"], missions: ["addition", "structures"], current: "structures", results: { addition: { attempts: 2, passed: true } } }));
        localStorage.setItem("phase2-test-seeded", "yes");
      }
    }, { lang, theme });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.getByTestId("foundation-progress")).toContainText("3/3");
    await expect(page.locator(".xp-row")).toContainText("275");
    await page.locator(".node-card").filter({ has: page.getByRole("heading", { name: mission.title[lang], exact: true }) }).click();
    await expect(page.locator(".mission-title")).toContainText("03");
    await expect(page.getByRole("button", { name: t.syntaxDone, exact: true })).toBeDisabled();
    await matchAnatomy(page,mission.id,lang);
    await page.getByRole("button", { name: t.syntaxDone, exact: true }).click();
    const next = page.locator(".stage-footer").getByRole("button", { name: t.next, exact: true });
    await next.click();
    await page.getByRole("button", { name: t.run, exact: true }).click();
    const controls = page.locator(".execution-controls");
    await controls.getByRole("button", { name: t.next, exact: true }).click();
    await expect(page.locator(".condition-card")).toContainText("1200 >= 1000 → TRUE");
    await expect(page.locator(".execution-pointer")).toHaveCount(1);
    await controls.getByRole("button", { name: t.next, exact: true }).click();
    await expect(page.getByTestId("output")).toHaveText("Needs approval");
    await controls.getByRole("button", { name: t.previous, exact: true }).click();
    await expect(page.getByTestId("output")).toHaveText(t.noOutput);
    await next.click();
    await edit(page, mission.example.replace("1200", "999"));
    await page.getByRole("button", { name: t.run, exact: true }).click();
    await page.locator(".timeline li>button").last().click();
    await expect(page.getByTestId("output")).toHaveText("Automatically approved");
    await next.click();
    for (let i = 0; i < mission.challenges!.length; i++) {
      const challenge = mission.challenges![i];
      const proceed = page.locator(".stage-footer").getByRole("button", { name: i < 2 ? t.nextChallenge : t.next, exact: true });
      await expect(proceed).toBeDisabled();
      await edit(page, challenge.starter + `WRITE '${challenge.expected}'.`);
      await page.getByRole("button", { name: t.check, exact: true }).click();
      await expect(page.locator(".feedback.warning")).toBeVisible();
      await expect(proceed).toBeDisabled();
      await edit(page, challenge.solution);
      await page.getByRole("button", { name: t.check, exact: true }).click();
      await expect(page.locator(".feedback.success")).toBeVisible();
      if (i === 2) {
        await page.locator(".timeline li>button").filter({ hasText: "ELSEIF" }).click();
        await expect(page.locator(".active-statement")).toContainText("ELSEIF");
        await expect(page.locator(".condition-card")).toContainText("75 >= 50 → TRUE");
        await expect(page.locator(".editor-shell")).toHaveAttribute("dir", "ltr");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
        await page.screenshot({ path: `test-results/${info.project.name}-${lang}-${theme}-conditions.png`, fullPage: true });
      }
      await proceed.click();
    }
    await expect(page.getByRole("button", { name: t.complete, exact: true })).toBeDisabled();
    await page.locator(".completion-card .answer-options button").first().click();
    await page.getByRole("button", { name: t.complete, exact: true }).click();
    await expect(page.locator(".xp-row")).toContainText("475");
    await page.reload();
    await expect(page.locator(".xp-row")).toContainText("475");
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));
    expect(saved.missions).toEqual(["addition", "structures", "conditions"]);
    expect(saved.results.addition).toEqual({ attempts: 2, passed: true });
    expect(saved.results.conditions.attempts).toBe(6);
    expect(errors).toEqual([]);
  });
  }
}

test("diagnostics give relevant bilingual advice and permit correction", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: ui.en.playground, exact: true }).click();
  await edit(page, "WRITE missing.");
  await page.getByRole("button", { name: ui.en.run, exact: true }).click();
  await expect(page.locator(".feedback.error")).toContainText("Declare the variable");
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  await page.getByText(ui.ar.explainWhy, { exact: true }).click();
  await expect(page.locator(".feedback.error")).toContainText("قبل قراءة قيمته");
  await edit(page, "DATA missing TYPE i VALUE 7.\nWRITE missing.");
  await expect(page.locator(".feedback.error")).toHaveCount(0);
  await page.getByRole("button", { name: ui.ar.run, exact: true }).click();
  await page.locator(".timeline li>button").last().click();
  await expect(page.getByTestId("output")).toHaveText("7");
});
