import { test } from "node:test";
import assert from "node:assert/strict";
import { labelFit, structureComponents, candidateRows, keyCollisions, keyDesignIssues, departments, foreignKeyCheck, searchHelpRows } from "../src/lib/dictionary-labs";
import { guidedDictionaryDefinitions } from "../src/lib/guided-dictionary-definitions";
import { validateGuided } from "../src/lib/guided-curriculum";

test("six English-only Dictionary lessons pass guided validation and cover their reference code", () => {
  assert.deepEqual(guidedDictionaryDefinitions.map(d => d.id), ["dictionary-domains", "dictionary-data-elements", "dictionary-structures", "dictionary-database-tables", "dictionary-foreign-keys", "dictionary-search-helps"]);
  for (const d of guidedDictionaryDefinitions) {
    assert.deepEqual(validateGuided(d), [], d.id);
    assert.equal(d.title.ar, undefined);
    const lines = d.code.split("\n").length;
    const covered = d.groups.flatMap(g => Array.from({ length: g.end - g.start + 1 }, (_, i) => g.start + i));
    assert.deepEqual(covered, Array.from({ length: lines }, (_, i) => i + 1), `${d.id} groups cover every line once, in order`);
  }
});
test("data element labels fit or are cut at 10/20/40/55 characters", () => {
  assert.deepEqual(labelFit("Status", 10), { fits: true, shown: "Status", missing: false });
  assert.deepEqual(labelFit("Employee status", 10), { fits: false, shown: "Employee s", missing: false });
  assert.equal(labelFit("  ", 10).missing, true);
});
test("including the address repeats city until a suffix renames it", () => {
  assert.deepEqual(structureComponents(false, "").duplicates, []);
  assert.deepEqual(structureComponents(true, "").duplicates, ["city"]);
  const suffixed = structureComponents(true, "_home");
  assert.deepEqual(suffixed.duplicates, []);
  assert.deepEqual(suffixed.components, ["employee_id", "name", "city", "street_home", "city_home", "country_home"]);
});
test("the primary key decides which rows are refused, and key rules guide the design", () => {
  assert.deepEqual(keyCollisions(candidateRows, ["client", "employee_id"]).rejected, [3]);
  assert.deepEqual(keyCollisions(candidateRows, ["employee_id"]).rejected, [2, 3]); // wrongly refuses Omar in client 200
  assert.deepEqual(keyCollisions(candidateRows, ["status"]).rejected, [1, 2]); // only Sara's status I is new
  assert.deepEqual(keyCollisions(candidateRows, []).rejected, []);
  assert.deepEqual(keyDesignIssues(["client", "employee_id"]), []);
  assert.equal(keyDesignIssues([]).length, 1);
  assert.ok(keyDesignIssues(["client", "employee_id", "name"]).some(i => i.includes("name")));
  assert.ok(keyDesignIssues(["employee_id"]).some(i => i.includes("client")));
});
test("foreign keys check classic screens but not program writes", () => {
  assert.equal(foreignKeyCheck("it", departments, true).saved, true);
  const screen = foreignKeyCheck("FIN", departments, true);
  assert.equal(screen.saved, false);
  assert.match(screen.message, /rejects/);
  const program = foreignKeyCheck("FIN", departments, false);
  assert.equal(program.saved, true);
  assert.equal(program.exists, false);
  assert.match(program.message, /no foreign key constraint/);
});
test("search help restriction uses * wildcards, case-insensitively", () => {
  assert.deepEqual(searchHelpRows(departments, "name", "").map(r => r.department_id), ["HR", "IT", "SALES"]);
  assert.deepEqual(searchHelpRows(departments, "name", "S*").map(r => r.department_id), ["SALES"]);
  assert.deepEqual(searchHelpRows(departments, "name", "*tech*").map(r => r.department_id), ["IT"]);
  assert.deepEqual(searchHelpRows(departments, "name", "x*").map(r => r.department_id), []);
  assert.deepEqual(searchHelpRows(departments, "department_id", "h(r").length, 0); // special characters are literal
});
