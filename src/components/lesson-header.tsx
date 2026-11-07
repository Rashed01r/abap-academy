"use client";

import { useEffect, useId, useState } from "react";
import {
  ArrowLeft, BookOpen, Boxes, Braces, CheckCircle2, ChevronDown,
  Circle, Cloud, Database, FolderKanban, Table2, Workflow, type LucideIcon,
} from "lucide-react";
import type { Locale } from "@/lib/engine";
import { ui } from "@/lib/i18n";
import { treeCopy } from "@/lib/tree-copy";
import { resolveLocale } from "@/lib/language-policy";
import { TechnicalText } from "./technical-text";

export type LessonHeaderData = {
  id: string;
  title?: string;
  subtitle?: string;
  level?: "beginner" | "intermediate" | "advanced";
  minutes?: number;
  xp?: number;
  status?: "not-started" | "in-progress" | "completed";
  learningObjectives?: string[];
  recommendedFirst?: { id: string; title: string; completed?: boolean };
  moduleId?: string;
  moduleName?: string;
  lessonNumber?: number;
  icon?: LucideIcon;
};

const moduleIcons: Record<string, LucideIcon> = {
  fundamentals: BookOpen, data: Table2, dictionary: Database, database: Database,
  oop: Boxes, applications: Workflow, modern: Braces, cloud: Cloud, projects: FolderKanban,
};

export const lessonObjectivesSeenKey = (id: string) => `abap2-lesson-header:${id}:objectives-seen`;

/** Presentation only; the caller owns lesson content, achievements and navigation. */
export function LessonHeader({ lesson, lang, onNavigate }: {
  lesson: LessonHeaderData; lang: Locale; onNavigate?: (id: string) => void;
}) {
  const locale = resolveLocale(lang), t = ui[locale], copy = treeCopy[locale];
  const objectives = lesson.learningObjectives?.filter(value => value.trim()) || [];
  const objectivesId = useId();
  const [objectivesOpen, setObjectivesOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    try { return localStorage.getItem(lessonObjectivesSeenKey(lesson.id)) !== "seen"; }
    catch { return true; }
  });
  useEffect(() => {
    if (!objectives.length) return;
    try { localStorage.setItem(lessonObjectivesSeenKey(lesson.id), "seen"); }
    catch { /* Objective visibility remains usable without persistent storage. */ }
  }, [lesson.id, objectives.length]);

  const Icon = lesson.icon || moduleIcons[lesson.moduleId || ""] || BookOpen;
  const completed = lesson.status === "completed";
  const translatedStatus = completed ? t.completed : lesson.status === "in-progress" ? t.inProgress : t.notStarted;
  const statusText = translatedStatus.charAt(0).toUpperCase() + translatedStatus.slice(1);
  const level = lesson.level ? {beginner:1, intermediate:2, advanced:3}[lesson.level] : 0;
  const prerequisite = lesson.recommendedFirst;
  const hasStats = lesson.level || lesson.minutes !== undefined || lesson.xp !== undefined;

  return <div className="lesson-summary lesson-header" data-lesson-header={lesson.id}>
    <div className="lesson-header-title-row">
      <span className="lesson-header-icon" data-icon-source={lesson.icon ? "lesson" : "module"}>
        <Icon size={24} aria-hidden="true" />
      </span>
      {(lesson.title?.trim() || lesson.subtitle?.trim() || lesson.moduleName?.trim() || lesson.lessonNumber !== undefined) && <div className="lesson-header-title-block">
        {(lesson.moduleName?.trim() || lesson.lessonNumber !== undefined) && <div className="lesson-header-context">
          {lesson.moduleName?.trim() && <span><TechnicalText>{lesson.moduleName}</TechnicalText></span>}
          {lesson.moduleName?.trim() && lesson.lessonNumber !== undefined && <span aria-hidden="true"> · </span>}
          {lesson.lessonNumber !== undefined && <bdi dir="ltr">{lesson.lessonNumber}</bdi>}
        </div>}
        {lesson.title?.trim() && <h1 className="lesson-header-title"><TechnicalText>{lesson.title}</TechnicalText></h1>}
        {lesson.subtitle?.trim() && <p className="lesson-header-subtitle"><TechnicalText>{lesson.subtitle}</TechnicalText></p>}
      </div>}
      {lesson.status && <span className={`pill lesson-header-status status-${lesson.status}`}>
        {completed && <CheckCircle2 size={13} aria-hidden="true" />}{statusText}
      </span>}
    </div>

    {hasStats && <dl className="lesson-header-stats">
      {lesson.level && <div className="lesson-header-stat" data-stat="level">
        <dt>Level</dt><dd className="lesson-header-level">
          <span className="lesson-level-dots" aria-hidden="true">{[1,2,3].map(dot => <span key={dot} data-filled={dot <= level} />)}</span>
          <span>{t[lesson.level]}</span>
        </dd>
      </div>}
      {lesson.minutes !== undefined && <div className="lesson-header-stat" data-stat="time">
        <dt>Time</dt><dd><TechnicalText>{`${lesson.minutes} ${t.minutes}`}</TechnicalText></dd>
      </div>}
      {lesson.xp !== undefined && <div className="lesson-header-stat" data-stat="reward">
        <dt>Reward</dt><dd><TechnicalText>{`${lesson.xp} ${completed ? t.xp : "XP"}`}</TechnicalText></dd>
      </div>}
    </dl>}

    {!!objectives.length && <div className="lesson-header-objectives">
      <button type="button" className="lesson-objectives-toggle" aria-expanded={objectivesOpen} aria-controls={objectivesId} onClick={() => setObjectivesOpen(open => !open)}>
        <ChevronDown size={15} className="lesson-objectives-chevron" aria-hidden="true" />{copy.objectives}
      </button>
      <ul id={objectivesId} hidden={!objectivesOpen}>
        {objectives.map((objective,index) => <li key={`${index}:${objective}`}>
          {completed ? <CheckCircle2 size={15} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}
          <span><TechnicalText>{objective}</TechnicalText></span>
        </li>)}
      </ul>
    </div>}

    {prerequisite?.id && prerequisite.title?.trim() && onNavigate && <button type="button" className="lesson-header-prerequisite" onClick={() => onNavigate(prerequisite.id)}>
      <ArrowLeft size={14} className="lesson-header-back-arrow" aria-hidden="true" />
      <span className="lesson-header-prerequisite-label">{t.recommendedFirst}:</span>
      <span className="lesson-header-prerequisite-title"><TechnicalText>{prerequisite.title}</TechnicalText></span>
      {prerequisite.completed && <><CheckCircle2 size={14} aria-hidden="true" /><span className="sr-only">{t.completed}</span></>}
    </button>}
  </div>;
}
