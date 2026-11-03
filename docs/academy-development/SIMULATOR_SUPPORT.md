# Simulator support

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
