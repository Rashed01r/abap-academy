"use client";
import { useState } from "react";
import { ArrowRight, Check, CirclePlay, Clock3, Sparkles, Trophy } from "lucide-react";
import { Locale } from "@/lib/engine";
import { ui } from "@/lib/i18n";
import { missions, paths, Text } from "@/lib/curriculum";
import { Progress, earnedXP } from "@/lib/progress";
export type MissionPreview = { title: Text; concepts: Text; prerequisite: Text; minutes?: number };
export function Roadmap({ lang, progress, storage, ready, open, setPreview }: {
  lang: Locale; progress: Progress; storage: boolean; ready: boolean;
  open: (id: string) => void; setPreview: (preview: MissionPreview) => void;
}) {
  const t = ui[lang];
  const [search, setSearch] = useState("");
  const [pathFilter, setPathFilter] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [collection, setCollection] = useState("all");
  const [expandAll, setExpandAll] = useState(false);
  const count = (progress.labs.includes("orientation") ? 1 : 0) + progress.missions.length;
  const total = missions.length + 1;
  const foundation = (progress.labs.includes("orientation") ? 1 : 0) + ["addition", "structures"].filter(id => progress.missions.includes(id)).length;
  const nextMission = !progress.labs.includes("orientation") ? "orientation" : missions.find(m => !progress.missions.includes(m.id))?.id;
  const titleFor = (id: string) => id === "orientation" ? t.orientation : missions.find(m => m.id === id)?.title[lang] || id;
  const activities = [{ id: "orientation", pathId: "fundamentals", title: {en:t.orientation, ar:t.orientation}, subtitle: {en:t.orientationSub, ar:t.orientationSub}, minutes:4, xp:25, difficulty: "beginner" as const, prerequisite: "", objectives: [] }, ...missions];
  const isComplete = (id: string) => id === "orientation" ? progress.labs.includes(id) : progress.missions.includes(id);
  const matches = (m: typeof activities[number]) => {
    const path = paths.find(p => p.id === m.pathId)!;
    const haystack = [m.title.en, m.title.ar, m.subtitle.en, m.subtitle.ar, path.title.en, path.title.ar, ...m.objectives.flatMap(o => [o.en,o.ar])].join(" ").toLocaleLowerCase();
    return haystack.includes(search.trim().toLocaleLowerCase()) && (difficulty === "all" || m.difficulty === difficulty) &&
      (collection === "all" || collection === "completed" && isComplete(m.id) || collection === "recent" && progress.recent?.includes(m.id));
  };
  const filtered = activities.filter(matches);
  return <section className="journey-section" id="academy-topics" tabIndex={-1}>
    <div className="section-heading"><div><span className="eyebrow">{t.explore}</span><h2>{t.journey}</h2><p>{t.explorationNote}</p></div><span className="pill"><Trophy size={16}/>{earnedXP(progress)} {t.xp}</span></div>
    <div className="discovery-filters">
      <label>{t.searchLessons}<input aria-label={t.searchLessons} type="search" value={search} onChange={e => setSearch(e.target.value)}/></label>
      <label>{t.allPaths}<select aria-label={t.allPaths} value={pathFilter} onChange={e => setPathFilter(e.target.value)}><option value="all">{t.allPaths}</option>{paths.map(p => <option key={p.id} value={p.id}>{p.title[lang]}</option>)}</select></label>
      <label>{t.difficulty}<select aria-label={t.difficulty} value={difficulty} onChange={e => setDifficulty(e.target.value)}><option value="all">{t.allDifficulties}</option>{(["beginner","intermediate","advanced"] as const).map(d => <option key={d} value={d}>{t[d]}</option>)}</select></label>
      <button className="secondary" onClick={() => {setSearch("");setPathFilter("all");setDifficulty("all");setCollection("all");setExpandAll(true);}}>{t.allTopics}</button>
    </div>
    <div className="explore-actions collection-filters" role="group" aria-label={t.explore}>
      <button className="secondary" aria-pressed={collection === "recent"} onClick={() => setCollection(collection === "recent" ? "all" : "recent")}>{t.recentLessons}</button>
      <button className="secondary" aria-pressed={collection === "completed"} onClick={() => setCollection(collection === "completed" ? "all" : "completed")}>{t.completedLessons}</button>
      {progress.recent?.[0] && <button className="secondary" disabled={!ready} onClick={() => open(progress.recent![0])}>{t.continueLearning}: {titleFor(progress.recent[0])}</button>}
    </div>
    <div className="journey-layout"><div className="roadmap future-paths">
      {paths.filter(p => pathFilter === "all" || pathFilter === p.id).map((p) => {
        const available = filtered.filter(m => m.pathId === p.id);
        const implemented = activities.filter(m => m.pathId === p.id);
        const previews = p.id === "fundamentals" || collection !== "all" || difficulty !== "all" ? [] : p.concepts.en.split(" \u00b7 ").map((en,j) => ({en, ar:p.concepts.ar.split(" \u00b7 ")[j] || en})).filter(c => !(p.id === "data" && implemented.length && c.en === "Internal tables")).filter(c => `${c.en} ${c.ar}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
        if (!available.length && !previews.length && (search || collection !== "all" || difficulty !== "all")) return null;
        return <details key={p.id} data-path={p.id} open={expandAll || implemented.length > 0 || pathFilter !== "all" || !!search}>
          <summary><span className="path-number">{String(paths.findIndex(path => path.id === p.id)+1).padStart(2,"0")}</span><span>{p.title[lang]}<small>{implemented.length ? `${implemented.length} ${t.available}` : t.comingSoon}</small></span><span>+</span></summary>
          <p>{p.concepts[lang]}</p>
          <div className="roadmap-nodes">
            {available.map(m => {
              const completed = isComplete(m.id);
              const started = !completed && (progress.started?.includes(m.id) || progress.labs.includes(m.id) || (progress.results[m.id]?.attempts || 0)>0);
              return <div key={m.id} className={`roadmap-node ${completed ? "complete" : "available"} ${nextMission === m.id ? "recommended" : ""}`} data-mission={m.id}>
                <span className="node-dot">{completed ? <Check size={19}/> : started ? <Clock3 size={18}/> : <CirclePlay size={18}/>}</span>
                <button className="node-card" disabled={!ready} onClick={() => open(m.id)}>
                  <div><small>{m.id === "orientation" ? t.lab : `${t.mission} ${String(missions.findIndex(item => item.id === m.id)+1).padStart(2,"0")}`} {"\u00b7"} {m.minutes} {t.minutes} {"\u00b7"} {m.xp} XP</small>
                    <h3>{m.title[lang]}</h3><p>{m.subtitle[lang]}</p><p className="mission-skills">{m.objectives.map(o=>o[lang]).join(" \u00b7 ")}</p>
                    {m.prerequisite && <p className="small recommended-prerequisite">{t.recommendedFirst}: {titleFor(m.prerequisite)}</p>}
                    <span className="node-status">{completed ? t.completed : started ? t.inProgress : t.available}</span>
                  </div><ArrowRight size={20}/>
                </button>
              </div>;
            })}
          </div>
          {!!previews.length && <><p>{t.futureIntro}</p><div className="future-concepts">{previews.map(c => <button key={c.en} onClick={() => setPreview({title:c,concepts:p.concepts,prerequisite:p.id === "data" ? missions.find(m=>m.id === "employees")!.title : paths[Math.max(0,paths.findIndex(path=>path.id === p.id)-1)].title,minutes:8})}>{c[lang]} <span className="preview-chip">{t.comingSoon}</span></button>)}</div></>}
        </details>;
      })}
      {!filtered.some(m => pathFilter === "all" || m.pathId === pathFilter) && (collection !== "all" || difficulty !== "all" || !!search) && <p role="status">{t.noLessons}</p>}
    </div><aside className="progress-sidebar">
      <div className="progress-card"><span className="eyebrow">{t.progress}</span><div className="progress-ring" style={{background:`conic-gradient(var(--accent) ${(count/total)*360}deg,var(--line) 0)`}}><div><strong>{Math.round((count/total)*100)}<small>%</small></strong></div></div>
        <h3>{count} / {total} {t.completed}</h3><p>{t.pathProgress}</p><p data-testid="foundation-progress">{foundation === 3 ? t.foundationComplete : t.foundationProgress} {"\u2014"} {foundation}/3</p><p>{t.availableProgress}: {count}/{total}</p><small>{t.previewProgress}</small><div className="xp-row"><Sparkles size={17}/><strong>{earnedXP(progress)}</strong> XP</div><small>{storage ? t.saved : t.storage}</small>
      </div>
      <div className="milestone-card"><Trophy size={25}/><h3>{count === total ? t.allAvailableDone : t.recommendedNext}</h3><p>{nextMission ? titleFor(nextMission) : t.previewProgress}</p>{nextMission && <button className="secondary" disabled={!ready} onClick={() => open(nextMission)}>{t.recommendedNext}<ArrowRight size={16}/></button>}</div>
    </aside></div>
  </section>;
}
