"use client";

// The "Add two numbers" layout for every other English lesson. Hand-written content lives in
// beginner-lessons.ts; the runner narrates the lesson's reviewed anatomy groups.
import { useMemo, useState, type ReactNode } from "react";
import { missions, orientation } from "@/lib/curriculum";
import { orientationExamples } from "@/lib/anatomy-content";
import { ui } from "@/lib/i18n";
import { treeCopy } from "@/lib/tree-copy";
import { educationContent } from "@/lib/education-content";
import { beginnerLessons, challengeBriefs } from "@/lib/beginner-lessons";
import { Quiz } from "./syntax-lab";
import { LessonFlow } from "./lesson-concepts";
import { getAnatomy } from "@/lib/anatomy-content";
import { simulate, type Memory, type MemoryValue } from "@/lib/engine";
import "./addition-lesson.css";

// Syntax Orientation is not a mission, so it gets the few mission fields these components read.
const orientationLesson = { id: "orientation", title: { en: ui.en.orientation }, goal: { en: treeCopy.en.orientationGoal }, example: orientationExamples.en, expected: "5\n8", tokens: orientation, guided: undefined, challenges: undefined };
const lessonOf = (id: string) => id === "orientation" ? orientationLesson : missions.find(m => m.id === id);
const trace = (source: string) => { try { return simulate(source); } catch { return null; } };
const shows = (source: string) => { const events = trace(source); return !events ? "an error" : events.at(-1)?.output.length ? events.at(-1)!.output.join(", then ") : "nothing"; };

/** One value as a beginner reads it: 5, 'Ahmed', {id: 101, name: Ahmed}, or one row per line. */
function show(value: MemoryValue): string {
  if (Array.isArray(value)) return value.length ? value.map(show).join("\n") : "(no rows)";
  if (value && typeof value === "object") return Object.entries(value).map(([k, v]) => `${k}: ${show(v as MemoryValue)}`).join(", ");
  return value === "" ? "(empty)" : String(value);
}
const kind = (value: MemoryValue) => Array.isArray(value) ? `table · ${value.length} row${value.length === 1 ? "" : "s"}` : value && typeof value === "object" ? "record" : typeof value === "number" ? "number" : "text";

export function LessonStart({ id }: { id: string }) {
  const m = lessonOf(id), b = beginnerLessons[id], content = educationContent[id];
  if (!m || !b || !content) return null;
  return <section className="addition-pilot-lesson add-card add-hero" aria-labelledby={`${id}-start`} data-lesson-start>
    <span className="eyebrow">Start here</span>
    <h2 id={`${id}-start`}>{m.title.en}</h2>
    <p>{content.what.en}</p>
    {b.goal && <div className="add-goal" aria-label={`The program you will read takes ${b.goal.give} and shows ${b.goal.shows}`}>
      <div><small>You give it</small><strong>{b.goal.give}</strong></div><span aria-hidden="true">→</span>
      <div><small>It shows</small><strong>{b.goal.shows}</strong></div>
    </div>}
    <ol className="add-ideas" aria-label="Ideas in this lesson">{b.ideas.map(([title, text]) => <li key={title}><strong>{title}</strong>{text}</li>)}</ol>
    <p className="add-why"><strong>Why it matters:</strong> {content.why.en}</p>
  </section>;
}

/** Colours ABAP words so a beginner can tell keywords, names and numbers apart (as on Add two numbers). */
function Highlight({ text }: { text: string }) {
  return text.split(/(\s+|[.,:=+()])/).map((part, i) => <span key={i} className={
    /^[A-Z][A-Z-]+$/.test(part) ? "kw" : /^-?\d+$/.test(part) ? "num" : /^(l[vst]_|<)/.test(part) ? "var" : /^[.,:=+]$/.test(part) ? "op" : undefined}>{part}</span>);
}
const wholeNumber = /^-?\d{1,6}$/;
const valueLine = /^([ \t]*DATA[ \t]+(\w+)[ \t]+TYPE[ \t]+i[ \t]+VALUE[ \t]+)(-?\d+)\./;
const kindLabel = (value: MemoryValue) => typeof value === "number" ? "whole number" : kind(value);

export function LessonRunner({ id, code: example }: { id: string; code: string }) {
  const m = lessonOf(id);
  const doc = useMemo(() => { try { return getAnatomy(id, example); } catch { return null; } }, [id, example]);
  // Number inputs for every "DATA x TYPE i VALUE n." line, like the two inputs on Add two numbers.
  const inputs = useMemo(() => example.split("\n").flatMap((line, i) => { const v = line.match(valueLine); return v ? [{ line: i, name: v[2], start: v[3] }] : []; }), [example]);
  const [nums, setNums] = useState<Record<string, string>>({});
  const [raw, setRaw] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [failed, setFailed] = useState(false);
  // A stage chosen with the stage buttons; cleared by Back / Run next line.
  const [picked, setPicked] = useState<number | null>(null);
  const withValues = (values: Record<string, string>) => example.split("\n").map((line, i) => {
    const input = inputs.find(x => x.line === i);
    return input && values[input.name] !== undefined ? line.replace(valueLine, (_, head: string) => `${head}${values[input.name]}.`) : line;
  }).join("\n");
  const code = withValues(nums);
  const events = useMemo(() => m?.guided ? null : trace(code), [m, code]);
  if (!m || !doc) return null;
  const finalNames = Object.keys(events?.at(-1)?.memory ?? {});
  const groups = doc.groups;
  const groupOf = (line: number) => groups.findIndex(g => g.range.startLine <= line && line <= g.range.endLine);
  // Runnable lessons step one executed statement at a time; reference lessons step one part at a time.
  const total = events ? events.length : groups.length;
  const event = events && step ? events[step - 1] : undefined;
  const overlaps = (e: { range: { startLine: number; endLine: number } }, g: (typeof groups)[number]) => e.range.startLine <= g.range.endLine && e.range.endLine >= g.range.startLine;
  const gi = picked ?? (events ? (event ? groupOf(event.range.startLine) : -1) : step - 1);
  const group = gi >= 0 ? groups[gi] : undefined;
  const memory: Memory = event?.memory ?? {};
  const words = (group?.syntaxRefs ?? []).map(ref => m.tokens.find(t => t.id === ref)).filter(t => t !== undefined);
  const covers = (line: number, from: number, to: number) => from <= line && line <= to;
  // A picked stage that no executed line touches is skipped with these values (for example IF with a false condition).
  const skipped = picked !== null && !!events && !events.some(e => overlaps(e, groups[picked]));
  const lineState = (line: number) => picked !== null
    ? covers(line, groups[picked].range.startLine, groups[picked].range.endLine) ? "active" : line < groups[picked].range.startLine ? "done" : "todo"
    : events
    ? event && covers(line, event.range.startLine, event.range.endLine) ? "active" : events.slice(0, step).some(e => covers(line, e.range.startLine, e.range.endLine)) ? "done" : "todo"
    : group && covers(line, group.range.startLine, group.range.endLine) ? "active" : group && line < group.range.startLine ? "done" : "todo";
  const jump = (index: number) => {
    const g = groups[index], hit = events ? events.findIndex(e => overlaps(e, g)) : index;
    setPicked(index);
    setStep(hit >= 0 ? hit + 1 : events!.filter(e => e.range.startLine < g.range.startLine).length);
  };
  const go = (next: number) => { setPicked(null); setStep(next); };
  const edit = (name: string, text: string) => {
    setRaw(v => ({ ...v, [name]: text }));
    if (!wholeNumber.test(text)) return;
    const next = { ...nums, [name]: text };
    // A value can make the program fail (for example an endless loop); keep the last working numbers.
    const ok = trace(withValues(next)) !== null;
    setFailed(!ok);
    if (ok) { setNums(next); setPicked(null); setStep(s => Math.min(s, trace(withValues(next))!.length)); }
  };
  const invalid = Object.values(raw).some(text => !wholeNumber.test(text));
  const shown = code.split("\n").map((text, i) => ({ text, line: i + 1 })).filter(l => l.text.trim());
  const nextLabel = events ? "Run next line" : "Next part";
  return <section className="addition-pilot-lesson add-card" aria-labelledby={`${id}-run`} data-lesson-runner>
    <span className="eyebrow">Watch it run</span>
    <h2 id={`${id}-run`}>{events ? "Run the program one line at a time" : "Read the code one part at a time"}</h2>
    {m.guided && <><p className="pill guided-boundary">{m.guided.boundary.en}</p><p className="muted">This is reference code for a real SAP system, so it is explained part by part instead of run in the browser.</p></>}
    <ol className="add-phases beg-phases" aria-label="Program stages">
      {groups.map((g, i) => <li key={g.id}><button type="button" aria-current={i === gi ? "step" : undefined} data-done={gi > i}
        onClick={() => jump(i)}><span aria-hidden="true">{i + 1}</span>{g.title.en}</button></li>)}
    </ol>
    {events && inputs.length > 0 && <div className="add-inputs">
      {inputs.map(x => <label key={x.name}>{x.name}<input inputMode="numeric" value={raw[x.name] ?? x.start} aria-invalid={raw[x.name] !== undefined && !wholeNumber.test(raw[x.name])} onChange={e => edit(x.name, e.target.value)} /></label>)}
      {invalid ? <p className="add-error" role="alert">Enter whole numbers only, up to 6 digits. The program keeps the last valid numbers.</p>
        : failed ? <p className="add-error" role="alert">With that number the program stops with an error. It keeps the last numbers that worked.</p>
        : <p className="add-hint">Try your own numbers. The code, the boxes and the screen all follow.</p>}
    </div>}
    <div className="add-run">
      <div>
        <pre className="add-code" dir="ltr" translate="no" aria-label="ABAP program">{shown.map(({ text, line }, i) =>
          <span key={line} data-state={lineState(line)}><span className="ln" aria-hidden="true">{i + 1}</span><span><Highlight text={text} /></span></span>)}</pre>
        <p className="add-say" aria-live="polite">{group ? <><strong>{group.title.en}.</strong> {group.explanation.en}</> : `Nothing has run yet. Press “${nextLabel}” to start.`}</p>
        {skipped && <p className="add-hint">With these values this part does not run, so memory and the screen do not change here.</p>}
        {group && inputs.some(x => nums[x.name] !== undefined && nums[x.name] !== x.start) && <p className="add-hint">This explanation uses the lesson’s original numbers. The memory boxes and the screen show yours.</p>}
        {words.length > 0 && <dl className="add-words" aria-label="This part, word by word">{words.map(t =>
          <div key={t.id}><dt><code dir="ltr">{t.label}</code></dt><dd>{t.meaning.en}</dd></div>)}</dl>}
      </div>
      {events && <div className="add-side">
        <figure className="beg-memory" aria-label="Memory: the program's boxes">
          <figcaption className="eyebrow">Memory</figcaption>
          {finalNames.map(name => name in memory
            ? <div className="add-box" key={event!.changed.includes(name) ? `${name}-${step}` : name} data-changed={event!.changed.includes(name)}><code>{name}</code><strong dir="ltr">{show(memory[name])}</strong><small>{kindLabel(memory[name])}</small></div>
            : <div className="add-box" data-empty key={name}><code>{name}</code><strong>–</strong><small>not created yet</small></div>)}
        </figure>
        <section className="add-screen" aria-label="Screen">
          <span className="eyebrow">Screen</span>
          {event?.output.length ? <pre dir="ltr">{event.output.join("\n")}</pre> : <p>Nothing on the screen yet.</p>}
        </section>
      </div>}
    </div>
    <div className="add-controls">
      <button type="button" onClick={() => go(step - 1)} disabled={!step}><span aria-hidden="true">← </span>Back</button>
      <span className="add-progress">{skipped && group ? `Skipped with these values · ${group.title.en}` : group && (step || !events) ? `${events ? "Line" : "Part"} ${step} of ${total} · ${group.title.en}` : events ? "Ready to run" : "Ready"}</span>
      <button type="button" className="primary" onClick={() => go(step === total ? 0 : step + 1)}>{step === total ? "Start over" : nextLabel}</button>
    </div>
  </section>;
}

export function LessonMistakes({ id }: { id: string }) {
  const list = beginnerLessons[id]?.mistakes;
  if (!list) return null;
  return <section className="addition-pilot-lesson add-card" aria-labelledby={`${id}-mistakes`} data-lesson-mistakes>
    <span className="eyebrow">Avoid these</span>
    <h2 id={`${id}-mistakes`}>Three common beginner mistakes</h2>
    <div className="add-mistakes">{list.map(x => <article key={x.title}>
      <h3>{x.title}</h3>
      <small className="add-bad">✗ Wrong</small><pre dir="ltr" data-kind="wrong">{x.wrong}</pre>
      <small className="add-good">✓ Right</small><pre dir="ltr" data-kind="right">{x.right}</pre>
      <p>{x.why}</p>
    </article>)}</div>
  </section>;
}

/** Remember: the lesson in one line, its key ideas, then one quick check. */
export function LessonRemember({ id, onExplore }: { id: string; onExplore: () => void }) {
  const b = beginnerLessons[id], content = educationContent[id];
  if (!b || !content) return null;
  return <>
    <section className="addition-pilot-lesson add-card" aria-labelledby={`${id}-remember`} data-lesson-remember>
      <span className="eyebrow">Remember</span><h2 id={`${id}-remember`}>The whole lesson in one line</h2>
      <LessonFlow id={id} />
      <ul className="add-keys">{content.concepts.map(c => <li data-concept={`${id}/${c.id}`} key={c.id}><strong>{c.name.en}:</strong> {c.explanation.en}</li>)}</ul>
      <Quiz sessionKey={`${id}:step-check`} lang="en" question={b.check.question} options={b.check.options} answer={b.check.answer} explanation={b.check.explanation} onCorrect={() => {}} />
    </section>
    <div className="addition-pilot-lesson addition-pilot-next"><p className="muted">Next: change this code yourself, then try the challenge.</p><button className="primary" onClick={onExplore}>Explore this code →</button></div>
  </>;
}

export function LessonExplore({ id, code, children }: { id: string; code: string; children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState<number | null>(null);
  const experiments = beginnerLessons[id]?.experiments;
  // SAP-only lessons cannot run, so their card holds the design explorer instead of experiments.
  if (!experiments?.length) return <section className="addition-pilot-lesson add-card addition-pilot-sandbox" aria-labelledby={`${id}-explore`} data-lesson-explore>
    <span className="eyebrow">Explore code</span>
    <h2 id={`${id}-explore`}>Explore how the parts fit together</h2>
    <p>This code needs a real SAP system, so here you explore its parts instead of running it. Pick a part to see what it does and what it connects to.</p>
    {children}
  </section>;
  // Experiments edit the learner's current code, so the answer follows their own values.
  const e = experiments[index], change = code.includes(e.from) ? e : null;
  const edited = change && code.replace(e.from, e.to);
  const go = (next: number) => { setIndex(next); setRevealed(null); };
  return <section className="addition-pilot-lesson add-card addition-pilot-sandbox" aria-labelledby={`${id}-explore`} data-lesson-experiments data-lesson-explore>
    <span className="eyebrow">Explore code</span>
    <h2 id={`${id}-explore`}>Now change the program yourself</h2>
    <p>Guess the result first. Then make the change in the editor below and press <strong>Build trace</strong> to check.</p>
    <div className="add-exp" aria-live="polite">
      <p className="add-exp-head">Experiment {index + 1} of {experiments.length} · <strong>{e.title}</strong></p>
      {change && edited ? <>
        <div className="add-exp-change">
          <div><small>Change this</small><pre dir="ltr">{change.from}</pre></div><span aria-hidden="true">→</span>
          <div><small>To this</small><pre dir="ltr">{change.to}</pre></div>
        </div>
        <p className="add-exp-ask">{e.ask ?? "What will the screen show now?"}</p>
        {revealed === index ? <div className="add-exp-answer">
          <p>{e.why}</p>
          <p className="add-exp-result">Screen before: <strong>{shows(code)}</strong> <span aria-hidden="true">→</span> after: <strong>{shows(edited)}</strong></p>
        </div> : <button type="button" onClick={() => setRevealed(index)}>Show answer</button>}
      </> : <p className="add-exp-missing">Your code no longer has the line this experiment changes. Press <strong>Reset code</strong> to bring the original program back.</p>}
      <div className="add-exp-nav">
        <button type="button" disabled={!index} onClick={() => go(index - 1)}><span aria-hidden="true">← </span>Previous</button>
        <button type="button" disabled={index === experiments.length - 1} onClick={() => go(index + 1)}>Next experiment<span aria-hidden="true"> →</span></button>
      </div>
    </div>
    <p className="muted">The experiments follow the code in your editor. Press <strong>Reset code</strong> to go back to the original.</p>
    {children}
  </section>;
}

export function LessonChallengeIntro({ id, onLearn, onExplore }: { id: string; onLearn: () => void; onExplore: () => void }) {
  const m = lessonOf(id), b = beginnerLessons[id], brief = challengeBriefs[id];
  if (!m || !b) return null;
  return <div className="addition-pilot-lesson add-learn" data-lesson-challenge>
    <section className="add-card add-hero" aria-labelledby={`${id}-mission`}>
      <span className="eyebrow">Your mission</span>
      <h2 id={`${id}-mission`}>{b.challenge.title}</h2>
      <p>{brief?.intro ?? m.goal.en}</p>
      {brief?.boxes && <div className="add-goal">{brief.boxes.map((x, i) => typeof x === "string"
        ? <span key={i} aria-hidden="true">{x}</span>
        : <div key={i}><small>{x[0]}</small><strong dir="ltr">{x[1]}</strong></div>)}</div>}
    </section>
    <div className="add-brief">
    <section className="add-card" aria-labelledby={`${id}-checklist`}>
      <h3 id={`${id}-checklist`}>Your program must</h3>
      <ol className="add-checklist">{b.challenge.must.map(x => <li key={x}>{x}</li>)}</ol>
    </section>
    <section className="add-card" aria-labelledby={`${id}-how`}>
      <h3 id={`${id}-how`}>How to work</h3>
      <ol className="add-checklist">{m.guided
        ? <><li>Read each decision and choose the answer that fits the SAP design.</li><li>Press <strong>Check decisions</strong>. Use Learn and Explore code if you are unsure.</li><li>When every decision is right, press <strong>Complete mission</strong>.</li></>
        : <><li>{brief?.start ?? "Start from the code in the editor."}</li><li>Press <strong>Build trace</strong> to run it and watch memory change.</li><li>Press <strong>Check challenge</strong> when the output is right.</li><li>Then press <strong>Complete mission</strong>.</li></>}
      </ol>
    </section>
    </div>
    <details className="add-card add-stuck"><summary>Stuck? Open one hint at a time</summary>
      {b.challenge.hints.map((h, i) => <details key={i}><summary>Hint {i + 1}</summary><p>{h}</p></details>)}
    </details>
    <p className="add-help">Need a refresher? <button className="text-button" onClick={onLearn}>Watch it run on Learn</button> · <button className="text-button" onClick={onExplore}>Experiment on Explore code</button></p>
  </div>;
}
