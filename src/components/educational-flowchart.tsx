"use client";
import { useId,useEffect,useRef,useState } from "react";
import type { Locale } from "@/lib/engine";
export type FlowNode = {id: string; label: string; x: number; y: number; decision?: boolean};
export type FlowEdge = {from: string; to: string; label?: string; back?: boolean};

/** Fixed logical coordinates; labels retain readable sizing in a scrollable figure. */
export function EducationalFlowchart({nodes, edges, active, activeEdges, lang, label, onSelect}: {
  nodes: FlowNode[]; edges: FlowEdge[]; active?: string; activeEdges?:string[]; lang: Locale; label: string; onSelect?: (id: string) => void;
}) {
  const marker = useId().replace(/:/g, "");
  const figure=useRef<HTMLElement>(null),[width,setWidth]=useState(600);
  useEffect(()=>{const el=figure.current;if(!el)return;const observer=new ResizeObserver(()=>setWidth(el.clientWidth));observer.observe(el);setWidth(el.clientWidth);return()=>observer.disconnect();},[]);
  const narrow=width<500, logicalWidth=narrow ? Math.max(220,width) : 600;
  const layout=narrow ? nodes.map((node,index)=>({...node,x:logicalWidth/2,y:30+index*95})) : nodes;
  const height = Math.max(...layout.map(n => n.y)) + 65;
  return <figure ref={figure} className="educational-flowchart" aria-label={label}>
    <svg viewBox={`0 0 ${logicalWidth} ${height}`} style={{minWidth:0}} role="group" aria-label={label}>
      <defs><marker id={marker} markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/></marker></defs>
      {edges.map((edge, index) => {
        const a = layout.find(n => n.id === edge.from)!, b = layout.find(n => n.id === edge.to)!;
        const back = edge.back;
        const dx=b.x-a.x,dy=b.y-a.y;
        const boundary=(node:FlowNode)=>node.decision ? 1/(Math.abs(dx)/94+Math.abs(dy)/36) : Math.min(dx ? 78/Math.abs(dx) : Infinity,dy ? 24/Math.abs(dy) : Infinity);
        const start=boundary(a),end=boundary(b);
        const bypass=narrow && dy>100;
        const left=edge.from === "yes",side=left ? 8 : logicalWidth-8,sign=left ? -1 : 1;
        const path = back ? `M ${a.x - (a.decision ? 94 : 78)},${a.y} C 12,${a.y} 12,${b.y} ${b.x - (b.decision ? 94 : 78)},${b.y}` : bypass ? `M${a.x+sign*(a.decision?94:78)},${a.y} L${side},${a.y} L${side},${b.y} L${b.x+sign*(b.decision?94:78)},${b.y}` : `M ${a.x+dx*start},${a.y+dy*start} L ${b.x-dx*end},${b.y-dy*end}`;
        const selected=activeEdges ? activeEdges.includes(`${edge.from}:${edge.to}`) : active === edge.to;
        return <g key={index} data-flow-edge={`${edge.from}:${edge.to}`} className={selected ? "flow-edge active" : "flow-edge"}><path d={path} markerEnd={`url(#${marker})`}/>{edge.label && <text x={back ? narrow ? 4 : 34 : bypass ? logicalWidth-4 : (a.x+b.x)/2 + (a.y === b.y ? 0 : 14)} y={back || bypass ? (a.y+b.y)/2-6 : a.y === b.y ? a.y-44 : (a.y+b.y)/2 - 8} textAnchor={bypass ? lang === "ar" ? "start" : "end" : back && lang === "ar" ? "end" : a.y === b.y ? "middle" : "start"} direction={lang === "ar" ? "rtl" : "ltr"}>{edge.label}</text>}</g>;
      })}
      {layout.map(node => <g key={node.id} role={onSelect ? "button" : "img"} aria-label={node.label} tabIndex={onSelect ? 0 : undefined} className={`flow-svg-node ${node.decision ? "decision" : ""} ${active === node.id ? "active" : ""}`} onClick={() => onSelect?.(node.id)} onKeyDown={e => {if (onSelect && ["Enter", " "].includes(e.key)) {e.preventDefault(); onSelect(node.id);}}}>
        {node.decision ? <polygon points={`${node.x},${node.y-36} ${node.x+94},${node.y} ${node.x},${node.y+36} ${node.x-94},${node.y}`}/> : <rect x={node.x-78} y={node.y-24} width="156" height="48" rx="13"/>}
        <text x={node.x} y={node.y+5} textAnchor="middle" direction={/^[A-Za-z0-9_<]/.test(node.label) ? "ltr" : lang === "ar" ? "rtl" : "ltr"}>{node.label}</text>
      </g>)}
    </svg>
    <figcaption>{label}</figcaption>
  </figure>;
}
