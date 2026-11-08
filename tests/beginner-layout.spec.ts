import { test, expect } from "@playwright/test";
import { edit, openLesson, tab } from "./academy-helpers";
import { missions } from "../src/lib/curriculum";
import { beginnerLessons } from "../src/lib/beginner-lessons";

test("every English lesson gets the beginner layout: run, mistakes, experiments and brief", async ({page}) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/");
  await openLesson(page, "loop-at");
  await expect(page.locator("[data-lesson-start]")).toContainText("You give it");
  await expect(page.locator("[data-lesson-remember] .quiz")).toHaveCount(1);
  await expect(page.locator(".syntax-lab, .lesson-concepts")).toHaveCount(0);
  const run = page.locator("[data-lesson-runner]");
  for (let i = 0; i < 2; i++) await run.getByRole("button", {name: "Run next line"}).click();
  await expect(run.locator(".add-box").first()).toContainText("lt_numbers");
  await expect(run.locator('.add-code [data-state="active"]').first()).toBeVisible();
  await expect(page.locator("[data-lesson-mistakes]")).toBeVisible();
  await expect(page.getByRole("tab", {name: "Explore code", exact: true})).toBeVisible();
  await tab(page, "en", "visualize");
  const exp = page.locator("[data-lesson-experiments]");
  await exp.getByRole("button", {name: "Show answer"}).click();
  await expect(exp.locator(".add-exp-result")).toHaveText("Screen before: 60 → after: 65");
  // Experiments follow the editor: with only WRITE 7. left, the number experiment has no line to change.
  await edit(page, "WRITE 7.");
  await expect(exp).toContainText("no longer has the line");
  await tab(page, "en", "challenge");
  await expect(page.locator("[data-lesson-challenge] h2")).toHaveText(beginnerLessons["loop-at"].challenge.title);
  await expect(page.locator("[data-lesson-challenge]")).toContainText(missions.find(m => m.id === "loop-at")!.expected);
  // Guided lessons are explained part by part, without a fake run or experiments.
  await openLesson(page, "oop-introduction");
  await expect(page.locator("[data-lesson-runner]")).toContainText("Read the code one part at a time");
  await expect(page.locator("[data-lesson-runner] .beg-memory")).toHaveCount(0);
  await tab(page, "en", "visualize");
  await expect(page.locator("[data-lesson-experiments]")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("every stage button works without Run next line, including skipped and shared lines", async ({page}) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/");
  await openLesson(page, "structures");
  let run = page.locator("[data-lesson-runner]");
  // "Structure Fields" shares the TYPES statement with the header, but still opens on its own lines.
  await run.getByRole("button", {name: "Structure Fields"}).click();
  await expect(run.locator(".add-say")).toContainText("These are the fields inside the structure");
  await expect(run.locator('.add-code [data-state="active"]')).toHaveCount(2);
  await run.getByRole("button", {name: "Show Output"}).click();
  await expect(run.locator(".add-screen pre")).toHaveText("Ahmed");
  await openLesson(page, "conditions");
  run = page.locator("[data-lesson-runner]");
  await run.getByLabel("lv_amount").fill("500");
  // With 500 the IF branch is skipped; its stage still opens and says so.
  await run.getByRole("button", {name: "If True"}).click();
  await expect(run.locator(".add-progress")).toHaveText("Skipped with these values · If True");
  await expect(run.locator(".add-screen")).toContainText("Nothing on the screen yet");
  await run.getByRole("button", {name: "If False"}).click();
  await expect(run.locator(".add-screen pre")).toHaveText("Automatically approved");
  // Stage labels stay on one line.
  for (const button of await run.locator(".beg-phases button").all())
    expect(await button.evaluate(el => el.getBoundingClientRect().height < 48)).toBe(true);
  expect(errors).toEqual([]);
});
