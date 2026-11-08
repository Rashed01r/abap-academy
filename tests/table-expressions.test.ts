import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate, evaluate, SimulationError } from "../src/lib/engine";
import { tableExpressionsExample, tableExpressionsMission, tableExpressionsOutput, tableExpressionsSetup, tableExpressionsSolution } from "../src/lib/table-expressions-mission";

const run = (code: string) => simulate(`${tableExpressionsSetup}\n${code}`).at(-1)!;
const fails = (code: string, kind: SimulationError["code"]) =>
  assert.throws(() => simulate(`${tableExpressionsSetup}\n${code}`), (e: unknown) => e instanceof SimulationError && e.code === kind);

test("English-only mission with a runnable example and solution", () => {
  assert.equal(tableExpressionsMission.title.ar, undefined);
  assert.equal(simulate(tableExpressionsExample).at(-1)!.output.join("\n"), tableExpressionsOutput);
  assert.equal(simulate(tableExpressionsSolution).at(-1)!.output.join("\n"), "Sara\n8000\n2");
});
test("position and key reads copy rows; -component reads one field", () => {
  assert.deepEqual(run("WRITE lt_employees[ 3 ]-name.").output, ["Omar"]);
  const final = run("ls_employee = lt_employees[ id = lv_id ].\nls_employee-name = 'Changed'.\nWRITE lt_employees[ 2 ]-name.");
  assert.deepEqual(final.output, ["Sara"]); // the read was a copy
  assert.deepEqual(run("WRITE lt_employees[ name = 'Omar' salary = 6000 ]-id.").output, ["103"]);
  assert.deepEqual(run("APPEND lt_employees[ 1 ] TO lt_employees.\nWRITE lt_employees[ 4 ]-name.").output, ["Ahmed"]);
});
test("a miss raises CX_SY_ITAB_LINE_NOT_FOUND: TRY skips the rest and runs CATCH; uncaught it stops the program", () => {
  const events = simulate(`${tableExpressionsSetup}\nTRY.\n  ls_employee = lt_employees[ id = 999 ].\n  WRITE 'skipped'.\nCATCH cx_sy_itab_line_not_found.\n  WRITE 'caught'.\nENDTRY.\nWRITE ls_employee-name.`);
  assert.deepEqual(events.at(-1)!.output, ["caught", "Omar"]); // work area unchanged
  const caught = events.find(e => e.operation === "catch")!;
  assert.equal(caught.lookup?.found, false);
  assert.equal(caught.lookup?.raised, true);
  assert.equal(caught.skippedRanges.length, 2);
  fails("ls_employee = lt_employees[ id = 999 ].", "notfound");
  fails("WRITE lt_employees[ 0 ]-name.", "notfound");
  fails("WRITE lt_employees[ 4 ]-name.", "notfound");
  assert.deepEqual(run("TRY.\n  WRITE lt_employees[ 1 ]-name.\nCATCH cx_sy_itab_line_not_found.\n  WRITE 'x'.\nENDTRY.").output, ["Ahmed"]);
});
test("table expressions leave sy-subrc and sy-tabix unchanged", () => {
  const final = run("READ TABLE lt_employees INTO ls_employee WITH KEY id = 999.\nls_employee = lt_employees[ id = 103 ].\nWRITE sy-subrc.\nWRITE sy-tabix.");
  assert.deepEqual(final.output, ["4", "0"]);
});
test("line_exists and line_index never raise; IF, ELSEIF and NOT accept the predicate", () => {
  assert.deepEqual(run("lv_position = line_index( lt_employees[ id = 103 ] ).\nWRITE lv_position.\nlv_position = line_index( lt_employees[ id = 9 ] ).\nWRITE lv_position.").output, ["3", "0"]);
  assert.deepEqual(run("IF line_exists( lt_employees[ id = 999 ] ).\n  WRITE 'a'.\nELSEIF NOT line_exists( lt_employees[ id = 101 ] ).\n  WRITE 'b'.\nELSE.\n  WRITE 'c'.\nENDIF.").output, ["c"]);
  const condition = simulate(`${tableExpressionsSetup}\nIF line_exists( lt_employees[ id = lv_id ] ).\nENDIF.`).find(e => e.operation === "condition")!;
  assert.equal(condition.condition?.result, true);
  assert.equal(condition.tableSelection?.index, 1);
});
test("VALUE #( … OPTIONAL ) gives an initial row and DEFAULT gives the fallback", () => {
  assert.deepEqual(run("ls_employee = VALUE #( lt_employees[ id = 999 ] OPTIONAL ).\nWRITE ls_employee-id.\nWRITE ls_employee-name.").output, ["0", ""]);
  assert.deepEqual(run("ls_employee = VALUE #( lt_employees[ id = 999 ] DEFAULT lt_employees[ 1 ] ).\nWRITE ls_employee-name.").output, ["Ahmed"]);
  assert.deepEqual(run("ls_employee = VALUE #( lt_employees[ id = 102 ] OPTIONAL ).\nWRITE ls_employee-name.").output, ["Sara"]);
});
test("TRY inside a loop propagates EXIT; exceptions inside nested IF are caught", () => {
  assert.deepEqual(run("LOOP AT lt_employees INTO ls_employee.\n  TRY.\n    WRITE lt_employees[ id = ls_employee-id + 1 ]-name.\n  CATCH cx_sy_itab_line_not_found.\n    WRITE 'end'.\n    EXIT.\n  ENDTRY.\nENDLOOP.").output, ["Sara", "Omar", "end"]);
  assert.deepEqual(run("TRY.\n  IF lv_id = 102.\n    WRITE lt_employees[ id = 5 ]-name.\n  ENDIF.\n  WRITE 'no'.\nCATCH cx_sy_itab_line_not_found.\n  WRITE 'caught'.\nENDTRY.").output, ["caught"]);
});
test("unsupported or invalid forms are rejected at the source statement", () => {
  fails("lt_employees[ 1 ]-salary = 1.", "unsupported");
  fails("ls_employee = VALUE #( lt_employees[ 1 ]-name OPTIONAL ).", "unsupported");
  fails("ls_employee = lt_employees[ KEY primary_key id = 1 ].", "unsupported");
  fails("TRY.\n  LOOP AT lt_employees INTO ls_employee.\n  ENDLOOP.\nCATCH cx_sy_itab_line_not_found.\nENDTRY.", "unsupported");
  fails("TRY.\nCATCH cx_root.\nENDTRY.", "unsupported");
  fails("IF line_exists( lt_employees[ id = 1 ] ) = 1.\nENDIF.", "unsupported");
  fails("lv_position = lt_employees[ id = 'x' ]-id.", "type");
  fails("lv_position = lt_employees[ 1 ].", "type");
  fails("WRITE lt_employees[ 1 ]-age.", "component");
  fails("lv_name = lv_id[ 1 ].", "type");
  fails("TRY.\n  WRITE 1.\nENDTRY.", "block");
});
test("lookup grader accepts real solutions and rejects canned, position-based or unsafe answers", () => {
  assert.equal(evaluate(tableExpressionsSolution, "data-expression-lookup").correct, true);
  const inline = tableExpressionsSolution.replace("ls_employee = lt_employees[ id = lv_id ].\n    WRITE / ls_employee-name.\n    WRITE / ls_employee-salary.", "lv_name = lt_employees[ id = lv_id ]-name.\n    WRITE / lv_name.\n    WRITE / lt_employees[ id = lv_id ]-salary.");
  assert.equal(evaluate(inline, "data-expression-lookup").correct, true);
  for (const code of [
    `${tableExpressionsSetup}\nWRITE / 'Sara'.\nWRITE / 8000.\nWRITE / 2.`,
    tableExpressionsSolution.replace("ls_employee = lt_employees[ id = lv_id ].", "ls_employee = lt_employees[ 2 ]."),
    tableExpressionsSolution.replace("lv_position = line_index( lt_employees[ id = lv_id ] ).", "lv_position = 2."),
    tableExpressionsSolution.replace("WRITE / 'Not found'.", "WRITE / 'Missing'."),
    tableExpressionsSolution.replace("ls_employee = lt_employees[ id = lv_id ].", "ls_employee = VALUE #( lt_employees[ id = lv_id ] OPTIONAL )."),
    tableExpressionsSolution.replace("TRY.", "READ TABLE lt_employees INTO ls_employee WITH KEY id = lv_id.\nTRY."),
    tableExpressionsSolution + "\nDELETE lt_employees INDEX 1.",
  ]) assert.equal(evaluate(code, "data-expression-lookup").correct, false, code);
});
