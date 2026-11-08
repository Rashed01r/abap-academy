"use client";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { Maximize2, Minimize2, RotateCcw, Minus, PanelTopOpen, Grip } from "lucide-react";
import { type Locale } from "@/lib/engine";
import { useResizablePanel, type ResizeEdge } from "@/lib/use-resizable-panel";
import { treeCopy } from "@/lib/tree-copy";

export function ResizableLessonPanel({children,title,lang,focused,onFocus,viewport,ready,zoom,selection,onResizeStart}: {
  children:ReactNode;title:string;lang:Locale;focused:boolean;onFocus:()=>void;viewport:RefObject<HTMLDivElement|null>;ready:boolean;zoom:number;selection:string;onResizeStart:()=>void;
}) {
  const layout = useResizablePanel(viewport,ready), c = treeCopy[lang], rtl = lang === "ar";
  const panel = useRef<HTMLElement>(null);
  const previousSelection = useRef(selection);
  useEffect(() => {
    if (focused && layout.collapsed) layout.collapse(false);
  // Focus always opens a readable lesson; the geometry remains unchanged.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, layout.collapsed]);
  useEffect(() => {
    if (previousSelection.current !== selection) {
      layout.collapse(false);previousSelection.current = selection;
    }
  // An explicit topic change reopens the same panel without replacing lesson state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);
  function reframe() {requestAnimationFrame(() => panel.current?.scrollIntoView({block:"nearest",inline:"nearest",behavior:"instant"}));}
  function toggleCollapse() {
    onResizeStart();
    if (focused) onFocus();
    layout.collapse(!layout.collapsed);reframe();
    requestAnimationFrame(() => panel.current?.querySelector<HTMLButtonElement>("[data-panel-collapse]")?.focus({preventScroll:true}));
  }
  const sizeLabel = `${layout.size.width} × ${layout.size.height}`;
  const handles: ResizeEdge[] = ["width","height","both"];
  return <article ref={panel} className={`connected-lesson-node smart-lesson-panel ${layout.collapsed ? "panel-collapsed" : ""}`} data-lesson-node data-resizing={layout.resizing || undefined} data-panel-width={layout.size.width} data-panel-height={layout.size.height} style={{width:focused?"100%":layout.size.width,height:focused?"100%":layout.collapsed?76:layout.size.height,zoom:focused?1:1/zoom}}>
    <div className="panel-chrome" dir={rtl?"rtl":"ltr"}>
      <strong title={title}>{title}</strong>
      <div className="panel-actions" role="group" aria-label={c.panelActions}>
        <button type="button" title={focused?c.restoreSize:c.expandWorkspace} aria-label={focused?c.restoreSize:c.expandWorkspace} onClick={() => {if(layout.collapsed)layout.collapse(false);onFocus();}}>{focused?<Minimize2 size={16}/>:<Maximize2 size={16}/>}</button>
        {/* Disabled at the default size, where a reset would change nothing. */}
        <button type="button" title={c.resetSize} aria-label={c.resetSize} disabled={layout.isDefault} onClick={() => {onResizeStart();layout.reset();reframe();}}><RotateCcw size={16}/></button>
        <button type="button" data-panel-collapse title={layout.collapsed?c.reopenPanel:c.collapsePanel} aria-label={layout.collapsed?c.reopenPanel:c.collapsePanel} aria-expanded={!layout.collapsed} onClick={toggleCollapse}>{layout.collapsed?<PanelTopOpen size={16}/>:<Minus size={16}/>}</button>
      </div>
    </div>
    <div className="panel-body" hidden={layout.collapsed}>{children}</div>
    {!layout.storageAvailable && <p className="panel-storage" role="status">{c.layoutStorage}</p>}
    {!focused && !layout.collapsed && <>
      <span className="sr-only" id="panel-resize-help">{c.resizeHelp}</span>
      <output className="panel-size" id="panel-current-size" aria-live={layout.resizing?"off":"polite"}>{sizeLabel}</output>
      {handles.map(edge => <button type="button" key={edge} className={`panel-resize panel-resize-${edge} ${rtl?"resize-rtl":""}`} data-resize={edge} title={`${c.dragResize} · ${sizeLabel}`} aria-label={edge==="width"?c.resizeWidth:edge==="height"?c.resizeHeight:c.dragResize} aria-describedby="panel-resize-help panel-current-size"
        onPointerDown={e=>{onResizeStart();layout.start(e,edge,rtl);}} onPointerMove={layout.move} onPointerUp={e=>{e.stopPropagation();layout.finish();reframe();}} onPointerCancel={()=>layout.finish(true)} onLostPointerCapture={()=>layout.finish(true)} onKeyDown={e=>{if(e.key.startsWith("Arrow"))onResizeStart();layout.keyboard(e,edge,rtl);if(e.key.startsWith("Arrow"))reframe();}}>{edge==="both"&&<Grip size={15}/>}</button>)}
    </>}
  </article>;
}
