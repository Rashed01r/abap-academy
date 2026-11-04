"use client";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import { missions, paths } from "@/lib/curriculum";
import { type Locale } from "@/lib/engine";
import { type Progress } from "@/lib/progress";
import { ui } from "@/lib/i18n";
import { treeCopy } from "@/lib/tree-copy";
import { ConnectedLesson } from "./connected-lesson";
import { ResizableLessonPanel } from "./resizable-lesson-panel";

export function KnowledgeTree({selected, open, lang, theme, progress, setProgress, ready}: {
  selected?: string; open: (id: string) => void; lang: Locale; theme: "light" | "dark";
  progress: Progress; setProgress: Dispatch<SetStateAction<Progress>>; ready: boolean;
}) {
  const c = treeCopy[lang], t = ui[lang];
  const [pathId, setPathId] = useState<string>();
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState(false);
  const [preview, setPreview] = useState<{en: string; ar: string}>();
  const [lines, setLines] = useState<{id: string; d: string; selected: boolean}[]>([]);
  const viewport = useRef<HTMLDivElement>(null), canvas = useRef<HTMLDivElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const previousView = useRef<{zoom: number; left: number; top: number} | undefined>(undefined);
  const drag = useRef<{x: number; y: number; left: number; top: number} | undefined>(undefined);
  const activity = [{id: "orientation", pathId: "fundamentals", title: {en: ui.en.orientation, ar: ui.ar.orientation}, subtitle: {en: ui.en.orientationGoal, ar: ui.ar.orientationGoal}, objectives: [], example: "WRITE DATA TYPE statement syntax period", coveredTopics: []}, ...missions];
  const selectedPath = activity.find(m => m.id === selected)?.pathId;
  // URL selection wins on direct links and browser history changes.
  const activePath = selectedPath || pathId;
  const activeTopics = activity.filter(m => m.pathId === activePath);
  const path = paths.find(p => p.id === activePath);
  const covered = new Set(activeTopics.flatMap(m => m.coveredTopics || []));
  const previews = path && path.id !== "fundamentals" ? path.concepts.en.split(" · ").map((en, i) => ({en, ar: path.concepts.ar.split(" · ")[i] || en})).filter(p => !covered.has(p.en)) : [];
  const results = search.trim() ? activity.filter(m => [m.title.en, m.title.ar, m.subtitle.en, m.subtitle.ar, m.id, m.example, ...m.objectives.flatMap(o => [o.en, o.ar]), paths.find(p => p.id === m.pathId)?.title.en, paths.find(p => p.id === m.pathId)?.title.ar].join(" ").toLowerCase().includes(search.trim().toLowerCase())) : [];
  const futureResults = search.trim() ? paths.filter(p => p.id !== "fundamentals").flatMap(p => {
    const implemented = new Set(activity.filter(m => m.pathId === p.id).flatMap(m => m.coveredTopics || []));
    return p.concepts.en.split(" · ").map((en, i) => ({en, ar:p.concepts.ar.split(" · ")[i] || en, pathId:p.id})).filter(topic => !implemented.has(topic.en) && `${topic.en} ${topic.ar}`.toLowerCase().includes(search.trim().toLowerCase()));
  }) : [];
  function reveal() {
    requestAnimationFrame(() => {
      const graph = canvas.current;
      const target = graph?.querySelector<HTMLElement>("[data-lesson-node]") || graph?.querySelector<HTMLElement>("[data-topic-node][aria-pressed=true], [data-tree-id][aria-expanded=true]");
      target?.scrollIntoView({block: "nearest", inline: "nearest", behavior: "instant"});
    });
  }
  function choose(id: string) { setPreview(undefined); setFocus(false); open(id); }
  function reserveGraphSpace() {
    const graph = canvas.current;
    if (!graph || focus) return;
    // Shrinking a node must not clamp scrollLeft/scrollTop and move the tree.
    graph.style.minWidth = `${graph.offsetWidth}px`;
    graph.style.minHeight = `${graph.offsetHeight}px`;
  }
  function toggleFocus() {
    if (!focus) {
      previousView.current = {zoom, left: viewport.current?.scrollLeft || 0, top: viewport.current?.scrollTop || 0};
      setZoom(1); setFocus(true);
    } else {
      setFocus(false); setZoom(previousView.current?.zoom || 1);
      requestAnimationFrame(() => {
        if (previousView.current) viewport.current?.scrollTo(previousView.current.left, previousView.current.top);
        else reveal();
      });
    }
  }
  useEffect(() => {
    if (!selected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFocus(false);
      return;
    }
    if (selected && window.matchMedia("(max-width: 760px)").matches) {
      // A direct mobile link starts in a readable lesson, with an explicit return to its tree.
      setFocus(true);
    }
  }, [selected]);
  useEffect(() => {reveal();}, [selected, activePath, lang]);
  useEffect(() => {if (focus) toolbar.current?.scrollTo(0, 0);}, [focus]);
  useEffect(() => {
    const graph = canvas.current;
    if (!graph || focus) return;
    let frame = 0;
    function measure() {
      if (!graph) return;
      const box = graph.getBoundingClientRect();
      const scale = box.width / graph.offsetWidth;
      const node = (id: string) => graph.querySelector<HTMLElement>(`[data-tree-id="${id}"]`);
      const lesson = graph.querySelector<HTMLElement>("[data-lesson-node]");
      const topic = selected ? node(selected) : preview ? node(`future-${previews.findIndex(p => p.en === preview.en)}`) : undefined;
      if (lesson && topic) lesson.style.marginTop = `${Math.max(0, topic.offsetTop - 32) * zoom}px`;
      const edge = (from: HTMLElement | null, to: HTMLElement | null, id: string, highlight: boolean, panel = false) => {
        if (!from || !to) return undefined;
        const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
        const rtl = lang === "ar";
        const x1 = ((rtl ? a.left : a.right) - box.left) / scale;
        const x2 = ((rtl ? b.right : b.left) - box.left) / scale;
        const y1 = (a.top + a.height / 2 - box.top) / scale;
        const y2 = (b.top + (panel ? Math.min(64 * scale, b.height / 2) : b.height / 2) - box.top) / scale;
        const mid = (x1 + x2) / 2;
        return {id, selected: highlight, d: `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`};
      };
      const next = paths.map(p => edge(node("root"), node(p.id), p.id, p.id === activePath));
      activeTopics.forEach(m => next.push(edge(node(activePath!), node(m.id), m.id, m.id === selected)));
      previews.forEach((_, i) => next.push(edge(node(activePath!), node(`future-${i}`), `future-${i}`, false)));
      if (topic && lesson) next.push(edge(topic, lesson, "lesson", true, true));
      setLines(next.filter((line): line is NonNullable<typeof line> => !!line));
    }
    const observer = new ResizeObserver(() => {cancelAnimationFrame(frame); frame = requestAnimationFrame(measure);});
    observer.observe(graph);
    graph.querySelectorAll<HTMLElement>("[data-tree-id], [data-lesson-node]").forEach(el => observer.observe(el));
    measure();
    return () => {observer.disconnect(); cancelAnimationFrame(frame);};
  // Curriculum nodes are derived from the registry; changes in selection/layout trigger measurement.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, activePath, zoom, lang, focus, preview, ready]);
  function fit() {
    if (!viewport.current || !canvas.current) return;
    setZoom(Math.max(0.1, Math.min(1, viewport.current.clientWidth / canvas.current.offsetWidth, viewport.current.clientHeight / canvas.current.offsetHeight)));
    viewport.current.scrollTo(0, 0);
  }
  return <section className={`knowledge-tree ${focus ? "lesson-focused" : ""}`} id="academy-topics" aria-label={c.tree}>
    <h1 className="sr-only">{c.tree}</h1>
    {ready && document.getElementById("academy-header-search") && createPortal(
      <label className="tree-search"><span className="sr-only">{c.search}</span><input type="search" value={search} placeholder={c.search} onKeyDown={e => {if (e.key === "Escape") setSearch("");}} onChange={e => setSearch(e.target.value)}/></label>, document.getElementById("academy-header-search")!)}
    <div className="tree-toolbar" ref={toolbar}>
      {selected && <button className="secondary tree-focus-control" onClick={toggleFocus}>{focus ? c.restore : c.focus}</button>}
      <button className="secondary" onClick={() => {setPathId(undefined);setPreview(undefined);setFocus(false);open("home");setZoom(1);viewport.current?.scrollTo(0,0);}}>{c.root}</button>
      <button className="secondary" disabled={focus} aria-label={c.zoomOut} onClick={() => setZoom(z => Math.max(.1, +(z - .1).toFixed(2)))}>−</button><output>{Math.round(zoom * 100)}%</output><button className="secondary" disabled={focus} aria-label={c.zoomIn} onClick={() => setZoom(z => Math.min(1.5, +(z + .1).toFixed(2)))}>+</button>
      <button className="secondary" disabled={focus} onClick={fit}>{c.fit}</button>
      {selected && !focus && <button className="secondary" onClick={() => canvas.current?.querySelector<HTMLElement>('[data-topic-node][aria-pressed=true]')?.scrollIntoView({block:"center", inline:"center", behavior:"instant"})}>{c.center}</button>}
      <button className="secondary" disabled={focus} onClick={() => {setZoom(1);if(canvas.current){canvas.current.style.minWidth="";canvas.current.style.minHeight="";}viewport.current?.scrollTo(0,0);}}>{c.reset}</button>
    </div>
    {ready && !!search.trim() && document.getElementById("academy-header-search") && createPortal(<div className="tree-search-results" aria-label={c.search}>
      {results.map(m => <button className="secondary" key={m.id} onClick={() => {choose(m.id);setSearch("");}}>{m.title[lang]}</button>)}
      {futureResults.map(p => <button className="secondary" key={`${p.pathId}:${p.en}`} onClick={() => {open("home");setPathId(p.pathId);setPreview(p);setSearch("");}}>{p[lang]} · {t.comingSoon}</button>)}
      {paths.filter(p => `${p.title.en} ${p.title.ar} ${p.concepts.en} ${p.concepts.ar}`.toLowerCase().includes(search.trim().toLowerCase())).map(p => <button className="secondary" key={p.id} onClick={() => {open("home");setPathId(p.id);setPreview(undefined);setSearch("");}}>{p.title[lang]} · {activity.some(m => m.pathId === p.id) ? t.available : t.comingSoon}</button>)}
      {!results.length && !futureResults.length && !paths.some(p => `${p.title.en} ${p.title.ar} ${p.concepts.en} ${p.concepts.ar}`.toLowerCase().includes(search.trim().toLowerCase())) && <p role="status">{c.noResults}</p>}
    </div>, document.getElementById("academy-header-search")!)}
    <nav className="tree-position" aria-label={c.position}>SAP ABAP {path && <> → {path.title[lang]}</>} {selected && <> → {activity.find(m => m.id === selected)?.title[lang]}</>}</nav>
    <p className="sr-only" id="tree-pan-help">{c.pan}</p>
    <div className="tree-viewport" ref={viewport} dir="ltr" tabIndex={0} aria-label={c.overview} aria-describedby="tree-pan-help" onPointerDown={event => {
      if (event.button !== 0 || (event.target as HTMLElement).closest("button,input,a,select,[data-lesson-node]")) return;
      const v = event.currentTarget;
      drag.current = {x: event.clientX, y: event.clientY, left: v.scrollLeft, top: v.scrollTop};
      v.setPointerCapture(event.pointerId);
    }} onPointerMove={event => {if (drag.current) {event.currentTarget.scrollLeft = drag.current.left - event.clientX + drag.current.x;event.currentTarget.scrollTop = drag.current.top - event.clientY + drag.current.y;}}} onPointerUp={() => {drag.current = undefined;}} onPointerCancel={() => {drag.current = undefined;}}>
      <div className="tree-canvas" ref={canvas} dir={lang === "ar" ? "rtl" : "ltr"} style={{zoom: focus ? 1 : zoom}} onKeyDown={event => {
        if (!(event.target as HTMLElement).matches("[data-tree-id]")) return;
        const buttons = Array.from((event.target as HTMLElement).parentElement!.querySelectorAll<HTMLButtonElement>(":scope > button"));
        const i = buttons.indexOf(event.target as HTMLButtonElement);
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {event.preventDefault();buttons[(i + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length]?.focus();}
      }}>
        {!focus && <>
          <svg className="tree-connectors" aria-hidden="true">{lines.map(line => <path key={line.id} data-connector={line.id} d={line.d} className={line.selected ? "selected" : ""}/>)}</svg>
          <div className="tree-root-column"><button className="tree-node tree-root" data-tree-id="root" onClick={() => {open("home");setPathId(undefined);setPreview(undefined);}}>SAP ABAP<small>{c.progress}: {activity.length}</small></button></div>
          <div className="tree-paths" role="group" aria-label={t.allPaths}>{paths.map((p, i) => <button className="tree-node" key={p.id} data-tree-id={p.id} aria-expanded={activePath === p.id} onClick={() => {open("home");setPreview(undefined);setPathId(activePath === p.id ? undefined : p.id);}}><small>{String(i+1).padStart(2,"0")} · {activity.filter(m => m.pathId === p.id).length || t.comingSoon}</small><strong>{p.title[lang]}</strong></button>)}</div>
          {path && <div className="tree-topics" role="group" aria-label={path.title[lang]}>{activeTopics.map(m => <button className="tree-node" data-tree-id={m.id} data-topic-node key={m.id} aria-pressed={m.id === selected} disabled={!ready} onClick={() => choose(m.id)}><strong>{m.title[lang]}</strong><small>{(m.id === "orientation" ? progress.labs.includes(m.id) : progress.missions.includes(m.id)) ? t.completed : progress.started?.includes(m.id) ? t.inProgress : t.available}</small></button>)}
            {previews.map((p, i) => <button className="tree-node future-topic" data-tree-id={`future-${i}`} key={p.en} aria-pressed={preview?.en === p.en} onClick={() => {open("home");setPathId(path.id);setPreview(p);}}><strong>{p[lang]}</strong><small>{t.comingSoon}</small></button>)}
          </div>}
        </>}
        {(selected || preview) && <ResizableLessonPanel title={activity.find(m=>m.id===selected)?.title[lang] || preview?.[lang] || c.tree} selection={selected || preview?.en || ""} lang={lang} focused={focus} onFocus={toggleFocus} viewport={viewport} ready={ready} zoom={zoom} onResizeStart={reserveGraphSpace}>
          {ready && selected ? <ConnectedLesson key={selected} id={selected} lang={lang} theme={theme} progress={progress} setProgress={setProgress}/> : preview ? <><span className="pill">{t.comingSoon}</span><h2>{preview[lang]}</h2><p>{c.preview}</p><p>{path?.concepts[lang]}</p></> : <p>{c.loading}</p>}
        </ResizableLessonPanel>}
      </div>
    </div>
  </section>;
}
