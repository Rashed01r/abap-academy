# Mission registry checkpoint

## Current registry status — 2026-11-04

Current checkpoint: **2026-11-04, introductory coverage across all nine paths plus three Data missions**. The latest full-curriculum request explicitly prioritizes Pass A across unavailable paths before Pass B in curriculum order; it supersedes the earlier instruction to finish Data before touching Paths 3–9. Pass A introductory coverage is implemented. Pass B resumed with data-read-table, data-table-mutations and data-sorting-filtering. The complete academy remains unfinished.

Registry totals: **9 paths, 9 with playable content, 1 fully verified path (Fundamentals), 24 playable activities (23 registered missions plus orientation), 23 verified topics/activities and 1 tested guided project foundation whose full capstone remains IN_PROGRESS**. There are **101 PLANNED/Coming Soon records**, plus that unfinished project. Twelve requested topics missing from the previous planning table were explicitly added; do not compare the remaining count with the old 99 without accounting for these additions. Current assessments: **34 (25 code + 9 guided)**; available XP: **5,315**. Anatomy: **149 groups / 98 matching descriptions across 24 labs**. Stable IDs, progress version 2, prior achievements, once-only XP, drafts and independent panel-layout storage remain intact.

Nine new complete topic rows below are VERIFIED. The tenth new playable activity, projects-employee-management, remains overall IN_PROGRESS with verified first-stage educational content. Planned rows remain unavailable and earn no XP. Introductory coverage never promotes another dedicated topic. See IMPLEMENTATION_PROGRESS.md for exact checks and project limits.

## Canonical mission table and historical delivery notes

Canonical executable definitions: `src/lib/curriculum.ts` and imported lesson modules. Milestone 1 statuses were confirmed after 34 unit tests, 38 browser scenarios, curriculum validation, typecheck, lint, build and rendered Arabic review passed. All 10 activities provide 1,995 XP in total. New playable IDs must match the actual registry. Existing stable IDs: `addition`, `structures`, `conditions`; orientation lab ID: `orientation`.

| Sequence | Skill | Overall | Syntax lab | English | Arabic | Visualization | Challenge | Validation | Browser | Remaining |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Orientation | Syntax basics | VERIFIED | VERIFIED | VERIFIED | VERIFIED | N/A | VERIFIED | VERIFIED | VERIFIED | None |
| 01 addition | Variables/arithmetic | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | None |
| 02 structures | TYPES/DATA/components | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | None |
| 03 conditions | IF/ELSEIF/ELSE | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | None |
| 04 do | DO/TIMES/sy-index | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | None |
| 05 while | WHILE/termination | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | None |
| 06 tables | Internal table/APPEND | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | None |
| 07 loop-at | LOOP AT/work area | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | None |
| 08 loop-control | EXIT/CONTINUE | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | None |
| 09 employees | Employee Records Processor | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | None |

The following IDs are stable tracking records. The current table includes the 2026-11-04 curriculum batch. VERIFIED columns on projects-employee-management refer only to its tested guided design foundation; its Overall remains IN_PROGRESS until the complete SAP capstone is built and verified. Next mission: `data-conditional-loop`.

| Mission ID | Path | Topic | Overall | Syntax lab | English | Arabic | Visualization | Challenge | Validation | Browser |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data-table-model | data | Internal tables in depth | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| data-table-categories | data | Standard sorted and hashed tables | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| data-keys | data | Keys and uniqueness | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| data-work-areas-field-symbols | data | Work areas and field symbols | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| data-read-table | data | READ TABLE and key lookup | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| data-table-mutations | data | MODIFY DELETE INSERT APPEND | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| data-sorting-filtering | data | Sorting and filtering | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| data-conditional-loop | data | Conditional LOOP AT | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| data-table-expressions | data | Table expressions and exceptions | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| data-employee-manager | data | Employee Data Manager | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-introduction | dictionary | Dictionary introduction | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| dictionary-domains | dictionary | Domains | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-data-elements | dictionary | Data elements | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-structures | dictionary | Structures | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-database-tables | dictionary | Database tables | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-primary-keys | dictionary | Primary keys | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-foreign-keys | dictionary | Foreign keys | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-relationships | dictionary | Table relationships | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-search-helps | dictionary | Search helps | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-settings-activation | dictionary | Settings and activation | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-views | dictionary | Traditional views and modern context | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-employee-model | dictionary | Employee Data Model | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-fundamentals | database | Database fundamentals | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| database-abap-sql | database | ABAP SQL introduction | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-select | database | SELECT | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-where | database | WHERE | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-order-by | database | ORDER BY | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-aggregates | database | Aggregates | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-joins | database | Joins | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-host-variables | database | Host variables | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-multiple-records | database | Reading multiple records | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-sql-mutations | database | SQL INSERT UPDATE MODIFY DELETE | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-performance | database | Performance fundamentals | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-sales-analysis | database | Sales Order Data Analysis | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| oop-introduction | oop | OOP introduction | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| oop-classes-objects | oop | Classes and objects | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| oop-attributes | oop | Attributes | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| oop-instance-methods | oop | Instance methods | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| oop-constructors | oop | Constructors | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| oop-visibility | oop | Visibility | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| oop-static-instance | oop | Static versus instance | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| oop-inheritance | oop | Inheritance | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| oop-redefinition | oop | Method redefinition | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| oop-interfaces | oop | Interfaces | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| oop-polymorphism | oop | Polymorphism | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| oop-exceptions | oop | Exceptions | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| oop-employee-classes | oop | Employee Management Classes | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-reports | applications | Classical reports | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| applications-selection-screens | applications | Selection screens | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-parameters-select-options | applications | Parameters and select-options | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-report-events | applications | Report events | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-alv-concepts | applications | ALV concepts | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-traditional-alv | applications | Traditional ALV | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-screens | applications | Screen programming | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-module-pool | applications | Module Pool | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-pbo-pai | applications | PBO and PAI | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-transactions | applications | Transactions and navigation | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-forms | applications | Smart Forms and Adobe Forms | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-debugging | applications | Debugging | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-enhancements | applications | Enhancements | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| applications-employee-report | applications | Employee Report | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-syntax | modern | Modern syntax | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| modern-inline-declarations | modern | Inline declarations | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-constructor-expressions | modern | Constructor expressions | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-value | modern | VALUE | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-new | modern | NEW | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-cond | modern | COND | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-switch | modern | SWITCH | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-corresponding | modern | CORRESPONDING | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-table-expressions | modern | Table expressions | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-functional-expressions | modern | Functional expressions | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-cds | modern | CDS fundamentals | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-cds-associations | modern | CDS associations | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-dcl | modern | DCL | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-amdp | modern | AMDP | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-code-to-data | modern | Code-to-data | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-performance | modern | Performance-conscious development | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-sales-model | modern | Analytical Sales Data Model | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-introduction | cloud | ABAP Cloud introduction | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| cloud-restrictions-apis | cloud | Restrictions and released APIs | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-adt | cloud | Eclipse ADT | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-cds-entities | cloud | CDS view entities | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-rap-architecture | cloud | RAP architecture | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-business-objects | cloud | RAP business objects | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-behavior-definitions | cloud | Behavior definitions | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-managed | cloud | Managed implementation | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-unmanaged | cloud | Unmanaged implementation concepts | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-behavior-implementation | cloud | Behavior implementation | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-eml | cloud | EML | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-service-definitions | cloud | Service definitions | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-service-bindings | cloud | Service bindings | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-odata-v4 | cloud | OData V4 | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-authorization-validation | cloud | Authorization and validation | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-draft | cloud | Draft handling | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-btp | cloud | BTP ABAP environment | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-leave-application | cloud | RAP Leave Request Application | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| projects-employee-management | projects | Employee Management | IN_PROGRESS | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED | VERIFIED |
| projects-leave-management | projects | Leave Management | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| projects-sales-orders | projects | Sales Order Processing | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| projects-inventory-management | projects | Inventory Management | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| projects-data-reporting | projects | SAP Data Reporting | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| projects-api-integration | projects | SAP API Integration | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| projects-rap-application | projects | RAP Business Application | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |

Additional explicit tracking from the full-curriculum request (2026-11-04). These stable records add no playable route or XP. Existing combined records retain their subtopics: database-joins covers INNER and LEFT OUTER JOIN; oop-static-instance covers static attributes and methods; OOP introduction/classes includes reference identity; applications-debugging includes breakpoints; data-read-table covers key and index access; dictionary-settings-activation covers technical settings and activation.

| Mission ID | Path | Topic | Overall | Syntax lab | English | Arabic | Visualization | Challenge | Validation | Browser |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| data-table-performance | data | Internal table performance concepts | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-transports | dictionary | Transport concepts | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-lock-objects | dictionary | Lock objects | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| dictionary-number-ranges | dictionary | Number ranges | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-select-single | database | SELECT SINGLE and appropriate use | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-group-by | database | GROUP BY | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| database-transactions | database | Transaction concepts | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-abap-sql | modern | Modern ABAP SQL | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| modern-cds-annotations | modern | CDS annotations | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-clean-core | cloud | Clean Core principles | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-determinations | cloud | Determinations | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |
| cloud-actions | cloud | Actions | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED | PLANNED |

Status vocabulary: PLANNED, IN_PROGRESS, CONTENT_COMPLETE, FUNCTIONAL, IMPLEMENTED, TESTED, VERIFIED; BLOCKED requires a concrete unresolved blocker. VERIFIED requires all applicable quality checks, including rendered bilingual review. A successful build alone does not establish lesson quality.

Latest 2026-11-03 totals: orientation + 13 registered missions = 14 VERIFIED playable activities, 24 assessments (22 code + 2 guided assessments), 2,995 available XP. Data has 4/10 verified missions; Fundamentals remains the only complete path. 99 planned missions/projects remain, including the newly tracked Inventory Management capstone from the latest request. Prerequisites are recommendations only. All implemented IDs are accessible immediately. Labs and achievements are tracked independently.

2026-11-02 Visual Code Anatomy: VERIFIED for orientation and all 11 registered missions after 46 unit tests, source/range validation, 68 browser scenarios and rendered Arabic review. The Structure reference has 6 groups; all existing labs together have 60 groups and 38 matching descriptions. Existing mission assessment counts and XP are unchanged. Labs remain optional, and legacy completed labs are preserved. Optional detailed keyword exercises are retained.

2026-11-03 data-keys: VERIFIED after 51/51 unit tests, curriculum validation (12 missions / 22 assessments), typecheck/lint/build and 76/76 production browser scenarios in 4.6 minutes. Directly reviewed Arabic desktop/light and mobile/dark rendering. Adds ten anatomy groups, four matching descriptions, key-policy field selection and before/after snapshots, the required data-key-design assessment and data-key-matches code assessment. Both plus the knowledge check gate 260 XP once. Total anatomy coverage is now 70 groups / 42 matching descriptions across 13 labs. No executable syntax or progress migration was added. Next: data-work-areas-field-symbols.

Latest Work Areas and Field Symbols batch: VERIFIED after 62/62 unit tests, curriculum validation (13 missions / 24 assessments), typecheck/lint/build, 86/86 full production browser checks in 4.8 minutes, and final rebuilt-app checks (10 lesson/deep-link cases plus 2 corrected diagnostic cases). Direct Arabic desktop/light and final mobile/dark review passed. Adds ten anatomy groups, six matching descriptions, actual typed direct field-symbol execution and shared trace-driven alias diagrams. data-work-area-record and data-field-symbol-alias plus the knowledge check gate 280 XP once. Current anatomy: 80 groups / 48 descriptions across 14 labs. Progress schema and prior achievements remain unchanged. Next: data-read-table. Generic/dynamic symbols, IS ASSIGNED, LOOP ASSIGNING and table-row aliases remain unsupported.
