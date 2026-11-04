# Curriculum and milestone sequence

## Authoritative execution checkpoint — 2026-11-04

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
