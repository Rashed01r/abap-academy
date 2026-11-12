"use client";
import { ENABLE_ARABIC, resolveLocale } from "@/lib/language-policy";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  Globe2,
  Network,
  Code2,
  MessageSquareCode,
} from "lucide-react";
import { Locale } from "@/lib/engine";
import { ui } from "@/lib/i18n";
import {
  Progress,
  initialProgress,
  normalizeProgress,
  unlocked,
  visitMission,
  earnedXP,
} from "@/lib/progress";
import { glossary } from "@/lib/glossary";
import { RoadmapHome } from "@/features/roadmap/RoadmapHome";
import dynamic from "next/dynamic";
// Loaded on demand so the roadmap (first screen) doesn't download every lesson and the simulator.
const LessonView = dynamic(() => import("@/features/roadmap/LessonView").then(m => m.LessonView));
const ContactPage = dynamic(() => import("@/components/contact-page").then(m => m.ContactPage));
import "./knowledge-tree.css";
import "./teaching-trace.css";
import "./lesson-header.css";
import "./touch-usability.css";
function viewUrl(view: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete("layout");
  if (unlocked(view)) url.searchParams.set("mission", view);
  else url.searchParams.delete("mission");
  if (view === "contact") url.searchParams.set("page", "contact");
  else url.searchParams.delete("page");
  return url;
}
function viewFromUrl() {
  const query = new URLSearchParams(window.location.search), id = query.get("mission");
  return query.get("page") === "contact" ? "contact" : id && unlocked(id) ? id : "home";
}
export default function Academy() {
  const [preference, setLang] = useState<Locale>("en"),
    [systemDark, setSystemDark] = useState(false),
    [progress, setProgress] = useState<Progress>(initialProgress),
    [ready, setReady] = useState(false),
    [progressStorageReady, setProgressStorageReady] = useState(false),
    [storage, setStorage] = useState(true),
    [view, setView] = useState("home"),
    [lastLesson, setLastLesson] = useState<string>();
  const lang = resolveLocale(preference);
  const t = ui[lang],
    // No theme picker: lessons follow the device setting; the roadmap and Contact are always dark.
    theme = systemDark ? "dark" : "light";
  // Hydrate device-only settings after SSR and synchronize browser storage failures.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      setProgress(
        normalizeProgress(
          JSON.parse(localStorage.getItem("abap2-master-progress") || "null"),
        ),
      );
      setProgressStorageReady(true);
    } catch {
      setStorage(false);
    }
    try { setLang(resolveLocale(localStorage.getItem("abap2-language"))); }
    catch { setStorage(false); }
    const requested = viewFromUrl();
    if (requested !== "home") {
      if (requested !== "contact") setProgress(p => visitMission(p, requested));
      setView(requested);
    }
    setReady(true);
    const media = matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    const listener = () => setSystemDark(media.matches);
    const restore = () => {
      setView(viewFromUrl());
      const url = new URL(window.location.href);
      url.searchParams.delete("layout");
      window.history.replaceState(null, "", url);
    };
    window.addEventListener("popstate", restore);
    media.addEventListener("change", listener);
    return () => {media.removeEventListener("change", listener);window.removeEventListener("popstate", restore);};
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.theme = theme;
    if (ready)
      try {
        if (progressStorageReady) localStorage.setItem("abap2-master-progress", JSON.stringify(progress));
        localStorage.setItem("abap2-language", lang);
      } catch {
        setStorage(false);
      }
  }, [lang, theme, progress, ready, progressStorageReady]);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!ready) return;
    window.history.replaceState(null, "", viewUrl(view));
  }, [view, ready]);
  function navigate(id: string) {
    const url = viewUrl(id);
    if (url.href !== window.location.href) window.history.pushState(null, "", url);
    setView(id);
  }
  function open(id: string) {
    if (id !== "home" && !unlocked(id, progress)) return;
    if (id !== "home") {
      setProgress((p) => visitMission(p, id));
      setLastLesson(id);
    }
    navigate(id);
    window.scrollTo({ top: 0 });
  }
  return (
    <div className={`app immersive-academy ${view === "home" || view === "contact" ? "roadmap-home" : ""}`}>
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <header>
        <button
          className="brand"
          aria-label={t.home}
          onClick={() => navigate("home")}
        >
          <span className="brand-icon">
            <GraduationCap size={25} />
          </span>
          <span>
            ABAP<b className="brand-dot" aria-hidden="true">.</b><span className="brand-light">Academy</span>
          </span>
        </button>
        <nav aria-label={t.path}>
          <button
            className={view === "contact" ? undefined : "nav-active"}
            aria-current={view === "contact" ? undefined : "page"}
            onClick={() => navigate("home")}
          >
            <Network size={16} aria-hidden="true" />
            <span className="nav-label">{t.path}</span><span className="nav-file" aria-hidden="true">roadmap.abap</span>
          </button>
          <button
            className={view === "contact" ? "nav-active" : undefined}
            aria-current={view === "contact" ? "page" : undefined}
            onClick={() => { navigate("contact"); window.scrollTo({ top: 0 }); }}
          >
            <MessageSquareCode size={16} aria-hidden="true" />
            <span className="nav-label">Contact</span><span className="nav-file" aria-hidden="true">contact.abap</span>
          </button>
        </nav>
        {view === "home" && <div id="academy-header-search" />}
        <div className="header-settings">
          <span className="header-xp pill" key={earnedXP(progress)}><i aria-hidden="true" />{earnedXP(progress)} XP</span>
          {ENABLE_ARABIC && <button
            className="language"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
          >
            <Globe2 size={16} />
            {lang === "en" ? "العربية" : "English"}
          </button>}
        </div>
        <AcademyGlossary lang={lang} compact />
      </header>
      <main id="main">
        {view === "contact" ? (
          <ContactPage />
        ) : view === "home" ? (
          <RoadmapHome lang={lang} progress={progress} setProgress={setProgress} ready={ready} focusMission={lastLesson} onOpenLesson={open} />
        ) : (
          <LessonView id={view} lang={lang} theme={theme} progress={progress} setProgress={setProgress} ready={ready}
            onBack={() => { setLastLesson(view); navigate("home"); window.scrollTo({ top: 0 }); }} onNavigate={open} />
        )}
      </main>
      <footer>
        <span>
          ABAP Academy
        </span>
        <span>{storage ? t.saved : t.storage}</span>
        <span>{t.limit}</span>
      </footer>
    </div>
  );
}
function AcademyGlossary({lang, compact = false}: {lang: Locale; compact?: boolean}) {
  return <details className="glossary">
    <summary aria-label={ui[lang].glossary} title={ui[lang].glossary}>{compact ? <><Code2 size={18}/><span className="sr-only">{ui[lang].glossary}</span></> : ui[lang].glossary}</summary>
    <div className="glossary-pop">
      <div className="glossary-tb" aria-hidden="true"><i /><i /><i /><span>glossary.abap</span></div>
      <dl>{glossary.map(([en, ar, enDefinition, arDefinition]) => <div key={en}><dt><bdi dir="ltr">{en}</bdi>{ENABLE_ARABIC && <> · <bdi dir="rtl">{ar}</bdi></>}</dt><dd>{lang === "ar" ? arDefinition : enDefinition}</dd></div>)}</dl>
      <div className="glossary-foot" aria-hidden="true"><span>{glossary.length} terms</span><span>ABAP · reference</span></div>
    </div>
  </details>;
}
