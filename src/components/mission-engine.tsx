"use client";
import { useState } from "react";
import { ArrowRight, Check, BookOpen } from "lucide-react";
import { Mission } from "@/lib/curriculum";
import { Locale } from "@/lib/engine";
import { ui } from "@/lib/i18n";
import { Progress } from "@/lib/progress";
import { SyntaxLab, Quiz } from "./syntax-lab";
import { LearningWorkspace } from "./learning-workspace";
export function MissionEngine({
  mission,
  lang,
  theme,
  progress,
  onLab,
  onAttempt,
  onComplete,
}: {
  mission: Mission;
  lang: Locale;
  theme: "light" | "dark";
  progress: Progress;
  onLab: () => void;
  onAttempt: (passed: boolean) => void;
  onComplete: () => void;
}) {
  const [stage, setStage] = useState(0),
    [passed, setPassed] = useState(false),
    [quiz, setQuiz] = useState(false);
  const t = ui[lang];
  const next = () => {
    setStage((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return (
    <section className="mission-engine">
      <div className="mission-title">
        <span className="eyebrow">
          {t.mission} {mission.id === "addition" ? "01" : "02"} ·{" "}
          {mission.minutes} {t.minutes} · {mission.xp} XP
        </span>
        <h1>{mission.title[lang]}</h1>
        <p>{mission.subtitle[lang]}</p>
      </div>
      <ol className="stages">
        {t.stageNames.map((s, i) => (
          <li key={i} aria-current={i === stage ? "step" : undefined}>
            <span>{i < stage ? <Check size={13} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      {stage === 0 ? (
        <SyntaxLab
          id={mission.id}
          tokens={mission.tokens}
          example={mission.example}
          lang={lang}
          completed={progress.labs.includes(mission.id)}
          onComplete={() => {
            onLab();
            next();
          }}
        />
      ) : stage === 1 ? (
        <div className="brief-grid">
          <article className="learn-card">
            <BookOpen size={28} />
            <h2>{t.learn}</h2>
            <p>{mission.brief[lang]}</p>
            <div className="goal-box">
              <span className="eyebrow">{t.challenge}</span>
              <p>{mission.goal[lang]}</p>
            </div>
          </article>
          <div className="concept-card">
            <span className="eyebrow">{t.source}</span>
            <pre dir="ltr">{mission.example}</pre>
            <span className="pill">{t.limit}</span>
          </div>
        </div>
      ) : stage === 5 ? (
        <article className="completion-card">
          <span className="completion-mark">
            <Check size={30} />
          </span>
          <div className="eyebrow">
            +{progress.missions.includes(mission.id) ? 0 : mission.xp} XP
          </div>
          <h2>{t.correct}</h2>
          <Quiz
            lang={lang}
            question={mission.quiz[lang]}
            options={mission.options.map((o) => o[lang])}
            answer={mission.answer}
            explanation={mission.quizExplanation[lang]}
            onCorrect={() => setQuiz(true)}
          />
          <button className="primary" disabled={!quiz} onClick={onComplete}>
            {t.complete}
            <ArrowRight size={16} />
          </button>
        </article>
      ) : (
        <>
          <div className="instruction">
            <span className="eyebrow">
              {stage === 4
                ? t.challenge
                : stage === 3
                  ? t.practice
                  : t.stageNames[stage]}
            </span>
            <p>
              {stage === 4
                ? mission.goal[lang]
                : stage === 2
                  ? mission.visual[lang]
                  : lang === "en"
                    ? "Change a value, predict the result, then build a new trace. Use Previous to revisit memory. Editing clears the old trace."
                    : "غيّر قيمة وتوقع النتيجة ثم أنشئ تتبعاً جديداً. استخدم السابق لمراجعة الذاكرة. يمحو التحرير التتبع القديم."}
            </p>
          </div>
          <LearningWorkspace
            key={stage}
            initialCode={
              stage === 4
                ? lang === "ar"
                  ? mission.starterAr || mission.starter
                  : mission.starter
                : mission.example
            }
            lang={lang}
            theme={theme}
            mission={stage === 4 ? mission : undefined}
            onResult={(correct, attempt) => {
              setPassed(correct);
              if (attempt) onAttempt(correct);
            }}
          />
        </>
      )}
      {stage > 0 && stage < 5 && (
        <div className="stage-footer">
          <button
            className="secondary"
            onClick={() => {
              setStage((s) => s - 1);
              setPassed(false);
            }}
          >
            {t.previous}
          </button>
          <span>{stage + 1} / 6</span>
          <button
            className="primary"
            disabled={stage === 4 && !passed}
            onClick={next}
          >
            {t.next}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
