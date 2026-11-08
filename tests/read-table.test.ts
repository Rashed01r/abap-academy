import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, simulate, SimulationError, type ErrorCode } from "../src/lib/engine";
import { explain } from "../src/lib/i18n";

const seed = `TYPES: BEGIN OF ty_employee, id TYPE i, name TYPE string, END OF ty_employee.
DATA lt_employees TYPE STANDARD TABLE OF ty_employee WITH EMPTY KEY.
DATA ls_employee TYPE ty_employee.
ls_employee-id = 101.
ls_employee-name = 'Ahmed'.
APPEND ls_employee TO lt_employees.
ls_employee-id = 102.
ls_employee-name = 'Sara'.
APPEND ls_employee TO lt_employees.`;
const solution = `${seed}
DATA lv_id TYPE i VALUE 102.
READ TABLE lt_employees INTO ls_employee WITH KEY id = lv_id.
IF sy-subrc = 0.
  WRITE ls_employee-name.
ELSE.
  WRITE 'Not found'.
ENDIF.`;
function rejects(source: string, code: ErrorCode) {
  assert.throws(() => simulate(source), (error: unknown) => error instanceof SimulationError && error.code === code, source);
}

test("READ TABLE copies the first matching row and exposes immutable lookup and selection snapshots", () => {
  const trace = simulate(`${seed}
READ TABLE lt_employees INTO ls_employee WITH KEY id = 101.
ls_employee-name = 'Changed copy'.
WRITE sy-subrc.
WRITE sy-tabix.
WRITE ls_employee-name.`);
  const read = trace.find(event => event.operation === "read")!;
  assert.deepEqual(read.lookup, {table:"lt_employees",target:"ls_employee",found:true,index:1,keys:{id:101},checked:[1],subrc:0});
  assert.deepEqual(read.tableSelection, {name:"lt_employees",index:0,row:{id:101,name:"Ahmed"}});
  assert.deepEqual(read.memory.ls_employee, {id:101,name:"Ahmed"});
  assert.deepEqual(trace.at(-1)!.memory.lt_employees, [{id:101,name:"Ahmed"},{id:102,name:"Sara"}]);
  assert.deepEqual(trace.at(-1)!.output, ["0","1","Changed copy"]);
  assert.match(explain(read,"en"), /Found row 1/);
  assert.ok(explain(read,"ar").includes("وُجد الصف"));
  assert.equal(trace.at(-1)!.tableSelection, undefined);
});

test("miss preserves stale work-area contents and has no row highlight", () => {
  const trace = simulate(`${seed}
READ TABLE lt_employees INTO ls_employee WITH KEY id = 999.
WRITE sy-subrc. WRITE sy-tabix. WRITE ls_employee-name.`);
  const read = trace.find(event => event.operation === "read")!;
  assert.equal(read.lookup!.found, false);
  assert.equal(read.lookup!.index, 0);
  assert.equal(read.tableSelection, undefined);
  assert.deepEqual(read.memory.ls_employee, {id:102,name:"Sara"});
  assert.deepEqual(read.changed, ["sy-subrc","sy-tabix"]);
  assert.deepEqual(trace.at(-1)!.output, ["4","0","Sara"]);
  assert.match(explain(read,"en"), /keeps its previous value/);
  assert.ok(explain(read,"ar").includes("يحتفظ"));
});

test("multiple typed key components use conjunction and duplicates choose the first row", () => {
  const trace = simulate(`${seed}
ls_employee-id = 101. ls_employee-name = 'Other'. APPEND ls_employee TO lt_employees.
READ TABLE lt_employees INTO ls_employee WITH KEY id = 101 name = 'Other'.
WRITE ls_employee-name.
READ TABLE lt_employees INTO ls_employee WITH KEY id = 101.
WRITE ls_employee-name.`);
  assert.deepEqual(trace.at(-1)!.output, ["Other","Ahmed"]);
  assert.deepEqual(trace.filter(event => event.lookup).map(event => event.lookup!.index), [3,1]);
});

test("INDEX evaluates integer expressions and misses safely for zero, negative and oversized positions", () => {
  const trace = simulate(`${seed}
DATA idx TYPE i VALUE 1.
READ TABLE lt_employees INTO ls_employee INDEX idx + 1.
WRITE ls_employee-name. WRITE sy-tabix.
READ TABLE lt_employees INTO ls_employee INDEX 0.
WRITE sy-subrc. WRITE ls_employee-name.
READ TABLE lt_employees INTO ls_employee INDEX -1.
WRITE sy-subrc.
READ TABLE lt_employees INTO ls_employee INDEX 100.
WRITE sy-subrc.`);
  const reads = trace.filter(event => event.operation === "read");
  assert.deepEqual(reads.map(event => event.lookup!.found), [true,false,false,false]);
  assert.equal(reads[0].lookup!.requestedIndex, 2);
  assert.deepEqual(trace.at(-1)!.output, ["Sara","2","4","Sara","4","4"]);
});

test("empty and elementary tables support typed INDEX/table_line reads", () => {
  const trace = simulate(`DATA numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY.
DATA number TYPE i VALUE 7.
READ TABLE numbers INTO number INDEX 1.
WRITE number. WRITE sy-subrc.
APPEND 10 TO numbers. APPEND 20 TO numbers.
READ TABLE numbers INTO number WITH KEY table_line = 20.
WRITE number. WRITE sy-tabix.`);
  assert.deepEqual(trace.at(-1)!.output, ["7","4","20","2"]);
  assert.equal(trace.find(event => event.operation === "read")!.tableSelection, undefined);
});

test("lookups validate target, key fields and operand types even inside an unchosen branch", () => {
  rejects(`${seed} DATA wrong TYPE string. READ TABLE lt_employees INTO wrong WITH KEY id = 101.`, "type");
  rejects(`${seed} READ TABLE lt_employees INTO ls_employee WITH KEY missing = 101.`, "component");
  rejects(`${seed} READ TABLE lt_employees INTO ls_employee WITH KEY id = '101'.`, "type");
  rejects(`${seed} READ TABLE lt_employees INTO ls_employee INDEX '2'.`, "type");
  rejects(`${seed} READ TABLE missing INTO ls_employee INDEX 1.`, "unknown");
  rejects(`${seed} READ TABLE ls_employee INTO ls_employee INDEX 1.`, "type");
  rejects(`${seed} IF 1 = 2. READ TABLE lt_employees INTO ls_employee WITH KEY name = 1. ENDIF.`, "type");
  rejects(`${seed} READ TABLE lt_employees INTO ls_employee WITH KEY id = 101 id = 102.`, "component");
  rejects(`${seed} READ TABLE lt_employees INTO ls_employee WITH KEY.`, "declaration");
});

test("unsupported lookup variants and writes/bindings to system fields are rejected", () => {
  rejects(`${seed} READ TABLE lt_employees ASSIGNING <employee> WITH KEY id = 101.`, "declaration");
  rejects(`${seed} READ TABLE lt_employees INTO DATA(employee) INDEX 1.`, "declaration");
  rejects(`${seed} sy-subrc = 0.`, "assignment");
  rejects(`${seed} sy-tabix = 1.`, "assignment");
  rejects(`${seed} FIELD-SYMBOLS <status> TYPE i. ASSIGN sy-subrc TO <status>.`, "unsupported");
});

test("a later miss resets status without mutating an earlier found event or aliasing table data", () => {
  const trace = simulate(`${seed}
READ TABLE lt_employees INTO ls_employee INDEX 1.
READ TABLE lt_employees INTO ls_employee WITH KEY id = 999.
FIELD-SYMBOLS <employee> TYPE ty_employee.
ASSIGN ls_employee TO <employee>.
<employee>-name = 'Copy changed'.`);
  const [found, missing] = trace.filter(event => event.operation === "read");
  assert.equal(found.memory["sy-subrc"], 0);
  assert.equal(missing.memory["sy-subrc"], 4);
  assert.deepEqual(found.memory.ls_employee, {id:101,name:"Ahmed"});
  assert.deepEqual(missing.memory.ls_employee, {id:101,name:"Ahmed"});
  assert.deepEqual(trace.at(-1)!.memory.lt_employees, [{id:101,name:"Ahmed"},{id:102,name:"Sara"}]);
});

test("lookup assessment probes reject hardcoded keys/output, stale reads, absent READ and mutation", () => {
  assert.equal(evaluate(solution,"data-read-lookup").correct, true);
  const bad = [
    solution.replace("WRITE ls_employee-name.","WRITE 'Sara'."),
    solution.replace("id = lv_id", "id = 102"),
    solution.replace("READ TABLE lt_employees INTO ls_employee WITH KEY id = lv_id.", ""),
    solution.replace(/IF sy-subrc = 0\.[\s\S]*ENDIF\./, "WRITE ls_employee-name."),
    solution.replace("WRITE ls_employee-name.", "APPEND ls_employee TO lt_employees. WRITE ls_employee-name."),
    solution.replace("DATA lv_id TYPE i VALUE 102.", "DATA lv_id TYPE i VALUE 102. lv_id = 102."),
    solution.replace("WRITE 'Not found'.", "WRITE ls_employee-name."),
  ];
  for (const source of bad) assert.equal(evaluate(source,"data-read-lookup").correct, false, source);
});
