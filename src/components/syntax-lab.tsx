"use client";
import { useRef, useState } from "react";
import { Check, MousePointer2, ArrowRight } from "lucide-react";
import { SyntaxToken } from "@/lib/curriculum";
import { Locale } from "@/lib/engine";
import { ui } from "@/lib/i18n";
import { TechnicalText } from "./technical-text";
import { VisualCodeAnatomy } from "./visual-code-anatomy";
import { getAnatomy } from "@/lib/anatomy-content";
import { missions } from "@/lib/curriculum";
import { useTopicSession } from "@/lib/use-topic-session";
export function Quiz({
  question,
  options,
  answer,
  explanation,
  lang,
  onCorrect,
  sessionKey,
}: {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  lang: Locale;
  onCorrect: () => void;
  sessionKey?: string;
}) {
  const [choice, setChoice] = useTopicSession<number | null>(sessionKey, null);
  const t = ui[lang];
  return (
    <div className="quiz">
      <div className="eyebrow">{t.question}</div>
      <h3><TechnicalText>{question}</TechnicalText></h3>
      <div className="answer-options">
        {options.map((o, i) => (
          <button
            key={o}
            aria-pressed={choice === i}
            onClick={() => {
              setChoice(i);
              if (i === answer) onCorrect();
            }}
          >
            {choice === i && i === answer && <Check size={16} />} <TechnicalText>{o}</TechnicalText>
          </button>
        ))}
      </div>
      {choice !== null && (
        <p
          role="status"
          className={choice === answer ? "success-text" : "error-text"}
        >
          {choice === answer ? t.right : t.tryAgain} <TechnicalText>{explanation}</TechnicalText>
        </p>
      )}
    </div>
  );
}
export function SyntaxLab({
  id,
  tokens,
  example,
  lang,
  completed,
  onComplete,
  theme = "light",
  selectedGroup,
  onGroupSelect,
}: {
  id: string;
  tokens: SyntaxToken[];
  example: string;
  lang: Locale;
  completed: boolean;
  onComplete: () => void;
  theme?: "light" | "dark";
  selectedGroup?: string;
  onGroupSelect?: (id: string) => void;
}) {
  const [selected, setSelected] = useState(0),
    [understood, setUnderstood] = useState<string[]>([]),
    [matched, setMatched] = useState(false),
    [detailsOpen, setDetailsOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const t = ui[lang],
    token = tokens[selected];
  const ready = completed || matched || understood.length === tokens.length;
  function selectCode(s: string) {
    const key = s.toLowerCase();
    const found = tokens.findIndex(
      (k) =>
        k.label.toLowerCase() === key ||
        k.label.toLowerCase().split(/\s+/).includes(key) ||
        k.id === key ||
        (key === "." && k.id === "period") ||
        ((key === ":" || key === ",") && k.id === "chain") ||
        (key === "=" && k.id === "equals") ||
        (["=", "<>", ">", "<", ">=", "<="].includes(key) && k.id === "compare") ||
        (key === "+" && k.id === "plus") ||
        (key === "-" && k.id === "hyphen") ||
        (["begin", "of"].includes(key) && k.id === "begin") ||
        (key === "end" && k.id === "endof") ||
        (key === "i" && k.id === "integer") ||
        (key === "string" && k.id === "string") ||
        (key.startsWith("lv_") && k.id === "naming") ||
        (key.startsWith("ls_") && k.id === "record") ||
        (key.startsWith("ty_") && k.id === "types"),
    );
    if (found >= 0) setSelected(found);
  }
  return (
    <section className="syntax-lab" aria-label={t.lab}>
      <div className="lab-heading">
        <span className="section-icon">
          <MousePointer2 size={20} />
        </span>
        <div>
          <div className="eyebrow">{t.lab}</div>
          <h2>{t.anatomy}</h2>
        </div>
        <span className="muted">
          {completed ? t.completed : t.selectGroup}
        </span>
      </div>
      <VisualCodeAnatomy doc={getAnatomy(id,example)} lang={lang} theme={theme} selectedGroup={selectedGroup} onGroupSelect={onGroupSelect} onMatched={()=>setMatched(true)} references={missions.find(m=>m.id === id)?.references} onExplore={refs=>{
        const found=tokens.findIndex(token=>refs.includes(token.id));
        if(found>=0) setSelected(found);
        setDetailsOpen(true);
        requestAnimationFrame(()=>{detailsRef.current?.querySelector("summary")?.focus();detailsRef.current?.scrollIntoView({block:"start",behavior:"instant"});});
      }}/>
      <details className="syntax-details" ref={detailsRef} open={detailsOpen} onToggle={event=>setDetailsOpen(event.currentTarget.open)}>
      <summary>{t.syntaxOptional} · {understood.length}/{tokens.length}</summary>
      <div className="lab-layout">
        <div>
          <div className="token-list" dir="ltr">
            {tokens.map((k, i) => (
              <button
                key={k.id}
                aria-pressed={selected === i}
                onClick={() => setSelected(i)}
              >
                <code>{k.label}</code>
                {(completed || understood.includes(k.id)) && (
                  <Check size={13} />
                )}
              </button>
            ))}
          </div>
          <pre className="clickable-code" dir="ltr" aria-label="ABAP">
            {example.split(/(\bsy-index\b|\b[a-zA-Z_]\w*\b|>=|<=|<>|[.:,+=<>/()-])/g).map((s, i) =>
              /^[a-zA-Z_]|^(>=|<=|<>|[.:,+=<>/()-])$/.test(s) ? (
                <button key={i} onClick={() => selectCode(s)}>
                  {s}
                </button>
              ) : (
                <span key={i}>{s}</span>
              ),
            )}
          </pre>
          <p className="muted small">{t.noReset}</p>
        </div>
        <article className="token-explainer">
          <span className="token-title" dir="ltr">
            {token.label}
          </span>
          <dl>
            <dt>{t.meaning}</dt>
            <dd><TechnicalText>{token.meaning[lang]}</TechnicalText></dd>
            <dt>{t.why}</dt>
            <dd><TechnicalText>{token.why[lang]}</TechnicalText></dd>
            <dt>{t.write}</dt>
            <dd><TechnicalText>{token.write[lang]}</TechnicalText></dd>
          </dl>
          <div className="example-pair">
            <div>
              <span>{t.example} ✓</span>
              <pre dir="ltr">{token.correct}</pre>
            </div>
            <div>
              <span>{t.mistake} ↻</span>
              <pre dir="ltr">{token.mistake}</pre>
            </div>
          </div>
          <Quiz
            key={id + token.id}
            question={token.question[lang]}
            options={token.options.map((o) => o[lang])}
            answer={token.answer}
            explanation={token.explanation[lang]}
            lang={lang}
            onCorrect={() =>
              setUnderstood((v) => Array.from(new Set([...v, token.id])))
            }
          />
          <div className="token-navigation">
            <button
              className="secondary"
              disabled={selected === 0}
              onClick={() => setSelected(selected - 1)}
            >
              {t.previous}
            </button>
            <button
              className="secondary"
              disabled={
                selected === tokens.length - 1 ||
                (!completed && !understood.includes(token.id))
              }
              onClick={() => setSelected(selected + 1)}
            >
              {t.next}
              <ArrowRight size={15} />
            </button>
          </div>
        </article>
      </div>
      </details>
      <div className="stage-footer">
        <span>{ready ? t.matchReady : t.groupComplete}</span>
        <button className="primary" disabled={!ready} onClick={onComplete}>
          {id === "orientation" ? t.finishOrientation : t.syntaxDone}
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
