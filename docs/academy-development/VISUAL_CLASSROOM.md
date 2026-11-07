# Visual classroom redesign — 2026-11-05

> **Current development language: English only (2026-11-07).** Arabic support is temporarily deferred, not removed. Preserve all existing Arabic resources and RTL support; do not create or review Arabic translations or run Arabic-specific UI checks while `ENABLE_ARABIC` is false. New playable content requires complete English teaching only. This policy supersedes bilingual authoring/review requirements in the historical sections below. See [the language-phase policy](LANGUAGE_PHASE.md).


The latest request changes the presentation standard to **SEE → UNDERSTAND → EXPLORE → READ THE CODE → PRACTICE**. This supersedes treating more prose, selectors or collapsed examples as a sufficient visual improvement.

## Safety and scope

Before changes, saved every tracked/untracked nonignored working file in Git branch `checkpoint/before-visual-classroom-2026-11-05`, commit `a8b8934f38b2eaa4a15010748778c1f877dc3d7b`, using an isolated index. The normal staging area and existing uncommitted educational-quality work were preserved. Installed Next.js client-component and CSS guides were read.

Inspected all 24 implemented activities, the nine-path registry, Learn rendering, anatomy, existing visualizers, challenges, both locales, themes, resizable panel and tests. Existing primary views began with concept selectors/text; most useful state models were deeper in the lesson or another tab. The two named lessons had no complete visible employee-row comparison. Existing diagram-like lists lacked actual connected paths. This batch redesigns the primary Learn presentation of all 24 activities; the 101 planned records are excluded.

## Implemented presentation inventory

All routes use `http://localhost:3025/?mission=<ID>` and remain freely accessible.

| Lesson ID | Primary teaching illustration | Interaction and code connection |
|---|---|---|
| orientation | Instruction/output state | Follow the actual single-instruction trace; restart selects its code group |
| addition | Named memory boxes, before/after | Step assignment/addition/output; click a memory name to select source |
| structures | Grouped record fields, before/after | Step actual field changes and link record labels to anatomy |
| conditions | Decision diamond with true/false branches | Select graph nodes or trace steps; skipped source is explicitly identified |
| do | Counted-loop flowchart and real counter state | Repeat/back edge, body, next pass, finish; trace-backed state |
| while | Pre-test loop flowchart | True enters body; false exits; state follows actual supported execution |
| tables | Saved-row table, before/after | APPEND shows new independent rows |
| loop-at | Row iteration flowchart and selected table row | Step INTO copies and accumulation using real trace snapshots |
| loop-control | Loop flow with continue/back and exit shortcut | Actual CONTINUE trace; existing EXIT alternative anatomy/trace retained |
| employees | Employee rows and eligible salary state | Step real condition, accumulator and report output |
| data-table-model | Work area and saved row pictures | APPEND copies and later independent edits are visible |
| data-table-categories | Three simultaneous employee organizations | Insert a duplicate, toggle sorted uniqueness, look up present/missing keys; selected category updates reference anatomy |
| data-keys | Structured employee identities and matching state | Trace compares both key fields and counts matching rows |
| data-work-areas-field-symbols | Original row versus separate copy or assigned access | Edit a non-key name; observe copy/original differences, explicit MODIFY and connected INTO/ASSIGNING reference anatomy |
| data-read-table | Before/after lookup, matching row | Select READ event and actual found/not-found result state |
| data-table-mutations | Table rows before/after indexed changes | Step INSERT, MODIFY, DELETE with real saved rows |
| data-sorting-filtering | Whole-row order before/after | Start at SORT, then trace retained rows and selected output |
| dictionary-introduction | Connected domain/element/structure/table graph | Select nodes/relationships to highlight the related field/source context |
| database-fundamentals | Complete source → projection/filter → result | Tables appear before controls; changing columns/source/filter changes real local fixture results and selects related code |
| oop-introduction | Class blueprint → two instances and owned/shared storage | Create-path diagram; DATA/CLASS-DATA and method changes connect to reference groups |
| applications-reports | Validation and event flow with directed branches | Accepted/rejected/runtime-error paths; code selection by event responsibility |
| modern-syntax | VALUE replacement and lookup/exception flow | Choose present/missing IDs, observe row/template or CATCH and select reference source |
| cloud-introduction | Connected development and service artifacts | Select package/API/CDS/behavior/service/binding/consumer responsibilities and their reference context |
| projects-employee-management | Connected business/design/acceptance artifacts | Follow requirements through persistence, behavior, projection, exposure and acceptance; capstone remains unfinished |

## Shared implementation

- `VisualClassroom` places a short introduction and a real primary illustration before concept-reference prose. `visual-presentations.ts` explicitly assigns an appropriate family to every implemented activity; a missing entry fails educational validation.
- `EducationalFlowchart` provides real SVG start/process/decision nodes, arrowheads, labeled branches and selected paths. Small panels reflow nodes vertically without shrinking labels; branch/skip edges route around intermediate nodes. Existing object/report models now use these connected illustrations too.
- `TraceClassroom` renders actual immutable interpreter snapshots, record fields, saved rows, selected rows, memory changes and output. Its source annotation is visible. Unexecuted source groups are marked as such rather than inventing events.
- `TableCategoryClassroom` and `RowAccessClassroom` are controlled, tested employee models with linked bilingual reference anatomy. All essential comparison code is visible. Existing executable exercises remain, explicitly labeled as the browser subset.
- `ArchitectureClassroom` uses measured HTML nodes and real SVG connections, adapting to panel size. `ExpressionClassroom` explains replacement and the missing-row exception using the lesson's Pen/Book fixture. The existing SQL lab was reordered rather than duplicated.
- `VisualCodeAnatomy` and `SyntaxLab` accept controlled selection callbacks. Selecting a trace/memory/artifact can select its source group; selecting primary source can select a trace event or mapped artifact. Reference comparisons also connect code selection to lookup/edit stages.
- Essential example and quick-check content is visible; optional syntax/deeper references remain collapsible. Scoped typography/spacing prevents app-header styling from turning lesson introductions into a large navigation layout. Three category models sit side by side when space permits; row relationships and comparisons stack in narrow panels.

No mission ID, assessment ID, XP amount, progress schema, draft key, tree route or access restriction was changed. No new package dependency or generated decorative image was added.

## Technical boundaries

The 15 trace-based scenes use the existing interpreter. The other nine presentations use clearly labeled conceptual fixtures/reference material. In particular, **LOOP AT … ASSIGNING is taught accurately in a controlled row model and reference source, but is not added to the general browser interpreter**. The existing executable alias lesson still uses direct ASSIGN to a work area. Sorted/hashed table execution is likewise conceptual here. Neither model claims SAP memory addresses, hash buckets, timings, activation or backend execution.

Category examples use ID as a non-unique standard-table primary key, a configurable sorted primary key or a required unique hashed primary key. Work-area examples use an empty-key standard table, so its ID is labeled simply ID. Only the non-key name is editable. A first-match read highlights one matching row. The sorted model follows the documented **single-row INSERT** rule: a new duplicate is inserted before existing equal-key rows, so its first ID-30 match becomes Omar rather than Ahmed. This differs from stable SORT and from block insertion; the source and diagram use the single-row form consistently. See SAP's [duplicate non-unique key ordering](https://help.sap.com/docs/abap-cloud/abap-keyword/itab-duplicate-non-unique-keys?locale=en-US).

Verified changed semantics against official SAP [field-symbol row processing](https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/using-field-symbols-to-process-internal-tables_f1855f41-00d3-4f8d-9a2c-663a321c6637), [sorted/hashed table operations](https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/working-with-sorted-and-hashed-tables_de84be91-c7db-4166-95cf-2b036c8d5558) and [table key categories](https://help.sap.com/docs/abap-cloud/abap-concepts/distinguishing-table-keys-in-internal-tables). No SAP compilation or screen-reader certification was performed.

## Verification ledger

- `npm.cmd run build`, `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run validate:curriculum` and `npm.cmd run validate:education` passed. Unit suite: **100/100**, including duplicate ordering, unique rejection, first-match lookup, copy/write-back/alias behavior and all comparison anatomy variants.
- Full production browser regression: **196/196 passed in 6.2 minutes**, using `PLAYWRIGHT_BASE_URL=http://localhost:3025` and `npm.cmd run test:e2e -- --workers=2`. Earlier exploratory run: 188/196; all eight failures were Work Areas selectors made ambiguous by the added input/anatomy. Scoped selectors retained the original editor, grading and persistence assertions; no tests were disabled.
- After the sorted single-row INSERT correction and small RTL isolation changes, rebuilt production passed **26/26 in 58.6 seconds** (`tests/visual-classroom.spec.ts tests/work-areas.spec.ts`). A subsequent Arabic edge-label alignment correction received another successful production build/lint and **16/16 final visual-classroom acceptance cases in 38.9 seconds** (`tests/visual-classroom.spec.ts`). The full 196-case suite was not repeated after these scoped corrections. No application source changed after final acceptance.
- Browser coverage exercises all 24 activities through the real tree in English/Arabic, light/dark and desktop/mobile; visible primary scenes, source selection, scene controls, Learn/Visualize/Challenge and no unintended progress rewards. Reference comparisons test duplicate insertion, uniqueness, missing/present lookup, name editing, explicit MODIFY, aliasing, source selection and tab persistence. Retained regression covers Monaco drafts, layout, assessments and once-only XP.
- `node scripts/check-classroom-geometry.mjs`: **6/6** architecture scenes passed transformed SVG-to-HTML endpoint checks (three topics, desktop English/mobile Arabic).
- Captured 52 representative first-view/diagram PNGs for 13 topics across all nine paths using `node scripts/review-visual-classroom.mjs`; refreshed affected diagrams after final corrections. Actually inspected English/Arabic category and row-access comparisons, addition/structure state, DO/WHILE flows, Dictionary/cloud/project connectors, SQL source/results, object blueprint, report paths and modern expressions. Corrected inherited header spacing, connector anchors, narrow SVG scaling and Arabic label direction/alignment found during review. Images are local ignored artifacts under `build/visual-classroom/`; captures are not a claim of independent learner or screen-reader certification.

## Remaining work

All 24 implemented activities received this primary-presentation batch; no implemented lesson remains untouched by it. This does not certify complete educational mastery or make the 101 planned records implemented. Next quality batch: strengthen transfer/prediction tasks for static-versus-instance ownership, RAP layer responsibilities and abnormal report flow, followed by independent learner/Arabic and assistive-technology review. General interpreter support for LOOP ASSIGNING and sorted/hashed declarations remains future work; current models explicitly show their reference boundary. When curriculum expansion resumes, the next planned mission remains `data-conditional-loop`. Preserve the project foundation achievement independently of later capstone implementation stages.
