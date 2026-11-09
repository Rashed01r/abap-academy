"use client";
// Challenge tab for reference (SAP-only) lessons: one decision at a time, instant feedback, hints beside the question.
// Same grading and saved result as the older "Apply the lesson" list. English only while ENABLE_ARABIC = false.
import { localizedText } from "../lib/language-policy";
import type { GuidedDefinition } from "@/lib/guided-types";
import type { Locale } from "@/lib/engine";
import { gradeGuided } from "@/lib/guided-curriculum";
import { useTopicSession } from "@/lib/use-topic-session";
import { beginnerLessons, challengeBriefs } from "@/lib/beginner-lessons";
import { TechnicalText } from "./technical-text";
import "./addition-lesson.css";

export function DecisionChallenge({ definition: d, lang, completed, onResult, onLearn, onExplore }: {
  definition: GuidedDefinition; lang: Locale; completed: boolean; onResult: (passed: boolean) => void; onLearn: () => void; onExplore: () => void;
}) {
  const [choices, setChoices] = useTopicSession<Record<string, string>>(`${d.id}:decisions`, {});
  const [checked, setChecked] = useTopicSession(`${d.id}:decisions-checked`, false);
  const [hints, setHints] = useTopicSession<Record<string, number>>(`${d.id}:decision-hints`, {});
  const [step, setStep] = useTopicSession(`${d.id}:decision-step`, 0);
  const total = d.decisions.length, current = Math.min(Math.max(step, 0), total - 1), decision = d.decisions[current];
  const result = gradeGuided(d, choices);
  const answered = d.decisions.filter(x => choices[x.id]).length;
  const picked = choices[decision.id], right = picked === decision.correct, shownHints = hints[decision.id] || 0;
  const title = beginnerLessons[d.id]?.challenge.title ?? localizedText(d.activityTitle, lang);
  const state = (id: string) => !choices[id] ? "todo" : choices[id] === d.decisions.find(x => x.id === id)!.correct ? "right" : "wrong";
  const choose = (optionId: string) => { setChoices(v => ({ ...v, [decision.id]: optionId })); setChecked(false); };
  return <div className="addition-pilot-lesson add-learn dc" data-lesson-challenge>
    <section className="add-card add-hero dc-hero" aria-labelledby={`${d.id}-mission`}>
      <div><span className="eyebrow">Your mission</span><h2 id={`${d.id}-mission`}>{title}</h2><p>{challengeBriefs[d.id]?.intro ?? localizedText(d.activityIntro, lang)}</p></div>
      <div className="dc-xp"><b>{d.xp} XP</b><span>{answered} of {total} answered</span></div>
    </section>
    <p className="pill guided-boundary">{localizedText(d.boundary, lang)}</p>
    <section className="add-card" aria-label="Apply the lesson">
      <ol className="dc-dots" aria-label="Decisions">{d.decisions.map((x, i) => <li key={x.id}>
        <button type="button" aria-current={i === current ? "step" : undefined} data-state={state(x.id)} onClick={() => setStep(i)}>
          <b aria-hidden="true">{state(x.id) === "right" ? "✓" : state(x.id) === "wrong" ? "!" : i + 1}</b>Decision {i + 1}</button></li>)}</ol>
      <div className="dc-bar" role="progressbar" aria-label="Decisions answered" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered}><i style={{ width: `${(answered / total) * 100}%` }} /></div>
      <div className="dc-grid">
        <fieldset className="dd-choices dc-question" data-decision={decision.id}>
          <legend><span className="eyebrow">Decision {current + 1} of {total}</span></legend>
          <h3><TechnicalText>{localizedText(decision.prompt, lang)}</TechnicalText></h3>
          {decision.options.map((option, i) => {
            const on = picked === option.id;
            return <label key={option.id} data-on={on || undefined} data-state={on ? (right ? "right" : "wrong") : undefined}>
              <input type="radio" name={`dc-${decision.id}`} checked={on} onChange={() => choose(option.id)} />
              <span><b><TechnicalText>{localizedText(option.text, lang)}</TechnicalText></b></span>
              <em aria-hidden="true" data-good={on && right ? "true" : undefined}>{on ? (right ? "✓ correct" : "✗ not this one") : String.fromCharCode(65 + i)}</em></label>;
          })}
          {picked && <p role="status" aria-live="polite" className={right ? "success-text" : "error-text"}>
            <strong>{right ? "Correct. " : "Review this decision. "}</strong>{right ? <TechnicalText>{localizedText(decision.explanation, lang)}</TechnicalText> : "Read the hint, then choose another answer."}</p>}
        </fieldset>
        <div className="dc-rail">
          <section className="dd-box" aria-label="Decisions so far"><span className="eyebrow">Your decisions</span>
            <ul className="dd-checks">{d.decisions.map((x, i) => <li key={x.id} data-ok={state(x.id) === "right" ? "true" : state(x.id) === "wrong" ? "false" : undefined}>
              {state(x.id) === "right" ? "✓" : state(x.id) === "wrong" ? "✗" : "○"} Decision {i + 1}{state(x.id) === "right" ? ": " + localizedText(x.options.find(o => o.id === x.correct)!.text, lang) : ""}</li>)}</ul>
            <button type="button" className="primary" disabled={answered < total} onClick={() => { setChecked(true); onResult(result.passed); }}>Check decisions</button>
            {answered < total && <p className="muted">Answer all {total} decisions to check them.</p>}</section>
          <section className="dd-box" aria-label="Hints"><span className="eyebrow">Stuck?</span>
            {decision.hints.slice(0, shownHints).map((hint, i) => <p className="dc-hint" key={i}>💡 {localizedText(hint, lang)}</p>)}
            <button type="button" className="text-button" disabled={shownHints >= decision.hints.length} onClick={() => setHints(v => ({ ...v, [decision.id]: shownHints + 1 }))}>Show next hint</button></section>
        </div>
      </div>
      <div className="add-controls">
        <button type="button" onClick={() => setStep(current - 1)} disabled={!current}><span aria-hidden="true">← </span>Back</button>
        <span className="add-progress">Decision {current + 1} of {total}</span>
        <button type="button" className="primary" onClick={() => setStep(current + 1)} disabled={current === total - 1}>Next decision<span aria-hidden="true"> →</span></button>
      </div>
      {checked && <p role="status" data-testid="guided-result" className={result.passed ? "success-text" : "error-text"}>{result.passed ? "All decisions passed. Complete the mission to finish." : "Review the feedback and retry. Every decision must be correct."}</p>}
      {checked && !result.passed && <button type="button" className="secondary" onClick={() => { setChoices({}); setChecked(false); setHints({}); setStep(0); }}>Retry assessment</button>}
      {completed && <p className="muted">Assessment achievement saved.</p>}
    </section>
    <p className="add-help">Need a refresher? <button className="text-button" onClick={onLearn}>Watch it on Learn</button> · <button className="text-button" onClick={onExplore}>Experiment on Explore code</button></p>
  </div>;
}
