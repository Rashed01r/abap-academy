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
| Trace | Source range, statement, operation, copied memory, output, changes, skipped ranges, condition, loop and row metadata |

The runtime rejects unsupported syntax explicitly. `RUNTIME_LIMITS` currently sets 100 iterations, 1,000 execution steps, 1,000 trace events, 100 table rows, 12 nested blocks, 65,536 estimated memory bytes and 4,000,000 estimated trace bytes. Source text is bounded to 16,000 characters. See the actual engine before changing these values. Do not weaken limits to make a sample pass. Infinite WHILE programs produce a localized diagnostic rather than freezing the browser.

Table snapshots must retain values from that instant, even if a later statement changes the work area. Nested loops must restore the enclosing loop counter. Selected rows must be trace metadata, not guessed from editor cursor position. Editing invalidates an existing trace.

Not implemented by this milestone: sorted/hashed table semantics, field symbols, general READ/MODIFY/DELETE/INSERT, arbitrary ABAP SQL, OO runtime, CDS, DCL, AMDP, RAP activation, OData networking or live SAP integration. Inline LOOP declarations are supported only if the parser explicitly implements and tests them; reference explanations must not imply broader execution support.

2026-11-02: no runtime syntax was added. data-table-model exercises the existing structured standard tables, duplicate APPEND copies and LOOP AT INTO. Assessment data-table-copies checks actual row contents, a separate changed work area and output under two altered name inputs. It rejects literal output, missing rows and wrong IDs.

data-table-categories adds a finite, labelled conceptual comparison: standard APPEND order, non-unique sorted primary-key order, unique hashed membership with duplicate rejection. It does not expose a hashed primary index, promise hashed iteration order or model SAP internals. A separate standard-table coding assessment checks memory/order/duplicates and output with changed inputs. Sorted/hashed declarations in Syntax Lab are SAP reference examples, not supported browser source. Future key/mutation lessons must add deterministic typed semantics before claiming executable support.

Visual Code Anatomy adds no runtime syntax. Its source groups use explicit reviewed ranges and actual deterministic trace snapshots. Type diagrams are labelled blueprints rather than created records. Untaken branches do not fabricate results; repeated sections display the last real visit and can be explored through normal trace controls. The educational range is a separate Monaco decoration from the active execution statement. Editing clears both stale traces and the educational range for changed source. The Structure example now has the requested spacing/blank lines; its ABAP behavior and coding challenge are unchanged.
