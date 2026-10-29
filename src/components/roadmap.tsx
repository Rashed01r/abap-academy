"use client";
import { ArrowRight, Check, Lock, Sparkles, Trophy } from "lucide-react";
import { Locale } from "@/lib/engine";
import { ui } from "@/lib/i18n";
import { missions, paths, Text } from "@/lib/curriculum";
import { Progress, unlocked, earnedXP } from "@/lib/progress";
export type MissionPreview = {
  title: Text;
  concepts: Text;
  prerequisite: Text;
  implemented?: string;
  minutes?: number;
};
export function Roadmap({
  lang,
  progress,
  storage,
  open,
  setPreview,
}: {
  lang: Locale;
  progress: Progress;
  storage: boolean;
  open: (id: string) => void;
  setPreview: (preview: MissionPreview) => void;
}) {
  const t = ui[lang],
    count =
      (progress.labs.includes("orientation") ? 1 : 0) +
      progress.missions.length;
  return (
    <section className="journey-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t.pathProgress}</span>
          <h2>{t.journey}</h2>
          <p>{t.journeySub}</p>
        </div>
        <span className="pill">
          <Trophy size={16} /> {earnedXP(progress)} {t.xp}
        </span>
      </div>
      <div className="journey-layout">
        <div className="roadmap">
          <div className="path-heading">
            <span>01</span>
            <div>
              <h3>{paths[0].title[lang]}</h3>
              <p>{paths[0].concepts[lang]}</p>
            </div>
          </div>
          <div className="roadmap-nodes">
            {[
              {
                id: "orientation",
                title: { en: t.orientation, ar: t.orientation },
                subtitle: {
                  en: t.orientationSub,
                  ar: t.orientationSub,
                },
                minutes: 4,
              },
              ...missions,
            ].map((m, i) => {
              const complete =
                  m.id === "orientation"
                    ? progress.labs.includes(m.id)
                    : progress.missions.includes(m.id),
                available = unlocked(m.id, progress);
              return (
                <div
                  className={`roadmap-node ${complete ? "complete" : available ? "available" : "locked"}`}
                  key={m.id}
                >
                  <span className="node-dot">
                    {complete ? (
                      <Check size={19} />
                    ) : available ? (
                      i + 1
                    ) : (
                      <Lock size={16} />
                    )}
                  </span>
                  <button
                    className="node-card"
                    onClick={() =>
                      available
                        ? open(m.id)
                        : setPreview({
                            title: m.title,
                            concepts: {
                              en:
                                missions.find((x) => x.id === m.id)?.goal.en ||
                                "",
                              ar:
                                missions.find((x) => x.id === m.id)?.goal.ar ||
                                "",
                            },
                            prerequisite:
                              missions.find((x) => x.id === m.id)
                                ?.prerequisite === "addition"
                                ? missions[0].title
                                : {
                                    en: t.orientation,
                                    ar: t.orientation,
                                  },
                            implemented: m.id,
                            minutes: m.minutes,
                          })
                    }
                  >
                    <div>
                      <small>
                        {i === 0 ? t.lab : `${t.mission} 0${i}`} · {m.minutes}{" "}
                        {t.minutes}
                      </small>
                      <h3>{m.title[lang]}</h3>
                      <p>{m.subtitle[lang]}</p>
                      <span className="node-status">
                        {complete
                          ? t.completed
                          : available
                            ? t.available
                            : t.locked}
                        {!available &&
                          ` · ${t.prerequisite}: ${missions.find((x) => x.id === m.id)?.prerequisite === "addition" ? missions[0].title[lang] : t.orientation}`}
                      </span>
                    </div>
                    <ArrowRight size={20} />
                  </button>
                </div>
              );
            })}
            {[
              { en: "Conditions", ar: "الشروط" },
              { en: "Loops", ar: "الحلقات" },
            ].map((name, i) => (
              <div className="roadmap-node future-node" key={name.en}>
                <span className="node-dot">
                  <Lock size={15} />
                </span>
                <button
                  className="node-card compact"
                  onClick={() =>
                    setPreview({
                      title: name,
                      concepts: name,
                      prerequisite: i
                        ? { en: "Conditions", ar: "الشروط" }
                        : missions[1].title,
                      minutes: 6,
                    })
                  }
                >
                  <div>
                    <h3>{name[lang]}</h3>
                    <span className="node-status">{t.upcoming}</span>
                  </div>
                  <span className="preview-chip">{t.preview}</span>
                </button>
              </div>
            ))}
          </div>
          <div className="future-paths">
            {paths.slice(1).map((p, i) => (
              <details key={p.id}>
                <summary>
                  <span className="path-number">
                    {String(i + 2).padStart(2, "0")}
                  </span>
                  <span>
                    {p.title[lang]}
                    <small>
                      {t.preview} · ≈{p.time} {t.minutes}
                    </small>
                  </span>
                  <span>+</span>
                </summary>
                <p>{t.futureIntro}</p>
                <div className="future-concepts">
                  {p.concepts[lang].split(" · ").map((c, j) => (
                    <button
                      key={c}
                      onClick={() =>
                        setPreview({
                          title: {
                            en: p.concepts.en.split(" · ")[j],
                            ar: p.concepts.ar.split(" · ")[j],
                          },
                          concepts: p.concepts,
                          prerequisite: j
                            ? {
                                en: p.concepts.en.split(" · ")[j - 1],
                                ar: p.concepts.ar.split(" · ")[j - 1],
                              }
                            : paths[i].title,
                          minutes: 8,
                        })
                      }
                    >
                      {c}
                      <Lock size={12} />
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
        <aside className="progress-sidebar">
          <div className="progress-card">
            <span className="eyebrow">{t.progress}</span>
            <div
              className="progress-ring"
              style={{
                background: `conic-gradient(var(--accent) ${(count / 3) * 360}deg,var(--line) 0)`,
              }}
            >
              <div>
                <strong>
                  {Math.round((count / 3) * 100)}
                  <small>%</small>
                </strong>
              </div>
            </div>
            <h3>
              {count} / 3 {t.completed}
            </h3>
            <p>{t.pathProgress}</p>
            <div className="xp-row">
              <Sparkles size={17} />
              <strong>{earnedXP(progress)}</strong> XP
            </div>
            <small>{storage ? t.saved : t.storage}</small>
          </div>
          <div className="milestone-card">
            <Trophy size={25} />
            <h3>{count === 3 ? t.allDone : t.milestone}</h3>
            <p>{count === 3 ? t.allDoneSub : t.orientationGoal}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
