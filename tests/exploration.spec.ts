import { test, expect, Page } from "@playwright/test";
import { missions, paths } from "../src/lib/curriculum";
import { ui } from "../src/lib/i18n";

async function edit(page: Page, source: string) {
  await page.getByRole("textbox").first().focus();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(source);
}
for (const lang of ["en", "ar"] as const) for (const theme of ["light", "dark"] as const) {
  test(`${lang} ${theme}: explore freely, skip labs, earn assessed XP once`, async ({ page }) => {
    const t = ui[lang];
    const mission = missions.find(m => m.id === "while")!;
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.addInitScript(({lang,theme}) => {
      localStorage.setItem("abap2-language", lang);
      localStorage.setItem("abap2-appearance", theme);
    }, {lang,theme});
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang",lang);
    await expect(page.locator(".xp-row")).toContainText("0");
    await expect(page.locator(".roadmap-node.locked")).toHaveCount(0);
    for (const path of paths.filter(p => missions.some(m => m.pathId === p.id))) {
      await expect(page.locator(`[data-path="${path.id}"] .node-card`).first()).toBeEnabled();
    }
    await expect(page.locator('[data-mission="while"]')).toContainText(t.recommendedFirst);
    await page.locator('[data-mission="while"] .node-card').click();
    await expect(page.getByRole("heading", {level:1})).toHaveText(mission.title[lang]);
    await page.getByRole("button", {name:t.startChallenge,exact:true}).click();
    await expect(page.locator(".editor-shell")).toBeVisible();
    const state = () => page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));
    await expect.poll(async () => (await state()).viewed).toContain("while");
    expect((await state()).labs).toEqual([]);
    expect((await state()).missions).toEqual([]);
    await page.locator(".stages button").nth(5).click();
    await page.locator(".completion-card .answer-options button").nth(mission.answer).click();
    await expect(page.getByRole("button", {name:t.complete,exact:true})).toBeDisabled();
    await page.getByRole("button", {name:t.startChallenge,exact:true}).click();
    for (const challenge of [...mission.challenges!].reverse()) {
      await page.getByRole("group", {name:t.challenge,exact:true}).getByRole("button", {name:challenge.title[lang],exact:true}).click();
      await edit(page, challenge.solution);
      await page.getByRole("button", {name:t.check,exact:true}).click();
      await expect(page.locator(".feedback.success")).toBeVisible();
    }
    expect((await state()).missions).toEqual([]);
    await page.locator(".stages button").nth(5).click();
    await expect(page.getByRole("button", {name:t.complete,exact:true})).toBeEnabled();
    await page.getByRole("button", {name:t.complete,exact:true}).click();
    await expect(page.locator(".xp-row")).toContainText(String(mission.xp));
    expect((await state()).labs).toEqual([]);
    expect((await state()).missions).toEqual([mission.id]);
    await page.locator('[data-mission="while"] .node-card').click();
    await page.locator(".stages button").nth(5).click();
    await page.locator(".completion-card .answer-options button").nth(mission.answer).click();
    await page.getByRole("button", {name:t.complete,exact:true}).click();
    await expect(page.locator(".xp-row")).toContainText(String(mission.xp));
    await page.reload();
    await expect(page.locator(".xp-row")).toContainText(String(mission.xp));
    await page.getByRole("button", {name:t.completedLessons,exact:true}).click();
    await expect(page.locator(".node-card")).toHaveCount(1);
    await page.getByRole("button", {name:t.allTopics,exact:true}).click();
    await page.getByRole("button", {name:t.recentLessons,exact:true}).click();
    await expect(page.locator('[data-mission="while"] .node-card')).toBeVisible();
    await page.getByRole("button", {name:t.allTopics,exact:true}).click();
    await page.getByLabel(t.searchLessons, {exact:true}).fill(missions.find(m=>m.id === "data-table-model")!.title[lang]);
    await expect(page.locator(".node-card")).toHaveCount(1);
    await page.locator('[data-mission="data-table-model"] .node-card').click();
    await page.getByRole("button", {name:t.reviewExample,exact:true}).click();
    await page.getByRole("button", {name:t.run,exact:true}).click();
    await expect(page.locator(".timeline li")).not.toHaveCount(0);
    await page.getByRole("button", {name:t.back,exact:false}).click();
    await page.getByRole("button", {name:t.allTopics,exact:true}).click();
    const cloud = page.locator('[data-path="cloud"]');
    await expect(cloud).toContainText(t.comingSoon);
    await cloud.locator(".future-concepts button").first().click();
    await expect(page.getByRole("dialog")).toContainText(t.comingSoon);
    await expect(page.getByRole("dialog")).toContainText(t.recommendedFirst);
    await page.keyboard.press("Escape");
    await page.locator('[data-mission="addition"] .node-card').click();
    await expect(page.getByRole("heading", {level:1})).toHaveText(missions[0].title[lang]);
    await page.getByRole("link",{name:t.exploreTopics,exact:true}).click();
    await expect(page.locator("#academy-topics")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    expect(errors).toEqual([]);
  });
}
