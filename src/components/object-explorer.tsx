"use client";

import { useTopicSession } from "@/lib/use-topic-session";
import type { Locale } from "@/lib/engine";

const labels = {
  en: {
    title: "One class, independent objects", boundary: "Deterministic conceptual model, not an ABAP interpreter. Each new object starts with name = Item and quantity = 0. add_one( ) changes only the selected object's quantity. Names and quantities are instance attributes; the class definition is shared.",
    create: "Create instance", reset: "Reset objects", select: "Select object", name: "Edit selected object's name", quantity: "Quantity", method: "Invoke add_one( )", empty: "Create an instance to inspect its state.", identity: "Object identity", state: "Independent instance state", limit: "Maximum 6 objects in this model.", note: "Creating two instances allocates two independent states. Assigning a reference to another reference would instead point both references to the same object; this model's Create button always creates a new object.",
  },
  ar: {
    title: "فئة واحدة وكائنات مستقلة", boundary: "نموذج مفاهيمي حتمي، وليس مفسّر ABAP. يبدأ كل كائن جديد بالقيم name = Item وquantity = 0. تغيّر add_one( ) كمية الكائن المحدد فقط. الاسم والكمية خاصيتان لكل نسخة؛ أما تعريف الفئة فمشترك.",
    create: "أنشئ نسخة", reset: "أعد ضبط الكائنات", select: "اختر كائنًا", name: "عدّل اسم الكائن المحدد", quantity: "الكمية", method: "استدعِ add_one( )", empty: "أنشئ نسخة لفحص حالتها.", identity: "هوية الكائن", state: "حالة كل نسخة المستقلة", limit: "الحد الأقصى في هذا النموذج 6 كائنات.", note: "ينشئ إنشاء نسختين حالتين مستقلتين. أما إسناد مرجع إلى مرجع آخر فيجعل المرجعين يشيران إلى الكائن نفسه؛ زر الإنشاء هنا ينشئ كائنًا جديدًا دائمًا.",
  },
};
type Instance = { id: number; name: string; quantity: number };

export function ObjectExplorer({ lang }: { lang: Locale }) {
  const t = labels[lang];
  const [objects, setObjects] = useTopicSession<Instance[]>("oop-introduction:objects", []);
  const [selected, setSelected] = useTopicSession<number | null>("oop-introduction:selected-object", null);
  const current = objects.find(object => object.id === selected);
  function create() {
    const id = objects.length + 1;
    setObjects(previous => [...previous, { id, name: "Item", quantity: 0 }]);
    setSelected(id);
  }
  function change(update: Partial<Pick<Instance, "name" | "quantity">>) {
    setObjects(previous => previous.map(object => object.id === selected ? { ...object, ...update } : object));
  }
  return <section className="learn-card category-explorer" dir={lang === "ar" ? "rtl" : "ltr"} aria-label={t.title}>
    <h2>{t.title}</h2><p>{t.boundary}</p>
    <div className="explore-actions">
      <button type="button" className="primary" onClick={create} disabled={objects.length >= 6}>{t.create}</button>
      <button type="button" className="secondary" onClick={() => { setObjects([]); setSelected(null); }}>{t.reset}</button>
    </div>
    {objects.length === 6 && <p>{t.limit}</p>}
    {objects.length > 0 && <div className="explore-actions" role="group" aria-label={t.select}>
      {objects.map(object => <button type="button" className="secondary" key={object.id} aria-pressed={selected === object.id} onClick={() => setSelected(object.id)}><bdi>object_{object.id}</bdi></button>)}
    </div>}
    {current ? <div>
      <label>{t.name}<input dir="auto" value={current.name} maxLength={40} onChange={event => change({ name: event.target.value })} /></label>
      <p>{t.quantity}: <bdi>{current.quantity}</bdi></p>
      <button type="button" className="secondary" onClick={() => change({ quantity: current.quantity + 1 })}>{t.method}</button>
    </div> : <p>{t.empty}</p>}
    <div role="status" aria-live="polite"><h3>{t.state}</h3>
      {objects.map(object => <p key={object.id}><span>{t.identity}: </span><bdi>object_{object.id}</bdi>{" · "}<bdi>name = {object.name || '""'}; quantity = {object.quantity}</bdi></p>)}
    </div>
    <p>{t.note}</p>
  </section>;
}
