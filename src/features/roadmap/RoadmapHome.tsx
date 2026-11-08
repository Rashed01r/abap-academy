"use client";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import { ENABLE_ARABIC, localizedText } from "@/lib/language-policy";
import type { Locale } from "@/lib/engine";
import { roadmapCopy } from "@/lib/tree-copy";
import { learnTCode, type Progress } from "@/lib/progress";
import { ancestry, buildRoadmapTree, type RoadmapNode } from "./data/roadmap-tree";
import { TCODE_XP } from "./data/tcodes";
import AnimatedBackground from "./AnimatedBackground";
import { RoadmapCanvas, type RoadmapCanvasHandle } from "./RoadmapCanvas";
import { DetailDrawer, type LessonStatus } from "./DetailDrawer";
import { EffectsPanel, EFFECTS_KEY, defaultEffects, readEffects, type Effects } from "./EffectsPanel";
import { MobileRoadmap } from "./MobileRoadmap";
import "./roadmap.css";

const MINT_RGB = [94, 234, 177] as const;
const AMBER_RGB = [245, 185, 74] as const;

function useMedia(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    cb => { const m = window.matchMedia(query); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Ids to keep expanded so that `n` is visible (and open, if it has children). */
function pathTo(n: RoadmapNode) {
  return ancestry(n).filter(p => p.children.length && p.kind !== "root" && (p !== n || n.children.length)).map(p => p.id);
}

export function RoadmapHome({ lang, progress, setProgress, ready, focusMission, onOpenLesson }: {
  lang: Locale; progress: Progress; setProgress: Dispatch<SetStateAction<Progress>>; ready: boolean;
  /** Lesson to reveal when coming back from a lesson. */
  focusMission?: string;
  onOpenLesson: (missionId: string) => void;
}) {
  const c = roadmapCopy(lang);
  const tree = useMemo(() => buildRoadmapTree(), []);
  const { root, all, byId } = tree;
  const focusNode = focusMission ? byId.get(`lesson:${focusMission}`) : undefined;

  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set(focusNode ? pathTo(focusNode) : []));
  const [selectedId, setSelectedId] = useState<string | undefined>(focusNode?.id);
  const [drawerOpen, setDrawerOpen] = useState(!!focusNode);
  const [query, setQuery] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [fxOpen, setFxOpen] = useState(false);
  const [toast, setToast] = useState<string>();
  const reduceMotion = useMedia("(prefers-reduced-motion: reduce)", false);
  const mobile = useMedia("(max-width: 820px)", false);
  const [effects, setEffects] = useState<Effects>(() => defaultEffects(false));
  const canvas = useRef<RoadmapCanvasHandle>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef<HTMLElement | null>(null);
  const lastCard = useRef<string | undefined>(undefined);
  const selected = selectedId ? byId.get(selectedId) : undefined;
  const tcodesOpen = expanded.has("tcodes");

  // Device-only effect settings (reduced-motion users start with everything off).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEffects(readEffects(window.matchMedia("(prefers-reduced-motion: reduce)").matches));
  }, []);
  function changeEffects(next: Effects) {
    setEffects(next);
    try { localStorage.setItem(EFFECTS_KEY, JSON.stringify(next)); } catch { /* settings stay for this visit */ }
  }

  // The app wrapper (.roadmap-home) carries the tint and the effect toggles.
  useEffect(() => {
    const app = hostRef.current?.closest<HTMLElement>(".roadmap-home") || null;
    tintRef.current = app;
    if (!app) return;
    app.classList.toggle("noaur", !effects.aurora);
    app.classList.toggle("nogrid", !effects.grid);
    app.classList.toggle("noflow", !effects.flow);
    return () => { app.classList.remove("noaur", "nogrid", "noflow"); app.style.removeProperty("--tint"); };
  }, [effects.aurora, effects.grid, effects.flow]);

  // Coming back from a lesson: flash it once it is on screen.
  useEffect(() => {
    if (!focusNode) return;
    const id = window.setTimeout(() => canvas.current?.flash(focusNode.id), 450);
    return () => window.clearTimeout(id);
  }, [focusNode]);

  const closeDrawer = useCallback((restoreFocus = true) => {
    setDrawerOpen(false);
    setSelectedId(undefined);
    if (restoreFocus && lastCard.current) {
      const id = lastCard.current;
      requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-node="${CSS.escape(id)}"] .card, [data-mobile-node="${CSS.escape(id)}"]`)?.focus({ preventScroll: true }));
    }
  }, []);

  const reset = useCallback(() => {
    setExpanded(new Set());
    setSelectedId(undefined);
    setDrawerOpen(false);
  }, []);

  const select = useCallback((n: RoadmapNode) => {
    if (n.kind === "root") { reset(); return; }
    if (n.children.length) {
      setExpanded(prev => {
        if (prev.has(n.id)) {
          // Collapse this node and everything below it.
          const below = new Set(all.filter(x => ancestry(x).includes(n)).map(x => x.id));
          return new Set([...prev].filter(id => !below.has(id)));
        }
        // Accordion: opening a node closes its siblings and their descendants.
        const keep = new Set(ancestry(n).map(x => x.id));
        return new Set([...[...prev].filter(id => keep.has(id)), n.id]);
      });
      setSelectedId(undefined);
      setDrawerOpen(false);
      return;
    }
    lastCard.current = n.id;
    setSelectedId(n.id);
    setDrawerOpen(true);
  }, [all, reset]);

  const reveal = useCallback((n: RoadmapNode) => {
    if (n.kind === "root") { reset(); return; }
    setExpanded(new Set(pathTo(n)));
    if (n.children.length) { setSelectedId(undefined); setDrawerOpen(false); }
    else { lastCard.current = n.id; setSelectedId(n.id); setDrawerOpen(true); }
    window.setTimeout(() => canvas.current?.flash(n.id), 60);
  }, [reset]);

  // Escape closes the drawer, the search results and the effects panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setResultsOpen(false);
      setFxOpen(false);
      if (drawerOpen) closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  // Search: topics, lessons, T-codes and keywords.
  const results = useMemo(() => {
    const v = query.trim().toLowerCase();
    if (!v) return [];
    const field = (n: RoadmapNode) => `${n.search.en} ${ENABLE_ARABIC ? n.search.ar || "" : ""}`;
    const label = (n: RoadmapNode) => localizedText(n.label, lang).toLowerCase();
    return all
      .filter(n => n.depth >= 1 && field(n).includes(v))
      .sort((a, b) =>
        Number((b.tcode?.code.toLowerCase() || "") === v) - Number((a.tcode?.code.toLowerCase() || "") === v) ||
        Number(label(b).startsWith(v)) - Number(label(a).startsWith(v)) ||
        Number(!!a.planned) - Number(!!b.planned))
      .slice(0, 7);
  }, [query, all, lang]);
  function pick(n: RoadmapNode) {
    reveal(n);
    setResultsOpen(false);
  }
  const kindLabel = (n: RoadmapNode) => n.tcode ? n.tcode.code : n.kind === "lesson" ? c.resultLesson : n.kind === "cat" ? (n.branch === "tcodes" ? c.resultGroup : c.resultTopic) : c.resultPath;
  const searchSlot = ready ? document.getElementById("academy-header-search") : null;
  const search = <div className="searchwrap" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setResultsOpen(false); }}>
    <input className="q" type="search" role="combobox" aria-autocomplete="list" autoComplete="off" value={query} placeholder={c.search} aria-label={c.searchLabel}
      aria-expanded={resultsOpen && !!query.trim()} aria-controls="roadmap-search-results"
      onFocus={() => setResultsOpen(true)}
      onChange={e => { setQuery(e.target.value); setResultsOpen(true); }}
      onKeyDown={e => {
        if (e.key === "Enter" && results[0]) { e.preventDefault(); pick(results[0]); }
        if (e.key === "ArrowDown") { e.preventDefault(); document.querySelector<HTMLButtonElement>("#roadmap-search-results button")?.focus(); }
        if (e.key === "Escape") { setQuery(""); setResultsOpen(false); }
      }} />
    <div className={`sr${resultsOpen && query.trim() ? " open" : ""}`} id="roadmap-search-results" role="group" aria-label={c.searchLabel}
      onKeyDown={e => {
        const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
        const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (e.key === "ArrowDown") { e.preventDefault(); buttons[(i + 1) % buttons.length]?.focus(); }
        if (e.key === "ArrowUp") { e.preventDefault(); buttons[(i - 1 + buttons.length) % buttons.length]?.focus(); }
      }}>
      {results.map(n => <button type="button" key={n.id} data-result={n.id} onClick={() => pick(n)}>
        <span className="c" dir="ltr">{kindLabel(n)}</span>
        <span>{localizedText(n.label, lang)}</span>
        <small>{n.depth >= 2 && n.parent ? localizedText(n.parent.label, lang) : ""}</small>
      </button>)}
      {!results.length && <p role="status">{c.noResults}</p>}
    </div>
  </div>;

  // Breadcrumb: root to the selected node, or to the deepest open node.
  let tip: RoadmapNode | undefined = selected;
  if (!tip) for (const n of all) if (expanded.has(n.id) && (!tip || n.depth > tip.depth)) tip = n;
  const crumbs = ancestry(tip || root);

  const isDone = useCallback((n: RoadmapNode) =>
    n.kind === "tcode" ? !!progress.tcodes?.includes(n.id)
      : n.kind === "lesson" && n.missionId ? (n.missionId === "orientation" ? progress.labs.includes("orientation") : progress.missions.includes(n.missionId))
        : false, [progress]);
  const lessonStatus: LessonStatus = selected?.missionId
    ? isDone(selected) ? "completed" : progress.started?.includes(selected.missionId) ? "started" : "new"
    : "new";

  function learn(n: RoadmapNode) {
    if (progress.tcodes?.includes(n.id)) return;
    setProgress(p => learnTCode(p, n.id));
    setToast(`+${TCODE_XP} ${c.xp}`);
  }
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(undefined), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  // On mobile there is no layout loop, so the tint switches directly.
  useEffect(() => {
    if (mobile) tintRef.current?.style.setProperty("--tint", tcodesOpen ? AMBER_RGB.join(",") : MINT_RGB.join(","));
  }, [mobile, tcodesOpen]);

  const drawer =<DetailDrawer node={selected} open={drawerOpen && !!selected} lang={lang} c={c}
    learned={!!selected && isDone(selected)} lessonStatus={lessonStatus}
    onClose={() => closeDrawer()} onLearn={learn}
    onOpenLesson={n => n.missionId && onOpenLesson(n.missionId)} />;

  return <section className="roadmap" ref={hostRef} aria-label={c.roadmap}>
    <h1 className="sr-only">{c.roadmap}</h1>
    <AnimatedBackground mode={effects.mode} intensity={effects.intensity} tint={tcodesOpen ? AMBER_RGB : MINT_RGB} />
    <div className="grid" aria-hidden="true" />
    <div className="aur" aria-hidden="true"><i /><i /><i /></div>
    {searchSlot ? createPortal(search, searchSlot) : null}
    <div className="crumb">
      <nav aria-label={c.breadcrumb}>
        {crumbs.map((n, i) => <span key={n.id} style={{ display: "contents" }}>
          {i > 0 && <i aria-hidden="true">→</i>}
          <button type="button" aria-current={i === crumbs.length - 1 ? "location" : undefined} onClick={() => reveal(n)}>
            {n.tcode ? n.tcode.code : localizedText(n.label, lang)}
          </button>
        </span>)}
      </nav>
      <span className="hint">{c.hint}</span>
    </div>
    {mobile
      ? <MobileRoadmap root={root} expanded={expanded} selectedId={selectedId} lang={lang} c={c} isDone={isDone} onSelect={select}>
          {drawer}
          <EffectsPanel open={fxOpen} onToggle={() => setFxOpen(o => !o)} effects={effects} onChange={changeEffects} c={c} />
        </MobileRoadmap>
      : <RoadmapCanvas ref={canvas} root={root} all={all} expanded={expanded} selectedId={selectedId} drawerOpen={drawerOpen}
          lang={lang} c={c} reduceMotion={reduceMotion} tintRef={tintRef} isDone={isDone} onSelect={select} onReset={reset}>
          {drawer}
          <EffectsPanel open={fxOpen} onToggle={() => setFxOpen(o => !o)} effects={effects} onChange={changeEffects} c={c} />
        </RoadmapCanvas>}
    <div className={`toast${toast ? " on" : ""}`} role="status">{toast}</div>
  </section>;
}
