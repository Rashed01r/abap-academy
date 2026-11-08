import type { ExecutionEvent, Locale } from "./engine";
import { explain } from "./i18n";

/** Presentation snapshots only: these never execute code or award learner progress. */
export type TraceState = Record<string, unknown>;
export type TeachingStep = {
  id: string;
  title: string;
  sentence: string;
  state?: TraceState;
  output?: readonly string[];
  line?: number;
  endLine?: number;
  code?: string;
  captionSource?: "authored" | "generated";
};

export function sameValue(a: unknown, b: unknown): boolean {
  if(a===b)return true;
  if(a===null || b===null || typeof a!=="object" || typeof b!=="object")return false;
  if(Array.isArray(a) || Array.isArray(b))return Array.isArray(a) && Array.isArray(b) && a.length===b.length && a.every((value,i)=>sameValue(value,b[i]));
  const left=a as TraceState,right=b as TraceState;
  return Object.keys(left).length===Object.keys(right).length && Object.keys(left).every(key=>Object.hasOwn(right,key) && sameValue(left[key],right[key]));
}

/** Include removed values as well as additions; compare snapshots, not event hints. */
export function changedNames(before: TraceState = {}, after: TraceState = {}): string[] {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(name => !sameValue(before[name], after[name]));
}

export function displayValue(value: unknown): string {
  if (value === undefined) return "—";
  if (value === null) return "∅";
  if (value === "") return '""';
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

export function firstSentence(text: string): string {
  // Periods in decimals and identifiers are not sentence boundaries.
  return text.split(/(?<=[.!?؟])\s+(?=[A-Z\u0600-\u06ff])/u)[0];
}

export function executionSteps(events: readonly ExecutionEvent[], lang: Locale): TeachingStep[] {
  const en = lang === "en";
  const english: Record<ExecutionEvent["operation"], string> = {
    define:"Describe the data", declare:"Create storage", assign:"Update a value", write:"Show a value",
    condition:"Check a choice", end:"Finish this block", loop:"Check the next pass", append:"Save a row",
    read:"Find a row", insert:"Insert a row", modify:"Replace a row", delete:"Remove a row", sort:"Put rows in order",
    control:"Choose the next instruction", bind:"Connect to existing data", unbind:"Disconnect the reference",
    try:"Enter a protected block", catch:"Handle a missing row",
  };
  // Arabic titles are optional while Arabic is deferred; missing ones fall back to English.
  const arabic: Partial<Record<ExecutionEvent["operation"], string>> = {
    define:"وصف البيانات", declare:"إنشاء مكان للقيمة", assign:"تحديث قيمة", write:"عرض قيمة",
    condition:"فحص الاختيار", end:"إنهاء هذا الجزء", loop:"فحص الدورة التالية", append:"حفظ صف",
    read:"البحث عن صف", insert:"إدراج صف", modify:"استبدال صف", delete:"حذف صف", sort:"ترتيب الصفوف",
    control:"تحديد التعليمة التالية", bind:"الارتباط ببيانات موجودة", unbind:"إلغاء الارتباط",
  };
  const titles: Record<ExecutionEvent["operation"], string> = en ? english : { ...english, ...arabic };
  return events.map((event, index) => {
    const changes = changedNames(events[index - 1]?.memory, event.memory);
    const name = changes.find(n => !n.startsWith("sy-")) || changes[0];
    let sentence = firstSentence(explain(event, lang));
    if (event.operation === "assign" && name) {
      const before = displayValue(events[index - 1]?.memory[name]);
      const after = displayValue(event.memory[name]);
      sentence = en ? `${name} changes from ${before} to ${after} because this instruction stores its result there.`
        : `تتغير ${name} من ${before} إلى ${after} لأن التعليمة تحفظ نتيجتها فيها.`;
    } else if (event.condition) {
      sentence = en ? `${event.condition.expression} is ${event.condition.result ? "true, so this path runs" : "false, so this path is skipped"}.`
        : `نتيجة ${event.condition.expression} هي ${event.condition.result ? "صحيح، لذلك يُنفّذ هذا المسار" : "خطأ، لذلك يُتجاوز هذا المسار"}.`;
    } else if (event.operation === "append" && name && Array.isArray(event.memory[name])) {
      sentence = en ? `${name} now holds ${(event.memory[name] as unknown[]).length} rows because this instruction saves a copy of the current value.`
        : `يحتوي ${name} الآن على ${(event.memory[name] as unknown[]).length} صفوف لأن التعليمة تحفظ نسخة من القيمة الحالية.`;
    }
    if(event.filter && en) sentence = "Row "+event.filter.index+": "+event.condition!.expression+" is "+(event.filter.matched ? "true, so this row enters the body" : "false, so the work area stays unchanged and this row skips the body")+".";
    if(event.operation==="end") sentence=en ? `At line ${event.range.startLine}, ${sentence[0].toLowerCase()+sentence.slice(1)}` : `عند السطر ${event.range.startLine}، ${sentence}`;
    if(event.loop && event.loop.iteration>0) sentence=en ? `On pass ${event.loop.iteration}, ${sentence[0].toLowerCase()+sentence.slice(1)}` : `في الدورة ${event.loop.iteration}، ${sentence}`;
    return {id:String(event.id),title:titles[event.operation],sentence,state:{...event.memory,...(event.aliases || {})},
      output:event.output,line:event.range.startLine,endLine:event.range.endLine,captionSource:"generated"};
  });
}
