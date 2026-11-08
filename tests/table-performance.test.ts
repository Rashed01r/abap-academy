import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate, evaluate, SimulationError } from "../src/lib/engine";
import { tablePerformanceExample, tablePerformanceMission, tablePerformanceOutput, tablePerformanceSetup, tablePerformanceSolution } from "../src/lib/table-performance-mission";

const reads = (code: string) => simulate(code).filter(e => e.operation === "read").map(e => e.lookup!);

test("English-only lesson whose example shows 16 linear checks and 5 binary checks", () => {
  assert.equal(tablePerformanceMission.title.ar, undefined);
  assert.equal(simulate(tablePerformanceExample).at(-1)!.output.join("\n"), tablePerformanceOutput);
  const [linear, binary] = reads(tablePerformanceExample);
  assert.deepEqual(linear.checked, Array.from({ length: 16 }, (_, i) => i + 1));
  assert.equal(linear.binary, undefined);
  assert.deepEqual(binary.checked, [9, 5, 3, 2, 1]);
  assert.equal(binary.binary, true);
});
test("BINARY SEARCH on unsorted data misses an existing row without an error", () => {
  const out = simulate(tablePerformanceExample.replace("SORT lt_ids BY table_line.", "* SORT lt_ids BY table_line.")).at(-1)!.output;
  assert.deepEqual(out, ["16", "Not found"]);
});
test("binary misses follow SAP: sy-subrc 4 with the insert position, or 8 with lines + 1", () => {
  const sorted = `${tablePerformanceSetup}\nSORT lt_ids BY table_line.\n`;
  const low = simulate(`${sorted}lv_search = 50.\nREAD TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search BINARY SEARCH.\nWRITE sy-subrc.\nWRITE sy-tabix.\nWRITE lv_found.`).at(-1)!;
  assert.deepEqual(low.output, ["4", "1", "0"]); // target unchanged
  const high = simulate(`${sorted}lv_search = 500.\nREAD TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search BINARY SEARCH.\nWRITE sy-subrc.\nWRITE sy-tabix.`).at(-1)!;
  assert.deepEqual(high.output, ["8", "17"]);
  const middle = simulate(`DATA lt TYPE STANDARD TABLE OF i WITH EMPTY KEY.\nDATA lv TYPE i.\nAPPEND 10 TO lt.\nAPPEND 30 TO lt.\nREAD TABLE lt INTO lv WITH KEY table_line = 20 BINARY SEARCH.\nWRITE sy-subrc.\nWRITE sy-tabix.`).at(-1)!;
  assert.deepEqual(middle.output, ["4", "2"]);
});
test("binary search returns the first of duplicate keys and works on structure components", () => {
  const out = simulate(`TYPES: BEGIN OF ty_row,\n  id TYPE i,\n  name TYPE string,\nEND OF ty_row.\nDATA lt TYPE STANDARD TABLE OF ty_row WITH EMPTY KEY.\nDATA ls TYPE ty_row.\nls-id = 1.\nls-name = 'a'.\nAPPEND ls TO lt.\nls-id = 2.\nls-name = 'b'.\nAPPEND ls TO lt.\nls-name = 'c'.\nAPPEND ls TO lt.\nls-id = 3.\nAPPEND ls TO lt.\nREAD TABLE lt INTO ls WITH KEY id = 2 BINARY SEARCH.\nWRITE ls-name.\nWRITE sy-tabix.`).at(-1)!.output;
  assert.deepEqual(out, ["b", "2"]);
});
test("BINARY SEARCH with INDEX or misplaced is rejected", () => {
  assert.throws(() => simulate(`${tablePerformanceSetup}\nREAD TABLE lt_ids INTO lv_found INDEX 1 BINARY SEARCH.`), (e: unknown) => e instanceof SimulationError && e.code === "unsupported");
  assert.throws(() => simulate(`${tablePerformanceSetup}\nREAD TABLE lt_ids INTO lv_found BINARY SEARCH WITH KEY table_line = 1.`), SimulationError);
});
test("performance grader accepts sort-then-binary and rejects linear, unsorted, late sort or canned answers", () => {
  assert.equal(evaluate(tablePerformanceSolution, "data-performance-lookup").correct, true);
  for (const code of [
    tablePerformanceSolution.replace(" BINARY SEARCH.", "."),
    tablePerformanceSolution.replace("SORT lt_ids BY table_line.\n", ""),
    tablePerformanceSolution.replace("SORT lt_ids BY table_line.", "SORT lt_ids BY table_line DESCENDING."),
    `${tablePerformanceSetup}\nWRITE / 1.`,
    tablePerformanceSolution.replace("WRITE / 'Not found'.", "WRITE / 0."),
    tablePerformanceSolution + "\nDELETE lt_ids INDEX 1.",
  ]) assert.equal(evaluate(code, "data-performance-lookup").correct, false, code);
});
