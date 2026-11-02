# Issues and scope boundaries

Updated 2026-11-02.

1. The complete nine-path academy remains unfinished. Milestone 1 is VERIFIED. Path 2 has two VERIFIED missions; 100 future missions/projects remain PLANNED. OOP and Cloud/RAP currently contain previews only. Free navigation must not imply those lessons are implemented.
2. No real SAP backend is connected. Never claim compilation, activation, deployment or real database execution for browser-only exercises.
3. Milestone 1 quality checks passed as recorded in IMPLEMENTATION_PROGRESS.md. Future milestones require their own evidence; the Fundamentals results cannot establish advanced-path quality.
4. General table editing/search, SQL, OO, modern expressions, CDS and RAP require later milestones. Reject unsupported source rather than silently guessing behavior.
5. Local progress is device/browser storage. Version 2 preserves legacy completions, labs and historical results without prerequisite filtering. Preserve storage keys and recommended sequence metadata; never reset users or restore mandatory prerequisite access rules.
6. English/Arabic learner journeys are automated; professional Arabic review also requires reading rendered explanations. Machine completeness checks alone do not satisfy that requirement.
7. Resolved during milestone QA: roadmap cards accepted clicks before persisted progress finished hydrating, so a returning learner could open a stale locked preview. The integration patch gates roadmap interaction on readiness; browser tests explicitly wait for restored XP before beginning the journey.

2026-11-02 resolved: prerequisite access locks and prerequisite-dependent completion normalization were removed. Implemented cards have available/in-progress/completed icons; preview topics show Coming Soon. Version 2 migration preserves out-of-order legacy achievements and does not fabricate skipped lab completion. Explicit filter labels resolve accessible-name ambiguity. The existing localhost:3000 dev server showed stale CSS during this session; final browser/visual verification uses a fresh production server at localhost:3004. Restart that dev server if it still serves old styles.
