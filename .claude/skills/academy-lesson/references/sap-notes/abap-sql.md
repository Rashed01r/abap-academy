# SAP notes: ABAP SQL (SELECT, WHERE, joins, aggregates, INSERT/UPDATE/MODIFY/DELETE)

Researched 2026-11-08. Source: SAP-samples ABAP cheat sheet `03_ABAP_SQL.md` (Introduction, Basic Syntax, Notes on
Modern SELECT Statements, Target additions, ORDER/GROUP/HAVING, Combining Data of Multiple Data Sources,
Create/Update/Delete Operations, Evaluating ABAP System Fields, Client Handling).
https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md
Cite in `references`: https://help.sap.com/docs/abap-cloud/abap-keyword/sql , …/host-variable , …/select-into-target ,
…/select-group-by , …/aggregate-function , …/inner-join , …/left-outer-join , …/insert-writable-obj ,
…/update-writable-obj , …/delete-writable-obj

## Facts used in the lessons
- ABAP SQL (formerly Open SQL) is a subset of SQL; the ABAP SQL interface turns statements into platform SQL.
- Modern form: `SELECT FROM src FIELDS cols WHERE cond … INTO target.` INTO should come after all other clauses.
  Host variables need `@` (`@lv_id`, `@DATA(itab)` inline). The SELECT list may also follow SELECT without FIELDS.
- `INTO TABLE @itab` for many rows; `INTO @wa` expects a single row → `SELECT SINGLE` (otherwise a SELECT loop with
  ENDSELECT). Aggregate-only SELECT without GROUP BY returns exactly one row.
- sy-subrc: SELECT 0 = rows passed, 4 = empty result; sy-dbcnt = number of rows passed. A miss leaves an INTO work
  area unchanged; INTO TABLE yields an empty table.
- Without ORDER BY the result order is not guaranteed.
- GROUP BY: every column in the SELECT list that is not an aggregate must be in GROUP BY. HAVING only with GROUP BY.
- Joins: `FROM a AS x INNER JOIN b AS y ON x~c = y~c`; column selector `~` for aliases. LEFT OUTER JOIN keeps every
  left row; unmatched right columns are null → initial values in ABAP targets.
- INSERT dbtab FROM @wa: sy-subrc 0 or 4 (duplicate primary key, nothing inserted); `FROM TABLE` with a duplicate is a
  runtime error unless ACCEPTING DUPLICATE KEYS. UPDATE/MODIFY/DELETE set sy-subrc and sy-dbcnt; MODIFY inserts or
  overwrites by key; `UPDATE … SET … WHERE` and `DELETE FROM … WHERE` change every matching row (all rows without WHERE).
- Client handling is implicit in ABAP SQL. Changes belong to a database LUW (COMMIT WORK / ROLLBACK WORK).

## Simulator subset (2026-11-08)
See docs/academy-development/SIMULATOR_SUPPORT.md. Demo tables ZACA_EMPLOYEE (employee_id key, employee_name,
department, salary) and ZACA_DEPARTMENT (department key, department_name); reset every run; graders may seed others.
