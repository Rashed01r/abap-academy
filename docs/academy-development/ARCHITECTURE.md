# Academy architecture

Checkpoint: 2026-10-31. This directory is the continuation record for the full-platform request. Inspect the repository before trusting implementation status.

The existing Next.js App Router application is preserved. `src/app/page.tsx` coordinates learner selection, locale, appearance and local progress. `src/components/roadmap.tsx` renders the connected roadmap; `mission-engine.tsx` owns the learning stages; `syntax-lab.tsx` owns token exploration and questions. `learning-workspace.tsx` connects the Monaco editor, diagnostics, execution trace, memory and output. `code-editor.tsx` keeps editor selection independent from the execution decoration.

`src/lib/curriculum.ts` is the public mission/path registry. Mission content is declarative, bilingual and separate from UI. Reuse the existing mission stages for executable lessons; add a specialized interaction model for DDIC, SQL, objects and RAP where necessary. Do not represent guided artifact exercises as SAP execution.

`src/lib/engine.ts` tokenizes and parses a deliberately restricted ABAP subset, validates declarations/types, executes structured nodes and grades challenges against observable behavior. Source ranges connect execution to Monaco. Trace snapshots support previous/next/restart without executing learner code as JavaScript. `diagnostics.ts` supplies corrective advice; `i18n.ts` supplies UI/error/execution text; `glossary.ts` supplies terminology.

Progress is stored in `abap2-master-progress`; language and appearance use `abap2-language` and `abap2-appearance`. `progress.ts` normalizes known mission IDs, prerequisite completion and results, and derives XP from completed missions. Preserve these IDs and values. If the storage shape changes, introduce a versioned migration instead of clearing storage.

Tests: `engine.test.ts` covers the preserved runtime; `fundamentals.test.ts` covers loops, tables, grading and migration. Playwright tests cover hydration, existing learner journeys and Missions 04–09. Read installed `node_modules/next/dist/docs/` before changing Next.js APIs.
