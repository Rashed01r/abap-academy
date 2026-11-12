"use client";
import { memo, type CSSProperties, type PointerEvent } from "react";
import { localizedText } from "@/lib/language-policy";
import type { Locale } from "@/lib/engine";
import type { RoadmapCopy } from "@/lib/tree-copy";
import type { RoadmapNode } from "./data/roadmap-tree";
import { HT, WD } from "./useRoadmapLayout";

export function frequencyLabel(f: 1 | 2 | 3, c: RoadmapCopy) {
  return f === 3 ? c.daily : f === 2 ? c.often : c.sometimes;
}

export function FrequencyDots({ f, c }: { f: 1 | 2 | 3; c: RoadmapCopy }) {
  return <span className="dots" role="img" aria-label={frequencyLabel(f, c)}>
    {[1, 2, 3].map(i => <b key={i} className={i <= f ? "on" : ""} />)}
  </span>;
}

export function chipText(n: RoadmapNode, lang: Locale, c: RoadmapCopy) {
  if (n.kind === "path") return `${n.count} ${n.id === "tcodes" ? c.tcodes : c.lessons}`;
  if (n.kind === "cat" && n.branch === "tcodes") return `${n.count} ${c.tcodes}`;
  return localizedText(n.chip, lang);
}

/** Lesson card as a tiny editor tab: file name plus a status LED. Shared by the canvas and the mobile list. */
export function LessonCardBody({ n, lang, c, done, started }: { n: RoadmapNode; lang: Locale; c: RoadmapCopy; done: boolean; started: boolean }) {
  const status = n.planned ? c.plannedTag : done ? c.completed : started ? c.inProgress : c.notStarted;
  return <>
    <span className="bar" dir="ltr"><span className="id">{lessonFile(n)}</span>.abap<span className="led"><i aria-hidden="true" />{status}</span></span>
    <span className="in"><span className="t">{localizedText(n.label, lang)}</span><span className="s">{localizedText(n.sub, lang)}</span></span>
  </>;
}

/** T-code card as an editor tab, the amber sibling of the lesson card. Shared by the canvas and the mobile list. */
export function TCodeCardBody({ n, lang, c }: { n: RoadmapNode; lang: Locale; c: RoadmapCopy }) {
  const t = n.tcode!;
  return <>
    <span className="bar" dir="ltr"><span className="code">{t.code}</span>.tcode{t.classic && <span className="cl">{c.classic}</span>}<FrequencyDots f={t.frequency} c={c} /></span>
    <span className="in"><span className="t">{localizedText(n.label, lang)}</span><span className="s">{localizedText(n.sub, lang)}</span></span>
  </>;
}

export const lessonFile = (n: RoadmapNode) => n.missionId || n.id.replace(/[^a-z0-9]+/gi, "_");

const icons: Record<string, React.ReactNode> = {
  learn: <><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2.5 9 2.5 12 0v-5" /></>,
  tcodes: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9l3 3-3 3M13 15h4" /></>,
};

/** The ABAP hub as an editor window: traffic-light tab bar, then the big title. */
export function RootCardBody({ c }: { c: RoadmapCopy }) {
  return <>
    <span className="bar" dir="ltr"><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><span className="f">main.abap</span></span>
    <span className="in"><span className="rt">ABAP</span><span className="rs">{c.hub}</span></span>
  </>;
}

/** Path and group cards as editor folders: folder name, count/level chip and chevron in the tab bar. */
export function FolderCardBody({ n, lang, c }: { n: RoadmapNode; lang: Locale; c: RoadmapCopy }) {
  return <>
    <span className="bar">
      {n.kind === "path" && <svg className="ico" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[n.id]}</svg>}
      <span className="dir" dir="ltr">{n.id.split(":").pop()}/</span>
      <span className="chip">{chipText(n, lang, c)}</span><span className="chev" aria-hidden="true">›</span>
    </span>
    <span className="in"><span className="t">{localizedText(n.label, lang)}</span><span className="s">{localizedText(n.sub, lang)}</span></span>
  </>;
}

/** One roadmap node. Position and opacity are written by useRoadmapLayout, not by React. */
export const NodeCard = memo(function NodeCard({ node: n, lang, c, active, done, started, nodeRef, onSelect }: {
  node: RoadmapNode; lang: Locale; c: RoadmapCopy; active: boolean; done: boolean; started: boolean;
  nodeRef: (el: HTMLDivElement | null) => void; onSelect: (n: RoadmapNode) => void;
}) {
  const label = n.kind === "tcode" ? `${n.tcode!.code}, ${localizedText(n.label, lang)}` : localizedText(n.label, lang);
  const expandable = n.children.length > 0 && n.kind !== "root";
  const hover = (e: PointerEvent<HTMLButtonElement>) => {
    const b = e.currentTarget, r = b.getBoundingClientRect(), k = r.width / b.offsetWidth || 1;
    b.style.setProperty("--mx", `${(e.clientX - r.left) / k}px`);
    b.style.setProperty("--my", `${(e.clientY - r.top) / k}px`);
  };
  return <div className="n" ref={nodeRef} data-node={n.id} style={{ width: WD[n.depth], height: HT[n.depth] }}>
    <button
      type="button"
      className={`card k-${n.kind}${active ? " act" : ""}${done ? " done" : ""}${started && !done ? " started" : ""}${n.planned ? " planned" : ""}`}
      style={{ "--c": n.color } as CSSProperties}
      aria-expanded={expandable ? active : undefined}
      aria-pressed={!expandable && n.kind !== "root" ? active : undefined}
      aria-label={n.kind === "root" ? `ABAP, ${c.hub}` : `${label}${done ? `, ${n.kind === "tcode" ? c.learned : c.completed}` : ""}`}
      onClick={() => onSelect(n)}
      onPointerMove={hover}
    >
      {n.kind === "root" && <RootCardBody c={c} />}
      {(n.kind === "path" || n.kind === "cat") && <FolderCardBody n={n} lang={lang} c={c} />}
      {n.kind === "lesson" && <LessonCardBody n={n} lang={lang} c={c} done={done} started={started} />}
      {n.kind === "tcode" && <TCodeCardBody n={n} lang={lang} c={c} />}
    </button>
  </div>;
});
