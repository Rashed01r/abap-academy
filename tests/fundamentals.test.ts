import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate, evaluate, SimulationError } from "../src/lib/engine";
import { missions } from "../src/lib/curriculum";
import { normalizeProgress, earnedXP, unlocked } from "../src/lib/progress";

const output = (source: string) => simulate(source).at(-1)!.output;
const rejects = (source: string) => assert.throws(() => simulate(source), SimulationError);

test("data model challenge checks duplicates, copies and data-derived output", () => {
  const mission = missions.find(m => m.id === "data-table-model")!;
  const challenge = mission.challenges![0];
  assert.equal(evaluate(challenge.solution, challenge.id).correct, true);
  for (const source of [
    "WRITE 'Keyboard'. WRITE 'Keyboard'.",
    challenge.solution.replace("WRITE ls_product-name.", "WRITE 'Keyboard'."),
    challenge.solution.replace("APPEND ls_product TO lt_products.\nAPPEND ls_product TO lt_products.", "APPEND ls_product TO lt_products."),
    challenge.solution.replace("ls_product-name = 'Mouse'.", "ls_product-name = 'Other'."),
    challenge.solution.replace("ls_product-id = 501.", "ls_product-id = 502."),
  ]) assert.equal(evaluate(source, challenge.id).correct, false);
  const trace = simulate(mission.example);
  const changed = trace.find(e => e.operation === "assign" && e.statement.includes("Mouse"))!;
  assert.deepEqual(changed.memory.lt_products, [{ id: 501, name: "Keyboard" }, { id: 501, name: "Keyboard" }]);
  const old = normalizeProgress({ labs: ["orientation", ...missions.slice(0, 9).map(m => m.id)], missions: missions.slice(0, 9).map(m => m.id), current: "employees", results: { addition: { attempts: 4, passed: true } } });
  assert.equal(unlocked(mission.id, old), true);
  assert.equal(earnedXP(old), 1995);
  assert.equal(old.results.addition.attempts, 4);
});

test("DO repeats source ranges and exposes immutable per-iteration memory", () => {
  const source = "DATA total TYPE i VALUE 0.\nDO 3 TIMES.\n total = total + sy-index.\nENDDO.\nWRITE total.";
  const events = simulate(source);
  const additions = events.filter(e => e.operation === "assign");
  assert.equal(additions.length, 3);
  assert.deepEqual(additions.map(e => e.range.startLine), [3, 3, 3]);
  assert.deepEqual(additions.map(e => e.memory.total), [1, 3, 6]);
  assert.deepEqual(additions.map(e => e.loop?.iteration), [1, 2, 3]);
  assert.ok(additions.every(e => e.loop?.kind === "do"));
  assert.deepEqual(events.at(-1)!.output, ["6"]);
  assert.deepEqual(simulate(source), events);
});

test("zero DO iterations and false WHILE conditions skip their bodies", () => {
  assert.deepEqual(output("DO 0 TIMES. WRITE 'wrong'. ENDDO. WRITE 'done'."), ["done"]);
  const events = simulate("DATA counter TYPE i VALUE 3. WHILE counter < 3. counter = counter + 1. ENDWHILE. WRITE counter.");
  assert.deepEqual(events.at(-1)!.output, ["3"]);
  assert.ok(events.some(e => e.condition?.result === false));
});

test("WHILE evaluates termination after updates and contains infinite programs", () => {
  const events = simulate("DATA counter TYPE i VALUE 0. WHILE counter < 3. counter = counter + 1. ENDWHILE. WRITE counter.");
  assert.deepEqual(events.at(-1)!.output, ["3"]);
  assert.deepEqual(events.filter(e => e.condition).map(e => e.condition!.result), [true, true, true, false]);
  assert.throws(() => simulate("WHILE 1 = 1. WRITE 1. ENDWHILE."), (e: unknown) => e instanceof SimulationError && e.code === "limit");
});

test("nested loops restore the enclosing sy-index and EXIT affects the nearest loop", () => {
  assert.deepEqual(output("DO 2 TIMES. DO 3 TIMES. WRITE sy-index. EXIT. ENDDO. WRITE sy-index. ENDDO."), ["1", "1", "1", "2"]);
});

test("CONTINUE skips remaining statements and EXIT terminates remaining iterations", () => {
  assert.deepEqual(output("DO 5 TIMES. IF sy-index = 2. CONTINUE. ENDIF. IF sy-index = 4. EXIT. ENDIF. WRITE sy-index. ENDDO."), ["1", "3"]);
  rejects("EXIT.");
  rejects("CONTINUE.");
});

test("APPEND copies work areas and snapshots retain their original table rows", () => {
  const source = "TYPES: BEGIN OF ty_employee, id TYPE i, name TYPE string, END OF ty_employee. DATA employees TYPE STANDARD TABLE OF ty_employee WITH EMPTY KEY. DATA employee TYPE ty_employee. employee-id = 1. employee-name = 'A'. APPEND employee TO employees. employee-id = 2. employee-name = 'B'. APPEND employee TO employees. LOOP AT employees INTO employee. WRITE employee-name. ENDLOOP.";
  const events = simulate(source);
  const tables = events.map(e => e.memory.employees).filter(Array.isArray);
  assert.ok(tables.some(t => t.length === 1));
  assert.deepEqual(tables.find(t => t.length === 1), [{ id: 1, name: "A" }]);
  assert.deepEqual(events.at(-1)!.memory.employees, [{ id: 1, name: "A" }, { id: 2, name: "B" }]);
  assert.deepEqual(events.at(-1)!.output, ["A", "B"]);
  const selected = events.filter(e => e.operation === "write").map(e => e.tableSelection);
  assert.deepEqual(selected.map(s => s?.index), [0, 1]);
  assert.ok(selected.every(s => s?.name === "employees"));
  assert.deepEqual(selected[0]?.row, { id: 1, name: "A" });
});

test("invalid table operations and unbalanced loops report simulator diagnostics", () => {
  for (const source of ["DO 2 TIMES. WRITE 1.", "ENDDO.", "DATA n TYPE i. APPEND n TO n.", "DATA n TYPE i. LOOP AT n INTO n. ENDLOOP.", "SELECT * FROM employees."])
    rejects(source);
});

test("inline LOOP work area infers the row type and cannot redeclare an existing name", () => {
  assert.deepEqual(output("DATA numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY. APPEND 7 TO numbers. APPEND 11 TO numbers. LOOP AT numbers INTO DATA(number). WRITE number. ENDLOOP."), ["7", "11"]);
  rejects("DATA numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY. DATA number TYPE i. LOOP AT numbers INTO DATA(number). ENDLOOP.");
});

test("all nine fundamentals have executable examples and behavior-graded challenges", () => {
  assert.ok(missions.length >= 9);
  for (const mission of missions.slice(3, 9)) {
    assert.ok(simulate(mission.example).length > 0, mission.id);
    assert.ok(mission.tokens.length > 0, mission.id);
    assert.ok(mission.objectives.every(o => o.en && o.ar), mission.id);
    for (const challenge of mission.challenges ?? [mission]) {
      assert.equal(evaluate(challenge.solution, challenge.id).correct, true, challenge.id);
      const hardcoded = challenge.expected.split("\n").map(line => `WRITE '${line.replaceAll("'", "''")}'.`).join("\n");
      assert.equal(evaluate(hardcoded, challenge.id).correct, false, `${challenge.id}: hard-coded output`);
    }
  }
});

test("legacy foundation records survive normalization and repeated completion cannot duplicate XP", () => {
  const old = { labs: ["orientation", "addition", "structures", "conditions"], missions: ["addition", "structures", "conditions"], current: "conditions", results: { addition: { attempts: 2, passed: true } } };
  const progress = normalizeProgress(old);
  assert.deepEqual(progress.missions, old.missions);
  assert.deepEqual(progress.labs, old.labs);
  assert.deepEqual(progress.results, old.results);
  assert.equal(progress.current, old.current);
  assert.equal(progress.version, 2);
  assert.equal(unlocked(missions[3].id, progress), true);
  assert.equal(earnedXP(normalizeProgress({ ...old, missions: [...old.missions, ...old.missions] })), earnedXP(progress));
});
