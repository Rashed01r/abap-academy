"use client";
import { localizedText } from "../lib/language-policy";
import { educationContent, educationExampleFragments } from "@/lib/education-content";
import { missions, orientation } from "@/lib/curriculum";
import { getAnatomy, orientationExamples } from "@/lib/anatomy-content";
import { educationScenarios } from "@/lib/education-scenarios";
import type { Locale } from "@/lib/engine";
import { useTopicSession } from "@/lib/use-topic-session";
import { TechnicalText } from "./technical-text";
import { Quiz } from "./syntax-lab";
import { VisualCodeAnatomy } from "./visual-code-anatomy";

export function LessonConcepts({id, lang,onConceptSelect}: {id: string; lang: Locale;onConceptSelect?:(ref:string)=>void}) {
  const spec = educationContent[id];
  const [selected, setSelected] = useTopicSession(`${id}:essential-concept`, spec?.concepts[0]?.id || "");
  if (!spec) return null;
  const concept = spec.concepts.find(c => c.id === selected) || spec.concepts[0];
  const mission = missions.find(m => m.id === id);
  const anatomy = getAnatomy(id, mission?.example || localizedText(orientationExamples, lang));
  const examples = concept.learn.map(ref => {
    const [kind, key] = ref.split(":");
    if (kind === "illustration") return {ref, code: educationExampleFragments[key]};
    if (kind === "group") {
      const g = anatomy.groups.find(g => g.id === key)!;
      return {ref, code: anatomy.source.split("\n").slice(g.range.startLine - 1, g.range.endLine).join("\n")};
    }
    if (kind === "token") return {ref, code: (mission?.tokens || orientation).find(t => t.id === key)!.correct};
    return {ref, code: mission!.guided!.artifacts.find(a => a.id === key)!.example};
  });
  const labels = lang === "en" ? {
    concepts: "Essential concepts", why: "Why use it?", check: "Check your understanding",
    question: `Which statement correctly describes ${concept.name.en}?`,
    example: "Example / reference", reference: "Guided reference; this code needs the stated SAP environment.",
  } : {
    concepts: "المفاهيم الأساسية", why: "لماذا نستخدمه؟", check: "تحقق من فهمك",
    question: `أي عبارة تصف «${concept.name.ar}» بصورة صحيحة؟`,
    example: "مثال / مرجع", reference: "مرجع موجّه؛ تتطلب هذه الأكواد بيئة SAP الموضحة في الدرس.",
  };
  // Alternate the answer location without randomization or progress/XP side effects.
  const answer = spec.concepts.indexOf(concept) % 2;
  const options = answer ? [concept.misconception, concept.explanation] : [concept.explanation, concept.misconception];
  return <section className="lesson-concepts" aria-label={labels.concepts}>
    <h2>{labels.concepts}</h2>
    <div className="concept-choices" role="group" aria-label={labels.concepts}>
      {spec.concepts.map(c => <button className="secondary" key={c.id} aria-label={localizedText(c.name, lang)} aria-pressed={c.id === concept.id} aria-controls={`${id}-concept-detail`} onClick={() => {setSelected(c.id);onConceptSelect?.(c.learn[0]);}}><TechnicalText>{localizedText(c.name, lang)}</TechnicalText></button>)}
    </div>
    <article id={`${id}-concept-detail`} className="concept-detail" data-concept={`${id}/${concept.id}`}>
      <h3>{localizedText(concept.name, lang)}</h3><p><TechnicalText>{localizedText(concept.explanation, lang)}</TechnicalText></p>
      <section className="concept-worked-example"><h4>{labels.example}</h4>
        {(mission?.guided || id === "data-table-categories" && concept.id !== "standard") && <p className="muted">{labels.reference}</p>}
        {examples.map(ex => <pre key={ex.ref} dir="ltr"><code>{ex.code}</code></pre>)}
      </section>
      <section className="concept-quick-check"><h4>{labels.check}</h4>
        <Quiz key={concept.id} sessionKey={`${id}:concept-check:${concept.id}`} lang={lang} question={labels.question} options={options.map(o => localizedText(o, lang))} answer={answer} explanation={localizedText(concept.explanation, lang)} onCorrect={() => {}}/>
      </section>
    </article>
  </section>;
}

export function LessonAlternatives({id, lang, theme}: {id: string; lang: Locale; theme: "light" | "dark"}) {
  const scenarios = educationScenarios[id] || [];
  const [selected, setSelected] = useTopicSession(`${id}:alternative-example`, "");
  if (!scenarios.length) return null;
  const active = scenarios.find(s => s.id === selected);
  return <section className="lesson-alternatives" aria-label={lang === "en" ? "Compare code examples" : "مقارنة أمثلة الأكواد"}>
    <h2>{lang === "en" ? "Another behavior to understand" : "سلوك آخر يجب فهمه"}</h2>
    <p>{lang === "en" ? "Select a scenario to inspect its code groups and outcome." : "اختر سيناريو لفحص مجموعات أكواده ونتيجته."}</p>
    <div className="explore-actions">{scenarios.map(s => <button className="secondary" key={s.id} aria-pressed={s.id === active?.id} onClick={() => setSelected(s.id)}>{localizedText(s.title, lang)}</button>)}</div>
    {active?.boundary && <p className="pill guided-boundary">{localizedText(active.boundary, lang)}</p>}
    {active && <VisualCodeAnatomy key={active.id} doc={active.doc} lang={lang} theme={theme} onMatched={() => {}}/>}
  </section>;
}
