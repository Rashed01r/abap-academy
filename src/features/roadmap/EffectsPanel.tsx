"use client";
import type { RoadmapCopy } from "@/lib/tree-copy";
import type { BackgroundMode } from "./AnimatedBackground";

export type Effects = { mode: BackgroundMode; aurora: boolean; grid: boolean; flow: boolean; intensity: number };

export const EFFECTS_KEY = "abap2-roadmap-effects";
export const defaultEffects = (reduceMotion: boolean): Effects =>
  reduceMotion
    ? { mode: "none", aurora: false, grid: false, flow: false, intensity: 0.7 }
    : { mode: "network", aurora: true, grid: true, flow: true, intensity: 0.7 };

/** Reads saved effect settings; anything invalid falls back to the defaults. */
export function readEffects(reduceMotion: boolean): Effects {
  const base = defaultEffects(reduceMotion);
  try {
    const v = JSON.parse(localStorage.getItem(EFFECTS_KEY) || "null");
    if (!v || typeof v !== "object") return base;
    return {
      mode: ["network", "code", "both", "none"].includes(v.mode) ? v.mode : base.mode,
      aurora: typeof v.aurora === "boolean" ? v.aurora : base.aurora,
      grid: typeof v.grid === "boolean" ? v.grid : base.grid,
      flow: typeof v.flow === "boolean" ? v.flow : base.flow,
      intensity: typeof v.intensity === "number" && v.intensity >= 0.2 && v.intensity <= 1 ? v.intensity : base.intensity,
    };
  } catch {
    return base;
  }
}

export function EffectsPanel({ open, onToggle, effects, onChange, c }: {
  open: boolean; onToggle: () => void; effects: Effects; onChange: (e: Effects) => void; c: RoadmapCopy;
}) {
  const set = (patch: Partial<Effects>) => onChange({ ...effects, ...patch });
  const modes: [BackgroundMode, string][] = [["network", c.network], ["code", c.codeRain], ["both", c.both], ["none", c.none]];
  return <>
    <div className={`fx${open ? " open" : ""}`} id="roadmap-effects" role="dialog" aria-label={c.effectsTitle} hidden={!open}>
      <h3>{c.effectsTitle}</h3>
      <p>{c.effectsIntro}</p>
      <fieldset className="seg">
        <legend className="sr-only">{c.mode}</legend>
        {modes.map(([value, label]) => <label key={value}>
          <input type="radio" name="roadmap-fx-mode" value={value} checked={effects.mode === value} onChange={() => set({ mode: value })} />
          <span>{label}</span>
        </label>)}
      </fieldset>
      <label className="chk"><input type="checkbox" checked={effects.aurora} onChange={e => set({ aurora: e.target.checked })} /> {c.aurora}</label>
      <label className="chk"><input type="checkbox" checked={effects.grid} onChange={e => set({ grid: e.target.checked })} /> {c.grid}</label>
      <label className="chk"><input type="checkbox" checked={effects.flow} onChange={e => set({ flow: e.target.checked })} /> {c.flow}</label>
      <label className="chk" style={{ flexDirection: "column", alignItems: "stretch", gap: 4 }}>
        {c.intensity}
        <input type="range" min={20} max={100} value={Math.round(effects.intensity * 100)} onChange={e => set({ intensity: Number(e.target.value) / 100 })} />
      </label>
    </div>
    <button type="button" className="fxbtn" aria-expanded={open} aria-controls="roadmap-effects" onClick={onToggle}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 3l2.2 5.6L20 11l-5.8 2.4L12 19l-2.2-5.6L4 11l5.8-2.4z" /></svg>
      {c.effects}
    </button>
  </>;
}
