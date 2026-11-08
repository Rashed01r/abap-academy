"use client";
import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { localizedText } from "@/lib/language-policy";
import type { Locale } from "@/lib/engine";
import { missions, paths } from "@/lib/curriculum";
import { ui } from "@/lib/i18n";
import { roadmapCopy } from "@/lib/tree-copy";
import type { Progress } from "@/lib/progress";
import { ConnectedLesson } from "@/components/connected-lesson";

/** A lesson opened from the roadmap drawer: the real ConnectedLesson, full width. */
export function LessonView({ id, lang, theme, progress, setProgress, ready, onBack, onNavigate }: {
  id: string; lang: Locale; theme: "light" | "dark"; progress: Progress; setProgress: Dispatch<SetStateAction<Progress>>;
  ready: boolean; onBack: () => void; onNavigate: (id: string) => void;
}) {
  const c = roadmapCopy(lang);
  const mission = missions.find(m => m.id === id);
  const title = id === "orientation" ? localizedText({ en: ui.en.orientation, ar: ui.ar.orientation }, lang) : localizedText(mission?.title, lang);
  const path = paths.find(p => p.id === (mission?.pathId || "fundamentals"));
  const back = useRef<HTMLButtonElement>(null);
  useEffect(() => { back.current?.focus({ preventScroll: true }); }, [id]);
  const Arrow = lang === "ar" ? ArrowRight : ArrowLeft;
  return <section className="lesson-view" aria-label={title}>
    <div className="lesson-view-bar">
      <button type="button" className="secondary" ref={back} onClick={onBack} data-back-to-roadmap>
        <Arrow size={16} aria-hidden="true" />{c.backToRoadmap}
      </button>
      <nav aria-label={c.breadcrumb}>
        <span>ABAP</span><span aria-hidden="true">→</span>
        <span>{localizedText(path?.title, lang)}</span><span aria-hidden="true">→</span>
        <span aria-current="page">{title}</span>
      </nav>
    </div>
    <div className="lesson-view-body connected-lesson-node lesson-focused" data-lesson-node>
      {ready ? <ConnectedLesson key={id} id={id} lang={lang} theme={theme} progress={progress} setProgress={setProgress} onNavigate={onNavigate} /> : null}
    </div>
  </section>;
}
