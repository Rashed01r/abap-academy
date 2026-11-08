"use client";
import { localizedText } from "../lib/language-policy";
import dynamic from "next/dynamic";
import type { GuidedDefinition } from "@/lib/guided-types";
import type { Locale } from "@/lib/engine";
import { gradeGuided } from "@/lib/guided-curriculum";
import { useTopicSession } from "@/lib/use-topic-session";
import { TechnicalText } from "./technical-text";

const DictionaryDesigner = dynamic(() => import("./dictionary-designer").then(m => m.DictionaryDesigner));
const SqlFoundationLab = dynamic(() => import("./sql-foundation-lab").then(m => m.SqlFoundationLab));
const ObjectExplorer = dynamic(() => import("./object-explorer").then(m => m.ObjectExplorer));

/** sqlLab=false when the lesson's picture (VisualClassroom) already shows the SQL lab on the same tab. */
export function GuidedExplorer({definition: d, lang, sqlLab = true}: {definition: GuidedDefinition; lang: Locale; sqlLab?: boolean}) {
  const [selected, setSelected] = useTopicSession(`${d.id}:artifact`, d.artifacts[0].id);
  const artifact = d.artifacts.find(a => a.id === selected) || d.artifacts[0];
  const related = d.relations.filter(r => r.from === artifact.id || r.to === artifact.id);
  return <div className="guided-explorer">
    {d.id === "dictionary-introduction" && <DictionaryDesigner lang={lang}/>}
    {d.id === "database-fundamentals" && sqlLab && <SqlFoundationLab lang={lang}/>}
    {d.id === "oop-introduction" && <ObjectExplorer lang={lang}/>}
    <section className="learn-card artifact-explorer" aria-label={localizedText(d.activityTitle, lang)}>
      <h2>{localizedText(d.activityTitle, lang)}</h2>
      <p><TechnicalText>{localizedText(d.activityIntro, lang)}</TechnicalText></p>
      <div className="artifact-nodes" role="group" aria-label={localizedText(d.activityTitle, lang)}>
        {d.artifacts.map((a, i) => <button className="secondary" key={a.id} data-artifact={a.id} aria-pressed={selected === a.id} aria-controls={`${d.id}-artifact-detail`} onClick={() => setSelected(a.id)}><span className="eyebrow">{i+1}</span><TechnicalText>{localizedText(a.title, lang)}</TechnicalText></button>)}
      </div>
      <article id={`${d.id}-artifact-detail`} className="artifact-detail" aria-live="polite">
        <h3>{localizedText(artifact.title, lang)}</h3><p><TechnicalText>{localizedText(artifact.description, lang)}</TechnicalText></p>
        <pre dir="ltr"><code>{artifact.example}</code></pre>
        <div className="artifact-relationship-map" role="group" aria-label={lang === "en" ? "Relationships for the selected artifact" : "علاقات الكائن المحدد"}>
          {related.map((r, index) => <div className="artifact-edge" key={index}>
            <button className="secondary" aria-pressed={selected === r.from} onClick={() => setSelected(r.from)}>{localizedText(d.artifacts.find(a => a.id === r.from)!.title, lang)}</button>
            <div className="artifact-edge-label"><span>{localizedText(r.label, lang)}</span><span className="artifact-arrow" aria-hidden="true">{lang === "ar" ? "←" : "→"}</span></div>
            <button className="secondary" aria-pressed={selected === r.to} onClick={() => setSelected(r.to)}>{localizedText(d.artifacts.find(a => a.id === r.to)!.title, lang)}</button>
          </div>)}
        </div>
      </article>
    </section>
  </div>;
}

export function GuidedAssessment({definition: d, lang, onResult, completed}: {
  definition: GuidedDefinition; lang: Locale; onResult: (passed: boolean) => void; completed: boolean;
}) {
  const [choices, setChoices] = useTopicSession<Record<string, string>>(`${d.id}:decisions`, {});
  const [checked, setChecked] = useTopicSession(`${d.id}:decisions-checked`, false);
  const [hints, setHints] = useTopicSession<Record<string, number>>(`${d.id}:decision-hints`, {});
  const result = gradeGuided(d, choices);
  const ready = d.decisions.every(decision => !!choices[decision.id]);
  const copy = lang === "en" ? {
    title: "Apply the lesson", choose: "Choose a response", check: "Check decisions", retry: "Retry assessment",
    hint: "Show next hint", correct: "Correct.", wrong: "Review this decision.", passed: "All decisions passed. Complete the knowledge check to finish the mission.",
    review: "Review the feedback and retry. Every decision must be correct.", saved: "Assessment achievement saved.",
  } : {
    title: "طبّق ما تعلمته", choose: "اختر الإجابة", check: "تحقق من القرارات", retry: "أعد التقييم",
    hint: "أظهر التلميح التالي", correct: "صحيح.", wrong: "راجع هذا القرار.", passed: "اجتزت جميع القرارات. أكمل اختبار الفهم لإنهاء المهمة.",
    review: "راجع الملاحظات ثم حاول مجددًا. يجب أن تكون جميع القرارات صحيحة.", saved: "حُفظ اجتياز التقييم.",
  };
  return <section className="learn-card guided-assessment" aria-label={copy.title}>
    <h2>{copy.title}</h2><p>{localizedText(d.activityIntro, lang)}</p>
    {d.decisions.map((decision, index) => <fieldset key={decision.id} data-decision={decision.id}>
      <legend>{index+1}. <TechnicalText>{localizedText(decision.prompt, lang)}</TechnicalText></legend>
      <select aria-label={localizedText(decision.prompt, lang)} value={choices[decision.id] || ""} onChange={event => {
        setChoices(v => ({...v, [decision.id]: event.target.value})); setChecked(false);
      }}>
        <option value="">{copy.choose}</option>
        {decision.options.map(option => <option key={option.id} value={option.id}>{localizedText(option.text, lang)}</option>)}
      </select>
      <button className="text-button" disabled={(hints[decision.id] || 0) >= decision.hints.length} onClick={() => setHints(v => ({...v, [decision.id]: (v[decision.id] || 0)+1}))}>{copy.hint}</button>
      {decision.hints.slice(0, hints[decision.id] || 0).map((hint, i) => <p className="muted" key={i}>{localizedText(hint, lang)}</p>)}
      {checked && <p role="status" className={choices[decision.id] === decision.correct ? "success-text" : "error-text"}>
        <strong>{choices[decision.id] === decision.correct ? copy.correct : copy.wrong} </strong><TechnicalText>{localizedText(decision.explanation, lang)}</TechnicalText>
      </p>}
    </fieldset>)}
    <div className="explore-actions"><button className="primary" disabled={!ready} onClick={() => {setChecked(true); onResult(result.passed);}}>{copy.check}</button>
      <button className="secondary" onClick={() => {setChoices({}); setChecked(false); setHints({});}}>{copy.retry}</button></div>
    {checked && <p role="status" data-testid="guided-result" className={result.passed ? "success-text" : "error-text"}>{result.passed ? copy.passed : copy.review}</p>}
    {completed && <p className="muted">{copy.saved}</p>}
  </section>;
}
