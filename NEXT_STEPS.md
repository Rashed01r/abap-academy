# Resume academy development

Latest UI refinement (2026-11-04): path cards show bilingual learning outcomes below their titles, without serial numbers or lesson counts. Topic cards show their subtitles instead of Available; completed/in-progress and Coming Soon states remain. Path search results also show the learning summary. Build, lint/typecheck and 26/26 targeted tree browser cases passed (31.8s); English/Arabic desktop and Arabic mobile summary/geometry checks and visual review passed. Curriculum scope/progress is unchanged; next mission remains data-conditional-loop.

2026-11-04: all nine paths now have introductory playable content. Pass B also completed READ TABLE, indexed table mutations and sorting/filtering. **Next: data-conditional-loop.** Preserve the sole Knowledge Tree, resizable workspace, progress version 2, prior XP, bilingual content and drafts.

Read [the canonical resume instructions](docs/academy-development/NEXT_STEPS.md), [implementation and exact test evidence](docs/academy-development/IMPLEMENTATION_PROGRESS.md), and [mission statuses](docs/academy-development/MISSION_REGISTRY.md), then inspect the actual repository. The latest full-curriculum two-pass request supersedes the older Data-first-only instructions.

Totals: 9/9 paths playable; 1 fully verified path; 24 activities (23 verified topics plus one tested project foundation); 34 assessments; 5,315 XP; 101 planned records. Employee Management is a guided first-stage design activity; its overall capstone is still IN_PROGRESS. The entire curriculum is not complete.

Build/typecheck/lint, 89 unit tests and curriculum validation passed. Full production browser regression: 160/162 passed in 6.4 minutes. The two failures were the desktop/mobile obsolete preview-ID case; after replacing READ TABLE with the still-planned conditional-loop ID and adding READ to valid-link checks, both passed on rerun (2/2 in 3.1 seconds). Thus all 162 cases passed across the full run and targeted correction on the same application build; no application source changed after the full run.

Preview: http://localhost:3020/?mission=data-sorting-filtering. Safe pre-change Git checkpoint: checkpoint/before-curriculum-coverage-2026-11-04 at 32e82c5. Source changes remain reviewable in the working tree; the normal Git index was preserved.
