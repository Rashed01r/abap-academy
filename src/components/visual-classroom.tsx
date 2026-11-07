"use client";
import { localizedText } from "../lib/language-policy";
import { missions } from "@/lib/curriculum";
import { getAnatomy, orientationExamples } from "@/lib/anatomy-content";
import { educationContent } from "@/lib/education-content";
import { visualPresentations } from "@/lib/visual-presentations";
import type { Locale } from "@/lib/engine";
import { TraceClassroom, type ClassroomSelection } from "./trace-classroom";
import { TableCategoryClassroom } from "./table-category-classroom";
import { RowAccessClassroom } from "./row-access-classroom";
import { ArchitectureClassroom } from "./architecture-classroom";
import { ExpressionClassroom } from "./expression-classroom";
import { ObjectStorageDiagram, ReportFlowDiagram } from "./guided-concept-diagrams";
import { SqlFoundationLab } from "./sql-foundation-lab";

export function VisualClassroom({id,lang,theme,selection,onSelect}: {id:string;lang:Locale;theme:"light"|"dark";selection:ClassroomSelection;onSelect:(s:ClassroomSelection)=>void}) {
  const mission=missions.find(m=>m.id === id), content=educationContent[id], family=visualPresentations[id];
  return <section className="visual-classroom" aria-label={lang === "en" ? "Visual classroom" : "الفصل البصري"} data-visual-family={family}>
    <header className="visual-introduction"><span className="visual-kicker">{lang === "en" ? "SEE · UNDERSTAND · EXPLORE" : "شاهد · افهم · استكشف"}</span><p>{localizedText(content.what, lang)}</p><span className="visual-business-example">{localizedText(content.why, lang)}</span></header>
    {family === "categories" ? <TableCategoryClassroom lang={lang} theme={theme}/> : family === "row-access" ? <RowAccessClassroom lang={lang} theme={theme}/> : family === "relationships" && mission?.guided ? <ArchitectureClassroom definition={mission.guided} lang={lang} selection={selection} onSelect={onSelect}/> : family === "sql" ? <div data-primary-diagram="sql"><SqlFoundationLab lang={lang} onSourceGroup={group=>onSelect({group})}/></div> : family === "objects" ? <div data-primary-diagram="objects"><ObjectStorageDiagram traceDoc={getAnatomy(id,mission?.example || localizedText(orientationExamples, lang))} lang={lang} onSourceGroup={group=>onSelect({group})}/></div> : family === "report" ? <div data-primary-diagram="report"><ReportFlowDiagram traceDoc={getAnatomy(id,mission?.example || localizedText(orientationExamples, lang))} lang={lang} onSourceGroup={group=>onSelect({group})}/></div> : family === "expressions" ? <ExpressionClassroom lang={lang} onSelect={onSelect}/> : <TraceClassroom id={id} doc={getAnatomy(id,mission?.example || localizedText(orientationExamples, lang))} lang={lang} selection={selection} onSelect={onSelect} flow={family === "flow"}/>}
  </section>;
}
