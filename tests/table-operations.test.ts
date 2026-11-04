import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, simulate, SimulationError, type ErrorCode } from "../src/lib/engine";
import { explain } from "../src/lib/i18n";
import { tableMutationsExample } from "../src/lib/table-mutations-mission";
import { sortingFilteringExample } from "../src/lib/sorting-filtering-mission";

const seed = `TYPES: BEGIN OF ty_row, id TYPE i, name TYPE string, END OF ty_row.
DATA rows TYPE STANDARD TABLE OF ty_row WITH EMPTY KEY.
DATA row TYPE ty_row.
row-id = 1. row-name = 'First'. APPEND row TO rows.
row-id = 3. row-name = 'Third'. APPEND row TO rows.`;
function rejects(source: string, code: ErrorCode) {
  assert.throws(() => simulate(source), (error: unknown) => error instanceof SimulationError && error.code === code, source);
}

test("INSERT, MODIFY and DELETE emit truthful copied before/after states and row selections", () => {
  const trace = simulate(`${seed}
row-id = 2. row-name = 'Second'. INSERT row INTO rows INDEX 2.
row-name = 'Revised'. MODIFY rows FROM row INDEX 2.
DELETE rows INDEX 1.
row-name = 'Later work area'.`);
  const [insert, modify, deletion] = trace.filter(event => event.mutation);
  assert.deepEqual(insert.mutation!.before, [{id:1,name:"First"},{id:3,name:"Third"}]);
  assert.deepEqual(insert.mutation!.after, [{id:1,name:"First"},{id:2,name:"Second"},{id:3,name:"Third"}]);
  assert.deepEqual(modify.mutation!.after, [{id:1,name:"First"},{id:2,name:"Revised"},{id:3,name:"Third"}]);
  assert.deepEqual(deletion.mutation!.after, [{id:2,name:"Revised"},{id:3,name:"Third"}]);
  assert.equal(insert.tableSelection!.index, 1);
  assert.equal(modify.tableSelection!.index, 1);
  assert.equal(deletion.tableSelection, undefined);
  assert.equal(insert.mutation!.index, 2);
  assert.equal(trace.at(-1)!.memory["sy-subrc"], 0);
  assert.notEqual(insert.mutation!.before, insert.mutation!.after);
  assert.notEqual(insert.mutation!.after, insert.memory.rows);
  assert.match(explain(insert,"en"), /Insert a copy/);
  assert.ok(explain(modify,"ar").includes("استُبدل"));
});

test("insertion permits beginning and count+1, including an empty table", () => {
  const trace = simulate(`DATA numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY.
DATA n TYPE i VALUE 10.
INSERT n INTO numbers INDEX 1.
INSERT 30 INTO numbers INDEX 2.
INSERT 20 INTO numbers INDEX 2.
INSERT 5 INTO numbers INDEX 1.
n = 999.`);
  assert.deepEqual(trace.at(-1)!.memory.numbers, [5,10,20,30]);
  assert.deepEqual(trace.filter(event => event.mutation).map(event => event.mutation!.applied), [true,true,true,true]);
});

test("positive upper-bound misses preserve rows and source while returning status 4", () => {
  const trace = simulate(`${seed}
INSERT row INTO rows INDEX 4. WRITE sy-subrc.
MODIFY rows FROM row INDEX 3. WRITE sy-subrc.
DELETE rows INDEX 3. WRITE sy-subrc.`);
  const mutations = trace.filter(event => event.mutation);
  assert.deepEqual(trace.at(-1)!.output, ["4","4","4"]);
  for (const event of mutations) {
    assert.equal(event.mutation!.applied, false);
    assert.deepEqual(event.mutation!.before, event.mutation!.after);
    assert.equal(event.tableSelection, undefined);
    assert.deepEqual(event.changed, ["sy-subrc"]);
  }
  assert.deepEqual(trace.at(-1)!.memory.row, {id:3,name:"Third"});
});

test("nonpositive mutation indexes report source-local range diagnostics rather than ordinary misses", () => {
  for (const index of [0,-1]) for (const statement of [`INSERT row INTO rows INDEX ${index}.`,`MODIFY rows FROM row INDEX ${index}.`,`DELETE rows INDEX ${index}.`]) {
    const source = `${seed}\n${statement}`;
    rejects(source,"range");
    try { simulate(source); } catch (error) { assert.equal((error as SimulationError).range.startLine,6); }
  }
});

test("all mutation forms validate tables, source types, index types and skipped branches", () => {
  rejects(`${seed} INSERT 'wrong' INTO rows INDEX 1.`, "type");
  rejects(`${seed} MODIFY rows FROM 3 INDEX 1.`, "type");
  rejects(`${seed} DELETE rows INDEX '1'.`, "type");
  rejects(`${seed} INSERT row INTO missing INDEX 1.`, "unknown");
  rejects(`${seed} DELETE row INDEX 1.`, "type");
  rejects(`${seed} IF 1 = 2. MODIFY rows FROM 'wrong' INDEX 1. ENDIF.`, "type");
  rejects(`${seed} SORT rows BY missing.`, "component");
  rejects(`${seed} IF 1 = 2. SORT rows BY missing DESCENDING. ENDIF.`, "component");
  rejects(`${seed} SORT rows BY id id.`, "component");
});

test("SORT uses numeric comparison, per-field directions and preserves duplicates and row count", () => {
  const trace = simulate(`${seed}
row-id = 10. row-name = 'Ten'. APPEND row TO rows.
row-id = 3. row-name = 'Alpha'. APPEND row TO rows.
SORT rows BY id DESCENDING name ASCENDING.`);
  const sort = trace.at(-1)!;
  assert.deepEqual(sort.memory.rows, [{id:10,name:"Ten"},{id:3,name:"Alpha"},{id:3,name:"Third"},{id:1,name:"First"}]);
  assert.deepEqual(sort.mutation!.fields, [{field:"id",direction:"descending"},{field:"name",direction:"ascending"}]);
  assert.equal(sort.mutation!.before.length, sort.mutation!.after.length);
  assert.equal(sort.tableSelection, undefined);
  assert.match(explain(sort,"en"), /does not set sy-subrc/);
  const ascending = simulate(`${seed} SORT rows BY id.`).at(-1)!;
  assert.deepEqual(ascending.mutation!.fields, [{field:"id",direction:"ascending"}]);
});

test("SORT also supports elementary table_line and safely handles empty and duplicate values", () => {
  const trace = simulate(`DATA numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY.
SORT numbers BY table_line.
APPEND 10 TO numbers. APPEND 2 TO numbers. APPEND 10 TO numbers.
SORT numbers BY table_line ASCENDING.`);
  assert.deepEqual(trace.at(-1)!.memory.numbers, [2,10,10]);
  assert.deepEqual(trace.find(event => event.operation === "sort")!.mutation!.after, []);
});

test("status chaining preserves READ sy-tabix, SORT status, and resets mutation sy-subrc after success", () => {
  const trace = simulate(`${seed}
READ TABLE rows INTO row INDEX 2.
DELETE rows INDEX 99.
SORT rows BY id DESCENDING.
WRITE sy-subrc. WRITE sy-tabix.
MODIFY rows FROM row INDEX 1.
WRITE sy-subrc. WRITE sy-tabix.`);
  assert.deepEqual(trace.at(-1)!.output, ["4","2","0","2"]);
  const sort = trace.find(event => event.operation === "sort")!;
  assert.equal(sort.memory["sy-subrc"],4);
  assert.ok(!sort.changed.includes("sy-subrc"));
});

test("mutation source expressions and read-only alias copies retain typed value semantics", () => {
  const trace = simulate(`DATA numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY.
DATA n TYPE i VALUE 1.
INSERT n + 2 INTO numbers INDEX 1.
MODIFY numbers FROM n + 8 INDEX 1.
READ TABLE numbers INTO n INDEX 1.
WRITE n.`);
  assert.deepEqual(trace.at(-1)!.output,["9"]);
  rejects(`${seed} LOOP AT rows INTO row. DELETE rows INDEX 1. ENDLOOP.`, "unsupported");
  rejects(`${seed} LOOP AT rows INTO row. SORT rows BY id. ENDLOOP.`, "unsupported");
});

test("mutation assessment accepts the reference and rejects omitted operations, literals and wrong indexes", () => {
  assert.equal(evaluate(tableMutationsExample,"data-mutation-workflow").correct,true);
  for (const source of [
    tableMutationsExample.replace("INSERT ls_employee INTO lt_employees INDEX 2.","APPEND ls_employee TO lt_employees."),
    tableMutationsExample.replace("MODIFY lt_employees FROM ls_employee INDEX 2.",""),
    tableMutationsExample.replace("DELETE lt_employees INDEX 1.","DELETE lt_employees INDEX 2."),
    tableMutationsExample.replace("ls_employee-name = lv_new_name.","ls_employee-name = 'Sarah'."),
    tableMutationsExample.replace("WRITE ls_employee-name.","WRITE 'Sarah'."),
    tableMutationsExample.replace("ls_employee-id = lv_insert_id.","ls_employee-id = 102."),
  ]) assert.equal(evaluate(source,"data-mutation-workflow").correct,false,source);
});

test("sort/filter assessment varies thresholds, salaries, names and rejects hardcoding, data loss and wrong boundary", () => {
  assert.equal(evaluate(sortingFilteringExample,"data-sort-report").correct,true);
  for (const source of [
    sortingFilteringExample.replace("SORT lt_employees BY salary DESCENDING.",""),
    sortingFilteringExample.replace("DESCENDING", "ASCENDING"),
    sortingFilteringExample.replace("WRITE / ls_employee-name.","WRITE 'Sara'."),
    sortingFilteringExample.replace(">= lv_min_salary","> lv_min_salary"),
    sortingFilteringExample.replace("SORT lt_employees", "DELETE lt_employees INDEX 1. SORT lt_employees"),
    sortingFilteringExample.replace("IF ls_employee-salary >= lv_min_salary.","IF ls_employee-salary >= 6000."),
  ]) assert.equal(evaluate(source,"data-sort-report").correct,false,source);
});
