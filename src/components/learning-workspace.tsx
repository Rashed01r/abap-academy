"use client";
import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Lightbulb,
} from "lucide-react";
import { CodeEditor } from "./code-editor";
import { ResetDialog } from "./reset-dialog";
import { Mission } from "@/lib/curriculum";
import {
  ExecutionEvent,
  SimulationError,
  simulate,
  evaluate,
  Locale,
  ChallengeFailure,
  Range,
} from "@/lib/engine";
import { ui, errors, explain } from "@/lib/i18n";
import { diagnosticAdvice } from "@/lib/diagnostics";
import { TechnicalText } from "./technical-text";
import { TableMemory } from "./table-memory";
import { LoopVisualizer } from "./loop-visualizer";
import { FieldSymbolMemory } from "./field-symbol-memory";
export function LearningWorkspace({
  initialCode,
  lang,
  theme,
  mission,
  onResult,
  teachingRange,
  teachingSource,
  onSourceLine,
}: {
  initialCode: string;
  lang: Locale;
  theme: "light" | "dark";
  mission?: Mission;
  onResult?: (correct: boolean, attempt: boolean) => void;
  teachingRange?: Range;
  teachingSource?: string;
  onSourceLine?: (line: number) => void;
}) {
  const [code, setCode] = useState(initialCode),
    [events, setEvents] = useState<ExecutionEvent[]>([]),
    [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [error, setError] = useState<SimulationError>(),
    [feedback, setFeedback] = useState<"correct" | "wrong" | "">(""),
    [failure, setFailure] = useState<ChallengeFailure>(),
    [hint, setHint] = useState(false),
    [reset, setReset] = useState(false),
    [field, setField] = useState("");
  const [speed, setSpeed] = useState(1400);
  const t = ui[lang],
    event = events[index];
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (index >= events.length - 1) setPlaying(false);
      else setIndex((i) => i + 1);
    }, speed);
    return () => clearTimeout(timer);
  }, [playing, index, events.length, speed]);
  function change(v: string) {
    setCode(v);
    setEvents([]);
    setIndex(0);
    setPlaying(false);
    setError(undefined);
    setFeedback("");
    setFailure(undefined);
    setField("");
    onResult?.(false, false);
  }
  function run(check = false) {
    setPlaying(false);
    setError(undefined);
    setFailure(undefined);
    try {
      if (check && mission) {
        const result = evaluate(code, mission.id);
        setEvents(result.events);
        setIndex(result.events.length - 1);
        setFeedback(result.correct ? "correct" : "wrong");
        setFailure(result.failure);
        onResult?.(result.correct, true);
      } else {
        setEvents(simulate(code));
        setIndex(0);
        setFeedback("");
      }
    } catch (e) {
      setEvents([]);
      setFeedback("");
      if (e instanceof SimulationError) setError(e);
      onResult?.(false, check);
    }
  }
  return (
    <div className="simulation-workspace">
      <div className="workspace-grid">
        <div className="code-side">
          <CodeEditor
            code={code}
            onChange={change}
            event={event}
            error={error}
            theme={theme}
            lang={lang}
            onField={setField}
            teachingRange={code === teachingSource ? teachingRange : undefined}
            onSourceLine={code === teachingSource ? onSourceLine : undefined}
          />
          <div className="toolbar">
            <button className="primary" onClick={() => run(false)}>
              <Play size={16} />
              {t.run}
            </button>
            <button className="secondary" onClick={() => setReset(true)}>
              <RotateCcw size={15} />
              {t.reset}
            </button>
            {mission && (
              <button className="secondary" onClick={() => setHint(!hint)}>
                <Lightbulb size={15} />
                {t.hint}
              </button>
            )}
          </div>
          {mission && (
            <div className="challenge-check">
              <span>
                {t.expected}: <code dir="ltr">{mission.expected}</code>
              </span>
              <button className="primary" onClick={() => run(true)}>
                {t.check}
                <Check size={16} />
              </button>
            </div>
          )}
          {hint && mission && (
            <div className="hint-panel">
              <p><TechnicalText>{mission.hint[lang]}</TechnicalText></p>
              <button
                className="text-button"
                onClick={() => change(mission.solution)}
              >
                {t.solution}
              </button>
            </div>
          )}
          {error && (
            <div role="alert" className="feedback error">
              <strong><TechnicalText>{errors[lang][error.code]}</TechnicalText></strong>
              {error.detail && <code dir="ltr"> {error.detail}</code>}
              <p><TechnicalText>{diagnosticAdvice[error.code].hint[lang]}</TechnicalText></p>
              <details><summary>{t.explainWhy}</summary><p>{diagnosticAdvice[error.code].why[lang]}</p><pre dir="ltr">{diagnosticAdvice[error.code].example}</pre></details>
              <span>
                {t.source}: {error.range.startLine}:{error.range.startColumn}
              </span>
            </div>
          )}
          {feedback && (
            <div
              role="status"
              className={`feedback ${feedback === "correct" ? "success" : "warning"}`}
            >
              <p>{feedback === "correct" ? t.correct : t.wrong}</p>
              {feedback === "wrong" && mission && <p><TechnicalText>{mission.hint[lang]}</TechnicalText></p>}
              {failure && <div className="probe-feedback"><p>{t.failedInput}: <code dir="ltr">{failure.name} = {failure.input}</code></p><p>{t.expected}: <code dir="ltr">{failure.expected}</code></p><p>{t.actualOutput}: <code dir="ltr">{failure.actual || "∅"}</code></p><p>{t.probeExplanation}</p></div>}
            </div>
          )}
          <details className="limits">
            <summary>{t.limit}</summary>
            <p>{t.limits}</p>
          </details>
        </div>
        <section className="execution-panel" aria-label={t.active}>
          <div className="panel-title">
            <span className="eyebrow">{t.active}</span>
            <span dir="ltr">
              {events.length ? `${index + 1} / ${events.length}` : "—"}
            </span>
          </div>
          {event ? (
            <>
              <div
                className="active-statement"
                data-start-line={event.range.startLine}
                data-end-line={event.range.endLine}
              >
                <span className="execution-badge">
                  ▶ {t.step} {index + 1}
                </span>
                <pre dir="ltr">{event.statement}</pre>
              </div>
              <div className="what-happened" aria-live="polite">
                <h3>{t.happened}</h3>
                <p><TechnicalText>{explain(event, lang)}</TechnicalText></p>
              </div>
            </>
          ) : (
            <p className="empty-state">{t.empty}</p>
          )}
          <div className="execution-controls">
            <button
              className="icon-button"
              aria-label={t.previous}
              disabled={!events.length || index === 0}
              onClick={() => {
                setPlaying(false);
                setIndex((i) => i - 1);
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="icon-button"
              aria-label={playing ? t.pause : t.play}
              disabled={!events.length}
              onClick={() => {
                if (index === events.length - 1) setIndex(0);
                setPlaying(!playing);
              }}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              className="icon-button"
              aria-label={t.next}
              disabled={!events.length || index === events.length - 1}
              onClick={() => {
                setPlaying(false);
                setIndex((i) => i + 1);
              }}
            >
              <ChevronRight size={18} />
            </button>
            <button
              className="icon-button"
              aria-label={t.restart}
              disabled={!events.length}
              onClick={() => {
                setPlaying(false);
                setIndex(0);
              }}
            >
              <RotateCcw size={17} />
            </button>
          </div>
          <label className="playback-speed">{t.playbackSpeed}
            <select value={speed} onChange={e => setSpeed(Number(e.target.value))}>
              <option value={2200}>{t.slow}</option><option value={1400}>{t.normal}</option><option value={600}>{t.fast}</option>
            </select>
          </label>
          {event && <LoopVisualizer event={event} lang={lang} />}
          {event && <FieldSymbolMemory event={event} previous={events[index - 1]} lang={lang} />}
          <div className="memory-heading">
            <h3>{t.memory}</h3>
            <span>{t.changed} ●</span>
          </div>
          <div className="memory-grid" data-testid="memory">
            {!event || !Object.keys(event.memory).length ? (
              <p className="muted small">{t.noMemory}</p>
            ) : (
              Object.entries(event.memory).map(([name, v]) => (
                <div
                  key={name}
                  className={`memory-card ${Array.isArray(v) ? "table-memory-card" : ""} ${event.changed.includes(name) ? "changed" : ""}`}
                >
                  <div className="memory-name">
                    <code dir="ltr">{name}</code>
                    {event.changed.includes(name) && <span>↳ {t.changed}</span>}
                  </div>
                  {Array.isArray(v) ? <TableMemory name={name} rows={v} event={event} lang={lang} /> : typeof v === "object" ? (
                    <div className="structure-fields">
                      {Object.entries(v).map(([key, val]) => (
                        <button
                          key={key}
                          className={`structure-field ${event.changed.includes(name + "-" + key) ? "changed" : ""} ${field === name + "-" + key ? "selected" : ""}`}
                          onClick={() => setField(name + "-" + key)}
                          aria-pressed={field === name + "-" + key}
                        >
                          <code dir="ltr">{key}</code>
                          <strong dir="ltr">{JSON.stringify(val)}</strong>
                          {event.changed.includes(name + "-" + key) && (
                            <span>↳</span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <strong className="memory-value" dir="ltr">
                      {JSON.stringify(v)}
                    </strong>
                  )}
                </div>
              ))
            )}
          </div>
          {field && (
            <p className="selected-field">
              {t.field}: <code dir="ltr">{field}</code>
            </p>
          )}
          {event?.condition && (
            <div className="condition-card">
              <h3>{t.conditions}</h3>
              <code dir="ltr">
                {event.condition.expression} →{" "}
                {event.condition.result ? "TRUE" : "FALSE"}
              </code>
            </div>
          )}
          <div
            className={`output-card ${event?.changed.includes("output") ? "changed" : ""}`}
          >
            <h3>{t.output}</h3>
            <pre dir="ltr" data-testid="output">
              {event?.output.join("\n") || t.noOutput}
            </pre>
          </div>
          {event && (
            <div className="next-statement">
              <span>{t.nextStatement}</span>
              <code dir="ltr">{events[index + 1]?.statement || t.end}</code>
            </div>
          )}
        </section>
      </div>
      {!!events.length && (
        <section className="timeline">
          <h3>{t.timeline}</h3>
          <ol>
            {events.map((e, i) => (
              <li
                key={e.id}
                className={
                  i < index ? "past" : i === index ? "current" : "future"
                }
              >
                <button
                  aria-current={i === index ? "step" : undefined}
                  onClick={() => {
                    setPlaying(false);
                    setIndex(i);
                  }}
                >
                  <span>{i < index ? "✓" : i + 1}</span>
                  <code dir="ltr">{e.statement}</code>
                  <small>
                    {i < index
                      ? t.executed
                      : i === index
                        ? t.current
                        : t.future}
                  </small>
                </button>
                {((e.operation === "end" || e.operation === "control") ? e.skippedRanges : []).map((r) => (
                  <div className="skipped-event" key={r.start}>
                    <span>↷ {t.skipped}</span>
                    <pre dir="ltr">{code.slice(r.start, r.end)}</pre>
                  </div>
                ))}
              </li>
            ))}
          </ol>
        </section>
      )}
      {reset && (
        <ResetDialog
          lang={lang}
          onCancel={() => setReset(false)}
          onConfirm={() => {
            change(initialCode);
            setReset(false);
          }}
        />
      )}
    </div>
  );
}
