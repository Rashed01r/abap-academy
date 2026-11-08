import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate, evaluate, execute, parse, SimulationError, demoDatabase, type Database } from "../src/lib/engine";
import { sqlMissions } from "../src/lib/sql-missions";

const out = (code: string) => simulate(code).at(-1)!.output;
const fails = (code: string, kind: SimulationError["code"], detail?: RegExp) =>
  assert.throws(() => simulate(code), (e: unknown) => e instanceof SimulationError && e.code === kind && (!detail || detail.test(e.detail)));

test("six English-only SQL lessons: examples, solutions and graders agree", () => {
  for (const m of sqlMissions) {
    assert.equal(m.title.ar, undefined);
    const ch = m.challenges![0];
    assert.equal(out(ch.solution).join("\n"), ch.expected, m.id);
    assert.equal(evaluate(ch.solution, ch.id).correct, true, m.id);
    assert.equal(evaluate(`${ch.starter}WRITE / 1.`, ch.id).correct, false, m.id);
    assert.equal(evaluate(`${ch.starter}${ch.expected.split("\n").map(line => `WRITE / '${line}'.`).join("\n")}`, ch.id).correct, false, `${m.id} canned output`);
  }
});
test("SELECT SINGLE sets sy-subrc/sy-dbcnt and leaves the work area unchanged on a miss", () => {
  const code = (id: number) => `DATA ls TYPE zaca_employee.\nls-employee_name = 'old'.\nSELECT SINGLE FROM zaca_employee FIELDS * WHERE employee_id = ${id} INTO @ls.\nWRITE sy-subrc.\nWRITE sy-dbcnt.\nWRITE ls-employee_name.`;
  assert.deepEqual(out(code(103)), ["0", "1", "Omar"]);
  assert.deepEqual(out(code(999)), ["4", "0", "old"]);
});
test("INTO TABLE, FIELDS projection, ORDER BY and inline declarations", () => {
  const events = simulate("SELECT FROM zaca_employee FIELDS employee_id, employee_name ORDER BY employee_name DESCENDING INTO TABLE @DATA(lt).\nWRITE sy-dbcnt.");
  const sel = events.find(e => e.operation === "sql")!;
  assert.deepEqual(sel.memory.lt, [{ employee_id: 102, employee_name: "Sara" }, { employee_id: 103, employee_name: "Omar" }, { employee_id: 104, employee_name: "Huda" }, { employee_id: 101, employee_name: "Ahmed" }]);
  assert.deepEqual(sel.sql?.matched, [1, 2, 3, 4]);
  assert.deepEqual(events.at(-1)!.output, ["4"]);
  assert.deepEqual(out("SELECT SINGLE FROM zaca_employee FIELDS salary WHERE employee_id = 101 INTO @DATA(lv).\nWRITE lv."), ["8000"]);
  assert.deepEqual(out("SELECT FROM zaca_employee FIELDS employee_name, salary WHERE department = 'LEGAL' INTO TABLE @DATA(lt).\nWRITE sy-subrc.\nWRITE sy-dbcnt.\nWRITE lines( lt )".replace("\nWRITE lines( lt )", "")), ["4", "0"]);
});
test("WHERE supports host variables, AND/OR precedence, parentheses, BETWEEN and LIKE", () => {
  const names = (where: string) => out(`DATA lv TYPE i VALUE 9000.\nSELECT FROM zaca_employee FIELDS employee_name, salary WHERE ${where} ORDER BY employee_id INTO TABLE @DATA(lt).\nLOOP AT lt INTO DATA(ls).\n  WRITE ls-employee_name.\nENDLOOP.`);
  assert.deepEqual(names("department = 'IT' AND salary >= @lv"), ["Omar"]);
  assert.deepEqual(names("department = 'HR' OR department = 'IT' AND salary >= @lv"), ["Sara", "Omar"]);
  assert.deepEqual(names("( department = 'HR' OR department = 'IT' ) AND salary >= @lv"), ["Omar"]);
  assert.deepEqual(names("salary BETWEEN 7200 AND 8000"), ["Ahmed", "Sara"]);
  assert.deepEqual(names("employee_name LIKE '_ma%'"), ["Omar"]);
});
test("INNER and LEFT OUTER JOIN with aliases; outer misses get initial values", () => {
  const join = (type: string) => simulate(`SELECT FROM zaca_department AS d ${type} JOIN zaca_employee AS e ON d~department = e~department FIELDS d~department, e~employee_name, e~salary ORDER BY d~department, e~employee_name INTO TABLE @DATA(lt).`).find(e => e.operation === "sql")!.memory.lt as Record<string, unknown>[];
  assert.equal(join("INNER").length, 4);
  const outer = join("LEFT OUTER");
  assert.equal(outer.length, 5);
  assert.deepEqual(outer.find(r => r.department === "LEGAL"), { department: "LEGAL", employee_name: "", salary: 0 });
});
test("aggregates with and without GROUP BY, including an empty input", () => {
  assert.deepEqual(out("SELECT FROM zaca_employee FIELDS department, COUNT(*) AS n, SUM( salary ) AS s, MIN( salary ) AS lo, MAX( salary ) AS hi GROUP BY department ORDER BY department INTO TABLE @DATA(lt).\nLOOP AT lt INTO DATA(ls).\n  WRITE ls-department.\n  WRITE ls-n.\n  WRITE ls-s.\n  WRITE ls-lo.\n  WRITE ls-hi.\nENDLOOP."),
    ["HR", "1", "7200", "7200", "7200", "IT", "2", "17500", "8000", "9500", "SALES", "1", "6800", "6800", "6800"]);
  assert.deepEqual(out("DATA lv TYPE i VALUE 5.\nSELECT FROM zaca_employee FIELDS COUNT(*) AS n WHERE department = 'LEGAL' INTO @lv.\nWRITE lv.\nWRITE sy-subrc."), ["0", "0"]);
});
test("INSERT/UPDATE/MODIFY/DELETE follow SAP sy-subrc and sy-dbcnt rules and persist for the run only", () => {
  const code = `DATA ls TYPE zaca_employee.\nls-employee_id = 105.\nls-employee_name = 'Lina'.\nls-department = 'SALES'.\nls-salary = 6000.
INSERT zaca_employee FROM @ls.\nWRITE sy-subrc.\nINSERT zaca_employee FROM @ls.\nWRITE sy-subrc.\nWRITE sy-dbcnt.
ls-salary = 6500.\nUPDATE zaca_employee FROM @ls.\nWRITE sy-dbcnt.\nls-employee_id = 106.\nUPDATE zaca_employee FROM @ls.\nWRITE sy-subrc.
MODIFY zaca_employee FROM @ls.\nWRITE sy-subrc.\nUPDATE zaca_employee SET salary = salary + 100, department = 'IT' WHERE employee_id >= 105.\nWRITE sy-dbcnt.
DELETE zaca_employee FROM @ls.\nWRITE sy-subrc.\nDELETE FROM zaca_employee WHERE department = 'NONE'.\nWRITE sy-subrc.\nDELETE FROM zaca_employee WHERE department = 'IT'.\nWRITE sy-dbcnt.`;
  const final = simulate(code).at(-1)!;
  assert.deepEqual(final.output, ["0", "4", "0", "1", "4", "0", "2", "0", "4", "3"]);
  assert.deepEqual(final.database!.zaca_employee.map(r => r.employee_id), [102, 104]);
  assert.deepEqual(demoDatabase.zaca_employee.length, 4); // the shared demo data is never mutated
  assert.equal(simulate("SELECT FROM zaca_employee FIELDS employee_id, salary INTO TABLE @DATA(lt).").at(-1)!.database!.zaca_employee.length, 4);
});
test("a seeded database replaces the demo data for grading probes", () => {
  const db: Database = { zaca_employee: [{ employee_id: 1, employee_name: "Zed", department: "X", salary: 1 }], zaca_department: [] };
  const code = "SELECT SINGLE FROM zaca_employee FIELDS employee_name WHERE employee_id = 1 INTO @DATA(lv).\nWRITE lv.";
  assert.deepEqual(execute(parse(code), code, { database: db }).at(-1)!.output, ["Zed"]);
});
test("unsupported or invalid SQL is rejected with a helpful reason", () => {
  fails("DATA lv TYPE i VALUE 1.\nSELECT SINGLE FROM zaca_employee FIELDS * WHERE employee_id = lv INTO @DATA(ls).", "component", /prefix ABAP variables with @/);
  fails("SELECT * FROM zaca_employee INTO TABLE @DATA(lt).", "unsupported", /SELECT \[SINGLE\] FROM/);
  fails("DATA ls TYPE zaca_employee.\nSELECT FROM zaca_employee FIELDS * INTO @ls.", "unsupported", /ENDSELECT/);
  fails("SELECT FROM zaca_employee FIELDS department, employee_name, COUNT(*) AS c GROUP BY department INTO TABLE @DATA(lt).", "unsupported", /GROUP BY/);
  fails("SELECT FROM zaca_employee FIELDS COUNT(*) INTO TABLE @DATA(lt).", "unsupported", /AS/);
  fails("SELECT FROM zaca_department AS d INNER JOIN zaca_employee AS e ON d~department = e~department FIELDS department_name INTO TABLE @DATA(lt).", "unsupported", /alias~/);
  fails("SELECT FROM zaca_employee FIELDS employee_name WHERE salary = 'x' INTO TABLE @DATA(lt).", "type");
  fails("DATA lt TYPE STANDARD TABLE OF zaca_department WITH EMPTY KEY.\nSELECT FROM zaca_employee FIELDS * INTO TABLE @lt.", "type");
  fails("SELECT FROM zaca_order FIELDS * INTO TABLE @DATA(lt).", "unknown");
  fails("UPDATE zaca_employee SET employee_id = 1.", "unsupported", /Key fields/);
  fails("DATA ls TYPE zaca_department.\nINSERT zaca_employee FROM @ls.", "type");
  fails("SELECT FROM zaca_employee FIELDS AVG( salary ) AS a INTO TABLE @DATA(lt).", "unsupported", /AVG/);
});
test("internal-table INSERT/MODIFY/DELETE keep working next to database statements", () => {
  assert.deepEqual(out("DATA lt TYPE STANDARD TABLE OF i WITH EMPTY KEY.\nAPPEND 1 TO lt.\nINSERT 2 INTO lt INDEX 1.\nMODIFY lt FROM 5 INDEX 1.\nDELETE lt INDEX 2.\nLOOP AT lt INTO DATA(x).\n  WRITE x.\nENDLOOP."), ["5"]);
});
