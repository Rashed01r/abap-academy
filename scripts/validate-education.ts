import { educationContent } from "../src/lib/education-content";
import { educationScenarios } from "../src/lib/education-scenarios";
import { validateEducation, educationLessonIds, conceptRecords } from "../src/lib/education-quality";
import { simulate } from "../src/lib/engine";
import { validateAnatomy } from "../src/lib/code-anatomy";
import { readFileSync, existsSync } from "node:fs";
import { educationReviewErrors } from "./education-review-record";

const errors = validateEducation();
const reviewPath = "docs/academy-development/educational-review.json";
if (!existsSync(reviewPath)) errors.push("Missing source review record; follow EDUCATIONAL_QUALITY.md before recording review.");
else {
  errors.push(...educationReviewErrors(JSON.parse(readFileSync(reviewPath, "utf8"))));
}
for (const scenarios of Object.values(educationScenarios)) for (const scenario of scenarios) {
  try {
    validateAnatomy(scenario.doc, scenario.doc.source);
    if (!scenario.doc.referenceOnly) simulate(scenario.doc.source);
  } catch (error) { errors.push(`${scenario.doc.id}: ${String(error)}`); }
}
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log(`Educational structure passed: ${educationLessonIds.length} activities, ${Object.keys(educationContent).reduce((n, id) => n + conceptRecords(id).length, 0)} essential concepts, ${Object.values(educationScenarios).flat().length} alternative anatomy examples. Human quality gates remain separate.`);
