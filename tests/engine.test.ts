import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, simulate, evaluate, SimulationError } from "../src/lib/engine";
import {
  additionExample,
  structureExample,
  conditionalExample,
  missions,
} from "../src/lib/curriculum";
import {
  normalizeProgress,
  initialProgress,
  unlocked,
  earnedXP,
} from "../src/lib/progress";
function fails(source: string, code: string) {
  assert.throws(
    () => simulate(source),
    (e: unknown) => e instanceof SimulationError && e.code === code,
  );
}
test("addition uses integer values and immutable snapshots", () => {
  const events = simulate(additionExample);
  assert.equal(events.length, 5);
  assert.equal(events[2].memory.lv_result, 0);
  assert.equal(events[3].memory.lv_result, 13);
  assert.deepEqual(events[4].output, ["13"]);
  assert.deepEqual(events[2].output, []);
  assert.deepEqual(events[3].changed, ["lv_result"]);
});
test("source ranges retain complete multi-line statements and comments", () => {
  const source = '* note\nDATA lv_a\n TYPE i VALUE 5. " note\nWRITE lv_a.';
  const events = simulate(source);
  assert.equal(events.length, 2);
  assert.equal(events[0].range.startLine, 2);
  assert.equal(events[0].range.endLine, 3);
  assert.equal(events[0].statement, "DATA lv_a\n TYPE i VALUE 5.");
  assert.equal(events[1].range.startLine, 4);
});
test("missing periods have a useful range and diagnostic", () => {
  fails("DATA lv_age TYPE i\nlv_age = 25.", "period");
  fails("WRITE 5", "period");
});
test("structure definition does not allocate data; DATA does", () => {
  const e = simulate(structureExample);
  assert.equal(e.length, 5);
  assert.deepEqual(Object.keys(e[0].memory), []);
  assert.deepEqual(e[1].memory.ls_employee, { id: 0, name: "" });
  assert.deepEqual(e[2].memory.ls_employee, { id: 101, name: "" });
  assert.deepEqual(e[3].memory.ls_employee, { id: 101, name: "Ahmed" });
  assert.deepEqual(e[3].changed, ["ls_employee-name"]);
  assert.equal(e[0].range.endLine, 4);
  assert.deepEqual(e[4].output, ["Ahmed"]);
});
test("unknown variables and missing components are rejected including skipped branches", () => {
  fails("WRITE missing.", "unknown");
  fails(
    structureExample.replace("ls_employee-name =", "ls_employee-age ="),
    "component",
  );
  fails(
    "DATA total TYPE i VALUE 1200. IF total >= 1000. WRITE total. ELSE. WRITE missing. ENDIF.",
    "unknown",
  );
});
test("type mismatch and invalid declarations are rejected", () => {
  fails("DATA n TYPE i VALUE 'text'.", "type");
  fails("DATA 2age TYPE i.", "declaration");
  fails("DATA n TYPE missing.", "type");
  fails("DATA n TYPE i. n = 'text'.", "type");
  fails("DATA n TYPE i. DATA n TYPE i.", "declaration");
  fails(
    structureExample.replace("END OF ty_employee", "END OF wrong"),
    "declaration",
  );
});
test("incorrect component access is rejected", () => {
  fails(
    structureExample.replace("ls_employee-name =", "ls_employee.name ="),
    "access",
  );
  fails("DATA n TYPE i. n-field = 5.", "access");
});
test("conditional regression produces four semantic events and never executes Review", () => {
  const e = simulate(conditionalExample);
  assert.equal(e.length, 4);
  assert.deepEqual(
    e.map((x) => x.operation),
    ["declare", "condition", "write", "end"],
  );
  assert.deepEqual(e[1].condition, {
    expression: "1200 >= 1000",
    result: true,
  });
  assert.equal(e[2].range.startLine, 4);
  assert.deepEqual(e[2].output, ["Approved"]);
  assert.equal(e[3].range.startLine, 7);
  assert.match(
    conditionalExample.slice(
      e[3].skippedRanges[0].start,
      e[3].skippedRanges[0].end,
    ),
    /Review/,
  );
  assert.ok(
    !e.some((x) => x.operation === "write" && x.statement.includes("Review")),
  );
});
test("condition false and equality boundary select correct output", () => {
  for (const n of [800, 1000, 1200])
    assert.deepEqual(
      simulate(conditionalExample.replace("1200", String(n))).at(-1)?.output,
      [n >= 1000 ? "Approved" : "Review"],
    );
});
test("nested conditions preserve branch semantics", () => {
  const e = simulate(
    "DATA a TYPE i VALUE 5. IF a > 3. IF a = 5. WRITE 'yes'. ELSE. WRITE 'no'. ENDIF. ELSE. WRITE 'other'. ENDIF.",
  );
  assert.deepEqual(e.at(-1)?.output, ["yes"]);
});
test("malformed blocks, strings, operations, and integer overflow fail", () => {
  fails("DATA a TYPE i. IF a = 0. WRITE a.", "block");
  fails("ENDIF.", "block");
  fails("WRITE 'unfinished.", "string");
  assert.throws(() => simulate("LOOP AT x."));
  fails("DATA x TYPE i VALUE 2147483647. x = x + 1.", "range");
});
test("escaped quotes, periods, and case insensitive identifiers", () => {
  assert.deepEqual(
    simulate("data LV_NAME type string value 'It''s ABAP.'. write lv_name.").at(
      -1,
    )?.output,
    ["It's ABAP."],
  );
});
test("mission solutions pass and hardcoded arithmetic does not", () => {
  for (const m of missions)
    assert.equal(evaluate(m.solution, m.id).correct, true);
  assert.equal(evaluate("WRITE 30.", "addition").correct, false);
  assert.equal(
    evaluate(
      "DATA a TYPE i VALUE 10. DATA b TYPE i VALUE 20. DATA c TYPE i. c = 10 + 20. WRITE c.",
      "addition",
    ).correct,
    false,
  );
  assert.equal(evaluate(missions[0].starter, "addition").correct, false);
});
test("product challenge checks fields, values, and component output", () => {
  assert.equal(
    evaluate(
      missions[1].solution.replace("quantity = 12", "quantity = 1"),
      "structures",
    ).correct,
    false,
  );
  assert.equal(
    evaluate(
      missions[1].solution.replace(
        "WRITE ls_product-name.",
        "WRITE 'Keyboard'.",
      ),
      "structures",
    ).correct,
    false,
  );
});
test("mission prerequisites and XP prevent duplicate rewards", () => {
  assert.equal(unlocked("addition", initialProgress), false);
  const p = normalizeProgress({
    labs: ["orientation", "addition", "structures"],
    missions: ["addition", "addition", "structures"],
    current: "structures",
  });
  assert.equal(unlocked("structures", p), true);
  assert.equal(earnedXP(p), 275);
  assert.equal(p.missions.length, 2);
  assert.equal(
    normalizeProgress({ missions: ["structures"] }).missions.length,
    0,
  );
  assert.equal(parse(additionExample)[0].kind, "data");
});
