"use client";
// Explore code for the SAP Application Development lessons: explain the idea and its benefits with a drawn mock-up (A),
// before/after scenarios (B) or a step-by-step walkthrough (C). Illustrations only: nothing runs in an SAP system.
import type { ReactNode } from "react";
import { useTopicSession } from "@/lib/use-topic-session";
import { applicationConcepts, type Concept, type Point } from "@/lib/application-concepts";
import "./concept-lessons.css";

type Of<S extends string> = Extract<Concept, { style: S }>;

function Hot({ k, p, sel, onSel, children }: { k: string; p: Point; sel: string; onSel: (k: string) => void; children: ReactNode }) {
  return <div className="cl-hot" data-on={sel === k} onClick={() => onSel(k)}>
    <button type="button" className="cl-pin" aria-pressed={sel === k} aria-label={`Explain: ${p.name}`} onClick={() => onSel(k)}>{p.n}</button>{children}
  </div>;
}

const opens: Record<string, [kind: string, title: string, body: string]> = {
  ZACA_REPORT: ["Report transaction", "Selection screen · Z_ACADEMY_REPORT", "Screen 1000. The input box already shows 3. Press Execute to see the list."],
  ZACA_SCREEN: ["Dialog transaction", "Screen 9000 · Z_ACADEMY_SCREEN", "The Name box and the Show button, the screen from the module pool lesson."],
  SE38: ["Standard code", "ABAP Editor", "Write and change programs and reports."],
  SE80: ["Standard code", "Object Navigator", "Browse programs, screens and transactions in one place."],
  SE11: ["Standard code", "ABAP Dictionary", "Define tables, data elements and domains."],
  SE16: ["Standard code", "Data Browser", "Pick a table and look at its rows."],
};
const definitions = [["ZACA_REPORT", "Report", "Z_ACADEMY_REPORT", "1000"], ["ZACA_SCREEN", "Dialog", "Z_ACADEMY_SCREEN", "9000"]];

const pay = [["Basic salary", "8,000"], ["Housing allowance", "2,000"], ["Transport", "500"], ["Bonus", "1,200"], ["Medical", "400"], ["Training", "300"], ["Overtime", "650"], ["Other", "100"], ["Parking", "50"], ["Meals", "75"], ["Phone", "60"], ["Internet", "40"]];

function Explorer({ id, c }: { id: string; c: Of<"A"> }) {
  const first = Object.keys(c.points)[1];
  const [sel, setSel] = useTopicSession(`${id}:concept-part`, first);
  const [name, setName] = useTopicSession(`${id}:concept-name`, c.mock === "letter" ? "Sara" : "");
  const [shown, setShown] = useTopicSession(`${id}:concept-shown`, "");
  const [dept, setDept] = useTopicSession(`${id}:concept-dept`, "HR");
  const [rows, setRows] = useTopicSession(`${id}:concept-rows`, 3);
  const P = c.points, p = P[sel] ?? P[first];
  const on = (k: string) => ({ k, p: P[k], sel, onSel: setSel });
  return <div className="cl-split">
    <div>{c.mock === "command"
      ? <div className="cl-win" role="group" aria-label="Illustration of a command field">
        <div className="cl-win-title"><span>Start a program</span><span className="muted">illustration</span></div>
        <div className="cl-win-body">
          <Hot {...on("cmd")}><label htmlFor={`${id}-cmd`}>Command field</label>
            <span className="explore-actions"><input id={`${id}-cmd`} value={name} maxLength={20} placeholder="e.g. ZACA_REPORT" onChange={e => { setName(e.target.value.toUpperCase()); setShown(""); }} />
              <button type="button" className="primary" onClick={() => setShown(name.trim())}>Enter</button></span></Hot>
          <Hot {...on("link")}><table className="cl-defs"><thead><tr><th>Code</th><th>Starts</th><th>Program</th><th>Screen</th></tr></thead>
            <tbody>{definitions.map(([code, kind, prog, scr]) => <tr key={code} data-hit={shown === code || undefined}><td>{code}</td><td>{kind}</td><td>{prog}</td><td>{scr}</td></tr>)}</tbody></table></Hot>
          <Hot {...on("result")}><div className="cl-opens" role="status" aria-live="polite">{!shown ? <span className="muted">Type a code and press Enter.</span> : opens[shown]
            ? <><span className="cl-tag">{opens[shown][0]}</span><b>{opens[shown][1]}</b><span>{opens[shown][2]}</span></>
            : <><b>Transaction {shown} does not exist.</b><span>Custom codes start with Z or Y.</span></>}</div></Hot>
          <Hot {...on("tools")}><span className="cl-chips">{["SE38", "SE80", "SE11", "SE16"].map(code => <button type="button" key={code} onClick={() => { setName(code); setShown(code); }}>{code}</button>)}</span></Hot>
        </div>
      </div>
      : c.mock === "screen"
      ? <div className="cl-win" role="group" aria-label="Illustration of a classic screen">
        <div className="cl-win-title"><span>Employee greeting</span><span className="muted">illustration</span></div>
        <div className="cl-win-bar"><Hot {...on("title")}><span className="cl-chips"><span>Back</span><span>Save</span><span>Help</span></span></Hot></div>
        <div className="cl-win-body">
          <Hot {...on("field")}><label htmlFor={`${id}-nm`}>Name</label><input id={`${id}-nm`} value={name} maxLength={30} placeholder="Type a name" onChange={e => { setName(e.target.value); setShown(""); }} /></Hot>
          <Hot {...on("button")}><button type="button" className="primary" onClick={() => setShown(name.trim() ? `Hello ${name.trim()}` : "Please type a name first.")}>Show</button></Hot>
          <Hot {...on("msg")}><span className="cl-answer" role="status">{shown || " "}</span></Hot>
        </div>
      </div>
      : <div className="cl-paper" role="group" aria-label="Illustration of a printed letter">
        <Hot {...on("head")}><b className="cl-logo">ACADEMY CO.</b><small>Human Resources · Riyadh</small></Hot>
        <Hot {...on("name")}><span>Dear <b>{name || "…"}</b> ({dept || "…"}), your pay details are:</span></Hot>
        <Hot {...on("table")}><table><thead><tr><th>Item</th><th>SAR</th></tr></thead><tbody>{pay.slice(0, rows).map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody></table>{rows > 6 && <small>Continues on page 2…</small>}</Hot>
        <Hot {...on("foot")}><small className="cl-foot"><span>Academy Co. · Confidential</span><span>Page 1 of {rows > 6 ? 2 : 1}</span></small></Hot>
      </div>}</div>
    <div className="cl-side">
      <div className="cl-explain" aria-live="polite">
        <h3><span className="cl-pin static">{p.n}</span>{p.name}</h3><p>{p.what}</p>
        <p className="cl-why"><b>Why it helps:</b> {p.why}</p><span className="cl-tag">{p.tech}</span>
      </div>
      {c.mock === "command"
        ? <div className="cl-data"><span className="eyebrow">Try it</span><p>Type ZACA_REPORT or ZACA_SCREEN and press Enter. Then try a code that does not exist.</p><p className="muted">Click a standard code in box 4 to open it.</p></div>
        : c.mock === "screen"
        ? <div className="cl-data"><span className="eyebrow">Try it</span><p>Type a name in box 2 and press Show (3).</p><p className="muted">The screen stays open and answers in place.</p></div>
        : <div className="cl-data"><span className="eyebrow">The data the program hands over</span>
          <label>Employee name<input value={name} maxLength={24} onChange={e => setName(e.target.value)} /></label>
          <label>Department<input value={dept} maxLength={16} onChange={e => setDept(e.target.value)} /></label>
          <div className="explore-actions"><button type="button" className="secondary" disabled={rows >= 12} onClick={() => setRows(r => r + 1)}>Add a table line</button>
            <button type="button" className="secondary" disabled={rows <= 3} onClick={() => setRows(r => r - 1)}>Remove a line</button></div>
          <p className="muted">Change the data and watch the page. The layout never changes.</p></div>}
    </div>
  </div>;
}

function Compare({ id, c }: { id: string; c: Of<"B"> }) {
  const [i, setI] = useTopicSession(`${id}:concept-scenario`, 0);
  const s = c.scenarios[Math.min(i, c.scenarios.length - 1)];
  const side = (name: string, o: { text: string; fit: boolean }) => <div className="cl-side-card" data-fit={o.fit}>
    <span className="cl-badge" data-fit={o.fit}>{o.fit ? "Better fit" : "Harder here"}</span><h3>{name}</h3><p>{o.text}</p></div>;
  return <>
    <div className="cl-scn" role="group" aria-label="Situations">{c.scenarios.map((x, n) => <button type="button" key={x.q} aria-pressed={n === i} onClick={() => setI(n)}><b>Situation {n + 1}</b><br />{x.q}</button>)}</div>
    <div className="cl-vs" aria-live="polite">{side(c.left, s.left)}{side(c.right, s.right)}</div>
    <p className="muted">The simpler approach is not always the wrong one. A good choice depends on the situation.</p>
  </>;
}

function Walk({ id, c }: { id: string; c: Of<"C"> }) {
  const [n, setN] = useTopicSession(`${id}:concept-step`, 0);
  const cur = Math.min(n, c.steps.length - 1), now = c.steps[cur];
  return <>
    <div className="cl-lanes">{c.lanes.map(l => <div className="cl-lane" key={l}>{l}</div>)}
      {c.steps.slice(0, cur + 1).map((s, k) => <div className="cl-step" key={s.title} data-state={k === cur ? "now" : "done"} style={{ gridColumn: s.lane + 1 }}>
        {k > 0 && <span className="cl-arrow" aria-hidden="true">↓</span>}<b><span className="cl-pin static">{k + 1}</span>{s.title}</b>{s.tag && <span className="cl-tag">{s.tag}</span>}</div>)}</div>
    <div className="cl-explain" aria-live="polite"><h3><span className="cl-pin static">{cur + 1}</span>{now.title}</h3><p>{now.say}</p>{now.state && <span className="cl-tag">{now.state}</span>}</div>
    <div className="explore-actions"><button type="button" className="secondary" disabled={!cur} onClick={() => setN(cur - 1)}>Back</button>
      <button type="button" className="primary" disabled={cur === c.steps.length - 1} onClick={() => setN(cur + 1)}>Next step</button>
      <button type="button" className="secondary" onClick={() => setN(0)}>Start over</button><span className="muted">Step {cur + 1} of {c.steps.length}</span></div>
  </>;
}

export function ConceptExplore({ id }: { id: string }) {
  const c = applicationConcepts[id];
  return <section className="learn-card cl" aria-label="Concept explorer">
    <span className="eyebrow">What it is and why it helps</span>
    <p className="cl-lead">{c.lead}</p>
    <div className="cl-benefits">{c.benefits.map(([t, x]) => <div key={t}><b>{t}</b>{x}</div>)}</div>
    {c.style === "A" ? <Explorer id={id} c={c} /> : c.style === "B" ? <Compare id={id} c={c} /> : <Walk id={id} c={c} />}
  </section>;
}
