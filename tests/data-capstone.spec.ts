import { test, expect } from "@playwright/test";
import { tablePerformanceMission } from "../src/lib/table-performance-mission";
import { employeeManagerMission } from "../src/lib/employee-manager-mission";
import { gradeAll, answerQuiz, completion, openPath, roadmapNode } from "./academy-helpers";
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
  await openPath(page, "data");
  await expect(roadmapNode(page, "lesson:data-table-performance")).toHaveAccessibleName(/^Find rows with fewer checks/);
  await expect(roadmapNode(page, "lesson:data-employee-manager")).toHaveAccessibleName(/^Build the Employee Data Manager/);
  await expect(page.locator('[data-node^="planned:data:"], [data-mobile-node^="planned:data:"]')).toHaveCount(0);
});
