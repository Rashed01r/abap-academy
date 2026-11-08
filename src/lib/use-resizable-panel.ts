"use client";
import { useEffect, useRef, useState, type RefObject, type PointerEvent as ReactPointerEvent, type KeyboardEvent } from "react";

export const panelLayoutKey = "abap2-panel-layout:v1";
type Size = {width: number; height: number};
type Bounds = {minWidth: number; maxWidth: number; minHeight: number; maxHeight: number};
export type ResizeEdge = "width" | "height" | "both";
const defaultSize = {width: 900, height: 620};
function clamp(size: Size, bounds: Bounds): Size {
  return {width: Math.round(Math.max(bounds.minWidth, Math.min(bounds.maxWidth, size.width))), height: Math.round(Math.max(bounds.minHeight, Math.min(bounds.maxHeight, size.height)))};
}

export function useResizablePanel(viewport: RefObject<HTMLDivElement | null>, ready: boolean) {
  const [custom, setCustom] = useState<Size>(defaultSize);
  const [collapsed, setCollapsed] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [bounds, setBounds] = useState<Bounds>({minWidth:440,maxWidth:1400,minHeight:320,maxHeight:700});
  const [resizing, setResizing] = useState(false);
  const gesture = useRef<{pointer: number; target: HTMLButtonElement; edge: ResizeEdge; x: number; y: number; start: Size; latest: Size; rtl: boolean; scale: number; selection: string} | null>(null);
  const frame = useRef(0);
  const size = clamp(custom, bounds);

  useEffect(() => {
    if (!ready) return;
    try {
      const saved = JSON.parse(localStorage.getItem(panelLayoutKey) || "null");
      if (saved?.version === 1 && Number.isFinite(saved.width) && Number.isFinite(saved.height) && saved.width >= 240 && saved.width <= 4000 && saved.height >= 200 && saved.height <= 4000) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCustom({width:saved.width,height:saved.height});
        setCollapsed(saved.collapsed === true);
      }
    } catch {setStorageAvailable(false);}
  }, [ready]);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const maxWidth = Math.max(280, Math.min(2200, element.clientWidth - 48));
      const maxHeight = Math.max(220, element.clientHeight - 48);
      setBounds({minWidth:Math.min(440,maxWidth),maxWidth,minHeight:Math.min(320,maxHeight),maxHeight});
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [viewport]);
  useEffect(() => () => {
    cancelAnimationFrame(frame.current);
    if (gesture.current) document.body.style.userSelect = gesture.current.selection;
  }, []);
  function persist(next: Size, isCollapsed = collapsed) {
    try {localStorage.setItem(panelLayoutKey, JSON.stringify({version:1,...next,collapsed:isCollapsed}));}
    catch {setStorageAvailable(false);}
  }
  function collapse(value: boolean) {setCollapsed(value);persist(custom,value);}
  function reset() {const next = clamp(defaultSize,bounds);setCustom(next);persist(next);}
  function finish(cancel = false) {
    const active = gesture.current;
    if (!active) return;
    gesture.current = null;
    cancelAnimationFrame(frame.current);
    const next = cancel ? active.start : active.latest;
    setCustom(next);setResizing(false);
    document.body.style.userSelect = active.selection;
    if (active.target.hasPointerCapture(active.pointer)) active.target.releasePointerCapture(active.pointer);
    if (!cancel) persist(next);
  }
  function start(event: ReactPointerEvent<HTMLButtonElement>, edge: ResizeEdge, rtl: boolean) {
    if (event.button !== 0 || gesture.current) return;
    event.preventDefault();event.stopPropagation();
    const panel = event.currentTarget.closest<HTMLElement>("[data-lesson-node]")!;
    gesture.current = {pointer:event.pointerId,target:event.currentTarget,edge,x:event.clientX,y:event.clientY,start:size,latest:size,rtl,scale:panel.getBoundingClientRect().width / panel.offsetWidth,selection:document.body.style.userSelect};
    document.body.style.userSelect = "none";
    event.currentTarget.focus({preventScroll:true});event.currentTarget.setPointerCapture(event.pointerId);
    setResizing(true);
  }
  function move(event: ReactPointerEvent<HTMLButtonElement>) {
    const active = gesture.current;
    if (!active || active.pointer !== event.pointerId) return;
    event.preventDefault();event.stopPropagation();
    active.latest = clamp({width:active.start.width + (active.edge === "height" ? 0 : (event.clientX-active.x) * (active.rtl ? -1 : 1) / active.scale),height:active.start.height + (active.edge === "width" ? 0 : (event.clientY-active.y) / active.scale)},bounds);
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setCustom(active.latest));
  }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, edge: ResizeEdge, rtl: boolean) {
    if (event.key === "Escape") {event.preventDefault();finish(true);return;}
    if (!event.key.startsWith("Arrow")) return;
    event.preventDefault();event.stopPropagation();
    const step = event.shiftKey ? 50 : 10;
    const x = edge !== "height" ? (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0) * (rtl ? -1 : 1) * step : 0;
    const y = edge !== "width" ? (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0) : 0;
    const next = clamp({width:size.width+x,height:size.height+y},bounds);
    setCustom(next);persist(next);
  }
  const initial = clamp(defaultSize,bounds), isDefault = size.width === initial.width && size.height === initial.height;
  return {size,bounds,collapsed,collapse,reset,isDefault,resizing,storageAvailable,start,move,finish,keyboard};
}
