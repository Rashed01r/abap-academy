"use client";
import { ENABLE_ARABIC, resolveLocale } from "@/lib/language-policy";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  Globe2,
  Sun,
  Moon,
  Monitor,
  Map,
  Code2,
  Mail,
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
import { LessonView } from "@/features/roadmap/LessonView";
import { ContactPage } from "@/components/contact-page";
import "./knowledge-tree.css";
import "./teaching-trace.css";
import "./lesson-header.css";
import "./touch-usability.css";
type Appearance = "light" | "dark" | "system";
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
    [appearance, setAppearance] = useState<Appearance>("system"),
    [systemDark, setSystemDark] = useState(false),
    [progress, setProgress] = useState<Progress>(initialProgress),
    [ready, setReady] = useState(false),
    [progressStorageReady, setProgressStorageReady] = useState(false),
    [storage, setStorage] = useState(true),
    [view, setView] = useState("home"),
    [lastLesson, setLastLesson] = useState<string>();
  const lang = resolveLocale(preference);
  const t = ui[lang],
    theme =
      appearance === "system" ? (systemDark ? "dark" : "light") : appearance;
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
    try {
      const a = localStorage.getItem("abap2-appearance");
      if (a === "light" || a === "dark" || a === "system") setAppearance(a);
    } catch { setStorage(false); }
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
        localStorage.setItem("abap2-appearance", appearance);
      } catch {
        setStorage(false);
      }
  }, [lang, theme, appearance, progress, ready, progressStorageReady]);
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
    <div className={`app immersive-academy ${view === "home" ? "roadmap-home" : ""}`}>
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
            ABAP <span className="brand-light">Academy</span>
          </span>
        </button>
        <nav aria-label={t.path}>
          <button
            className={view === "contact" ? undefined : "nav-active"}
            aria-current={view === "contact" ? undefined : "page"}
            onClick={() => navigate("home")}
          >
            <Map size={16} />
            {t.path}
          </button>
          <button
            className={view === "contact" ? "nav-active" : undefined}
            aria-current={view === "contact" ? "page" : undefined}
            onClick={() => { navigate("contact"); window.scrollTo({ top: 0 }); }}
          >
            <Mail size={16} />
            Contact
          </button>
        </nav>
        {view === "home" && <div id="academy-header-search" />}
        <div className="header-settings">
          <span className="header-xp pill" key={earnedXP(progress)}>{earnedXP(progress)} XP</span>
          <label className="theme-select">
            <span className="sr-only">{t.appearance}</span>
            {appearance === "system" ? (
              <Monitor size={16} />
            ) : appearance === "dark" ? (
              <Moon size={16} />
            ) : (
              <Sun size={16} />
            )}
            <select
              aria-label={t.appearance}
              value={appearance}
              onChange={(e) => setAppearance(e.target.value as Appearance)}
            >
              <option value="light">{t.light}</option>
              <option value="dark">{t.dark}</option>
              <option value="system">{t.system}</option>
            </select>
          </label>
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
    <dl>{glossary.map(([en, ar, enDefinition, arDefinition]) => <div key={en}><dt><bdi dir="ltr">{en}</bdi>{ENABLE_ARABIC && <> · <bdi dir="rtl">{ar}</bdi></>}</dt><dd>{lang === "ar" ? arDefinition : enDefinition}</dd></div>)}</dl>
  </details>;
}
