// Educational key comparison only; this is not part of the ABAP executor.
export type KeyRow = { department: string; id: number; name: string };
export const keyFields = ["department", "id", "name"] as const;
export type KeyField = typeof keyFields[number];
export const keySamples: readonly KeyRow[] = [
  { department: "IT", id: 101, name: "Ahmed" },
  { department: "HR", id: 101, name: "Sara" },
  { department: "IT", id: 102, name: "Omar" },
  { department: "IT", id: 101, name: "Noura" },
  { department: "IT", id: 101, name: "Ahmed" },
];
export function sameKey(a: KeyRow, b: KeyRow, fields: readonly KeyField[]) {
  return fields.every(field => a[field] === b[field]);
}
export function keySnapshot(fields: readonly KeyField[], unique: boolean, count: number) {
  const rows: KeyRow[] = [];
  const steps = keySamples.slice(0, Math.max(0, Math.min(keySamples.length, Math.floor(count)))).map(row => {
    const before = [...rows];
    const conflict = rows.findIndex(stored => sameKey(stored, row, fields));
    const accepted = !unique || conflict === -1;
    if (accepted) rows.push({ ...row });
    return { row, before, after: [...rows], accepted, conflict };
  });
  return { rows, steps };
}
export const keyCandidates: readonly KeyRow[] = [
  { department: "Sales", id: 101, name: "Lina" },
  { department: "IT", id: 101, name: "Huda" },
  { department: "IT", id: 103, name: "Ahmed" },
];
export function gradeKeyDesign(fields: readonly KeyField[], unique: boolean, predictions: readonly (boolean | undefined)[]) {
  // Business identity is department + ID, independent of a mutable display name.
  const design = unique && fields.length === 2 && fields.includes("department") && fields.includes("id");
  const baseline = keySamples.slice(0, 3);
  const expected = keyCandidates.map(row => !baseline.some(stored => sameKey(stored, row, ["department", "id"])));
  return { design, expected, correct: design && expected.every((answer, i) => predictions[i] === answer) };
}
