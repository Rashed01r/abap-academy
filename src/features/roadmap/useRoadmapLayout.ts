"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { AMBER, MINT, type RoadmapNode } from "./data/roadmap-tree";

/** Card width, height and column x per depth, plus the vertical gap (from the prototype). */
export const WD = [170, 230, 250, 280] as const;
export const HT = [130, 116, 106, 90] as const;
const XS = [0, 250, 530, 840] as const;
const GAP = 14;
const DRAWER_SPACE = 410;
const MIN_K = 0.3, MAX_K = 1.6;

type Pos = { x: number; y: number; a: number; tx: number; ty: number; ta: number; w: number; h: number };
type Wire = { g: SVGGElement; p1: SVGPathElement; p2: SVGPathElement };

export type RoadmapLayoutApi = {
  nodeRef: (id: string) => (el: HTMLDivElement | null) => void;
  wireRef: (id: string) => (el: SVGGElement | null) => void;
  fit: () => void;
  zoomBy: (factor: number) => void;
  flash: (id: string) => void;
};

/**
 * Positions, connector curves, camera and the path tint live in refs and are written to
 * the DOM from one requestAnimationFrame loop. React state (expanded, selected, drawer)
 * only feeds the targets.
 */
export function useRoadmapLayout(opts: {
  root: RoadmapNode;
  all: RoadmapNode[];
  expanded: ReadonlySet<string>;
  drawerOpen: boolean;
  rtl: boolean;
  enabled: boolean;
  stageRef: RefObject<HTMLDivElement | null>;
  worldRef: RefObject<HTMLDivElement | null>;
  zoomRef: RefObject<HTMLOutputElement | null>;
  tintRef: RefObject<HTMLElement | null>;
  reduceMotion: boolean;
}): RoadmapLayoutApi {
  const { root, all, expanded, drawerOpen, rtl, enabled, stageRef, worldRef, zoomRef, tintRef, reduceMotion } = opts;
  const pos = useRef<Map<string, Pos>>(new Map());
  const nodeEls = useRef(new Map<string, HTMLDivElement>());
  const wires = useRef(new Map<string, Wire>());
  const cam = useRef({ x: 0, y: 0, k: 1 });
  const camT = useRef({ x: 0, y: 0, k: 1 });
  const camInit = useRef(false);
  const dirty = useRef(true);
  const tint = useRef([94, 234, 177]);
  const tintT = useRef([94, 234, 177]);
  // Latest inputs for the loop and the event handlers, without re-subscribing.
  const live = useRef({ expanded, drawerOpen, rtl, reduceMotion });
  useLayoutEffect(() => {
    live.current = { expanded, drawerOpen, rtl, reduceMotion };
  });


  // Stable ref callbacks per id, so React does not detach and reattach them every render.
  const nodeRefs = useRef(new Map<string, (el: HTMLDivElement | null) => void>());
  const wireRefs = useRef(new Map<string, (el: SVGGElement | null) => void>());
  const nodeRef = useCallback((id: string) => {
    let cb = nodeRefs.current.get(id);
    if (!cb) {
      cb = (el: HTMLDivElement | null) => {
        if (el) nodeEls.current.set(id, el); else nodeEls.current.delete(id);
        dirty.current = true;
      };
      nodeRefs.current.set(id, cb);
    }
    return cb;
  }, []);
  const wireRef = useCallback((id: string) => {
    let cb = wireRefs.current.get(id);
    if (!cb) {
      cb = (el: SVGGElement | null) => {
        if (el) {
          const [p1, p2] = Array.from(el.querySelectorAll("path")) as SVGPathElement[];
          wires.current.set(id, { g: el, p1, p2 });
        } else wires.current.delete(id);
        dirty.current = true;
      };
      wireRefs.current.set(id, cb);
    }
    return cb;
  }, []);

  /** Mirrors an x coordinate for RTL (the tree grows right to left). */
  const mx = (x: number) => (live.current.rtl ? -x : x);
  const left = (p: Pos) => (live.current.rtl ? -(p.x + p.w) : p.x);
  const leftT = (p: Pos) => (live.current.rtl ? -(p.tx + p.w) : p.tx);

  const layout = useCallback(() => {
    for (const n of all) if (!pos.current.has(n.id)) pos.current.set(n.id, { x: 0, y: 0, a: 0, tx: 0, ty: 0, ta: 0, w: WD[n.depth], h: HT[n.depth] });
    const ex = live.current.expanded;
    let y = 0;
    const vis = new Set<string>();
    (function place(n: RoadmapNode) {
      const p = pos.current.get(n.id)!;
      p.tx = XS[n.depth];
      vis.add(n.id);
      const kids = n === root || ex.has(n.id) ? n.children : [];
      if (!kids.length) { p.ty = y + p.h / 2; y += p.h + GAP; return; }
      kids.forEach(place);
      p.ty = (pos.current.get(kids[0].id)!.ty + pos.current.get(kids[kids.length - 1].id)!.ty) / 2;
    })(root);
    for (const n of all) {
      const p = pos.current.get(n.id)!;
      if (vis.has(n.id)) {
        if (p.ta === 0 && p.a < 0.02 && n.parent) {
          // Appearing: start from the parent's current position.
          const pp = pos.current.get(n.parent.id)!;
          p.x = pp.x; p.y = pp.y; p.a = 0;
        }
        p.ta = 1;
      } else {
        p.ta = 0;
        if (n.parent) { const pp = pos.current.get(n.parent.id)!; p.tx = pp.tx; p.ty = pp.ty; }
      }
    }
    if (!camInit.current || live.current.reduceMotion) {
      for (const p of pos.current.values()) { p.x = p.tx; p.y = p.ty; p.a = p.ta; }
    }
    dirty.current = true;
  }, [all, root]);

  const fit = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const { expanded: ex, drawerOpen: dOpen, rtl: isRtl } = live.current;
    const reserve = dOpen && r.width > 820 ? DRAWER_SPACE : 0;
    const aw = r.width - reserve;
    const offset = isRtl ? reserve : 0;
    let f: RoadmapNode | undefined;
    for (const n of all) if (ex.has(n.id) && (!f || n.depth > f.depth)) f = n;
    // With a category open, frame only its branch (root → path → category → items).
    const focus = new Set<string>(f && f.depth >= 2 ? [root.id] : [root.id, ...root.children.map(c => c.id)]);
    if (f) { for (let p: RoadmapNode | undefined = f; p; p = p.parent) focus.add(p.id); f.children.forEach(c => focus.add(c.id)); }
    let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    for (const n of all) {
      const p = pos.current.get(n.id)!;
      if (p.ta === 0 || (f && !focus.has(n.id))) continue;
      const l = leftT(p);
      a = Math.min(a, l); b = Math.max(b, l + p.w); c = Math.min(c, p.ty - p.h / 2); d = Math.max(d, p.ty + p.h / 2);
    }
    if (a > b) return;
    const bw = b - a, bh = d - c, pad = 56;
    let k = Math.min((aw - pad * 2) / bw, (r.height - pad * 2 - 50) / bh, 1.05);
    k = Math.max(MIN_K, k);
    camT.current = { k, x: offset + (aw - bw * k) / 2 - a * k, y: (r.height - bh * k) / 2 - c * k - 14 };
    if (!camInit.current || live.current.reduceMotion) { cam.current = { ...camT.current }; camInit.current = true; }
    dirty.current = true;
  }, [all, root, stageRef]);

  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    const t = camT.current;
    const k = Math.min(MAX_K, Math.max(MIN_K, t.k * factor));
    const ratio = k / t.k;
    camT.current = { k, x: px - (px - t.x) * ratio, y: py - (py - t.y) * ratio };
    if (live.current.reduceMotion) cam.current = { ...camT.current };
    dirty.current = true;
  }, []);
  const zoomBy = useCallback((factor: number) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (r) zoomAt(factor, r.width / 2, r.height / 2);
  }, [stageRef, zoomAt]);

  const flash = useCallback((id: string) => {
    const el = nodeEls.current.get(id);
    if (!el) return;
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
    window.setTimeout(() => el.classList.remove("flash"), 2600);
  }, []);

  // Recompute targets and refit when the tree state changes.
  useLayoutEffect(() => {
    if (!enabled) return;
    layout();
    fit();
    const ids = live.current.expanded.has("tcodes") ? AMBER : MINT;
    tintT.current = ids.split(",").map(Number);
  }, [expanded, drawerOpen, rtl, enabled, layout, fit]);

  // Pointer, wheel and resize listeners.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !enabled) return;
    let drag: { x: number; y: number } | null = null;
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as HTMLElement).closest(".card,.tools,.drawer,.fx,.fxbtn")) return;
      drag = { x: e.clientX, y: e.clientY };
      stage.classList.add("drag");
      stage.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag = { x: e.clientX, y: e.clientY };
      cam.current.x += dx; cam.current.y += dy; camT.current.x += dx; camT.current.y += dy;
      dirty.current = true;
    };
    const end = () => { drag = null; stage.classList.remove("drag"); };
    const wheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest(".drawer,.fx")) return;
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0012), e.clientX - r.left, e.clientY - r.top);
    };
    const resize = () => fit();
    // Focusing a card that is partly off screen makes the browser scroll this overflow:hidden
    // stage. The camera owns the view, so keep the stage itself unscrolled.
    const unscroll = () => { if (stage.scrollLeft || stage.scrollTop) { stage.scrollLeft = 0; stage.scrollTop = 0; } };
    stage.addEventListener("scroll", unscroll);
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);
    stage.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("resize", resize);
    return () => {
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", end);
      stage.removeEventListener("pointercancel", end);
      stage.removeEventListener("wheel", wheel);
      stage.removeEventListener("scroll", unscroll);
      window.removeEventListener("resize", resize);
    };
  }, [enabled, stageRef, fit, zoomAt]);

  // The animation loop.
  useEffect(() => {
    if (!enabled) return;
    let raf = 0, last = performance.now(), lastZoom = -1;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const instant = live.current.reduceMotion;
      const f = instant ? 1 : 1 - Math.exp(-dt * 9), fc = instant ? 1 : 1 - Math.exp(-dt * 6);
      let moving = dirty.current;
      dirty.current = false;
      for (const p of pos.current.values()) {
        const dx = p.tx - p.x, dy = p.ty - p.y, da = p.ta - p.a;
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || Math.abs(da) > 0.002) {
          p.x += dx * f; p.y += dy * f; p.a += da * f; moving = true;
        } else { p.x = p.tx; p.y = p.ty; p.a = p.ta; }
      }
      if (moving) {
        for (const n of all) {
          const p = pos.current.get(n.id)!, el = nodeEls.current.get(n.id);
          if (!el) continue;
          const gone = p.ta === 0 && p.a < 0.02;
          el.style.visibility = gone ? "hidden" : "visible";
          el.inert = p.ta === 0;
          if (gone) { const w = wires.current.get(n.id); if (w) w.g.style.opacity = "0"; continue; }
          const s = 0.88 + 0.12 * p.a;
          el.style.transform = `translate(${left(p)}px,${p.y - p.h / 2}px) scale(${s})`;
          el.style.opacity = p.a.toFixed(3);
          const w = wires.current.get(n.id);
          if (w && n.parent) {
            const pp = pos.current.get(n.parent.id)!;
            const sx = mx(pp.x + pp.w * (0.85 + 0.15 * p.a) - pp.w * 0.15 * (1 - p.a)), sy = pp.y;
            const ex = mx(p.x), ey = p.y, half = (ex - sx) * 0.5;
            const d = `M${sx} ${sy}C${sx + half} ${sy},${ex - half} ${ey},${ex} ${ey}`;
            w.p1.setAttribute("d", d); w.p2.setAttribute("d", d);
            w.g.style.opacity = p.a.toFixed(3);
          }
        }
      }
      const c = cam.current, t = camT.current;
      if (Math.abs(t.x - c.x) > 0.05 || Math.abs(t.y - c.y) > 0.05 || Math.abs(t.k - c.k) > 0.0005 || moving) {
        c.x += (t.x - c.x) * fc; c.y += (t.y - c.y) * fc; c.k += (t.k - c.k) * fc;
        if (worldRef.current) worldRef.current.style.transform = `translate(${c.x}px,${c.y}px) scale(${c.k})`;
        const z = Math.round(c.k * 100);
        if (z !== lastZoom && zoomRef.current) { zoomRef.current.textContent = `${z}%`; lastZoom = z; }
      }
      const tc = tint.current, tt = tintT.current;
      if (tc.some((v, i) => Math.abs(v - tt[i]) > 0.5)) {
        for (let i = 0; i < 3; i++) tc[i] += (tt[i] - tc[i]) * (instant ? 1 : Math.min(1, dt * 3));
        tintRef.current?.style.setProperty("--tint", `${tc[0] | 0},${tc[1] | 0},${tc[2] | 0}`);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [enabled, all, worldRef, zoomRef, tintRef]);

  return { nodeRef, wireRef, fit, zoomBy, flash };
}
