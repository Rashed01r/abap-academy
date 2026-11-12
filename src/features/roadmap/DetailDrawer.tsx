"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { localizedText } from "@/lib/language-policy";
import type { Locale } from "@/lib/engine";
import type { RoadmapCopy } from "@/lib/tree-copy";
import type { RoadmapNode } from "./data/roadmap-tree";
import { TCODE_XP } from "./data/tcodes";
import { FrequencyDots, frequencyLabel, lessonFile } from "./NodeCard";

export type LessonStatus = "completed" | "started" | "new";

/** Detail drawer for a lesson or a transaction code. Escape is handled by the parent. */
export function DetailDrawer({ node, open, lang, c, learned, lessonStatus, onClose, onLearn, onOpenLesson }: {
  node?: RoadmapNode; open: boolean; lang: Locale; c: RoadmapCopy;
  learned: boolean; lessonStatus: LessonStatus;
  onClose: () => void; onLearn: (n: RoadmapNode) => void; onOpenLesson: (n: RoadmapNode) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true });
  }, [open, node?.id]);
  const parent = node?.parent ? localizedText(node.parent.label, lang) : "";
  return <aside
    className={`drawer${open ? " open" : ""}${node?.kind === "lesson" ? " ide" : ""}`}
    style={node ? ({ "--c": node.color } as CSSProperties) : undefined}
    aria-label={node ? localizedText(node.label, lang) : undefined}
    aria-hidden={!open}
    inert={!open}
    data-drawer
  >
    {node && <>
      <button type="button" className="x" ref={closeRef} aria-label={c.close} onClick={onClose}>✕</button>
      {node.kind === "tcode" ? <TCodeDetail key={node.id} node={node} lang={lang} c={c} parent={parent} learned={learned} onLearn={onLearn} />
        : <LessonDetail node={node} lang={lang} c={c} parent={parent} status={lessonStatus} onOpenLesson={onOpenLesson} />}
    </>}
  </aside>;
}

function TCodeDetail({ node, lang, c, parent, learned, onLearn }: {
  node: RoadmapNode; lang: Locale; c: RoadmapCopy; parent: string; learned: boolean; onLearn: (n: RoadmapNode) => void;
}) {
  const t = node.tcode!;
  const [typed, setTyped] = useState("");
  const [shown, setShown] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(id => window.clearTimeout(id)), []);
  function run() {
    timers.current.forEach(id => window.clearTimeout(id));
    timers.current = [];
    setShown(false);
    setTyped("");
    const command = `/n${t.code}`;
    for (let i = 1; i <= command.length; i++) timers.current.push(window.setTimeout(() => setTyped(command.slice(0, i)), i * 90));
    timers.current.push(window.setTimeout(() => setShown(true), command.length * 90 + 250));
  }
  return <>
    <span className="tag">{c.tcodeTag} · {parent}</span>
    {t.classic && <span className="tag classic" title={c.classicNote}>{c.classic}</span>}
    <p className="big" dir="ltr">{t.code}</p>
    <h2>{localizedText(t.title, lang)}</h2>
    <h4>{c.whatItDoes}</h4><p>{localizedText(t.what, lang)}</p>
    {t.classic && <p className="note">{c.classicNote}</p>}
    <h4>{c.devTip}</h4><div className="tip">{localizedText(t.tip, lang)}</div>
    <h4 className="freq"><span>{frequencyLabel(t.frequency, c)}</span><FrequencyDots f={t.frequency} c={c} /></h4>
    <div className="sap" role="group" aria-label={c.commandField}>
      <div className="sapbar">
        <div className="cmd" aria-live="polite"><span>{typed}</span><i aria-hidden="true" /></div>
        <button type="button" className="run" onClick={run}>{c.run} ▶</button>
      </div>
      <div className={`win${shown ? " on" : ""}`} aria-hidden={!shown}>
        <div className="wt">{localizedText(t.title, lang)}</div>
        <div className="sk" style={{ width: "90%" }} /><div className="sk" style={{ width: "70%" }} /><div className="sk" style={{ width: "80%" }} />
        <div className="st" role="status">{shown ? `✓ ${c.started.replace("{code}", t.code)}` : ""}</div>
      </div>
    </div>
    <button type="button" className={`primary${learned ? " off" : ""}`} aria-pressed={learned} onClick={() => !learned && onLearn(node)}>
      {learned ? `${c.learned} ✓` : `${c.markLearned} · +${TCODE_XP} ${c.xp}`}
    </button>
  </>;
}

function LessonDetail({ node, lang, c, parent, status, onOpenLesson }: {
  node: RoadmapNode; lang: Locale; c: RoadmapCopy; parent: string; status: LessonStatus; onOpenLesson: (n: RoadmapNode) => void;
}) {
  const statusText = node.planned ? c.plannedTag : status === "completed" ? c.completed : status === "started" ? c.inProgress : c.notStarted;
  // Styled like a source file: tab bar, ABAP comment line, key/value table.
  return <>
    <div className="tb" dir="ltr"><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><span className="f">{lessonFile(node)}.abap</span></div>
    <div className="pad">
      <div className="cm">&quot; {node.planned ? c.plannedTag : c.lessonTag} · {localizedText(node.level, lang)} · {parent}</div>
      <h2>{localizedText(node.label, lang)}</h2>
      <p>{node.planned ? c.plannedText : localizedText(node.sub, lang)}</p>
      <dl className="kv">
        <div><dt>{c.partOf}</dt><dd className="str">&apos;{parent}&apos;</dd></div>
        <div><dt>status</dt><dd>{statusText}</dd></div>
        {!node.planned && <div><dt>{c.xp}</dt><dd>{node.xp}</dd></div>}
        {!!node.minutes && <div><dt>time</dt><dd>{c.duration.replace("{n}", String(node.minutes))}</dd></div>}
      </dl>
      {!node.planned && <button type="button" className={`cta${status === "completed" ? " off" : ""}`} onClick={() => onOpenLesson(node)}>
        <span>{status === "completed" ? `${c.completed} ✓ · ${c.openLesson}` : c.openLesson}</span><span aria-hidden="true">▶</span>
      </button>}
    </div>
  </>;
}
