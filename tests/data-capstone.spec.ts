import { test, expect } from "@playwright/test";
import { tablePerformanceMission } from "../src/lib/table-performance-mission";
import { employeeManagerMission } from "../src/lib/employee-manager-mission";
import { gradeAll, answerQuiz, completion } from "./academy-helpers";
import { matchAnatomy, finishLearn } from "./anatomy-helpers";

for (const [mission, wrong, xp] of [[tablePerformanceMission, "WRITE / 1.", "300"], [employeeManagerMission, "WRITE / 8500.", "400"]] as const) {
  test(`${mission.id}: English lesson, graded challenges and once-only reward`, async ({ page }) => {
    await page.goto(`/?mission=${mission.id}`);
    await expect(page.locator(".lesson-summary h1")).toHaveText(mission.title.en);
    await matchAnatomy(page, mission.id, "en");
    await finishLearn(page, "en");
    await gradeAll(page, mission, "en", wrong);
    await answerQuiz(page, mission.answer);
    await completion(page, "en").click();
    await expect(page.locator(".header-xp")).toContainText(xp);
    await page.reload();
    await expect(page.locator(".header-xp")).toContainText(xp);
  });
}

test("the Working with Data path has no Coming Soon topics left", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-tree-id="data"]').click();
  await expect(page.locator(".tree-node").filter({ hasText: "Find rows with fewer checks" })).toBeVisible();
  await expect(page.locator(".tree-node").filter({ hasText: "Build the Employee Data Manager" })).toBeVisible();
  await expect(page.locator(".future-topic")).toHaveCount(0);
});
