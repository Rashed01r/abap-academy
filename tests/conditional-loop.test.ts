import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate, evaluate, SimulationError } from "../src/lib/engine";
import { conditionalLoopExample, conditionalLoopMission } from "../src/lib/conditional-loop-mission";
import { enabledLocales, resolveLocale, localizedText, hasRequiredTranslations } from "../src/lib/language-policy";

test("English policy ignores legacy preferences and requires only enabled translations",()=>{
  assert.deepEqual(enabledLocales,["en"]);
  for(const value of ["ar","en",null,"unknown",{}]) assert.equal(resolveLocale(value),"en");
  assert.equal(localizedText({en:"English",ar:"Retained"},"ar"),"English");
  assert.equal(hasRequiredTranslations({en:"English"}),true);
  assert.equal(hasRequiredTranslations({en:"English"},true),false);
  assert.equal(hasRequiredTranslations({en:"English",ar:"Retained"},true),true);
  assert.equal(hasRequiredTranslations({en:"",ar:"Retained"}),false);
  assert.equal(conditionalLoopMission.title.ar,undefined);
});

const table = `DATA rows TYPE STANDARD TABLE OF i WITH EMPTY KEY.
APPEND 1 TO rows. APPEND 2 TO rows. APPEND 3 TO rows.
DATA row TYPE i VALUE 99. READ TABLE rows INTO row INDEX 3. row = 99.`;
test("WHERE keeps source indexes, leaves rejected work areas unchanged and copies immutable snapshots",()=>{
  const events=simulate(`${table} LOOP AT rows INTO row WHERE table_line >= 2. WRITE row. WRITE sy-tabix. ENDLOOP. WRITE sy-subrc. WRITE sy-tabix.`);
  assert.deepEqual(events.at(-1)!.output,["2","2","3","3","0","3"]); // READ established tabix 3 before LOOP.
  const tests=events.filter(e=>e.filter);
  assert.deepEqual(tests.map(e=>[e.filter!.index,e.filter!.matched]),[[1,false],[2,true],[3,true]]);
  assert.equal(tests[0].memory.row,99);
  assert.equal(tests[0].tableSelection?.index,0);
  assert.deepEqual(events.at(-1)!.memory.rows,[1,2,3]);
  assert.equal(tests[1].memory.row,99);
  assert.equal(events.find(e=>e.operation==="write")!.memory.row,2);
});
test("empty selection and empty table preserve a declared work area and report status 4",()=>{
  for(const setup of [table,"DATA rows TYPE STANDARD TABLE OF i WITH EMPTY KEY. DATA row TYPE i VALUE 99."]){
    const final=simulate(`${setup} LOOP AT rows INTO row WHERE table_line > 9. WRITE row. ENDLOOP. WRITE row. WRITE sy-subrc.`).at(-1)!;
    assert.deepEqual(final.output,["99","4"]);
  }
});
test("all supported operators and string predicates select real row values",()=>{
  for(const [op,expected]of [["=",["2"]],["<>",["1","3"]],["<",["1"]],["<=",["1","2"]],[">",["3"]],[">=",["2","3"]]] as const)
    assert.deepEqual(simulate(`${table} LOOP AT rows INTO row WHERE table_line ${op} 2. WRITE row. ENDLOOP.`).at(-1)!.output,expected);
  assert.deepEqual(simulate("DATA rows TYPE STANDARD TABLE OF string WITH EMPTY KEY. APPEND 'A' TO rows. APPEND 'B' TO rows. LOOP AT rows INTO DATA(row) WHERE table_line = 'B'. WRITE row. ENDLOOP.").at(-1)!.output,["B"]);
});
test("WHERE rejects unknown fields, type mismatches and unsupported compound forms",()=>{
  for(const predicate of ["missing = 1","table_line = 'wrong'","table_line > 1 AND table_line < 3","table_line = 1 + 1","( table_line = 1 )"])
    assert.throws(()=>simulate(`${table} LOOP AT rows INTO row WHERE ${predicate}. ENDLOOP.`),SimulationError);
});
test("WHERE reevaluates changing operands and nested loops restore the original index",()=>{
  assert.deepEqual(simulate(`${table} DATA minimum TYPE i VALUE 1. LOOP AT rows INTO row WHERE table_line >= minimum. WRITE row. minimum = minimum + 2. ENDLOOP.`).at(-1)!.output,["1","3"]);
  assert.deepEqual(simulate(`${table} DATA inner TYPE i. LOOP AT rows INTO row WHERE table_line >= 2. LOOP AT rows INTO inner WHERE table_line = 1. WRITE sy-tabix. ENDLOOP. WRITE sy-tabix. CONTINUE. WRITE 99. ENDLOOP.`).at(-1)!.output,["1","2","1","3"]);
  assert.deepEqual(simulate(`${table} LOOP AT rows INTO row WHERE table_line >= 2. WRITE row. EXIT. ENDLOOP. WRITE sy-subrc.`).at(-1)!.output,["2","0"]);
});
test("conditional report grader accepts the real solution and rejects canned or destructive reports",()=>{
  assert.equal(evaluate(conditionalLoopExample,"data-conditional-report").correct,true);
  for(const code of [
    "WRITE 'Sara'. WRITE 'Omar'. WRITE 2. WRITE 14000.",
    conditionalLoopExample.replace("salary >= lv_min_salary","salary > lv_min_salary"),
    conditionalLoopExample.replace("WHERE salary >= lv_min_salary",""),
    conditionalLoopExample.replace("ls_employee-name.","'Sara'."),
    conditionalLoopExample.replace("lv_total + ls_employee-salary","14000"),
    conditionalLoopExample + "\nDELETE lt_employees INDEX 1.",
  ]) assert.equal(evaluate(code,"data-conditional-report").correct,false,code);
});
