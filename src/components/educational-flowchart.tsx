"use client";
import { useId,useEffect,useRef,useState } from "react";
import type { Locale } from "@/lib/engine";
export type FlowNode = {id: string; label: string; x: number; y: number; decision?: boolean};
export type FlowEdge = {from: string; to: string; label?: string; back?: boolean};

function wrap(text:string,limit:number) {
  const words=text.split(/\s+/),lines:string[]=[];let line="";
  for(const word of words) {
    if((line+" "+word).trim().length>limit && line){lines.push(line);line="";}
    if(word.length>limit){if(line){lines.push(line);line="";}for(let i=0;i<word.length;i+=limit)lines.push(word.slice(i,i+limit));}
    else line=(line+" "+word).trim();
  }
  if(line)lines.push(line);return lines;
}

/** One current node, one incoming arrow, responsive labels and outside return paths. */
export function EducationalFlowchart({nodes, edges, active, activeEdges, lang, label, onSelect}: {
  nodes: FlowNode[]; edges: FlowEdge[]; active?: string; activeEdges?:string[]; lang: Locale; label: string; onSelect?: (id: string) => void;
}) {
  const marker=useId().replace(/:/g,""),figure=useRef<HTMLElement>(null),[width,setWidth]=useState(600);
  useEffect(()=>{const el=figure.current;if(!el)return;const observer=new ResizeObserver(()=>setWidth(el.clientWidth));observer.observe(el);setWidth(el.clientWidth);return()=>observer.disconnect();},[]);
  const narrow=width<560,logicalWidth=narrow ? Math.max(200,width) : 640,rtl=lang === "ar";
  const sized=nodes.map(node=>{
    const w=narrow ? Math.min(244,logicalWidth-72) : Math.min(244,Math.max(156,node.label.length*7+28));
    const lines=wrap(node.label,Math.max(12,Math.floor((w-(node.decision?40:20))/7)));
    const h=Math.max(node.decision?72:48,lines.length*17+(node.decision?36:22));
    return {...node,w,h,lines};
  });
  const layout=sized.map((node,index)=>({...node,x:narrow ? logicalWidth/2 : rtl ? logicalWidth-node.x : node.x,y:narrow ? 16+node.h/2+sized.slice(0,index).reduce((sum,n)=>sum+n.h+56,0) : node.y+18}));
  const height=Math.max(...layout.map(n=>n.y+n.h/2))+24;
  const incoming=edges.filter(e=>e.to === active && (!activeEdges || activeEdges.includes(`${e.from}:${e.to}`))).at(-1);
  return <figure ref={figure} className="educational-flowchart" aria-label={label}>
    <svg viewBox={`0 0 ${logicalWidth} ${height}`} style={{minWidth:0}} role="group" aria-label={label}>
      <defs>{[false,true].map(bright=><marker key={String(bright)} id={`${marker}-${bright?"bright":"dim"}`} markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={bright?"#5fd4a8":"#4a6f62"}/></marker>)}</defs>
      {edges.map((edge,index)=>{
        const a=layout.find(n=>n.id===edge.from),b=layout.find(n=>n.id===edge.to);if(!a || !b)return null;
        const dx=b.x-a.x,dy=b.y-a.y;
        const boundary=(n:typeof a)=>n.decision ? 1/(Math.abs(dx)/(n.w/2)+Math.abs(dy)/(n.h/2)) : Math.min(dx ? n.w/2/Math.abs(dx):Infinity,dy ? n.h/2/Math.abs(dy):Infinity);
        const start=boundary(a),end=boundary(b),outside=edge.back || narrow && Math.abs(dy)>a.h+b.h+52;
        const side=edge.back ? rtl ? logicalWidth-12 : 12 : rtl ? 12 : logicalWidth-12;
        const sign=side<a.x ? -1:1,sx=a.x+sign*a.w/2,ex=b.x+sign*b.w/2;
        const radius=12,vertical=dy>=0?1:-1;
        const path=outside ? `M${sx},${a.y} H${side-sign*radius} Q${side},${a.y} ${side},${a.y+vertical*radius} V${b.y-vertical*radius} Q${side},${b.y} ${side-sign*radius},${b.y} H${ex}` : `M${a.x+dx*start},${a.y+dy*start} L${b.x-dx*end},${b.y-dy*end}`;
        const bright=edge===incoming,textWidth=Math.max(32,(edge.label?.length || 0)*7+16);
        const labelX=outside ? Math.min(logicalWidth-textWidth-5,Math.max(5,side+ (side<logicalWidth/2 ? 10 : -textWidth-10))) : Math.min(logicalWidth-textWidth-5,Math.max(5,(a.x+b.x)/2+(Math.abs(dx)<15 ? 12 : -textWidth/2)));
        const labelY=outside ? a.y+vertical*(a.h/2+24) : Math.abs(dy)<5 ? a.y-Math.max(a.h,b.h)/2-18 : Math.abs(dx)<15 ? ((a.y+dy*start)+(b.y-dy*end))/2+3 : (a.y+b.y)/2-10;
        return <g key={index} data-flow-edge={`${edge.from}:${edge.to}`} className={`flow-edge ${bright?"active":""}`}><path d={path} markerEnd={`url(#${marker}-${bright?"bright":"dim"})`}/>{edge.label && <g className="flow-edge-label"><rect x={labelX} y={labelY-14} width={textWidth} height="22" rx="4"/><text x={labelX+textWidth/2} y={labelY+1} textAnchor="middle" direction={rtl?"rtl":"ltr"}>{edge.label}</text></g>}</g>;
      })}
      {layout.map(node=><g key={node.id} data-flow-node={node.id} role={onSelect?"button":"img"} aria-label={node.label} aria-current={active===node.id?"step":undefined} tabIndex={onSelect?0:undefined} className={`flow-svg-node ${node.decision?"decision":""} ${active===node.id?"active":""}`} onClick={()=>onSelect?.(node.id)} onKeyDown={e=>{if(onSelect && ["Enter"," "].includes(e.key)){e.preventDefault();e.stopPropagation();onSelect(node.id);}}}>
        {node.decision ? <polygon points={`${node.x},${node.y-node.h/2} ${node.x+node.w/2},${node.y} ${node.x},${node.y+node.h/2} ${node.x-node.w/2},${node.y}`}/> : <rect x={node.x-node.w/2} y={node.y-node.h/2} width={node.w} height={node.h} rx="10"/>}
        <text textAnchor="middle" direction={/^[A-Za-z0-9_<]/.test(node.label)?"ltr":rtl?"rtl":"ltr"}>{node.lines.map((text,i)=><tspan key={i} x={node.x} y={node.y-(node.lines.length-1)*8.5+i*17+4}>{text}</tspan>)}</text>
      </g>)}
    </svg><figcaption>{label}</figcaption>
  </figure>;
}
