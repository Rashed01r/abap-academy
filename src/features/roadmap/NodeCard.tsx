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

const icons: Record<string, React.ReactNode> = {
  learn: <><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2.5 9 2.5 12 0v-5" /></>,
  tcodes: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9l3 3-3 3M13 15h4" /></>,
};

/** One roadmap node. Position and opacity are written by useRoadmapLayout, not by React. */
export const NodeCard = memo(function NodeCard({ node: n, lang, c, active, done, nodeRef, onSelect }: {
  node: RoadmapNode; lang: Locale; c: RoadmapCopy; active: boolean; done: boolean;
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
      className={`card k-${n.kind}${active ? " act" : ""}${done ? " done" : ""}${n.planned ? " planned" : ""}`}
      style={{ "--c": n.color } as CSSProperties}
      aria-expanded={expandable ? active : undefined}
      aria-pressed={!expandable && n.kind !== "root" ? active : undefined}
      aria-label={n.kind === "root" ? `ABAP, ${c.hub}` : undefined}
      onClick={() => onSelect(n)}
      onPointerMove={hover}
    >
      {n.kind === "root" && <><span className="rt">ABAP</span><span className="rs">{c.hub}</span></>}
      {n.kind === "path" && <>
        <span className="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[n.id]}</svg></span>
        <span className="t">{label}</span><span className="s">{localizedText(n.sub, lang)}</span>
        <span className="chip">{chipText(n, lang, c)}</span><span className="chev" aria-hidden="true">›</span>
      </>}
      {n.kind === "cat" && <>
        <span className="t">{label}</span><span className="s">{localizedText(n.sub, lang)}</span>
        <span className="chip">{chipText(n, lang, c)}</span><span className="chev" aria-hidden="true">›</span>
      </>}
      {n.kind === "lesson" && <>
        <span className="t">{label}</span><span className="s">{localizedText(n.sub, lang)}</span>
        {done && <span className="sr-only">{c.completed}</span>}
      </>}
      {n.kind === "tcode" && <>
        <span className="code" dir="ltr">{n.tcode!.code}</span><span className="t">{localizedText(n.label, lang)}</span>
        <span className="s">{localizedText(n.sub, lang)}</span>
        <FrequencyDots f={n.tcode!.frequency} c={c} />
        {done && <span className="sr-only">{c.learned}</span>}
      </>}
    </button>
  </div>;
});
