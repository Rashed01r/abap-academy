import { test, expect } from "@playwright/test";
import { tableExpressionsMission } from "../src/lib/table-expressions-mission";
import { gradeAll, answerQuiz, completion, selectChallenge, edit } from "./academy-helpers";
import { ui } from "../src/lib/i18n";
import { matchAnatomy, finishLearn } from "./anatomy-helpers";

test("table expressions lesson: English content, real trace, graded challenge and once-only reward", async ({ page }) => {
  await page.goto("/?mission=data-table-expressions");
  await expect(page.locator(".lesson-summary h1")).toHaveText(tableExpressionsMission.title.en);
  await matchAnatomy(page, "data-table-expressions", "en");
  await finishLearn(page, "en");
  // A canned answer fails; the real solution passes for every changed-ID probe.
  await gradeAll(page, tableExpressionsMission, "en", "WRITE / 'Sara'.");
  await answerQuiz(page, tableExpressionsMission.answer);
  await completion(page, "en").click();
  await expect(page.locator(".header-xp")).toContainText("300");
  await page.reload();
  await expect(page.locator(".header-xp")).toContainText("300");
});

test("an uncaught missing row reports CX_SY_ITAB_LINE_NOT_FOUND with repair advice", async ({ page }) => {
  await page.goto("/?mission=data-table-expressions");
  await selectChallenge(page, tableExpressionsMission, 0, "en");
  await edit(page, `${tableExpressionsMission.starter}ls_employee = lt_employees[ id = 999 ].`);
  await page.getByRole("button", { name: ui.en.check, exact: true }).click();
  const alert = page.getByRole("alert").filter({ hasText: "CX_SY_ITAB_LINE_NOT_FOUND" });
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("TRY");
});
