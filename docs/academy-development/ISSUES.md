# Issues and scope boundaries

Updated 2026-10-31.

1. The complete nine-path academy remains unfinished. Milestone 1 is VERIFIED; paths 2–9 remain previews with 102 planned missions/projects until real lessons and their required specialized interactions are implemented and verified.
2. No real SAP backend is connected. Never claim compilation, activation, deployment or real database execution for browser-only exercises.
3. Milestone 1 quality checks passed as recorded in IMPLEMENTATION_PROGRESS.md. Future milestones require their own evidence; the Fundamentals results cannot establish advanced-path quality.
4. General table editing/search, SQL, OO, modern expressions, CDS and RAP require later milestones. Reject unsupported source rather than silently guessing behavior.
5. Local progress is device/browser storage. Preserve existing keys, mission IDs, prerequisite order and historical results; do not reset users to enable a new curriculum.
6. English/Arabic learner journeys are automated; professional Arabic review also requires reading rendered explanations. Machine completeness checks alone do not satisfy that requirement.
7. Resolved during milestone QA: roadmap cards accepted clicks before persisted progress finished hydrating, so a returning learner could open a stale locked preview. The integration patch gates roadmap interaction on readiness; browser tests explicitly wait for restored XP before beginning the journey.
