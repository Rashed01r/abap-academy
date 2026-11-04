# Continue ABAP Academy development

Latest change: **Knowledge Tree is the only learning interface (2026-11-04)**. The List view button, legacy roadmap, staged lesson renderer and old homepage were removed at the user's request. Old list URLs now resolve to the tree, preserving valid mission selections and other query parameters. Progress, XP, drafts, resizable panels and playground remain. Browser checks now exercise Learn / Visualize / Challenge instead of the removed interface. Safety checkpoint: checkpoint/before-tree-only-2026-11-04 at 7531fb9. Preview: http://localhost:3016/. Next curriculum mission remains data-read-table.

Verification: build/typecheck/lint, 62 unit tests and curriculum validation passed. Full browser run passed 119/120; one subpixel geometry assertion was corrected to measure rendered pixels, then all 26 tree cases passed on rerun. No cases were skipped or disabled. See KNOWLEDGE_TREE.md for exact results; no known application blocker remains.

Latest enhancement: **Smart Resizable Learning Workspace (2026-11-04)**. Preview: http://localhost:3016/?mission=orientation. Direct edge/corner and keyboard resizing replace the width slider. Header controls expand/restore/reset/collapse; versioned layout preferences preserve custom size. Mobile stays focused, Arabic mirrors handles, lesson text stays readable during graph zoom, and Monaco remains mounted. Read docs/academy-development/RESIZABLE_WORKSPACE.md for implementation and exact verification. Checkpoint: checkpoint/before-resizable-workspace-2026-11-04 at 6ba693a. No curriculum mission was added; data-read-table remains next.

Verified on the resizable production build: build/lint/typecheck, 62 unit tests, curriculum validation, **118/118 full browser cases in 3.0 minutes**, and scoped bilingual desktop/mobile/tablet visual review. No skips/failures or known blocker. Preserve the layout preference key, measured connections, counter-zoom and editor state during future work.

Latest workspace refinement (2026-11-04): the integrated header, header search and glossary now sit above a viewport-filling canvas. Preview: http://localhost:3015/?mission=orientation. Topic return restores tabs, anatomy, simulation and assessment state; changing language preserves mobile tree exploration. Read the current verification record in docs/academy-development/KNOWLEDGE_TREE.md before continuing. The redesign request takes precedence for this session; no curriculum mission was added. Next curriculum mission remains data-read-table.

Verified: build/typecheck/lint, 62 unit tests, curriculum validation, 110 full browser cases, then 24 final-build tree cases after the last search-scroll fix. Bilingual tablet smoke checks and desktop/mobile/tablet visual review passed. Exact commands and limits are in the feature checkpoint.

Earlier interface batch: the connected horizontal knowledge tree became the default. Start with ABAP Fundamentals → Syntax Orientation or /?mission=orientation. Learn / Visualize / Challenge continue the selected topic. The former alternate list interface has since been removed. Read the canonical notes and docs/academy-development/KNOWLEDGE_TREE.md for implementation and verification. No curriculum mission was added; data-read-table remains next.

Read [the canonical checkpoint](docs/academy-development/NEXT_STEPS.md) and [implementation progress](docs/academy-development/IMPLEMENTATION_PROGRESS.md), then inspect actual repository state.

Latest verified batch: **data-work-areas-field-symbols**. It provides bilingual work-area teaching, real typed FIELD-SYMBOLS/ASSIGN/UNASSIGN execution, ten anatomy groups, a live alias diagram and two behavior-graded coding challenges. Work areas and Field symbols no longer appear as duplicate Coming Soon topics.

Next curriculum task: **data-read-table**. Add safe found/not-found lookup with typed semantics, meaningful assessment and trace row highlighting. Preserve free exploration, version 2 progress and once-only XP. Current totals: 14 playable activities, 24 assessments, 2,995 XP; Fundamentals complete; Data 4/10 verified. 99 future missions/projects remain planned, including the Inventory Management capstone newly added to the latest request's tracking scope.

Preview: http://localhost:3008/?mission=data-work-areas-field-symbols (the existing root route with a validated mission query).
