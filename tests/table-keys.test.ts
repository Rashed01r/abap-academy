import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeKeyDesign, keySamples, keySnapshot, sameKey } from "../src/lib/table-keys";
import { tableKeyMission as mission } from "../src/lib/table-key-mission";
import { evaluate, simulate } from "../src/lib/engine";
import { completeMission, earnedXP, normalizeProgress } from "../src/lib/progress";

test("key equality compares the whole selected tuple, not position or the whole row", () => {
  assert.equal(sameKey(keySamples[0], keySamples[1], ["id"]), true);
  assert.equal(sameKey(keySamples[0], keySamples[1], ["department", "id"]), false);
  assert.equal(sameKey(keySamples[0], keySamples[3], ["department", "id"]), true);
  assert.equal(sameKey(keySamples[0], keySamples[3], ["department", "id", "name"]), false);
});
test("unique and non-unique policies retain accurate independent before/after snapshots", () => {
  const unique = keySnapshot(["department", "id"], true, 5);
  assert.deepEqual(unique.rows, keySamples.slice(0, 3));
  assert.deepEqual(unique.steps.map(s => s.accepted), [true, true, true, false, false]);
  assert.equal(unique.steps[3].conflict, 0);
  assert.deepEqual(unique.steps[0].before, []);
  assert.deepEqual(unique.steps[0].after, [keySamples[0]]);
  assert.deepEqual(unique.steps[3].before, unique.steps[3].after);
  assert.deepEqual(keySnapshot(["id"], true, 3).rows, [keySamples[0], keySamples[2]]);
  assert.deepEqual(keySnapshot(["department", "id"], false, 5).rows, keySamples);
  assert.deepEqual(keySnapshot([], false, 5).rows, keySamples);
  assert.deepEqual(keySnapshot(["id"], true, 0).rows, []);
});
test("identity assessment requires a semantic design and all independent predictions", () => {
  const answers = [true, false, true];
  assert.equal(gradeKeyDesign(["id", "department"], true, answers).correct, true);
  for (const fields of [["id"], ["department"], ["name"], ["department", "id", "name"]] as const)
    assert.equal(gradeKeyDesign(fields, true, answers).correct, false);
  assert.equal(gradeKeyDesign(["department", "id"], false, answers).correct, false);
  assert.equal(gradeKeyDesign(["department", "id"], true, []).correct, false);
  assert.equal(gradeKeyDesign(["department", "id"], true, [true, true, true]).correct, false);
});
test("matching code is graded against changed query values, changed imports and no matches", () => {
  const c = mission.challenges![0];
  assert.deepEqual(simulate(c.solution).at(-1)!.output, ["Ahmed", "Noura", "2"]);
  assert.equal(evaluate(c.solution, c.id).correct, true);
  const wrong = [
    c.solution.replace("WRITE ls_employee-name.", "WRITE 'Ahmed'."),
    c.solution.replace("ls_employee-department = lv_department", "1 = 1"),
    c.solution.replace("ls_employee-id = lv_id", "1 = 1"),
    c.solution.replace("ls_employee-department = lv_department", "ls_employee-department = 'IT'"),
    c.solution.replace("ls_employee-id = lv_id", "ls_employee-id = 101"),
    c.solution.replace("lv_matches = lv_matches + 1.", "lv_matches = 2."),
    c.solution.replace("WRITE lv_matches.", "WRITE 2."),
    c.solution.replace("lv_matches = lv_matches + 1.", "lv_matches = lv_matches + 1. EXIT."),
    c.solution.replace("'Noura'", "'Sara'"),
  ];
  for (const source of wrong) assert.equal(evaluate(source, c.id).correct, false, source);
});
test("key mission preserves v2 achievements and needs both assessments, knowledge check and once-only XP", () => {
  const previous = normalizeProgress({version:2, missions:["structures"], labs:["addition"], results:{while:{attempts:3,passed:false}}});
  const codeOnly = {...previous, passedChallenges:[...previous.passedChallenges!, mission.challenges![0].id]};
  assert.equal(completeMission(codeOnly, mission.id, true), codeOnly);
  const designOnly = {...previous, passedChallenges:[...previous.passedChallenges!, ...mission.requiredActivities!]};
  assert.equal(completeMission(designOnly, mission.id, true), designOnly);
  const both = {...codeOnly, passedChallenges:[...codeOnly.passedChallenges, ...mission.requiredActivities!]};
  assert.equal(completeMission(both, mission.id, false), both);
  const complete = completeMission(both, mission.id, true);
  assert.equal(earnedXP(complete), earnedXP(previous) + mission.xp);
  const restored = normalizeProgress(complete);
  assert.deepEqual(restored.missions, complete.missions);
  assert.deepEqual(restored.passedChallenges, complete.passedChallenges);
  assert.deepEqual(normalizeProgress(restored), restored);
  assert.deepEqual(complete.labs, previous.labs);
  assert.deepEqual(complete.results, previous.results);
  assert.equal(earnedXP(completeMission(complete, mission.id, true)), earnedXP(complete));
});
