"use client";
// ABAP Cloud and RAP lessons: Learn side panel (layer stack that grows + a try-it), Explore code (four-step designer with a
// live rail) and Challenge (code review). Data per lesson is in src/lib/cloud-content.ts. English only while ENABLE_ARABIC = false.
// Teaching models only: nothing is activated, released-checked or published in an SAP system.
import { useState, type ReactNode } from "react";
import { useTopicSession } from "@/lib/use-topic-session";
import { cloudLessons } from "@/lib/cloud-content";
import { StepLab, Box } from "./dictionary-labs";
import "./cloud-lessons.css";

const Panel = ({ title, children }: { title: string; children: ReactNode }) => <section className="dict-panel" aria-label={title}><span className="eyebrow">{title}</span>{children}</section>;

/** Learn: `part` is the active stage (0-based), or -1 before Next part is pressed. */
export function CloudPanel({ id, part }: { id: string; part: number }) {
  const d = cloudLessons[id];
  const [picked, setPicked] = useState<Record<number, number>>({});
  return <>
    <Panel title="What exists now">
      {part < 0 ? <p className="dict-empty">Nothing built yet. Press “Next part” to start.</p>
        : <ol className="cl2-stack">{d.layers.map(([n, w], i) => <li key={n} data-on={i <= part || undefined} data-now={i === part || undefined}><b>{n}</b><small>{w}</small></li>)}</ol>}
    </Panel>
    {d.tries.filter(x => x.part === part).map(x => { const at = picked[x.part] ?? 0, o = x.options[at]; return <Panel key={x.title} title={x.title}>
      <div className="dict-choices">{x.options.map(([label], k) => <button type="button" key={label} aria-pressed={at === k} onClick={() => setPicked(p => ({ ...p, [x.part]: k }))}>{label}</button>)}</div>
      <p className="muted" role="status" data-kind={o[2]}>{o[1]}</p></Panel>; })}
    {d.notes.filter(x => x.part === part).map(x => <Panel key={x.title} title={x.title}>
      {x.code && <pre className="dict-code" dir="ltr">{x.code}</pre>}<p className="muted">{x.text}</p></Panel>)}
  </>;
}

/** Explore code: one choice per step; the rail shows the design and whether it would publish. */
export function CloudLab({ id }: { id: string }) {
  const { lab } = cloudLessons[id], steps = lab.steps;
  const [pick, setPick] = useTopicSession<number[]>(`${id}:lab-pick`, steps.map(() => 0));
  const at = (i: number) => pick[i] ?? 0;
  const ok = steps.map((s, i) => s.opts[at(i)][2]), all = ok.every(Boolean);
  const set = (i: number, k: number) => setPick(p => steps.map((_, j) => (j === i ? k : p[j] ?? 0)));
  return <StepLab label={lab.label} sessionKey={`${id}:lab`}
    steps={steps.map((s, i) => ({
      name: s.name, hint: s.hint, title: s.title, intro: s.intro, valid: ok[i],
      body: <div className="dd-choices" role="radiogroup" aria-label={s.title}>{s.opts.map(([text, note, good], k) =>
        <label key={text} data-on={at(i) === k || undefined}><input type="radio" name={`${id}-${i}`} checked={at(i) === k} onChange={() => set(i, k)} />
          <span><b>{text}</b><small>{note}</small></span><em data-good={good || undefined}>{good ? "sound" : "risky"}</em></label>)}</div>,
    }))}
    rail={<Box title="Live design">
      <div className="dd-head"><span className="dd-pill" data-ok={all}>{all ? "Ready to publish" : "Problems found"}</span></div>
      <pre dir="ltr">{steps.map((s, i) => ok[i] ? s.code : `// ⚠ ${s.name}: ${s.opts[at(i)][0]}\n//   ${s.opts[at(i)][1]}`).join("\n\n")}</pre>
      <p className="muted">A teaching model: nothing is activated or published here.</p></Box>} />;
}

/** Challenge: flag every line that breaks the rules, then submit. */
export function CloudReview({ id, completed, onResult, onLearn, onExplore }: { id: string; completed: boolean; onResult: (passed: boolean) => void; onLearn: () => void; onExplore: () => void }) {
  const r = cloudLessons[id].review;
  const [flags, setFlags] = useTopicSession<number[]>(`${id}:review-flags`, []);
  const [sent, setSent] = useTopicSession(`${id}:review-sent`, false);
  const exact = r.lines.every(([, bad], i) => bad === flags.includes(i));
  const toggle = (i: number) => { setSent(false); setFlags(f => (f.includes(i) ? f.filter(x => x !== i) : [...f, i])); };
  return <div className="addition-pilot-lesson add-learn dc" data-lesson-challenge>
    <section className="add-card add-hero dc-hero" aria-labelledby={`${id}-mission`}>
      <div><span className="eyebrow">Your mission</span><h2 id={`${id}-mission`}>{r.title}</h2><p>{r.intro}</p></div>
      <div className="dc-xp"><b>{r.xp} XP</b><span>{flags.length} flagged</span></div>
    </section>
    <p className="pill guided-boundary">Review reasoning only. Release state and syntax differ by product and release: always confirm in your own system.</p>
    <section className="add-card" aria-label="Code review">
      <span className="eyebrow">{r.file}</span>
      <ol className="cr-lines" dir="ltr">{r.lines.map(([code, bad, why], i) => {
        const on = flags.includes(i), state = sent ? (bad && on ? "hit" : bad !== on ? "miss" : on ? "hit" : undefined) : on ? "flag" : undefined;
        return <li key={code}><button type="button" aria-pressed={on} data-state={state} onClick={() => toggle(i)}><span aria-hidden="true">{on ? "⚑" : i + 1}</span><code>{code}</code></button>
          {sent && (bad || on) && <p className="muted" data-state={state}>{bad ? (on ? "✓ " : "✗ Missed: ") + why : "✗ This line is fine."}</p>}</li>;
      })}</ol>
      <div className="explore-actions"><button type="button" className="primary" onClick={() => { setSent(true); onResult(exact); }}>Submit review</button>
        <button type="button" className="secondary" onClick={() => { setFlags([]); setSent(false); }}>Reset</button></div>
      {sent && <p role="status" data-testid="guided-result" className={exact ? "success-text" : "error-text"}>{exact ? "Review passed: every violation found, no false alarms. Complete the mission to finish." : "Not yet. Check the notes under each line, then adjust your flags and submit again."}</p>}
      {completed && <p className="muted">Assessment achievement saved.</p>}
    </section>
    <p className="add-help">Need a refresher? <button className="text-button" onClick={onLearn}>Watch it on Learn</button> · <button className="text-button" onClick={onExplore}>Experiment on Explore code</button></p>
  </div>;
}
