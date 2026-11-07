import { enabledLocales } from "../src/lib/language-policy";
import {test} from "node:test";
import assert from "node:assert/strict";
import {missions,structureExample} from "../src/lib/curriculum";
import {getAnatomy,orientationExamples} from "../src/lib/anatomy-content";
import {defineAnatomy,eventsForGroup,groupAtLine,lineRange,sourceFingerprint,validateAnatomy} from "../src/lib/code-anatomy";
import {simulate} from "../src/lib/engine";
import {anatomyConcepts} from "../src/lib/anatomy-concepts";

test("every implemented lab has reviewed enabled-language groups, complete source coverage and meaningful matching",()=>{
  for(const [id,source] of [...missions.map(m=>[m.id,m.example]),...enabledLocales.map(locale=>orientationExamples[locale]).map(s=>["orientation",s])]) {
    const doc=getAnatomy(id,source);
    validateAnatomy(doc,source);
    assert.ok(doc.groups.length>=2);
    assert.ok(doc.checks.length>=2);
    for(const group of doc.groups) {
      assert.equal(source.slice(group.range.start,group.range.end),source.split("\n").slice(group.range.startLine-1,group.range.endLine).join("\n"));
      for(const ref of group.glossaryRefs || []) assert.ok(anatomyConcepts[ref]);
    }
  }
});
test("structure anatomy has the exact six operations and assigns both fields only after DATA",()=>{
  const doc=getAnatomy("structures",structureExample);
  assert.deepEqual(doc.groups.map(g=>g.id),["header","fields","end","record","assign","output"]);
  assert.deepEqual(doc.groups.map(g=>[g.range.startLine,g.range.endLine]),[[1,1],[2,3],[4,4],[6,6],[8,9],[11,11]]);
  assert.equal(groupAtLine(doc,3)?.id,"fields");
  assert.equal(groupAtLine(doc,5),undefined);
  const events=simulate(structureExample);
  assert.deepEqual(events[0].memory,{});
  assert.equal(eventsForGroup(doc.groups[2],events).length,0); // The full chain is one event spanning lines 1-4.
  assert.deepEqual(eventsForGroup(doc.groups[3],events).at(-1)?.memory.ls_employee,{id:0,name:""});
  const assigned=eventsForGroup(doc.groups[4],events);
  assert.deepEqual(assigned.at(-1)?.memory.ls_employee,{id:101,name:"Ahmed"});
  assert.deepEqual(assigned.flatMap(e=>e.changed),["ls_employee-id","ls_employee-name"]);
  assert.deepEqual(eventsForGroup(doc.groups[5],events).at(-1)?.output,["Ahmed"]);
});
test("range validation rejects edited sources, stale offsets, overlap, omissions and bad matching targets",()=>{
  const doc=getAnatomy("structures",structureExample);
  assert.throws(()=>validateAnatomy(doc,structureExample.replace("101","102")),/source changed/);
  assert.throws(()=>getAnatomy("structures",structureExample+"\n"),/reviewed anatomy/);
  assert.throws(()=>getAnatomy("future",structureExample),/reviewed anatomy/);
  const stale=structuredClone(doc);stale.groups[0].range.end++;
  assert.throws(()=>validateAnatomy(stale,structureExample),/source range/);
  const overlap=structuredClone(doc);overlap.groups[1].range=lineRange(structureExample,1,3);
  assert.throws(()=>validateAnatomy(overlap,structureExample),/overlapping/);
  const omitted=structuredClone(doc);omitted.groups.splice(1,1);
  assert.throws(()=>validateAnatomy(omitted,structureExample),/uncovered/);
  const badCheck=structuredClone(doc);badCheck.checks=["unknown"];
  assert.throws(()=>validateAnatomy(badCheck,structureExample),/matching/);
  assert.throws(()=>lineRange(structureExample,0,1),/Invalid/);
  assert.throws(()=>defineAnatomy("bad",structureExample,"00000000",[],[]),/source changed/);
});
test("loop, condition and table views use real visits and distinguish skipped groups",()=>{
  const condition=missions.find(m=>m.id === "conditions")!;
  const doc=getAnatomy(condition.id,condition.example);
  assert.equal(eventsForGroup(doc.groups.find(g=>g.id === "false")!,simulate(doc.source)).length,0);
  const loop=missions.find(m=>m.id === "do")!;
  const body=getAnatomy(loop.id,loop.example).groups.find(g=>g.id === "action")!;
  const visits=eventsForGroup(body,simulate(loop.example));
  assert.equal(visits.filter(e=>e.operation === "write").length,10);
  assert.equal(visits.at(-1)?.loop?.iteration,10);
  const table=missions.find(m=>m.id === "tables")!;
  const append=getAnatomy(table.id,table.example).groups.find(g=>g.id === "append")!;
  assert.deepEqual(eventsForGroup(append,simulate(table.example)).at(-1)?.memory.lt_numbers,[10,20,30]);
});
test("source fingerprints are deterministic and sensitive to source drift",()=>{
  assert.equal(sourceFingerprint(structureExample),"02fd2bee");
  assert.notEqual(sourceFingerprint(structureExample),sourceFingerprint(structureExample+" "));
});
