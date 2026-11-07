import { ENABLE_ARABIC } from "../src/lib/language-policy";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { missions, paths } from "../src/lib/curriculum";
import { getAnatomy, orientationExamples } from "../src/lib/anatomy-content";
import { educationScenarios } from "../src/lib/education-scenarios";
import { educationLessonIds, conceptRecords, pathLevels, validateEducation } from "../src/lib/education-quality";
import { educationSurfaces } from "../src/lib/education-surfaces";
import { reviewNotes } from "./education-review-notes";
import { educationReviewFingerprint } from "./education-review-record";

const root = "docs/academy-development/";
const reviewPath = `${root}educational-review.json`;
if (validateEducation().length) throw new Error(validateEducation().join("\n"));
if (process.argv.includes("--record-review")) {
  writeFileSync(reviewPath, JSON.stringify({
    reviewedOn: "2026-11-05", scope: "English-only source alignment review; Arabic preserved and deferred. Not SAP compilation, learner research or linguistic certification.",
    lessons: Object.fromEntries(educationLessonIds.map(id => [id, {fingerprint: educationReviewFingerprint(id), status: "SOURCE_REVIEWED_WITH_LIMITATIONS"}])),
  }, null, 2) + "\n");
}
const reviews = existsSync(reviewPath) ? JSON.parse(readFileSync(reviewPath, "utf8")) : {lessons: {}};
const records = educationLessonIds.map(id => {
  const m = missions.find(m => m.id === id), path = m?.pathId || "fundamentals";
  const concepts = conceptRecords(id), anatomy = getAnatomy(id, m?.example || orientationExamples.en);
  const note = reviewNotes[id];
  if (!note) throw new Error(`Missing human audit note ${id}`);
  return {
    topicId: id, learningPath: path, educationalLevel: pathLevels[path], lessonDifficulty: m?.difficulty || "beginner",
    objectives: m?.objectives || [{en: "Read, edit and trace a small ABAP program.", ar: "قراءة برنامج ABAP صغير وتعديله وتتبع تنفيذه."}],
    conceptsPromised: concepts.map(c => c.id), conceptsCurrentlyCovered: concepts.map(c => c.id),
    missingDeclaredConcepts: [], coverageLimit: "Structural bindings are validated; their presence alone does not prove semantic quality or retention.",
    concepts, tabRequirements: educationSurfaces[id], priority: note.priority, issuesFound: note.found, correctionsMade: note.correction,
    introductionClarity: "English what/why introduction (Arabic deferred) and selectable essential explanations; original depth retained.",
    visualCodeAnatomy: {primaryGroups: anatomy.groups.length, alternatives: (educationScenarios[id] || []).map(s => ({id: s.id, groups: s.doc.groups.length, referenceOnly: !!s.doc.referenceOnly}))},
    visualizationSuitability: m?.guided ? "Labeled conceptual fixtures and navigable artifact relationships; no SAP execution claim." : "Actual interpreter snapshots; specialized conceptual controls labeled separately.",
    challengeAlignment: "All existing assessment IDs and knowledge-check requirements mapped to taught concept IDs; original grading retained; optional misconception checks add no achievements.",
    englishStatus: "New teaching reviewed; retained content source-alignment review, not learner comprehension research.",
    arabicStatus: ENABLE_ARABIC ? "Requires dedicated localization review before release." : "DEFERRED: existing Arabic resources preserved; no Arabic authoring or review required in this phase.",
    technicalAccuracyStatus: "Supported examples checked against interpreter/regression and selected official SAP references; no real SAP compilation or activation.",
    remainingGaps: !ENABLE_ARABIC ? note.remaining.replace("Retained token wording needs independent Arabic editorial review;", "Arabic editorial review is deferred;") : note.remaining,
    gates: {A: "STRUCTURAL_PASS_AND_SCOPED_SOURCE_REVIEW", B: "SOURCE_REVIEWED", C: "SOURCE_REVIEWED_SEE_BROWSER_LEDGER", D: "RANGE_VALIDATED_AND_SCOPED_SOURCE_REVIEW", E: "STRUCTURAL_PASS_AND_SCOPED_SOURCE_REVIEW", F: "SCOPED_NOT_SAP_COMPILED", G: "NEW_CONTENT_REVIEWED_SEE_VISUAL_LEDGER", H: "SEE_EDUCATIONAL_AUDIT_VERIFICATION_LEDGER"},
    verificationStatus: reviews.lessons[id]?.fingerprint === educationReviewFingerprint(id) ? reviews.lessons[id].status : "REVIEW_REQUIRED_SOURCE_CHANGED",
  };
});
writeFileSync(`${root}educational-audit.json`, JSON.stringify({
  scope: `${records.length} implemented activities across all nine paths. Current development language: English only; Arabic preserved and deferred. Planned lessons excluded; review status does not change completion.`,
  implemented: records.length, reviewed: records.filter(r => r.verificationStatus === "SOURCE_REVIEWED_WITH_LIMITATIONS").length,
  concepts: records.reduce((n, r) => n + r.concepts.length, 0),
  issuesByPriority: {critical: 0, high: records.filter(r => r.priority === "high").length, medium: records.filter(r => r.priority === "medium").length},
  records,
}, null, 2) + "\n");
const md = ["# Concept coverage", "", "Current development language: English only. Arabic resources preserved and temporarily deferred; no Arabic generation/review/UI checks required.", "", "Generated by `npm.cmd run report:education` from author-owned concept IDs and real teaching/assessment references. Do not edit this table by hand.", "", "Each concept has a stable lesson-qualified ID, English name/explanation with preserved optional Arabic, learning objective, difficulty, recommended prior lesson, essential priority, teaching/example references, demonstration and assessment bindings. `education-surfaces.ts` independently declares what visualizers and knowledge checks require.", "", "| Topic | Path | Concepts | Learn / examples | Demonstration | Assessment |", "|---|---|---|---|---|---|", ...records.flatMap(r => r.concepts.map(c => `| ${r.topicId} | ${paths.find(p => p.id === r.learningPath)!.title.en} | ${c.id} | ${c.learn.join(", ")} | ${c.demonstrate} | ${c.assess.join(", ")} |`)), "", "All declared concepts currently have valid structural bindings. This is not automatic educational verification. Detailed concept records with preserved Arabic, objective references, review limits and remaining gaps are in [educational-audit.json](educational-audit.json); test evidence and next review tasks are in [EDUCATIONAL_AUDIT.md](EDUCATIONAL_AUDIT.md).", ""];
writeFileSync(`${root}CONCEPT_COVERAGE.md`, md.join("\n"));
writeFileSync(`${root}EDUCATIONAL_AUDIT_TOPICS.md`, [
  "# Per-topic educational review", "", "Current development language: English only; Arabic temporarily deferred. Historical Arabic review findings do not create active work requirements.", "", "Generated from the source-review findings. These are quality-review records, independent of mission availability, learner completion and XP.", "", "| Topic | Priority | Finding | Correction | Remaining limit |", "|---|---|---|---|---|",
  ...records.map(r => `| ${r.topicId} | ${r.priority} | ${r.issuesFound} | ${r.correctionsMade} | ${r.remainingGaps} |`), "",
  "See [machine-readable audit](educational-audit.json) for level, English concepts and preserved Arabic, anatomy counts, tab mappings and gates A–H. See [verification ledger](EDUCATIONAL_AUDIT.md) for actual checks and their limits.", "",
].join("\n"));
console.log(`Reported ${records.length} activities and ${records.reduce((n, r) => n + r.concepts.length, 0)} concepts. No learner or mission status changed.`);
