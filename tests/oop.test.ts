import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate, evaluate, SimulationError } from "../src/lib/engine";
import { oopMissions } from "../src/lib/oop-missions";

const out = (code: string) => simulate(code).at(-1)!.output;
const fails = (code: string, kind: SimulationError["code"], detail?: RegExp) =>
  assert.throws(() => simulate(code), (e: unknown) => e instanceof SimulationError && e.code === kind && (!detail || detail.test(e.detail)));
const graded = (code: string, id: string) => { try { return evaluate(code, id).correct; } catch (e) { if (e instanceof SimulationError) return false; throw e; } };
const counter = `CLASS lcl_counter DEFINITION.
  PUBLIC SECTION.
    DATA mv_public TYPE i.
    CLASS-DATA gv_total TYPE i VALUE 10.
    METHODS add IMPORTING iv_step TYPE i.
    METHODS get RETURNING VALUE(rv) TYPE i.
  PRIVATE SECTION.
    DATA mv_value TYPE i.
ENDCLASS.
CLASS lcl_counter IMPLEMENTATION.
  METHOD add.
    DATA lv_old TYPE i.
    lv_old = mv_value.
    mv_value = lv_old + iv_step.
    gv_total = gv_total + iv_step.
  ENDMETHOD.
  METHOD get.
    rv = me->mv_value.
  ENDMETHOD.
ENDCLASS.
`;

test("eight English-only OOP lessons: examples run, solutions pass, starters and canned output fail", () => {
  const examples = ["Ahmed\n5000", "Ahmed\n5000\n0", "Sara\nZACA Corp\n2", "8500", "Sara\n8000", "9500\n5000", "5000\n1200", "Refused\n-200\n8500"];
  for (const [i, m] of oopMissions.entries()) {
    assert.equal(m.title.ar, undefined);
    assert.equal(out(m.example).join("\n"), examples[i], m.id);
    const ch = m.challenges![0];
    assert.equal(out(ch.solution).join("\n"), ch.expected, m.id);
    assert.equal(evaluate(ch.solution, ch.id).correct, true, m.id);
    assert.equal(graded(ch.starter, ch.id), false, `${m.id} starter`);
    assert.equal(graded(`${ch.solution}\n${ch.expected.split("\n").map(line => `WRITE / '${line}'.`).join("\n")}`, ch.id), false, `${m.id} extra output`);
  }
});

test("graders reject hard-coded values and shortcuts", () => {
  const [cls, obj, attr, meth] = oopMissions.map(m => m.challenges![0]);
  assert.equal(graded(cls.solution.replace("WRITE / mv_code.", "WRITE / 'IT'."), cls.id), false, "canned code in show");
  assert.equal(graded(cls.solution.replace("    WRITE / mv_code.\n    WRITE / mv_headcount.\n", "") + "\nWRITE / lo_department->mv_code.\nWRITE / lo_department->mv_headcount.", cls.id), false, "WRITE outside the method");
  assert.equal(graded(obj.solution.replace("DATA(lo_selected) = lo_sara.", "DATA(lo_selected) = NEW lcl_employee( ).\nlo_selected->mv_salary = lo_sara->mv_salary."), obj.id), false, "third object");
  assert.equal(graded(attr.solution.replace("WRITE / lcl_employee=>gv_total.", "WRITE / '11000'."), attr.id), false, "canned total");
  assert.equal(graded(meth.solution.replace("rv_salary = mv_salary.", "rv_salary = 7500."), meth.id), false, "hard-coded getter");
});

test("objects have separate instance attributes; static attributes and reference copies are shared", () => {
  const events = simulate(`${counter}DATA lo_a TYPE REF TO lcl_counter.
lo_a = NEW #( ).
DATA(lo_b) = NEW lcl_counter( ).
DATA(lo_c) = lo_a.
lo_a->add( 5 ).
lo_c->add( iv_step = 2 ).
lo_b->add( 1 ).
lo_b->mv_public = 9.
WRITE lo_a->get( ).
WRITE lo_b->get( ).
WRITE lcl_counter=>gv_total.
WRITE lo_a->gv_total.
WRITE lo_a->mv_public.`);
  const last = events.at(-1)!;
  assert.deepEqual(last.output, ["7", "1", "18", "18", "0"]);
  assert.equal(last.memory.lo_a, "lcl_counter #1");
  assert.equal(last.memory.lo_c, "lcl_counter #1");
  assert.deepEqual(last.memory["lcl_counter #2"], { mv_public: 9, mv_value: 1 });
  assert.equal(last.memory["lcl_counter=>gv_total"], 18);
  // Parameters and locals exist only during the call.
  const inside = events.find(e => e.operation === "call")!;
  assert.equal(inside.memory.iv_step, 5);
  assert.equal(last.memory.iv_step, undefined);
  assert.equal(last.memory.lv_old, undefined);
  assert.ok(events.some(e => e.explanation.key === "methodEnd"));
  assert.equal(events.find(e => e.explanation.key === "create")?.explanation.value, "lcl_counter #1");
});

test("a parameter with the same name as a global variable is restored after the call", () => {
  assert.deepEqual(out(`${counter}DATA iv_step TYPE i VALUE 42.\nDATA(lo) = NEW lcl_counter( ).\nlo->add( 3 ).\nWRITE iv_step.\nWRITE lo->get( ).`), ["42", "3"]);
});

test("visibility, signatures and initial references follow SAP rules", () => {
  const use = (code: string) => `${counter}DATA(lo) = NEW lcl_counter( ).\n${code}`;
  fails(use("lo->mv_value = 1."), "access", /PRIVATE SECTION/);
  fails(use("WRITE lo->mv_value."), "access", /PRIVATE SECTION/);
  fails(use("lcl_counter=>mv_public = 1."), "access", /instance attribute/);
  fails(use("lo->add( iv_amount = 1 )."), "component", /no parameter iv_amount/);
  fails(use("lo->add( )."), "assignment", /needs the parameter iv_step/);
  fails(use("lo->add( 'x' )."), "type");
  fails(use("lo->missing( )."), "unknown", /no method missing/);
  fails(use("DATA lv TYPE i.\nlv = lo->add( 1 )."), "type", /no RETURNING/);
  fails(use("DATA(lo2) = NEW #( )."), "type", /name the class/);
  fails(`${counter}DATA lo TYPE REF TO lcl_counter.\nlo->add( 1 ).`, "nullref");
  fails(`${counter}DATA lo TYPE REF TO lcl_counter.\nWRITE lo->mv_public.`, "nullref");
  fails(`${counter}add( 1 ).`, "unknown", /object reference/);
  fails(counter.replace("    lv_old = mv_value.", "    iv_step = 1."), "assignment", /read-only/);
  fails(counter.replace(/  METHOD get\.[\s\S]*?ENDMETHOD\.\n/, ""), "block", /Implement get/);
  fails(`DATA lo TYPE REF TO lcl_nothing.`, "type", /Define the class/);
});

test("rejected syntax outside the subset stops at the statement", () => {
  fails("CLASS lcl_a DEFINITION INHERITING FROM lcl_b.\nENDCLASS.", "unknown", /Define the class lcl_b/);
  fails("CLASS lcl_a DEFINITION.\n  PUBLIC SECTION.\n    CLASS-METHODS run.\nENDCLASS.", "unsupported", /CLASS-METHODS/);
  fails("CLASS lcl_a DEFINITION.\n  PUBLIC SECTION.\n    METHODS run EXPORTING ev TYPE i.\nENDCLASS.", "unsupported", /EXPORTING/);
  fails("CLASS lcl_a DEFINITION.\n  PUBLIC SECTION.\n    DATA ms TYPE ty_x.\nENDCLASS.", "type");
  fails("CLASS lcl_a DEFINITION.\n  DATA mv TYPE i.\nENDCLASS.", "block", /SECTION/);
  fails("CLASS lcl_a DEFINITION.\n  PUBLIC SECTION.\n    METHODS constructor.\nENDCLASS.\nCLASS lcl_a IMPLEMENTATION.\n  METHOD constructor.\n  ENDMETHOD.\nENDCLASS.\nDATA(lo) = NEW lcl_a( 1 ).", "assignment", /no IMPORTING parameters/);
  fails("DO 1 TIMES.\n  CLASS lcl_a DEFINITION.\n  ENDCLASS.\nENDDO.", "unsupported", /top level/);
});

const employee = `CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING iv_name TYPE string iv_salary TYPE i.
    METHODS get_pay RETURNING VALUE(rv_pay) TYPE i.
    METHODS describe.
  PROTECTED SECTION.
    DATA mv_name TYPE string.
    DATA mv_salary TYPE i.
  PRIVATE SECTION.
    DATA mv_secret TYPE i.
ENDCLASS.
CLASS lcl_employee IMPLEMENTATION.
  METHOD constructor.
    mv_name = iv_name.
    mv_salary = iv_salary.
  ENDMETHOD.
  METHOD get_pay.
    rv_pay = mv_salary.
  ENDMETHOD.
  METHOD describe.
    WRITE / mv_name.
    WRITE / get_pay( ).
  ENDMETHOD.
ENDCLASS.
CLASS lcl_manager DEFINITION INHERITING FROM lcl_employee.
  PUBLIC SECTION.
    METHODS constructor IMPORTING iv_name TYPE string iv_salary TYPE i iv_bonus TYPE i.
    METHODS get_pay REDEFINITION.
    METHODS peek RETURNING VALUE(rv) TYPE i.
  PRIVATE SECTION.
    DATA mv_bonus TYPE i.
ENDCLASS.
CLASS lcl_manager IMPLEMENTATION.
  METHOD constructor.
    super->constructor( iv_name = iv_name iv_salary = iv_salary ).
    mv_bonus = iv_bonus.
  ENDMETHOD.
  METHOD get_pay.
    rv_pay = super->get_pay( ) + mv_bonus.
  ENDMETHOD.
  METHOD peek.
    rv = mv_salary.
  ENDMETHOD.
ENDCLASS.
`;

test("constructors run inside NEW; a call by hand, missing or unknown parameters are rejected", () => {
  const ev = simulate(`${employee}DATA(lo) = NEW lcl_employee( iv_name = 'Ahmed' iv_salary = 5000 ).\nWRITE lo->get_pay( ).`);
  const call = ev.find(e => e.explanation.key === "construct")!;
  assert.equal(call.memory.iv_salary, 5000);
  assert.equal(ev.at(-1)!.memory.iv_salary, undefined);
  assert.deepEqual(ev.at(-1)!.output, ["5000"]);
  fails(`${employee}DATA(lo) = NEW lcl_employee( iv_name = 'A' ).`, "assignment", /needs the parameter iv_salary/);
  fails(`${employee}DATA(lo) = NEW lcl_employee( ).`, "assignment", /needs the parameter/);
  fails(`${employee}DATA(lo) = NEW lcl_employee( iv_name = 'A' iv_salary = 1 ).\nlo->constructor( iv_name = 'B' iv_salary = 2 ).`, "access", /runs automatically/);
  fails(`${employee}DATA(lo) = NEW lcl_employee( iv_name = 1 iv_salary = 1 ).`, "type");
  assert.deepEqual(out(`${employee}DATA lo TYPE REF TO lcl_employee.\nlo = NEW #( iv_name = 'Eli' iv_salary = 7 ).\nlo->describe( ).`), ["Eli", "7"]);
});

test("inheritance: protected data, redefinition, super->, dynamic binding and the constructor rule", () => {
  const mk = `DATA lo TYPE REF TO lcl_employee.\nlo = NEW lcl_manager( iv_name = 'Sara' iv_salary = 8000 iv_bonus = 1500 ).\n`;
  assert.deepEqual(out(`${employee}${mk}lo->describe( ).\nWRITE lo->get_pay( ).`), ["Sara", "9500", "9500"], "describe in the superclass calls the redefined get_pay");
  assert.deepEqual(out(`${employee}DATA(lm) = NEW lcl_manager( iv_name = 'A' iv_salary = 3 iv_bonus = 4 ).\nWRITE lm->peek( ).`), ["3"]);
  assert.deepEqual(simulate(`${employee}${mk}`).at(-1)!.memory["lcl_manager #1"], { mv_name: "Sara", mv_salary: 8000, mv_secret: 0, mv_bonus: 1500 });
  fails(`${employee}DATA(lo) = NEW lcl_employee( iv_name = 'A' iv_salary = 1 ).\nWRITE lo->mv_salary.`, "access", /PROTECTED SECTION of lcl_employee/);
  fails(employee.replace("    rv = mv_salary.", "    rv = mv_secret."), "unknown", /mv_secret/);
  fails(employee.replace("    super->constructor( iv_name = iv_name iv_salary = iv_salary ).\n", ""), "block", /super->constructor/);
  // Required even when the superclass declares no constructor (the call then does nothing), as in SAP.
  const plain = "CLASS lcl_p DEFINITION.\n  PUBLIC SECTION.\n    DATA mv TYPE i.\nENDCLASS.\nCLASS lcl_p IMPLEMENTATION.\nENDCLASS.\nCLASS lcl_q DEFINITION INHERITING FROM lcl_p.\n  PUBLIC SECTION.\n    METHODS constructor.\nENDCLASS.\nCLASS lcl_q IMPLEMENTATION.\n  METHOD constructor.\n    super->constructor( ).\n    mv = 5.\n  ENDMETHOD.\nENDCLASS.\nDATA(lo) = NEW lcl_q( ).\nWRITE lo->mv.";
  assert.deepEqual(out(plain), ["5"]);
  fails(plain.replace("    super->constructor( ).\n", ""), "block", /super->constructor/);
  fails(employee.replace("METHODS get_pay REDEFINITION.", "METHODS get_pay RETURNING VALUE(rv_pay) TYPE i."), "declaration", /REDEFINITION/);
  fails(employee.replace("METHODS get_pay REDEFINITION.", "METHODS nothing REDEFINITION."), "unknown", /redefined/);
  fails(`${employee}DATA lm TYPE REF TO lcl_manager.\nlm = NEW lcl_employee( iv_name = 'A' iv_salary = 1 ).`, "type");
  fails(`${employee}DATA lo TYPE REF TO lcl_employee.\nlo = NEW #( iv_name = 'A' iv_salary = 1 ).\nWRITE lo->peek( ).`, "unknown", /no method peek/);
});

const iface = `INTERFACE lif_payable.
  METHODS get_amount RETURNING VALUE(rv_amount) TYPE i.
ENDINTERFACE.
CLASS lcl_a DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_payable.
    DATA mv TYPE i.
ENDCLASS.
CLASS lcl_a IMPLEMENTATION.
  METHOD lif_payable~get_amount.
    rv_amount = mv.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_b DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_payable.
ENDCLASS.
CLASS lcl_b IMPLEMENTATION.
  METHOD lif_payable~get_amount.
    rv_amount = 7.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_c DEFINITION.
  PUBLIC SECTION.
    DATA mv TYPE i.
ENDCLASS.
CLASS lcl_c IMPLEMENTATION.
ENDCLASS.
`;
test("interfaces: references to unrelated classes, iface~method calls and the implementation checks", () => {
  assert.deepEqual(out(`${iface}DATA(a) = NEW lcl_a( ).\na->mv = 5.\nDATA(b) = NEW lcl_b( ).\nDATA li TYPE REF TO lif_payable.\nli = a.\nWRITE li->get_amount( ).\nli = b.\nWRITE li->get_amount( ).\nWRITE a->lif_payable~get_amount( ).`), ["5", "7", "5"]);
  fails(`${iface}DATA(c) = NEW lcl_c( ).\nDATA li TYPE REF TO lif_payable.\nli = c.`, "type");
  fails(`${iface}DATA li TYPE REF TO lif_payable.\nli = NEW #( ).`, "type", /interface/);
  fails(`${iface}DATA(x) = NEW lif_payable( ).`, "unknown", /interface/);
  fails(`${iface}DATA li TYPE REF TO lif_payable.\nWRITE li->get_amount( ).`, "nullref");
  fails(iface.replace("  METHOD lif_payable~get_amount.\n    rv_amount = 7.\n  ENDMETHOD.\n", ""), "block", /lif_payable~get_amount/);
  fails(iface.replace("INTERFACES lif_payable.\n    DATA mv", "INTERFACES lif_missing.\n    DATA mv"), "unknown", /lif_missing/);
  fails("INTERFACE lif_x.\n  METHODS m.\n  WRITE 1.\nENDINTERFACE.", "block");
});

const exc = `CLASS lcx_a DEFINITION INHERITING FROM cx_static_check.
  PUBLIC SECTION.
    DATA mv_value TYPE i.
    METHODS constructor IMPORTING iv_value TYPE i.
ENDCLASS.
CLASS lcx_a IMPLEMENTATION.
  METHOD constructor.
    super->constructor( ).
    mv_value = iv_value.
  ENDMETHOD.
ENDCLASS.
CLASS lcx_b DEFINITION INHERITING FROM lcx_a.
  PUBLIC SECTION.
    METHODS constructor IMPORTING iv_value TYPE i.
ENDCLASS.
CLASS lcx_b IMPLEMENTATION.
  METHOD constructor.
    super->constructor( iv_value = iv_value ).
  ENDMETHOD.
ENDCLASS.
CLASS lcl_svc DEFINITION.
  PUBLIC SECTION.
    METHODS check IMPORTING iv TYPE i RAISING lcx_a.
    METHODS wrapper IMPORTING iv TYPE i RAISING lcx_a.
    DATA mv_done TYPE i.
ENDCLASS.
CLASS lcl_svc IMPLEMENTATION.
  METHOD check.
    DO 3 TIMES.
      IF sy-index = iv.
        RAISE EXCEPTION NEW lcx_b( iv_value = sy-index ).
      ENDIF.
      mv_done = sy-index.
    ENDDO.
  ENDMETHOD.
  METHOD wrapper.
    check( iv ).
    mv_done = 99.
  ENDMETHOD.
ENDCLASS.
DATA(lo) = NEW lcl_svc( ).
`;
test("exceptions: raise through nested methods and loops, catch by superclass, INTO, rejected static-check violations", () => {
  const ev = simulate(`${exc}TRY.\n  lo->wrapper( 2 ).\n  WRITE 'skipped'.\nCATCH lcx_a INTO DATA(lx).\n  WRITE 'caught'.\n  WRITE lx->mv_value.\nENDTRY.\nWRITE lo->mv_done.`);
  assert.deepEqual(ev.at(-1)!.output, ["caught", "2", "1"], "wrapper stopped before mv_done = 99; the loop stopped at iteration 2");
  assert.ok(String(ev.at(-1)!.memory.lx).startsWith("lcx_b #"));
  const caught = ev.find(e => e.operation === "catch")!;
  assert.equal(caught.explanation.key, "catchObject");
  assert.ok(caught.skippedRanges.length >= 2, "the TRY body from the raising call onward is skipped");
  assert.ok(ev.some(e => e.operation === "raise"));
  // The loop context and method frames are cleaned up, so the program keeps working after the catch.
  assert.deepEqual(out(`${exc}TRY.\n  lo->wrapper( 1 ).\nCATCH lcx_a.\n  WRITE 'x'.\nENDTRY.\nDO 2 TIMES.\n  WRITE sy-index.\nENDDO.`), ["x", "1", "2"]);
  assert.deepEqual(out(`${exc}TRY.\n  lo->wrapper( 9 ).\n  WRITE 'fine'.\nCATCH lcx_a.\n  WRITE 'no'.\nENDTRY.\nWRITE lo->mv_done.`), ["fine", "99"]);
  assert.deepEqual(out(`${exc}TRY.\n  lo->wrapper( 1 ).\nCATCH lcx_b.\n  WRITE 'b'.\nCATCH lcx_a.\n  WRITE 'a'.\nENDTRY.`), ["b"]);
  fails(`${exc}lo->wrapper( 1 ).`, "unhandled", /lcx_a is not handled/);
  fails(`${exc}TRY.\n  lo->wrapper( 1 ).\nCATCH lcx_b.\n  WRITE 'b'.\nENDTRY.`, "unhandled");
  fails(exc.replace("METHODS check IMPORTING iv TYPE i RAISING lcx_a.", "METHODS check IMPORTING iv TYPE i."), "unhandled");
  fails(`${exc}TRY.\n  lo->wrapper( 1 ).\nCATCH lcx_a INTO lx.\nENDTRY.`, "unknown");
  fails(`${exc}RAISE EXCEPTION NEW lcl_svc( ).`, "type", /CX_STATIC_CHECK/);
  fails(`${exc}TRY.\nCATCH cx_root.\nENDTRY.`, "unsupported");
  fails(`${exc}TRY.\nCATCH cx_sy_itab_line_not_found INTO DATA(lx).\nENDTRY.`, "unsupported", /INTO/);
  // CX_NO_CHECK exceptions need no declaration; an uncaught one stops the program.
  const noCheck = "CLASS lcx_n DEFINITION INHERITING FROM cx_no_check.\nENDCLASS.\nCLASS lcx_n IMPLEMENTATION.\nENDCLASS.\n";
  fails(`${noCheck}RAISE EXCEPTION TYPE lcx_n.`, "unhandled");
  assert.deepEqual(out(`${noCheck}TRY.\n  RAISE EXCEPTION TYPE lcx_n.\nCATCH lcx_n.\n  WRITE 'ok'.\nENDTRY.`), ["ok"]);
});

test("new graders reject hard-coded results, missing super calls and uncaught raises", () => {
  const [, , , , ctor, inherit, ifc, leave] = oopMissions.map(m => m.challenges![0]);
  assert.equal(graded(ctor.solution.replace("      mv_salary = 1000.", "      mv_salary = 600."), ctor.id), false, "minimum ignored");
  assert.equal(graded(ctor.solution.replace("    IF iv_salary < 1000.\n      mv_salary = 1000.\n    ELSE.\n      mv_salary = iv_salary.\n    ENDIF.", "    mv_salary = 1000."), ctor.id), false, "always 1000");
  assert.equal(graded(inherit.solution.replace("rv_pay = super->get_pay( ) + mv_bonus.", "rv_pay = mv_salary + mv_bonus."), inherit.id), false, "no super call");
  assert.equal(graded(inherit.solution.replace("rv_pay = super->get_pay( ) + mv_bonus.", "rv_pay = 9500."), inherit.id), false, "hard-coded pay");
  assert.equal(graded(ifc.solution.replace("rv_amount = mv_fee + mv_expenses.", "rv_amount = mv_fee."), ifc.id), false, "expenses ignored");
  assert.equal(graded(leave.solution.replace("IF lv_new_total > mv_limit.", "IF lv_new_total >= mv_limit."), leave.id), false, "boundary");
  assert.equal(graded(leave.solution.replace("    WRITE / lx_limit->mv_requested.", "    WRITE / 12."), leave.id), false, "hard-coded requested days");
});
