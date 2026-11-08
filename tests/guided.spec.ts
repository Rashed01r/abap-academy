import { runnerTo } from "./anatomy-helpers";
import { enabledLocales } from "../src/lib/language-policy";
import { localizedText } from "../src/lib/language-policy";
import { test, expect } from "@playwright/test";
import { guidedDefinitions } from "../src/lib/guided-curriculum";
import { ui } from "../src/lib/i18n";
import { treeCopy } from "../src/lib/tree-copy";
import { openLesson, tab } from "./academy-helpers";

for (const lang of enabledLocales) for (const [index, d] of guidedDefinitions.entries()) {
  test(`${lang}: ${d.id} reference anatomy, model decisions and durable achievements`, async ({page}) => {
    const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(({lang, dark}) => {
      localStorage.setItem("abap2-language", lang);
      localStorage.setItem("abap2-appearance", dark ? "dark" : "light");
      if (!localStorage.getItem("abap2-master-progress")) localStorage.setItem("abap2-master-progress", JSON.stringify({version: 2, missions: ["structures"], labs: ["structures"], current: "structures", results: {structures: {attempts: 3, passed: true}}}));
    }, {lang, dark: index % 2 === 0});
    await page.goto(`/?mission=${d.id}`);
    await expect(page.locator(".lesson-summary h1")).toHaveText(localizedText(d.title, lang));
    const expand = page.getByRole("button", {name: treeCopy[lang].expandWorkspace, exact: true});
    if ((page.viewportSize()?.width || 0) >= 768) await expand.click();
    await expect(page.locator(".guided-boundary")).toContainText(localizedText(d.boundary, lang));
    if (lang === "en") {
      // Reference code is explained part by part, with no simulated memory or screen.
      const run = await runnerTo(page, localizedText(d.groups.at(-1)!.title, lang));
      await expect(run.locator(".add-progress")).toContainText(`Part ${d.groups.length} of ${d.groups.length}`);
      await expect(run.locator(".beg-memory")).toHaveCount(0);
    } else {
      await expect(page.locator(".anatomy-group")).toHaveCount(d.groups.length);
      await page.locator(".anatomy-group").last().focus(); await page.keyboard.press("Enter");
      await expect(page.locator(".anatomy-explanation h3")).toHaveText(localizedText(d.groups.at(-1)!.title, lang));
      await expect(page.getByRole("button", {name: ui[lang].watchAnatomy, exact: true})).toHaveCount(0);
    }
    let saved = await page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));
    expect(saved.missions).toEqual(["structures"]); expect(saved.started).not.toContain(d.id);
    await tab(page, lang, "visualize");
    const explorer = page.locator(".artifact-explorer");
    await expect(explorer.getByRole("button", {name: localizedText(d.artifacts[0].title, lang), exact: false}).first()).toBeVisible();
    await explorer.locator("[data-artifact]").last().click();
    await expect(explorer.locator(".artifact-detail h3")).toHaveText(localizedText(d.artifacts.at(-1)!.title, lang));
    await expect(page.getByRole("tabpanel").locator(".monaco-editor")).toHaveCount(0);
    await tab(page, lang, "challenge");
    const assessment = page.getByRole("region", {name: lang === "en" ? "Apply the lesson" : "طبّق ما تعلمته", exact: true});
    const check = assessment.getByRole("button", {name: lang === "en" ? "Check decisions" : "تحقق من القرارات", exact: true});
    const complete = page.getByRole("button", {name: ui[lang].complete, exact: true});
    await expect(check).toBeDisabled(); await expect(complete).toBeDisabled();
    await assessment.getByRole("button", {name: lang === "en" ? "Show next hint" : "أظهر التلميح التالي", exact: true}).first().click();
    await expect(assessment).toContainText(localizedText(d.decisions[0].hints[0], lang));
    for (const decision of d.decisions) await assessment.locator(`[data-decision="${decision.id}"] select`).selectOption(decision.options.find(o => o.id !== decision.correct)!.id);
    await check.click(); await expect(assessment.getByTestId("guided-result")).toHaveClass(/error-text/);
    await expect(complete).toBeDisabled();
    for (const decision of d.decisions) await assessment.locator(`[data-decision="${decision.id}"] select`).selectOption(decision.correct);
    await check.click(); await expect(assessment.getByTestId("guided-result")).toHaveClass(/success-text/);
    // English challenges have no quick check: passing the challenge alone enables completion.
    await expect(page.getByRole("tabpanel").locator(".quiz")).toHaveCount(0);
    await expect(complete).toBeEnabled(); await complete.click();
    await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!).missions.includes(new URLSearchParams(location.search).get("mission")))).toBe(true);
    await page.getByRole("button", {name: ui[lang].completed, exact: true}).click();
    saved = await page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));
    expect(saved.missions.filter((id: string) => id === d.id)).toHaveLength(1);
    expect(saved.passedChallenges).toContain(`${d.id}-assessment`);
    expect(saved.results.structures).toEqual({attempts: 3, passed: true});
    await page.reload(); await expect(page.locator(".lesson-summary h1")).toHaveText(localizedText(d.title, lang));
    saved = await page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));
    expect(saved.missions).toContain(d.id);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    if (lang === "ar") await page.locator(".connected-lesson").screenshot({path: test.info().outputPath(`${d.id}-ar.png`)});
  });
}

test("specialized foundation models react to actual input and preserve state on topic return", async ({page}) => {
  await page.goto("/?mission=dictionary-introduction");
  await openLesson(page, "dictionary-introduction"); await tab(page, "en", "visualize");
  const designer = page.getByRole("region", {name: "Dictionary designer", exact: true});
  await designer.getByLabel("Candidate status", {exact: true}).fill("ACTIVE");
  await expect(designer).toContainText("The value exceeds the chosen character length");
  await designer.getByRole("combobox", {name: /^Domain binding for ZACA_EMPLOYEE_STATUS/}).selectOption("");
  await expect(designer).toContainText("Bind the data element to a domain");
  await openLesson(page, "database-fundamentals"); await tab(page, "en", "visualize");
  const sql = page.getByRole("region", {name: "SQL foundation lab", exact: true});
  await sql.getByRole("combobox", {name: /^Department(?: |$)/}).selectOption("IT");
  await sql.getByLabel("Minimum salary (employees only)", {exact: true}).fill("9000");
  await expect(sql.getByRole("table", {name: "Derived result", exact: true})).toContainText("Omar");
  await expect(sql.getByRole("table", {name: "Derived result", exact: true})).not.toContainText("Ahmed");
  await sql.getByRole("combobox", {name: /^Department(?: |$)/}).selectOption("LEGAL");
  await expect(sql).toContainText("No matching rows");
  await openLesson(page, "oop-introduction"); await tab(page, "en", "visualize");
  const objects = page.getByRole("region", {name: "One class, independent objects", exact: true});
  await objects.getByRole("button", {name: "Create instance", exact: true}).click();
  await objects.getByRole("button", {name: "Invoke add_one( )", exact: true}).click();
  await objects.getByRole("button", {name: "Create instance", exact: true}).click();
  await expect(objects.getByRole("status")).toContainText("object_1 · name = Item; quantity = 1");
  await expect(objects.getByRole("status")).toContainText("object_2 · name = Item; quantity = 0");
  await openLesson(page, "dictionary-introduction"); await tab(page, "en", "visualize");
  await expect(designer.getByLabel("Candidate status", {exact: true})).toHaveValue("ACTIVE");
});
