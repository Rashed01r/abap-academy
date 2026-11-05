"use client";
import { useMemo } from "react";
import { simulate, type Locale } from "@/lib/engine";
import { useTopicSession } from "@/lib/use-topic-session";

/** Uses the same interpreter as the editor; the diagram never invents execution. */
export function ControlFlowExplorer({id, lang}: {id: string; lang: Locale}) {
  const [mode, setMode] = useTopicSession(`${id}:flow-mode`, id === "conditions" ? "ranges" : "CONTINUE");
  const [score, setScore] = useTopicSession(`${id}:flow-score`, 75);
  const conditions = id === "conditions";
  const source = conditions ? `DATA lv_score TYPE i VALUE ${score}.
IF lv_score >= 80.
  WRITE 'High'.
ELSEIF lv_score >= 50.
  WRITE 'Medium'.
ELSE.
  WRITE 'Low'.
ENDIF.` : `DATA lv_count TYPE i VALUE 0.
DO 5 TIMES.
  lv_count = lv_count + 1.
  IF lv_count = 3.
    ${mode}.
  ENDIF.
  WRITE lv_count.
ENDDO.
WRITE 'Done'.`;
  const events = useMemo(() => simulate(source), [source]);
  const output = events.at(-1)?.output || [];
  const en = lang === "en";
  const label = conditions ? (en ? "Decision flow" : "مسار القرار") : (en ? "Skip or stop: compare the flow" : "التجاوز أو التوقف: قارن المسار");
  const result = conditions ? output[0] : mode;
  return <section className="control-flow-explorer" aria-label={label}>
    <h2>{label}</h2>
    <p>{conditions ? (en ? "Choose a boundary value. Follow the first true branch; later branches are skipped." : "اختر قيمة حدية. تابع أول فرع صحيح؛ وتُتجاوز الفروع اللاحقة.") : (en ? "Both examples reach the same trigger, 3. Change the operation and compare later passes and the code after the loop." : "يصل المثالان إلى القيمة نفسها 3. غيّر العملية وقارن الدورات اللاحقة والأكواد بعد الحلقة.")}</p>
    {conditions ? <label>{en ? "Score" : "الدرجة"} <select value={score} onChange={e => setScore(Number(e.target.value))}>{[49, 50, 75, 79, 80, 81].map(n => <option key={n} value={n}>{n}</option>)}</select></label> : <div className="explore-actions" role="group" aria-label={en ? "Loop operation" : "عملية الحلقة"}>{["CONTINUE", "EXIT"].map(op => <button className="secondary" key={op} aria-pressed={mode === op} onClick={() => setMode(op)}><code>{op}</code></button>)}</div>}
    {conditions ? <div className="decision-diagram" role="img" aria-label={en ? `Score ${score}: ${result}` : `الدرجة ${score}: ${result}`}>
      <div className="flow-node"><bdi dir="ltr"><code>lv_score = {score}</code></bdi></div><span aria-hidden="true">↓</span>
      <div className={`flow-node flow-question ${score >= 80 ? "active" : ""}`}><bdi dir="ltr"><code>score &gt;= 80?</code></bdi></div>
      <div className="flow-branches"><div className={`flow-node ${score >= 80 ? "active" : ""}`}>{en ? "True → " : "صحيح ← "}<bdi dir="ltr">High</bdi></div><div className={`flow-node ${score < 80 ? "active" : ""}`}>{en ? "False → test " : "خطأ ← افحص "}<bdi dir="ltr"><code>score &gt;= 50</code></bdi></div></div>
      <div className="flow-branches"><div className={`flow-node ${score >= 50 && score < 80 ? "active" : ""}`}>{en ? "True → " : "صحيح ← "}<bdi dir="ltr">Medium</bdi></div><div className={`flow-node ${score < 50 ? "active" : ""}`}>{en ? "False → " : "خطأ ← "}<bdi dir="ltr">Low</bdi></div></div>
      <span aria-hidden="true">↓</span><div className="flow-node"><bdi dir="ltr"><code>ENDIF</code></bdi></div>
    </div> : <ol className="loop-timeline" aria-label={en ? "Five possible passes" : "الدورات الخمس الممكنة"}>{[1, 2, 3, 4, 5].map(n => <li key={n} className={output.includes(String(n)) ? "active" : ""}><strong>{n}</strong><span>{output.includes(String(n)) ? (en ? "WRITE runs" : "تُنفّذ WRITE") : n === 3 ? mode : (en ? "Not reached" : "لم تُنفّذ")}</span></li>)}</ol>}
    <div className="flow-result" role="status"><strong>{en ? "Actual model output" : "مخرجات النموذج الفعلية"}</strong><pre dir="ltr">{output.join("\n")}</pre><p>{conditions ? (en ? `${score} selects ${result}. Only this branch writes a result.` : `تختار ${score} الفرع ${result}. يعرض هذا الفرع وحده النتيجة.`) : mode === "CONTINUE" ? (en ? "At 3, CONTINUE skips WRITE for this pass; 4 and 5 still run. Done is outside the loop." : "عند 3 تتجاوز CONTINUE تعليمة WRITE لهذه الدورة؛ وتستمر 4 و5. تقع Done خارج الحلقة.") : (en ? "At 3, EXIT leaves DO. Passes 4 and 5 never run, but Done still runs after ENDDO." : "عند 3 تغادر EXIT حلقة DO. لا تُنفّذ دورتا 4 و5، لكن تظل Done منفذة بعد ENDDO.")}</p></div>
    <details><summary>{en ? "Code behind this flow" : "الأكواد التي تنتج هذا المسار"}</summary><pre dir="ltr"><code>{source}</code></pre></details>
  </section>;
}
