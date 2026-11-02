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
    for (const c of m.challenges || [m]) assert.equal(evaluate(c.solution, c.id).correct, true);
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
test("implemented missions are freely accessible and XP prevents duplicate rewards", () => {
  assert.equal(unlocked("addition", initialProgress), true);
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
    1,
  );
  assert.equal(parse(additionExample)[0].kind, "data");
});
test("ELSEIF selects only the first true branch and emits only tested conditions", () => {
  const template = `DATA score TYPE i VALUE 75.
IF score >= 80.
 WRITE 'High'.
ELSEIF score >= 50.
 WRITE 'Medium'.
ELSEIF score >= 0.
 WRITE 'Low'.
ELSE.
 WRITE 'Invalid'.
ENDIF.`;
  for (const [value, label, conditions] of [[100, "High", 1], [80, "High", 1], [79, "Medium", 2], [50, "Medium", 2], [0, "Low", 3], [-1, "Invalid", 3]] as const) {
    const code = template.replace("VALUE 75", `VALUE ${value}`);
    const events = simulate(code);
    assert.deepEqual(events.at(-1)!.output, [label]);
    assert.equal(events.filter(e => e.operation === "condition").length, conditions);
    assert.equal(events.filter(e => e.operation === "end").length, 1);
    assert.equal(events.filter(e => e.operation === "write").length, 1);
    assert.ok(events.at(-1)!.skippedRanges.length >= 2);
    for (const e of events) assert.equal(code.slice(e.range.start, e.range.end), e.statement);
  }
});
test("nested IF and ELSEIF keep independent boundaries and snapshots", () => {
  const code = `DATA score TYPE i VALUE 75.
DATA result TYPE i.
IF score > 0.
 IF score >= 80.
  result = 3.
 ELSEIF score >= 50.
  result = 2.
 ELSE.
  result = 1.
 ENDIF.
ELSE.
 result = 0.
ENDIF.
WRITE result.`;
  const events = simulate(code);
  assert.deepEqual(events.at(-1)!.output, ["2"]);
  assert.equal(events[1].memory.result, 0);
  assert.equal(events.at(-1)!.memory.result, 2);
  assert.equal(events.filter(e => e.operation === "end").length, 2);
  const elseif = events.find(e => e.statement.startsWith("ELSEIF"))!;
  assert.equal(elseif.condition?.expression, "75 >= 50");
  assert.equal(elseif.range.startLine, 6);
  assert.deepEqual(elseif.output, []);
});
test("all branches are validated even when unselected, with accurate ELSEIF locations", () => {
  assert.throws(() => simulate("IF 1 = 1. WRITE 1.\nELSEIF missing > 0. WRITE 2. ENDIF."), (e: unknown) => e instanceof SimulationError && e.code === "unknown" && e.range.startLine === 2);
  fails("IF 1 = 1. ELSE. ELSEIF 2 = 2. ENDIF.", "block");
  fails("IF 1 = 1. ELSE. ELSE. ENDIF.", "block");
  fails("ELSEIF 1 = 1. ENDIF.", "block");
  fails("IF 1 = 1. ELSEIF 2 = 2. WRITE 3.", "block");
  fails("IF 1 = 1. ELSEIF 2 = 2. DATA x TYPE i. ENDIF.", "unsupported");
  fails("SELECT * FROM employees.", "unsupported");
});
test("Conditions assessments reject hardcoding, threshold errors, and overwritten inputs", () => {
  const [positive, bonus, ranges] = missions.find(m => m.id === "conditions")!.challenges!;
  assert.equal(evaluate(positive.solution.replace("> 0", ">= 0"), positive.id).correct, false);
  assert.deepEqual(evaluate(positive.solution.replace("> 0", ">= 0"), positive.id).failure, { name: "lv_number", input: 0, expected: "Not positive", actual: "Positive" });
  assert.equal(evaluate(bonus.solution.replace(">= 5000", "> 5000"), bonus.id).correct, false);
  assert.equal(evaluate(ranges.solution.replace(">= 80", ">= 79"), ranges.id).correct, false);
  assert.equal(evaluate("DATA lv_number TYPE i VALUE 4. WRITE 'Positive'.", positive.id).correct, false);
  assert.equal(evaluate(positive.solution.replace("IF lv_number", "lv_number = 4.\nIF lv_number"), positive.id).correct, false);
  assert.equal(evaluate(ranges.starter + "WRITE 'Medium'.", ranges.id).correct, false);
});
test("registry migration retains foundation results, unlocks Conditions, and deduplicates XP", () => {
  const old = { labs: ["orientation", "addition", "structures"], missions: ["addition", "structures"], current: "structures", results: { addition: { attempts: 3, passed: true } } };
  const migrated = normalizeProgress(old);
  assert.equal(earnedXP(migrated), 275);
  assert.deepEqual(migrated.missions, old.missions);
  assert.deepEqual(migrated.results, old.results);
  assert.equal(unlocked("conditions", migrated), true);
  assert.equal(unlocked("do", migrated), true);
  const completed = normalizeProgress({ ...migrated, labs: [...migrated.labs, "conditions"], missions: [...migrated.missions, "conditions", "conditions"] });
  assert.equal(earnedXP(completed), 475);
  assert.equal(completed.missions.length, 3);
});
test("curriculum prerequisites are ordered and Conditions teaches each assessed decision construct", () => {
  const seen = new Set(["orientation"]);
  for (const mission of missions) {
    assert.ok(seen.has(mission.prerequisite), `${mission.id} has an earlier prerequisite`);
    assert.ok(!seen.has(mission.id), "mission IDs are unique");
    seen.add(mission.id);
    assert.ok(mission.objectives.length && mission.practice.en && mission.practice.ar);
    simulate(mission.example);
  }
  const conditions = missions.find(m => m.id === "conditions")!;
  const taught = new Set(conditions.tokens.map(t => t.id));
  for (const id of ["if", "else", "elseif", "endif", "compare", "compare-assignment", "write", "period"]) assert.ok(taught.has(id));
  assert.equal(conditions.challenges!.length, 3);
});
test("large string tables are stopped by a memory budget before snapshots expand without bound", () => {
  const source = `DATA text TYPE string VALUE '${"x".repeat(8000)}'. DATA rows TYPE STANDARD TABLE OF string WITH EMPTY KEY. DO 100 TIMES. APPEND text TO rows. ENDDO.`;
  assert.throws(() => simulate(source), (e: unknown) => e instanceof SimulationError && e.code === "limit" && e.detail === "memory");
});
test("CONTINUE marks the whole skipped nested block rather than only its header", () => {
  const source = "DO 1 TIMES.\nCONTINUE.\nIF 1 = 1.\nWRITE 'skipped'.\nENDIF.\nENDDO.";
  const event = simulate(source).find(e => e.operation === "control")!;
  assert.equal(source.slice(event.skippedRanges[0].start, event.skippedRanges[0].end), "IF 1 = 1.\nWRITE 'skipped'.\nENDIF.");
});
test("row selection survives nested counted loops and clears after the final row", () => {
  const events = simulate("DATA rows TYPE STANDARD TABLE OF i WITH EMPTY KEY. APPEND 4 TO rows. LOOP AT rows INTO DATA(row). DO 2 TIMES. WRITE row. ENDDO. ENDLOOP.");
  assert.deepEqual(events.filter(e => e.operation === "write").map(e => e.tableSelection?.index), [0, 0]);
  assert.equal(events.at(-1)!.tableSelection, undefined);
});
