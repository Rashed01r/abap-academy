"use client";
import { useMemo } from "react";
import type { CodeAnatomy } from "@/lib/code-anatomy";
import { eventsForGroup, groupAtLine, lineRange } from "@/lib/code-anatomy";
import { anatomyConcepts } from "@/lib/anatomy-concepts";
import { parse, simulate, type Locale } from "@/lib/engine";
import { ui } from "@/lib/i18n";
import { TechnicalText } from "./technical-text";
import { LearningWorkspace } from "./learning-workspace";
import { FieldSymbolMemory } from "./field-symbol-memory";
import { LookupSummary } from "./lookup-summary";
import { TableChangeSummary } from "./table-change-summary";
import { useTopicSession } from "@/lib/use-topic-session";

export function VisualCodeAnatomy({doc,lang,theme,onExplore,onMatched,references=[],selectedGroup,onGroupSelect}: {
  doc:CodeAnatomy;lang:Locale;theme:"light"|"dark";onExplore?:(refs:string[])=>void;onMatched:()=>void;references?:string[];selectedGroup?:string;onGroupSelect?:(id:string)=>void;
}) {
  const [selectedId,setSelectedId]=useTopicSession(`${doc.id}:anatomy-group`,doc.groups[0].id);
  const [field,setField]=useTopicSession<string | undefined>(`${doc.id}:anatomy-field`,undefined);
  const [showTrace,setShowTrace]=useTopicSession(`${doc.id}:anatomy-trace`,false);
  const [question,setQuestion]=useTopicSession(`${doc.id}:anatomy-question`,0);
  const [matched,setMatched]=useTopicSession<string[]>(`${doc.id}:anatomy-matched`,[]);
  const [feedback,setFeedback]=useTopicSession<"right"|"wrong" | undefined>(`${doc.id}:anatomy-feedback`,undefined);
  const t=ui[lang];
  const group=doc.groups.find(g=>g.id === (selectedGroup || selectedId)) || doc.groups[0];
  const activeId=group.id;
  const events=useMemo(()=>doc.referenceOnly ? [] : simulate(doc.source),[doc.source, doc.referenceOnly]);
  const definition=useMemo(()=>doc.referenceOnly ? undefined : parse(doc.source).find(n=>n.kind === "define"),[doc.source, doc.referenceOnly]);
  const visits=eventsForGroup(group,events);
  const snapshot=visits.findLast(event=>event.range.endLine <= (group.visualizer?.line || group.range.endLine));
  const changes=new Set(visits.flatMap(e=>e.changed));
  const selectedField=group.fields?.find(f=>f.name === field);
  const learningRange=selectedField ? lineRange(doc.source,selectedField.line,selectedField.line) : group.range;
  const lines=doc.source.split("\n");
  const prompt=doc.groups.find(g=>g.id === doc.checks[question])!;
  function select(id:string) {setSelectedId(id);onGroupSelect?.(id);setField(undefined);setFeedback(undefined);}
  return <div className="visual-code-anatomy">
    <div className="anatomy-layout">
      <div className="anatomy-code" dir="ltr" aria-label={t.anatomy}>
        {doc.groups.map((item,index)=>{
          const gapStart=index ? doc.groups[index-1].range.endLine : 0;
          return <div key={item.id}>
            {lines.slice(gapStart,item.range.startLine-1).map((line,i)=><div className="anatomy-gap" key={i}>{line || "\u00a0"}</div>)}
            <button type="button" className={`anatomy-group ${item.id === activeId ? "selected" : ""}`} data-group={item.id} aria-pressed={item.id === activeId} aria-controls={`${doc.id}-anatomy-explanation`} onClick={()=>select(item.id)}>
              <span className="anatomy-group-label" dir={lang === "ar" ? "rtl" : "ltr"}><span>{index+1}</span> {item.title[lang]}</span>
              <code>{lines.slice(item.range.startLine-1,item.range.endLine).map((line,i)=>{
                const lineNumber=item.range.startLine+i;
                return <span key={lineNumber} data-source-line={lineNumber} className={`anatomy-source-line ${item.id === activeId && (!selectedField || lineNumber === selectedField.line) ? "anatomy-selected-line" : ""}`}><span className="anatomy-line-number" aria-hidden="true">{lineNumber}</span><span>{line || "\u00a0"}</span></span>;
              })}</code>
            </button>
          </div>;
        })}
      </div>
      <article className="anatomy-explanation" id={`${doc.id}-anatomy-explanation`}>
        <div aria-live="polite"><span className="eyebrow">{t.learningSelection}</span><h3>{group.title[lang]}</h3><p><TechnicalText>{group.explanation[lang]}</TechnicalText></p></div>
        {group.fields && <details className="anatomy-fields"><summary>{t.inspectFields}</summary><div className="explore-actions">{group.fields.map(f=><button key={f.name} className="secondary" aria-pressed={field === f.name} onClick={()=>setField(f.name)}><code>{f.name}</code></button>)}</div>{selectedField && <p><TechnicalText>{selectedField.explanation[lang]}</TechnicalText></p>}</details>}
        {!doc.referenceOnly && <section className="anatomy-result" aria-label={t.selectedResult}>
          <h4>{group.visualizer?.kind === "type" ? t.blueprint : t.selectedResult}</h4>
          {group.visualizer?.kind === "type" && definition?.kind === "define" ? <><code dir="ltr">{definition.name}</code><p>{t.noRecord}</p><dl>{Object.entries(definition.fields).map(([name,type])=><div key={name} className={(field ? field === name : !!group.fields) ? "anatomy-field-active" : ""}><dt><code>{name}</code></dt><dd><code>{type}</code></dd></div>)}</dl></> : !group.visualizer ? <p>{t.noAnatomyState}</p> : !snapshot ? <p>{t.notReached}</p> : <>
            {snapshot.condition && <p className="anatomy-condition" dir="ltr">{snapshot.condition.expression} → {String(snapshot.condition.result)}</p>}
            {snapshot.loop && <p>{t.iteration}: <b>{snapshot.loop.iteration}</b></p>}
            <div className="anatomy-memory">{Object.entries(snapshot.memory).map(([name,value])=><div key={name} className="anatomy-memory-card"><code dir="ltr">{name}</code>{doc.id === "structures" && name === "ls_employee" && <h4>{t.employeeRecord}</h4>}{Array.isArray(value) ? <pre dir="ltr">{JSON.stringify(value,null,2)}</pre> : typeof value === "object" ? <dl>{Object.entries(value).map(([key,v])=><div key={key} className={changes.has(`${name}-${key}`) ? "anatomy-field-active" : ""}><dt><code>{key}</code></dt><dd><bdi dir="ltr">{v === "" ? '""' : String(v)}</bdi></dd></div>)}</dl> : <strong dir="ltr">{value === "" ? '""' : String(value)}</strong>}</div>)}</div>
            {!!snapshot.output.length && <div className={`anatomy-output ${visits.some(e=>e.operation === "write") ? "anatomy-field-active" : ""}`}><h4>{t.output}</h4><pre dir="ltr">{snapshot.output.join("\n")}</pre></div>}
            <FieldSymbolMemory event={snapshot} previous={events[snapshot.id - 1]} lang={lang} />
            <LookupSummary event={snapshot} previous={events[snapshot.id - 1]} lang={lang} showTable />
            <TableChangeSummary event={snapshot} lang={lang} />
            {!Object.keys(snapshot.memory).length && !snapshot.output.length && <p>{t.noAnatomyState}</p>}
            <p className="small muted">{t.afterVisit}</p>
          </>}
        </section>}
        {!doc.referenceOnly && onExplore && <button className="secondary" onClick={()=>onExplore(group.syntaxRefs || [])}>{t.exploreSyntax}</button>}
        <details className="anatomy-more"><summary>{t.learnMore}</summary>{group.detail && <p><TechnicalText>{group.detail[lang]}</TechnicalText></p>}{group.glossaryRefs?.map(ref=>{
          const concept=anatomyConcepts[ref];
          return <div key={ref}><dl><dt>{t.meaning}</dt><dd><TechnicalText>{concept.meaning[lang]}</TechnicalText></dd><dt>{t.whenUsed}</dt><dd><TechnicalText>{concept.when[lang]}</TechnicalText></dd></dl><pre dir="ltr">{concept.example}</pre><p><strong>{t.mistake}: </strong><TechnicalText>{concept.mistake[lang]}</TechnicalText></p><p><TechnicalText>{concept.detail[lang]}</TechnicalText></p></div>;
        })}</details>
      </article>
    </div>
    <section className="anatomy-match" aria-label={t.matchCode}>
      <h3>{t.matchCode}</h3><p className="anatomy-prompt"><TechnicalText>{prompt.practice![lang]}</TechnicalText></p>
      <p>{matched.length} / {doc.checks.length} {t.matchProgress}</p>
      <div className="explore-actions"><button className="secondary" onClick={()=>{
        const correct=activeId === prompt.id;setFeedback(correct ? "right" : "wrong");
        if(correct) {const next=Array.from(new Set([...matched,prompt.id]));setMatched(next);if(next.length === doc.checks.length) onMatched();}
      }}>{t.checkGroup}</button><button className="secondary" onClick={()=>{setQuestion(i=>(i+1)%doc.checks.length);setFeedback(undefined);}}>{t.nextMatch}</button></div>
      {feedback && <p role="status" className={feedback === "right" ? "success-text" : "error-text"}>{feedback === "right" ? t.matchRight : t.matchWrong}</p>}
      {matched.length === doc.checks.length && <p className="success-text">{t.matchReady}</p>}
    </section>
    {!doc.referenceOnly && <div className="anatomy-execution-toggle"><button className="secondary" aria-expanded={showTrace} onClick={()=>setShowTrace(!showTrace)}>{showTrace ? t.hideAnatomy : t.watchAnatomy}</button></div>}
    {!doc.referenceOnly && showTrace && <div className="anatomy-trace"><p>{t.selectionHelp}</p><LearningWorkspace initialCode={doc.source} lang={lang} theme={theme} teachingRange={learningRange} teachingSource={doc.source} onSourceLine={line=>{const selected=groupAtLine(doc,line);if(selected) select(selected.id);}}/></div>}
    {!!references.length && <details className="anatomy-references"><summary>{t.referenceLinks}</summary><ul>{references.map((url,i)=><li key={url}><a href={url} target="_blank" rel="noreferrer">SAP · {i+1}</a></li>)}</ul></details>}
  </div>;
}
