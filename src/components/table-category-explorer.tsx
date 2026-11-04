"use client";
import { useTopicSession } from "@/lib/use-topic-session";
import type { Locale } from "@/lib/engine";
import { categorySnapshot } from "@/lib/table-categories";
import { TechnicalText } from "./technical-text";

const content = {
  en: {
    title: "Compare table categories", limit: "Conceptual model, not SAP execution. The code editor below runs standard tables only.",
    add: "Add next sample row", reset: "Restart comparison", input: "Incoming IDs: 30, 10, 30", rows: "Stored IDs", duplicate: "The third row has duplicate key 30. A unique primary key cannot accept both rows.",
    standard: "STANDARD: this APPEND sequence preserves incoming order and permits duplicates.",
    sorted: "SORTED with NON-UNIQUE KEY: rows stay ascending by key and duplicate keys are allowed. A UNIQUE key would reject duplicate keys.",
    hashed: "HASHED with UNIQUE KEY: keys identify rows; no primary index or promised key order. These chips show membership, not SAP memory layout or iteration order.",
    check: "Choose a category for each requirement", questions: ["Keep imported records in received order, including duplicates.", "Process records by ascending primary key, allowing repeated keys.", "Look up one record repeatedly by its full unique primary key, without needing an index."],
    answers: ["STANDARD", "SORTED", "HASHED"], correct: "Correct: the category matches the required order, uniqueness and access pattern.", wrong: "Compare the requirement with the category descriptions above. Consider order, duplicates and full-key lookup.", done: "All category decisions passed. Complete the code challenge and knowledge check to earn XP.",
  },
  ar: {
    title: "قارن فئات الجداول", limit: "نموذج مفاهيمي، وليس تنفيذًا في SAP. يشغّل محرر الشيفرة أدناه الجداول القياسية فقط.",
    add: "أضف الصف التالي من العينة", reset: "أعد المقارنة", input: "المعرّفات الواردة: 30، 10، 30", rows: "المعرّفات المحفوظة", duplicate: "يتكرر المفتاح 30 في الصف الثالث. لا يسمح المفتاح الأساسي الفريد بقبول الصفين معًا.",
    standard: "STANDARD: تحافظ سلسلة APPEND هذه على ترتيب البيانات الواردة وتسمح بالتكرار.",
    sorted: "SORTED مع NON-UNIQUE KEY: تبقى الصفوف مرتبة تصاعديًا حسب المفتاح مع السماح بتكراره. أما UNIQUE فيمنع تكرار المفتاح.",
    hashed: "HASHED مع UNIQUE KEY: يحدد المفتاح الصف، ولا يوجد فهرس أساسي أو ترتيب مضمون حسب المفتاح. تعرض البطاقات المعرّفات الموجودة فقط، ولا تمثل الذاكرة أو ترتيب المرور في SAP.",
    check: "اختر فئة الجدول لكل متطلب", questions: ["احتفظ بالسجلات المستوردة بترتيب وصولها، بما فيها السجلات المكررة.", "عالج السجلات بترتيب المفتاح الأساسي تصاعديًا مع السماح بتكراره.", "ابحث مرارًا عن سجل واحد باستخدام مفتاحه الأساسي الفريد كاملًا، دون الحاجة إلى فهرس."],
    answers: ["STANDARD", "SORTED", "HASHED"], correct: "صحيح؛ تلائم الفئة متطلبات الترتيب والتفرّد وطريقة الوصول.", wrong: "قارن المتطلب بأوصاف الفئات أعلاه. راعِ الترتيب وتكرار المفاتيح والبحث بالمفتاح الكامل.", done: "اجتزت جميع قرارات اختيار الفئة. أكمل تحدي الشيفرة واختبار الفهم لاكتساب نقاط الخبرة.",
  },
};
export function TableCategoryExplorer({ lang, assessment = false, completed = false, onPass, sessionKey }: { lang: Locale; assessment?: boolean; completed?: boolean; onPass?: () => void; sessionKey?: string }) {
  const t = content[lang];
  const [category, setCategory] = useTopicSession<"standard" | "sorted" | "hashed">(sessionKey && `${sessionKey}:category`, "standard");
  const [count, setCount] = useTopicSession(sessionKey && `${sessionKey}:count`, 0);
  const [choices, setChoices] = useTopicSession<Record<number, number>>(sessionKey && `${sessionKey}:choices`, {});
  const snapshot = categorySnapshot(category, count);
  return <section className="learn-card category-explorer" aria-label={t.title}>
    <h2>{t.title}</h2><p>{t.limit}</p><p>{t.input}</p>
    <div className="explore-actions" role="group" aria-label={t.title}>{(["standard", "sorted", "hashed"] as const).map(c => <button className="secondary" key={c} aria-pressed={c === category} onClick={() => setCategory(c)}>{c.toUpperCase()}</button>)}</div>
    <p><TechnicalText>{t[category]}</TechnicalText></p>
    <div className="explore-actions"><button className="primary" disabled={count === 3} onClick={() => setCount(n => n+1)}>{t.add}</button><button className="secondary" onClick={() => setCount(0)}>{t.reset}</button></div>
    <div role="status"><strong>{t.rows}: </strong><span dir="ltr" data-testid="category-rows">{snapshot.rows.join(", ") || "∅"}</span>{snapshot.duplicate && <p>{t.duplicate}</p>}</div>
    {assessment && <div><h3>{t.check}</h3>{t.questions.map((q,index) => <div className="category-question" key={q}><p>{q}</p><div className="explore-actions">{t.answers.map((answer,i) => <button key={answer} className="secondary" aria-pressed={choices[index] === i} onClick={() => {
      const next = {...choices, [index]:i}; setChoices(next);
      if ([0,1,2].every(k => next[k] === k)) onPass?.();
    }}>{answer}</button>)}</div>{choices[index] !== undefined && <p role="status">{choices[index] === index ? t.correct : t.wrong}</p>}</div>)}{completed && <p>{t.done}</p>}</div>}
  </section>;
}
