"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { GuidedDefinition } from "@/lib/guided-types";
import type { Locale } from "@/lib/engine";
import type { ClassroomSelection } from "./trace-classroom";

const groupMap: Record<string, Record<string,string>> = {
  "dictionary-introduction": {domain:"status-field",element:"status-field",structure:"table-container",table:"table-container"},
  "cloud-introduction": {package:"cloud-contract",api:"cloud-api",cds:"cloud-exposure",behavior:"cloud-exposure",service:"cloud-exposure",binding:"cloud-exposure",client:"cloud-exposure"},
  "projects-employee-management": {requirements:"employee-table",table:"employee-table",root:"employee-root",behavior:"employee-behavior",projection:"employee-projection",service:"employee-service",binding:"employee-service",evidence:"employee-service"},
};
export function ArchitectureClassroom({definition:d, lang, selection, onSelect}: {definition: GuidedDefinition; lang: Locale; selection: ClassroomSelection; onSelect:(s:ClassroomSelection)=>void}) {
  const root=useRef<HTMLDivElement>(null), marker=useId().replace(/:/g,"");
  const [edges,setEdges]=useState<{d:string; from:string; to:string}[]>([]);
  const selected=selection.artifact || Object.keys(groupMap[d.id] || {}).find(id => groupMap[d.id][id] === selection.group) || d.artifacts[0].id;
  const artifact=d.artifacts.find(a=>a.id === selected) || d.artifacts[0];
  function choose(id:string){onSelect({artifact:id,group:groupMap[d.id]?.[id]});}
  useEffect(()=>{
    const element=root.current;if(!element)return;
    function measure(){
      if(!element)return; const base=element.getBoundingClientRect();
      const zoom=base.width/element.offsetWidth;
      setEdges(d.relations.map(r=>{
        const a=element.querySelector<HTMLElement>(`[data-architecture-node="${r.from}"]`)!.getBoundingClientRect();
        const b=element.querySelector<HTMLElement>(`[data-architecture-node="${r.to}"]`)!.getBoundingClientRect();
        const x1=(a.left+a.width/2-base.left)/zoom, x2=(b.left+b.width/2-base.left)/zoom;
        const y1=(a.bottom-base.top)/zoom, y2=(b.top-base.top)/zoom;
        const sameRow=Math.abs(a.top-b.top)<4*zoom;
        const ax=(a.left-base.left)/zoom, bx=(b.left-base.left)/zoom, ay=(a.top+a.height/2-base.top)/zoom, by=(b.top+b.height/2-base.top)/zoom;
        const longJump=y2-y1>Math.max(a.height,b.height)/zoom+50;
        const d=sameRow ? a.left<b.left ? `M${(a.right-base.left)/zoom},${ay} L${bx},${by}` : `M${ax},${ay} L${(b.right-base.left)/zoom},${by}` : longJump ? `M${ax},${ay} L8,${ay} L8,${by} L${bx},${by}` : `M${x1},${y1} C${x1},${y1+18} ${x2},${y2-18} ${x2},${y2}`;
        return {from:r.from,to:r.to,d};
      }));
    }
    const observer=new ResizeObserver(measure);observer.observe(element);measure();return()=>observer.disconnect();
  },[d]);
  const en=lang === "en";
  return <section className="architecture-classroom" data-primary-diagram="relationships" aria-label={en ? "Explore the connected definitions" : "استكشف التعريفات المترابطة"}>
    <div className="architecture-canvas" ref={root} dir="ltr">
      <svg className="architecture-connections" aria-hidden="true"><defs><marker id={marker} markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker></defs>{edges.map((edge,i)=><path key={i} data-edge-to={edge.to} data-edge-from={edge.from} d={edge.d} markerEnd={`url(#${marker})`} className={edge.from === artifact.id || edge.to === artifact.id ? "active" : ""}/>)}</svg>
      {d.artifacts.map(a=><button key={a.id} className={`architecture-node ${artifact.id === a.id ? "active" : ""}`} data-architecture-node={a.id} aria-pressed={artifact.id === a.id} onClick={()=>choose(a.id)} dir={en ? "ltr" : "rtl"}><strong>{a.title[lang]}</strong><code dir="ltr">{a.example.split("\n")[0]}</code></button>)}
    </div>
    <article className="architecture-inspector" aria-live="polite"><h3>{artifact.title[lang]}</h3><p>{artifact.description[lang]}</p><div className="architecture-paths">{d.relations.filter(r=>r.from === artifact.id || r.to === artifact.id).map((r,i)=><div key={i}><button className="text-button" onClick={()=>choose(r.from)}>{d.artifacts.find(a=>a.id === r.from)!.title[lang]}</button><span> {en ? "→" : "←"} {r.label[lang]} {en ? "→" : "←"} </span><button className="text-button" onClick={()=>choose(r.to)}>{d.artifacts.find(a=>a.id === r.to)!.title[lang]}</button></div>)}</div></article>
    <p className="visual-boundary">{en ? "Connected conceptual artifacts · select a node to connect its responsibility with the reference code below. Arrows show declared relationships, not SAP activation or a running service." : "كائنات مفاهيمية مترابطة · اختر عقدة لربط مسؤوليتها بالأكواد المرجعية أدناه. توضح الأسهم العلاقات المصرح بها، لا تفعيل SAP أو خدمة تعمل فعلياً."}</p>
  </section>;
}
