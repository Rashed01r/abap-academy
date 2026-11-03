"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  GraduationCap,
  Globe2,
  Sparkles,
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
  orientation,
  additionExample,
  conditionalExample,
} from "@/lib/curriculum";
import {
  Progress,
  initialProgress,
  normalizeProgress,
  unlocked,
  visitMission,
  startMission,
  completeMission,
} from "@/lib/progress";
import { SyntaxLab } from "@/components/syntax-lab";
import { MissionEngine } from "@/components/mission-engine";
import { LearningWorkspace } from "@/components/learning-workspace";
import { Roadmap, MissionPreview } from "@/components/roadmap";
import { glossary } from "@/lib/glossary";
import { orientationExamples } from "@/lib/anatomy-content";
type Appearance = "light" | "dark" | "system";
export default function Academy() {
  const [lang, setLang] = useState<Locale>("en"),
    [appearance, setAppearance] = useState<Appearance>("system"),
    [systemDark, setSystemDark] = useState(false),
    [progress, setProgress] = useState<Progress>(initialProgress),
    [ready, setReady] = useState(false),
    [storage, setStorage] = useState(true),
    [view, setView] = useState("home"),
    [preview, setPreview] = useState<MissionPreview>(),
    [example, setExample] = useState(0);
  const t = ui[lang],
    theme =
      appearance === "system" ? (systemDark ? "dark" : "light") : appearance;
  const current = !progress.labs.includes("orientation")
    ? "orientation"
    : missions.find(m => !progress.missions.includes(m.id))?.id || missions.at(-1)!.id;
  const count =
    (progress.labs.includes("orientation") ? 1 : 0) + progress.missions.length;
  const hasActivity = !!(count || progress.viewed?.length || progress.started?.length);
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
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
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
    if (unlocked(view)) url.searchParams.set("mission", view);
    else url.searchParams.delete("mission");
    window.history.replaceState(null, "", url);
  }, [view, ready]);
  function open(id: string) {
    if (!unlocked(id, progress)) return;
    setProgress((p) => visitMission(p, id));
    setView(id);
    window.scrollTo({ top: 0 });
  }
  function lab(id: string) {
    setProgress((p) => ({ ...p, labs: Array.from(new Set([...p.labs, id])) }));
  }
  const selected = missions.find((m) => m.id === view);
  return (
    <div className="app">
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <header>
        <button
          className="brand"
          aria-label={t.home}
          onClick={() => setView("home")}
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
            onClick={() => setView("home")}
          >
            <Map size={16} />
            {t.path}
          </button>
          <button
            className={view === "simulator" ? "nav-active" : ""}
            onClick={() => setView("simulator")}
          >
            <Code2 size={16} />
            {t.playground}
          </button>
        </nav>
        <div className="header-settings">
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
      </header>
      <main id="main">
        {view === "home" ? (
          <>
            <section className="hero">
              <div className="hero-intro">
                <div className="eyebrow">
                  <span className="status-dot" />
                  {t.tag}
                </div>
                <h1>
                  {t.hero.split("\n").map((s, i) => (
                    <span key={s} className={i ? "accent" : ""}>
                      {s}
                      <br />
                    </span>
                  ))}
                </h1>
                <p className="intro">{t.intro}</p>
                <button
                  className="primary"
                  disabled={!ready}
                  onClick={() =>
                    open(
                      unlocked(progress.current) && hasActivity && !progress.missions.includes(progress.current) && !(progress.current === "orientation" && progress.labs.includes("orientation"))
                        ? progress.current
                        : current,
                    )
                  }
                >
                  {hasActivity ? t.continueLearning : t.start}
                  <ArrowRight size={18} />
                </button>
                <a className="secondary explore-link" href="#academy-topics">{t.explore}</a>
                <p className="hero-foot">
                  <Check size={14} />
                  {t.saved}
                </p>
              </div>
              <div className="hero-art" dir="ltr">
                <div className="orbit" />
                <div className="hero-code">
                  <div className="window-dots">
                    ● ● ● <span>your_first_mission.abap</span>
                  </div>
                  <pre>
                    <span>DATA</span> lv_first <span>TYPE</span> i{" "}
                    <span>VALUE</span> 5.
                    <br />
                    <span>DATA</span> lv_second <span>TYPE</span> i{" "}
                    <span>VALUE</span> 8.
                    <br />
                    <span>DATA</span> lv_result <span>TYPE</span> i.
                    <br />
                    lv_result = lv_first + lv_second.
                  </pre>
                  <div className="hero-execution">
                    ▶ <span>WRITE</span> lv_result.
                  </div>
                </div>
                <div className="hero-memory">
                  <Sparkles size={18} />
                  <code>lv_result</code>
                  <strong>13</strong>
                  <span>✓</span>
                </div>
                <div className="hero-label">
                  {[
                    t.stageNames[1],
                    t.stageNames[2],
                    t.stageNames[3],
                    t.stageNames[5],
                  ].join(" → ")}
                </div>
              </div>
            </section>
            <Roadmap
              ready={ready}
              lang={lang}
              progress={progress}
              storage={storage}
              open={open}
              setPreview={setPreview}
            />
          </>
        ) : (
          <>
            <nav className="lesson-navigation" aria-label={t.explore}>
            <button
              className="text-button back-link"
              onClick={() => setView("home")}
            >
              ← {t.back}
            </button>
            <a className="text-button" href="#academy-topics" onClick={() => setView("home")}>{t.exploreTopics}</a>
            </nav>
            {view === "orientation" ? (
              <section className="orientation">
                <span className="eyebrow">00 · 4 {t.minutes} · 25 XP</span>
                <h1>{t.orientation}</h1>
                <p className="intro">{t.orientationGoal}</p>
                <div onClickCapture={() => setProgress(p => startMission(p, "orientation"))}>
                <SyntaxLab
                  id="orientation"
                  tokens={orientation}
                  example={orientationExamples[lang]}
                  lang={lang}
                  theme={theme}
                  completed={progress.labs.includes("orientation")}
                  onComplete={() => {
                    lab("orientation");
                    setProgress((p) => ({ ...p, current: "addition" }));
                    setView("home");
                  }}
                />
                </div>
              </section>
            ) : selected ? (
              <MissionEngine
                key={selected.id}
                mission={selected}
                lang={lang}
                theme={theme}
                progress={progress}
                onLab={() => lab(selected.id)}
                onStart={() => setProgress(p => startMission(p, selected.id))}
                onAttempt={(challengeId, passed) =>
                  setProgress((p) => ({
                    ...p,
                    passedChallenges: passed ? Array.from(new Set([...(p.passedChallenges || []), challengeId])) : p.passedChallenges,
                    results: {
                      ...p.results,
                      [selected.id]: {
                        attempts: (p.results[selected.id]?.attempts || 0) + 1,
                        passed: passed || p.results[selected.id]?.passed === true,
                      },
                    },
                  }))
                }
                onComplete={() => {
                  setProgress((p) => ({
                    ...completeMission(p, selected.id, true),
                    current: missions[missions.findIndex(m => m.id === selected.id) + 1]?.id || selected.id,
                  }));
                  setView("home");
                }}
              />
            ) : (
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
          </>
        )}
      </main>
      <details className="glossary">
        <summary>{t.glossary}</summary>
        <dl>{glossary.map(([en, ar, enDefinition, arDefinition]) => <div key={en}><dt><bdi dir="ltr">{en}</bdi> · <bdi dir="rtl">{ar}</bdi></dt><dd>{lang === "ar" ? arDefinition : enDefinition}</dd></div>)}</dl>
      </details>
      <footer>
        <span>
          ABAP academy <sup>2.0</sup>
        </span>
        <span>{storage ? t.saved : t.storage}</span>
        <span>{t.limit}</span>
      </footer>
      {preview && (
        <PreviewDialog
          lang={lang}
          title={preview.title[lang]}
          onClose={() => setPreview(undefined)}
        >
          <span className="pill">
            {t.comingSoon}
          </span>
          <p>{t.futureIntro}</p>
          <h3>{t.skills}</h3>
          <p>{preview.concepts[lang]}</p>
          <p>
            <strong>{t.recommendedFirst}:</strong> {preview.prerequisite[lang]}
          </p>
          <p>
            ≈{preview.minutes} {t.minutes}
          </p>
          <button className="secondary" onClick={() => setPreview(undefined)}>
            {t.back}
          </button>
        </PreviewDialog>
      )}
    </div>
  );
}
function PreviewDialog({
  title,
  children,
  onClose,
  lang,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  lang: Locale;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!,
      previous = document.activeElement as HTMLElement | null;
    d.showModal();
    return () => {
      d.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="preview-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <button
        autoFocus
        className="dialog-close"
        aria-label={ui[lang].back}
        onClick={onClose}
      >
        ×
      </button>
      <h2 id="preview-title">{title}</h2>
      {children}
    </dialog>
  );
}
