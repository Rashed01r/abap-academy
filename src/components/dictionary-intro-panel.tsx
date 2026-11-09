"use client";
// Right-hand panel for "Introduction to ABAP Dictionary" on Learn: the table builds up part by part,
// with a duplicate-key try-it (part 3) and the status → data element → domain chain (part 4).
// English only while ENABLE_ARABIC = false. Local teaching model; nothing is created in SAP.
import { useState } from "react";
import { domainValueIssues } from "./dictionary-designer";

const rows = [["100", "101", "A"], ["100", "102", "I"]];
const columns = [["CLIENT", true], ["EMPLOYEE_ID", true], ["STATUS", false]] as const;
const notes = [
  "A table is a stored sheet. Its rows live in the database, not in the program.",
  "Client is a key: rows of different companies stay apart.",
  "CLIENT + EMPLOYEE_ID together identify one row. No duplicates, no blanks.",
  "STATUS is an ordinary column. It points to a data element, which points to a domain.",
];
const statusNames: Record<string, string> = { A: "Active", I: "Inactive" };

/** `part` is the active stage index (0-3), or -1 before the learner has pressed Next part. */
export function DictionaryIntroPanel({ part }: { part: number }) {
  const [newId, setNewId] = useState("101");
  const [status, setStatus] = useState("X");
  const shown = Math.max(part, 0);
  const visible = columns.slice(0, Math.max(part, 0));
  const id = newId.trim(), duplicate = rows.some(r => r[1] === id);
  const value = status.trim().toUpperCase();
  const issues = domainValueIssues({ type: "CHAR", length: 1, fixed: ["A", "I"] }, value);
  return <>
    <section className="dict-panel" aria-label="The table in the database">
      <span className="eyebrow">The table in the database · ZACA_EMPLOYEE</span>
      {part < 1 ? <p className="dict-empty">The table exists, but it has no columns yet. Press “Next part” to add them.</p>
        : <table><thead><tr>{visible.map(([name, key], i) => <th key={`${name}-${part}`} data-new={i === part - 1 || undefined}>{name}{key && <span className="dict-tag">key</span>}</th>)}</tr></thead>
          <tbody>{rows.map(r => <tr key={r[1]}>{visible.map((c, i) => <td key={c[0]} data-new={i === part - 1 || undefined}>{r[i]}</td>)}</tr>)}</tbody></table>}
      <p className="muted">{notes[shown]}</p>
    </section>
    {part === 2 && <section className="dict-panel" aria-label="Try it: add an employee">
      <span className="eyebrow">Try it · add an employee</span>
      <label className="dict-try">New employee_id <input dir="ltr" inputMode="numeric" value={newId} onChange={e => setNewId(e.target.value)} />
        <span role="status" data-ok={!!id && !duplicate}>{!id ? "✗ not null: the key cannot be empty." : duplicate ? `✗ Employee ${id} already exists in client 100. Rejected.` : "✓ New key. Row accepted."}</span></label>
    </section>}
    {part === 3 && <>
      <section className="dict-panel" aria-label="Where status gets its meaning">
        <span className="eyebrow">Where does “status” get its meaning?</span>
        <div className="dict-chain">
          <div data-lit><small>Table field</small><code>status</code><span>column in zaca_employee</span></div><b aria-hidden="true">→</b>
          <div data-lit data-de><small>Data element</small><code>zaca_employee_status</code><span>label: Employee status</span></div><b aria-hidden="true">→</b>
          <div><small>Domain</small><code>zaca_status_domain</code><span>CHAR(1) · A, I</span></div>
        </div>
        <p className="muted">The column holds no rules itself. It points up the chain, so changing the domain updates every field that uses it.</p>
      </section>
      <section className="dict-panel" aria-label="Try a status value">
        <span className="eyebrow">Try a status value</span>
        <label className="dict-try">Value <input dir="ltr" maxLength={3} value={status} onChange={e => setStatus(e.target.value)} />
          <span role="status" data-ok={!issues.length}>{!value ? "Empty: the field stays unset." : !issues.length ? `✓ ${value} = ${statusNames[value]}. Allowed by the domain.` : `✗ “${value}” is not a fixed value of the domain (A, I).`}</span></label>
        <p className="muted">Fixed values guide Dictionary input checks. They are not a universal database constraint.</p>
      </section>
    </>}
  </>;
}
