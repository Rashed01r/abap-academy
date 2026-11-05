import { test } from "node:test";
import assert from "node:assert/strict";
import { educationContent } from "../src/lib/education-content";
import { educationScenarios } from "../src/lib/education-scenarios";
import { validateEducation, recommendedLesson } from "../src/lib/education-quality";
import { simulate } from "../src/lib/engine";
import { readFileSync } from "node:fs";
import { educationReviewErrors } from "../scripts/education-review-record";

test("every implemented activity declares objective, teaching, example, demonstration and assessment bindings", () => {
  assert.deepEqual(validateEducation(), []);
});
test("quality gate rejects unregistered lessons and missing Arabic without relying on keywords", () => {
  const content = structuredClone(educationContent);
  delete content["cloud-introduction"];
  content.conditions.concepts[0].explanation.ar = "";
  const errors = validateEducation(content);
  assert.ok(errors.some(e => e.includes("cloud-introduction: missing")));
  assert.ok(errors.some(e => e.includes("conditions/if-else: missing bilingual")));
});
test("quality gate detects broken teaching, visualization and assessment edges", () => {
  const content = structuredClone(educationContent);
  content.conditions.concepts[1].learn = ["group:invented"];
  content.conditions.concepts[1].demonstrate = "scenario:invented";
  content.conditions.concepts[1].assess = ["unexplained-challenge"];
  content.conditions.concepts[2].assess = ["conditions-bonus"];
  const errors = validateEducation(content);
  for (const fragment of ["unknown teaching/example", "unknown demonstration", "unknown assessment", "conditions-ranges has no taught"]) assert.ok(errors.some(e => e.includes(fragment)), fragment);
});
test("quality gate catches lost objectives, duplicate concepts and empty teaching", () => {
  const content = structuredClone(educationContent);
  content.conditions.concepts[1].objectives = [];
  content.conditions.concepts[0].learn = [];
  content.conditions.concepts[2].id = content.conditions.concepts[0].id;
  const errors = validateEducation(content);
  for (const fragment of ["objective 1 has no concept", "duplicate concept ID", "absent from Learn"]) assert.ok(errors.some(e => e.includes(fragment)), fragment);
  assert.ok(errors.some(e => e.includes("visualize requires unexplained concept boundaries")));
});
test("alternative examples execute their promised different outcomes", () => {
  const expected: Record<string, string[]> = {
    ranges: ["Medium"], total: ["15"], records: ["Sara"], employees: ["Ahmed", "Sara"],
    exit: ["1", "2", "3"], ascending: ["Omar", "Sara"], index: ["102"],
  };
  for (const scenario of Object.values(educationScenarios).flat()) {
    if (scenario.doc.referenceOnly) {assert.ok(scenario.boundary); continue;}
    assert.deepEqual(simulate(scenario.doc.source).at(-1)?.output, expected[scenario.id], scenario.id);
  }
});
test("recommendations ignore completed follow-ons and never mutate completion records", () => {
  const completed = ["conditions"], labs = ["orientation"];
  const before = JSON.stringify({completed, labs});
  assert.equal(recommendedLesson("orientation", completed, labs)?.id, "addition");
  assert.notEqual(recommendedLesson("structures", completed, labs)?.id, "conditions");
  assert.equal(JSON.stringify({completed, labs}), before);
});
test("review drift gate rejects stale or missing review evidence without promoting quality status", () => {
  const review = JSON.parse(readFileSync("docs/academy-development/educational-review.json", "utf8"));
  assert.deepEqual(educationReviewErrors(review), []);
  review.lessons.conditions.fingerprint = "stale";
  delete review.lessons["cloud-introduction"];
  review.lessons.addition.status = "EDUCATIONALLY_VERIFIED";
  const errors = educationReviewErrors(review);
  assert.equal(errors.length, 3);
  for (const id of ["conditions", "cloud-introduction", "addition"]) assert.ok(errors.some(e => e.startsWith(`${id}:`)));
});
