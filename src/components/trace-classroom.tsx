"use client";
import { useMemo } from "react";
import { executionSteps } from "@/lib/teaching-trace";
import { TeachingTrace } from "./teaching-trace";
import { simulate, type Locale } from "@/lib/engine";
import type { CodeAnatomy } from "@/lib/code-anatomy";
import { groupAtLine } from "@/lib/code-anatomy";
import { useTopicSession } from "@/lib/use-topic-session";
import { EducationalFlowchart, type FlowNode, type FlowEdge } from "./educational-flowchart";

export type ClassroomSelection = {group?: string; event?: number; artifact?: string};
export function TraceClassroom({id, doc, lang, selection, onSelect, flow}: {id: string; doc: CodeAnatomy; lang: Locale; selection: ClassroomSelection; onSelect: (s: ClassroomSelection) => void; flow: boolean}) {
  const events = useMemo(() => simulate(doc.source), [doc.source]);
  const preferredOperation: Record<string,string>={"data-read-table":"read","data-table-expressions":"try","database-abap-sql":"sql","database-select":"sql","database-where":"sql","database-joins":"sql","database-aggregates":"sql","database-sql-mutations":"sql","oop-classes-objects":"call","oop-objects":"assign","oop-attributes":"assign","oop-instance-methods":"call","oop-constructors":"call","oop-inheritance":"call","oop-interfaces":"call","oop-exceptions":"raise","data-table-performance":"read","data-employee-manager":"modify","data-table-mutations":"insert","data-sorting-filtering":"sort",conditions:"condition",do:"loop",while:"loop","loop-at":"loop","loop-control":"control",employees:"condition","data-keys":"condition","data-table-model":"append",tables:"append"};
  const preferred = events.find(e=>e.filter)?.id ?? events.find(e => preferredOperation[id] ? e.operation === preferredOperation[id] : ["assign", "append", "condition", "read", "sort"].includes(e.operation))?.id ?? 0;
  const [step, setStep] = useTopicSession(`${id}:classroom-step`, preferred);
  const desired = selection.event ?? (selection.group ? events.find(e => groupAtLine(doc, e.range.startLine)?.id === selection.group)?.id : undefined);
  const index = Math.min(desired ?? step, events.length - 1), current = events[index];
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
  const filtered = events.some(e=>e.filter);
  if (filtered) {
    const predicate = events.find(e=>e.filter)?.statement.match(/WHERE\s+(.+?)\./i)?.[1] || "Row matches";
    nodes.find(n=>n.id === "test")!.label = "Next stored row?";
    nodes.find(n=>n.id === "body")!.y = 420;
    nodes.find(n=>n.id === "advance")!.y = 540;
    nodes.splice(2,0,{id:"select",label:"WHERE "+predicate+"?",x:290,y:270,decision:true});
  }
  const edges: FlowEdge[] = kind === "decision" ? [
    {from:"start",to:"test"},{from:"test",to:"yes",label:en ? "TRUE" : "صحيح"},{from:"test",to:"no",label:en ? "FALSE" : "خطأ"},{from:"yes",to:"end"},{from:"no",to:"end"},
  ] : [{from:"start",to:"test"},{from:"test",to:"body",label:en ? "TRUE" : "صحيح"},{from:"test",to:"end",label:en ? "FALSE" : "خطأ"},{from:"body",to:"advance"},{from:"advance",to:"test",back:true,label:en ? "Repeat" : "تكرار"},...(id === "loop-control" ? [{from:"body",to:"end",label:"EXIT"}] : [])];
  let active = ["define","declare"].includes(current.operation) ? "start" : kind === "decision" ? current.operation === "condition" ? "test" : current.operation === "write" ? groupAtLine(doc,current.range.startLine)?.id === "false" ? "no" : "yes" : "end" : current.operation === "condition" ? "body" : current.operation === "loop" ? current.condition?.result === false ? "end" : "test" : current.operation === "control" ? current.explanation.key === "exit" ? "end" : "advance" : current.operation === "end" ? "advance" : "body";
  let activeEdges=kind === "decision" ? active === "test" ? ["start:test",current.condition?.result ? "test:yes" : "test:no"] : active === "yes" || active === "no" ? [`test:${active}`] : [] : active === "test" ? ["start:test","test:body"] : active === "end" ? [current.operation === "control" ? "body:end" : "test:end"] : active === "advance" ? ["body:advance","advance:test"] : active === "body" ? ["test:body"] : [];
  if (filtered) {
    edges.splice(0,edges.length,{from:"start",to:"test"},{from:"test",to:"select",label:"Yes"},{from:"test",to:"end",label:"No"},{from:"select",to:"body",label:"TRUE"},{from:"select",to:"advance",label:"FALSE",back:true},{from:"body",to:"advance"},{from:"advance",to:"test",back:true,label:"Repeat"});
    if(current.filter) active="select";
    else if(current.operation === "loop" && current.condition?.result) active="body";
    else if(current.operation === "end" && !current.loop || current.operation === "write" && !current.loop) active="end";
    activeEdges=active === "select" ? ["test:select"] : active === "body" ? ["select:body"] : active === "advance" ? ["body:advance"] : active === "end" ? ["test:end"] : active === "test" ? ["start:test","advance:test"] : [];
  }
  return <section className="trace-classroom" aria-label={en ? "See the program change" : "شاهد تغيّر البرنامج"} data-primary-diagram="trace">
    <TeachingTrace steps={executionSteps(events,lang)} index={index} onChoose={choose} lang={lang} source={doc.source} beforeState={notExecuted ? current.memory : undefined} onPick={pick} notice={notExecuted ? <p className="trace-skipped-notice">{en ? "This source group was skipped in this run; the snapshots still show the selected executed instruction." : "تُجاوزت مجموعة الأكواد هذه في هذا التشغيل؛ وتعرض القيم التعليمة المنفّذة المحددة."}</p> : undefined}>
    {flow && <EducationalFlowchart nodes={nodes} edges={edges} active={notExecuted ? undefined : active} activeEdges={notExecuted ? [] : activeEdges} lang={lang} label={en ? "Follow the arrows; select a node to inspect its real trace event." : "اتبع الأسهم؛ اختر عقدة لفحص حدثها في التتبع الفعلي."} onSelect={node => {const next = events.find(e => node === "body" && filtered ? e.loop?.row !== undefined && ["write","assign"].includes(e.operation) : node === "select" ? !!e.filter : node === "start" ? e.operation === "declare" : node === "test" ? e.operation === "condition" || e.operation === "loop" : node === "end" ? e.condition?.result === false && e.operation === "loop" || e.operation === "control" && e.explanation.key === "exit" : node === "advance" ? e.operation === "end" || e.operation === "control" && e.explanation.key === "continue" : node === "yes" || node === "no" ? e.operation === "write" && (groupAtLine(doc,e.range.startLine)?.id === "false") === (node === "no") : e.operation === "assign"); if(next) choose(next.id);else if(kind === "decision" && (node === "yes" || node === "no")) onSelect({group:node === "no" ? "false" : "true"});}}/>}
    </TeachingTrace>
  </section>;
}
