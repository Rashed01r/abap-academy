"use client";
import { useState } from "react";
import { ArrowRight, Check, BookOpen } from "lucide-react";
import { Mission, missions } from "@/lib/curriculum";
import { Locale } from "@/lib/engine";
import { ui } from "@/lib/i18n";
import { Progress, allChallengesPassed } from "@/lib/progress";
import { SyntaxLab, Quiz } from "./syntax-lab";
import { LearningWorkspace } from "./learning-workspace";
import { TechnicalText } from "./technical-text";
import { TableCategoryExplorer } from "./table-category-explorer";
export function MissionEngine({
  mission,
  lang,
  theme,
  progress,
  onLab,
  onAttempt,
  onStart,
  onComplete,
}: {
  mission: Mission;
  lang: Locale;
  theme: "light" | "dark";
  progress: Progress;
  onLab: () => void;
  onAttempt: (challengeId: string, passed: boolean) => void;
  onStart: () => void;
  onComplete: () => void;
}) {
  const [stage, setStage] = useState(0),
    [passed, setPassed] = useState(false),
    [challengeIndex, setChallengeIndex] = useState(0),
    [quiz, setQuiz] = useState(false);
  const t = ui[lang];
  const challenge = mission.challenges?.[challengeIndex];
  const activeMission = challenge ? { ...mission, ...challenge } : mission;
  const moreChallenges = !!mission.challenges && challengeIndex < mission.challenges.length - 1;
  const assessed = allChallengesPassed(progress, mission.id);
  function goToStage(index: number) {
    setStage(index);
    setPassed(false);
    onStart();
  }
  const next = () => {
    setStage((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return (
    <section className="mission-engine" onClickCapture={onStart}>
      <div className="mission-title">
        <span className="eyebrow">
          {t.mission} {String(missions.findIndex(m => m.id === mission.id) + 1).padStart(2, "0")} ·{" "}
          {mission.minutes} {t.minutes} · {mission.xp} XP
        </span>
        <h1><TechnicalText>{mission.title[lang]}</TechnicalText></h1>
        <p>{mission.subtitle[lang]}</p>
        <p>{t.optionalLab}</p>
        <div className="explore-actions">
          <button className="secondary" onClick={() => goToStage(0)}>{t.learnSyntax}</button>
          <button className="primary" onClick={() => goToStage(4)}>{t.startChallenge}</button>
          <button className="secondary" onClick={() => goToStage(2)}>{t.reviewExample}</button>
        </div>
      </div>
      <ol className="stages">
        {t.stageNames.map((s, i) => (
          <li key={i} aria-current={i === stage ? "step" : undefined}>
            <button type="button" onClick={() => goToStage(i)} aria-current={i === stage ? "step" : undefined}>
              <span>{(i === 0 && progress.labs.includes(mission.id)) || (i === 4 && assessed) || (i === 5 && progress.missions.includes(mission.id)) ? <Check size={13} /> : i + 1}</span>
              {s}
            </button>
          </li>
        ))}
      </ol>
      {stage === 0 ? (
        <>
        <div className="instruction"><h2>{t.learn}</h2><p><TechnicalText>{mission.brief[lang]}</TechnicalText></p><ul>{mission.objectives.map(objective => <li key={objective.en}><TechnicalText>{objective[lang]}</TechnicalText></li>)}</ul></div>
        <SyntaxLab
          id={mission.id}
          tokens={mission.tokens}
          example={mission.example}
          lang={lang}
          theme={theme}
          completed={progress.labs.includes(mission.id)}
          onComplete={() => {
            onLab();
            next();
          }}
        />
        </>
      ) : stage === 1 ? (
        <div className="brief-grid">
          <article className="learn-card">
            <BookOpen size={28} />
            <h2>{t.learn}</h2>
            <p><TechnicalText>{mission.brief[lang]}</TechnicalText></p>
            <div className="goal-box">
              <span className="eyebrow">{t.challenge}</span>
              <p><TechnicalText>{mission.goal[lang]}</TechnicalText></p>
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
          <h2>{t.quiz}</h2>
          <p>{t.assessmentRequired}</p>
          <h3>{t.skillsLearned}</h3>
          <ul>{mission.objectives.map(objective => <li key={objective.en}><TechnicalText>{objective[lang]}</TechnicalText></li>)}</ul>
          <Quiz
            lang={lang}
            question={mission.quiz[lang]}
            options={mission.options.map((o) => o[lang])}
            answer={mission.answer}
            explanation={mission.quizExplanation[lang]}
            onCorrect={() => setQuiz(true)}
          />
          <button className="primary" disabled={!quiz || !assessed} onClick={onComplete}>
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
              <TechnicalText>{stage === 4
                ? activeMission.goal[lang]
                : stage === 2
                  ? mission.visual[lang]
                  : mission.practice[lang]}</TechnicalText>
            </p>
            {stage === 4 && challenge && <h2>{challenge.title[lang]} ({challengeIndex + 1}/{mission.challenges!.length})</h2>}
          </div>
          {stage === 4 && mission.challenges && <div className="explore-actions" role="group" aria-label={t.challenge}>
            {mission.challenges.map((item, index) => <button className="secondary" key={item.id} aria-pressed={index === challengeIndex} onClick={() => {setChallengeIndex(index);setPassed(false);}}>{item.title[lang]}</button>)}
          </div>}
          {mission.activity === "table-categories" && <TableCategoryExplorer lang={lang} assessment={stage === 4} completed={progress.passedChallenges?.includes("data-category-choice")} onPass={() => onAttempt("data-category-choice", true)}/>}
          <LearningWorkspace
            key={`${stage}-${challengeIndex}`}
            initialCode={
              stage === 4
                ? lang === "ar"
                  ? activeMission.starterAr || activeMission.starter
                  : activeMission.starter
                : mission.example
            }
            lang={lang}
            theme={theme}
            mission={stage === 4 ? activeMission : undefined}
            onResult={(correct, attempt) => {
              setPassed(correct);
              if (attempt) onAttempt(activeMission.id, correct);
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
                if (stage === 4) setChallengeIndex(0);
              setPassed(false);
            }}
          >
            {t.previous}
          </button>
          <span dir="ltr">{stage + 1} / 6</span>
          <button
            className="primary"
            disabled={stage === 4 && !passed}
            onClick={() => {
              if (stage === 4 && moreChallenges) {
                setChallengeIndex(i => i + 1);
                setPassed(false);
              } else next();
            }}
          >
            {stage === 4 && moreChallenges ? t.nextChallenge : t.next}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
