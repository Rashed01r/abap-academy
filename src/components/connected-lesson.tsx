"use client";
import { localizedText } from "../lib/language-policy";
import { type Dispatch, type SetStateAction } from "react";
import { useTopicSession } from "@/lib/use-topic-session";
import { missions, orientation, paths } from "@/lib/curriculum";
import { getAnatomy, orientationExamples } from "@/lib/anatomy-content";
import { type Locale } from "@/lib/engine";
import { type Progress, allChallengesPassed, completeMission, startMission } from "@/lib/progress";
import { ui } from "@/lib/i18n";
import { treeCopy } from "@/lib/tree-copy";
import { SyntaxLab, Quiz } from "./syntax-lab";
import { LearningWorkspace } from "./learning-workspace";
import { TableCategoryExplorer } from "./table-category-explorer";
import { TableKeyExplorer } from "./table-key-explorer";
import { TechnicalText } from "./technical-text";
import { GuidedAssessment, GuidedExplorer } from "./guided-activity";
import { VisualCodeAnatomy } from "./visual-code-anatomy";
import { LessonConcepts, LessonAlternatives } from "./lesson-concepts";
import { ControlFlowExplorer } from "./control-flow-explorer";
import { recommendedLesson } from "@/lib/education-quality";
import { ObjectStorageDiagram, ReportFlowDiagram } from "./guided-concept-diagrams";
import { VisualClassroom } from "./visual-classroom";
import type { ClassroomSelection } from "./trace-classroom";

import { LessonHeader } from "./lesson-header";

type Tab = "learn" | "visualize" | "challenge";
const tabs: Tab[] = ["learn", "visualize", "challenge"];
export function ConnectedLesson({id, lang, theme, progress, setProgress, onNavigate}: {
  id: string; lang: Locale; theme: "light" | "dark"; progress: Progress; setProgress: Dispatch<SetStateAction<Progress>>; onNavigate?: (id: string) => void;
}) {
  const [tab, setTab] = useTopicSession<Tab>(`${id}:tab`, "learn");
  const [visited, setVisited] = useTopicSession<Tab[]>(`${id}:visited`, ["learn"]);
  const [quiz, setQuiz] = useTopicSession(`${id}:quiz`, false);
  const [orientationPassed, setOrientationPassed] = useTopicSession(`${id}:orientation-pass`, false);
  const m = missions.find(m => m.id === id), t = ui[lang], c = treeCopy[lang];
  const [challengeIndex, setChallengeIndex] = useTopicSession(`${id}:challenge-index`, 0);
  const [openedChallenges, setOpenedChallenges] = useTopicSession(`${id}:opened-challenges`, [0]);
  const complete = id === "orientation" ? progress.labs.includes(id) : progress.missions.includes(id);
  const code = m?.example || localizedText(orientationExamples, lang);
  const next = recommendedLesson(id, progress.missions, progress.labs);
  const [classroomSelection,setClassroomSelection] = useTopicSession<ClassroomSelection>(`${id}:classroom-selection`,{});
  const prerequisite = m?.prerequisite;
  const prerequisiteLesson = missions.find(lesson => lesson.id === prerequisite);
  const moduleInfo = paths.find(path => path.id === (m?.pathId || paths[0].id));
  function selectGroup(group:string){setClassroomSelection({group});}
  function select(next: Tab) { setTab(next); setVisited(v => Array.from(new Set([...v, next]))); }
  function attempt(challengeId: string, passed: boolean) {
    setProgress(p => ({...startMission(p, id),
      passedChallenges: passed ? Array.from(new Set([...(p.passedChallenges || []), challengeId])) : p.passedChallenges,
      results: {...p.results, [id]: {attempts: (p.results[id]?.attempts || 0) + 1, passed: passed || p.results[id]?.passed === true}},
    }));
  }
  return <div className="connected-lesson" dir={lang === "ar" ? "rtl" : "ltr"}>
    <LessonHeader key={id} lang={lang} onNavigate={onNavigate} lesson={{
      id, title:localizedText(m?.title,lang) || t.orientation,
      subtitle:m ? localizedText(m.subtitle,lang) : c.orientationIntro,
      level:m ? m.difficulty : "beginner", minutes:m ? m.minutes : 4, xp:m ? m.xp : 25,
      status:complete ? "completed" : progress.started?.includes(id) ? "in-progress" : "not-started",
      learningObjectives:m ? m.objectives.map(objective=>localizedText(objective,lang)) : [c.orientationObjective],
      moduleId:moduleInfo?.id, moduleName:moduleInfo ? localizedText(moduleInfo.title,lang) : undefined,
      recommendedFirst:prerequisite ? {
        id:prerequisite, title:prerequisiteLesson ? localizedText(prerequisiteLesson.title,lang) : t.orientation,
        completed:progress.missions.includes(prerequisite) || prerequisite === "orientation" && progress.labs.includes(prerequisite),
      } : undefined,
    }}/>
    <div className="lesson-tabs" role="tablist" aria-label={localizedText(m?.title, lang) || t.orientation}>
      {tabs.map((name, i) => <button key={name} id={`${id}-${name}-tab`} role="tab" aria-selected={tab === name} tabIndex={tab === name ? 0 : -1} aria-controls={`${id}-${name}-panel`} onClick={() => select(name)} onKeyDown={event => {
        const direction = lang === "ar" ? -1 : 1;
        const offset = event.key === "ArrowRight" ? direction : event.key === "ArrowLeft" ? -direction : 0;
        if (!offset && event.key !== "Home" && event.key !== "End") return;
        event.preventDefault();
        const next = tabs[event.key === "Home" ? 0 : event.key === "End" ? 2 : (i + offset + 3) % 3];
        select(next); document.getElementById(`${id}-${next}-tab`)?.focus();
      }}>{c[name]}</button>)}
    </div>
    {tabs.map(name => <section key={name} id={`${id}-${name}-panel`} role="tabpanel" aria-labelledby={`${id}-${name}-tab`} hidden={tab !== name} tabIndex={0}>
      {visited.includes(name) && (name === "learn" ? <>
        {tab === "learn" && <VisualClassroom id={id} lang={lang} theme={theme} selection={classroomSelection} onSelect={setClassroomSelection}/>}
        <h2 className="classroom-code-heading">{lang === "en" ? m?.activity === "table-categories" || id === "data-work-areas-field-symbols" ? "Browser practice: the executable subset" : "Understand the code" : m?.activity === "table-categories" || id === "data-work-areas-field-symbols" ? "تدريب المتصفح: المجموعة التنفيذية المدعومة" : "افهم الأكواد"}</h2>
        {m?.guided ? <>
          <p className="pill guided-boundary"><TechnicalText>{localizedText(m.guided.boundary, lang)}</TechnicalText></p>
          <p className="muted">{lang === "en" ? "Examples are independent lesson fixtures. Repeated names do not imply a shared SAP data model or an activation sequence." : "أمثلة الدروس مستقلة. لا يعني تكرار الأسماء وجود نموذج بيانات SAP مشترك أو تسلسل لتفعيل الكائنات."}</p>
          <div className="primary-code-anatomy"><VisualCodeAnatomy doc={getAnatomy(id, code)} lang={lang} theme={theme} selectedGroup={classroomSelection.group} onGroupSelect={selectGroup} onMatched={() => setProgress(p => ({...p, labs: Array.from(new Set([...p.labs, id]))}))} references={m.references}/></div>
        </> : <SyntaxLab id={id} tokens={m?.tokens || orientation} example={code} lang={lang} theme={theme} selectedGroup={classroomSelection.group} onGroupSelect={selectGroup} completed={progress.labs.includes(id)} onComplete={() => {
          if (m) setProgress(p => ({...p, labs: Array.from(new Set([...p.labs, id]))}));
          select("visualize");
        }}/>}
        {tab === "learn" && <LessonAlternatives id={id} lang={lang} theme={theme}/>}
        <LessonConcepts id={id} lang={lang} onConceptSelect={ref=>{const [kind,key]=ref.split(":");if(kind === "group") selectGroup(key);else if(kind === "artifact") setClassroomSelection({artifact:key});}}/>
        {m && <details><summary>{c.deeper}</summary><p>{localizedText(m.brief, lang)}</p><p>{localizedText(m.practice, lang)}</p>{m.references?.map(ref => <p key={ref}><a href={ref} target="_blank" rel="noreferrer">{ref}</a></p>)}</details>}
      </> : name === "visualize" ? <>
        <p className="instruction"><TechnicalText>{localizedText(m?.visual, lang) || c.orientationIntro}</TechnicalText></p>
        <p className="pill">{m?.guided ? localizedText(m.guided.boundary, lang) : t.limit}</p>
        {tab === "visualize" && (id === "data-table-categories" || id === "data-work-areas-field-symbols") && <VisualClassroom id={id} lang={lang} theme={theme} selection={classroomSelection} onSelect={setClassroomSelection}/>}
        {tab === "visualize" && id === "oop-introduction" && <ObjectStorageDiagram traceDoc={getAnatomy(id,code)} lang={lang}/>}
        {tab === "visualize" && id === "applications-reports" && <ReportFlowDiagram traceDoc={getAnatomy(id,code)} lang={lang}/>}
        {tab === "visualize" && (id === "conditions" || id === "loop-control") && <ControlFlowExplorer id={id} lang={lang}/>}
        {tab === "visualize" && <LessonAlternatives id={id} lang={lang} theme={theme}/>}
        {m?.activity === "table-categories" && <TableCategoryExplorer sessionKey={`${id}:visual-model`} lang={lang} assessment={false} onPass={() => {}}/>}
        {m?.activity === "table-keys" && <TableKeyExplorer sessionKey={`${id}:visual-model`} lang={lang} assessment={false} onPass={() => {}}/>}
        {m?.guided ? tab === "visualize" && <GuidedExplorer definition={m.guided} lang={lang}/> : <LearningWorkspace initialCode={code} lang={lang} theme={theme} storageKey={`abap2-workspace:${id}:visualize`}/>}
      </> : <>
        <p className="instruction"><TechnicalText>{localizedText(m?.goal, lang) || c.orientationGoal}</TechnicalText></p>
        <p>{c.help} <button className="text-button" onClick={() => select("learn")}>{c.learn}</button> · <button className="text-button" onClick={() => select("visualize")}>{c.visualize}</button></p>
        {m?.activity === "table-categories" && <TableCategoryExplorer sessionKey={`${id}:assessment-model`} lang={lang} assessment completed={progress.passedChallenges?.includes("data-category-choice")} onPass={() => attempt("data-category-choice", true)}/>}
        {m?.activity === "table-keys" && <TableKeyExplorer sessionKey={`${id}:assessment-model`} lang={lang} assessment completed={progress.passedChallenges?.includes("data-key-design")} onPass={() => attempt("data-key-design", true)}/>}
        {m?.guided ? <>
          <p className="pill guided-boundary">{localizedText(m.guided.boundary, lang)}</p>
          <GuidedAssessment definition={m.guided} lang={lang} completed={progress.passedChallenges?.includes(`${id}-assessment`) || false} onResult={passed => attempt(`${id}-assessment`, passed)}/>
        </> : m ? <>
          {m.challenges && <div className="explore-actions" role="group" aria-label={c.challenge}>{m.challenges.map((ch, index) => <button className="secondary" key={ch.id} aria-pressed={challengeIndex === index} onClick={() => {setChallengeIndex(index); setOpenedChallenges(v => Array.from(new Set([...v, index])));}}>{localizedText(ch.title, lang)}</button>)}</div>}
          {(m.challenges || [m]).map((ch, index) => <div key={ch.id} hidden={index !== challengeIndex}>{openedChallenges.includes(index) && <>
            {m.challenges && <><h2>{localizedText(ch.title, lang)}</h2><p>{localizedText(ch.goal, lang)}</p></>}
            <LearningWorkspace initialCode={lang === "ar" ? ch.starterAr || ch.starter : ch.starter} lang={lang} theme={theme} mission={{...m, ...ch}} storageKey={`abap2-workspace:${id}:challenge:${ch.id}`} onResult={(passed, checked) => {if (checked) attempt(ch.id, passed);}}/>
          </>}</div>)}
        </> : <LearningWorkspace initialCode={"WRITE 5.\n"} hintText={c.orientationHint} lang={lang} theme={theme} storageKey="abap2-workspace:orientation:challenge" checkAnswer={(_source, events) => {
          const writes = events.filter(e => e.operation === "write");
          return writes.length === 2 && JSON.stringify(events.at(-1)?.output) === JSON.stringify(["5", "8"]);
        }} onResult={(correct, checked) => {setOrientationPassed(correct); if (checked) setProgress(p => startMission(p, id));}}/>}
        <Quiz sessionKey={`${id}:quiz-choice`} lang={lang} question={localizedText(m?.quiz, lang) || c.orientationQuestion} options={m?.options.map(o => localizedText(o, lang)) || [c.orientationAnswer, c.orientationWrong]} answer={m?.answer || 0} explanation={localizedText(m?.quizExplanation, lang) || c.orientationExplanation} onCorrect={() => setQuiz(true)}/>
        <p>{t.assessmentRequired}</p>
        <button className="primary" disabled={!quiz || (m ? !allChallengesPassed(progress, id) : !orientationPassed)} onClick={() => setProgress(p => m ? completeMission(p, id, true) : {...p, labs: Array.from(new Set([...p.labs, id]))})}>{complete ? t.completed : t.complete}</button>
      </>)}
    </section>)}
    {complete && next && onNavigate && <aside className="lesson-recommendation"><p>{lang === "en" ? "Suggested next step: build on this topic. Every implemented lesson remains open." : "الخطوة التالية المقترحة: ابنِ على هذا الموضوع. تظل جميع الدروس المنفّذة متاحة."}</p><button className="secondary" onClick={() => onNavigate(next.id)}>{lang === "en" ? "Explore next: " : "استكشف التالي: "}{localizedText(next.title, lang)}</button></aside>}
  </div>;
}
