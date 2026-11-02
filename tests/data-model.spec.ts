import {matchAnatomy} from "./anatomy-helpers";
import { test, expect, Page } from "@playwright/test";
import { missions } from "../src/lib/curriculum";
import { ui } from "../src/lib/i18n";

async function edit(page: Page, source: string) {
  const input = page.getByRole("textbox").first();
  await input.focus();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(source);
}

for (const lang of ["en", "ar"] as const) {
  test(`${lang}: returning learner completes the data table model and retains results`, async ({ page }) => {
    test.setTimeout(240000);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(({ lang }) => {
      if (localStorage.getItem("fundamentals-seeded")) return;
      localStorage.setItem("fundamentals-seeded", "yes");
      localStorage.setItem("abap2-language", lang);
      localStorage.setItem("abap2-appearance", "dark");
      localStorage.setItem("abap2-master-progress", JSON.stringify({ labs: ["orientation", "addition", "structures", "conditions", "do", "while", "tables", "loop-at", "loop-control", "employees"], missions: ["addition", "structures", "conditions", "do", "while", "tables", "loop-at", "loop-control", "employees"], current: "employees", results: { addition: { attempts: 2, passed: true } } }));
    }, { lang });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator(".xp-row")).toContainText("1995");
    const t = ui[lang];
    for (const mission of missions.slice(9, 10)) {
      await page.locator(".node-card").filter({ has: page.getByRole("heading", { name: mission.title[lang], exact: true }) }).click();
      if (lang === "ar") await page.screenshot({ path: test.info().outputPath("arabic-data-lab.png"), fullPage: true });
      await matchAnatomy(page,mission.id,lang);
      await page.getByRole("button", { name: t.syntaxDone, exact: true }).click();
      const next = page.locator(".stage-footer").getByRole("button", { name: t.next, exact: true });
      await next.click();
      await page.getByRole("button", { name: t.run, exact: true }).click();
      const controls = page.locator(".execution-controls");
      await controls.getByRole("button", { name: t.next, exact: true }).click();
      await expect(page.locator(".execution-pointer")).toHaveCount(1);
      await page.locator(".timeline li>button").last().click();
      await controls.getByRole("button", { name: t.previous, exact: true }).click();
      await expect(page.locator(".active-statement")).toBeVisible();
      if (lang === "ar") await page.screenshot({ path: test.info().outputPath("arabic-data-trace.png"), fullPage: true });
      await next.click();
      await edit(page, mission.example);
      await page.getByRole("button", { name: t.run, exact: true }).click();
      await page.locator(".timeline li>button").last().click();
      await expect(page.locator(".editor-shell")).toHaveAttribute("dir", "ltr");
      await next.click();
      const challenges = mission.challenges ?? [mission];
      for (let index = 0; index < challenges.length; index++) {
        const proceed = page.locator(".stage-footer").getByRole("button", { name: index < challenges.length - 1 ? t.nextChallenge : t.next, exact: true });
        await expect(proceed).toBeDisabled();
        await edit(page, "WRITE 'Keyboard'. WRITE 'Keyboard'.");
        await page.getByRole("button", { name: t.check, exact: true }).click();
        await expect(page.locator(".feedback.warning")).toBeVisible();
        await expect(proceed).toBeDisabled();
        await edit(page, challenges[index].solution);
        await page.getByRole("button", { name: t.check, exact: true }).click();
        await expect(page.locator(".feedback.success")).toBeVisible();
        await proceed.click();
      }
      await expect(page.getByRole("button", { name: t.complete, exact: true })).toBeDisabled();
      await page.locator(".completion-card .answer-options button").nth(mission.answer).click();
      await page.getByRole("button", { name: t.complete, exact: true }).click();
    }
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));
    expect(before.missions).toEqual(missions.slice(0, 10).map(m => m.id));
    expect(before.results.addition).toEqual({ attempts: 2, passed: true });
    await expect(page.locator(".xp-row")).toContainText("2215");
    const xp = await page.locator(".xp-row").textContent();
    await page.reload();
    await expect(page.locator(".xp-row")).toHaveText(xp!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    expect(errors).toEqual([]);
  });
}

