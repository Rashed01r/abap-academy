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
  test(`${lang}: returning learner completes Missions 04–09 and retains results`, async ({ page }) => {
    test.setTimeout(240000);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(({ lang }) => {
      if (localStorage.getItem("fundamentals-seeded")) return;
      localStorage.setItem("fundamentals-seeded", "yes");
      localStorage.setItem("abap2-language", lang);
      localStorage.setItem("abap2-appearance", "dark");
      localStorage.setItem("abap2-master-progress", JSON.stringify({ labs: ["orientation", "addition", "structures", "conditions"], missions: ["addition", "structures", "conditions"], current: "conditions", results: { addition: { attempts: 2, passed: true } } }));
    }, { lang });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator(".xp-row")).toContainText("475");
    const t = ui[lang];
    for (const mission of missions.slice(3, 9)) {
      await page.locator(".node-card").filter({ has: page.getByRole("heading", { name: mission.title[lang], exact: true }) }).click();
      const lab = page.locator(".syntax-lab");
      for (let index = 0; index < mission.tokens.length; index++) {
        await lab.locator(".token-list button").nth(index).click();
        await lab.locator(".quiz .answer-options button").nth(mission.tokens[index].answer).click();
      }
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
    expect(before.missions).toEqual(missions.slice(0, 9).map(m => m.id));
    expect(before.results.addition).toEqual({ attempts: 2, passed: true });
    const xp = await page.locator(".xp-row").textContent();
    await page.reload();
    await expect(page.locator(".xp-row")).toHaveText(xp!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    expect(errors).toEqual([]);
  });
}

test("table row pointer, backward stepping, restart and stale trace invalidation", async ({ page }) => {
  const t = ui.en;
  await page.goto("/");
  await page.getByRole("button", { name: t.playground, exact: true }).click();
  const source = "DATA values TYPE STANDARD TABLE OF i WITH EMPTY KEY. DATA value TYPE i VALUE 4. APPEND value TO values. value = 9. APPEND value TO values. LOOP AT values INTO value. WRITE value. ENDLOOP.";
  await edit(page, source);
  await page.getByRole("button", { name: t.run, exact: true }).click();
  const writes = page.locator(".timeline li>button").filter({ hasText: "WRITE value" });
  await writes.nth(0).click();
  await expect(page.getByTestId("table-memory").locator("tr.active-row")).toContainText("4");
  await expect(page.getByTestId("output")).toHaveText("4");
  await writes.nth(1).click();
  await expect(page.getByTestId("table-memory").locator("tr.active-row")).toContainText("9");
  await expect(page.getByTestId("output")).toHaveText("4\n9");
  const controls = page.locator(".execution-controls");
  await controls.getByRole("button", { name: t.previous, exact: true }).click();
  await expect(page.getByTestId("output")).toHaveText("4");
  await controls.getByRole("button", { name: t.restart, exact: true }).click();
  await expect(page.getByTestId("output")).toHaveText(t.noOutput);
  await edit(page, "WRITE 7.");
  await expect(page.locator(".timeline li")).toHaveCount(0);
  await expect(page.locator(".execution-pointer")).toHaveCount(0);
});

for (const theme of ["light", "dark"] as const) {
  test(`Arabic ${theme}: table and loop visual styling is loaded`, async ({ page }, info) => {
    await page.addInitScript(({ theme }) => {
      localStorage.setItem("abap2-language", "ar");
      localStorage.setItem("abap2-appearance", theme);
    }, { theme });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await page.getByRole("button", { name: ui.ar.playground, exact: true }).click();
    await edit(page, "DATA lt_numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY.\nAPPEND 10 TO lt_numbers.\nAPPEND 20 TO lt_numbers.\nDATA lv_number TYPE i.\nLOOP AT lt_numbers INTO lv_number.\n  WRITE lv_number.\nENDLOOP.");
    await page.getByRole("button", { name: ui.ar.run, exact: true }).click();
    await page.locator(".timeline li>button").filter({ hasText: "WRITE lv_number" }).nth(1).click();
    await expect(page.locator(".execution-pointer")).toHaveCount(1);
    const table = page.getByTestId("table-memory");
    await expect(table.locator("tr.active-row")).toContainText("20");
    const styles = await table.locator("tr.active-row").evaluate(row => ({
      padding: parseFloat(getComputedStyle(row.querySelector("td")!).paddingTop),
      outline: getComputedStyle(row).outlineWidth,
    }));
    expect(styles.padding).toBeGreaterThanOrEqual(9);
    expect(styles.outline).toBe("2px");
    await expect(page.getByTestId("loop-counter")).toContainText("2");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await table.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/${info.project.name}-ar-table-${theme}.png`, fullPage: true });
    await page.getByTestId("loop-counter").screenshot({ path: `test-results/${info.project.name}-ar-loop-counter-${theme}.png` });
  });
}
