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
  return <section className="learn-card lookup-summary" aria-label={t.title} data-testid="lookup-summary">
    <h3>{t.title}</h3><p role="status" data-testid="lookup-status">{lookup.found ? t.found : t.missing}</p>
    <p>{t.request}: <code dir="ltr">{lookup.keys ? Object.entries(lookup.keys).map(([field, value]) => `${field} = ${JSON.stringify(value)}`).join(" · ") : `INDEX ${lookup.requestedIndex}`}</code></p>
    <p dir="ltr">sy-subrc = {event.memory["sy-subrc"] as number} · sy-tabix = {event.memory["sy-tabix"] as number}</p>
    {!lookup.found && <p className="muted">{lang === "en" ? "For a failed linear read, SAP leaves sy-tabix undefined. This teaching model displays 0; use sy-subrc to decide whether a row was found." : "عند فشل القراءة الخطية لا يحدد SAP قيمة sy-tabix. يعرض النموذج التعليمي 0؛ استخدم sy-subrc لتحديد نجاح العثور على الصف."}</p>}
    {lookup.found && <p>{t.row}: <bdi>{lookup.index}</bdi></p>}
    <div className="lookup-targets"><div><h4>{t.before}</h4><pre dir="ltr">{JSON.stringify(previous?.memory[lookup.target], null, 2)}</pre></div>
      <div><h4>{t.after}</h4><pre dir="ltr">{JSON.stringify(event.memory[lookup.target], null, 2)}</pre></div></div>
    {showTable && Array.isArray(rows) && <TableMemory name={lookup.table} rows={rows} event={event} lang={lang}/>}
    <p className="muted">{t.copy}</p>
  </section>;
}
