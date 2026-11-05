"use client";
import { useMemo } from "react";
import { simulate, type Locale, type MemoryValue, type ExecutionEvent } from "@/lib/engine";
import type { CodeAnatomy } from "@/lib/code-anatomy";
import { groupAtLine } from "@/lib/code-anatomy";
import { useTopicSession } from "@/lib/use-topic-session";
import { EducationalFlowchart, type FlowNode, type FlowEdge } from "./educational-flowchart";

export type ClassroomSelection = {group?: string; event?: number; artifact?: string};
function MemoryPicture({memory, event, lang, onPick}: {memory: Record<string, MemoryValue>; event?: ExecutionEvent; lang: Locale; onPick: (name: string) => void}) {
  const entries = Object.entries(memory).filter(([name]) => !name.startsWith("sy-"));
  return <div className="memory-picture">{entries.length ? entries.map(([name, value]) => <div key={name} className={`memory-object ${event?.changed.some(ch => ch === name || ch.startsWith(name + "-")) ? "changed" : ""}`}>
    <button className="memory-label" onClick={() => onPick(name)}><bdi dir="ltr">{name}</bdi></button>
    {Array.isArray(value) ? <div className="picture-table" dir="ltr"><table><caption>{lang === "en" ? `${value.length} saved rows` : `${value.length} صفوف محفوظة`}</caption><tbody>{value.slice(0, 6).map((row, i) => <tr key={i} className={event?.tableSelection?.name === name && event.tableSelection.index === i ? "selected-row" : ""}><th scope="row">{i+1}</th>{(typeof row === "object" ? Object.values(row) : [row]).map((v, k) => <td key={k}>{String(v)}</td>)}</tr>)}</tbody></table>{!value.length && <span>∅</span>}{value.length > 6 && <p>{lang === "en" ? "First six rows shown" : "تظهر الصفوف الستة الأولى"}</p>}</div>
      : typeof value === "object" ? <dl className="record-fields" dir="ltr">{Object.entries(value).map(([key, v]) => <div key={key}><dt>{key}</dt><dd>{v === "" ? '""' : v}</dd></div>)}</dl> : <strong className="scalar-value" dir="ltr">{value === "" ? '""' : String(value)}</strong>}
  </div>) : <div className="memory-empty">{lang === "en" ? "No data objects yet" : "لا توجد كائنات بيانات بعد"}</div>}</div>;
}

export function TraceClassroom({id, doc, lang, selection, onSelect, flow}: {id: string; doc: CodeAnatomy; lang: Locale; selection: ClassroomSelection; onSelect: (s: ClassroomSelection) => void; flow: boolean}) {
  const events = useMemo(() => simulate(doc.source), [doc.source]);
  const preferredOperation: Record<string,string>={"data-read-table":"read","data-table-mutations":"insert","data-sorting-filtering":"sort",conditions:"condition",do:"loop",while:"loop","loop-at":"loop","loop-control":"control",employees:"condition","data-keys":"condition","data-table-model":"append",tables:"append"};
  const preferred = events.find(e => preferredOperation[id] ? e.operation === preferredOperation[id] : ["assign", "append", "condition", "read", "sort"].includes(e.operation))?.id || 0;
  const [step, setStep] = useTopicSession(`${id}:classroom-step`, preferred);
  const desired = selection.event ?? (selection.group ? events.find(e => groupAtLine(doc, e.range.startLine)?.id === selection.group)?.id : undefined);
  const index = Math.min(desired ?? step, events.length - 1), current = events[index], previous = events[index-1];
  const selectedGroup=doc.groups.find(g=>g.id === selection.group);
  const notExecuted=!!selectedGroup && selection.event === undefined && !events.some(e=>groupAtLine(doc,e.range.startLine)?.id === selectedGroup.id);
  const en = lang === "en";
  function choose(next: number) {
    const bounded = Math.max(0, Math.min(events.length-1, next)); setStep(bounded);
    onSelect({event: bounded, group: groupAtLine(doc, events[bounded].range.startLine)?.id});
  }
  function pick(name: string) {
    const next = events.find(e => e.changed.some(c => c === name || c.startsWith(name+"-")));
    if (next) choose(next.id);
  }
  const kind = id === "conditions" ? "decision" : "loop";
  const nodes: FlowNode[] = kind === "decision" ? [
    {id: "start", label: en ? "Start" : "البداية", x:300,y:30},
    {id: "test", label: "IF / ELSEIF",x:300,y:115,decision:true},
    {id: "yes",label:en ? "Matching branch" : "الفرع المطابق",x:120,y:220},
    {id: "no",label:en ? "ELSE" : "ELSE",x:480,y:220},
    {id: "end",label:"ENDIF",x:300,y:310},
  ] : [
    {id:"start",label:en ? "Start loop" : "بدء الحلقة",x:290,y:30},
    {id:"test",label:id === "while" ? "WHILE ?" : id === "loop-at" ? (en ? "Next row?" : "صف تالٍ؟") : (en ? "Another pass?" : "دورة أخرى؟"),x:290,y:115,decision:true},
    {id:"body",label:en ? "Run body" : "تنفيذ التعليمات",x:290,y:205},
    {id:"advance",label:id === "loop-control" ? "CONTINUE" : en ? "Next pass" : "الدورة التالية",x:290,y:290},
    {id:"end",label:id === "loop-control" ? "EXIT" : en ? "After loop" : "بعد الحلقة",x:490,y:115},
  ];
  const edges: FlowEdge[] = kind === "decision" ? [
    {from:"start",to:"test"},{from:"test",to:"yes",label:en ? "TRUE" : "صحيح"},{from:"test",to:"no",label:en ? "FALSE" : "خطأ"},{from:"yes",to:"end"},{from:"no",to:"end"},
  ] : [{from:"start",to:"test"},{from:"test",to:"body",label:en ? "TRUE" : "صحيح"},{from:"test",to:"end",label:en ? "FALSE" : "خطأ"},{from:"body",to:"advance"},{from:"advance",to:"test",back:true,label:en ? "Repeat" : "تكرار"},...(id === "loop-control" ? [{from:"body",to:"end",label:"EXIT"}] : [])];
  const active = ["define","declare"].includes(current.operation) ? "start" : kind === "decision" ? current.operation === "condition" ? "test" : current.operation === "write" ? groupAtLine(doc,current.range.startLine)?.id === "false" ? "no" : "yes" : "end" : current.operation === "condition" ? "body" : current.operation === "loop" ? current.condition?.result === false ? "end" : "test" : current.operation === "control" ? current.explanation.key === "exit" ? "end" : "advance" : current.operation === "end" ? "advance" : "body";
  const activeEdges=kind === "decision" ? active === "test" ? ["start:test",current.condition?.result ? "test:yes" : "test:no"] : active === "yes" || active === "no" ? [`test:${active}`] : [] : active === "test" ? ["start:test","test:body"] : active === "end" ? [current.operation === "control" ? "body:end" : "test:end"] : active === "advance" ? ["body:advance","advance:test"] : active === "body" ? ["test:body"] : [];
  return <section className="trace-classroom" aria-label={en ? "See the program change" : "شاهد تغيّر البرنامج"} data-primary-diagram="trace">
    <div className="visual-stage-toolbar"><span className="visual-kicker">{en ? "LIVE TEACHING TRACE" : "تتبع تعليمي فعلي"}</span><div className="explore-actions"><button className="secondary" onClick={() => choose(index-1)} disabled={index === 0}>{en ? "Previous change" : "التغيير السابق"}</button><output dir="ltr">{index+1} / {events.length}</output><button className="primary" onClick={() => choose(index+1)} disabled={index === events.length-1}>{en ? "Next change" : "التغيير التالي"}</button><button className="text-button" onClick={() => choose(0)}>{en ? "Restart" : "البداية"}</button></div></div>
    {flow && <EducationalFlowchart nodes={nodes} edges={edges} active={notExecuted ? undefined : active} activeEdges={notExecuted ? [] : activeEdges} lang={lang} label={en ? "Follow the arrows; select a node to inspect its real trace event." : "اتبع الأسهم؛ اختر عقدة لفحص حدثها في التتبع الفعلي."} onSelect={node => {const next = events.find(e => node === "start" ? e.operation === "declare" : node === "test" ? e.operation === "condition" || e.operation === "loop" : node === "end" ? e.condition?.result === false && e.operation === "loop" || e.operation === "control" && e.explanation.key === "exit" : node === "advance" ? e.operation === "end" || e.operation === "control" && e.explanation.key === "continue" : node === "yes" || node === "no" ? e.operation === "write" && (groupAtLine(doc,e.range.startLine)?.id === "false") === (node === "no") : e.operation === "assign"); if(next) choose(next.id);else if(kind === "decision" && (node === "yes" || node === "no")) onSelect({group:node === "no" ? "false" : "true"});}}/>}
    <div className="state-comparison"><section><h3>{en ? "Before" : "قبل"}</h3><MemoryPicture memory={notExecuted ? current.memory : previous?.memory || {}} lang={lang} onPick={pick}/></section><span className="state-arrow" aria-hidden="true">→</span><section><h3>{en ? "After this instruction" : "بعد هذه التعليمة"}</h3><MemoryPicture memory={current.memory} event={notExecuted ? undefined : current} lang={lang} onPick={pick}/></section></div>
    <div className="visual-code-connection" role="status"><code dir="ltr">{notExecuted ? doc.source.slice(selectedGroup!.range.start,selectedGroup!.range.end) : current.statement}</code><p>{notExecuted ? en ? "This selected group has no executed step in this trace (a skipped branch or non-executed source). It does not change memory. Use the step controls to follow actual execution." : "لا توجد خطوة منفذة لهذه المجموعة في التتبع (فرع متجاوز أو نص غير تنفيذي). لا تغيّر الذاكرة. استخدم أزرار الخطوات لمتابعة التنفيذ الفعلي." : current.condition ? <bdi dir="ltr">{current.condition.expression} → {String(current.condition.result)}</bdi> : en ? "Highlighted storage shows what this instruction changed. Select a memory label to find its code." : "يوضح التخزين المميز ما غيّرته التعليمة. اختر اسم كائن الذاكرة للوصول إلى أكواده."}</p>{!!current.output.length && <div className="classroom-output"><strong>{en ? "Output" : "المخرجات"}</strong><pre dir="ltr">{current.output.join("\n")}</pre></div>}</div>
  </section>;
}
