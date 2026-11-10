"use client";
// Modern ABAP lessons: Learn shows what you used to write, an arrow, and what you write now. Explore code builds the modern
// version part by part. Reference teaching models only: nothing runs in an SAP system. English only while ENABLE_ARABIC = false.
import { useTopicSession } from "@/lib/use-topic-session";
import { modernLessons } from "@/lib/modern-lessons";
import { oldNew, expressionsExplore, type Pair } from "@/lib/modern-old-new";
import "./modern-lessons.css";

const Line = ({ text }: { text: string }) => <>{text || " "}</>;
/** Marks the words that disappear (del) or the words that replace them (add). */
function Marked({ code, hot, kind }: { code: string; hot: string[]; kind: "del" | "add" }) {
  if (!hot.length) return <>{code}</>;
  const re = new RegExp("(" + hot.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "g");
  return <>{code.split(re).map((part, i) => i % 2 ? <mark key={i} className={`ml-${kind}`}>{part}</mark> : part)}</>;
}
const lines = (s: string) => s.split("\n").length;

function PairView({ p, go }: { p: Pair; go: boolean }) {
  return <>
    <div className="ml-pair" data-go={go || undefined}>
      <div className="ml-side" data-kind="old"><span className="ml-tag">Old way</span><pre className="ml-code" dir="ltr"><Marked code={p.old} hot={p.oldHot} kind="del" /></pre></div>
      <div className="ml-arrow" aria-hidden="true"><span>→</span><small>{p.label}</small></div>
      <div className="ml-side" data-kind="new"><span className="ml-tag">New way</span><pre className="ml-code" dir="ltr"><Marked code={p.nw} hot={p.newHot} kind="add" /></pre></div>
    </div>
    <div className="ml-why"><span>{p.why}</span><b>{p.gain}</b></div>
  </>;
}

/** Learn: each change as old way → new way, one at a time or all at once. */
export function OldNewSteps({ id }: { id: string }) {
  const { pairs, chips, lines: byLines } = oldNew[id];
  const [i, setI] = useTopicSession(`${id}:ml-step`, 0);
  const [all, setAll] = useTopicSession(`${id}:ml-all`, false);
  const [go, setGo] = useTopicSession(`${id}:ml-go`, true);
  const at = Math.min(i, pairs.length - 1);
  const oldLines = pairs.reduce((n, p) => n + lines(p.old), 0), newLines = pairs.reduce((n, p) => n + lines(p.nw), 0);
  const summary = byLines ? [`Old way: ${oldLines} lines`, `New way: ${newLines} lines`] : chips ?? [];
  return <section className="addition-pilot-lesson add-card" aria-labelledby={`${id}-oldnew`} data-lesson-oldnew>
    <span className="eyebrow">Old way → new way</span><h2 id={`${id}-oldnew`}>What you used to write, and what you write now</h2>
    <div className="ml-chips">{summary.map((c, k) => <span key={c} className="ml-chip" data-old={byLines && k === 0 || undefined}>{c}</span>)}</div>
    <div className="ml-modes" role="group" aria-label="View">
      <button type="button" className={all ? "secondary" : "primary"} aria-pressed={!all} onClick={() => { setAll(false); setGo(true); }}>One change at a time</button>
      <button type="button" className={all ? "primary" : "secondary"} aria-pressed={all} onClick={() => { setAll(true); setGo(false); }}>All changes</button>
    </div>
    {all ? pairs.map((p, k) => <div className="ml-block" key={p.title}><h3>{k + 1}. {p.title}</h3><PairView p={p} go={false} /></div>) : <>
      <ol className="ml-steps" aria-label="Changes">{pairs.map((p, k) => <li key={p.title}><button type="button" className="secondary" aria-current={k === at ? "step" : undefined} onClick={() => { setI(k); setGo(true); }}>{k + 1} · {p.title}</button></li>)}</ol>
      <PairView key={at} p={pairs[at]} go={go} />
      <div className="explore-actions"><button type="button" className="secondary" disabled={!at} onClick={() => { setI(at - 1); setGo(true); }}>← Back</button>
        <button type="button" className="primary" disabled={at === pairs.length - 1} onClick={() => { setI(at + 1); setGo(true); }}>Next change →</button>
        <span className="muted">Change {at + 1} of {pairs.length}</span></div></>}
  </section>;
}

/** Explore code: switch parts on and off. The status list explains wrong or incomplete combinations. */
export function ModernBuilder({ id }: { id: string }) {
  const l = modernLessons.find(x => x.id === id), e = l ? l.explore : expressionsExplore, boundary = l ? l.boundary : expressionsExplore.boundary;
  const [state, setState] = useTopicSession<Record<string, boolean>>(`${id}:ml-build`, Object.fromEntries(e.opts.map(o => [o.id, o.def])));
  const s = Object.fromEntries(e.opts.map(o => [o.id, state[o.id] ?? o.def])), r = e.build(s);
  return <section className="addition-pilot-lesson add-card" aria-labelledby={`${id}-build`} data-lesson-build>
    <span className="eyebrow">Explore code</span><h2 id={`${id}-build`}>Build it, part by part</h2>
    <p>{e.intro}</p><p className="pill guided-boundary">{boundary}</p>
    <div className="ml-two">
      <div className="ml-parts">{e.opts.map(o => <label className="ml-toggle" key={o.id}><input type="checkbox" checked={s[o.id]} onChange={ev => setState({ ...s, [o.id]: ev.target.checked })} />
        <span><b>{o.t}</b><br /><span className="muted">{o.benefit}</span></span></label>)}</div>
      <div className="ml-sub"><h3>What you have built</h3><pre className="ml-code" dir="ltr">{r.code.split("\n").map((t, i) => <span className="ml-l" key={i}><Line text={t} /></span>)}</pre>
        <ul className="ml-status" aria-live="polite">{r.status.map(([kind, text]) => <li key={text} data-kind={kind}>{kind === "ok" ? "✓ " : kind === "warn" ? "• " : "✗ "}{text}</li>)}</ul></div>
    </div>
  </section>;
}
