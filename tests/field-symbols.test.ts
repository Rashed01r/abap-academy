import {test} from "node:test";
import assert from "node:assert/strict";
import {evaluate, simulate, SimulationError, type ErrorCode} from "../src/lib/engine";
import {workAreaMission, workAreaExample} from "../src/lib/work-area-mission";
import {getAnatomy,} from "../src/lib/anatomy-content";
import {eventsForGroup} from "../src/lib/code-anatomy";
import {allChallengesPassed, completeMission, earnedXP, normalizeProgress} from "../src/lib/progress";
const output = (source:string) => simulate(source).at(-1)!.output;
function rejects(source:string, code:ErrorCode) {
  assert.throws(()=>simulate(source), (error:unknown)=>error instanceof SimulationError && error.code === code, source);
}
test("typed scalar aliases update the original data and see subsequent direct writes",()=>{
  const source="DATA n TYPE i VALUE 5. FIELD-SYMBOLS <n> TYPE i. ASSIGN n TO <n>. <n> = <n> + 2. WRITE n. n = 9. WRITE <n>.";
  const events=simulate(source);
  assert.deepEqual(events.at(-1)!.output,["7","9"]);
  assert.deepEqual(events.find(e=>e.operation === "bind")!.memory,{n:5});
  assert.deepEqual(events.find(e=>e.statement.startsWith("<n> ="))!.changed,["<n>","n"]);
  assert.equal(events.at(-1)!.memory["<n>"],undefined);
});
test("aliases begin unassigned and snapshots preserve declaration, binding and old values",()=>{
  const events=simulate("DATA n TYPE i VALUE 5. FIELD-SYMBOLS <n> TYPE i. ASSIGN n TO <n>. <n> = 8. UNASSIGN <n>. WRITE n.");
  assert.equal(events[1].aliases!["<n>"],null);
  assert.equal(events[2].aliases!["<n>"],"n");
  assert.equal(events[2].memory.n,5);
  assert.equal(events[3].memory.n,8);
  assert.equal(events[4].aliases!["<n>"],null);
  assert.deepEqual(events.at(-1)!.output,["8"]);
});
test("unassigned read, write and append fail with a localized diagnostic code and source range",()=>{
  for(const operation of ["WRITE <n>.","<n> = 5.","APPEND <n> TO numbers."]) {
    const source=`DATA numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY.\nFIELD-SYMBOLS <n> TYPE i.\n${operation}`;
    rejects(source,"unassigned");
    try { simulate(source); } catch(error) {assert.equal((error as SimulationError).range.startLine,3);}
  }
  rejects("DATA n TYPE i. FIELD-SYMBOLS <n> TYPE i. ASSIGN n TO <n>. UNASSIGN <n>. WRITE <n>.","unassigned");
  rejects("DATA n TYPE i. FIELD-SYMBOLS <n> TYPE i. IF 1 = 2. ASSIGN n TO <n>. ENDIF. WRITE <n>.","unassigned");
});
test("symbols enforce explicit types, declared components and supported direct binding",()=>{
  rejects("DATA n TYPE string. FIELD-SYMBOLS <n> TYPE i. ASSIGN n TO <n>.","type");
  rejects("FIELD-SYMBOLS <n> TYPE any.","type");
  rejects("FIELD-SYMBOLS n TYPE i.","declaration");
  rejects("DATA n TYPE i. ASSIGN n TO <n>.","unknown");
  rejects("FIELD-SYMBOLS <n> TYPE i. FIELD-SYMBOLS <n> TYPE i.","declaration");
  rejects("IF 1 = 2. FIELD-SYMBOLS <n> TYPE i. ENDIF.","unsupported");
  rejects("DATA n TYPE i. FIELD-SYMBOLS <n> TYPE i. ASSIGN sy-index TO <n>.","unsupported");
  rejects("FIELD-SYMBOLS <n> TYPE i. FIELD-SYMBOLS <other> TYPE i. ASSIGN <n> TO <other>.","unsupported");
  rejects("TYPES: BEGIN OF ty, id TYPE i, END OF ty. DATA row TYPE ty. FIELD-SYMBOLS <r> TYPE ty. ASSIGN row TO <r>. IF 1 = 2. WRITE <r>-missing. ENDIF.","component");
});
test("a symbol can bind to a scalar component or rebind between compatible direct objects",()=>{
  assert.deepEqual(output("TYPES: BEGIN OF ty, name TYPE string, END OF ty. DATA row TYPE ty. FIELD-SYMBOLS <name> TYPE string. ASSIGN row-name TO <name>. <name> = 'Sara'. WRITE row-name."),["Sara"]);
  const end=simulate("DATA a TYPE i VALUE 1. DATA b TYPE i VALUE 2. FIELD-SYMBOLS <n> TYPE i. ASSIGN a TO <n>. <n> = 3. ASSIGN b TO <n>. <n> = 4. WRITE a. WRITE b.").at(-1)!;
  assert.deepEqual(end.output,["3","4"]);
  assert.equal(end.aliases!["<n>"],"b");
});
test("structured aliases keep APPEND copies independent and survive INTO replacing a work area",()=>{
  const events=simulate(workAreaExample);
  assert.deepEqual(events.at(-1)!.output,["Ahmed","Sara","Ahmed"]);
  const changed=events.find(e=>e.statement.startsWith("<employee>-name"))!;
  assert.deepEqual(changed.memory.ls_employee,{id:101,name:"Sara"});
  assert.deepEqual(changed.memory.lt_employees,[{id:101,name:"Ahmed"}]);
  assert.deepEqual(changed.changed,["<employee>-name","ls_employee-name"]);
  assert.deepEqual(output(workAreaExample+"\nWRITE <employee>-name."),["Ahmed","Sara","Ahmed","Ahmed"]);
});
test("APPEND copies a structured alias and preserves existing sy-index appends",()=>{
  assert.deepEqual(output("DATA numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY. DO 2 TIMES. APPEND sy-index TO numbers. ENDDO. LOOP AT numbers INTO DATA(n). WRITE n. ENDLOOP."),["1","2"]);
  const end=simulate(workAreaExample.replace("APPEND ls_employee TO lt_employees.","FIELD-SYMBOLS <saved> TYPE ty_employee. ASSIGN ls_employee TO <saved>. APPEND <saved> TO lt_employees.")).at(-1)!;
  assert.deepEqual(end.memory.lt_employees,[{id:101,name:"Ahmed"}]);
});
test("field symbols preserve comparison operators and runtime integer limits",()=>{
  assert.deepEqual(output("DATA n TYPE i VALUE 3. FIELD-SYMBOLS <n> TYPE i. ASSIGN n TO <n>. IF <n> < 4. WRITE <n>. ENDIF. IF <n> <> 2. WRITE 9. ENDIF."),["3","9"]);
  rejects("DATA n TYPE i VALUE 2147483647. FIELD-SYMBOLS <n> TYPE i. ASSIGN n TO <n>. <n> = <n> + 1.","range");
});
test("work area challenges reject literal output, wrong fields and pretending to use an alias",()=>{
  const [record,alias]=workAreaMission.challenges!;
  assert.equal(evaluate(record.solution,record.id).correct,true);
  for(const source of [record.solution.replace("WRITE / ls_employee-name.","WRITE 'Maha'."),record.solution.replace("6000","5000"),record.solution.replace("202","201")]) assert.equal(evaluate(source,record.id).correct,false);
  assert.equal(evaluate(alias.solution,alias.id).correct,true);
  for(const source of [
    alias.solution.replace("<employee>-name = lv_new_name.","ls_employee-name = lv_new_name."),
    alias.solution.replace("<employee>-name = lv_new_name.","<employee>-name = 'Sara'."),
    alias.solution.replace("WRITE / ls_employee-name.","WRITE 'Sara'."),
    alias.solution.replace("<employee>-name = lv_new_name.","<employee>-name = lv_new_name. APPEND ls_employee TO lt_employees."),
  ]) assert.equal(evaluate(source,alias.id).correct,false,source);
});
test("anatomy maps work-area field highlights and aliases to actual trace states",()=>{
  const doc=getAnatomy(workAreaMission.id,workAreaExample), events=simulate(workAreaExample);
  const group=(id:string)=>doc.groups.find(g=>g.id === id)!;
  assert.deepEqual(eventsForGroup(group("fill"),events).at(-1)!.memory.ls_employee,{id:101,name:"Ahmed"});
  assert.equal(eventsForGroup(group("declare"),events).at(-1)!.aliases!["<employee>"],null);
  assert.equal(eventsForGroup(group("bind"),events).at(-1)!.aliases!["<employee>"],"ls_employee");
  assert.deepEqual(eventsForGroup(group("change"),events).at(-1)!.memory.ls_employee,{id:101,name:"Sara"});
});
test("both coding challenges and knowledge check protect completion without changing legacy progress",()=>{
  const p=normalizeProgress({version:2,missions:["data-keys"],labs:["structures"],results:{while:{attempts:4,passed:false}}});
  const one={...p,passedChallenges:[...p.passedChallenges!,workAreaMission.challenges![0].id]};
  assert.equal(allChallengesPassed(one,workAreaMission.id),false);
  const both={...one,passedChallenges:[...one.passedChallenges,workAreaMission.challenges![1].id]};
  assert.equal(completeMission(both,workAreaMission.id,false),both);
  const complete=completeMission(both,workAreaMission.id,true);
  assert.equal(earnedXP(complete),earnedXP(p)+280);
  assert.equal(earnedXP(completeMission(complete,workAreaMission.id,true)),earnedXP(complete));
  assert.deepEqual(complete.labs,p.labs);
  assert.deepEqual(complete.results,p.results);
  assert.deepEqual(normalizeProgress(complete).missions,complete.missions);
});
