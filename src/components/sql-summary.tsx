"use client";
// Shows the simulator's demo database and the outcome of an ABAP SQL step. English only while ENABLE_ARABIC = false.
import type { ExecutionEvent, Primitive, StructureValue } from "@/lib/engine";

function RowsTable({ label, rows, highlight = [] }: { label: string; rows: (Primitive | StructureValue)[]; highlight?: number[] }) {
  if (!rows.length) return <p className="muted">{label}: no rows.</p>;
  const columns = typeof rows[0] === "object" ? Object.keys(rows[0] as StructureValue) : ["value"];
  return <div className="table-scroll"><table className="key-table" aria-label={label}>
    <caption>{label}</caption>
    <thead><tr><th scope="col">#</th>{columns.map(c => <th scope="col" key={c}><code>{c}</code></th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i} data-matched={highlight.includes(i + 1) || undefined} className={highlight.includes(i + 1) ? "success-text" : undefined}>
      <td>{i + 1}</td>{columns.map(c => <td key={c} dir="ltr">{String(typeof row === "object" ? (row as StructureValue)[c] : row)}</td>)}
    </tr>)}</tbody>
  </table></div>;
}

/** Database tables as they are after this step; matched rows of the step's table are highlighted. */
export function DatabaseState({ event }: { event: ExecutionEvent }) {
  if (!event.database) return null;
  const sql = event.sql;
  const tables = Object.keys(event.database).filter(name => !sql || name === sql.table || name === sql.joined);
  return <section className="learn-card sql-database" aria-label="Database" data-testid="sql-database">
    <span className="eyebrow">Database (demo, reset on every run)</span>
    {tables.map(name => <RowsTable key={name} label={name.toUpperCase()} rows={event.database![name]} highlight={sql && name === sql.table && sql.kind !== "delete" ? sql.matched : []}/>)}
  </section>;
}

export function SqlSummary({ event }: { event: ExecutionEvent }) {
  const sql = event.sql;
  if (!sql) return null;
  const verb = sql.kind.toUpperCase();
  return <section className="learn-card sql-summary" aria-label="ABAP SQL step" data-testid="sql-summary">
    <h3>{verb} on {sql.table.toUpperCase()}{sql.joined ? ` with ${sql.joined.toUpperCase()}` : ""}</h3>
    <p role="status" data-testid="sql-status" dir="ltr">sy-subrc = {sql.subrc} · sy-dbcnt = {sql.dbcnt}</p>
    {sql.kind === "select" && sql.result && <RowsTable label="Result copied into the program" rows={sql.result}/>}
    {sql.kind === "delete" && sql.before && <RowsTable label="Before DELETE (removed rows highlighted)" rows={sql.before} highlight={sql.matched}/>}
    <DatabaseState event={event}/>
    <p className="muted">{sql.kind === "select" ? "Reading copies data into the program; the database table is unchanged." : "The change is in the demo database for the rest of this run. In SAP it becomes permanent with COMMIT WORK."}</p>
  </section>;
}
