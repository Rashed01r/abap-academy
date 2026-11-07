"use client";
import { useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import type { Locale } from "@/lib/engine";
import { changedNames, displayValue, sameValue, type TeachingStep, type TraceState } from "@/lib/teaching-trace";
import { useTopicSession } from "@/lib/use-topic-session";
import { TechnicalText } from "./technical-text";

export function TraceControls({index,total,lang,playing,onChoose,onPlay}: {
  index:number;total:number;lang:Locale;playing:boolean;onChoose:(index:number)=>void;onPlay:()=>void;
}) {
  const en=lang === "en";
  return <div className="trace-controls">
    <span className="trace-label">{en ? "LIVE TEACHING TRACE" : "تتبّع تعليمي فعلي"}</span>
    <div className="trace-buttons" role="group" aria-label={en ? "Trace controls" : "أزرار التتبّع"}>
      <button type="button" className="secondary" aria-label={en ? "Previous" : "السابق"} disabled={index<=0} onClick={()=>onChoose(index-1)}><ChevronLeft size={14}/><span>{en ? "Previous" : "السابق"}</span></button>
      <output dir="ltr" aria-label={en ? "Current step" : "الخطوة الحالية"}>{index+1} / {total}</output>
      <button type="button" className="primary trace-next" aria-label={en ? "Next" : "التالي"} disabled={index>=total-1} onClick={()=>onChoose(index+1)}><span>{en ? "Next" : "التالي"}</span><ChevronRight size={14}/></button>
      <button type="button" className="secondary" aria-label={playing ? en ? "Pause" : "إيقاف مؤقت" : en ? "Play" : "تشغيل"} disabled={total<2 || index>=total-1 && !playing} aria-pressed={playing} onClick={onPlay}>{playing ? <Pause size={14}/> : <Play size={14}/>}<span>{playing ? en ? "Pause" : "إيقاف مؤقت" : en ? "Play" : "تشغيل"}</span></button>
      <button type="button" className="secondary" aria-label={en ? "Restart" : "البداية"} onClick={()=>onChoose(0)}><RotateCcw size={14}/><span>{en ? "Restart" : "البداية"}</span></button>
      {total>15 && <button type="button" className="secondary" aria-label={en ? "Skip to end" : "انتقل إلى النهاية"} disabled={index>=total-1} onClick={()=>onChoose(total-1)}><SkipForward size={14}/><span>{en ? "Skip to end" : "إلى النهاية"}</span></button>}
    </div>
  </div>;
}

export function StepCaption({step,index,total,lang}: {step:TeachingStep;index:number;total:number;lang:Locale}) {
  return <div className="step-caption" aria-live="polite" aria-atomic="true" data-caption-source={step.captionSource || "generated"}>
    <span className="pill">{lang === "en" ? `Step ${index+1} of ${total}` : `الخطوة ${index+1} من ${total}`}</span>
    <h3><TechnicalText>{step.title}</TechnicalText></h3><p><TechnicalText>{step.sentence}</TechnicalText></p>
  </div>;
}

export function CodeView({source,line,endLine=line,executed=[],lang,reference=false}: {
  source:string;line?:number;endLine?:number;executed?:number[];lang:Locale;reference?:boolean;
}) {
  const lines=source.split("\n"), start=Math.max(0,(line || 1)-4), end=Math.min(lines.length,Math.max((endLine || line || 1)+3,start+7));
  return <figure className="trace-code" aria-label={lang === "en" ? "Code for this step" : "أكواد هذه الخطوة"}>
    <figcaption>{reference ? lang === "en" ? "Reference code" : "أكواد مرجعية" : lang === "en" ? "Current instruction" : "التعليمة الحالية"}</figcaption>
    <div dir="ltr" className="trace-code-lines">
      {start>0 && <div className="trace-code-gap">…</div>}
      {lines.slice(start,end).map((text,i)=>{const n=start+i+1, active=line!==undefined && n>=line && n<=(endLine || line);return <div key={n} className={`trace-code-line ${active ? "current" : executed.includes(n) ? "executed" : ""}`} data-line={n} aria-current={active ? "step" : undefined}><span className="trace-line-number" aria-hidden="true">{n}</span><code>{text || " "}</code></div>;})}
      {end<lines.length && <div className="trace-code-gap">…</div>}
    </div>
  </figure>;
}

function StateValue({name,value,previous,changed,lang,onPick}: {name:string;value:unknown;previous:unknown;changed:boolean;lang:Locale;onPick?:(name:string)=>void}) {
  const object=value !== null && typeof value === "object", array=Array.isArray(value);
  if(object && !array) return <div className="trace-state-group"><span className="trace-state-name" dir="ltr">{name}</span><StateChips state={value as TraceState} before={(previous && typeof previous === "object" ? previous : {}) as TraceState} lang={lang} onPick={onPick ? ()=>onPick(name) : undefined}/></div>;
  if(array) {
    const old=Array.isArray(previous) ? previous : [];
    const changedRows=value.map((row,i)=>!sameValue(row,old[i]) ? i : -1).filter(i=>i>=0);
    const visible=[...new Set([...changedRows,...value.map((_,i)=>i)])].slice(0,6).sort((a,b)=>a-b);
    const columns=[...new Set(value.flatMap(row=>row && typeof row === "object" ? Object.keys(row) : ["value"]))];
    return <div className={`trace-state-table ${changed ? "changed" : ""}`}><span className="trace-state-name" dir="ltr">{name}</span><p>{lang === "en" ? `${value.length} rows` : `${value.length} صفوف`}</p>{value.length>0 && <table dir="ltr"><thead><tr><th>#</th>{columns.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{visible.map(i=><tr key={i}><th scope="row">{i+1}</th>{columns.map(c=>{const row=value[i], cell=row && typeof row === "object" ? (row as TraceState)[c] : row, prev=old[i] && typeof old[i] === "object" ? (old[i] as TraceState)[c] : old[i];return <td key={c} className={!sameValue(cell,prev) ? "trace-cell-changed" : ""}>{displayValue(cell)}</td>;})}</tr>)}</tbody></table>}{value.length>visible.length && <p>{lang === "en" ? `${visible.length} rows shown, prioritizing changes` : `تظهر ${visible.length} صفوف مع تقديم الصفوف المتغيرة`}</p>}</div>;
  }
  const content=<><span className="trace-state-name" dir="ltr">{name}</span><strong dir="auto">{displayValue(value)}</strong></>;
  return onPick ? <button className={`trace-state-chip ${changed ? "changed" : ""}`} onClick={()=>onPick(name)}>{content}</button> : <div className={`trace-state-chip ${changed ? "changed" : ""}`}>{content}</div>;
}

export function StateChips({state={},before={},lang,onPick}: {state?:TraceState;before?:TraceState;lang:Locale;onPick?:(name:string)=>void}) {
  const names=Object.keys(state), changed=changedNames(before,state);
  return <div className="trace-state-chips">{names.length ? names.map(name=><StateValue key={name} name={name} value={state[name]} previous={before[name]} changed={changed.includes(name)} lang={lang} onPick={onPick}/>) : <p className="trace-empty">{lang === "en" ? "No values stored yet." : "لم تُحفظ قيم بعد."}</p>}{changed.filter(n=>!(n in state)).map(name=><div className="trace-state-chip changed" key={name}><span className="trace-state-name" dir="ltr">{name}</span><span>{lang === "en" ? "Removed" : "حُذفت"}</span></div>)}</div>;
}

export function TeachingTrace({steps,index,onChoose,lang,source,children,reference=false,beforeState,onPick,notice}: {
  steps:TeachingStep[];index:number;onChoose:(index:number)=>void;lang:Locale;source?:string;children?:ReactNode;reference?:boolean;beforeState?:TraceState;onPick?:(name:string)=>void;notice?:ReactNode;
}) {
  const [playing,setPlaying]=useState(false), root=useRef<HTMLElement>(null);
  const bounded=Math.max(0,Math.min(index,steps.length-1)), step=steps[bounded];
  const chooseRef=useRef(onChoose),indexRef=useRef(bounded);
  useEffect(()=>{chooseRef.current=onChoose;indexRef.current=bounded;});
  useEffect(()=>{
    if(!playing)return;
    const timer=window.setInterval(()=>{
      if(indexRef.current>=steps.length-1){setPlaying(false);return;}
      chooseRef.current(indexRef.current+1);
      if(indexRef.current+1>=steps.length-1)setPlaying(false);
    },1400);
    return()=>window.clearInterval(timer);
  },[playing,steps.length]);
  // Explicit playback is step selection, never an animated transition; also stop when hidden.
  useEffect(()=>{const stop=()=>{if(document.hidden)setPlaying(false);};document.addEventListener("visibilitychange",stop);return()=>document.removeEventListener("visibilitychange",stop);},[]);
  function choose(next:number){setPlaying(false);onChoose(Math.max(0,Math.min(steps.length-1,next)));}
  function keyboard(e:KeyboardEvent<HTMLElement>){
    if(e.altKey || e.ctrlKey || e.metaKey || (e.target as HTMLElement).closest("input,select,textarea,[contenteditable=true],[role=textbox]"))return;
    if(e.key === " " && (e.target as HTMLElement).closest("button,[role=button]"))return;
    if(e.key === "ArrowLeft" || e.key === "ArrowRight") {e.preventDefault();e.stopPropagation();choose(bounded+(e.key === (lang === "ar" ? "ArrowLeft" : "ArrowRight") ? 1 : -1));}
    if(e.key === " "){e.preventDefault();e.stopPropagation();if(bounded<steps.length-1 || playing)setPlaying(p=>!p);}
  }
  if(!step)return null;
  const before=beforeState || steps[bounded-1]?.state || {}, after=step.state;
  const code=step.code || source;
  const executed=steps.slice(0,bounded).flatMap(s=>s.line ? Array.from({length:(s.endLine || s.line)-s.line+1},(_,i)=>s.line!+i) : []);
  return <section className="teaching-trace" ref={root} tabIndex={0} onKeyDown={keyboard} dir={lang === "ar" ? "rtl" : "ltr"} aria-label={lang === "en" ? "Live teaching trace" : "التتبّع التعليمي"} aria-keyshortcuts="ArrowLeft ArrowRight Space" data-trace-step={bounded} data-trace-total={steps.length}>
    <TraceControls index={bounded} total={steps.length} lang={lang} playing={playing} onChoose={choose} onPlay={()=>setPlaying(p=>!p)}/>
    <StepCaption step={step} index={bounded} total={steps.length} lang={lang}/>
    {notice}
    <div className={`trace-scene ${children ? "has-diagram" : ""}`}>
      {children && <div className="trace-diagram">{children}</div>}
      <div className="trace-evidence">
        {code && <CodeView source={code} line={step.line} endLine={step.endLine} executed={executed} lang={lang} reference={reference}/>}
        {after && <div className="trace-comparison"><section><h4>{lang === "en" ? "Before this step" : "قبل هذه الخطوة"}</h4><StateChips state={before} before={before} lang={lang} onPick={onPick}/></section><span className="trace-state-arrow" aria-hidden="true">{lang === "ar" ? "←" : "→"}</span><section><h4>{lang === "en" ? "After this step" : "بعد هذه الخطوة"}</h4><StateChips state={after} before={before} lang={lang} onPick={onPick}/></section></div>}
        {!!step.output?.length && <div className={`trace-output trace-state-chip ${sameValue(steps[bounded-1]?.output || [],step.output) ? "" : "changed"}`}><span>{lang === "en" ? "Output" : "المخرجات"}</span><pre dir="ltr">{step.output.join("\n")}</pre></div>}
      </div>
    </div>
  </section>;
}

/** A data-driven, transient walkthrough; model inputs and earned progress stay with their owners. */
export function useTraceIndex(key:string,total:number,initial=0) {
  const [index,setIndex]=useTopicSession(key,initial);
  return [Math.max(0,Math.min(index,total-1)),setIndex] as const;
}
