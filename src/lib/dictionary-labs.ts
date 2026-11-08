// Pure teaching models behind the ABAP Dictionary labs. They illustrate Dictionary rules locally; they never
// create, activate or check SAP repository objects. Sources: .claude/skills/academy-lesson/references/sap-notes/dictionary.md

/** Data element field labels and their maximum lengths in the ABAP Dictionary. */
export const labelSlots = [
  { id: "short", name: "Short label", max: 10 },
  { id: "medium", name: "Medium label", max: 20 },
  { id: "long", name: "Long label", max: 40 },
  { id: "heading", name: "Heading", max: 55 },
] as const;
export function labelFit(text: string, max: number) {
  return { fits: text.trim().length > 0 && text.length <= max, shown: text.slice(0, max), missing: text.trim().length === 0 };
}

/** Structure lab: an employee structure with its own work city, optionally including the address structure. */
export const employeeCoreComponents = ["employee_id", "name", "city"];
export const addressComponents = ["street", "city", "country"];
export function structureComponents(includeAddress: boolean, suffix: string) {
  const included = includeAddress ? addressComponents.map(c => c + suffix) : [];
  const components = [...employeeCoreComponents, ...included];
  const duplicates = [...new Set(components.filter((c, i) => components.indexOf(c) !== i))];
  return { components, duplicates };
}

/** Table lab: which candidate rows a primary key would reject as duplicates (first occurrence wins). */
export type EmployeeRow = { client: string; employee_id: string; name: string; status: string };
export const candidateRows: EmployeeRow[] = [
  { client: "100", employee_id: "1001", name: "Ahmed", status: "A" },
  { client: "100", employee_id: "1002", name: "Sara", status: "A" },
  { client: "200", employee_id: "1001", name: "Omar", status: "A" },
  { client: "100", employee_id: "1002", name: "Sara", status: "I" },
];
export const keyCandidates = ["client", "employee_id", "name", "status"] as const;
export function keyCollisions(rows: EmployeeRow[], keys: readonly string[]) {
  if (!keys.length) return { rejected: [] as number[], seen: [] as string[] };
  const seen: string[] = [], rejected: number[] = [];
  rows.forEach((row, index) => {
    const value = keys.map(k => row[k as keyof EmployeeRow]).join("|");
    if (seen.includes(value)) rejected.push(index); else seen.push(value);
  });
  return { rejected, seen };
}
/** Design rules for the employee table key, following the DDIC table rules taught in the lesson. */
export function keyDesignIssues(keys: readonly string[]) {
  const issues: string[] = [];
  if (!keys.length) issues.push("Every database table needs a primary key.");
  if (keys.length && !keys.includes("client")) issues.push("This table is client-dependent: client is the first key field.");
  if (keys.length && !keys.includes("employee_id")) issues.push("Add employee_id: it is the stable business identifier.");
  if (keys.includes("name") || keys.includes("status")) issues.push("Keep name and status out of the key: they can change.");
  return issues;
}

/** Foreign key lab: classic screen check against the check table, versus a program write. */
export const departments = [
  { department_id: "HR", name: "Human resources" },
  { department_id: "IT", name: "Information technology" },
  { department_id: "SALES", name: "Sales" },
];
export function foreignKeyCheck(value: string, checkTable: readonly { department_id: string }[], viaScreen: boolean) {
  const exists = checkTable.some(d => d.department_id === value.trim().toUpperCase());
  if (!value.trim()) return { saved: true, exists: false, message: "Empty department: there is nothing to check." };
  if (viaScreen) return exists
    ? { saved: true, exists, message: `${value.toUpperCase()} is a key of ZACA_DEPARTMENT, so the screen accepts it.` }
    : { saved: false, exists, message: `${value.toUpperCase()} is not in the check table ZACA_DEPARTMENT. The screen check rejects the entry.` };
  return { saved: true, exists, message: exists
    ? `Saved by a program. ${value.toUpperCase()} exists in ZACA_DEPARTMENT.`
    : `Saved by a program anyway: the database has no foreign key constraint. ${value.toUpperCase()} now points to a department that does not exist.` };
}

/** Search help lab: filter the selection method rows with an SAP-style * pattern (case-insensitive). */
export function searchHelpRows<T extends Record<string, string>>(rows: readonly T[], field: keyof T, pattern: string) {
  const p = pattern.trim();
  if (!p) return [...rows];
  const regex = new RegExp("^" + p.split("*").map(part => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$", "i");
  return rows.filter(row => regex.test(row[field]));
}
