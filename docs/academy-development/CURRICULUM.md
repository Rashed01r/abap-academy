# Curriculum and milestone sequence

All nine paths below are required by the full-platform request. Only registered, functional missions are playable. A topic list is planning, not implemented educational content.

| Milestone | Path ID | Target | Status at checkpoint |
| --- | --- | --- | --- |
| 1 | fundamentals | Orientation + Missions 01–09 | VERIFIED: all 10 activities; 1,995 XP |
| 2 | data | 10 missions | IN_PROGRESS: first four missions VERIFIED; 6 planned |
| 3 | dictionary | 12 missions | PLANNED |
| 4 | database | 12 missions | PLANNED |
| 5 | oop | 13 missions | PLANNED |
| 6 | applications | 14 missions | PLANNED |
| 7 | modern | 17 missions | PLANNED |
| 8 | cloud | 18 missions | PLANNED |
| 9 | projects | 7 projects | PLANNED |
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
