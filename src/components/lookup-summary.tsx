"use client";
import type { ExecutionEvent, Locale } from "@/lib/engine";
import { TableMemory } from "./table-memory";

export function LookupSummary({event, previous, lang, showTable = false}: {
  event: ExecutionEvent; previous?: ExecutionEvent; lang: Locale; showTable?: boolean;
}) {
  const lookup = event.lookup;
  if (!lookup) return null;
  const t = lang === "en" ? {
    title: "Single-row lookup", found: "Matching row copied", missing: "No matching row; target unchanged",
    request: "Search", before: "Target before read", after: "Target after read", row: "Row position", copy: "The destination is a copy. Its previous contents alone cannot prove that this read succeeded.",
  } : {
    title: "البحث عن صف واحد", found: "نُسخ الصف المطابق", missing: "لا يوجد صف مطابق؛ بقيت الوجهة دون تغيير",
    request: "البحث", before: "الوجهة قبل القراءة", after: "الوجهة بعد القراءة", row: "موضع الصف", copy: "الوجهة نسخة. لا تثبت محتوياتها السابقة وحدها نجاح عملية القراءة الحالية.",
  };
  const rows = event.memory[lookup.table];
  if (lookup.via === "expression") return <ExpressionLookup event={event} previous={previous} showTable={showTable} lang={lang}/>;
  return <section className="learn-card lookup-summary" aria-label={t.title} data-testid="lookup-summary">
    <h3>{t.title}</h3><p role="status" data-testid="lookup-status">{lookup.found ? t.found : t.missing}</p>
    <p>{t.request}: <code dir="ltr">{lookup.keys ? Object.entries(lookup.keys).map(([field, value]) => `${field} = ${JSON.stringify(value)}`).join(" · ") : `INDEX ${lookup.requestedIndex}`}</code></p>
    <p dir="ltr">sy-subrc = {event.memory["sy-subrc"] as number} · sy-tabix = {event.memory["sy-tabix"] as number}</p>
    <RowsChecked event={event}/>
    {!lookup.found && lookup.binary && <p className="muted">BINARY SEARCH found no match. sy-tabix shows where the key would belong. If the table was not sorted by this key, the row may still exist.</p>}
    {!lookup.found && !lookup.binary && <p className="muted">{lang === "en" ? "For a failed linear read, SAP leaves sy-tabix undefined. This teaching model displays 0; use sy-subrc to decide whether a row was found." : "عند فشل القراءة الخطية لا يحدد SAP قيمة sy-tabix. يعرض النموذج التعليمي 0؛ استخدم sy-subrc لتحديد نجاح العثور على الصف."}</p>}
    {lookup.found && <p>{t.row}: <bdi>{lookup.index}</bdi></p>}
    <div className="lookup-targets"><div><h4>{t.before}</h4><pre dir="ltr">{JSON.stringify(previous?.memory[lookup.target], null, 2)}</pre></div>
      <div><h4>{t.after}</h4><pre dir="ltr">{JSON.stringify(event.memory[lookup.target], null, 2)}</pre></div></div>
    {showTable && Array.isArray(rows) && <TableMemory name={lookup.table} rows={rows} event={event} lang={lang}/>}
    <p className="muted">{t.copy}</p>
  </section>;
}

/** How many rows the lookup examined, in order. A teaching count from the simulator, not an SAP runtime. English only. */
function RowsChecked({event}: {event: ExecutionEvent}) {
  const lookup = event.lookup!;
  if (!lookup.checked) return null;
  const rows = event.memory[lookup.table];
  const total = Array.isArray(rows) ? rows.length : 0;
  return <p data-testid="rows-checked">Rows checked: <strong>{lookup.checked.length}</strong> of {total}{lookup.binary ? " (binary search)" : " (one by one)"} · positions <code dir="ltr">{lookup.checked.join(" → ") || "none"}</code></p>;
}

/** Table expressions (itab[ … ], line_exists, line_index) never set sy-subrc; a miss raises or uses OPTIONAL/DEFAULT.
 * English only while ENABLE_ARABIC = false. */
function ExpressionLookup({event, previous, showTable, lang}: {event: ExecutionEvent; previous?: ExecutionEvent; showTable: boolean; lang: Locale}) {
  const lookup = event.lookup!;
  const rows = event.memory[lookup.table];
  const request = `${lookup.table}[ ${lookup.keys ? Object.entries(lookup.keys).map(([field, value]) => `${field} = ${JSON.stringify(value)}`).join(" ") : lookup.requestedIndex} ]`;
  const status = lookup.found ? `Found at position ${lookup.index}`
    : lookup.raised ? "No matching row: CX_SY_ITAB_LINE_NOT_FOUND was raised"
    : lookup.fallback === "optional" ? "No matching row: OPTIONAL supplied an initial row"
    : lookup.fallback === "default" ? "No matching row: DEFAULT supplied the fallback"
    : "No matching row";
  return <section className="learn-card lookup-summary" aria-label="Table expression" data-testid="lookup-summary">
    <h3>Table expression</h3><p role="status" data-testid="lookup-status">{status}</p>
    <p>Search: <code dir="ltr">{request}</code></p>
    <RowsChecked event={event}/>
    <p className="muted">A table expression does not change sy-subrc or sy-tabix. Decide with TRY … CATCH, line_exists( ), line_index( ) or OPTIONAL, not with sy-subrc.</p>
    {lookup.target && <div className="lookup-targets"><div><h4>{lookup.target} before</h4><pre dir="ltr">{JSON.stringify(previous?.memory[lookup.target], null, 2)}</pre></div>
      <div><h4>{lookup.target} after</h4><pre dir="ltr">{JSON.stringify(event.memory[lookup.target], null, 2)}</pre></div></div>}
    {showTable && Array.isArray(rows) && <TableMemory name={lookup.table} rows={rows} event={event} lang={lang}/>}
  </section>;
}
