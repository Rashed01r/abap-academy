import { enabledLocales } from "../src/lib/language-policy";
import { localizedText } from "../src/lib/language-policy";
import { test, expect } from "@playwright/test";
import { tableMutationsMission } from "../src/lib/table-mutations-mission";
import { sortingFilteringMission } from "../src/lib/sorting-filtering-mission";
import { ui } from "../src/lib/i18n";
import { openLesson, tab, edit, answerQuiz, completion } from "./academy-helpers";

for (const m of [tableMutationsMission, sortingFilteringMission]) for (const lang of enabledLocales) {
  test(`${lang}: ${m.id} real before/after rows, behavioral grading and saved progress`, async ({page}) => {
    const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
    const t = ui[lang], sorting = m.id === "data-sorting-filtering";
    await page.addInitScript(lang => {
      localStorage.setItem("abap2-language", lang); localStorage.setItem("abap2-appearance", lang === "ar" ? "dark" : "light");
      if (!localStorage.getItem("abap2-master-progress")) localStorage.setItem("abap2-master-progress", JSON.stringify({version:2, missions:["structures"], labs:["structures"], current:"structures", results:{structures:{attempts:2,passed:true}}}));
    }, lang);
    await page.goto(`/?mission=${m.id}`); await openLesson(page,m.id,lang);
    await page.locator(`.anatomy-group[data-group="${sorting ? "salary-sort" : "insert"}"]`).click();
    const anatomy = page.locator(".anatomy-explanation");
    await expect(anatomy.getByTestId("table-change-before")).toContainText("Ahmed");
    await expect(anatomy.getByTestId("table-change-after")).toContainText("Sara");
    await tab(page,lang,"visualize"); await page.getByRole("button",{name:t.run,exact:true}).click();
    const panel = page.getByRole("tabpanel"), timeline = panel.locator(".timeline");
    if (sorting) {
      await timeline.getByRole("button").filter({hasText:"SORT lt_employees BY salary DESCENDING."}).click();
      await expect(panel.getByTestId("table-change-before").locator("tbody tr").first()).toContainText("Ahmed");
      await expect(panel.getByTestId("table-change-after").locator("tbody tr").first()).toContainText("Sara");
      await expect(panel.getByTestId("table-change-after").locator("tbody tr")).toHaveCount(3);
    } else {
      await timeline.getByRole("button").filter({hasText:"INSERT ls_employee INTO lt_employees INDEX 2."}).click();
      await expect(panel.getByTestId("table-change-before").locator("tbody tr")).toHaveCount(2);
      await expect(panel.getByTestId("table-change-after").locator(".change-insert")).toContainText("Sara");
      await timeline.getByRole("button").filter({hasText:"MODIFY lt_employees FROM ls_employee INDEX 2."}).click();
      await expect(panel.getByTestId("table-change-before").locator(".change-modify")).toContainText('"Sara"');
      await expect(panel.getByTestId("table-change-after").locator(".change-modify")).toContainText('"Sarah"');
      await timeline.getByRole("button").filter({hasText:"DELETE lt_employees INDEX 1."}).click();
      await expect(panel.getByTestId("table-change-before").locator(".change-delete")).toContainText("Ahmed");
      await expect(panel.getByTestId("table-change-after")).not.toContainText("Ahmed");
    }
    await timeline.getByRole("button").last().click();
    await expect(panel.getByTestId("output")).toHaveText(sorting ? "Sara\nOmar" : "Sarah\nOmar");
    await tab(page,lang,"challenge"); await expect(completion(page,lang)).toBeDisabled();
    const challenge = m.challenges![0];
    await edit(page, sorting ? challenge.solution.replace("salary DESCENDING", "salary ASCENDING") : challenge.solution.replace("INDEX 2.", "INDEX 99."));
    await page.getByRole("button",{name:t.check,exact:true}).click();
    await expect(panel.locator(".feedback.warning")).toBeVisible();
    await expect(completion(page,lang)).toBeDisabled();
    await edit(page,challenge.solution); await page.getByRole("button",{name:t.check,exact:true}).click();
    await expect(panel.locator(".feedback.success")).toBeVisible();
    await answerQuiz(page,m.answer); await completion(page,lang).click();
    await expect(page.locator(".header-xp")).toContainText(String(150 + m.xp));
    await page.getByRole("button",{name:t.completed,exact:true}).click();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));
    expect(saved.missions.filter((id:string) => id === m.id)).toHaveLength(1);
    expect(saved.passedChallenges).toContain(challenge.id);
    expect(saved.results.structures).toEqual({attempts:2,passed:true});
    await page.reload(); await expect(page.locator(".lesson-summary h1")).toHaveText(localizedText(m.title, lang));
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
