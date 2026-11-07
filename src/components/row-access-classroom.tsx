"use client";
import { localizedText } from "../lib/language-policy";
import { rowAccessState, rowAccessReference } from "@/lib/visual-comparisons";
import { useTopicSession } from "@/lib/use-topic-session";
import type { Locale } from "@/lib/engine";
import { EmployeeTable } from "./table-category-classroom";
import { VisualCodeAnatomy } from "./visual-code-anatomy";

import { TeachingTrace } from "./teaching-trace";
import { firstSentence } from "@/lib/teaching-trace";
export function RowAccessClassroom({lang, theme}: {lang: Locale; theme:"light"|"dark"}) {
  const [mode,setMode] = useTopicSession<"copy"|"alias">("row-access:mode","copy");
  const [name,setName] = useTopicSession("row-access:name","Sara");
  const [edited,setEdited] = useTopicSession("row-access:edited",false);
  const [saved,setSaved] = useTopicSession("row-access:saved",false);
  const [group,setGroup] = useTopicSession("row-access:group","access");
  const en = lang === "en", state = rowAccessState(mode,name,edited,saved);
  const traceDoc=rowAccessReference(mode,name,mode==="copy");
  const traceSteps=traceDoc.groups.map((g,i)=>{const snapshot=rowAccessState(mode,name,i>=2,i>=3);return {id:g.id,title:localizedText(g.title, lang),sentence:i===2 ? (en ? `Changing the name to ${name} updates ${mode==="copy"?"the separate copy while the original stays Ahmed":"the original row because the symbol accesses that row"}.` : `تغيير الاسم إلى ${name} يحدّث ${mode==="copy"?"النسخة المستقلة بينما يبقى الأصل Ahmed":"الصف الأصلي لأن الرمز يصل إليه مباشرة"}.`) : i===3 ? (en ? `MODIFY saves ${name} into the original row because changes to a copy need an explicit write back.` : `تحفظ MODIFY الاسم ${name} في الصف الأصلي لأن تعديل النسخة يحتاج إلى حفظ صريح.`) : firstSentence(localizedText(g.explanation, lang)),line:g.range.startLine,endLine:g.range.endLine,state:{lt_employees:[snapshot.row],...(i>0 ? snapshot.workArea ? {ls_employee:snapshot.workArea} : {"<employee>":"lt_employees[1]"} : {})}};});
  const traceIndex=Math.max(0,traceDoc.groups.findIndex(g=>g.id===group));
  function switchMode(next: "copy"|"alias") {setMode(next);setEdited(false);setSaved(false);setGroup("access");}
  function selectCode(next:string) {setGroup(next);if(next === "source" || next === "access") {setEdited(false);setSaved(false);}if(next === "edit") setEdited(true);if(next === "save") {setEdited(true);setSaved(true);}}
  return <section className="row-access-classroom" data-primary-diagram="row-access" aria-label={en ? "Copy a row or access the original" : "انسخ الصف أو صِل إلى الأصل"}>
    <div className="comparison-selector" role="group" aria-label={en ? "Row access approach" : "أسلوب الوصول إلى الصف"}>{(["copy","alias"] as const).map(m => <button key={m} aria-pressed={mode === m} onClick={() => switchMode(m)}><strong>{m === "copy" ? en ? "Work Area" : "منطقة العمل" : en ? "Field Symbol" : "رمز الحقل"}</strong><span>{m === "copy" ? "LOOP AT … INTO" : "LOOP AT … ASSIGNING"}</span></button>)}</div>
    <TeachingTrace steps={traceSteps} index={traceIndex} onChoose={index=>selectCode(traceDoc.groups[index].id)} lang={lang} source={traceDoc.source} reference>
    <div className={`row-relationship ${mode === "alias" ? "alias" : "copy"}`}>
      <div className={`row-source ${edited && (mode === "alias" || saved) ? "changed" : ""}`}><button className="memory-label" onClick={() => setGroup("source")}>{en ? "Original saved row" : "الصف الأصلي المحفوظ"}</button><EmployeeTable rows={[state.row]} indexed lang={lang}/></div>
      <div className="reference-arrow"><span>{mode === "copy" ? en ? "COPY" : "نسخ" : en ? "ACCESSES SAME ROW" : "يصل إلى الصف نفسه"}</span><svg viewBox="0 0 160 42" aria-hidden="true"><path d={mode === "copy" ? "M5 21H145M130 8L145 21L130 34" : "M155 21H15M30 8L15 21L30 34"}/></svg></div>
      <div className={`row-target ${edited ? "changed" : ""}`}><button className="memory-label" onClick={() => setGroup("access")}><bdi dir="ltr">{mode === "copy" ? "ls_employee" : "<employee>"}</bdi></button>{state.workArea ? <EmployeeTable rows={[state.workArea]} lang={lang}/> : <div className="alias-handle"><code dir="ltr">&lt;employee&gt;</code><p>{en ? "An assigned access path, not another employee copy." : "مسار وصول مرتبط، وليس نسخة موظف أخرى."}</p></div>}</div>
    </div>
    </TeachingTrace>
    <div className="visual-stage-toolbar"><label>{en ? "Replacement name (non-key field)" : "الاسم البديل (حقل غير داخل في المفتاح)"}<input value={name} maxLength={30} onChange={e => {setName(e.target.value);setEdited(false);setSaved(false);}} dir="auto"/></label><button className="primary" disabled={!name.trim()} onClick={() => {setEdited(true);setGroup("edit");}}>{en ? "Change the name" : "غيّر الاسم"}</button>{mode === "copy" && <button className="secondary" disabled={!edited || saved} onClick={() => {setSaved(true);setGroup("save");}}>{en ? "Save copy with MODIFY" : "احفظ النسخة باستخدام MODIFY"}</button>}</div>
    <p role="status" className="visual-outcome">{!edited ? en ? "Change the name, then compare where the value changes." : "غيّر الاسم ثم قارن الموضع الذي تتغير فيه القيمة." : mode === "alias" ? en ? `The original row is now ${name}. The symbol accesses that same row directly.` : `أصبح اسم الصف الأصلي ${name}. يصل الرمز إلى ذلك الصف نفسه مباشرة.` : saved ? en ? "MODIFY explicitly saved the changed copy into row 1." : "حفظت MODIFY النسخة المعدلة صراحة في الصف الأول." : en ? `The copy is ${name}; the original remains Ahmed. INTO does not write changes back automatically.` : `اسم النسخة ${name}؛ ويظل الأصل Ahmed. لا تعيد INTO كتابة التغييرات تلقائياً.`}</p>
    <p className="visual-boundary">{en ? "Controlled teaching comparison with valid SAP reference syntax. LOOP ASSIGNING is not executed by the current browser interpreter; the existing executable lab below uses direct ASSIGN to a work area. This comparison edits only a non-key name; sorted/hashed primary keys must not be modified through a row symbol." : "مقارنة تعليمية مضبوطة بصياغة SAP مرجعية صحيحة. لا ينفّذ مفسر المتصفح الحالي LOOP ASSIGNING؛ ويستخدم المختبر التنفيذي الموجود أدناه ASSIGN مباشرة إلى منطقة عمل. تعدّل المقارنة اسماً غير داخل في المفتاح فقط؛ ولا يجوز تعديل المفاتيح الأساسية في SORTED أو HASHED عبر رمز الصف."}</p>
    <div className="connected-reference-anatomy"><h2>{en ? "See both approaches in code" : "شاهد الأسلوبين في الأكواد"}</h2><VisualCodeAnatomy key={`${mode}-${saved}`} doc={rowAccessReference(mode,name,saved)} lang={lang} theme={theme} selectedGroup={group} onGroupSelect={selectCode} onMatched={() => {}}/></div>
  </section>;
}
