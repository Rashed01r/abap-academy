"use client";
import { forwardRef, useImperativeHandle, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import type { Locale } from "@/lib/engine";
import type { RoadmapCopy } from "@/lib/tree-copy";
import type { RoadmapNode } from "./data/roadmap-tree";
import { NodeCard } from "./NodeCard";
import { useRoadmapLayout, type RoadmapLayoutApi } from "./useRoadmapLayout";

const icon = (d: string) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;

export type RoadmapCanvasHandle = Pick<RoadmapLayoutApi, "fit" | "flash">;

/** Desktop tree: pan/zoom stage, connector curves, node cards and the view toolbar. */
export const RoadmapCanvas = forwardRef<RoadmapCanvasHandle, {
  root: RoadmapNode; all: RoadmapNode[]; expanded: ReadonlySet<string>; selectedId?: string;
  drawerOpen: boolean; lang: Locale; c: RoadmapCopy; reduceMotion: boolean;
  tintRef: RefObject<HTMLElement | null>;
  isDone: (n: RoadmapNode) => boolean; isStarted: (n: RoadmapNode) => boolean;
  onSelect: (n: RoadmapNode) => void; onReset: () => void;
  children?: ReactNode;
}>(function RoadmapCanvas({ root, all, expanded, selectedId, drawerOpen, lang, c, reduceMotion, tintRef, isDone, isStarted, onSelect, onReset, children }, ref) {
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLOutputElement>(null);
  const api = useRoadmapLayout({ root, all, expanded, drawerOpen, rtl: lang === "ar", enabled: true, stageRef, worldRef, zoomRef, tintRef, reduceMotion });
  useImperativeHandle(ref, () => ({ fit: api.fit, flash: api.flash }), [api.fit, api.flash]);
  return <div className="stage" ref={stageRef} aria-describedby="roadmap-pan-help">
    <p className="sr-only" id="roadmap-pan-help">{c.pan}</p>
    <div className="world" ref={worldRef}>
      <svg className="wires" aria-hidden="true">
        <g>{all.filter(n => n.parent).map(n =>
          <g key={n.id} ref={api.wireRef(n.id)} style={{ "--c": n.color, opacity: 0 } as CSSProperties}>
            <path className="base" /><path className="flow" />
          </g>)}
        </g>
      </svg>
      <div className="nodes">
        {all.map(n => <NodeCard key={n.id} node={n} lang={lang} c={c}
          active={expanded.has(n.id) || selectedId === n.id} done={isDone(n)} started={isStarted(n)}
          nodeRef={api.nodeRef(n.id)} onSelect={onSelect} />)}
      </div>
    </div>
    <div className="tools" role="toolbar" aria-label={c.viewControls}>
      <div className="grp"><button type="button" aria-label={c.back} title={c.back} onClick={onReset}>{icon("M19 12H5M11 18l-6-6 6-6")}abap/</button></div>
      <div className="grp">
        <button type="button" className="ico" aria-label={c.zoomOut} onClick={() => api.zoomBy(1 / 1.15)}>−</button>
        <output ref={zoomRef} aria-label={c.zoomLevel}>100%</output>
        <button type="button" className="ico" aria-label={c.zoomIn} onClick={() => api.zoomBy(1.15)}>+</button>
      </div>
      <div className="grp">
        <button type="button" aria-label={c.fit} title={c.fit} onClick={api.fit}>{icon("M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5")}fit</button>
        <button type="button" aria-label={c.reset} title={c.reset} onClick={onReset}>{icon("M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5")}reset</button>
      </div>
    </div>
    {children}
  </div>;
});
