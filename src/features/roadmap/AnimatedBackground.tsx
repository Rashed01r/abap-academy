"use client";
import { useEffect, useRef } from "react";

export type BackgroundMode = "network" | "code" | "both" | "none";
type Props = { mode?: BackgroundMode; intensity?: number; tint?: readonly [number, number, number] };
type Point = { x: number; y: number; vx: number; vy: number; r: number };
type Token = { x: number; y: number; v: number; s: number; a: number; t: string };

const WORDS = ["SELECT", "FROM", "WHERE", "LOOP AT", "ENDLOOP.", "DATA:", "TYPES:", "CLASS", "METHOD", "ENDMETHOD.", "READ TABLE", "APPEND", "IF", "ENDIF.", "sy-subrc", "INTO TABLE", "@DATA(", "CDS", "RAP", "TRY.", "CATCH", "FIELD-SYMBOLS", "SE38", "SE11", "SE80", "ST22", "SM37", "/nSE16", "MODIFY", "COMMIT WORK.", "CALL FUNCTION", "ASSIGN"];

/**
 * Animated canvas behind the roadmap: a particle network that reacts to the cursor and/or
 * falling-up ABAP code tokens. Adapted from the roadmap redesign prototype:
 * pauses while the tab is hidden or the mode is "none", uses fewer particles on small
 * screens, and eases its colour toward `tint` when the open path changes.
 */
export default function AnimatedBackground({ mode = "network", intensity = 0.7, tint = [94, 234, 177] }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const opts = useRef({ mode, intensity, tint });
  const wake = useRef<() => void>(() => {});
  useEffect(() => {
    opts.current = { mode, intensity, tint };
    wake.current();
  }, [mode, intensity, tint]);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    let W = 0, H = 0, raf = 0, last = performance.now();
    let pts: Point[] = [], toks: Token[] = [];
    const mouse = { x: -999, y: -999 };
    const cur = [...opts.current.tint];
    // next/font renames the family; read the generated name from the CSS variable.
    const mono = getComputedStyle(cv).getPropertyValue("--font-jetbrains").trim() || '"JetBrains Mono"';

    const newTok = (init: boolean): Token => ({ x: Math.random() * W, y: init ? Math.random() * H : H + 20, v: 8 + Math.random() * 22, s: 11 + Math.random() * 4, a: 0.05 + Math.random() * 0.12, t: WORDS[(Math.random() * WORDS.length) | 0] });
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(W < 700 ? 40 : 110, Math.floor((W * H) / 16000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 26, vy: (Math.random() - 0.5) * 26, r: Math.random() * 1.4 + 0.7 }));
      toks = Array.from({ length: Math.min(W < 700 ? 24 : 60, Math.floor(W / 26)) }, () => newTok(true));
    };
    const onMove = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -999; mouse.y = -999; };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const { mode, intensity: I, tint } = opts.current;
      for (let i = 0; i < 3; i++) cur[i] += (tint[i] - cur[i]) * Math.min(1, dt * 3);
      ctx.clearRect(0, 0, W, H);
      if (mode === "none") return; // stays paused until a prop change wakes it
      const col = `${cur[0] | 0},${cur[1] | 0},${cur[2] | 0}`;
      if (mode === "network" || mode === "both") {
        for (const p of pts) {
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
          if (d < 180 && d > 1) { p.x += (dx / d) * 18 * dt; p.y += (dy / d) * 18 * dt; }
        }
        ctx.lineWidth = 1;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          for (let j = i + 1; j < pts.length; j++) {
            const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 135) { ctx.strokeStyle = `rgba(${col},${(1 - d / 135) * 0.39 * I})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
          }
          const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (dm < 170) { ctx.strokeStyle = `rgba(${col},${(1 - dm / 170) * 0.6 * I})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
          ctx.fillStyle = `rgba(${col},${0.55 * I + 0.1})`; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.3); ctx.fill();
        }
      }
      if (mode === "code" || mode === "both") {
        for (const k of toks) {
          k.y -= k.v * dt;
          if (k.y < -20) Object.assign(k, newTok(false));
          ctx.font = `${k.s}px ${mono}, monospace`; ctx.fillStyle = `rgba(${col},${k.a * I * 1.6})`; ctx.fillText(k.t, k.x, k.y);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    wake.current = start;
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    start();
    return () => {
      stop();
      wake.current = () => {};
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="bg" aria-hidden="true" />;
}
