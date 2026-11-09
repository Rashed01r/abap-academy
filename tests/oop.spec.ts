import { test, expect } from "@playwright/test";
import { oopMissions } from "../src/lib/oop-missions";
import { gradeAll, answerQuiz, completion, selectChallenge, edit, openPath, roadmapNode } from "./academy-helpers";
import { matchAnatomy, finishLearn } from "./anatomy-helpers";
import { ui } from "../src/lib/i18n";

for (const mission of oopMissions) test(`${mission.id}: runnable OOP lesson, graded challenge and once-only reward`, async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto(`/?mission=${mission.id}`);
  await expect(page.locator(".lesson-summary h1")).toHaveText(mission.title.en);
  await matchAnatomy(page, mission.id, "en");
  await finishLearn(page, "en");
  await gradeAll(page, mission, "en", `${mission.challenges![0].solution}\nWRITE / 'extra'.`);
  await answerQuiz(page, mission.answer);
  await completion(page, "en").click();
  await expect(page.locator(".header-xp")).toContainText("300");
  expect(errors).toEqual([]);
});

test("a private attribute used outside the class explains the rule", async ({ page }) => {
  const mission = oopMissions[3];
  await page.goto(`/?mission=${mission.id}`);
  await selectChallenge(page, mission, 0, "en");
  await edit(page, `${mission.challenges![0].solution}\nlo_omar->mv_salary = 1.`);
  await page.getByRole("button", { name: ui.en.check, exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "PRIVATE SECTION" })).toBeVisible();
});

test("the OOP path lists all eight lessons and has no planned topics left", async ({ page }) => {
  await page.goto("/");
  await openPath(page, "oop");
  for (const m of oopMissions) await expect(roadmapNode(page, `lesson:${m.id}`)).toBeVisible();
  await expect(page.locator('[data-node^="planned:oop:"], [data-mobile-node^="planned:oop:"]').filter({ visible: true })).toHaveCount(0);
});

test("an exception that is neither caught nor declared explains the rule", async ({ page }) => {
  const mission = oopMissions[7];
  await page.goto(`/?mission=${mission.id}`);
  await selectChallenge(page, mission, 0, "en");
  const unprotected = mission.challenges![0].solution.split("TRY.")[0] + "lo_leave->take( lv_request ).";
  await edit(page, unprotected);
  await page.getByRole("button", { name: ui.en.check, exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "is not handled" })).toBeVisible();
});
