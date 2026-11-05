"use client";
import { useTopicSession } from "@/lib/use-topic-session";
import type { Locale } from "@/lib/engine";
import { EducationalFlowchart } from "./educational-flowchart";
import type { ClassroomSelection } from "./trace-classroom";
export function ExpressionClassroom({lang,onSelect}: {lang:Locale;onSelect:(s:ClassroomSelection)=>void}) {
  const [key,setKey]=useTopicSession("modern:visual-key",10);
  const en=lang === "en", found=key !== 99, name=key === 10 ? "Pen" : "Book";
  return <section data-primary-diagram="expressions" className="expression-classroom" aria-label={en ? "Construct, read, or handle absence" : "أنشئ واقرأ أو عالج الغياب"}>
    <div className="value-construction"><div className="old-value"><strong>{en ? "Old table value" : "قيمة الجدول السابقة"}</strong><s><bdi>99 · Old item</bdi></s></div><span className="state-arrow" aria-hidden="true">→</span><button className="constructed-value" onClick={()=>onSelect({group:"modern-values"})}><strong><bdi dir="ltr"><code>VALUE #( … )</code></bdi></strong><span><bdi>10 · Pen</bdi></span><span><bdi>20 · Book</bdi></span></button></div>
    <p>{en ? "Assignment replaces the old value. Now choose a key to see whether the read succeeds or reaches CATCH." : "يستبدل الإسناد القيمة القديمة. اختر مفتاحاً الآن لترى هل تنجح القراءة أم تصل إلى CATCH."}</p>
    <label>{en ? "Requested item ID" : "معرّف الصنف المطلوب"}<select value={key} onChange={e=>{setKey(Number(e.target.value));onSelect({group:Number(e.target.value) === 99 ? "modern-missing" : "modern-read"});}}>{[10,20,99].map(n=><option key={n}>{n}</option>)}</select></label>
    <EducationalFlowchart lang={lang} label={en ? "A found row continues to the template; an absent row enters the exception handler." : "يتابع الصف الموجود إلى قالب النص؛ وينتقل الغائب إلى معالج الاستثناء."} active={found ? "found" : "missing"} nodes={[{id:"read",label:`lt_items[ id = ${key} ]`,x:300,y:35},{id:"test",label:en ? "Row exists?" : "هل يوجد الصف؟",x:300,y:120,decision:true},{id:"found",label:found ? `Item: ${name}` : "Item: …",x:120,y:225},{id:"missing",label:"CATCH",x:480,y:225}]} edges={[{from:"read",to:"test"},{from:"test",to:"found",label:en ? "Yes" : "نعم"},{from:"test",to:"missing",label:en ? "No" : "لا"}]} onSelect={id=>onSelect({group:id === "missing" ? "modern-missing" : "modern-read"})}/>
    <p role="status" className="visual-outcome"><bdi dir="ltr">{found ? `Item: ${name}` : "No matching item"}</bdi> · {found ? en ? "The matching record supplies the name." : "يوفر السجل المطابق الاسم." : en ? "CX_SY_ITAB_LINE_NOT_FOUND reaches the supplied handler." : "يصل CX_SY_ITAB_LINE_NOT_FOUND إلى المعالج المرفق."}</p><p className="visual-boundary">{en ? "Controlled model of the shown SAP reference; no modern expression is executed by the restricted interpreter." : "نموذج مضبوط لمرجع SAP المعروض؛ ولا ينفّذ المفسر المقيّد تعبيراً حديثاً."}</p>
  </section>;
}
