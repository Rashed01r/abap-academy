import { test, expect } from "@playwright/test";
import { sqlMissions } from "../src/lib/sql-missions";
import { gradeAll, answerQuiz, completion, selectChallenge, edit, openPath, roadmapNode } from "./academy-helpers";
import { matchAnatomy, finishLearn, runnerTo } from "./anatomy-helpers";
import { ui } from "../src/lib/i18n";

for (const mission of sqlMissions) test(`${mission.id}: runnable SQL lesson, graded challenge and once-only reward`, async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto(`/?mission=${mission.id}`);
  await expect(page.locator(".lesson-summary h1")).toHaveText(mission.title.en);
  await matchAnatomy(page, mission.id, "en");
  await finishLearn(page, "en");
  await gradeAll(page, mission, "en", "WRITE / 'Omar'.");
  await answerQuiz(page, mission.answer);
  await completion(page, "en").click();
  await expect(page.locator(".header-xp")).toContainText("300");
  expect(errors).toEqual([]);
});

test("the Learn runner shows the database changing step by step", async ({ page }) => {
  await page.goto("/?mission=database-sql-mutations");
  const run = await runnerTo(page, "Delete a row");
  await expect(run.getByTestId("sql-database")).toBeVisible();
  await page.getByRole("button", { name: "Run next line" }).click();
  await expect(run.getByTestId("sql-database").getByRole("table", { name: "ZACA_EMPLOYEE" })).not.toContainText("Ahmed");
});

test("a SQL syntax mistake explains how to fix it", async ({ page }) => {
  const mission = sqlMissions[0];
  await page.goto(`/?mission=${mission.id}`);
  await selectChallenge(page, mission, 0, "en");
  await edit(page, `${mission.challenges![0].starter}SELECT SINGLE FROM zaca_employee FIELDS * WHERE employee_id = lv_id INTO @ls_employee.`);
  await page.getByRole("button", { name: ui.en.check, exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "prefix ABAP variables with @" })).toBeVisible();
});

test("the Database Development path shows every planned topic as a lesson", async ({ page }) => {
  await page.goto("/");
  await openPath(page, "database");
  for (const m of sqlMissions) await expect(roadmapNode(page, `lesson:${m.id}`)).toBeVisible();
  await expect(page.locator('[data-node^="planned:database:"], [data-mobile-node^="planned:database:"]')).toHaveCount(0);
});
