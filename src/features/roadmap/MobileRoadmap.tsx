"use client";
import type { CSSProperties, ReactNode } from "react";
import { localizedText } from "@/lib/language-policy";
import type { Locale } from "@/lib/engine";
import type { RoadmapCopy } from "@/lib/tree-copy";
import type { RoadmapNode } from "./data/roadmap-tree";
import { FolderCardBody, LessonCardBody, RootCardBody, TCodeCardBody } from "./NodeCard";

/** Below 820px: the same tree as a vertical accordion. Uses the same expand/select rules. */
export function MobileRoadmap({ root, expanded, selectedId, lang, c, isDone, isStarted, onSelect, children }: {
  root: RoadmapNode; expanded: ReadonlySet<string>; selectedId?: string; lang: Locale; c: RoadmapCopy;
  isDone: (n: RoadmapNode) => boolean; isStarted: (n: RoadmapNode) => boolean; onSelect: (n: RoadmapNode) => void; children?: ReactNode;
}) {
  function item(n: RoadmapNode): ReactNode {
    const open = expanded.has(n.id);
    const expandable = n.children.length > 0;
    const done = isDone(n), started = !done && isStarted(n);
    const panelId = `m-${n.id.replace(/[^a-z0-9-]/gi, "-")}`;
    return <li key={n.id} className={`m-item m-d${n.depth}`}>
      <button type="button" data-mobile-node={n.id}
        className={`card k-${n.kind}${open || selectedId === n.id ? " act" : ""}${done ? " done" : ""}${started ? " started" : ""}${n.planned ? " planned" : ""}`}
        style={{ "--c": n.color } as CSSProperties}
        aria-label={`${n.kind === "tcode" ? `${n.tcode!.code}, ` : ""}${localizedText(n.label, lang)}${done ? `, ${n.kind === "tcode" ? c.learned : c.completed}` : ""}`}
        aria-expanded={expandable ? open : undefined} aria-controls={expandable ? panelId : undefined}
        onClick={() => onSelect(n)}>
        {n.kind === "lesson" ? <LessonCardBody n={n} lang={lang} c={c} done={done} started={started} />
          : n.kind === "tcode" ? <TCodeCardBody n={n} lang={lang} c={c} /> : <FolderCardBody n={n} lang={lang} c={c} />}
      </button>
      {expandable && open && <ul id={panelId} className="m-list">{n.children.map(item)}</ul>}
    </li>;
  }
  return <div className="mobile-roadmap">
    <div className="m-scroll">
      <button type="button" className="card k-root m-root" data-mobile-node={root.id} style={{ "--c": root.color } as CSSProperties}
        aria-label={`ABAP, ${c.hub}`} onClick={() => onSelect(root)}>
        <RootCardBody c={c} />
      </button>
      <ul className="m-list m-top">{root.children.map(item)}</ul>
    </div>
    {children}
  </div>;
}
