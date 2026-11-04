"use client";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  Globe2,
  Sun,
  Moon,
  Monitor,
  Map,
  Code2,
} from "lucide-react";
import { Locale } from "@/lib/engine";
import { ui } from "@/lib/i18n";
import {
  missions,
  additionExample,
  conditionalExample,
} from "@/lib/curriculum";
import {
  Progress,
  initialProgress,
  normalizeProgress,
  unlocked,
  visitMission,
  earnedXP,
} from "@/lib/progress";
import { LearningWorkspace } from "@/components/learning-workspace";
import { glossary } from "@/lib/glossary";
import { KnowledgeTree } from "@/components/knowledge-tree";
import "./knowledge-tree.css";
type Appearance = "light" | "dark" | "system";
export default function Academy() {
  const [lang, setLang] = useState<Locale>("en"),
    [appearance, setAppearance] = useState<Appearance>("system"),
    [systemDark, setSystemDark] = useState(false),
    [progress, setProgress] = useState<Progress>(initialProgress),
    [ready, setReady] = useState(false),
    [storage, setStorage] = useState(true),
    [view, setView] = useState("home"),
    [example, setExample] = useState(0);
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
      const l = localStorage.getItem("abap2-language");
      if (l === "ar") setLang(l);
      const a = localStorage.getItem("abap2-appearance");
      if (a === "light" || a === "dark" || a === "system") setAppearance(a);
    } catch {
      setStorage(false);
    }
    const requested = new URLSearchParams(window.location.search).get("mission");
    if (requested && unlocked(requested)) {
      setProgress(p => visitMission(p, requested));
      setView(requested);
    }
    setReady(true);
    const media = matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    const listener = () => setSystemDark(media.matches);
    const restore = () => {
      const query = new URLSearchParams(window.location.search);
      const id = query.get("mission");
      setView(id && unlocked(id) ? id : "home");
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
        localStorage.setItem("abap2-master-progress", JSON.stringify(progress));
        localStorage.setItem("abap2-language", lang);
        localStorage.setItem("abap2-appearance", appearance);
      } catch {
        setStorage(false);
      }
  }, [lang, theme, appearance, progress, ready]);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("layout");
    if (unlocked(view)) url.searchParams.set("mission", view);
    else url.searchParams.delete("mission");
    window.history.replaceState(null, "", url);
  }, [view, ready]);
  function navigate(id: string) {
    const url = new URL(window.location.href);
    url.searchParams.delete("layout");
    if (unlocked(id)) url.searchParams.set("mission", id);
    else url.searchParams.delete("mission");
    if (url.href !== window.location.href) window.history.pushState(null, "", url);
    setView(id);
  }
  function open(id: string) {
    if (id !== "home" && !unlocked(id, progress)) return;
    if (id !== "home") setProgress((p) => visitMission(p, id));
    navigate(id);
    window.scrollTo({ top: 0 });
  }
  return (
    <div className={`app ${view !== "simulator" ? "immersive-academy" : ""}`}>
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
            ABAP<span className="brand-light">academy</span>
            <sup>2.0</sup>
          </span>
        </button>
        <nav aria-label={t.path}>
          <button
            className={view !== "simulator" ? "nav-active" : ""}
            onClick={() => navigate("home")}
          >
            <Map size={16} />
            {t.path}
          </button>
          <button
            className={view === "simulator" ? "nav-active" : ""}
            onClick={() => navigate("simulator")}
          >
            <Code2 size={16} />
            {t.playground}
          </button>
        </nav>
        {view !== "simulator" && <div id="academy-header-search" />}
        <div className="header-settings">
          {view !== "simulator" && <span className="header-xp pill">{earnedXP(progress)} XP</span>}
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
          <button
            className="language"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
          >
            <Globe2 size={16} />
            {lang === "en" ? "العربية" : "English"}
          </button>
        </div>
        {view !== "simulator" && <AcademyGlossary lang={lang} compact />}
      </header>
      <main id="main">
        {view !== "simulator" ? <KnowledgeTree selected={unlocked(view) ? view : undefined} open={open} lang={lang} theme={theme} progress={progress} setProgress={setProgress} ready={ready}/> : (
              <section className="simulator-page">
                <span className="eyebrow">{t.limit}</span>
                <h1>{t.playground}</h1>
                <p className="intro">{t.editorHelp}</p>
                <div className="example-tabs">
                  {[
                    missions[0].title,
                    missions[1].title,
                    { en: t.conditionDemo, ar: t.conditionDemo },
                  ].map((v, i) => (
                    <button
                      key={i}
                      aria-pressed={example === i}
                      onClick={() => setExample(i)}
                    >
                      {v[lang]}
                    </button>
                  ))}
                </div>
                <LearningWorkspace
                  key={example}
                  initialCode={
                    [additionExample, missions[1].example, conditionalExample][
                      example
                    ]
                  }
                  lang={lang}
                  theme={theme}
                />
              </section>
        )}
      </main>
      {(view === "simulator") && <AcademyGlossary lang={lang} />}
      <footer>
        <span>
          ABAP academy <sup>2.0</sup>
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
    <dl>{glossary.map(([en, ar, enDefinition, arDefinition]) => <div key={en}><dt><bdi dir="ltr">{en}</bdi> · <bdi dir="rtl">{ar}</bdi></dt><dd>{lang === "ar" ? arDefinition : enDefinition}</dd></div>)}</dl>
  </details>;
}
