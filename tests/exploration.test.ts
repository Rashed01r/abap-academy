import { test } from "node:test";
import assert from "node:assert/strict";
import { missions } from "../src/lib/curriculum";
import { initialProgress, normalizeProgress, unlocked, visitMission, startMission, completeMission, earnedXP } from "../src/lib/progress";
import { categorySnapshot } from "../src/lib/table-categories";
import { evaluate } from "../src/lib/engine";

test("all registered lessons are available without prerequisites; previews are not", () => {
  for (const mission of missions) assert.equal(unlocked(mission.id, initialProgress), true);
  assert.equal(unlocked("cloud-rap-preview", initialProgress), false);
});
test("visiting, starting, labs, challenge passes and completion are independent", () => {
  const mission = missions[4];
  const viewed = visitMission(normalizeProgress(null), mission.id);
  assert.deepEqual(viewed.viewed, [mission.id]);
  assert.deepEqual(viewed.started, []);
  assert.deepEqual(viewed.labs, []);
  assert.equal(earnedXP(viewed), 0);
  const started = startMission(viewed, mission.id);
  assert.deepEqual(started.started, [mission.id]);
  assert.equal(completeMission(started, mission.id, true), started);
  const passed = { ...started, passedChallenges: (mission.challenges || [mission]).map(c => c.id) };
  assert.equal(completeMission(passed, mission.id, false), passed);
  const completed = completeMission(passed, mission.id, true);
  assert.deepEqual(completed.labs, []);
  assert.equal(earnedXP(completed), mission.xp);
  assert.equal(earnedXP(completeMission(completed, mission.id, true)), mission.xp);
  assert.deepEqual(normalizeProgress(completed).missions, [mission.id]);
});
test("v2 migration preserves out-of-order legacy achievements and partial attempts", () => {
  const legacy = { labs: ["structures"], missions: ["structures", "structures"], current: "while", results: { while: { attempts: 7, passed: true } } };
  const p = normalizeProgress(legacy);
  assert.equal(p.version, 2);
  assert.deepEqual(p.missions, ["structures"]);
  assert.deepEqual(p.labs, ["structures"]);
  assert.deepEqual(p.results, legacy.results);
  assert.deepEqual(p.passedChallenges, ["structures"]);
  assert.equal(p.passedChallenges?.some(id => id.startsWith("while-")), false);
  assert.deepEqual(normalizeProgress(p), p);
  const noLab = normalizeProgress({ missions: ["while"] });
  assert.deepEqual(noLab.missions, ["while"]);
  assert.deepEqual(noLab.labs, []);
});
test("recent visits are ordered and deduplicated, with no rewards", () => {
  const p = visitMission(visitMission(visitMission(normalizeProgress(null), "while"), "tables"), "while");
  assert.deepEqual(p.recent, ["while", "tables"]);
  assert.equal(earnedXP(p), 0);
  assert.equal(visitMission(p, "not-implemented"), p);
});
test("category model distinguishes order and unique membership without claiming hashed order", () => {
  assert.deepEqual(categorySnapshot("standard",3), {rows:[30,10,30],duplicate:false});
  assert.deepEqual(categorySnapshot("sorted",3), {rows:[10,30,30],duplicate:false});
  assert.deepEqual(new Set(categorySnapshot("hashed",3).rows), new Set([10,30]));
  assert.equal(categorySnapshot("hashed",3).duplicate,true);
  assert.equal(categorySnapshot("hashed",2).duplicate,false);
  assert.deepEqual(categorySnapshot("sorted",0).rows,[]);
});
test("category mission requires both guided decisions and behavior-graded code", () => {
  const m = missions.find(m=>m.id === "data-table-categories")!;
  const c = m.challenges![0];
  assert.equal(evaluate(c.solution,c.id).correct,true);
  assert.equal(evaluate(c.solution.replace("WRITE lv_id.", "WRITE 30."),c.id).correct,false);
  assert.equal(evaluate(c.solution.replace("APPEND 10", "APPEND 20"),c.id).correct,false);
  const codeOnly = {...normalizeProgress(null),passedChallenges:[c.id]};
  assert.equal(completeMission(codeOnly,m.id,true),codeOnly);
  const both = {...codeOnly,passedChallenges:[c.id,...m.requiredActivities!]};
  assert.equal(earnedXP(completeMission(both,m.id,true)),m.xp);
});
