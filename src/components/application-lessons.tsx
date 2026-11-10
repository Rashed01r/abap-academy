"use client";
// Learn side panel for the SAP Application Development lessons (data in lib/application-labs.ts).
// Local teaching models: nothing is created, run or activated in an SAP system. English only while ENABLE_ARABIC = false.
import { useState } from "react";
import { useTopicSession } from "@/lib/use-topic-session";
import { applicationLessons, type Choice } from "@/lib/application-labs";
import { StepLab, Box } from "./dictionary-labs";

function Choices({ options, picked, onPick }: { options: Choice[]; picked: number | null; onPick: (i: number) => void }) {
  return <>
    <div className="dict-choices">{options.map((o, i) => <button type="button" key={o.text} aria-pressed={picked === i} onClick={() => onPick(i)}>{o.text}</button>)}</div>
    {picked !== null && <p role="status" aria-live="polite" data-ok={options[picked].ok} className={options[picked].ok ? "success-text" : "error-text"}>{options[picked].ok ? "✓ " : "✗ "}{options[picked].why}</p>}
  </>;
}

/** Learn: each stage adds a row to the spec sheet; stages with a try-it also ask one question. */
export function ApplicationPanel({ id, part }: { id: string; part: number }) {
  const cfg = applicationLessons[id], [picked, setPicked] = useState<Record<number, number>>({});
  const rows = cfg.rows.filter(r => r[0] <= part), tryIt = cfg.tries[part];
  return <>
    <section className="dict-panel" aria-label={cfg.panelTitle}><span className="eyebrow">{cfg.panelTitle}</span>
      {rows.length ? <table className="dict-spec"><tbody>{rows.map(([stage, label, value]) => <tr key={`${stage}-${label}`} data-fresh={stage === part || undefined}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table>
        : <p className="dict-empty">Nothing built yet. Press “Next part” to start.</p>}</section>
    {tryIt && <section className="dict-panel" aria-label={`Try it · ${tryIt.title}`}><span className="eyebrow">Try it · {tryIt.title}</span>
      <p>{tryIt.question}</p><Choices options={tryIt.options} picked={picked[part] ?? null} onPick={i => setPicked(p => ({ ...p, [part]: i }))} /></section>}
  </>;
}

/** Explore code (ALV): one question per step; each correct answer adds its lines to the program on the right. */
export function ApplicationLab({ id }: { id: string }) {
  const lab = applicationLessons[id].lab!;
  const [answers, setAnswers] = useTopicSession<Record<string, number>>(`${id}:lab-answers`, {});
  const right = (i: number) => answers[i] !== undefined && lab.steps[i].options[answers[i]].ok;
  const done = lab.steps.filter((_, i) => right(i)).length;
  return <StepLab label={lab.label} sessionKey={`${id}:lab`} steps={lab.steps.map((s, i) => ({
    name: s.name, hint: s.hint, title: s.title, intro: s.intro, valid: answers[i] === undefined ? undefined : right(i),
    body: <><p><strong>{s.question}</strong></p><Choices options={s.options} picked={answers[i] ?? null} onPick={n => setAnswers(a => ({ ...a, [i]: n }))} /></>,
  }))} rail={<>
    <Box title={lab.startTitle}><pre dir="ltr">{[lab.start, ...lab.steps.filter((_, i) => right(i)).map(s => s.adds)].join("\n")}</pre></Box>
    <Box title="Progress"><p role="status" aria-live="polite" className={done === lab.steps.length ? "success-text" : "muted"}>{done} of {lab.steps.length} steps correct.{done === lab.steps.length ? " The program is complete." : " Each correct answer adds its lines."}</p></Box>
  </>} />;
}
