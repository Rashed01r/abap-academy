import test from "node:test";
import assert from "node:assert/strict";
import { guidedDataDefinitions } from "../src/lib/guided-data-definitions";
import { dictionaryDesignIssues, domainValueIssues } from "../src/components/dictionary-designer";
import { projectSqlFixture, sqlEmployees } from "../src/components/sql-foundation-lab";

test("Dictionary domain policies reject wrong values and contradictory fixed definitions", () => {
  assert.deepEqual(domainValueIssues({ type: "CHAR", length: 1, fixed: ["A", "I"] }, "A"), []);
  assert.deepEqual(domainValueIssues({ type: "CHAR", length: 1, fixed: ["A", "I"] }, "ACTIVE"), ["overflow", "fixed"]);
  assert.deepEqual(domainValueIssues({ type: "NUMC", length: 6, fixed: [] }, "000101"), []);
  assert.deepEqual(domainValueIssues({ type: "NUMC", length: 6, fixed: [] }, "10A"), ["digits"]);
  assert.deepEqual(domainValueIssues({ type: "INT4", length: 10, fixed: [] }, "2147483648"), ["integer"]);
  assert.deepEqual(domainValueIssues({ type: "INT4", length: 10, fixed: [] }, "-2147483648"), []);
  assert.deepEqual(dictionaryDesignIssues({ type: "CHAR", length: 1, fixed: ["ACTIVE"] }, "", ["name"]), ["binding", "fixedDefinition", "identityMissing", "mutableKey"]);
  assert.deepEqual(dictionaryDesignIssues({ type: "CHAR", length: 1, fixed: ["A", "I"] }, "ZACA_STATUS_DOMAIN", ["employee_id"]), []);
});

test("SQL model filters before projection and never mutates its source", () => {
  const snapshot = JSON.stringify(sqlEmployees);
  const result = projectSqlFixture({ source: "employees", fields: ["employee_name"], department: "IT", minimumSalary: 9000 });
  assert.deepEqual(result, [{ employee_name: "Omar" }]);
  result[0].employee_name = "Changed";
  assert.equal(JSON.stringify(sqlEmployees), snapshot);
  assert.deepEqual(projectSqlFixture({ source: "employees", fields: ["employee_id"], department: "LEGAL", minimumSalary: 0 }), []);
  assert.deepEqual(projectSqlFixture({ source: "departments", fields: ["department_name"], department: "HR", minimumSalary: 9000 }), [{ department_name: "Human resources" }]);
  assert.deepEqual(projectSqlFixture({ source: "employees", fields: ["not_a_column"], department: "", minimumSalary: 0 }), []);
});

test("Data guided definitions have contiguous full reference coverage and connected valid assessments", () => {
  for (const definition of guidedDataDefinitions) {
    let expected = 1;
    for (const group of definition.groups) {
      assert.equal(group.start, expected);
      assert.ok(group.end >= group.start);
      expected = group.end + 1;
    }
    assert.equal(expected - 1, definition.code.split("\n").length);
    assert.ok(definition.artifacts.length >= 4);
    const artifacts = new Set(definition.artifacts.map(a => a.id));
    for (const edge of definition.relations) { assert.ok(artifacts.has(edge.from)); assert.ok(artifacts.has(edge.to)); }
    assert.ok(definition.decisions.length >= 3);
    const optionIds = definition.decisions.flatMap(d => d.options.map(o => o.id));
    assert.equal(new Set(optionIds).size, optionIds.length);
    for (const decision of definition.decisions) { assert.ok(decision.options.some(o => o.id === decision.correct)); assert.ok(decision.hints.length); }
    assert.ok(definition.options[definition.answer]);
  }
});
