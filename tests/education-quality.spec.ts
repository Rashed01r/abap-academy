import { isConceptLesson } from "../src/lib/application-labs";
import { enabledLocales } from "../src/lib/language-policy";
import { localizedText } from "../src/lib/language-policy";
import { test, expect } from "@playwright/test";
import { missions } from "../src/lib/curriculum";
import { educationContent } from "../src/lib/education-content";
import { educationScenarios } from "../src/lib/education-scenarios";
import { lessonFlows } from "../src/lib/lesson-flows";
import { beginnerLessons } from "../src/lib/beginner-lessons";
import { openLesson, tab, openPictures } from "./academy-helpers";
import { ui } from "../src/lib/i18n";

for (const lang of enabledLocales) test(`${lang}: every implemented lesson exposes its complete bilingual concept teaching without awarding progress`, async ({page}) => {
  test.setTimeout(180000);
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(lang => {localStorage.setItem("abap2-language", lang); localStorage.setItem("abap2-appearance", lang === "ar" ? "dark" : "light");}, lang);
  await page.goto("/");
  for (const [id, spec] of Object.entries(educationContent)) {
    await openLesson(page, id, lang);
    if (id === "addition" && lang === "en") {
      const lesson = page.locator("[data-addition-learn]");
      await expect(lesson).toContainText(spec.what.en);await expect(lesson).toContainText(spec.why.en);
      for (const concept of spec.concepts) await expect(lesson.locator(`[data-concept="addition/${concept.id}"]`)).toContainText(concept.explanation.en);
      await expect(page.locator(".header-xp")).toContainText("0");
      continue;
    }
    if (lang === "en" && (id === "orientation" || missions.some(m => m.id === id))) {
      // English lessons use the beginner layout: Start here, then Remember with the flow and every concept.
      // Concept lessons (SAP application topics) open on ConceptExplore instead of a Start-here block.
      if (!isConceptLesson(id)) {
        await expect(page.locator("[data-lesson-start]")).toContainText(spec.what.en);
        await expect(page.locator("[data-lesson-start]")).toContainText(spec.why.en);
      }
      const remember = page.locator("[data-lesson-remember]");
      await expect(remember.locator(".lesson-flow li")).toHaveCount(lessonFlows[id].length);
      for (const concept of spec.concepts) await expect(remember.locator(`[data-concept="${id}/${concept.id}"]`)).toContainText(concept.explanation.en);
      await expect(page.locator(".header-xp")).toContainText("0");
      continue;
    }
    const concepts = page.locator(".lesson-concepts");
    if (lang === "en") await expect(concepts.locator(".lesson-flow li")).toHaveCount(lessonFlows[id].length);
    await expect(page.locator(".visual-introduction")).toContainText(localizedText(spec.what, lang));
    await expect(page.locator(".visual-introduction")).toContainText(localizedText(spec.why, lang));
    for (const concept of spec.concepts) {
      await concepts.locator(".concept-choices").getByRole("button", {name: localizedText(concept.name, lang), exact: true}).click();
      await expect(concepts.locator(".concept-detail")).toHaveAttribute("data-concept", `${id}/${concept.id}`);
      await expect(concepts.locator(".concept-detail")).toContainText(localizedText(concept.explanation, lang));
    }
    await expect(page.locator(".header-xp")).toContainText("0");
  }
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));
  expect(progress.missions).toEqual([]); expect(progress.labs).toEqual([]); expect(progress.passedChallenges).toEqual([]);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const lang of enabledLocales) test(`${lang}: interactive decision boundaries, loop alternatives and concept feedback preserve achievements`, async ({page}) => {
  await page.addInitScript(lang => {localStorage.setItem("abap2-language", lang); localStorage.setItem("abap2-appearance", lang === "ar" ? "dark" : "light");}, lang);
  await page.goto("/?mission=conditions");
  await openLesson(page, "conditions", lang);
  // English lessons no longer show the flowchart explorers; only the quick-check part applies.
  if (lang !== "en") {
  await tab(page,lang,"visualize");
  const flow = page.getByRole("tabpanel").locator(".control-flow-explorer");
  for (const [value, result] of [[49, "Low"], [50, "Medium"], [79, "Medium"], [80, "High"]] as const) {
    await flow.getByRole("combobox").selectOption(String(value));
    await expect(flow.locator(".flow-result pre")).toHaveText(result);
    await expect(flow.getByRole("img")).toHaveAccessibleName(new RegExp(String(value)));
  }
  await tab(page, lang, "visualize");
  await expect(page.getByRole("tabpanel").locator(".control-flow-explorer select")).toHaveValue("80");
  await openLesson(page, "loop-control", lang);
  await tab(page,lang,"visualize");
  const loop = page.getByRole("tabpanel").locator(".control-flow-explorer");
  await expect(loop.locator(".flow-result pre")).toHaveText("1\n2\n4\n5\nDone");
  await loop.getByRole("button", {name: "EXIT", exact: true}).click();
  await expect(loop.locator(".flow-result pre")).toHaveText("1\n2\nDone");
  await expect(loop.locator(".loop-timeline li.active")).toHaveCount(2);
  }
  await tab(page,lang,"learn");
  // English lessons have one quick check in Remember; feedback must not award progress.
  const concepts = page.locator(lang === "en" ? "[data-lesson-remember]" : ".lesson-concepts");
  if (lang !== "en") await concepts.locator(".concept-choices button").nth(1).click();
  const [wrong, right] = lang === "en" ? [1, beginnerLessons.conditions.check.answer] : [0, 1];
  await concepts.locator(".answer-options button").nth(wrong).click();
  await expect(concepts.locator('.quiz [role="status"]')).toHaveClass("error-text");
  await concepts.locator(".answer-options button").nth(right).click();
  await expect(concepts.locator('.quiz [role="status"]')).toHaveClass("success-text");
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));
  expect(progress.missions).toEqual([]); expect(progress.labs).toEqual([]); expect(progress.passedChallenges).toEqual([]);
});

for (const lang of enabledLocales) test(`${lang}: all alternative anatomy examples work and reference-only categories never offer simulated execution`, async ({page}) => {
  test.skip(lang === "en", "English lessons no longer show lesson pictures (user decision: Explore code matches Add two numbers)");
  test.setTimeout(180000);
  await page.addInitScript(lang => localStorage.setItem("abap2-language", lang), lang);
  await page.goto("/");
  for (const [id, scenarios] of Object.entries(educationScenarios)) {
    await openLesson(page, id, lang);
    await openPictures(page, id);
    const section = page.locator(".lesson-alternatives");
    for (const scenario of scenarios) {
      await section.locator(":scope > .explore-actions").getByRole("button", {name: localizedText(scenario.title, lang), exact: true}).click();
      await expect(section.locator(".anatomy-group")).toHaveCount(scenario.doc.groups.length);
      await expect(section.getByRole("button", {name: ui[lang].exploreSyntax, exact: true})).toHaveCount(0);
      for (const group of scenario.doc.groups) {
        await section.locator(`[data-group="${group.id}"]`).click();
        await expect(section.locator(".anatomy-explanation")).toContainText(localizedText(group.explanation, lang));
      }
      if (scenario.doc.referenceOnly) {
        await expect(section.getByRole("button", {name: ui[lang].watchAnatomy, exact: true})).toHaveCount(0);
        await expect(section).toContainText(localizedText(scenario.boundary!, lang));
      } else {
        await section.getByRole("button", {name: ui[lang].watchAnatomy, exact: true}).click();
        await section.getByRole("button", {name: ui[lang].run, exact: true}).click();
        await expect(section.locator(".execution-pointer")).toHaveCount(1);
      }
    }
    await tab(page, lang, "visualize");
    // Both tabs refer to the same alternative; only the active tab mounts its anatomy.
    await expect(page.locator('.lesson-alternatives [id$="-anatomy-explanation"]')).toHaveCount(1);
    expect(await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll("[id]")).map(el => el.id);
      return ids.length === new Set(ids).size;
    })).toBe(true);
  }
});

test("learning journey stays advisory and completed lessons offer a real next link", async ({page}) => {
  await page.addInitScript(() => localStorage.setItem("abap2-master-progress", JSON.stringify({version: 2, missions: ["addition"], labs: [], current: "addition", results: {addition: {attempts: 2, passed: true}}})));
  await page.goto("/");
  await openLesson(page, "addition");
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));
  await page.locator(".lesson-recommendation button").click();
  await expect(page.locator(".lesson-summary h1")).toHaveText(missions.find(m => m.id === "structures")!.title.en);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));
  expect(after.missions).toEqual(before.missions); expect(after.passedChallenges).toEqual(before.passedChallenges); expect(after.results).toEqual(before.results);
});

for (const lang of enabledLocales) test(`${lang}: static ownership and abnormal report paths explain knowledge-check requirements`, async ({page}) => {
  test.skip(lang === "en", "English lessons no longer show lesson pictures (user decision: Explore code matches Add two numbers)");
  await page.addInitScript(lang => {localStorage.setItem("abap2-language", lang); localStorage.setItem("abap2-appearance", lang === "ar" ? "dark" : "light");}, lang);
  await page.goto("/"); await openLesson(page, "oop-introduction", lang); await openPictures(page, "oop-introduction");
  const model = page.getByRole("tabpanel").locator(".control-flow-explorer");
  const increment = model.getByRole("button", {name: lang === "en" ? "Increment through object A" : "زِد القيمة عبر الكائن A", exact: true});
  await increment.click();
  await expect(model.locator(".object-storage-diagram")).toContainText("mv_value = 1");
  await expect(model.locator(".object-storage-diagram")).toContainText("mv_value = 0");
  await model.getByRole("button", {name: "CLASS-DATA", exact: true}).click();
  await increment.click();
  await expect(model.getByTestId("shared-storage")).toHaveCount(1);
  await expect(model.getByTestId("shared-storage")).toContainText("mv_value = 1");
  await tab(page, lang, "visualize");
  await expect(model.getByTestId("shared-storage")).toContainText("mv_value = 1");
  const edges = page.locator(".artifact-edge");
  await expect(edges.first()).toBeVisible();
  await edges.first().locator("button").last().click();
  await expect(page.locator(".artifact-detail h3")).not.toBeEmpty();
  await openLesson(page, "applications-reports", lang); await openPictures(page, "applications-reports");
  const report = page.getByRole("tabpanel").locator(".control-flow-explorer");
  await expect(report.locator(".report-event-flow li.active")).toHaveCount(5);
  await report.getByRole("button", {name: lang === "en" ? "Rejected zero input" : "رفض إدخال صفر", exact: true}).click();
  await expect(report.locator(".report-event-flow li.active")).toHaveCount(3);
  await report.getByRole("button", {name: lang === "en" ? "Uncaught runtime error" : "خطأ وقت تشغيل غير معالج", exact: true}).click();
  await expect(report.locator(".report-event-flow li.active")).toHaveCount(4);
  await expect(report.locator(".report-event-flow li").last()).not.toHaveClass(/active/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));
  expect(progress.missions).toEqual([]); expect(progress.passedChallenges).toEqual([]);
});
