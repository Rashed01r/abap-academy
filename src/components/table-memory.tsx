"use client";
import { useState } from "react";
import type { ExecutionEvent, Locale, Primitive } from "@/lib/engine";
import { ui } from "@/lib/i18n";

type Row = Primitive | Record<string, Primitive>;
export function TableMemory({ name, rows, event, lang }: {
  name: string; rows: Row[]; event: ExecutionEvent; lang: Locale;
}) {
  const [inspected, setInspected] = useState<number>();
  const t = ui[lang];
  const fields = typeof rows[0] === "object" ? Object.keys(rows[0]) : ["value"];
  const active = event.tableSelection?.name === name ? event.tableSelection.index : undefined;
  return <div className="table-memory" data-testid="table-memory" data-table={name}>
    <p className="table-count"><bdi dir="ltr">{rows.length}</bdi> {t.rows} · {t.tableMemoryOnly}</p>
    <div className="table-scroll">
      <table>
        <caption className="sr-only">{name} · {t.rows}: {rows.length}</caption>
        <thead><tr><th scope="col">{t.row}</th>{fields.map(field => <th scope="col" key={field}><code dir="ltr">{field}</code></th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index}
          className={`${active === index ? "active-row" : ""} ${event.operation === "append" && event.changed.includes(name) && index === rows.length - 1 ? "new-row" : ""}`}
          aria-current={active === index ? "true" : undefined}>
          <th scope="row"><button className="row-inspect" aria-pressed={inspected === index} onClick={() => setInspected(inspected === index ? undefined : index)} aria-label={`${t.inspectRow} ${index + 1}`}>
            {index + 1}{active === index && <span aria-label={t.activeRow}> ▶</span>}
          </button></th>
          {fields.map(field => <td key={field}><code dir="ltr">{JSON.stringify(typeof row === "object" ? row[field] : row)}</code></td>)}
        </tr>)}</tbody>
      </table>
    </div>
    {!rows.length && <p className="muted">{t.emptyTable}</p>}
    {inspected !== undefined && rows[inspected] !== undefined && <div className="row-detail" role="status">
      <span>{t.inspectedRow} {inspected + 1}</span><pre dir="ltr">{JSON.stringify(rows[inspected], null, 2)}</pre>
      <small>{t.inspectDoesNotExecute}</small>
    </div>}
    {active !== undefined && <p className="active-row-label">▶ {t.activeRow}: <bdi dir="ltr">{active + 1}</bdi> · {t.rowCopied}</p>}
  </div>;
}
