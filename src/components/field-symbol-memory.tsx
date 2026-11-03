import type { ExecutionEvent, Locale } from "@/lib/engine";
import { TechnicalText } from "./technical-text";

const content = {
  en: {title:"Field symbols: access to existing data", unassigned:"Unassigned — no data object", same:"This is the target's current value, not a second copy. A write through the symbol changes this data object.", unchanged:"UNASSIGN removes access through the symbol; it does not erase the target.", before:"Before", after:"Now", changed:"Changed through this access"},
  ar: {title:"رموز الحقول: الوصول إلى بيانات موجودة", unassigned:"غير مرتبط — لا يوجد كائن بيانات محدد", same:"هذه القيمة الحالية لكائن البيانات المشار إليه، وليست نسخة ثانية. تعدّل الكتابة عبر الرمز هذا الكائن نفسه.", unchanged:"تلغي UNASSIGN الوصول من خلال الرمز، ولا تمسح قيمة الكائن.", before:"قبل التعديل", after:"الآن", changed:"تغيّرت القيمة عبر هذا الوصول"},
};
export function FieldSymbolMemory({event, previous, lang}: {event:ExecutionEvent; previous?:ExecutionEvent; lang:Locale}) {
  if (!event.aliases || !Object.keys(event.aliases).length) return null;
  const t = content[lang];
  function value(target:string, snapshot:ExecutionEvent | undefined) {
    const [base, field] = target.split("-");
    const record = snapshot?.memory[base];
    return field && record && typeof record === "object" && !Array.isArray(record) ? record[field] : record;
  }
  return <section className="alias-memory" aria-label={t.title}>
    <h4>{t.title}</h4>
    {Object.entries(event.aliases).map(([symbol,target]) => <div className="alias-link" key={symbol} data-symbol={symbol}>
      <div className="alias-connection" dir="ltr"><code>{symbol}</code><span aria-hidden="true">→</span><code>{target || "∅"}</code></div>
      {!target ? <p>{t.unassigned}</p> : <>
        <p>{t.same}</p>
        <div className="alias-values">
          {previous && previous.aliases?.[symbol] === target && <div><strong>{t.before}</strong><pre dir="ltr">{JSON.stringify(value(target,previous),null,2)}</pre></div>}
          <div><strong>{t.after}</strong><pre dir="ltr" data-testid="alias-value">{JSON.stringify(value(target,event),null,2)}</pre></div>
        </div>
        {event.changed.some(name => name === target || name.startsWith(target + "-")) && <p className="success-text">{t.changed}</p>}
      </>}
      {event.operation === "unbind" && <p><TechnicalText>{t.unchanged}</TechnicalText></p>}
    </div>)}
  </section>;
}
