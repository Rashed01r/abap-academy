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
