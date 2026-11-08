import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate, evaluate } from "../src/lib/engine";
import { employeeManagerExample, employeeManagerMission, employeeManagerOutput, employeeManagerRaiseSolution, employeeManagerReportSolution, employeeManagerSetup } from "../src/lib/employee-manager-mission";

test("English-only capstone whose example raises, removes and reports", () => {
  assert.equal(employeeManagerMission.title.ar, undefined);
  const final = simulate(employeeManagerExample).at(-1)!;
  assert.equal(final.output.join("\n"), employeeManagerOutput);
  assert.deepEqual(final.memory.lt_employees, [{ id: 102, name: "Sara", salary: 8500 }, { id: 103, name: "Omar", salary: 6000 }]);
  assert.equal(simulate(employeeManagerRaiseSolution).at(-1)!.output.join("\n"), "8500");
  assert.equal(simulate(employeeManagerReportSolution).at(-1)!.output.join("\n"), "Ahmed\nOmar\n2\n11000");
});
test("the quiz answer matches the program with a missing ID", () => {
  const out = simulate(employeeManagerExample.replace("DATA lv_id TYPE i VALUE 102.", "DATA lv_id TYPE i VALUE 999.")).at(-1)!.output;
  assert.deepEqual(out, ["Not found", "Sara", "Omar", "2", "14000"]);
});
test("raise grader accepts line_index or READ TABLE approaches and rejects unsaved, canned or unsafe changes", () => {
  assert.equal(evaluate(employeeManagerRaiseSolution, "data-manager-raise").correct, true);
  const readTable = `${employeeManagerSetup}\nREAD TABLE lt_employees INTO ls_employee WITH KEY id = lv_id.\nIF sy-subrc = 0.\n  lv_position = sy-tabix.\n  ls_employee-salary = ls_employee-salary + lv_raise.\n  MODIFY lt_employees FROM ls_employee INDEX lv_position.\n  WRITE / ls_employee-salary.\nELSE.\n  WRITE / 'Not found'.\nENDIF.`;
  assert.equal(evaluate(readTable, "data-manager-raise").correct, true);
  for (const code of [
    employeeManagerRaiseSolution.replace("  MODIFY lt_employees FROM ls_employee INDEX lv_position.\n", ""),
    `${employeeManagerSetup}\nWRITE / 8500.`,
    employeeManagerRaiseSolution.replace("ls_employee-salary + lv_raise", "ls_employee-salary + 500"),
    employeeManagerRaiseSolution.replace("WRITE / 'Not found'.", "WRITE / 0."),
    employeeManagerRaiseSolution.replace("INDEX lv_position.", "INDEX 2."),
  ]) assert.equal(evaluate(code, "data-manager-raise").correct, false, code);
});
test("report grader checks the deletion, names, count and total on changed data", () => {
  assert.equal(evaluate(employeeManagerReportSolution, "data-manager-report").correct, true);
  for (const code of [
    `${employeeManagerSetup}\nWRITE / 'Ahmed'.\nWRITE / 'Omar'.\nWRITE / 2.\nWRITE / 11000.`,
    employeeManagerReportSolution.replace("DELETE lt_employees INDEX lv_position.", "DELETE lt_employees INDEX 2."),
    employeeManagerReportSolution.replace("lv_total = lv_total + ls_employee-salary.", "lv_total = 11000."),
    employeeManagerReportSolution.replace("IF lv_position > 0.\n  DELETE", "IF lv_position >= 0.\n  DELETE"),
  ]) assert.equal(evaluate(code, "data-manager-report").correct, false, code);
});
