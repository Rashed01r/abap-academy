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
  // Short code-style names on screen; the full names stay for screen readers.
  const modes: [BackgroundMode, string, string][] = [["network", "network", c.network], ["code", "rain", c.codeRain], ["both", "both", c.both], ["none", "none", c.none]];
  const flags: ["aurora" | "grid" | "flow", string, string][] = [["aurora", "aurora_glow", c.aurora], ["grid", "grid_drift", c.grid], ["flow", "flow_connectors", c.flow]];
  return <>
    <div className={`fx${open ? " open" : ""}`} id="roadmap-effects" role="dialog" aria-label={c.effectsTitle} hidden={!open}>
      <div className="fx-tb"><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><h3>effects.config</h3>
        <button type="button" aria-label={c.close} onClick={onToggle}>✕</button></div>
      <div className="fx-body">
        <p className="fx-cm">&quot; {c.effectsIntro}</p>
        <fieldset className="seg">
          <legend><b>mode</b> =<span className="sr-only"> {c.mode}</span></legend>
          {modes.map(([value, short, label]) => <label key={value} title={label}>
            <input type="radio" name="roadmap-fx-mode" value={value} aria-label={label} checked={effects.mode === value} onChange={() => set({ mode: value })} />
            <span aria-hidden="true">{short}</span>
          </label>)}
        </fieldset>
        <div className="fx-flags">{flags.map(([key, name, label]) => <label className="chk" key={key}>
          <input type="checkbox" checked={effects[key]} onChange={e => set({ [key]: e.target.checked })} />
          <span className="box" aria-hidden="true">{effects[key] ? "[x]" : "[ ]"}</span>
          <span className="nm" aria-hidden="true">{name}</span><span className="sr-only">{label}</span>
          <span className="val" aria-hidden="true">{effects[key] ? "abap_true" : "abap_false"}</span>
        </label>)}</div>
        <label className="fx-rng">
          <span><b>intensity</b> =<span className="sr-only"> {c.intensity}</span></span>
          <span className="row">
            <input type="range" min={20} max={100} value={Math.round(effects.intensity * 100)} onChange={e => set({ intensity: Number(e.target.value) / 100 })} />
            <output aria-hidden="true">{Math.round(effects.intensity * 100)}</output>
          </span>
        </label>
      </div>
      <div className="fx-foot" aria-hidden="true"><span>● live preview</span><span>saved on this device</span></div>
    </div>
    <button type="button" className="fxbtn" aria-expanded={open} aria-controls="roadmap-effects" onClick={onToggle}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>
      <span className="fx-name">{c.effects}</span><kbd aria-hidden="true">E</kbd>
    </button>
  </>;
}
