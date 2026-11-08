import { test } from "node:test";
import assert from "node:assert/strict";
import { allTCodes, tcodeGroups, tcodeIds, tcodeReviewLog, TCODE_XP } from "../src/features/roadmap/data/tcodes";
import { buildRoadmapTree } from "../src/features/roadmap/data/roadmap-tree";
import { missions, paths } from "../src/lib/curriculum";
import { earnedXP, initialProgress, learnTCode, normalizeProgress } from "../src/lib/progress";

test("T-code data: 36 codes in 7 groups, unique ids, English filled, Arabic left empty", () => {
  assert.equal(tcodeGroups.length, 7);
  assert.equal(allTCodes.length, 36);
  assert.equal(new Set(tcodeIds).size, 36);
  assert.equal(new Set(allTCodes.map(t => t.code)).size, 36);
  for (const t of allTCodes) {
    for (const field of [t.title, t.what, t.tip]) {
      assert.ok(field.en.trim(), `${t.code} has English text`);
      assert.equal(field.ar, undefined, `${t.code} has no copied Arabic`);
    }
    assert.ok([1, 2, 3].includes(t.frequency));
  }
  assert.deepEqual(allTCodes.filter(t => t.classic).map(t => t.code).sort(), ["SE11", "SE24", "SE37", "SE38", "SE80"]);
  assert.ok(tcodeReviewLog.length >= 4);
});

test("T-code review fixes are applied", () => {
  const byCode = Object.fromEntries(allTCodes.map(t => [t.code, t]));
  assert.doesNotMatch(byCode.SE10.title.en, /Extended/);
  assert.match(byCode.SE10.what.en, /same Transport Organizer as SE09/);
  assert.match(byCode.SE03.tip.en, /which request has an object locked/);
  assert.match(byCode.SCI.what.en, /ATC/);
});

test("roadmap tree: ABAP root with Learning (real paths and lessons) and Transaction Codes", () => {
  const { root, byId } = buildRoadmapTree();
  assert.deepEqual(root.children.map(c => c.id), ["learn", "tcodes"]);
  const learn = byId.get("learn")!;
  assert.deepEqual(learn.children.map(c => c.id), paths.map(p => `path:${p.id}`));
  for (const m of missions) {
    const lesson = byId.get(`lesson:${m.id}`);
    assert.ok(lesson, `${m.id} is on the roadmap`);
    assert.equal(lesson.parent?.id, `path:${m.pathId}`);
    assert.equal(lesson.xp, m.xp);
  }
  assert.ok(byId.get("lesson:orientation"));
  assert.equal(learn.count, missions.length + 1);
  assert.equal(byId.get("tcodes")!.count, 36);
  const oop = learn.children.find(c => c.id === "path:oop")!;
  assert.equal(oop.children[0].id, "lesson:oop-introduction");
  assert.ok(oop.children.slice(1).length > 0 && oop.children.slice(1).every(c => c.planned), "remaining OOP topics are planned");
});

test("progress: T-codes give 10 XP once, survive normalization, unknown ids are dropped", () => {
  const before = earnedXP(initialProgress);
  let p = learnTCode(initialProgress, "tcode-se38");
  assert.equal(earnedXP(p), before + TCODE_XP);
  assert.equal(learnTCode(p, "tcode-se38"), p, "learning twice changes nothing");
  assert.equal(learnTCode(p, "tcode-nope"), p);
  p = { ...p, tcodes: [...p.tcodes!, "tcode-nope"] };
  const restored = normalizeProgress(JSON.parse(JSON.stringify(p)));
  assert.deepEqual(restored.tcodes, ["tcode-se38"]);
  assert.equal(earnedXP(restored), before + TCODE_XP);
  assert.deepEqual(normalizeProgress({ missions: [], labs: [] }).tcodes, [], "older saves without tcodes still load");
});
