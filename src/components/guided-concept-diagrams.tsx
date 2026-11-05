"use client";
import type { Locale } from "@/lib/engine";
import { useTopicSession } from "@/lib/use-topic-session";
import { EducationalFlowchart } from "./educational-flowchart";

export function ObjectStorageDiagram({lang,onSourceGroup}: {lang: Locale;onSourceGroup?:(id:string)=>void}) {
  const [storage, setStorage] = useTopicSession("oop:storage-comparison", "instance");
  const [count, setCount] = useTopicSession("oop:storage-increments", 0);
  const en = lang === "en", shared = storage === "static";
  return <section className="control-flow-explorer" aria-label={en ? "Instance and static storage" : "تخزين النسخة والتخزين الساكن"}>
    <h2>{en ? "Who owns the value?" : "من يملك القيمة؟"}</h2>
    <EducationalFlowchart lang={lang} label={en ? "One class blueprint creates two independent objects." : "ينشئ مخطط صنف واحد كائنين مستقلين."} nodes={[{id:"class",label:"lcl_counter",x:300,y:30},{id:"first",label:"lo_first",x:130,y:120},{id:"second",label:"lo_second",x:470,y:120}]} edges={[{from:"class",to:"first",label:en ? "NEW" : "NEW"},{from:"class",to:"second",label:"NEW"}]} onSelect={onSourceGroup ? id=>onSourceGroup(id === "class" ? "counter-interface" : "counter-instances") : undefined}/>
    <p>{en ? "Conceptual comparison, not SAP execution. Each view starts at zero; increment through object A and inspect who observes the change." : "مقارنة مفاهيمية وليست تنفيذاً في SAP. يبدأ كل عرض بصفر؛ زِد القيمة عبر الكائن A وافحص من يلاحظ التغيير."}</p>
    <div className="explore-actions" role="group" aria-label={en ? "Attribute storage" : "تخزين السمة"}>{["instance", "static"].map(mode => <button className="secondary" key={mode} aria-pressed={storage === mode} onClick={() => {setStorage(mode); setCount(0);onSourceGroup?.("counter-private");}}>{mode === "instance" ? "DATA" : "CLASS-DATA"}</button>)}</div>
    <pre dir="ltr">{shared ? "CLASS-DATA mv_value TYPE i VALUE 0." : "DATA mv_value TYPE i VALUE 0."}</pre>
    <p className="muted">{en ? "Declaration fragment inside a class. Public/private access is independent of this storage choice." : "جزء تعريف داخل صنف. صلاحيات الوصول العامة أو الخاصة مستقلة عن اختيار التخزين هذا."}</p>
    <button className="secondary" onClick={() => {setCount(n => n + 1);onSourceGroup?.("counter-implementation");}}>{en ? "Increment through object A" : "زِد القيمة عبر الكائن A"}</button>
    <div className="object-storage-diagram" role="status">
      {shared && <div className="flow-node active" data-testid="shared-storage"><strong>{en ? "One class value" : "قيمة واحدة للصنف"}</strong><p dir="ltr">mv_value = {count}</p></div>}
      <div className="flow-branches">{["A", "B"].map(object => <div className="flow-node" key={object}><strong>{en ? "Object" : "الكائن"} {object}</strong><p>{shared ? (en ? "↑ reads shared class value" : "↑ يقرأ قيمة الصنف المشتركة") : <bdi dir="ltr">mv_value = {object === "A" ? count : 0}</bdi>}</p></div>)}</div>
      <p>{shared ? (en ? `Both objects observe ${count} from the same class storage. There are no two independent copies of this attribute.` : `يلاحظ الكائنان ${count} من تخزين الصنف نفسه. لا توجد نسختان مستقلتان من هذه السمة.`) : (en ? `A owns ${count}; B still owns 0. Creating an object gives it separate instance storage.` : `يمتلك A القيمة ${count}، ويظل B يمتلك 0. يمنح إنشاء الكائن تخزيناً مستقلاً لسمات نسخته.`)}</p>
    </div>
  </section>;
}

export function ReportFlowDiagram({lang,onSourceGroup}: {lang: Locale;onSourceGroup?:(id:string)=>void}) {
  const [scenario, setScenario] = useTopicSession("reports:event-scenario", "valid");
  const en = lang === "en";
  const cases = [
    {id: "valid", label: en ? "Accepted input" : "إدخال مقبول"},
    {id: "invalid", label: en ? "Rejected zero input" : "رفض إدخال صفر"},
    {id: "termination", label: en ? "Uncaught runtime error" : "خطأ وقت تشغيل غير معالج"},
  ];
  const steps = ["PARAMETERS", "INITIALIZATION", "AT SELECTION-SCREEN", "START-OF-SELECTION", "END-OF-SELECTION"];
  const reached = scenario === "invalid" ? 3 : scenario === "termination" ? 4 : 5;
  return <section className="control-flow-explorer" aria-label={en ? "Report event paths" : "مسارات أحداث التقرير"}>
    <h2>{en ? "Follow the report events" : "تتبّع أحداث التقرير"}</h2>
    <p>{en ? "Simplified event model. This browser does not execute report events or a SAP selection screen. PARAMETERS declares input; it is shown for context, not as an event." : "نموذج أحداث مبسط. لا ينفّذ المتصفح أحداث التقارير أو شاشة اختيار SAP. تعرّف PARAMETERS الإدخال وتظهر للسياق، وليست حدثاً."}</p>
    <div className="explore-actions" role="group" aria-label={en ? "Report scenario" : "سيناريو التقرير"}>{cases.map(c => <button className="secondary" key={c.id} aria-pressed={scenario === c.id} onClick={() => {setScenario(c.id);onSourceGroup?.(c.id === "invalid" ? "report-validation" : "report-main");}}>{c.label}</button>)}</div>
    <EducationalFlowchart lang={lang} label={en ? "Valid input proceeds; rejected input returns for correction; an uncaught error aborts the normal path." : "يتابع الإدخال الصحيح؛ ويعود المرفوض للتصحيح؛ وينهي الخطأ غير المعالج المسار المعتاد."} active={scenario === "valid" ? "end" : "error"} activeEdges={scenario === "valid" ? ["start:test","test:main","main:end"] : scenario === "invalid" ? ["start:test","test:error","error:test"] : ["start:test","test:main","main:error"]} nodes={[{id:"start",label:"INITIALIZATION",x:210,y:30},{id:"test",label:en ? "Valid input?" : "إدخال صحيح؟",x:210,y:120,decision:true},{id:"main",label:"START-OF-SELECTION",x:210,y:220},{id:"end",label:"END-OF-SELECTION",x:210,y:320},{id:"error",label:scenario === "termination" ? (en ? "Runtime error" : "خطأ تشغيل") : (en ? "Correct input" : "صحح الإدخال"),x:480,y:220}]} edges={[{from:"start",to:"test"},{from:"test",to:"main",label:en ? "Valid" : "صحيح"},{from:"test",to:"error",label:en ? "Invalid" : "مرفوض"},...(scenario === "termination" ? [{from:"main",to:"error"}] : [{from:"main",to:"end"}]),...(scenario === "invalid" ? [{from:"error",to:"test",back:true,label:en ? "Retry" : "أعد المحاولة"}] : [])]} onSelect={onSourceGroup ? id=>onSourceGroup(id === "start" ? "report-default" : id === "test" || id === "error" ? "report-validation" : id === "main" ? "report-main" : "report-end") : undefined}/>
    <ol className="report-event-flow sr-only">{steps.map((step, i) => <li className={`flow-node ${i < reached ? "active" : ""}`} key={step}><code>{step}</code><span>{i >= reached ? (en ? "Not reached in this path" : "لم يُنفّذ في هذا المسار") : i === 0 ? (en ? "Input declaration" : "تعريف الإدخال") : (en ? "Reached" : "نُفّذ")}</span></li>)}</ol>
    <p role="status">{scenario === "valid" ? (en ? "Accepted input reaches the main report and its normal ending in this example." : "يصل الإدخال المقبول إلى التقرير الرئيسي ونهايته المعتادة في هذا المثال.") : scenario === "invalid" ? (en ? "The validation error returns to input correction. Neither main output nor END-OF-SELECTION runs on this rejected submission." : "يعيد خطأ التحقق المستخدم لتصحيح الإدخال. لا تُنفّذ المخرجات الرئيسية ولا END-OF-SELECTION لهذا الإرسال المرفوض.") : (en ? "An uncaught runtime error aborts this path before the normal ending. END-OF-SELECTION is not a universal cleanup guarantee. Other control statements have different rules: STOP can trigger END-OF-SELECTION, so do not generalize this error path to every early exit." : "ينهي خطأ وقت تشغيل غير معالج هذا المسار قبل النهاية المعتادة. ليست END-OF-SELECTION ضمان تنظيف عاماً. ولتعليمات التحكم الأخرى قواعد مختلفة؛ فقد تُطلق STOP حدث END-OF-SELECTION، فلا تعمم مسار الخطأ هذا على كل خروج مبكر.")}</p>
  </section>;
}
