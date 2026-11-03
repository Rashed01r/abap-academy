"use client";
import { useState } from "react";
import type { Locale } from "@/lib/engine";
import { gradeKeyDesign, keyCandidates, keyFields, keySamples, keySnapshot, type KeyField, type KeyRow } from "@/lib/table-keys";
import { TechnicalText } from "./technical-text";

const content = {
  en: {
    title: "Explore keys and uniqueness", limit: "Educational key-policy model, not SAP execution. Rows are shown in arrival order to explain acceptance; this is not a sorted or hashed table implementation.",
    fields: "Choose the key fields", unique: "Require a unique combination", add: "Try next incoming row", reset: "Restart incoming rows", before: "Before the last attempt", after: "After the last attempt", incoming: "Last incoming row", stored: "Stored rows", position: "Position", key: "Key values", empty: "No rows yet", accepted: "Accepted: this key combination is new, or duplicates are allowed.",
    rejected: "Rejected: these key fields match an existing row. Changing a non-key name does not change that key.", conflict: "Conflicting stored position", emptyKey: "No key fields: this represents an EMPTY KEY standard sequence. Uniqueness is unavailable. EMPTY KEY does not mean an empty table.",
    reference: "SAP reference declaration — requires the ty_employee row type and a real SAP system. The editor below runs only the standard EMPTY KEY example.",
    declaration: "Create the table with this key policy", deeper: "Go deeper: key, position and default key", detail: "A position changes when rows are inserted, deleted or reordered. A key compares values. The explicit sorted primary key here uses fields in the listed order; UNIQUE applies to the complete tuple. STANDARD primary keys are non-unique, SORTED may be unique or non-unique, HASHED must be unique. Omitting a key can choose a default key, which is not the same as deliberately writing EMPTY KEY. Secondary keys and real INSERT return codes are later topics. This model evaluates acceptance only; it makes no performance or memory-layout claim.",
    assessment: "Design an employee identity", rule: "Business rule: IDs are unique within a department. Names can change. Select exactly the fields that identify an employee and enable uniqueness. Then predict each independent incoming row against the original three rows: IT/101/Ahmed, HR/101/Sara, IT/102/Omar. Predictions always use that fixed baseline, regardless of your exploration above.",
    accept: "Accept", reject: "Reject", check: "Check identity design", wrongDesign: "Review the identity: ID alone would reject HR 101, while including name would allow a renamed IT 101. Use department and id together, with uniqueness required.", missing: "Predict all three rows before checking.", wrong: "Review the predictions: Sales 101 is a new combination; IT 101 already exists despite Huda's different name; IT 103 is new even though Ahmed is already a name.", passed: "Identity design and all three predictions passed. Complete the code challenge and knowledge check to earn XP.",
  },
  ar: {
    title: "استكشف المفاتيح والتفرّد", limit: "نموذج تعليمي لسياسة المفتاح، وليس تنفيذًا في SAP. تُعرض الصفوف بترتيب وصولها لتوضيح قبولها؛ ولا يمثل ذلك تنفيذ جدول مرتب أو قائم على التجزئة.",
    fields: "اختر حقول المفتاح", unique: "اشترط تفرّد مجموعة القيم", add: "جرّب الصف الوارد التالي", reset: "أعد تسلسل الصفوف الواردة", before: "قبل المحاولة الأخيرة", after: "بعد المحاولة الأخيرة", incoming: "آخر صف وارد", stored: "الصفوف المحفوظة", position: "الموضع", key: "قيم المفتاح", empty: "لا توجد صفوف بعد", accepted: "مقبول: مجموعة قيم المفتاح جديدة، أو أن التكرار مسموح.",
    rejected: "مرفوض: تطابق حقول المفتاح صفًا محفوظًا. لا يغيّر تعديل الاسم خارج المفتاح قيمة المفتاح.", conflict: "موضع الصف المحفوظ المتعارض", emptyKey: "لم تُختر حقول للمفتاح: يمثل هذا تسلسلًا قياسيًا بـEMPTY KEY. لا يتاح اشتراط التفرّد. ولا يعني EMPTY KEY أن الجدول خالٍ من الصفوف.",
    reference: "تعريف مرجعي لنظام SAP؛ يتطلب نوع الصف ty_employee ونظام SAP حقيقيًا. يشغّل المحرر أدناه مثال الجدول القياسي بـEMPTY KEY فقط.",
    declaration: "إنشاء الجدول بسياسة المفتاح المختارة", deeper: "تعمّق: المفتاح والموضع والمفتاح الافتراضي", detail: "يتغير الموضع عند إدراج الصفوف أو حذفها أو إعادة ترتيبها. أما المفتاح فيقارن القيم. يستخدم المفتاح الأساسي المرتب الصريح هنا الحقول بترتيب كتابتها، وينطبق UNIQUE على مجموعة قيمها كاملة. مفتاح STANDARD الأساسي غير فريد، وقد يكون مفتاح SORTED فريدًا أو غير فريد، ويجب أن يكون مفتاح HASHED فريدًا. قد يؤدي عدم تحديد مفتاح إلى اختيار مفتاح افتراضي، وهو مختلف عن كتابة EMPTY KEY عمدًا. سنتناول المفاتيح الثانوية ورموز نتيجة INSERT الحقيقية لاحقًا. يقيّم هذا النموذج قبول الصفوف فقط، ولا يصف الأداء أو تنظيم الذاكرة.",
    assessment: "صمّم هوية الموظف", rule: "قاعدة العمل: رقم الموظف فريد داخل القسم، ويمكن أن يتغير الاسم. اختر الحقول التي تحدد هوية الموظف بالضبط واشترط التفرّد. ثم توقّع نتيجة كل صف وارد على حدة مقارنة بالصفوف الأصلية الثلاثة: IT/101/Ahmed وHR/101/Sara وIT/102/Omar. تستخدم التوقعات هذه العينة الثابتة دائمًا، بغض النظر عن استكشافك أعلاه.",
    accept: "قبول", reject: "رفض", check: "تحقق من تصميم الهوية", wrongDesign: "راجع الهوية: سيرفض الرقم وحده HR 101، بينما سيسمح إدراج الاسم بإضافة IT 101 بعد تغيير اسمه. استخدم department وid معًا واشترط التفرّد.", missing: "توقّع نتيجة الصفوف الثلاثة قبل التحقق.", wrong: "راجع التوقعات: Sales 101 مجموعة جديدة؛ وIT 101 موجودة رغم اختلاف اسم Huda؛ وIT 103 مجموعة جديدة رغم وجود الاسم Ahmed من قبل.", passed: "اجتزت تصميم الهوية والتوقعات الثلاثة. أكمل تحدي الشيفرة واختبار الفهم لاكتساب نقاط الخبرة.",
  },
};
export function TableKeyExplorer({ lang, assessment = false, completed = false, onPass }: { lang: Locale; assessment?: boolean; completed?: boolean; onPass?: () => void }) {
  const t = content[lang];
  const [fields, setFields] = useState<KeyField[]>(["id"]);
  const [unique, setUnique] = useState(true);
  const [count, setCount] = useState(0);
  const [predictions, setPredictions] = useState<(boolean | undefined)[]>([]);
  const [feedback, setFeedback] = useState<"wrongDesign" | "missing" | "wrong" | "passed">();
  const snapshot = keySnapshot(fields, unique, count);
  const last = snapshot.steps.at(-1);
  const declaration = fields.length ? `DATA lt_keyed TYPE SORTED TABLE OF ty_employee\n  WITH ${unique ? "UNIQUE" : "NON-UNIQUE"} KEY ${fields.join(" ")}.` : "DATA lt_keyed TYPE STANDARD TABLE OF ty_employee\n  WITH EMPTY KEY.";
  function changePolicy(next: KeyField[], nextUnique: boolean) {
    setFields(next); setUnique(nextUnique && next.length > 0); setCount(0); setFeedback(undefined);
  }
  function rowTable(rows: readonly KeyRow[], caption: string) {
    return <div className="table-scroll"><table className="key-table"><caption>{caption}</caption><thead><tr><th scope="col">{t.position}</th>{keyFields.map(field => <th scope="col" key={field} data-key-field={fields.includes(field)}><code>{field}</code></th>)}<th scope="col">{t.key}</th></tr></thead><tbody>{rows.map((row, i) => <tr key={i}><th scope="row">{i + 1}</th>{keyFields.map(field => <td key={field} data-key-field={fields.includes(field)}><bdi dir="ltr">{row[field]}</bdi></td>)}<td><code dir="ltr">{fields.map(f => row[f]).join(" / ") || "∅"}</code></td></tr>)}{!rows.length && <tr><td colSpan={5}>{t.empty}</td></tr>}</tbody></table></div>;
  }
  return <section className="learn-card key-explorer" aria-label={t.title}>
    <h2>{t.title}</h2><p>{t.limit}</p>
    <fieldset><legend>{t.fields}</legend><div className="explore-actions">{keyFields.map(field => <label key={field}><input type="checkbox" checked={fields.includes(field)} onChange={event => changePolicy(keyFields.filter(f => f === field ? event.target.checked : fields.includes(f)), unique)}/><code>{field}</code></label>)}</div></fieldset>
    <label className="key-unique"><input type="checkbox" checked={unique} disabled={!fields.length} onChange={event => changePolicy(fields, event.target.checked)}/>{t.unique}</label>
    {!fields.length && <p>{t.emptyKey}</p>}
    <div className="key-reference"><strong>{t.declaration}</strong><pre dir="ltr" data-testid="key-declaration">{declaration}</pre><p><TechnicalText>{t.reference}</TechnicalText></p></div>
    <div className="explore-actions"><button className="primary" disabled={count === keySamples.length} onClick={() => setCount(n => n + 1)}>{t.add}</button><button className="secondary" onClick={() => setCount(0)}>{t.reset}</button></div>
    {last && <div role="status" className="key-attempt"><p>{t.incoming}: <bdi dir="ltr">{last.row.department} / {last.row.id} / {last.row.name}</bdi></p><p>{last.accepted ? t.accepted : t.rejected}</p>{!last.accepted && <p>{t.conflict}: {last.conflict + 1}</p>}</div>}
    <div className="key-comparison">{last && rowTable(last.before, t.before)}{rowTable(snapshot.rows, last ? t.after : t.stored)}</div>
    <details><summary>{t.deeper}</summary><p><TechnicalText>{t.detail}</TechnicalText></p></details>
    {assessment && <div className="key-assessment"><h3>{t.assessment}</h3><p>{t.rule}</p>{keyCandidates.map((row, i) => <fieldset className="key-prediction" key={i}><legend><bdi dir="ltr">{row.department} / {row.id} / {row.name}</bdi></legend><div className="explore-actions">{[true, false].map(answer => <button key={String(answer)} className="secondary" aria-pressed={predictions[i] === answer} onClick={() => { setPredictions(previous => { const next = [...previous]; next[i] = answer; return next; }); setFeedback(undefined); }}>{answer ? t.accept : t.reject}</button>)}</div></fieldset>)}<button className="primary" onClick={() => {
      const result = gradeKeyDesign(fields, unique, predictions);
      setFeedback(!result.design ? "wrongDesign" : result.expected.some((_, i) => predictions[i] === undefined) ? "missing" : result.correct ? "passed" : "wrong");
      if (result.correct) onPass?.();
    }}>{t.check}</button>{feedback && <p role="status">{t[feedback]}</p>}{completed && feedback !== "passed" && <p>{t.passed}</p>}</div>}
  </section>;
}
