import { runnerTo } from "./anatomy-helpers";
import { enabledLocales } from "../src/lib/language-policy";
import { localizedText } from "../src/lib/language-policy";
import { test, expect } from "@playwright/test";
import { guidedDefinitions } from "../src/lib/guided-curriculum";
import { ui } from "../src/lib/i18n";
import { openLesson, tab } from "./academy-helpers";
import { cloudLessons } from "../src/lib/cloud-content";
import { isConceptLesson, isStepLesson } from "../src/lib/application-labs";
import { isModernLesson } from "../src/lib/modern-lessons";

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
    // Redesigned concept and modern lessons teach Learn in steps, without the reference-code runner.
    const runnerOnLearn = lang !== "en" || !(isConceptLesson(d.id) || isModernLesson(d.id));
    if (runnerOnLearn) await expect(page.locator(".guided-boundary")).toContainText(localizedText(d.boundary, lang));
    if (!runnerOnLearn) await expect(page.locator("[data-lesson-runner]")).toHaveCount(0);
    else if (lang === "en") {
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
    if (isStepLesson(d.id)) await expect(page.locator(".artifact-explorer")).toHaveCount(0);
    else {
      const explorer = page.locator(".artifact-explorer");
      await expect(explorer.getByRole("button", {name: localizedText(d.artifacts[0].title, lang), exact: false}).first()).toBeVisible();
      await explorer.locator("[data-artifact]").last().click();
      await expect(explorer.locator(".artifact-detail h3")).toHaveText(localizedText(d.artifacts.at(-1)!.title, lang));
    }
    await expect(page.getByRole("tabpanel").locator(".monaco-editor")).toHaveCount(0);
    await tab(page, lang, "challenge");
    const complete = page.getByRole("button", {name: ui[lang].complete, exact: true});
    if (d.id in cloudLessons) {
      // Code review: a wrong flag fails; flagging exactly the violating lines passes.
      const lines = cloudLessons[d.id].review.lines;
      const review = page.getByRole("region", {name: "Code review", exact: true}), submit = review.getByRole("button", {name: "Submit review", exact: true});
      const line = (code: string) => review.getByRole("button", {name: code, exact: false});
      await expect(complete).toBeDisabled();
      const fine = lines.find(l => !l[1])![0];
      await line(fine).click(); await submit.click();
      await expect(review.getByTestId("guided-result")).toHaveClass(/error-text/); await expect(complete).toBeDisabled();
      await line(fine).click();
      for (const [code, bad] of lines) if (bad) await line(code).click();
      await submit.click(); await expect(review.getByTestId("guided-result")).toHaveClass(/success-text/);
    } else {
    const assessment = page.getByRole("region", {name: lang === "en" ? "Apply the lesson" : "طبّق ما تعلمته", exact: true});
    const check = assessment.getByRole("button", {name: lang === "en" ? "Check decisions" : "تحقق من القرارات", exact: true});
    await expect(check).toBeDisabled(); await expect(complete).toBeDisabled();
    await assessment.getByRole("button", {name: lang === "en" ? "Show next hint" : "أظهر التلميح التالي", exact: true}).first().click();
    await expect(assessment).toContainText(localizedText(d.decisions[0].hints[0], lang));
    // The intro lesson shows one decision at a time with radio answers; the others use a select per decision.
    const choose = async (decision: typeof d.decisions[number], optionId: string) => {
      if (!isStepLesson(d.id)) return assessment.locator(`[data-decision="${decision.id}"] select`).selectOption(optionId);
      await assessment.getByRole("button", {name: `Decision ${d.decisions.indexOf(decision) + 1}`, exact: true}).click();
      await assessment.getByRole("radio", {name: localizedText(decision.options.find(o => o.id === optionId)!.text, lang), exact: true}).check();
    };
    for (const decision of d.decisions) await choose(decision, decision.options.find(o => o.id !== decision.correct)!.id);
    await check.click(); await expect(assessment.getByTestId("guided-result")).toHaveClass(/error-text/);
    await expect(complete).toBeDisabled();
    for (const decision of d.decisions) await choose(decision, decision.correct);
    await check.click(); await expect(assessment.getByTestId("guided-result")).toHaveClass(/success-text/);
    }
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
  await designer.getByRole("button", {name: /^Test a value/}).click();
  await designer.getByLabel("Candidate status", {exact: true}).fill("ACTIVE");
  await expect(designer).toContainText("The value exceeds the chosen character length");
  await designer.getByRole("button", {name: /^Data element/}).click();
  await designer.getByRole("radio", {name: /^Unbound/}).check();
  await expect(designer).toContainText("Bind the data element to a domain");
  await designer.getByRole("button", {name: /^Test a value/}).click();
  await openLesson(page, "database-fundamentals"); await tab(page, "en", "visualize");
  const sql = page.getByRole("region", {name: "SQL read lab", exact: true});
  await sql.getByRole("button", {name: /^Filter the rows/}).click();
  await sql.getByLabel("Minimum salary", {exact: true}).fill("9000");
  await expect(sql.getByRole("table", {name: "Result", exact: true})).toContainText("Omar");
  await expect(sql.getByRole("table", {name: "Result", exact: true})).not.toContainText("Ahmed");
  await sql.getByRole("combobox", {name: /^Department(?: |$)/}).selectOption("LEGAL");
  await expect(sql).toContainText("No matching rows");
  await openLesson(page, "oop-introduction"); await tab(page, "en", "visualize");
  const objects = page.getByRole("region", {name: "Object lab", exact: true});
  await objects.getByRole("button", {name: "Create instance", exact: true}).click();
  await objects.getByRole("button", {name: "Create instance", exact: true}).click();
  await objects.getByRole("button", {name: /^Call a method/}).click();
  await objects.getByRole("button", {name: "lo_1", exact: true}).click();
  await objects.getByRole("button", {name: "Invoke lo_1->increment( )", exact: true}).click();
  await expect(objects.getByRole("group", {name: "Objects in memory"}).or(objects.getByLabel("Objects in memory"))).toContainText("lo_1");
  await expect(objects.getByLabel("Objects in memory")).toContainText("lo_2");
  await openLesson(page, "dictionary-introduction"); await tab(page, "en", "visualize");
  await expect(designer.getByLabel("Candidate status", {exact: true})).toHaveValue("ACTIVE");
});
