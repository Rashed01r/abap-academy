import { enabledLocales } from "../src/lib/language-policy";
import { test } from "node:test";
import assert from "node:assert/strict";
import { changedNames, executionSteps, firstSentence, sameValue } from "../src/lib/teaching-trace";
import { simulate } from "../src/lib/engine";
import { missions } from "../src/lib/curriculum";
import { orientationExamples } from "../src/lib/anatomy-content";
import { visualPresentations } from "../src/lib/visual-presentations";

test("snapshot comparison detects added, changed and removed data without mutation",()=>{
  const before={zero:0,record:{id:1,name:"Old"},rows:[{id:1},{id:2}],removed:"old"};
  const after={zero:0,record:{id:1,name:"New"},rows:[{id:2}],added:"new"};
  const saved=JSON.stringify(before);
  assert.deepEqual(changedNames(before,after),["record","rows","removed","added"]);
  assert.equal(JSON.stringify(before),saved);
  assert.equal(sameValue({a:0},{a:0}),true);
  assert.equal(sameValue({a:0,b:1},{b:1,a:0}),true);
});

test("generated captions follow changed inputs, output, loops and actual source ranges",()=>{
  for(const value of [7,42])for(const lang of enabledLocales){
    const events=simulate(`DATA lv_value TYPE i VALUE ${value}.\nlv_value = lv_value + 3.\nWRITE lv_value.`);
    const saved=JSON.stringify(events),steps=executionSteps(events,lang);
    assert.match(steps[1].sentence,new RegExp(`${value}.*${value+3}`));
    assert.deepEqual(steps[2].output,[String(value+3)]);
    assert.equal(steps[1].line,2);assert.equal(steps[1].captionSource,"generated");
    assert.equal(JSON.stringify(events),saved);
  }
  const loop=executionSteps(simulate('DATA n TYPE i.\nDO 3 TIMES.\nn = n + 1.\nENDDO.'),"en");
  assert.ok(loop.some(s=>s.sentence.includes("On pass 3")));
});

test("every executable classroom has a bilingual caption and immutable state for every event",()=>{
  for(const [id,family] of Object.entries(visualPresentations)){
    if(!["trace","flow"].includes(family))continue;
    const source=id === "orientation" ? orientationExamples.en : missions.find(m=>m.id===id)!.example;
    const events=simulate(source);
    for(const lang of enabledLocales){
      const steps=executionSteps(events,lang);
      assert.equal(steps.length,events.length,id);
      for(const [i,step] of steps.entries()){
        assert.ok(step.title && step.sentence,`${id}/${lang}/${i}`);
        assert.ok(!step.sentence.includes("undefined"),`${id}/${lang}/${i}`);
        if(i>0)assert.notEqual(step.sentence,steps[i-1].sentence,`${id}/${lang}/${i}: each step needs a distinct caption`);
        assert.equal(step.line,events[i].range.startLine);
        assert.deepEqual(step.output,events[i].output);
      }
    }
  }
});

test("sentence extraction retains decimal and identifier punctuation",()=>{
  assert.equal(firstSentence("Value 3.5 is stored in item.name. Another idea."),"Value 3.5 is stored in item.name.");
  assert.equal(firstSentence("تُحفظ القيمة 3.5 هنا. ثم تبدأ فكرة أخرى."),"تُحفظ القيمة 3.5 هنا.");
});
