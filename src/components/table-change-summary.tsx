"use client";
import type { ExecutionEvent, Locale, TableValue } from "@/lib/engine";

export function TableChangeSummary({event, lang}: {event: ExecutionEvent; lang: Locale}) {
  const change = event.mutation;
  if (!change) return null;
  const t = lang === "en" ? {
    title: "Table before and after", before: "Before", after: "After", row: "Position", empty: "No rows", applied: "Table operation applied", missed: "No row changed: positive index exceeds the permitted range", key: "Sort fields",
    insert: "Insert a copied row", modify: "Replace a stored row", delete: "Remove a stored row", sort: "Reorder complete rows",
  } : {
    title: "الجدول قبل العملية وبعدها", before: "قبل", after: "بعد", row: "الموضع", empty: "لا توجد صفوف", applied: "نُفذت عملية الجدول", missed: "لم يتغير أي صف: الفهرس الموجب يتجاوز المجال المسموح", key: "حقول الترتيب",
    insert: "إدراج نسخة من صف", modify: "استبدال صف محفوظ", delete: "حذف صف محفوظ", sort: "إعادة ترتيب الصفوف كاملة",
  };
  const first = change.before[0] ?? change.after[0];
  const fields = first !== undefined && typeof first === "object" ? Object.keys(first) : ["table_line"];
  function snapshot(rows: TableValue, after: boolean) {
    const caption = after ? t.after : t.before;
    return <div className="table-scroll"><table data-testid={after ? "table-change-after" : "table-change-before"}>
      <caption>{caption} · <bdi>{change!.table}</bdi></caption>
      <thead><tr><th scope="col">{t.row}</th>{fields.map(f => <th scope="col" key={f}><code>{f}</code></th>)}</tr></thead>
      <tbody>{rows.map((row, index) => {
        const selected = change!.applied && index + 1 === change!.index;
        const style = selected && (change!.kind === "modify" || change!.kind === "insert" && after || change!.kind === "delete" && !after) ? `change-${change!.kind}` : change!.kind === "sort" && JSON.stringify(change!.before[index]) !== JSON.stringify(change!.after[index]) ? "change-sort" : "";
        return <tr key={index} className={style}><th scope="row">{index + 1}</th>{fields.map(f => <td key={f}><bdi dir="ltr">{JSON.stringify(typeof row === "object" ? row[f] : row)}</bdi></td>)}</tr>;
      })}{!rows.length && <tr><td colSpan={fields.length+1}>{t.empty}</td></tr>}</tbody>
    </table></div>;
  }
  return <section className="learn-card table-change-summary" aria-label={t.title}>
    <h3>{t.title}</h3><p><strong>{t[change.kind]}</strong></p>
    <p role="status" data-testid="table-change-status">{change.applied ? t.applied : t.missed}</p>
    {change.fields && <p>{t.key}: <code dir="ltr">{change.fields.map(f => `${f.field} ${f.direction.toUpperCase()}`).join(", ")}</code></p>}
    <div className="table-change-snapshots">{snapshot(change.before, false)}{snapshot(change.after, true)}</div>
  </section>;
}
