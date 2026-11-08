"use client";

import { Fragment, useMemo, useState } from "react";
import { missions } from "@/lib/curriculum";
import { educationContent } from "@/lib/education-content";
import { simulate, type Memory } from "@/lib/engine";
import { Quiz } from "./syntax-lab";
import { LearningWorkspace } from "./learning-workspace";
import { LessonFlow } from "./lesson-concepts";
import "./addition-lesson.css";

const mission = missions.find(m => m.id === "addition")!;
const content = educationContent.addition;
const start = simulate(mission.example);
const defaults = { a: Number(start[0].memory.lv_first), b: Number(start[1].memory.lv_second) };
const names = Object.keys(start.at(-1)!.memory);
/** The example with the learner's numbers in its two VALUE additions. */
const withValues = (a: number, b: number) => { let n = 0; return mission.example.replace(/VALUE -?\d+/g, v => n < 2 ? `VALUE ${[a, b][n++]}` : v); };
const wholeNumber = /^-?\d{1,6}$/;
const phases = ["Prepare the values", "Calculate and store", "Display the result"];
const phaseOf = [0, 0, 0, 1, 2];
const v = (m: Memory, name: string) => String(m[name]);
// One plain-English guide per statement of the example (the engine test pins it at 5 statements).
const guide: ((m: Memory) => { say: string; words: [string, string][] })[] = [
  m => ({ say: `Create a box named lv_first that holds a whole number, and put ${v(m, "lv_first")} in it.`, words: [
    ["DATA", "create a variable: a named box in memory"], ["lv_first", "the box’s name, chosen by you"],
    ["TYPE i", "the box holds whole numbers (i = integer)"], [`VALUE ${v(m, "lv_first")}`, "the number placed in the box at the start"], [".", "the period ends the instruction"]] }),
  m => ({ say: `Create a second box, lv_second, and put ${v(m, "lv_second")} in it.`, words: [
    ["DATA", "create another variable"], ["lv_second", "its name"], ["TYPE i", "whole numbers only"],
    [`VALUE ${v(m, "lv_second")}`, "its starting number"], [".", "end of the instruction"]] }),
  () => ({ say: "Create a third box, lv_result, for the answer. No VALUE is given, so it starts at 0.", words: [
    ["DATA", "create the answer box"], ["lv_result", "its name"], ["TYPE i", "whole numbers only"],
    ["no VALUE", "so the box starts at 0"], [".", "end of the instruction"]] }),
  m => ({ say: `Add ${v(m, "lv_first")} and ${v(m, "lv_second")}, then put the total, ${v(m, "lv_result")}, into lv_result. The first two boxes keep their numbers.`, words: [
    ["lv_result", "the box that receives the total"], ["=", "put the result into the box on the left (it does not mean “is equal to”)"],
    ["lv_first + lv_second", "calculated first: read both boxes and add them"], [".", "end of the instruction"]] }),
  m => ({ say: `Show the number stored in lv_result on the screen: ${v(m, "lv_result")}. Showing a value does not change it.`, words: [
    ["WRITE", "show something on the screen"], ["lv_result", "what to show: the number stored in this box"], [".", "end of the instruction"]] }),
];
const mistakes = [
  { title: "Forgetting the period", wrong: "WRITE lv_result", right: "WRITE lv_result.", why: "Every ABAP instruction ends with a period. Starting a new line does not end it." },
  { title: "Putting the sum on the left", wrong: "lv_first + lv_second = lv_result.", right: "lv_result = lv_first + lv_second.", why: "The box that receives the answer goes on the left of =. The calculation goes on the right." },
  { title: "Using a box before creating it", wrong: "lv_result = lv_first + lv_second.\nDATA lv_result TYPE i.", right: "DATA lv_result TYPE i.\nlv_result = lv_first + lv_second.", why: "A line can only use a variable that a DATA line above it has already created." },
];

/** Colours ABAP words so a beginner can tell keywords, names and numbers apart. */
function Highlight({ text }: { text: string }) {
  return text.split(/(\s+|[.=+])/).map((part, i) => <span key={i} className={
    /^(DATA|TYPE|VALUE|WRITE)$/.test(part) ? "kw" : /^-?\d+$/.test(part) ? "num" : /^lv_/.test(part) ? "var" : /^[.=+]$/.test(part) ? "op" : undefined}>{part}</span>);
}

/** Limited pilot: the other lessons retain their current presentation. */
export function AdditionLearn({ onExplore }: { onExplore: () => void }) {
  const [step, setStep] = useState(0);
  const [nums, setNums] = useState(defaults);
  const [raw, setRaw] = useState({ a: String(defaults.a), b: String(defaults.b) });
  const code = useMemo(() => withValues(nums.a, nums.b), [nums]);
  const events = useMemo(() => simulate(code), [code]);
  const event = step ? events[step - 1] : undefined;
  const memory: Memory = event?.memory ?? {};
  const info = event && guide[step - 1](memory);
  const invalid = !wholeNumber.test(raw.a) || !wholeNumber.test(raw.b);
  const edit = (key: "a" | "b", text: string) => {
    setRaw(r => ({ ...r, [key]: text }));
    if (wholeNumber.test(text)) setNums(n => ({ ...n, [key]: Number(text) }));
  };
  // Blank lines are hidden so line numbers match "Line N of 5".
  const shown = code.split("\n").map((text, i) => ({ text, line: i + 1 })).filter(l => l.text.trim());
  const covers =(e: (typeof events)[number], line: number) => e.range.startLine <= line && line <= e.range.endLine;
  const lineState = (line: number) => event && covers(event, line) ? "active" : events.slice(0, step).some(e => covers(e, line)) ? "done" : "todo";

  return <div className="addition-pilot-lesson add-learn" data-addition-learn>
    <section className="add-card add-hero" aria-labelledby="add-start">
      <span className="eyebrow">Start here</span>
      <h2 id="add-start">Your first program: add two numbers</h2>
      <p>ABAP is the programming language inside SAP systems, the business software many companies use for stock, sales and finance. A program is a list of instructions that the computer follows from top to bottom, one at a time.</p>
      <p>{content.what.en}</p>
      <div className="add-goal" aria-label={`The program you will read takes ${defaults.a} and ${defaults.b} and shows ${String(start.at(-1)!.memory.lv_result)}`}>
        <div><small>You give it</small><strong>{defaults.a} and {defaults.b}</strong></div><span aria-hidden="true">→</span>
        <div><small>It shows</small><strong>{String(start.at(-1)!.memory.lv_result)}</strong></div>
      </div>
      <ol className="add-ideas" aria-label="Three ideas in this lesson">
        <li><strong>A variable is a labelled box.</strong>It has a name and holds one value.</li>
        <li><strong>= fills the box on the left.</strong>The right side is calculated first.</li>
        <li><strong>WRITE shows a value.</strong>It reads the box without changing it.</li>
      </ol>
      <p className="add-why"><strong>Why it matters:</strong> {content.why.en}</p>
    </section>

    <section className="add-card" aria-labelledby="add-run">
      <span className="eyebrow">Watch it run</span>
      <h2 id="add-run">Run the program one line at a time</h2>
      <ol className="add-phases" aria-label="Program stages">
        {phases.map((phase, i) => <li key={phase}><button type="button" aria-current={event && phaseOf[step - 1] === i ? "step" : undefined}
          data-done={!!event && phaseOf[step - 1] > i} onClick={() => setStep(phaseOf.indexOf(i) + 1)}><span aria-hidden="true">{i + 1}</span>{phase}</button></li>)}
      </ol>
      <div className="add-inputs">
        <label>First number (lv_first)<input inputMode="numeric" value={raw.a} aria-invalid={!wholeNumber.test(raw.a)} onChange={e => edit("a", e.target.value)} /></label>
        <label>Second number (lv_second)<input inputMode="numeric" value={raw.b} aria-invalid={!wholeNumber.test(raw.b)} onChange={e => edit("b", e.target.value)} /></label>
        {invalid ? <p className="add-error" role="alert">Enter whole numbers only, up to 6 digits. The program keeps the last valid numbers.</p>
          : <p className="add-hint">Try your own numbers. The code, the boxes and the screen all follow.</p>}
      </div>
      <div className="add-run">
        <div>
          <pre className="add-code" dir="ltr" translate="no" aria-label="ABAP program">{shown.map(({ text, line }, i) =>
            <span key={line} data-state={lineState(line)}><span className="ln" aria-hidden="true">{i + 1}</span><span><Highlight text={text} /></span></span>)}</pre>
          <p className="add-say" aria-live="polite">{info?.say ?? "Nothing has run yet. Press “Run next line” to start."}</p>
          {info && <dl className="add-words" aria-label="This line, word by word">{info.words.map(([word, meaning]) =>
            <div key={word}><dt><code dir="ltr">{word}</code></dt><dd>{meaning}</dd></div>)}</dl>}
        </div>
        <div className="add-side">
          <figure className="add-memory" data-primary-diagram="addition" aria-label="Memory: the program's boxes">
            <figcaption className="eyebrow">Memory</figcaption>
            {names.map((name, i) => <Fragment key={name}>
              {i > 0 && <span className="add-op" aria-hidden="true">{i === names.length - 1 ? "→" : "+"}</span>}
              {name in memory
                ? <div className="add-box" key={event!.changed.includes(name) ? step : name} data-changed={event!.changed.includes(name)}><code>{name}</code><strong>{String(memory[name])}</strong><small>whole number</small></div>
                : <div className="add-box" data-empty><code>{name}</code><strong>–</strong><small>not created yet</small></div>}
            </Fragment>)}
          </figure>
          <section className="add-screen" aria-label="Screen">
            <span className="eyebrow">Screen</span>
            {event?.output.length ? <pre dir="ltr">{event.output.join("\n")}</pre> : <p>Nothing on the screen yet.</p>}
          </section>
        </div>
      </div>
      <div className="add-controls">
        <button type="button" onClick={() => setStep(step - 1)} disabled={!step}><span aria-hidden="true">← </span>Back</button>
        <span className="add-progress">{event ? `Line ${step} of ${events.length} · ${phases[phaseOf[step - 1]]}` : "Ready to run"}</span>
        <button type="button" className="primary" onClick={() => setStep(step === events.length ? 0 : step + 1)}>{step === events.length ? "Start over" : "Run next line"}</button>
      </div>
    </section>

    <section className="add-card" aria-labelledby="add-mistakes">
      <span className="eyebrow">Avoid these</span>
      <h2 id="add-mistakes">Three common beginner mistakes</h2>
      <div className="add-mistakes">{mistakes.map(m => <article key={m.title}>
        <h3>{m.title}</h3>
        <small className="add-bad">✗ Wrong</small><pre dir="ltr" data-kind="wrong">{m.wrong}</pre>
        <small className="add-good">✓ Right</small><pre dir="ltr" data-kind="right">{m.right}</pre>
        <p>{m.why}</p>
      </article>)}</div>
    </section>

    <section className="add-card" aria-labelledby="add-concepts"><span className="eyebrow">Remember</span><h2 id="add-concepts">The whole lesson in one line</h2>
      <LessonFlow id="addition" />
      <ul className="add-keys">{content.concepts.map(concept => <li data-concept={`addition/${concept.id}`} key={concept.id}><strong>{concept.name.en}:</strong> {concept.explanation.en}</li>)}</ul>
      <Quiz sessionKey="addition:step-check" lang="en" question="Right after line 3 runs, before the addition, what is inside lv_result?" options={["0", "13", "It does not exist yet"]} answer={0} explanation="Line 3 created lv_result as a whole-number box. Without VALUE it starts at 0. The addition only happens on line 4." onCorrect={() => {}} />
    </section>
    <details><summary>Go deeper · SAP references</summary><p>{mission.brief.en}</p><p>{mission.practice.en}</p>{mission.references?.map(ref => <p key={ref}><a href={ref} target="_blank" rel="noreferrer">{ref}</a></p>)}</details>
    <div className="addition-pilot-next"><p className="muted">Next: see every part of this code explained, then try the challenge.</p><button className="primary" onClick={onExplore}>Explore this code →</button></div>
  </div>;
}

/** Runs a program; null means it stops with an error. */
const run = (source: string) => { try { return simulate(source).at(-1) ?? null; } catch { return null; } };
const shows = (source: string) => { const end = run(source); return !end ? "an error" : end.output.length ? end.output.join(", then ") : "nothing"; };
const valueLine = /^[ \t]*(DATA[ \t]+(\w+)[ \t]+TYPE[ \t]+i)[ \t]+VALUE[ \t]+(-?\d+)[ \t]*\./im;
const writeLine = /^[ \t]*(WRITE[ \t]+\w+)[ \t]*\./im;
const sumLine = /^[ \t]*(\w+)[ \t]*=[ \t]*(\w+)[ \t]*\+[ \t]*(\w+)[ \t]*\./im;
// Each experiment edits one line of the learner's current code; answers come from running the edited program.
const experiments: { title: string; ask: string; why: string; math?: boolean; edit: (code: string) => { from: string; to: string } | null }[] = [
  { title: "Change a number", ask: "What will the screen show?", math: true,
    why: "The total is calculated from whatever the boxes hold, so a new number gives a new total.",
    edit: code => { const m = code.match(valueLine); return m && { from: m[0].trim(), to: `${m[1]} VALUE ${m[3] === "100" ? 50 : 100}.` }; } },
  { title: "Remove a starting value", ask: "What will the screen show?", math: true,
    why: "Without VALUE, a whole-number box starts at 0.",
    edit: code => { const m = code.match(valueLine); return m && { from: m[0].trim(), to: `${m[1]}.` }; } },
  { title: "Show two values", ask: "What will the screen show?",
    why: "Each WRITE shows one value, in the order the lines run.",
    edit: code => { const w = code.match(writeLine), v = code.match(valueLine); return w && v && { from: w[0].trim(), to: `${w[0].trim()}\nWRITE ${v[2]}.` }; } },
  { title: "Forget a period", ask: "Will the program run?",
    why: "Every instruction must end with a period. Without it, the program cannot run.",
    edit: code => { const w = code.match(writeLine); return w && { from: w[0].trim(), to: w[1] }; } },
];

export function AdditionExplore({ theme, onChallenge }: { theme: "light" | "dark"; onChallenge: () => void }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState<number | null>(null);
  const [code, setCode] = useState(mission.example);
  const e = experiments[index];
  const change = e.edit(code);
  const edited = change && code.replace(change.from, change.to);
  const sum = edited?.match(sumLine), memory = edited ? run(edited)?.memory : undefined;
  const math = e.math && sum && memory && [sum[1], sum[2], sum[3]].every(n => n in memory)
    ? `${sum[1]} = ${sum[2]} + ${sum[3]} = ${String(memory[sum[2]])} + ${String(memory[sum[3]])} = ${String(memory[sum[1]])}` : undefined;
  const go = (next: number) => { setIndex(next); setRevealed(null); };
  return <div className="addition-pilot-lesson add-learn" data-addition-explore>
    <section className="add-card addition-pilot-sandbox" aria-labelledby="add-explore">
      <span className="eyebrow">Explore code</span>
      <h2 id="add-explore">Now change the program yourself</h2>
      <p>Guess the result first. Then make the change in the editor below and press <strong>Build trace</strong> to check.</p>
      <div className="add-exp" aria-live="polite">
        <p className="add-exp-head">Experiment {index + 1} of {experiments.length} · <strong>{e.title}</strong></p>
        {change && edited ? <>
          <div className="add-exp-change">
            <div><small>Change this</small><pre dir="ltr">{change.from}</pre></div><span aria-hidden="true">→</span>
            <div><small>To this</small><pre dir="ltr">{change.to}</pre></div>
          </div>
          <p className="add-exp-ask">{e.ask}</p>
          {revealed === index ? <div className="add-exp-answer">
            <p>{e.why}</p>
            {math && <p><code dir="ltr">{math}</code></p>}
            <p className="add-exp-result">Screen before: <strong>{shows(code)}</strong> <span aria-hidden="true">→</span> after: <strong>{shows(edited)}</strong></p>
          </div> : <button type="button" onClick={() => setRevealed(index)}>Show answer</button>}
        </> : <p className="add-exp-missing">Your code no longer has the line this experiment changes. Press <strong>Reset code</strong> to bring the original program back.</p>}
        <div className="add-exp-nav">
          <button type="button" disabled={!index} onClick={() => go(index - 1)}><span aria-hidden="true">← </span>Previous</button>
          <button type="button" disabled={index === experiments.length - 1} onClick={() => go(index + 1)}>Next experiment<span aria-hidden="true"> →</span></button>
        </div>
      </div>
      <p className="muted">The experiments follow the code in your editor. Press <strong>Reset code</strong> to go back to the original.</p>
      <LearningWorkspace initialCode={mission.example} lang="en" theme={theme} storageKey="abap2-workspace:addition:visualize" onCodeChange={setCode} />
    </section>
    <div className="addition-pilot-next"><p className="muted">Next: write a program like this one on your own.</p><button className="primary" onClick={onChallenge}>Try the challenge →</button></div>
  </div>;
}


/** Beginner briefing shown above the shared challenge workspace. */
export function AdditionChallengeIntro({ onLearn, onExplore }: { onLearn: () => void; onExplore: () => void }) {
  return <div className="addition-pilot-lesson add-learn" data-addition-challenge>
    <section className="add-card add-hero" aria-labelledby="add-mission">
      <span className="eyebrow">Your mission</span>
      <h2 id="add-mission">A warehouse gets two deliveries: 10 boxes and 20 boxes</h2>
      <p>Write a program that adds the two deliveries and shows the total on the screen. When it works, the screen shows <strong>30</strong>.</p>
      <div className="add-goal" aria-label="The program takes 10 and 20 and shows 30">
        <div><small>Delivery 1</small><strong>10</strong></div><span aria-hidden="true">+</span>
        <div><small>Delivery 2</small><strong>20</strong></div><span aria-hidden="true">→</span>
        <div><small>Screen shows</small><strong>30</strong></div>
      </div>
    </section>
    <div className="add-brief">
      <section className="add-card" aria-labelledby="add-checklist">
        <h3 id="add-checklist">Your program must</h3>
        <ol className="add-checklist">
          <li>Create two whole-number variables that start at <code>10</code> and <code>20</code>.</li>
          <li>Create a third variable for the result.</li>
          <li>Add the two variables and store the sum in the result.</li>
          <li>Show the result with <code>WRITE</code>.</li>
        </ol>
        <p className="muted">You may pick your own names. Typing <code>WRITE 30.</code> alone will not pass: the checker makes sure your program really adds two variables.</p>
      </section>
      <section className="add-card" aria-labelledby="add-how">
        <h3 id="add-how">How to work</h3>
        <ol className="add-checklist">
          <li>The editor already has the right shape. Only the numbers are wrong.</li>
          <li>Press <strong>Build trace</strong> to run it and watch memory change.</li>
          <li>Press <strong>Check challenge</strong> when the output is 30.</li>
          <li>Then press <strong>Complete mission</strong>.</li>
        </ol>
      </section>
    </div>
    <details className="add-card add-stuck"><summary>Stuck? Open one hint at a time</summary>
      <details><summary>Hint 1</summary><p>Look at the two <code>VALUE 0</code> parts in the editor. Those are the starting numbers of the two deliveries.</p></details>
      <details><summary>Hint 2</summary><p>Change the first <code>VALUE 0</code> to <code>VALUE 10</code> and the second to <code>VALUE 20</code>. Keep the periods.</p></details>    </details>
    <p className="add-help">Need a refresher? <button className="text-button" onClick={onLearn}>Watch it run on Learn</button> · <button className="text-button" onClick={onExplore}>Experiment on Explore code</button></p>
  </div>;
}
