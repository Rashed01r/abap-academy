# Simulator support

## 2026-11-07: conditional standard-table traversal

Supported: `LOOP AT table INTO work_area WHERE component operator operand`, also existing inline INTO DATA. The condition is one typed comparison (=, <>, <, <=, >, >=); elementary rows use table_line. The right operand is a compatible literal/scalar reference, reevaluated for each candidate. No compound/dynamic conditions, arithmetic predicate expressions, secondary keys, sorted/hashed runtime or ASSIGNING. Unknown fields and incompatible types fail at the source statement.

Only matching rows are copied into the work area. A declared target remains unchanged when no row matches. All rows remain stored in original order. Filter trace metadata includes the candidate row, original one-based index, actual operands and result; tableSelection remains zero-based. Rejected candidates skip body ranges and do not change work-area storage. Shared captions and flowchart show actual decisions; no performance guarantee is implied.

For standard-table loops, sy-tabix is the original current position during body execution and returns to its pre-loop value afterward, including nested loops and EXIT. sy-subrc is 0 if a row was processed, otherwise 4. Status emulation remains limited to documented operations; existing APPEND status behavior is unchanged. Changing an actively looped table is rejected, including APPEND; limits remain unchanged. The new assessment varies names, salaries, thresholds, equality and empty selection and rejects canned output, missing WHERE and data loss.

Earlier WHERE-unsupported statements below are historical and superseded here.


> **Current development language: English only (2026-11-07).** Arabic support is temporarily deferred, not removed. Preserve all existing Arabic resources and RTL support; do not create or review Arabic translations or run Arabic-specific UI checks while `ENABLE_ARABIC` is false. New playable content requires complete English teaching only. This policy supersedes bilingual authoring/review requirements in the historical sections below. See [the language-phase policy](LANGUAGE_PHASE.md).


## 2026-11-04: typed lookup, indexed changes and sorting

The executable subset now includes `READ TABLE table INTO target WITH KEY component = expression ...` and `READ TABLE table INTO target INDEX expression` for typed standard tables. Key comparisons use all supplied components and select the first match; elementary rows use `table_line`. `INTO` copies the complete row. A miss returns `sy-subrc = 4` and leaves the target unchanged; success returns 0. Successful `sy-tabix` is the one-based position. The model resets `sy-tabix` to 0 on a miss; SAP leaves it undefined for a failed linear search, so this value is explicitly identified as a model convention. Check `sy-subrc`, never a retained work-area name, for success. Current SAP keyword documentation returns 4 for READ indexes outside the table, including nonpositive values; older documentation differs. Source checks reject unknown fields, wrong operand types, duplicate predicates, inline INTO, ASSIGNING, secondary keys and BINARY SEARCH.

`INSERT value INTO table INDEX i`, `MODIFY table FROM value INDEX i`, and `DELETE table INDEX i` operate on standard tables in program memory. INSERT accepts 1 through count+1; MODIFY/DELETE require an existing row. A positive index above the permitted range returns 4 without changing the table; a nonpositive mutation index is a source-local range error. Successful changes return 0. Values are copied, following indexes shift on insertion/deletion, and direct work-area edits do not update a saved row. These operations update the modeled `sy-subrc`; `SORT` preserves the current status fields. Status emulation remains limited to documented operations, rather than every ABAP statement.

`SORT table BY field [ASCENDING|DESCENDING] ...` compares complete typed rows, with numeric comparison for i and deterministic character comparison for string. Each field may specify its direction; omitted directions are ascending. Elementary `table_line`, multiple fields, duplicates and empty tables are supported. Equal-key order is deterministic in JavaScript but is not a promise of SAP STABLE behavior. AS TEXT, STABLE, locale collation and changing/sorting the same table during an active LOOP are excluded. Key-based mutations, SQL mutations, WHERE in LOOP, expressions/exceptions and sorted/hashed execution remain unsupported.

Trace `lookup` metadata records requested keys/index, found state and destination, with a row selection only for a successful read. `mutation` metadata records independent before/after row copies, applied state, one-based index and sort fields. Existing zero-based `tableSelection` drives current-row highlighting for successful INSERT/MODIFY. Shared LookupSummary/TableChangeSummary render those real snapshots in anatomy and the workspace; editing invalidates them. Graders for `data-read-lookup`, `data-mutation-workflow` and `data-sort-report` execute changed IDs, names, input values, salaries and thresholds and reject canned output, hardcoded inputs, omitted/wrong operations, data loss and incorrect boundaries.

Advanced guided lessons intentionally bypass this interpreter. DictionaryDesigner checks a local domain policy and identity design; SqlFoundationLab derives projection/filter results from fixed employees/departments; ObjectExplorer models independent instance state. Reference OOP/report/modern/CDS/RAP code is displayed and explained without claiming compilation, SAP activation, SQL parsing, deployment or network execution. See the latest IMPLEMENTATION_PROGRESS.md section for quality gates.

## Earlier support descriptions (historical; superseded above)

This is a deterministic browser teaching engine, not an SAP backend or a full ABAP interpreter. Changes in this checkpoint extend beginner loops and standard internal tables. Final verification evidence belongs in IMPLEMENTATION_PROGRESS.md.

| Capability | Intended supported scope |
| --- | --- |
| Values | Integer and string declarations, assignment, addition, structure fields |
| Conditions | IF / ELSEIF / ELSE / ENDIF, supported scalar comparisons, nesting |
| Counted repetition | DO count TIMES / ENDDO, sy-index, zero iterations |
| Conditional repetition | WHILE comparison / ENDWHILE, updates and termination |
| Loop control | EXIT nearest loop; CONTINUE remaining current iteration |
| Tables | STANDARD TABLE OF a supported line type WITH EMPTY KEY, APPEND copying a work area |
| Traversal | LOOP AT table INTO a declared work area / ENDLOOP |
| Field symbols | Explicit i/string/named-structure FIELD-SYMBOLS; direct ASSIGN data object or component TO symbol; scalar/component read/write; UNASSIGN |
| Trace | Source range, statement, operation, copied memory, output, changes, skipped ranges, condition, loop and row metadata |

The runtime rejects unsupported syntax explicitly. `RUNTIME_LIMITS` currently sets 100 iterations, 1,000 execution steps, 1,000 trace events, 100 table rows, 12 nested blocks, 65,536 estimated memory bytes and 4,000,000 estimated trace bytes. Source text is bounded to 16,000 characters. See the actual engine before changing these values. Do not weaken limits to make a sample pass. Infinite WHILE programs produce a localized diagnostic rather than freezing the browser.

Table snapshots must retain values from that instant, even if a later statement changes the work area. Nested loops must restore the enclosing loop counter. Selected rows must be trace metadata, not guessed from editor cursor position. Editing invalidates an existing trace.

Not implemented: sorted/hashed table semantics, generic/dynamic field symbols, IS ASSIGNED guards, LOOP ASSIGNING/table-row aliases, general READ/MODIFY/DELETE/INSERT, arbitrary ABAP SQL, OO runtime, CDS, DCL, AMDP, RAP activation, OData networking or live SAP integration. Inline LOOP declarations are supported and tested; reference explanations must not imply broader execution support.

2026-11-02: no runtime syntax was added. data-table-model exercises the existing structured standard tables, duplicate APPEND copies and LOOP AT INTO. Assessment data-table-copies checks actual row contents, a separate changed work area and output under two altered name inputs. It rejects literal output, missing rows and wrong IDs.

data-table-categories adds a finite, labelled conceptual comparison: standard APPEND order, non-unique sorted primary-key order, unique hashed membership with duplicate rejection. It does not expose a hashed primary index, promise hashed iteration order or model SAP internals. A separate standard-table coding assessment checks memory/order/duplicates and output with changed inputs. Sorted/hashed declarations in Syntax Lab are SAP reference examples, not supported browser source. Future key/mutation lessons must add deterministic typed semantics before claiming executable support.

Visual Code Anatomy adds no runtime syntax. Its source groups use explicit reviewed ranges and actual deterministic trace snapshots. Type diagrams are labelled blueprints rather than created records. Untaken branches do not fabricate results; repeated sections display the last real visit and can be explored through normal trace controls. The educational range is a separate Monaco decoration from the active execution statement. Editing clears both stale traces and the educational range for changed source. The Structure example now has the requested spacing/blank lines; its ABAP behavior and coding challenge are unchanged.

2026-11-03 data-keys adds no executable syntax. Its code keeps four employee rows in an EMPTY KEY standard table and scans them with LOOP AT and nested IF comparisons; this is not optimized key access. The conceptual explorer compares selected field tuples and accepts/rejects sample rows under a uniqueness policy. It displays input order solely to explain acceptance, with no SAP sorting, hashing, memory or performance claim. Its SORTED TABLE reference declaration requires a real SAP system and a previously defined ty_employee type. An empty component selection instead shows a standard EMPTY KEY declaration and disables uniqueness.

The new code grader tests IT/101 (two matches), HR/101 (one), IT/102 (one), HR/102 (none), IT/999 (none), and an altered import with changed departments, IDs and names. It checks actual memory, output, counter and row-based writes, rejecting literal names/counts, omitted key components, hardcoded query values and early EXIT. Normal diagnostic and execution limits are unchanged. The educational interpreter records every supported WRITE as a separate output entry; it does not implement SAP list cursor layout. Reference material distinguishes classical WRITE lists from ABAP Cloud class/output APIs.

## 2026-11-03 work areas and typed field symbols

The runtime now genuinely executes FIELD-SYMBOLS <name> TYPE i/string/local_structure, ASSIGN direct_object_or_component TO <name>, supported scalar/component reads and writes through symbols, and UNASSIGN. It requires matching explicit types (a deliberately narrower scope than full SAP compatibility), declarations outside control blocks, and direct ordinary data-object sources. It rejects generic types, symbol-to-symbol/dynamic binding, table-row binding, IS ASSIGNED and LOOP ASSIGNING. No casts, raw addresses or fabricated SAP performance measurements are used.

Aliases are bindings, not duplicated memory values. ExecutionEvent.aliases records symbol-to-target names or null for unassigned declarations. Each trace snapshot copies the binding map independently. Access resolves the current target each time, so direct writes or LOOP INTO replacement of a work area's contents remain visible through a bound symbol. Writes mark both the symbol access and canonical target field as changed. APPEND still takes an independent value copy, including when its operand is a structured symbol; the existing APPEND sy-index behavior is preserved. UNASSIGN removes the link without clearing target data. An unassigned read, write or append throws the bilingual unassigned diagnostic at the active statement, including when an ASSIGN was skipped by a condition.

The field-symbol visualizer uses actual trace memory and bindings, with an explicit LTR arrow, current target value and previous snapshot value. It appears in both grouped anatomy and Watch Execution. Editing clears the trace and alias panel. Existing integer, step, row, source and trace-memory limits remain in force. Eleven new unit tests cover typing/errors, rebind/unbind, component targets, copy independence, replacement semantics, comparison-token compatibility, overflow, changed-input challenge probes and progress preservation.
