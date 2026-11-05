import { test } from "node:test";
import assert from "node:assert/strict";
import { missions } from "../src/lib/curriculum";
import { visualPresentations } from "../src/lib/visual-presentations";
import { employeeCategoryState, rowAccessState, categoryReference, rowAccessReference } from "../src/lib/visual-comparisons";
import { validateAnatomy } from "../src/lib/code-anatomy";

test("every implemented lesson explicitly chooses a subject-appropriate visual presentation",()=>{
  assert.deepEqual(Object.keys(visualPresentations).sort(),["orientation",...missions.map(m=>m.id)].sort());
});
test("category comparison preserves rows, sorts numeric keys, and rejects only unique-key conflicts",()=>{
  assert.deepEqual(employeeCategoryState("standard",3,false).rows.map(r=>r.id),[30,10,30]);
  assert.deepEqual(employeeCategoryState("sorted",3,false).rows.map(r=>r.id),[10,30,30]);
  assert.deepEqual(employeeCategoryState("sorted",3,false).rows.filter(r=>r.id === 30).map(r=>r.name),["Omar","Ahmed"]);
  assert.equal(employeeCategoryState("standard",3,false).rows.find(r=>r.id === 30)?.name,"Ahmed");
  for(const c of ["sorted","hashed"] as const) {const result=employeeCategoryState(c,3,true);assert.equal(result.rows.length,2);assert.equal(result.rejected,true);assert.equal(result.rows.find(r=>r.id === 30)?.name,"Ahmed");}
  assert.equal(employeeCategoryState("standard",0,false).rows.length,0);
});
test("row-access illustration distinguishes copy edits, explicit write-back and actual row access",()=>{
  const copy=rowAccessState("copy","Sara",true,false);assert.equal(copy.row.name,"Ahmed");assert.equal(copy.workArea?.name,"Sara");
  const saved=rowAccessState("copy","Sara",true,true);assert.equal(saved.row.name,"Sara");
  const alias=rowAccessState("alias","Sara",true,false);assert.equal(alias.row.name,"Sara");assert.equal(alias.workArea,undefined);
  assert.equal(alias.row.id,101);assert.equal(alias.row.salary,5000);assert.equal(alias.before.name,"Ahmed");
});
test("every comparison source variant has contiguous bilingual reference anatomy, including apostrophes",()=>{
  for(const c of ["standard","sorted","hashed"] as const) for(const unique of [false,true]) for(const count of [0,2,3]) {
    const doc=categoryReference(c,unique,count,999);validateAnatomy(doc,doc.source);assert.equal(doc.referenceOnly,true);
  }
  for(const mode of ["copy","alias"] as const) for(const saved of [false,true]) {
    const doc=rowAccessReference(mode,"O'Neil",saved);validateAnatomy(doc,doc.source);assert.ok(doc.source.includes("O''Neil"));assert.equal(doc.referenceOnly,true);
  }
});
