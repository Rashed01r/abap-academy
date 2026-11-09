## Object-Oriented ABAP path: eight runnable class lessons (2026-11-09)

Implemented all eight OOP topics shown as Coming Soon, English only, as runnable code lessons (user's choice: "Runnable OOP code", built in two slices). Learners write real local classes that run in the browser; objects appear in memory as cards (`lcl_employee #1`) and reference variables point to them.

| Mission | Title | Challenge |
|---|---|---|
| `oop-classes-objects` | Classes: write the blueprint | `oop-class-blueprint`: write lcl_department (mv_code, mv_headcount, show) |
| `oop-objects` | Objects: create instances with NEW | `oop-two-objects`: two NEW, a reference copy, raise through it |
| `oop-attributes` | Attributes: per object or per class | `oop-static-total`: CLASS-DATA total via lcl_employee=>gv_total |
| `oop-instance-methods` | Methods: give objects behavior | `oop-salary-methods`: give_raise (IMPORTING) and get_salary (RETURNING) on a private salary |
| `oop-constructors` | Constructors: start every object ready | `oop-ctor-minimum`: constructor with a minimum salary of 1000 |
| `oop-inheritance` | Inheritance: reuse a class and extend it | `oop-manager-subclass`: lcl_manager, super->constructor, REDEFINITION with super->get_pay |
| `oop-interfaces` | Interfaces: one promise, many classes | `oop-contractor-interface`: lcl_contractor implementing lif_payable |
| `oop-exceptions` | Exceptions: refuse bad requests cleanly | `oop-leave-exception`: RAISE EXCEPTION NEW lcx_over_limit, RAISING, TRY … CATCH … INTO |

Each lesson has two syntax tokens, full code anatomy, two or three concepts, beginner ideas/mistakes/check, three experiments, a flowchart, a challenge brief and a quiz; 300 XP each. Prerequisites chain oop-introduction → classes-objects → objects → attributes → instance-methods → constructors → inheritance → interfaces → exceptions. Graders run the learner's program and the reference solution on the same probes (changed DATA inputs and literals) and require matching output plus the taught shape (for example a super call in the redefinition, a catch with INTO, exactly two NEW). Interpreter subset documented in SIMULATOR_SUPPORT.md (2026-11-09 and 2026-11-09 slice 2): local classes, visibility by owner (PRIVATE/PROTECTED/PUBLIC), DATA/CLASS-DATA of type i or string, instance METHODS with IMPORTING, RETURNING and RAISING, constructors, INHERITING FROM with REDEFINITION and super->, interfaces, TYPE REF TO, NEW, inline DATA( ), ->, =>, me->, RAISE EXCEPTION, TRY with several CATCH … INTO, error codes `nullref` and `unhandled`. Two SAP-accuracy points checked against the cheat sheets: a subclass constructor must call super->constructor even when the superclass declares none (enforced); for CX_STATIC_CHECK SAP only warns when an exception is neither caught nor declared, the simulator makes it an error on purpose and the lesson says so. The Learn runner labels objects, object references and static attributes. Files: `src/lib/oop-missions.ts`, engine changes in `src/lib/engine.ts`. Notes: `.claude/skills/academy-lesson/references/sap-notes/oop.md`. Mission IDs follow the reserved registry IDs; `oop-objects` is new. Visibility and static-vs-instance are taught inside these lessons, so `oop-visibility` and `oop-static-instance` stay PLANNED, as do `oop-redefinition` and `oop-polymorphism` (covered inside Inheritance).

Inventory: **48 playable activities / 47 registered missions / 59 assessments / 144 essential concepts / 12,055 XP** (48 activities, 144 concepts and 47/59 from the validators; XP = previous 9,655 + 8 x 300).

Verification: typecheck passed; `validate:education` (48 activities, 144 concepts) and `validate:curriculum` (47 missions, 59 assessments) passed; **161/161 unit tests** (11 in tests/oop.test.ts, now part of `npm test`; an earlier note that said 150/150 for slice 1 did not include tests/oop.test.ts because it was missing from the script); tests/roadmap.test.ts expects all eight lessons and no planned OOP topics. Lint: the only 3 errors are pre-existing in `docs/roadmap-redesign/AnimatedBackground.tsx` (not touched). Production build passed. tests/oop.spec.ts passed 22/22 (desktop and mobile). Full production browser regression: **not clean, and not caused by this work.** A full run reached 134/220 before I stopped it, with 14 failures, all in older specs that wait for roadmap UI (`Search the roadmap`, `Expand workspace`): addition-layout, guided, table-operations, education-quality, dictionary-labs, read-table, lesson-header, table-categories, roadmap. To check, those spec files were run against a clean checkout of HEAD without any OOP changes: **62 passed / 25 failed / 5 skipped (21.8m)**, failing in the same files, so they are pre-existing since the roadmap redesign commits (the previous checkpoint's 174/0 run predates it). They still need to be repaired separately. No OOP spec failed in any run, and a complete 220-test run on the final OOP code was not completed. Screenshots of the Learn runner and Explore trace inspected on desktop and mobile/dark for slice 1 and the inheritance, interfaces and exceptions lessons (no page overflow). Review records added by hand as `SOURCE_REVIEWED_WITH_LIMITATIONS`.

Known limits: no global classes, ABSTRACT/FINAL, CLASS-METHODS, EXPORTING/CHANGING, OPTIONAL/DEFAULT, casts, structured attributes, events, exception texts, RETRY/RESUME/CLEANUP; types are i and string only and the interpreter has no subtraction or multiplication. An empty object reference shows the label "text" in the Learn runner (cosmetic).

Next: the remaining visible Coming Soon paths are SAP Application Development (5), Modern ABAP (6), ABAP Cloud (6) and Real Projects (5). The full academy and the Employee Management cloud capstone remain unfinished.

### Working with Data path complete: performance and Employee Data Manager (2026-11-08)

Implemented the last two Working with Data missions, English only, following the user's standing instruction to keep the learning path easy (short examples, familiar data, one or two new ideas each):

- `data-table-performance` "Find rows with fewer checks" (prerequisite `data-table-expressions`, 25 min, 300 XP). 17-line example: 16 IDs stored newest first; a linear READ TABLE checks 16 rows, SORT then READ TABLE … BINARY SEARCH checks 5 (positions 9 → 5 → 3 → 2 → 1). Experiments show the unsorted-BINARY-SEARCH miss and that doubling the list adds one binary check. Challenge `data-performance-lookup` varies list size (0–32) and searched ID, including missing IDs, and requires a single ascending SORT before one BINARY SEARCH read.
- `data-employee-manager` "Build the Employee Data Manager" (prerequisite `data-table-performance`, 40 min, 400 XP), the path capstone. 44-line program using only taught statements: line_index( ), table-expression copy, MODIFY/DELETE … INDEX guarded by position > 0, LOOP count/total. Challenges `data-manager-raise` and `data-manager-report` are graded behaviorally on seven changed-data probes including missing and duplicate IDs. Separate from the guided cloud capstone `projects-employee-management`, which stays IN_PROGRESS.

Interpreter: `READ TABLE … WITH KEY … BINARY SEARCH` on standard tables (leftmost match; miss gives sy-subrc 4 with the insert position in sy-tabix, or 8 with lines + 1). Every key lookup now records `checked` (one-based positions examined) — a teaching count shown as "Rows checked" in the lookup panel and trace explanation, never a runtime. The READ TABLE lesson's practice sentence now points to the new lesson instead of saying BINARY SEARCH is unsupported (English only; Arabic text untouched), so its review fingerprint was refreshed. The Working with Data tree now has no Coming Soon topics.

Inventory: **28 playable activities / 27 registered missions / 39 assessments / 95 essential concepts / 6,615 XP**.

Verification: typecheck and lint passed; `validate:education` (28 activities, 95 concepts) and `validate:curriculum` (27 missions, 39 assessments) passed; **130/130 unit tests** (10 new in tests/table-performance.test.ts and tests/employee-manager.test.ts; tests/read-table.test.ts now also expects the new lookup fields). Production build passed. Full production browser regression, three workers: first run 134 passed / 6 failed / 24 skipped — all six were tests/work-areas.spec.ts assertions that still treated Internal table performance as a preview; they now assert the data path has no previews and use `dictionary-domains` as the planned deep link. Final full run: **140 passed / 0 failed / 24 skipped (4.4m)**; the skips are pre-existing intentional `test.skip` cases. New tests/data-capstone.spec.ts covers both lessons end to end (grading, quiz, once-only XP 300/400) and the empty preview list. Desktop/light and mobile/dark screenshots inspected, including the rows-checked panel (16 one by one, 5 by binary search). Review records added by hand as `SOURCE_REVIEWED_WITH_LIMITATIONS`.

Next: the ABAP Dictionary path, starting with **dictionary-domains**. The full academy and the Employee Management cloud capstone remain unfinished.

## Database Development path: six runnable ABAP SQL lessons (2026-11-08)

Implemented the six Database topics shown as Coming Soon, English only, as code lessons (user's choice: "Runnable ABAP SQL"). Learners write real modern ABAP SQL that runs in the browser against a demo database (ZACA_EMPLOYEE: Ahmed, Sara, Omar, Huda — the same data as the existing SQL lab; ZACA_DEPARTMENT: IT, HR, SALES, LEGAL without employees), reset on every run.

| Mission | Title | Challenge |
|---|---|---|
| `database-abap-sql` | ABAP SQL: read one row from the database | `database-single-read`: SELECT SINGLE by @lv_id, name + department or Not found |
| `database-select` | SELECT: read many rows into a table | `database-salary-list`: names and salaries, highest first, then sy-dbcnt |
| `database-where` | WHERE: read only the rows you need | `database-where-filter`: department AND minimum salary, No match on empty |
| `database-joins` | Joins: combine two tables | `database-join-report`: every department with its staff via LEFT OUTER JOIN |
| `database-aggregates` | Aggregations: count and total in the database | `database-department-summary`: COUNT(*) and MAX per department |
| `database-sql-mutations` | Change data with INSERT, UPDATE and DELETE | `database-raise`: UPDATE … SET … WHERE, sy-dbcnt, then SUM |

Each lesson has two syntax tokens, full code anatomy, two or three concepts, beginner ideas/mistakes/check, three verified experiments, a flowchart, a challenge brief and a quiz; 300 XP each. Prerequisites chain database-fundamentals → abap-sql → select → where → joins → aggregates → sql-mutations. Graders run the learner's program and the reference solution on the same probes (four databases, changed inputs, empty and single-row cases) and require matching output and final database state plus the taught statement shape. A new database panel (`src/components/sql-summary.tsx`) shows the tables with matched rows in the Learn runner and the Explore trace; `.add-side` now uses a shrinkable grid track so wide tables scroll inside their box on phones. Files: `src/lib/sql-missions.ts`; engine changes in `src/lib/engine.ts`. Notes: `.claude/skills/academy-lesson/references/sap-notes/abap-sql.md`.

Inventory: **40 playable activities / 39 registered missions / 51 assessments / 127 essential concepts / 9,655 XP**.

Verification: typecheck and lint passed; `validate:education` (40 activities, 127 concepts) and `validate:curriculum` (39 missions, 51 assessments) passed; **146/146 unit tests** (10 new in tests/abap-sql.test.ts covering every lesson's example/solution/grader, canned-output rejection, SAP sy-subrc/sy-dbcnt rules, joins, aggregates, mutations, seeding and rejected syntax). Production build passed. Full production browser regression, three workers, first run: **174 passed / 0 failed / 24 skipped (5.5m)**; skips are pre-existing intentional `test.skip` cases. New tests/abap-sql.spec.ts covers all six lessons end to end (anatomy, Learn, failing then passing challenge, quiz, XP), the live database panel, the @ diagnostic and the empty preview list. Desktop/light and mobile/dark screenshots inspected, including the runner's database table after UPDATE/DELETE. Review records added by hand as `SOURCE_REVIEWED_WITH_LIMITATIONS`.

Next: the remaining visible Coming Soon paths are Object-Oriented ABAP (8 topics), SAP Application Development (5), Modern ABAP (6), ABAP Cloud (6) and Real Projects (5). The full academy and the Employee Management cloud capstone remain unfinished.

## ABAP Dictionary path: six guided lessons (2026-11-08)

Implemented the six Dictionary topics shown as Coming Soon, English only, as guided lessons (user's choice: "Guided + small lab"), each with reference source explained part by part, an artifact map, three graded scenario decisions, a quiz, the beginner layer (ideas, mistakes, check, challenge) and one local hands-on lab:

| Mission | Title | Lab | XP |
|---|---|---|---|
| `dictionary-domains` | Domains: define a value's shape once | type/length/fixed values with a value tester; shows both data elements reusing the domain | 200 |
| `dictionary-data-elements` | Data elements: give a field its meaning | domain vs predefined type; four field labels checked against 10/20/40/55 | 200 |
| `dictionary-structures` | Structures: group fields into one type | include zaca_address, duplicate `city` error, `with suffix _home` fix | 200 |
| `dictionary-database-tables` | Database tables: store rows for good | choose key fields; see which of four rows a primary key refuses | 200 |
| `dictionary-foreign-keys` | Foreign keys: link a field to a check table | classic screen check rejects FIN; program write is accepted (no DB constraint) | 220 |
| `dictionary-search-helps` | Search helps: offer a list of valid values | F4 list with * restriction; only the EXPORT ID returns to the field | 220 |

Prerequisites chain intro → domains → data elements → structures → database tables → foreign keys → search helps. One running example links them (ZACA_STATUS_DOMAIN → ZACA_EMPLOYEE_STATUS → ZACA_ADDRESS → ZACA_EMPLOYEE → ZACA_DEPARTMENT → ZACA_SH_DEPARTMENT). Classic-only behavior is labelled with ABAP Cloud replacements (CDS enumerated types, CDS value helps). Facts come from the SAP-samples 26_ABAP_Dictionary cheat sheet, the DDIC DDL foreign key documentation and SAP Learning; notes in `.claude/skills/academy-lesson/references/sap-notes/dictionary.md`. Files: `src/lib/guided-dictionary-definitions.ts`, `src/lib/dictionary-education.ts`, `src/lib/dictionary-labs.ts`, `src/components/dictionary-labs.tsx`.

Inventory: **34 playable activities / 33 registered missions / 45 assessments / 113 essential concepts / 7,855 XP**.

Verification: typecheck and lint passed; `validate:education` (34 activities, 113 concepts) and `validate:curriculum` (33 missions, 45 assessments) passed; **136/136 unit tests** (6 new in tests/dictionary-labs.test.ts, including guided validation and full line coverage of every reference source). Production build passed. Full production browser regression, three workers: first run 154 passed / 2 failed / 24 skipped — the deep-link test still used `dictionary-domains` as a planned ID; it now uses `dictionary-lock-objects` and includes the new lessons. Final full run: **156 passed / 0 failed / 24 skipped (4.5m)**; skips are pre-existing intentional `test.skip` cases. tests/guided.spec.ts runs the full guided journey (reference parts, artifact map, failing then passing decisions, completion, persistence, no overflow) for all six on desktop and mobile; new tests/dictionary-labs.spec.ts drives every lab and checks the Dictionary tree has no previews (one Chrome "Target crashed" during development passed unchanged on retry). Desktop/light and mobile/dark screenshots inspected. Review records added by hand as `SOURCE_REVIEWED_WITH_LIMITATIONS`.

Next: the remaining planned Dictionary records (primary keys, relationships, settings and activation, views, Employee Data Model, transports, lock objects, number ranges) are not shown in the tree; the next visible Coming Soon topics are in the Database Development path. The full academy and the Employee Management cloud capstone remain unfinished.

## Table expressions mission (2026-11-08)

Implemented `data-table-expressions` ("Read rows with table expressions", recommended prerequisite `data-conditional-loop`, 30 min, 300 XP), English only. New interpreter subset (see SIMULATOR_SUPPORT.md): `itab[ position ]`, `itab[ comp = value … ]`, one `-component`, `line_exists( )` in IF/ELSEIF (also NOT), `line_index( )`, `VALUE #( itab[ … ] OPTIONAL | DEFAULT … )`, and `TRY … CATCH cx_sy_itab_line_not_found … ENDTRY`; an uncaught miss is the new runtime error code `notfound`. Table expressions never change sy-subrc/sy-tabix. Lesson: 10-group anatomy, two tokens, four concepts, beginner layer (ideas, mistakes, experiments), expression-aware lookup panel, trace with try/catch steps, flowchart, and the `data-expression-lookup` challenge graded on six changed-data probes including missing IDs (rejects canned output, position reads, hard-coded positions, OPTIONAL instead of TRY, READ TABLE and data loss). Facts were checked against the SAP-samples internal-tables cheat sheet and Clean ABAP; research is stored in `.claude/skills/academy-lesson/references/sap-notes/internal-tables.md`. A new project skill, `.claude/skills/academy-lesson`, records the authoring workflow, file checklist, style and sources for future lessons.

Inventory: **26 playable activities / 25 registered missions / 36 assessments / 87 essential concepts / 5,915 XP**. Arabic error/trace entries for the new keys are intentionally absent and fall back to English via `errorMessage` / merged trace titles; no Arabic was authored.

Verification: standalone typecheck and lint passed; `validate:education` (26 activities, 87 concepts) and `validate:curriculum` (25 missions, 36 assessments) passed; **120/120 unit tests** (9 new in tests/table-expressions.test.ts). Production build passed. Full production browser regression, three workers: first run 128 passed / 6 failed / 24 skipped. The six failures were two obsolete work-areas assertions that still expected Table expressions to be a preview; they were updated to the next preview (Internal table performance) and to include the new deep link. The second full run gave **132 passed / 2 failed / 24 skipped (4.2m)**; the two Conditions failures passed unchanged with one worker (3/3, 11.2s) and passed in the first full run, so they are treated as concurrency flakes. The 24 skips are pre-existing intentional `test.skip` cases. New tests/table-expressions.spec.ts passed 4/4 (desktop and mobile). Desktop/light and mobile/dark screenshots of Learn, Explore code and Challenge were inspected (build/table-expressions, ignored); no page overflow. Note: scripts/review-visual-classroom.mjs times out on existing lessons too (waits for `[data-primary-diagram]`, which English Learn no longer renders); it needs updating separately. The source review record was added by hand for this lesson (`SOURCE_REVIEWED_WITH_LIMITATIONS`), not certified.

Next mission: **data-table-performance**, then **data-employee-manager**. The full academy and Employee Management capstone remain unfinished.

 Curriculum and milestone sequence

## English-only phase and conditional LOOP checkpoint (2026-11-07)

Current development language: **English only**. Arabic is temporarily deferred and all resources are preserved. Active validators require English; no Arabic generation, editorial work or UI checks are required. This checkpoint supersedes the historical bilingual requirements and next-mission instructions below.

Implemented `data-conditional-loop` (recommended prerequisite `data-sorting-filtering`), its real one-comparison LOOP WHERE simulation, full English anatomy/Syntax Lab, shared trace/flowchart and `data-conditional-report` assessment. Current inventory: **25 playable activities, 24 registered missions, 35 assessments (26 code + 9 guided), 5,615 XP, 100 planned records**. Verification complete: production build, standalone lint/typecheck, education/curriculum validation, **111/111 unit tests** and **140/140 full production browser tests (4.5m, three workers)** passed. Desktop/light and mobile/dark screenshots were inspected; architecture endpoint geometry passed 6/6. No tests were skipped. The new mission is technically VERIFIED; independent learner certification remains separate.

Next mission: **data-table-expressions**, then **data-table-performance**, then **data-employee-manager**. The full academy and Employee Management capstone remain unfinished. Follow [the phase policy](LANGUAGE_PHASE.md); preserve all existing learner records, IDs and drafts.


> **Current development language: English only (2026-11-07).** Arabic support is temporarily deferred, not removed. Preserve all existing Arabic resources and RTL support; do not create or review Arabic translations or run Arabic-specific UI checks while `ENABLE_ARABIC` is false. New playable content requires complete English teaching only. This policy supersedes bilingual authoring/review requirements in the historical sections below. See [the language-phase policy](LANGUAGE_PHASE.md).


## Historical execution checkpoint — 2026-11-04

Current checkpoint: **2026-11-04, introductory coverage across all nine paths plus three Data missions**. The latest full-curriculum request explicitly prioritizes Pass A across unavailable paths before Pass B in curriculum order; it supersedes the earlier instruction to finish Data before touching Paths 3–9. Pass A introductory coverage is implemented. Pass B resumed with data-read-table, data-table-mutations and data-sorting-filtering. The complete academy remains unfinished.

Registry totals: **9 paths, 9 with playable content, 1 fully verified path (Fundamentals), 24 playable activities (23 registered missions plus orientation), 23 verified topics/activities and 1 tested guided project foundation whose full capstone remains IN_PROGRESS**. There are **101 PLANNED/Coming Soon records**, plus that unfinished project. Twelve requested topics missing from the previous planning table were explicitly added; do not compare the remaining count with the old 99 without accounting for these additions. Current assessments: **34 (25 code + 9 guided)**; available XP: **5,315**. Anatomy: **149 groups / 98 matching descriptions across 24 labs**. Stable IDs, progress version 2, prior achievements, once-only XP, drafts and independent panel-layout storage remain intact.

The user's latest two-pass sequence takes precedence: introductory playable coverage across unavailable paths first, then complete every topic/project in order. Introductory coverage has been added across all nine paths; continue Pass B at data-conditional-loop. Completing an introductory lesson is not completion of its path or of the full capstone. The updated milestone table below counts the twelve explicitly added planned records.

Remaining explicit additions: Data performance; Dictionary transports, lock objects and number ranges; Database SELECT SINGLE, GROUP BY and transactions; Modern ABAP SQL and CDS annotations; Cloud Clean Core, determinations and actions. Existing combined records retain INNER/LEFT OUTER joins, static attributes/methods, object references, breakpoints, key/index access and technical settings/activation.

**Exact next mission: data-conditional-loop.** Preserve its stable ID and recommended prerequisite data-sorting-filtering. Teach conditional row processing in depth, decide and document the supported LOOP WHERE subset before claiming it, distinguish selection from deletion, and grade changed rows/thresholds and empty results. Then continue data-table-expressions, data-table-performance and data-employee-manager, followed by Dictionary domains and remaining paths in sequence. Introductory availability does not finish an advanced path.

The project foundation is projects-employee-management, titled Employee management: guided project design. Its browser lesson/decisions are tested; its overall capstone stays IN_PROGRESS. Missing SAP work includes behavior handlers/validations, DCL/authorization implementation, locking/concurrency, a consumer UI, activation/deployment and actual end-to-end acceptance evidence. Do not promote the complete project based on this guided design activity. On expansion, preserve this foundation achievement and XP; introduce independent stage/final assessment IDs and explicit aggregate project status. Never interpret its existing foundation completion as evidence that future capstone stages passed, including during legacy progress normalization.

Relevant extension points: src/lib/engine.ts, data-missions.ts, anatomy-content.ts and new mission modules; guided-types.ts/guided-curriculum.ts and the three guided definition files for advanced lessons; ConnectedLesson and the shared visualizers. No half-written source file or known application blocker remains. Dictionary/SQL introductory coveredTopics intentionally leave dedicated planned topic previews visible. Independent lesson examples are not a shared SAP object activation sequence.

## Current milestone table and historical delivery notes

All nine paths below are required by the full-platform request. Only registered, functional missions are playable. A topic list is planning, not implemented educational content.

| Milestone | Path ID | Target | Status at checkpoint |
| --- | --- | --- | --- |
| 1 | fundamentals | Orientation + Missions 01–09 | VERIFIED: all 10 activities; 1,995 XP |
| 2 | data | 11 missions | IN_PROGRESS: 7 VERIFIED; 4 planned |
| 3 | dictionary | 15 missions | IN_PROGRESS: introduction VERIFIED; 14 planned |
| 4 | database | 15 missions | IN_PROGRESS: fundamentals VERIFIED; 14 planned |
| 5 | oop | 13 missions | IN_PROGRESS: introduction VERIFIED; 12 planned |
| 6 | applications | 14 missions | IN_PROGRESS: reports VERIFIED; 13 planned |
| 7 | modern | 19 missions | IN_PROGRESS: syntax introduction VERIFIED; 18 planned |
| 8 | cloud | 21 missions | IN_PROGRESS: introduction VERIFIED; 20 planned |
| 9 | projects | 7 projects | IN_PROGRESS: tested employee design foundation; 6 planned projects; full employee capstone unfinished |
| 10 | all | Complete platform regression | PLANNED |

Fundamentals sequence: syntax orientation; variables/addition; structures; IF/ELSE/ELSEIF; DO/TIMES/sy-index; WHILE/termination; standard internal tables/APPEND; LOOP AT/work areas; EXIT/CONTINUE; Employee Records Processor. Mission 09 combines prior concepts through implementation checkpoints and assessment.

Working with Data: internal tables in depth; standard/sorted/hashed tables; keys/uniqueness; work areas/field symbols; READ TABLE/key lookup; MODIFY/DELETE/INSERT/APPEND; sorting/filtering; conditional LOOP AT; modern expressions/appropriate exception handling; Employee Data Manager. Required interactions include row changes, key/index comparisons, sorting and references. Do not imply conceptual hashing diagrams reproduce SAP internals.

Dictionary: introduction; domains; data elements; structures; database tables; primary keys; foreign keys; relationships; search helps; settings/activation; traditional views and modern context; Employee Data Model. Build a browser educational designer connecting domain → data element → field, with guided SAP GUI/ADT steps distinguished from real object activation.

Database: fundamentals; ABAP SQL introduction; SELECT; WHERE; ORDER BY; aggregates; joins; @ host variables; multiple records; SQL INSERT/UPDATE/MODIFY/DELETE; performance; Sales Order Data Analysis. Seed employees/departments/customers/order headers/items. Grade results or structured semantics rather than keywords. Clearly label the deterministic sample-data environment.

OOP: introduction; classes/objects; attributes; instance methods; constructors; visibility; static/instance; inheritance; redefinition; interfaces; polymorphism; exceptions; Employee Management Classes. Use limited verified execution or explicit guided diagrams and semantic assessments; visualize objects and call effects.

Applications: classical reports; selection screens; parameters/select-options; report events; ALV concepts; traditional ALV; screen programming; Module Pool; PBO/PAI; transactions; Smart Forms/Adobe Forms; debugging; enhancements; Employee Report. Mark real SAP environment requirements and use original instructional diagrams.

Modern: syntax; inline declarations; constructor expressions; VALUE; NEW; COND; SWITCH; CORRESPONDING; table expressions; functional expressions; CDS fundamentals; associations; DCL; AMDP; code-to-data; performance; Analytical Sales Data Model. Explain version support and compare valid classic and modern options without claiming classic syntax is inherently obsolete.

Cloud: introduction; restrictions/released APIs; ADT; CDS view entities; RAP architecture; business objects; behavior definitions; managed implementation; unmanaged concepts; behavior implementation; EML; service definitions; service bindings; OData V4; authorization/validation; draft; BTP ABAP; RAP Leave Request Application. Verify technical details against official SAP references. Guided browser activities cannot activate or deploy RAP.

Projects: Employee Management; Leave Management; Sales Order Processing; Inventory Management; SAP Data Reporting; SAP API Integration; RAP Business Application. Every project needs business problem, objectives, prerequisites, architecture, stages, labs, guided coding, checkpoints, debugging and final assessment. Identify external SAP access requirements per stage. Inventory Management was explicitly added to the tracking scope in the latest request; it is PLANNED, not playable and awards no XP.

Each mission must include problem, syntax lab, appropriate visualization, guided practice, independent challenge, useful feedback and gated completion/once-only XP. Future planned mission IDs are provisional until registered; do not create references to invented playable routes.

Free exploration is the default: prerequisites describe recommended knowledge, never access rules. Every new registered lesson is immediately available without earlier completions. Syntax Labs are optional preparation, with independent completion records. Assessment gates protect achievement/XP only; they must never prevent leaving, reading explanations, switching stages, reviewing examples or attempting another challenge. Data category comparisons are guided conceptual models; only supported standard-table code executes locally.

Visual Code Anatomy is the default teaching format for every implemented Syntax Lab: whole operations first, optional keyword/punctuation detail second. The Structure reference has six groups: header, fields, end, create record, assign values, output. Other labs group setup, business actions, control flow and results. Matching descriptions to sections checks understanding; clicking all sections does not complete a lab. New Data/DDIC/SQL/OO/CDS/RAP lessons must supply reviewed bilingual groups and appropriate specialized visuals before registration, without claiming unsupported browser execution.

2026-11-03: data-keys is VERIFIED. The new key-policy explorer teaches composite equality, non-key name changes, uniqueness, empty keys and before/after acceptance without claiming sorted/hashed execution. A required identity-design/prediction activity and behavior-graded LOOP/IF import-inspection challenge complement ten anatomy groups and four matching prompts. Total playable activities: 13; mission assessments: 22; available XP: 2,715. Fundamentals is complete; Data is 3/10 verified; later paths remain PLANNED with 99 future missions/projects overall. Next stable mission: data-work-areas-field-symbols. See IMPLEMENTATION_PROGRESS.md for the 51 unit / 76 production-browser checks and bilingual visual review.

Latest batch supersedes those totals: data-work-areas-field-symbols is VERIFIED as the fourth Data mission, with a work-area coding challenge and a typed alias coding challenge, bilingual anatomy and live relation/target snapshots. Totals are now 14 playable activities, 24 assessments and 2,995 XP. Six Data missions remain, followed by the seven later paths. The latest request explicitly adds Inventory Management to the tracked projects, so 99 future missions/projects remain PLANNED. Next: data-read-table, including safe found/not-found lookup and meaningful assessment. See IMPLEMENTATION_PROGRESS.md for 62 unit tests, 86 full browser cases, final diagnostic/responsive checks and actual route details.
