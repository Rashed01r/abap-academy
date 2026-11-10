import { test } from "node:test";
import assert from "node:assert/strict";
import { missions, paths } from "../src/lib/curriculum";
import { guidedDefinitions, gradeGuided, validateGuided } from "../src/lib/guided-curriculum";
import { getAnatomy } from "../src/lib/anatomy-content";
import { validateAnatomy } from "../src/lib/code-anatomy";
import { allChallengesPassed, completeMission, earnedXP, initialProgress, normalizeProgress, visitMission } from "../src/lib/progress";

test("Pass A covers every path with complete guided content and explicit runtime boundaries", () => {
  assert.equal(paths.length, 8);
  paths.forEach(p => assert.ok(missions.some(m => m.pathId === p.id), `${p.id} is playable`));
  for (const d of guidedDefinitions) {
    assert.deepEqual(validateGuided(d), []);
    const m = missions.find(m => m.id === d.id)!;
    assert.equal(m.guided, d);
    assert.deepEqual(m.challenges, []);
    assert.deepEqual(m.requiredActivities, [`${d.id}-assessment`]);
    const doc = getAnatomy(d.id, d.code);
    assert.equal(doc.referenceOnly, true);
    validateAnatomy(doc, d.code);
    assert.ok(doc.groups.length >= 3);
  }
});

test("guided grading requires every scenario and rejects missing, wrong and stale answers", () => {
  for (const d of guidedDefinitions) {
    const correct = Object.fromEntries(d.decisions.map(item => [item.id, item.correct]));
    assert.equal(gradeGuided(d, correct).passed, true);
    assert.equal(gradeGuided(d, {}).passed, false);
    assert.equal(gradeGuided(d, {unknown: "correct"}).passed, false);
    for (const decision of d.decisions) {
      const missing = {...correct}; delete missing[decision.id];
      assert.equal(gradeGuided(d, missing).passed, false);
      const wrong = decision.options.find(option => option.id !== decision.correct)!;
      const result = gradeGuided(d, {...correct, [decision.id]: wrong.id});
      assert.equal(result.passed, false);
      assert.equal(result.decisions.filter(d => !d.correct).length, 1);
    }
  }
});

test("free guided exploration preserves prior achievements and gates once-only XP", () => {
  let p = normalizeProgress({...initialProgress, missions: ["structures"], results: {structures: {attempts: 3, passed: true}}});
  const before = earnedXP(p);
  for (const d of guidedDefinitions) {
    p = visitMission(p, d.id);
    assert.equal(allChallengesPassed(p, d.id), false);
    assert.equal(completeMission(p, d.id, true), p);
    assert.equal(earnedXP(p), before);
  }
  const d = guidedDefinitions[0];
  p = {...p, passedChallenges: [`${d.id}-assessment`]};
  assert.equal(completeMission(p, d.id, false), p);
  p = completeMission(p, d.id, true);
  assert.equal(earnedXP(p), before + d.xp);
  assert.equal(earnedXP(completeMission(p, d.id, true)), earnedXP(p));
  assert.deepEqual(normalizeProgress(p).results.structures, {attempts: 3, passed: true});
  assert.ok(normalizeProgress(p).passedChallenges?.includes(`${d.id}-assessment`));
});

test("content validation rejects broken graphs, missing translations and answerless decisions", () => {
  const d = guidedDefinitions[0];
  assert.ok(validateGuided({...d, relations: [{...d.relations[0], to: "absent"}]}).length);
  assert.ok(validateGuided({...d, brief: {en: "", ar: "Retained"}}).length);
  assert.ok(validateGuided({...d, decisions: [{...d.decisions[0], correct: "absent"}, ...d.decisions.slice(1)]}).length);
  assert.ok(validateGuided({...d, decisions: []}).length);
});
